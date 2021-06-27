import { AxiosResponse } from "axios";
import { speedrunAPI } from "../config/speedrunConfig";
import {
  GameType,
  SpeedrunResponse,
  CategoryType,
  CategoryResponse,
} from "../interfaces/speedrun";
import { fetchStreamerByUsername, getStreamerTitle } from "./twitch";

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
  console.log("~ categories", categories);
  const correctCategory = categories.find(
    (categoryName) => categoryName.name.toLowerCase() === category.toLowerCase()
  );
  if (correctCategory === undefined)
    throw new Error(`${correctCategory} category not found`);

  return correctCategory;
};

export const getSpeedgameWR = async (
  channel: string,
  gameNameQuery: string | undefined,
  categoryQuery: string | undefined
) => {
  let game: GameType;
  if (gameNameQuery === undefined) {
    const twitchGame: string = await getStreamerGame(channel);
    game = await searchSpeedgameByName(twitchGame);
  } else {
    const gameResponse = await searchSpeedgameByName(gameNameQuery);
    game = gameResponse;
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
