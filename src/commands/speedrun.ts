import {
  IGameType,
  IGameResponse,
  ICategoryType,
  ICategoryResponse,
  ILeaderboardReponse,
  IRunnerResponse,
  IRunner,
} from "../interfaces/speedrun";
import { fuseSearchCategory } from "../utility/fusejs";
import { secondsToHHMMSS } from "../utility/dateFormat";
import { getStreamerTitle, getStreamerGame } from "./twitch";
import { GameDatabase } from "../models/database/game";
import { Runner } from "../models/database/runner";
import { Game, Category, CategoryLink } from ".prisma/client";
import { JoinedGame } from "../interfaces/prisma";
import { IAxiosOptions, Speedrun } from "../models/axiosFetch";
import { AxiosResponse } from "axios";

const calculateGameName = async (
  messageArray: string[],
  streamer: string
): Promise<string> => {
  if (messageArray.length === 0 || messageArray[0].length === 0) {
    const twitchGame: string = await getStreamerGame(streamer);
    return twitchGame;
  }
  return messageArray[0];
};

const calculateCategoryName = async (
  messageArray: string[],
  streamer: string
): Promise<string> => {
  const categoryUserInput: string[] = messageArray.slice(1);
  if (categoryUserInput.length === 0) {
    const titleCategory = await getStreamerTitle(streamer);
    return titleCategory;
  }
  return categoryUserInput.join(" ");
};

const gameFromDatabase = async (gameQuery: string) => {
  const gameDatabase = new GameDatabase();
  return gameDatabase
    .getGameWhere({ abbreviation: gameQuery })
    .catch(() =>
      gameDatabase.getGameWhere({ names: { international: gameQuery } })
    );
};

const fetchGame = async (gameName: string): Promise<JoinedGame> => {
  try {
    return await gameFromDatabase(gameName);
  } catch (error) {
    const newGame = await gameToDatabase(gameName);
    return await gameFromDatabase(newGame.abbreviation);
  }
};

const runnerFromDatabase = async (query: string) => {
  const runnerDatabase = new Runner();
  return runnerDatabase
    .getRunnerWhere({ id: query })
    .catch(() => runnerDatabase.getRunnerWhere({ name: query }));
};

const fetchRunner = async (query: string) => {
  try {
    return await runnerFromDatabase(query);
  } catch (error) {
    const newRunner = await runnerToDatabase(query);
    return await runnerFromDatabase(newRunner.id);
  }
};

const axiosSpeedrunCom = async <T>(options: IAxiosOptions) => {
  const speedrun = new Speedrun<T>(options);
  const res: AxiosResponse<T> = await speedrun.fetchAPI();
  return res.data;
};

const gameToDatabase = async (gameName: string) => {
  const gameOptions: IAxiosOptions = {
    type: "Game",
    name: gameName,
    url: `games/${gameName}`,
  };
  const axiosGame: IGameResponse = await axiosSpeedrunCom<IGameResponse>(
    gameOptions
  );
  const game: IGameType = axiosGame.data;
  const categoriesOptions: IAxiosOptions = {
    type: "Category",
    name: game.names.international,
    url: `/games/${game.id}/categories`,
  };
  const axiosCategories: ICategoryResponse =
    await axiosSpeedrunCom<ICategoryResponse>(categoriesOptions);
  const categories: ICategoryType[] = axiosCategories.data;
  const newGame = new GameDatabase();
  newGame.setGame = game;
  newGame.setCategories = categories;
  return newGame.saveGame();
};

const getCategory = async (
  game: JoinedGame,
  messageArray: string[],
  streamer: string
) => {
  const targetCategory = await calculateCategoryName(messageArray, streamer);
  const validCategories = game.categories.filter((category) => {
    const hasLeaderboard = category.links.findIndex(
      (category) => category.rel === "leaderboard"
    );
    return hasLeaderboard > 0;
  });
  const fuzzyGameSearch = fuseSearchCategory(validCategories, targetCategory);

  return fuzzyGameSearch[0].item;
};

const runnerToDatabase = async (query: string) => {
  const options: IAxiosOptions = {
    type: "Runner",
    name: query,
    url: `/users/${query}`,
  };
  const axiosRunner: IRunnerResponse = await axiosSpeedrunCom<IRunnerResponse>(
    options
  );
  const runner: IRunner = axiosRunner.data;
  const runnerDatabase: Runner = new Runner();

  return await runnerDatabase.saveRunner(runner);
};

const fetchWorldRecord = async (game: JoinedGame, category: Category) => {
  const options: IAxiosOptions = {
    type: "World record",
    name: "Run",
    url: `leaderboards/${game.id}/category/${category.id}?top=1`,
  };
  const axiosWorldRecord: ILeaderboardReponse =
    await axiosSpeedrunCom<ILeaderboardReponse>(options);
  const worldRecord = axiosWorldRecord.data;
  const worldRecordTime: string = secondsToHHMMSS(
    worldRecord.runs[0].run.times.primary_t
  );
  const runnerDatabase = await fetchRunner(
    worldRecord.runs[0].run.players[0].id
  );

  const daysAgo = Math.floor(
    (new Date().getTime() - new Date(worldRecord.runs[0].run.date).getTime()) /
      86400000
  );

  return `${category.name} WR: ${worldRecordTime} by ${runnerDatabase.name} - ${daysAgo} days ago`;
};

export const getWorldRecord = async (
  streamer: string,
  messageArray: string[]
) => {
  try {
    const gameName = await calculateGameName(messageArray, streamer);
    const game = await fetchGame(gameName);
    const category = await getCategory(game, messageArray, streamer);
    return await fetchWorldRecord(game, category);
  } catch (error) {
    return error.message;
  }
};

const axiosLeaderboard = async (game: JoinedGame, category: Category) => {
  const options: IAxiosOptions = {
    type: "Leaderboard",
    name: category.name,
    url: `leaderboards/${game.id}/category/${category.id}`,
  };
  const leaderboard = new Speedrun<ILeaderboardReponse>(options);
  const res = await leaderboard.fetchAPI();
  return res.data.data;
};

const fetchPersonalBest = async (
  game: JoinedGame,
  category: Category,
  runnerId: string
) => {
  const leaderboard = await axiosLeaderboard(game, category);
  const personalRun = leaderboard.runs.find((run) => {
    return run.run.players[0].id === runnerId;
  });
  if (personalRun === undefined) throw new Error("Personal run not found");
  const personalRunTime: string = secondsToHHMMSS(
    personalRun.run.times.primary_t
  );
  const runnerDatabase = await fetchRunner(personalRun.run.players[0].id);
  const daysAgo = Math.floor(
    (new Date().getTime() - new Date(personalRun.run.date).getTime()) / 86400000
  );

  return `${runnerDatabase.name}' ${category.name} PB: ${personalRunTime} - #${personalRun.place} - ${daysAgo} days ago`;
};

export const getPersonalBest = async (
  streamer: string,
  messageArray: string[]
): Promise<string> => {
  try {
    const runner = await fetchRunner(messageArray[0]);
    const gameName = await calculateGameName(messageArray.slice(1), streamer);
    const game = await fetchGame(gameName);
    const category = await getCategory(
      game,
      messageArray.slice(1),
      runner.name
    );
    return await fetchPersonalBest(game, category, runner.id);
  } catch (error) {
    console.log("~ error", error.message);
    return error.message;
  }
};
