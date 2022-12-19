import { ICommand } from "../../../interfaces/Command";
import { MessageData } from "../../MessageData";
import { StringExtract } from "../../StringExtract";
import { GameModel } from "../../database/GamePrisma";
import { FullGame } from "../../../interfaces/prisma";
import { RunnerPrisma } from "../../database/RunnerPrisma";
import { Leaderboard } from "../../fetch/Leaderboard";
import { IRun } from "../../../interfaces/speedrun";
import { datesDaysDifference, floatToHHMMSS } from "../../../utility/dateFormat";

export class PersonalBest implements ICommand {
    constructor(public messageData: MessageData) {
    }

    run = async () => {
        const messageArray = this.messageData.message.split(" ");
        const runnerName = messageArray.splice(1, 1).join();
        this.messageData.message = messageArray.join(" ");
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        const gameModel = new GameModel(gameName);
        const game: FullGame | null = await gameModel.pull();
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