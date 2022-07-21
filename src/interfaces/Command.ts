import { MessageData } from "../models/MessageData";

export interface ICommand {
    messageData: MessageData;

    run(): Promise<MessageData>;
}
