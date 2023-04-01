import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { RunnerPrisma } from "../../database/RunnerPrisma";
import { Leaderboard } from "../../fetch/Leaderboard";
import { IRun } from "../../../interfaces/speedrun";
import { datesDaysDifference, floatToHHMMSS } from "../../../utility/dateFormat";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { MessageParser } from "../../tmi/MessageParse"
import { SpeedrunGameData } from "./WorldRecord"
import { JoinedUser } from "../../../interfaces/prisma"

export class PersonalBest implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN

    constructor(public messageData: MessageData, public user: JoinedUser) {}

    async run(): Promise<MessageData> {
        const messageArray = this.messageData.message.split(" ");
        const speedrunGameData = new SpeedrunGameData(this.messageData)
        const index = 2
        const fullSpeedrunGame = await speedrunGameData.getFullSpeedrunGame(index)
        const messageParser = new MessageParser()
        const categoryName: string = await messageParser.categoryName(this.messageData, index + 1)
        const runnerModel = new RunnerPrisma();
        const runnerName = messageArray.splice(1, 1).join();
        const runner = await runnerModel.get(runnerName);
        if (!runner) {
            this.messageData.response = `Runner ${runnerName} not found`;
            return this.messageData
        }
        const leaderboard = new Leaderboard(fullSpeedrunGame);
        const fuzzyCategory = leaderboard.fuzzyCategory(categoryName);
        const [ { item: category } ] = fuzzyCategory;
        const personalBest: IRun = await leaderboard.fetchPersonalBest(
            category,
            runner.id
        );
        const worldRecordDate: string = personalBest.run.date;
        const worldRecordNumber: number = personalBest.run.times.primary_t;
        const personalBestTime: string = floatToHHMMSS(worldRecordNumber);
        const daysAgo: number = datesDaysDifference(worldRecordDate);
        this.messageData.response = `${runner.name} ${category.name} PB: ${personalBestTime} - #${personalBest.place} - ${daysAgo} days ago`;

        return this.messageData;
    };
}