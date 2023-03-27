import { MessageData } from "../models/tmi/MessageData";
import { ModuleFamily } from "./tmi";
import { JoinedUser } from "./prisma"

export interface ICommand {
    messageData: MessageData;
    moduleFamily: ModuleFamily;

    run(): Promise<MessageData>;
}

export interface ICommandUser extends ICommand {
    user: JoinedUser;
}