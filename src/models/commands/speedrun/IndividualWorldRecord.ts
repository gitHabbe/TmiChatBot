import { ICommand } from "../../../interfaces/Command";
import { MessageData } from "../../MessageData";
import { StringExtract } from "../../StringExtract";
import { InduvidualLevelSupport } from "../../../interfaces/speedrun";
import { IndividualWorldRecordDiddyKongRacing } from "../Speedrun";

export class IndividualWorldRecord implements ICommand {
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