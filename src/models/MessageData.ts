import {ChatUserstate} from "tmi.js";

export class MessageData {
    public channel: string;

    constructor(
        channel: string,
        public chatter: ChatUserstate,
        public message: string
    ) {
        this.channel = channel.slice(1);
    }
}