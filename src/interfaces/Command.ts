import { MessageData } from "../models/tmi/MessageData";

export interface ICommand {
    messageData: MessageData;

    run(): Promise<MessageData>;
}
