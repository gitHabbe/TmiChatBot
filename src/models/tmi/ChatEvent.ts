import { ChatUserstate } from "tmi.js";
import { CommandName } from "../../interfaces/tmi";
import { CommandList, StandardCommandList } from "../commands/StandardCommandList";
import { ICommand } from "../../interfaces/Command";
import { MessageParser } from "./MessageParse";
import { MessageData } from "./MessageData";
import { UserModel } from "../database/UserPrisma";
import { ClientSingleton } from "./ClientSingleton";
import { CustomCommand } from "../commands/CustomCommand";

export class ChatEvent {
    async onMessage(ircChannel: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
        if (self) return; // Bot self message;
        const channel: string = ircChannel.slice(1);
        let messageData: MessageData = new MessageData(channel, chatter, message);
        const commandName: string = MessageParser.getCommandName(message);

        const isCommand: boolean = await ChatEvent.standardCommandAction(messageData, commandName);
        if (isCommand) return
    }

    private static async standardCommandAction(messageData: MessageData, commandName: string): Promise<boolean> {
        const isStandardCommand: boolean = commandName in CommandName
        if (!isStandardCommand) return false

        const commandList: CommandList = new StandardCommandList(messageData);
        const isCommand: ICommand | undefined = commandList.get(commandName);
        if (!isCommand) return false;

        messageData = await isCommand.run();
        const client = ClientSingleton.getInstance().get();
        await client.say(messageData.channel, messageData.response)
        return true
    }

    async onJoin(channel: string, username: string, self: boolean) {
        const userModel = new UserModel(channel);
        // userModel.create()
        const joinedUser = await userModel.get();

    }
}