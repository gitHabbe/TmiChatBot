import { ICommand } from "../../../interfaces/Command";
import { StringExtract } from "../../StringExtract";
import { TimeTrialSupport } from "../../../interfaces/speedrun";
import { TimeTrialPersonalBestDiddyKongRacing } from "../Speedrun";
import { MessageData } from "../../tmi/MessageData";

export class TimeTrialPersonalBest implements ICommand {
    constructor(public messageData: MessageData) {
    }

    run = async () => {
        console.log("messageData:", this.messageData)
        const targetUser = this.messageData.message.split(" ")[1]
        let message = this.messageData.message.split(" ")
        message.splice(1, 1)
        this.messageData.message = message.join(" ")
        const stringExtract = new StringExtract(this.messageData);
        const gameName: string = await stringExtract.game();
        switch (gameName.toUpperCase()) {
            case TimeTrialSupport.DKR:
                return new TimeTrialPersonalBestDiddyKongRacing(this.messageData, targetUser).run();
            default:
                throw Error(`${gameName} doesn't support !ttpb`);
        }
    }
}