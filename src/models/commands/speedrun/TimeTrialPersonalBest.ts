import { ICommandUser } from "../../../interfaces/Command"
import { TimeTrialSupport } from "../../../interfaces/speedrun";
import { TimeTrialPersonalBestDiddyKongRacing } from "../Speedrun";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageParser } from "../../tmi/MessageParse"
import { JoinedUser } from "../../../interfaces/prisma"

export class TimeTrialPersonalBest implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    async run(): Promise<MessageData> {
        const targetUser = this.messageData.message.split(" ")[1]
        let message = this.messageData.message.split(" ")
        message.splice(1, 1)
        this.messageData.message = message.join(" ")
        const messageParser = new MessageParser()
        const gameName = await messageParser.gameName(this.messageData, 1)
        switch (gameName.toUpperCase()) {
            case TimeTrialSupport.DKR:
                return new TimeTrialPersonalBestDiddyKongRacing(this.messageData, targetUser).run();
            default:
                throw Error(`${gameName} doesn't support !ttpb`);
        }
    }
}