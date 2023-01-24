import { MessageData } from "../models/tmi/MessageData";
import { ModuleFamily } from "./tmi";

export interface ICommand {
    messageData: MessageData;
    moduleFamily: ModuleFamily;

    run(): Promise<MessageData>;
}
