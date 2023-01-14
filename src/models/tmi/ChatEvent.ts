import { ChatUserstate } from "tmi.js";
import { CommandName } from "../../interfaces/tmi";
import { CommandList, StandardCommandList } from "../commands/StandardCommandList";
import { ICommand } from "../../interfaces/Command";
import { MessageParser } from "./MessageParse";
import { MessageData } from "./MessageData";
import { UserModel } from "../database/UserPrisma";
import { ClientSingleton } from "./ClientSingleton";
import { JoinedUser } from "../../interfaces/prisma";
import { Command, Component } from "@prisma/client";

export class ChatEvent {
    async onMessage(ircChannel: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
        if (self) return; // Bot self message;
        const channel: string = ircChannel.slice(1);
        const messageData: MessageData = new MessageData(channel, chatter, message);

        const isCustomCommand: boolean = await ChatEvent.customCommandAction(channel, message);
        if (isCustomCommand) return

        const isCommand: boolean = await ChatEvent.standardCommandAction(messageData);
        if (isCommand) return
    }

    private static async customCommandAction(channel: string, message: string): Promise<boolean> {
        const userModel: UserModel = new UserModel(channel);
        const joinedUser: JoinedUser = await userModel.get();
        const isCustomCommand: Command[] = joinedUser.commands.filter((command: Command) => {
            return command.name === message
        })
        if (isCustomCommand.length > 0) {
            const client = ClientSingleton.getInstance().client;
            await client.say(channel, isCustomCommand[0].name)
            return true
        }
        return false;
    }

    async onJoin(ircChannel: string, username: string, self: boolean) {
        console.log(`I HAVE JOINED ${ircChannel}`);
        const channel: string = ircChannel.slice(1);
        const userModel = new UserModel(channel);
        await userModel.get();
    }

    private static async standardCommandAction(messageData: MessageData): Promise<boolean> {
        const commandName: string = MessageParser.getCommandName(messageData.message);
        const isStandardCommand: boolean = commandName in CommandName
        if (!isStandardCommand) return false

        const commandList: CommandList = new StandardCommandList(messageData);
        const isCommand: ICommand | undefined = commandList.get(commandName);
        if (!isCommand) return false;
        const userModel = new UserModel(messageData.channel);
        const joinedUser = await userModel.get();
        const isCommandEnabled = joinedUser.components.find(command => {
            const isEnabled = command.name.toUpperCase() === isCommand.commandModule.toUpperCase();
            return isEnabled ? 1 : 0
        })
        const chatter = messageData.chatter.username?.toUpperCase();
        const streamer = messageData.channel.toUpperCase();
        const client = ClientSingleton.getInstance().get();
        if (!isCommandEnabled) {
            if (streamer === chatter) {
                await client.say(messageData.channel, `Command: ${commandName} is not enabled. Use "!enable ${commandName.toLowerCase()}"`)
                return true
            } else {
                return false
            }
        }

        messageData = await isCommand.run();
        await client.say(messageData.channel, messageData.response)
        return true
    }
}