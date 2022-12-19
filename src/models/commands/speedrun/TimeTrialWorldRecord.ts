import { ICommand } from "../../../interfaces/Command";
import { MessageData } from "../../MessageData";
import { StringExtract } from "../../StringExtract";
import { TimeTrialSupport } from "../../../interfaces/speedrun";
import { TimeTrialWorldRecordDiddyKongRacing } from "../Speedrun";

export class TimeTrialWorldRecord implements ICommand {
    constructor(public messageData: MessageData) {
    }

    run = async () => {
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        switch (gameName.toUpperCase()) {
            case TimeTrialSupport.DKR:
                return new TimeTrialWorldRecordDiddyKongRacing(this.messageData).run();
            default:
                throw Error(`${gameName} doesn't support !ttwr`);
        }
    }
}