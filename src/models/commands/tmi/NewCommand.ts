import { ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { TrustLevel } from "../../tmi/TrustLevel"
import { Command } from "@prisma/client"
import { ChatError } from "../../error/ChatError"
import { CommandPrisma } from "../../database/CommandPrisma"
import { JoinedUser } from "../../../interfaces/prisma"

export class NewCommand implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel)
        const user = await userPrisma.get()
        if (!user) throw new Error(`User not found`)
        return user
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData
        if (!chatter.username) throw new Error("Creator not specified")
        const user = await this.getUser(channel)
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error("This user cannot create command")
        }
        const commandName = message.split(" ")[1]
        const commandContent = message.split(" ").slice(2).join(" ")
        const existingCommand = user.commands.find((command: Command) => {
            return command.name.toUpperCase() === commandName.toUpperCase()
        })
        if (existingCommand) {
            throw new ChatError(`${existingCommand.name} already exists`)
        }
        const commandPrisma = new CommandPrisma(user)
        const command = await commandPrisma.add(
            commandName,
            commandContent,
            chatter.username
        )
        this.messageData.response = `Command ${command.name} created`


        return this.messageData
    }
}