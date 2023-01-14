import { ChatUserstate } from "tmi.js";
import { CommandName } from "../../interfaces/tmi";
import { CommandList, StandardCommandList } from "../commands/StandardCommandList";
import { ICommand } from "../../interfaces/Command";
import { MessageParser } from "./MessageParse";
import { MessageData } from "./MessageData";
import { UserModel } from "../database/UserPrisma";
import { ClientSingleton } from "./ClientSingleton";

export class ChatEvent {
    async onMessage(ircChannel: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
        if (self) return; // Bot self message;
        const channel: string = ircChannel.slice(1);
        const messageData: MessageData = new MessageData(channel, chatter, message);

        const isCommand: boolean = await ChatEvent.standardCommandAction(messageData);
        if (isCommand) return
    }

    async onJoin(channel: string, username: string, self: boolean) {}

    private static async standardCommandAction(messageData: MessageData): Promise<boolean> {
        const commandName: string = MessageParser.getCommandName(messageData.message);
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
}