import { ChatUserstate } from "tmi.js"
import { ModuleFamily } from "../../interfaces/tmi"
import { StandardCommandMap } from "../commands/StandardCommandMap"
import { ICommand } from "../../interfaces/Command"
import { MessageParser } from "./MessageParse"
import { MessageData } from "./MessageData"
import { UserPrisma } from "../database/UserPrisma"
import { ClientSingleton } from "./ClientSingleton"
import { JoinedUser } from "../../interfaces/prisma"
import { Command, Component } from "@prisma/client"
import { ComponentPrisma } from "../database/ComponentPrisma"
import { LinkParser } from "../fetch/SocialMedia"
import { ChatError } from "../error/ChatError"


export class ChatEvent {
    async onMessage(ircChannel: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
        if (self) return // Bot self message;
        const channel: string = ircChannel.slice(1)
        const messageData: MessageData = new MessageData(channel, chatter, message)
        const userModel = new UserPrisma(messageData.channel)
        const joinedUser: JoinedUser = await userModel.get()
        const client = ClientSingleton.getInstance().get()

        try {
            const customCommandResponse: string = await ChatEvent.customCommandAction(message, joinedUser)
            if (customCommandResponse !== "") {
                client.say(channel, customCommandResponse)
                return
            }

            const standardCommandResponse: string = await ChatEvent.standardCommandAction(messageData, joinedUser)
            if (standardCommandResponse !== "") {
                client.say(channel, standardCommandResponse)
                return
            }

            const socialCommandResponse = await ChatEvent.socialCommandAction(messageData)
            if (socialCommandResponse) {
                client.say(channel, socialCommandResponse)
                return
            }
        }
        catch (error) {
            if (error instanceof ChatError) {
                client.say(channel, error.message)
            }
            else if (error instanceof Error) {}
        }
    }

    private static async customCommandAction(message: string, joinedUser: JoinedUser): Promise<string> {
        const isCustomCommand: Command[] = joinedUser.commands.filter((command: Command) => {
            return command.name === message
        })
        if (isCustomCommand.length > 0) {
            return isCustomCommand[0].content
        }
        return ""
    }

    private static async standardCommandAction(messageData: MessageData, joinedUser: JoinedUser): Promise<string> {
        const standardCommandMap = new StandardCommandMap(messageData)
        const messageParser: MessageParser = new MessageParser()
        const commandName: string = messageParser.getCommandName(messageData.message)
        const command: ICommand = standardCommandMap.get(commandName)
        const command: ICommand | undefined = standardCommandMap.get(commandName)
        if (!command) {
            return ""
        }

        const isProtected = command.moduleFamily === ModuleFamily.PROTECTED
        if (isProtected) {
            const commandData = await command.run()
            return commandData.response
        }

        const chatter: string | undefined = messageData.chatter.username?.toUpperCase()
        const streamer: string = messageData.channel.toUpperCase()
        const componentPrisma = new ComponentPrisma(joinedUser, messageData.channel)
        const isComponentEnabled: Component | undefined = componentPrisma.isFamilyEnabled(command.moduleFamily)
        if (!isComponentEnabled && streamer === chatter) {
            return `Command: ${commandName} is not enabled. Use "!toggle ${command.moduleFamily}"`
        }

        const commandData = await command.run()
        return commandData.response
    }

    private static async socialCommandAction(messageData: MessageData) {
        const { message } = messageData;
        const linkParser = new LinkParser(message)
        return await linkParser.matchRegex()
    }

    async onJoin(ircChannel: string, username: string, self: boolean) {
        console.log(`I HAVE JOINED ${ircChannel}`)
        const channel: string = ircChannel.slice(1)
        const userModel = new UserPrisma(channel)
        await userModel.get()
    }
}