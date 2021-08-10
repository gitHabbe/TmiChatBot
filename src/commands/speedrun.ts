import { speedrunAPI } from "../config/speedrunConfig";
import {
  IGameType,
  SpeedrunResponse,
  ICategoryType,
  ICategoryResponse,
  ILeaderboardReponse,
  RunnerResponse,
  IRunner,
} from "../interfaces/speedrun";
import { fuseSearchCategory } from "../utility/fusejs";
import { secondsToHHMMSS } from "../utility/dateFormat";
import { getStreamerTitle, getStreamerGame } from "./twitch";
import { GameDatabase } from "../models/database/game";
import { Runner } from "../models/database/runner";
import { Game, Category, CategoryLink } from ".prisma/client";
import { JoinedGame } from "../interfaces/prisma";

class CustomError extends Error {
  userMessage: string | undefined;
  constructor(message: string, userMessage: string | undefined = undefined) {
    super(message);
    this.userMessage = userMessage;
  }
}

export const gameNotInDatabase = new CustomError(
  "GAME NOT FOUND",
  "GAME NOT FOUND"
);

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
) => {
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

const axiosGame = async (gameName: string) => {
  try {
    const {
      data: { data: game },
    } = await speedrunAPI.get<SpeedrunResponse>(`games/${gameName}`);
    return game;
  } catch (error) {
    switch (error.response.data.status) {
      case 420:
        throw new Error("SpeedrunCom is having network problem");
      case 404:
        throw new Error("Game not found on SpeedrunCom");
      default:
        throw new Error("Unknown error");
    }
  }
};

const axiosCategories = async (game: IGameType) => {
  try {
    const {
      data: { data: categoriesArray },
    } = await speedrunAPI.get<ICategoryResponse>(
      `/games/${game.id}/categories`
    );
    return categoriesArray;
  } catch (error) {
    if (error)
      switch (error.response.data.status) {
        case 420:
          throw new Error("SpeedrunCom is having network problem");
        case 404:
          throw new Error("Category not found on SpeedrunCom");
        default:
          throw new Error("Unknown error");
      }
  }
};

const gameToDatabase = async (gameName: string) => {
  const game = await axiosGame(gameName);
  const categories = await axiosCategories(game);
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
  const runner: IRunner = await axiosRunner(query);
  const runnerDatabase: Runner = new Runner();

  return await runnerDatabase.saveRunner(runner);
};

const axiosRunner = async (query: string) => {
  try {
    const {
      data: { data: runner },
    } = await speedrunAPI.get<RunnerResponse>(`users/${query}`);
    return runner;
  } catch (error) {
    switch (error.response.data.status) {
      case 420:
        throw new Error("SpeedrunCom is having network problem");
      case 404:
        throw new Error(`Runner: ${query} not found on SpeedrunCom`);
      default:
        throw new Error("Unknown error");
    }
  }
};

const axiosWorldRecord = async (game: JoinedGame, category: Category) => {
  try {
    const {
      data: { data: worldRecord },
    } = await speedrunAPI.get<ILeaderboardReponse>(
      `leaderboards/${game.id}/category/${category.id}?top=1`
    );
    return worldRecord;
  } catch (error) {
    switch (error.response.data.status) {
      case 420:
        throw new Error("SpeedrunCom is having network problem");
      case 404:
        throw new Error("Category not found on SpeedrunCom");
      default:
        throw new Error("Unknown error");
    }
  }
};

const fetchWorldRecord = async (game: JoinedGame, category: Category) => {
  const worldRecord = await axiosWorldRecord(game, category);
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
    console.log("~ gameName", gameName);
    const game = await fetchGame(gameName);
    console.log("~ game", game);
    const category = await getCategory(game, messageArray, streamer);
    console.log("~ category", category);
    return await fetchWorldRecord(game, category);
  } catch (error) {
    return error.message;
  }
};

const axiosLeaderboard = async (game: JoinedGame, category: Category) => {
  try {
    const {
      data: { data: leaderboard },
    } = await speedrunAPI.get<ILeaderboardReponse>(
      `leaderboards/${game.id}/category/${category.id}`
    );
    return leaderboard;
  } catch (error) {
    switch (error.response.data.status) {
      case 420:
        throw new Error("SpeedrunCom is having network problem");
      case 404:
        throw new Error("Category not found on SpeedrunCom");
      default:
        throw new Error("Unknown error");
    }
  }
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
  console.log("~ personalRun", personalRun);
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
    console.log("~ runner", runner);
    const gameName = await calculateGameName(messageArray.slice(1), streamer);
    console.log("~ gameName", gameName);
    const game = await fetchGame(gameName);
    console.log("~ game", game);
    const category = await getCategory(
      game,
      messageArray.slice(1),
      runner.name
    );
    console.log("~ category", category);
    return await fetchPersonalBest(game, category, runner.id);
  } catch (error) {
    console.log("~ error", error.message);
    return error.message;
  }
};
