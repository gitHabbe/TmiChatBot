import { ICommandUser } from "../../../interfaces/Command"
import { TimeTrialSupport } from "../../../interfaces/speedrun";
import { TimeTrialWorldRecordDiddyKongRacing } from "../Speedrun";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { MessageParser } from "../../tmi/MessageParse"
import { JoinedUser } from "../../../interfaces/prisma"

export class TimeTrialWorldRecord implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN

    constructor(public messageData: MessageData, public user: JoinedUser) {}

    async run(): Promise<MessageData> {
        const messageParser = new MessageParser()
        const gameName: string = await messageParser.gameName(this.messageData, 1)
        switch (gameName.toUpperCase()) {
            case TimeTrialSupport.DKR:
                return new TimeTrialWorldRecordDiddyKongRacing(this.messageData).run();
            default:
                throw Error(`${gameName} doesn't support !ttwr`);
        }
    }
}