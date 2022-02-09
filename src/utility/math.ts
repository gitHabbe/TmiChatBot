import {IRun} from "../interfaces/speedrun";
import {RunnerPrisma} from "../models/database/RunnerPrisma";
import {Runner} from "@prisma/client";
import {datesDaysDifference, secondsToHHMMSS} from "./dateFormat";

export const randomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};
export const formatWorldRecord = async (
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