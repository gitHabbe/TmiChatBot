import { MessageData } from "../models/tmi/MessageData";
import { CommandModule } from "./tmi";

export interface ICommand {
    messageData: MessageData;
    commandModule: CommandModule;

    run(): Promise<MessageData>;
}
