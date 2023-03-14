import { ICommand } from "../../../interfaces/Command";
import { StringExtract } from "../../StringExtract";
import { TimeTrialSupport } from "../../../interfaces/speedrun";
import { TimeTrialWorldRecordDiddyKongRacing } from "../Speedrun";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";

export class TimeTrialWorldRecord implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN

    constructor(public messageData: MessageData) {}

    async run(): Promise<MessageData> {
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