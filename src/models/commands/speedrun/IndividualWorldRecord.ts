import { ICommand } from "../../../interfaces/Command";
import { StringExtract } from "../../StringExtract";
import { InduvidualLevelSupport } from "../../../interfaces/speedrun";
import { IndividualWorldRecordDiddyKongRacing } from "../Speedrun";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";

export class IndividualWorldRecord implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;
    constructor(public messageData: MessageData) {
    }

    async run(): Promise<MessageData> {
        const stringExtract = new StringExtract(this.messageData);
        const game: string = await stringExtract.game();
        switch (game.toUpperCase()) {
            case InduvidualLevelSupport.DKR:
                return new IndividualWorldRecordDiddyKongRacing(this.messageData).run();
            default:
                throw Error(`${game} doesn't support !ilwr`);
        }
    };
}