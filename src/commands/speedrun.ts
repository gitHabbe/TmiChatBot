import { speedrunAPI } from "../config/speedrunConfig";
import {
  GameType,
  SpeedrunResponse,
  CategoryType,
  CategoryResponse,
  LeaderboardReponse,
} from "../interfaces/speedrun";
import { fuseSearchCategory } from "../utility/fusejs";
import { secondsToHHMMSS } from "../utility/dateFormat";
import { getStreamerTitle, getStreamerGame } from "./twitch";
import { GetGameDatabase, CreateGameDatabase } from "../models/database";
import { Game, Category, CategoryLink } from ".prisma/client";

const gameFromDatabase = async (query: string) => {
  const gameDatabase = new GetGameDatabase(query);
  let gameFromDatabase = await gameDatabase.getGameByName();
  if (gameFromDatabase === null) {
    gameFromDatabase = await gameDatabase.getGameByAbbreviation();
  }
  return gameFromDatabase;
};

const categoryFromUserInputOrTitle = async (
  query: string[] | undefined[],
  streamer: string
) => {
  if (query.length === 0) {
    const category = await getStreamerTitle(streamer);
    return category;
  } else {
    return query.join(" ");
  }
};

const getGameName = async (
  query: string | undefined,
  streamer: string
): Promise<string> => {
  if (!query) {
    const twitchGame: string = await getStreamerGame(streamer);
    return twitchGame;
  }
  return query;
};

export const searchSpeedgameByName = async (
  streamer: string,
  messageArray: string[] | undefined[]
) => {
  const gameQuery: string | undefined = messageArray[0];
  const gameName = await getGameName(gameQuery, streamer);
  let databaseGame = await gameFromDatabase(gameName);
  console.log("~ databaseGame", databaseGame);

  if (databaseGame === null) {
    const gamesResponse = await speedrunAPI.get<SpeedrunResponse>(
      `games?name=${gameName}`
    );
    const foundGame = gamesResponse.data.data.find((game: GameType) => {
      return (
        game.abbreviation.toLowerCase() === gameName.toLowerCase() ||
        game.names.international.toLowerCase() === gameName.toLowerCase()
      );
    });
    if (foundGame) {
      const categoriesResponse = await speedrunAPI.get<CategoryResponse>(
        `/games/${foundGame.id}/categories`
      );
      const categories: CategoryType[] = categoriesResponse.data.data;
      const newGame = new CreateGameDatabase(foundGame, categories);
      await newGame.saveGame();
      databaseGame = await gameFromDatabase(foundGame.abbreviation);
    }
  }
  if (!databaseGame) {
    throw new Error("Game not found");
  }
  const categoryQuery: string[] | undefined[] = messageArray.slice(1);
  const targetCategory = await categoryFromUserInputOrTitle(
    categoryQuery,
    streamer
  );
  const fuzzyGameSearch = fuseSearchCategory(
    databaseGame.categories,
    targetCategory
  );
  if (fuzzyGameSearch.length === 0) {
    throw new Error("Category not found");
  }
  const category = fuzzyGameSearch[0].item.name;
  const {
    data: { data: worldRecord },
  } = await speedrunAPI.get<LeaderboardReponse>(
    `leaderboards/${databaseGame.id}/category/${fuzzyGameSearch[0].item.id}`
  );
  const worldRecordTime = secondsToHHMMSS(
    worldRecord.runs[0].run.times.primary_t
  );
  console.log("wr:", worldRecord);

  return `${category} WR: ${worldRecordTime}`;
};

// export const getSpeedgameWR = async (
//   streamer: string,
//   messageArray: string[]
// ) => {
//   let game: GameType;
//   const gameQuery: string = messageArray[0];
//   const categoryQuery: string = [...messageArray].slice(1).join(" ");
//   if (gameQuery === undefined) {
//     const twitchGame: string = await getStreamerGame(streamer);
//     game = await searchSpeedgameByName(twitchGame, categoryQuery);
//   } else {
//     game = await searchSpeedgameByName(gameQuery, categoryQuery);
//   }
//   let category: CategoryType;
//   if (categoryQuery === undefined) {
//     const twitchTitle: string = await getStreamerTitle(streamer);
//     category = await getSpeedgameCategory(game, twitchTitle);
//   } else {
//     category = await getSpeedgameCategory(game, categoryQuery);
//   }
// };
