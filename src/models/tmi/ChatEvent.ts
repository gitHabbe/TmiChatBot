import { ChatUserstate } from "tmi.js";
import { ModuleFamily } from "../../interfaces/tmi";
import { CommandList, StandardCommandList } from "../commands/StandardCommandList";
import { ICommand } from "../../interfaces/Command";
import { MessageParser } from "./MessageParse";
import { MessageData } from "./MessageData";
import { UserPrisma } from "../database/UserPrisma";
import { ClientSingleton } from "./ClientSingleton";
import { JoinedUser } from "../../interfaces/prisma";
import { Command, Component } from "@prisma/client";
import { ComponentPrisma } from "../database/ComponentPrisma";

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
        const userModel: UserPrisma = new UserPrisma(channel);
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
        const userModel = new UserPrisma(channel);
        await userModel.get();
    }

    private static async standardCommandAction(messageData: MessageData): Promise<boolean> {
        const messageParser: MessageParser = new MessageParser();
        const commandName: string = messageParser.getCommandName(messageData.message);
        const commandList: CommandList = new StandardCommandList(messageData);
        const command: ICommand | undefined = commandList.get(commandName);
        if (!command) return false;

        const client = ClientSingleton.getInstance().get();
        const isProtected = command.moduleFamily === ModuleFamily.PROTECTED;
        if (isProtected) {
            const commandResponse: MessageData = await command.run();
            await client.say(messageData.channel, commandResponse.response)
            return true
        }

        const chatter: string | undefined = messageData.chatter.username?.toUpperCase();
        const streamer: string = messageData.channel.toUpperCase();
        const userModel = new UserPrisma(messageData.channel);
        const joinedUser: JoinedUser = await userModel.get();
        const componentPrisma = new ComponentPrisma(joinedUser, messageData.channel);
        const isComponentEnabled: Component | undefined = componentPrisma.isFamilyEnabled(command.moduleFamily);
        if (!isComponentEnabled) {
            if (streamer === chatter) {
                await client.say(messageData.channel, `Command: ${commandName} is not enabled. Use "!toggle ${command.moduleFamily}"`)
                return true
            } else {
                return false
            }
        }

        messageData = await command.run();
        await client.say(messageData.channel, messageData.response)
        return true
    }
}