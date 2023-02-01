import { ICommand } from "../../../interfaces/Command";
import { StringExtract } from "../../StringExtract";
import { GamePrisma } from "../../database/GamePrisma";
import { FullGame } from "../../../interfaces/prisma";
import { RunnerPrisma } from "../../database/RunnerPrisma";
import { Leaderboard } from "../../fetch/Leaderboard";
import { IRun } from "../../../interfaces/speedrun";
import { datesDaysDifference, floatToHHMMSS } from "../../../utility/dateFormat";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";

export class PersonalBest implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN

    constructor(public messageData: MessageData) {
    }

    async run(): Promise<MessageData> {
        const messageArray = this.messageData.message.split(" ");
        const runnerName = messageArray.splice(1, 1).join();
        this.messageData.message = messageArray.join(" ");
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        const gameModel = new GamePrisma(gameName);
        const game = await gameModel.get();
        const query: string = await stringExtract.category();
        if (!game) {
            this.messageData.response = `Game ${gameName} not found`;
            return this.messageData
        }
        const runnerModel = new RunnerPrisma();
        const runner = await runnerModel.get(runnerName);
        if (!runner) {
            this.messageData.response = `Runner ${runnerName} not found`;
            return this.messageData
        }
        const leaderboard = new Leaderboard(game);
        const fuzzyCategory = leaderboard.fuzzyCategory(query);
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