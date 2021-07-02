import { AxiosResponse } from "axios";
import { speedrunAPI } from "../config/speedrunConfig";
import {
  GameType,
  SpeedrunResponse,
  CategoryType,
  CategoryResponse,
} from "../interfaces/speedrun";
import { fuseSearchCategory } from "../utility/fusejs";
import { fetchStreamerByUsername, getStreamerTitle } from "./twitch";
import { LowDB } from "../models/LowDB";

export const searchSpeedgameByName = async (
  gameName: string
): Promise<GameType> => {
  const gamesResponse = await speedrunAPI.get<SpeedrunResponse>(
    `games?name=${gameName}`
  );
  const games: GameType[] = gamesResponse.data.data;
  const game = games.find(
    (game: GameType) =>
      game.abbreviation.toLowerCase() === gameName.toLowerCase()
  );
  if (game === undefined) throw new Error(`${gameName} game not found`);

  return game;
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
  const correctCategory = fuzzyGameSearch.find(
    (categoryName) => categoryName.item.name === category.toLowerCase()
  );
  if (correctCategory === undefined)
    throw new Error(`${category} category not found`);
  console.log("~ correctCategory", correctCategory);

  return correctCategory.item;
};

export const getSpeedgameWR = async (
  channel: string,
  messageArray: string[]
) => {
  const asdf = new LowDB("game_database.json");

  console.log("DATA");
  // console.log(asdf.getData());
  // process.exit();
  let game: GameType;
  const gameQuery: string = messageArray[0];
  const categoryQuery: string = [...messageArray].slice(1).join(" ");
  console.log("~ categoryQuery", categoryQuery);
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
  console.log(category);
};
