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
import { LinkParser, TwitterLink } from "../fetch/SocialMedia"


export class ChatEvent {
    async onMessage(ircChannel: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
        if (self) return // Bot self message;
        const channel: string = ircChannel.slice(1)
        const messageData: MessageData = new MessageData(channel, chatter, message)
        const userModel = new UserPrisma(messageData.channel)
        const joinedUser: JoinedUser = await userModel.get()


        const client = ClientSingleton.getInstance().get()
        const customCommandResponse: string = await ChatEvent.customCommandAction(channel, message)
        if (customCommandResponse !== "") {
            client.say(channel, customCommandResponse)
            return
        }

        const standardCommandResponse: string = await ChatEvent.standardCommandAction(messageData)
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

    private static async customCommandAction(channel: string, message: string): Promise<string> {
        const userModel: UserPrisma = new UserPrisma(channel)
        const joinedUser: JoinedUser = await userModel.get()
        const isCustomCommand: Command[] = joinedUser.commands.filter((command: Command) => {
            return command.name === message
        })
        if (isCustomCommand.length > 0) {
            return isCustomCommand[0].content
        }
        return ""
    }

    private static async standardCommandAction(messageDataParam: MessageData): Promise<string> {
        let messageData = messageDataParam
        const standardCommandMap = new StandardCommandMap(messageData)
        const messageParser: MessageParser = new MessageParser()
        const commandName: string = messageParser.getCommandName(messageData.message)
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
        const userModel = new UserPrisma(messageData.channel)
        const joinedUser: JoinedUser = await userModel.get()
        const componentPrisma = new ComponentPrisma(joinedUser, messageData.channel)
        const isComponentEnabled: Component | undefined = componentPrisma.isFamilyEnabled(command.moduleFamily)
        if (!isComponentEnabled) {
            if (streamer === chatter) {
                return `Command: ${commandName} is not enabled. Use "!toggle ${command.moduleFamily}"`
            } else {
                return ""
            }
        }

        const commandData = await command.run()
        return commandData.response
    }

    async onJoin(ircChannel: string, username: string, self: boolean) {
        console.log(`I HAVE JOINED ${ircChannel}`)
        const channel: string = ircChannel.slice(1)
        const userModel = new UserPrisma(channel)
        await userModel.get()
    }

    private static async socialCommandAction(messageData: MessageData) {
        const { message } = messageData;
        const linkParser = new LinkParser(message)
        return await linkParser.matchRegex()
    }
}