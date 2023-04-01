import { ChatUserstate } from "tmi.js"
import { ModuleFamily } from "../../interfaces/tmi"
import { StandardCommandMap } from "../commands/StandardCommandMap"
import { ICommandUser } from "../../interfaces/Command"
import { MessageParser } from "./MessageParse"
import { MessageData } from "./MessageData"
import { UserPrisma } from "../database/UserPrisma"
import { ClientSingleton } from "./ClientSingleton"
import { JoinedUser } from "../../interfaces/prisma"
import { Component, Setting } from "@prisma/client"
import { LinkParser } from "../fetch/SocialMedia"
import { ChatError } from "../error/ChatError"
import { CustomCommand } from "../commands/CustomCommand"


class StandardCommandAction {
    constructor(private messageData: MessageData, private joinedUser: JoinedUser) {}

    async call() {
        const userPrefix = this.joinedUser.settings.find((setting: Setting) => {
            return setting.type === "prefix"
        })
        const prefix: string = userPrefix?.value || "!"
        const standardCommandMap = new StandardCommandMap(this.messageData)
        const messageParser: MessageParser = new MessageParser()
        const commandName: string = messageParser.getCommandName(this.messageData.message, prefix)
        const StandardCommand = standardCommandMap.get(commandName)
        if (!StandardCommand) {
            return ""
        }

        const standardCommand: ICommandUser = new StandardCommand(this.messageData, this.joinedUser)
        const componentProtected = standardCommand.moduleFamily === ModuleFamily.PROTECTED
        if (componentProtected) {
            const commandData = await standardCommand.run()
            return commandData.response
        }

        const chatter: string | undefined = this.messageData.chatter.username?.toUpperCase()
        const streamer: string = this.messageData.channel.toUpperCase()
        const familyEnabled = this.isFamilyEnabled(standardCommand.moduleFamily)
        if (!familyEnabled && streamer === chatter) {
            return `Command: ${commandName} is not enabled. Use "!toggle ${standardCommand.moduleFamily}"`
        }

        const commandData = await standardCommand.run()
        return commandData.response

    }

    private isFamilyEnabled(moduleFamily: ModuleFamily) {
        return this.joinedUser.components.find((userComponent: Component) => {
            const isCommand = userComponent.name.toUpperCase() === moduleFamily.toUpperCase();
            if (!isCommand) return false
            return userComponent.enabled
        })
    }
}

class CustomCommandAction {
    constructor(private messageData: MessageData, private joinedUser: JoinedUser) {}

    async call() {
        const customCommand = new CustomCommand(this.messageData, this.joinedUser)
        const customCommandContent = await customCommand.run()
        return customCommandContent.response || ""
    }
}

class SocialMediaAction {
    constructor(private messageData: MessageData, private joinedUser: JoinedUser) {}

    async call() {
        const { message } = this.messageData;
        const linkParser = new LinkParser(message)
        return await linkParser.getLinkMessage()
    }
}

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
                new CustomCommandAction(messageData, joinedUser),
                new StandardCommandAction(messageData, joinedUser),
                new SocialMediaAction(messageData, joinedUser)
            ]

            for (let commandsListElement of commandsList) {
                const commandResponse = await commandsListElement.call()
                if (commandResponse) {
                    client.say(channel, commandResponse)
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

    async onJoin(ircChannel: string, username: string, self: boolean) {
        console.log(`I HAVE JOINED ${ircChannel}`)
        const channel: string = ircChannel.slice(1)
        const userModel = new UserPrisma(channel)
        await userModel.get()
    }
}