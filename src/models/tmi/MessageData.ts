import { ChatUserstate } from "tmi.js";

export class MessageData {
    public response: string = "";

    constructor(public channel: string, public chatter: ChatUserstate, public message: string) {}
}