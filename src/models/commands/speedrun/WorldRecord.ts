import { ICommand } from "../../../interfaces/Command";
import { StringExtract } from "../../StringExtract";
import { Leaderboard } from "../../fetch/Leaderboard";
import { IRun } from "../../../interfaces/speedrun";
import { formatWorldRecord } from "../../../utility/math";
import { FullGame } from "../../../interfaces/prisma";
import { GameModel } from "../../database/GamePrisma";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";

export class WorldRecord implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData) {
    }

    async run(): Promise<MessageData> {
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        const game = await this.getGame(gameName);
        const query: string = await stringExtract.category();
        if (!game) {
            this.messageData.response = `Game ${gameName} not found on SpeedrunDotCom`;
            return this.messageData;
        }
        const leaderboard = new Leaderboard(game);
        const fuzzyCategory = leaderboard.fuzzyCategory(query);
        const [ { item: category } ] = fuzzyCategory;
        const worldRecord: IRun = await leaderboard.fetchWorldRecord(category);
        this.messageData.response = await formatWorldRecord(worldRecord, category.name);

        return this.messageData;
    };

    private async getGame(gameName: string): Promise<FullGame | null> {
        const gameModel = new GameModel(gameName);
        return await gameModel.pull();
    }
}