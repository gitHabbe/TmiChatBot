import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { IndividualLevelSupport } from "../../../interfaces/speedrun";
import { IndividualPersonalBestDiddyKongRacing } from "./IndividualPersonalBestDiddyKongRacing";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { MessageParser } from "../../tmi/MessageParse";
import { JoinedUser } from "../../../interfaces/prisma"

export class IndividualPersonalBest implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    async run(): Promise<MessageData> {
        const messageParser = new MessageParser();
        const gameName: string = await messageParser.gameName(this.messageData, 2);

        switch (gameName.toUpperCase()) {
            case IndividualLevelSupport.DKR:
                return new IndividualPersonalBestDiddyKongRacing(this.messageData).run();
            default:
                this.messageData.response = `${gameName} doesn't support !ilpb`
                return this.messageData
        }
    };
}