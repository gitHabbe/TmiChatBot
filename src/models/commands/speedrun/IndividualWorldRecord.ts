import { ICommand } from "../../../interfaces/Command";
import { StringExtract } from "../../StringExtract";
import { IndividualLevelSupport } from "../../../interfaces/speedrun";
import { IndividualWorldRecordDiddyKongRacing } from "../Speedrun";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { MessageParser } from "../../tmi/MessageParse";

export class IndividualWorldRecord implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;
    constructor(public messageData: MessageData) {
    }

    async run(): Promise<MessageData> {
        const messageParser = new MessageParser();
        const gameName: string = await messageParser.gameName(this.messageData, 1);

        switch (gameName.toUpperCase()) {
            case IndividualLevelSupport.DKR:
                return new IndividualWorldRecordDiddyKongRacing(this.messageData).run();
            default:
                this.messageData.response = `${gameName} doesn't support !ilwr`;
                return this.messageData
        }
    };
}