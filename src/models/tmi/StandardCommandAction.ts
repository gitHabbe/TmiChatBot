import { MessageData } from "./MessageData"
import { JoinedUser } from "../../interfaces/prisma"
import { Component, Setting } from "@prisma/client"
import { StandardCommandMap } from "../commands/StandardCommandMap"
import { MessageParser } from "./MessageParse"
import { ICommandUser } from "../../interfaces/Command"
import { ModuleFamily } from "../../interfaces/tmi"

export class StandardCommandAction {
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
            const isCommand = userComponent.name.toUpperCase() === moduleFamily.toUpperCase()
            if (!isCommand) return false
            return userComponent.enabled
        })
    }
}