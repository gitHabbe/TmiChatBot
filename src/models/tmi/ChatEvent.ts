import { ChatUserstate } from "tmi.js"
import { ModuleFamily } from "../../interfaces/tmi"
import { StandardCommandMap } from "../commands/StandardCommandMap"
import { ICommand } from "../../interfaces/Command"
import { MessageParser } from "./MessageParse"
import { MessageData } from "./MessageData"
import { UserPrisma } from "../database/UserPrisma"
import { ClientSingleton } from "./ClientSingleton"
import { JoinedUser } from "../../interfaces/prisma"
import { Command, Component, Setting } from "@prisma/client"
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
            const commandsList = [
                await ChatEvent.customCommandAction(message, joinedUser),
                await ChatEvent.standardCommandAction(messageData, joinedUser),
                await ChatEvent.socialCommandAction(messageData)
            ]
            for (let commandsListElement of commandsList) {
                if (commandsListElement) {
                    client.say(channel, commandsListElement)
                    return
                }
            }
        }
        catch (error) {
            if (error instanceof ChatError) {
                client.say(channel, error.message)
            }
            else if (error instanceof Error) {
                console.log(`NON-CHAT-MSG: ${error.message}`)
            }
        }
    }

    private static async customCommandAction(messageData: MessageData, joinedUser: JoinedUser): Promise<string> {
        const customCommand = new CustomCommand(messageData, joinedUser)
        const returnData = await customCommand.run()
        return returnData.response || ""
    }

    private static async standardCommandAction(messageData: MessageData, joinedUser: JoinedUser): Promise<string> {
        const userPrefix = joinedUser.settings.find((setting: Setting) => {
            return setting.type === "prefix"
        })
        const prefix: string = userPrefix?.value || "!"
        const standardCommandMap = new StandardCommandMap(messageData, joinedUser)
        const messageParser: MessageParser = new MessageParser()
        const commandName: string = messageParser.getCommandName(messageData.message, prefix)
        const command: ICommand | undefined = standardCommandMap.get(commandName)
        if (!command) {
            return ""
        }

        const componentProtected = command.moduleFamily === ModuleFamily.PROTECTED
        if (componentProtected) {
            const commandData = await command.run()
            return commandData.response
        }

        const chatter: string | undefined = messageData.chatter.username?.toUpperCase()
        const streamer: string = messageData.channel.toUpperCase()
        const familyEnabled = ChatEvent.isFamilyEnabled(joinedUser, command.moduleFamily)
        if (!familyEnabled && streamer === chatter) {
            return `Command: ${commandName} is not enabled. Use "!toggle ${command.moduleFamily}"`
        }

        const commandData = await command.run()
        return commandData.response
    }

    private static isFamilyEnabled(joinedUser: JoinedUser, moduleFamily: ModuleFamily) {
        return joinedUser.components.find((userComponent: Component) => {
            const isCommand = userComponent.name.toUpperCase() === moduleFamily.toUpperCase();
            if (!isCommand) return false
            return userComponent.enabled
        })
    }

    private static async socialCommandAction(messageData: MessageData): Promise<string> {
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