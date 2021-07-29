import { speedrunAPI } from "../config/speedrunConfig";
import {
  GameType,
  SpeedrunResponse,
  CategoryType,
  CategoryResponse,
} from "../interfaces/speedrun";
import { fuseSearchCategory } from "../utility/fusejs";
import { fetchStreamerByUsername, getStreamerTitle } from "./twitch";
import { GetGameDatabase, CreateGameDatabase } from "../models/database";
import { Game } from "@prisma/client";

export const searchSpeedgameByName = async (
  gameName: string
): Promise<GameType> => {
  const gameDB = new GetGameDatabase(gameName);
  const isGameInDatabase = await gameDB.getGame();
  console.log("~ isGameInDatabase", isGameInDatabase);
  if (isGameInDatabase != null) {
    console.log("IN DATABASE");
    return isGameInDatabase;
  }
  console.log("NOT IN DATABASE");
  const gamesResponse = await speedrunAPI.get<SpeedrunResponse>(
    `games?name=${gameName}`
  );
  const foundGame = gamesResponse.data.data.find((game: GameType) => {
    return game.abbreviation.toLowerCase() === gameName.toLowerCase();
  });
  if (foundGame) {
    console.log("CREATING GAME");
    const newGame = new CreateGameDatabase(foundGame);
    newGame.saveGame();
    // console.log("~ newGame", newGame);
  } else {
    throw new Error(`${gameName} game not found`);
  }
  return foundGame;
};

export const getStreamerGame = async (channel: string): Promise<string> => {
  const { game_name } = await fetchStreamerByUsername(channel);

  return game_name;
};

export const getSpeedgameCategory = async (
  game: GameType,
  category: string
) => {
  const categoriesResponse = await speedrunAPI.get<CategoryResponse>(
    `/games/${game.id}/categories`
  );
  const categories: CategoryType[] = categoriesResponse.data.data;
  const fuzzyGameSearch = fuseSearchCategory(categories, category);
  console.log("~ fuzzyGameSearch[0].item", fuzzyGameSearch[0].item.name);
  // const correctCategory = fuzzyGameSearch.find(
  //   (categoryName) => categoryName.item.name === category.toLowerCase()
  // );
  if (fuzzyGameSearch[0].item.name === undefined) {
    throw new Error(`${category} category not found`);
  }

  return fuzzyGameSearch[0].item;
};

export const getSpeedgameWR = async (
  channel: string,
  messageArray: string[]
) => {
  let game: GameType;
  const gameQuery: string = messageArray[0];
  const categoryQuery: string = [...messageArray].slice(1).join(" ");
  if (gameQuery === undefined) {
    const twitchGame: string = await getStreamerGame(channel);
    game = await searchSpeedgameByName(twitchGame);
  } else {
    game = await searchSpeedgameByName(gameQuery);
  }
  let category: CategoryType;
  if (categoryQuery === undefined) {
    const twitchTitle: string = await getStreamerTitle(channel);
    category = await getSpeedgameCategory(game, twitchTitle);
  } else {
    category = await getSpeedgameCategory(game, categoryQuery);
  }
};
