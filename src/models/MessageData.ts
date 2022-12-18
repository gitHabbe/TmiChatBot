import { ChatUserstate } from "tmi.js";

export class MessageData {
    public channel: string;
    public targetChannel: string;
    public response: string = "";

    constructor(channel: string, public chatter: ChatUserstate, public message: string) {
        this.channel = channel.slice(1);
        this.targetChannel = channel;
    }

    getCommandName(): string {
        const chatterCommand: string = this.message.split(" ")[0];
        return chatterCommand.slice(1).toUpperCase();
    };
}