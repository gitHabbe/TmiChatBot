import { ChatUserstate, Client } from "tmi.js";
import { OnMessage } from "../interfaces/tmi";
import { MessageData } from "./MessageData";
import { LinkCommand } from "./commands/LinkCommand";
import { CustomCommand } from "./commands/CustomCommand";
import { StandardCommand } from "./commands/StandardCommand";

export class Events {
    constructor(private tmiClient: Client) {}

    onMessage: OnMessage = async (
        streamer: string,
        chatter: ChatUserstate,
        message: string,
        self: boolean
    ): Promise<MessageData> => {
        if (self) throw "Bot self message";
        let messageData: MessageData = new MessageData(streamer, chatter, message);

        try {
            messageData = await new LinkCommand(messageData).run()
        } catch (error) {
        }

        try {
            return await new CustomCommand(messageData).run();
        } catch (error) {
        }

        if (message[0] !== "!") throw new Error("Ignore this error");

        try {
            messageData = await new StandardCommand(messageData, this.tmiClient).run();
        } catch (error) {
            return error.message
        }
        return messageData
    }
}