import {
  IGameType,
  IGameResponse,
  ICategoryType,
  ICategoryResponse,
  ILeaderboardReponse,
  IRunnerResponse,
  IRunner,
  InduvidualLevelSupport,
  IInduvidualLevel,
  IInduvidualLevelResponse,
  IInduvidualLevelWithVehicle,
  TimeTrialSupport,
} from "../interfaces/speedrun";
import { fuseSearch, fuseSearchCategory } from "../utility/fusejs";
import {
  datesDaysDifference,
  floatToHHMMSS,
  secondsToHHMMSS,
  stringFloatToHHMMSSmm,
} from "../utility/dateFormat";
import { getStreamerTitle, getStreamerGame } from "./twitch";
import { GamePrisma } from "../models/database/game";
import { RunnerPrisma } from "../models/database/runner";
import { Game, Category, CategoryLink } from ".prisma/client";
import { JoinedGame } from "../interfaces/prisma";
import { IAxiosOptions, Speedrun } from "../models/axiosFetch";
import { AxiosResponse } from "axios";
import { Runner } from "@prisma/client";
import { JsonLevels, JsonTimeTrials } from "../models/JsonArrayFile";
import { ILevel, ITimeTrialResponse } from "../interfaces/specificGames";
import { dkr64API } from "../config/speedrunConfig";
import { UserPrisma } from "../models/database/user";
import { SettingPrisma } from "../models/database/setting";

const gameFromMessage = async (
  messageArray: string[],
  streamer: string
): Promise<string> => {
  if (messageArray.length === 0 || messageArray[0].length === 0) {
    const twitchGame: string = await getStreamerGame(streamer);
    return twitchGame;
  }
  return messageArray[0];
};

const categoryFromMessage = async (
  messageArray: string[],
  streamer: string
): Promise<string> => {
  const categoryUserInput: string[] = messageArray.slice(1);
  if (categoryUserInput.length === 0) {
    const titleCategory: string = await getStreamerTitle(streamer);
    return titleCategory;
  }
  return categoryUserInput.join(" ");
};

const gameFromDatabase = async (gameQuery: string): Promise<JoinedGame> => {
  const gameDatabase = new GamePrisma();
  return gameDatabase
    .getGameWhere({ abbreviation: gameQuery })
    .catch(() =>
      gameDatabase.getGameWhere({ names: { international: gameQuery } })
    );
};

const getGame = (gameName: string): Promise<JoinedGame> => {
  return gameFromDatabase(gameName).catch(async () => {
    const newGame: Game = await gameToDatabase(gameName);
    return gameFromDatabase(newGame.abbreviation);
  });
};

const runnerFromDatabase = async (query: string): Promise<Runner> => {
  const runnerDatabase = new RunnerPrisma();
  return runnerDatabase
    .getRunnerWhere({ id: query })
    .catch(() => runnerDatabase.getRunnerWhere({ name: query }));
};

const getRunner = async (query: string): Promise<Runner> => {
  return runnerFromDatabase(query).catch(async () => {
    const newRunner: Runner = await runnerToDatabase(query);
    return await runnerFromDatabase(newRunner.id);
  });
};

const axiosSpeedrunCom = async <T>(options: IAxiosOptions) => {
  const speedrun = new Speedrun<T>(options);
  const res: AxiosResponse<T> = await speedrun.fetchAPI();
  return res.data;
};

const gameToDatabase = async (gameName: string): Promise<Game> => {
  const gameOptions: IAxiosOptions = {
    type: "Game",
    name: gameName,
    url: `games/${gameName}`,
  };
  const { data: game }: IGameResponse = await axiosSpeedrunCom<IGameResponse>(
    gameOptions
  );
  const categoriesOptions: IAxiosOptions = {
    type: "Category",
    name: game.names.international,
    url: `/games/${game.id}/categories`,
  };
  const { data: categories }: ICategoryResponse =
    await axiosSpeedrunCom<ICategoryResponse>(categoriesOptions);
  const newGame = new GamePrisma();
  newGame.setGame = game;
  newGame.setCategories = categories;
  return newGame.save();
};

const getCategory = async (game: JoinedGame, targetCategory: string) => {
  const validCategories = game.categories.filter((category) => {
    return (
      category.links.findIndex(
        (category: CategoryLink) => category.rel === "leaderboard"
      ) > 0
    );
  });
  const fuzzyGameSearch = fuseSearchCategory(validCategories, targetCategory);

  return fuzzyGameSearch[0].item;
};

const runnerToDatabase = async (query: string): Promise<Runner> => {
  const options: IAxiosOptions = {
    type: "Runner",
    name: query,
    url: `/users/${query}`,
  };
  const axiosRunner: IRunnerResponse = await axiosSpeedrunCom<IRunnerResponse>(
    options
  );
  const runner: IRunner = axiosRunner.data;
  const runnerDatabase: RunnerPrisma = new RunnerPrisma();

  return await runnerDatabase.saveRunner(runner);
};

const fetchWorldRecord = async (
  game: JoinedGame,
  category: Category
): Promise<string> => {
  const options: IAxiosOptions = {
    type: "World record",
    name: "Run",
    url: `leaderboards/${game.id}/category/${category.id}?top=1`,
  };
  const { data: worldRecord }: ILeaderboardReponse =
    await axiosSpeedrunCom<ILeaderboardReponse>(options);
  const worldRecordTime: string = secondsToHHMMSS(
    worldRecord.runs[0].run.times.primary_t
  );
  const runnerDatabase: Runner = await getRunner(
    worldRecord.runs[0].run.players[0].id
  );

  const daysAgo = datesDaysDifference(worldRecord.runs[0].run.date);

  return `${category.name} WR: ${worldRecordTime} by ${runnerDatabase.name} - ${daysAgo} days ago`;
};

export const getWorldRecord = async (
  streamer: string,
  messageArray: string[]
): Promise<string> => {
  try {
    const gameName: string = await gameFromMessage(messageArray, streamer);
    const game: JoinedGame = await getGame(gameName);
    const categoryName: string = await categoryFromMessage(
      messageArray,
      streamer
    );
    const fuzzyCategory: Category = await getCategory(game, categoryName);
    return await fetchWorldRecord(game, fuzzyCategory);
  } catch (error) {
    return error.message;
  }
};

const fetchPersonalBest = async (
  game: JoinedGame,
  category: Category,
  runnerId: string
) => {
  const options: IAxiosOptions = {
    type: "Leaderboard",
    name: category.name,
    url: `leaderboards/${game.id}/category/${category.id}`,
  };
  const { data: leaderboard }: ILeaderboardReponse =
    await axiosSpeedrunCom<ILeaderboardReponse>(options);
  const personalRun = leaderboard.runs.find((run) => {
    return run.run.players[0].id === runnerId;
  });
  if (personalRun === undefined) throw new Error("Personal run not found");
  const personalRunTime: string = secondsToHHMMSS(
    personalRun.run.times.primary_t
  );
  const runnerDatabase: Runner = await getRunner(personalRun.run.players[0].id);
  const daysAgo: number = Math.floor(
    (new Date().getTime() - new Date(personalRun.run.date).getTime()) / 86400000
  );
  const runner: string =
    runnerDatabase.name.slice(-1).toLowerCase() === "s"
      ? runnerDatabase.name + "'"
      : runnerDatabase.name + "'s";

  return `${runner} ${category.name} PB: ${personalRunTime} - #${personalRun.place} - ${daysAgo} days ago`;
};

export const getPersonalBest = async (
  streamer: string,
  messageArray: string[]
): Promise<string> => {
  try {
    const gameName: string = await gameFromMessage(
      messageArray.slice(1),
      streamer
    );
    const game: JoinedGame = await getGame(gameName);
    const runner: Runner = await getRunner(messageArray[0]);
    const categoryName: string = await categoryFromMessage(
      messageArray,
      streamer
    );
    const fuzzyCategory: Category = await getCategory(game, categoryName);
    return await fetchPersonalBest(game, fuzzyCategory, runner.id);
  } catch (error) {
    console.log("~ error", error.message);
    return error.message;
  }
};

export const getInduvidualWorldRecord = async (
  streamer: string,
  messageArray: string[]
) => {
  const gameName: string = await gameFromMessage(messageArray, streamer);
  switch (gameName.toUpperCase()) {
    case InduvidualLevelSupport.DKR:
      return DiddyKongRacingInduvidualWorldRecord(messageArray);
    default:
      throw Error(`${gameName} doesn't support !ilwr`);
  }
};

const DiddyKongRacingInduvidualWorldRecord = async (messageArray: string[]) => {
  // const game: JoinedGame = await getGame(gameName);
  const jsonLevels = new JsonLevels();
  let levelData = jsonLevels.data();
  const targetLevel = messageArray[1];
  levelData = levelData.filter((level) => {
    return level.abbreviation === targetLevel;
  });
  if (levelData.length === 0) levelData = jsonLevels.data();
  const targetVehicle = messageArray[2];
  if (targetVehicle) {
    levelData = levelData.filter((level) => {
      return level.vehicle === targetVehicle.toLowerCase();
    });
  } else {
    levelData = levelData.filter((level) => {
      return level.default;
    });
  }
  const categoryId = "ndx0q5dq";
  if (!targetLevel) throw new Error(`No level specified`);
  const fuseHit = fuseSearch<ILevel>(levelData, targetLevel);
  console.log("~ fuseHit", fuseHit.slice(0, 3));
  const optionsLeaderboard: IAxiosOptions = {
    type: "Leaderboard",
    name: "Induvidual level",
    url: `leaderboards/9dow9e1p/level/${fuseHit[0].item.id}/${categoryId}?top=1`,
  };
  console.log("opt:", optionsLeaderboard.url);
  const { data: leaderboardRes }: ILeaderboardReponse =
    await axiosSpeedrunCom<ILeaderboardReponse>(optionsLeaderboard);
  const worldRecord = leaderboardRes.runs[0].run.times.primary_t;
  const worldRecordTime = floatToHHMMSS(worldRecord);
  const userId = leaderboardRes.runs[0].run.players[0].id;
  const user = await getRunner(userId);

  return `${fuseHit[0].item.name} ${fuseHit[0].item.vehicle} WR: ${worldRecordTime} by ${user.name}`;
};

export const getInduvidualPersonalBest = async (
  streamer: string,
  messageArray: string[]
) => {
  const gameName: string = await gameFromMessage(
    messageArray.slice(1),
    streamer
  );
  switch (gameName.toUpperCase()) {
    case InduvidualLevelSupport.DKR:
      return DiddyKongRacingInduvidualPersonalBest(messageArray);
    default:
      throw Error(`${gameName} doesn't support !ilwr`);
  }
};

const DiddyKongRacingInduvidualPersonalBest = async (
  messageArray: string[]
) => {
  const jsonLevels = new JsonLevels();
  let levelData = jsonLevels.data();
  const runnerArg = messageArray[0];
  console.log("~ runnerArg", runnerArg);
  const targetLevel = messageArray[2];
  if (!targetLevel) throw new Error(`No level specified`);
  console.log("~ targetLevel", targetLevel);
  console.log("~ levelData", levelData);
  levelData = levelData.filter((level) => {
    return level.abbreviation === targetLevel;
  });
  if (levelData.length === 0) levelData = jsonLevels.data();
  const targetVehicle = messageArray[3];
  console.log("~ targetVehicle", targetVehicle);
  if (targetVehicle) {
    levelData = levelData.filter((level) => {
      return level.vehicle === targetVehicle.toLowerCase();
    });
  } else {
    levelData = levelData.filter((level) => {
      return level.default;
    });
  }
  const categoryId = "ndx0q5dq";
  const fuseHit = fuseSearch<ILevel>(levelData, targetLevel);
  console.log("~ fuseHit", fuseHit.slice(0, 3));
  const optionsLeaderboard: IAxiosOptions = {
    type: "Leaderboard",
    name: "Induvidual level",
    url: `leaderboards/9dow9e1p/level/${fuseHit[0].item.id}/${categoryId}`,
  };
  console.log("opt:", optionsLeaderboard.url);
  const runner = await getRunner(runnerArg);
  console.log("~ runner", runner);
  const { data: leaderboardRes }: ILeaderboardReponse =
    await axiosSpeedrunCom<ILeaderboardReponse>(optionsLeaderboard);
  const personalBest = leaderboardRes.runs.find((run) => {
    return run.run.players[0].id === runner.id;
  });
  if (!personalBest) throw new Error(`Run not found`);
  const personalBestTime = floatToHHMMSS(personalBest.run.times.primary_t);
  console.log("~ personalBestTime", personalBestTime);

  return `${runner.name} ${fuseHit[0].item.name} ${fuseHit[0].item.vehicle} PB: ${personalBestTime} by ${runner.name}`;
};

export const getTimeTrialWorldRecord = async (
  streamer: string,
  messageArray: string[]
) => {
  const gameName: string = await gameFromMessage(messageArray, streamer);
  console.log("gameName:", gameName);
  switch (gameName.toUpperCase()) {
    case TimeTrialSupport.DKR:
      return DiddyKongRacingTimeTrialWorldRecord(messageArray);

    default:
      return "No WR found";
      break;
  }
};

// ttwr dkr lake

const filterDiddyKongRacingTimeTrial = async (messageArray: string[]) => {
  const targetVehicle = messageArray[2];
  const jsonTimeTrials = new JsonTimeTrials();
  let vehicle = "",
    laps = "3",
    shortcut = false;
  let tracks = jsonTimeTrials.data();
  let filteredMessage = messageArray
    .filter((word) => {
      if (parseInt(word) === 1) laps = "1";
      return parseInt(word) !== 1;
    })
    .filter((word) => {
      const shortcutKeywords = ["shortcut", "short", "sc"];
      if (shortcutKeywords.includes(word)) shortcut = true;
      return !shortcutKeywords.includes(word);
    })
    .filter((word) => {
      const vehicles = ["CAR", "HOVER", "PLANE"];
      if (vehicles.includes(word.toUpperCase())) vehicle = word;
      return !vehicles.includes(word.toUpperCase());
    })
    .filter((word) => {
      return word !== "3";
    });
  const trackQuery = filteredMessage.slice(1).join(" ");
  console.log("~ filteredMessage", filteredMessage);
  // const targetLevel = filteredMessage[1];
  tracks = tracks.filter((track) => {
    return track.abbreviation === trackQuery;
  });
  if (tracks.length === 0) tracks = jsonTimeTrials.data();
  if (vehicle) {
    tracks = tracks.filter((track) => {
      return track.vehicle === vehicle;
    });
  } else {
    tracks = tracks.filter((track) => {
      return track.default === true;
    });
  }
  console.log("~ trackQuery", trackQuery);
  console.log("~ laps", laps);
  console.log("~ shortcut", shortcut);
  console.log("~ vehicle", vehicle);
  console.log("~ tracks", tracks.length, tracks.slice(0, 3));
  const trackType = shortcut ? "shortcut" : "standard";
  const fuseHit = fuseSearch<ILevel>(tracks, trackQuery);

  return { fuseHit: fuseHit[0], laps, trackType };
};

const DiddyKongRacingTimeTrialWorldRecord = async (messageArray: string[]) => {
  const { fuseHit, laps, trackType } = await filterDiddyKongRacingTimeTrial(
    messageArray
  );
  console.log("~ fuseHit, laps, trackType", fuseHit, laps, trackType);
  const { vehicle, name } = fuseHit.item;
  console.log("~ vehicle, name", vehicle, name);
  console.log(
    `&track=${name}&vehicle=${vehicle}&laps=${laps}&type=${trackType}`
  );

  const worldRecoard = await dkr64API.get<ITimeTrialResponse>(
    `/world_record?api_token=${process.env.DKR64_API_TOKEN}&track=${name}&vehicle=${vehicle}&laps=${laps}&type=${trackType}`
  );
  console.log("~ worldRecoard", worldRecoard.data);
  const runner = worldRecoard.data.times[0].username;
  let time = worldRecoard.data.times[0].time_value;
  console.log("parseFloat(time):", parseFloat(time).toFixed(2));
  time = stringFloatToHHMMSSmm(time);
  const track = name
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
  const formalVehicle = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
  const shortcut = trackType === "shortcut" ? "[Shortcut]" : "";

  return `${track} [${formalVehicle}][${laps}-lap]${shortcut} WR: ${time} by ${runner}`;
};

export const getTimeTrialPersonalBest = async (
  streamer: string,
  messageArray: string[]
): Promise<string> => {
  const gameName: string = await gameFromMessage(
    messageArray.slice(1),
    streamer
  );
  console.log("gameName:", gameName);
  switch (gameName.toUpperCase()) {
    case TimeTrialSupport.DKR:
      return DiddyKongRacingTimeTrialPersonalBest(messageArray);
    default:
      return "Didnt' work";
  }
};

const DiddyKongRacingTimeTrialPersonalBest = async (messageArray: string[]) => {
  const { fuseHit, laps, trackType } = await filterDiddyKongRacingTimeTrial(
    messageArray.slice(1)
  );
  const { vehicle, name } = fuseHit.item;
  const runner = messageArray[0];
  console.log("~ runner", runner);
  const personalBest = await dkr64API.get<ITimeTrialResponse>(
    `/times?api_token=${process.env.DKR64_API_TOKEN}&track=${name}&vehicle=${vehicle}&laps=${laps}&type=${trackType}&user=${runner}`
  );
  const run = personalBest.data.times.find((run) => {
    console.log("run.username.toUpperCase():", run.username.toUpperCase());
    return run.username.toUpperCase() === runner.toUpperCase();
  });
  if (!run) throw new Error(`Cant find run`);
  let time = run.time_value;
  console.log("parseFloat(time):", parseFloat(time).toFixed(2));
  time = stringFloatToHHMMSSmm(time);
  const track = name
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
  const formalVehicle = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
  const shortcut = trackType === "shortcut" ? "[Shortcut]" : "";

  return `${runner} ${track} [${formalVehicle}][${laps}-lap]${shortcut} PB: ${time}`;
};

export const setSpeedrunComUsername = async (
  streamer: string,
  messageArray: string[]
) => {
  const newUsername: string | undefined = messageArray[0];
  const userPrisma = new UserPrisma(streamer);
  const user = await userPrisma.find();
  const setting = new SettingPrisma(user);
  const newSetting = await setting.apply("SpeedrunName", newUsername);
  return `SpeedrunDotCom username set to: ${newSetting.value}`;
};

// getTimeTrialWorldRecord("habbe", ["dkr", "1", "dc", "hover"]).then((data) => {
//   console.log("data:", data);
//   return;
// });
