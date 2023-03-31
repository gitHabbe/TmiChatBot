import { ICommand } from "../../../interfaces/Command";
import { TimeTrialSupport } from "../../../interfaces/speedrun";
import { TimeTrialPersonalBestDiddyKongRacing } from "../Speedrun";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageParser } from "../../tmi/MessageParse"

export class TimeTrialPersonalBest implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData) {
    }

    async run(): Promise<MessageData> {
        console.log("messageData:", this.messageData)
        const targetUser = this.messageData.message.split(" ")[1]
        let message = this.messageData.message.split(" ")
        message.splice(1, 1)
        this.messageData.message = message.join(" ")
        const messageParser = new MessageParser()
        const gameName = await messageParser.gameName(this.messageData, 1)
        // const gameName: string = await stringExtract.game();
        switch (gameName.toUpperCase()) {
            case TimeTrialSupport.DKR:
                return new TimeTrialPersonalBestDiddyKongRacing(this.messageData, targetUser).run();
            default:
                throw Error(`${gameName} doesn't support !ttpb`);
        }
    }
}