import {
  InduvidualLevelSupport,
  TimeTrialSupport,
  IRun,
} from "../interfaces/speedrun";
import { datesDaysDifference, secondsToHHMMSS } from "../utility/dateFormat";
import { getStreamerTitle } from "./twitch";
import { GamePrisma } from "../models/database/GamePrisma";
import { RunnerPrisma } from "../models/database/RunnerPrisma";
import { JoinedGame } from "../interfaces/prisma";
import { Runner } from "@prisma/client";
import { UserPrisma } from "../models/database/UserPrisma";
import { SettingPrisma } from "../models/database/SettingPrisma";
import { SpeedGame } from "../models/fetch/SpeedGame";
import { Leaderboard } from "../models/fetch/Leaderboard";
import {
  DiddyKongRacingInduvidualPersonalBest,
  DiddyKongRacingInduvidualWorldRecord,
  DiddyKongRacingTimeTrialPersonalBest,
  DiddyKongRacingTimeTrialWorldRecord,
} from "./specificGames/diddyKongRacing";

const gameFromMessage = async (
  messageArray: string[],
  streamer: string
): Promise<string> => {
  if (messageArray.length === 0) {
    const game = new SpeedGame();
    return game.twitch(streamer);
  }
  return messageArray[0];
};

const categoryFromMessage = async (
  messageArray: string[],
  streamer: string
): Promise<string> => {
  const categoryUserInput: string[] = messageArray.slice(1);
  if (categoryUserInput.length === 0) {
    return await getStreamerTitle(streamer);
  }
  return categoryUserInput.join(" ");
};

const joinedGame = async (streamer: string, messageArray: string[]) => {
  const gameName: string = await gameFromMessage(messageArray, streamer);
  const gamePrisma = new GamePrisma();
  const game: JoinedGame = await gamePrisma.get(gameName);

  return game;
};

export const worldRecord = async (
  streamer: string,
  messageArray: string[]
): Promise<string> => {
  try {
    const game: JoinedGame = await joinedGame(streamer, messageArray);
    const query: string = await categoryFromMessage(messageArray, streamer);
    const leaderboard = new Leaderboard(game);
    const fuzzyCategory = leaderboard.fuzzyCategory(query);
    const [{ item: category }] = fuzzyCategory;
    const worldRecord: IRun = await leaderboard.fetchWorldRecord(category);

    return await formatWorldRecord(worldRecord, category.name);
  } catch (error) {
    if (error instanceof Error) return error.message;
    return "Unable to find WR";
  }
};

const formatWorldRecord = async (
  worldRecord: IRun,
  category: string
): Promise<string> => {
  const runnerPrisma = new RunnerPrisma();
  const runnerId: string = worldRecord.run.players[0].id;
  const runner: Runner = await runnerPrisma.get(runnerId);
  const daysAgo: number = datesDaysDifference(worldRecord.run.date);
  const seconds: number = worldRecord.run.times.primary_t;
  const time: string = secondsToHHMMSS(seconds);

  return `${category} WR: ${time} by ${runner.name} - ${daysAgo} days ago`;
};

export const personalBest = async (
  streamer: string,
  messageArray: string[]
): Promise<string> => {
  try {
    const targetRunner: string = messageArray[0];
    const runnerPrisma = new RunnerPrisma();
    const runner: Runner = await runnerPrisma.get(targetRunner);
    const query: string[] = messageArray.slice(1);
    const msgCategory: string = await categoryFromMessage(query, streamer);
    const game: JoinedGame = await joinedGame(streamer, query);
    const leaderboard = new Leaderboard(game);
    const fuzzyCategory = leaderboard.fuzzyCategory(msgCategory);
    const [{ item: category }] = fuzzyCategory;
    const run: IRun = await leaderboard.fetchPersonalBest(category, runner.id);

    return formatPersonalBest(runner, run, category.name);
  } catch (error) {
    if (error instanceof Error) return error.message;
    throw new Error("Unable to find PB");
  }
};

const formatPersonalBest = async (
  runner: Runner,
  run: IRun,
  category: string
): Promise<string> => {
  const date: string = run.run.date;
  const daysAgo: number = datesDaysDifference(date);
  const seconds: number = run.run.times.primary_t;
  const time: string = secondsToHHMMSS(seconds);
  const place: number = run.place;
  const name: string = runner.name;

  return `${name} ${category} PB: ${time} - #${place} - ${daysAgo} days ago`;
};

export const induvidualWorldRecord = async (
  streamer: string,
  messageArray: string[]
) => {
  try {
    const gameName: string = await gameFromMessage(messageArray, streamer);
    switch (gameName.toUpperCase()) {
      case InduvidualLevelSupport.DKR:
        return DiddyKongRacingInduvidualWorldRecord(messageArray);
      default:
        throw Error(`${gameName} doesn't support !ilwr`);
    }
  } catch (error) {
    if (error instanceof Error) return error.message;
    return "Unable to find IL WR";
  }
};

export const induvidualPersonalBest = async (
  streamer: string,
  messageArray: string[]
) => {
  try {
    const gameName: string = await gameFromMessage(
      messageArray.slice(1),
      streamer
    );
    switch (gameName.toUpperCase()) {
      case InduvidualLevelSupport.DKR:
        return DiddyKongRacingInduvidualPersonalBest(messageArray);
      default:
        return `Game "${gameName}" doesn't support !ilwr`;
    }
  } catch (error) {
    if (error instanceof Error) return error.message;
    return "Unable to get IL PB";
  }
};

export const timeTrialWorldRecord = async (
  streamer: string,
  messageArray: string[]
) => {
  try {
    const gameName: string = await gameFromMessage(messageArray, streamer);
    switch (gameName.toUpperCase()) {
      case TimeTrialSupport.DKR:
        return await DiddyKongRacingTimeTrialWorldRecord(messageArray);
      default:
        return `Game "${gameName}" doesn't support !ttwr`;
    }
  } catch (error) {
    if (error instanceof Error) return error.message;
    return "Unable to get TT WR";
  }
};

export const timeTrialPersonalBest = async (
  streamer: string,
  messageArray: string[]
): Promise<string> => {
  try {
    const gameName: string = await gameFromMessage(
      messageArray.slice(1),
      streamer
    );
    switch (gameName.toUpperCase()) {
      case TimeTrialSupport.DKR:
        return DiddyKongRacingTimeTrialPersonalBest(messageArray);
      default:
        return `Game "${gameName}" doesn't support !ttpb`;
    }
  } catch (error) {
    return `Unable to find TT PB`;
  }
};

export const setSpeedrunComUsername = async (
  streamer: string,
  messageArray: string[]
) => {
  try {
    const newUsername: string | undefined = messageArray[0];
    const userPrisma = new UserPrisma(streamer);
    const user = await userPrisma.find();
    const setting = new SettingPrisma(user);
    const newSetting = await setting.apply("SpeedrunName", newUsername);

    return `SpeedrunDotCom username set to: ${newSetting.value}`;
  } catch (error) {
    return "Unable to set new speedrun name";
  }
};
