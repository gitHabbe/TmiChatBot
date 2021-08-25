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
} from "../interfaces/speedrun";
import { fuseSearch, fuseSearchCategory } from "../utility/fusejs";
import {
  datesDaysDifference,
  floatToHHMMSS,
  secondsToHHMMSS,
} from "../utility/dateFormat";
import { getStreamerTitle, getStreamerGame } from "./twitch";
import { GamePrisma } from "../models/database/game";
import { RunnerPrisma } from "../models/database/runner";
import { Game, Category, CategoryLink } from ".prisma/client";
import { JoinedGame } from "../interfaces/prisma";
import { IAxiosOptions, Speedrun } from "../models/axiosFetch";
import { AxiosResponse } from "axios";
import { Runner } from "@prisma/client";
import { speedrunAPI } from "../config/speedrunConfig";
import {
  JsonArrayFile,
  JsonLevels,
  JsonUserArrayFile,
  level,
} from "../models/JsonArrayFile";

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
  let levelData = jsonLevels.levels.getData;
  // console.log("~ levelData", levelData);
  const targetLevel = messageArray[1];
  levelData = levelData.filter((level) => {
    return level.abbreviation === targetLevel;
  });
  if (levelData.length === 0) levelData = jsonLevels.levels.getData;
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
  const fuseHit = fuseSearch<level>(levelData, targetLevel);
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

getInduvidualWorldRecord("habbe", ["dkrr", "htv"]).then((data) => {
  console.log("data:", data);
});
