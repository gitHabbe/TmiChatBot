import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { TrustLevel } from "../../tmi/TrustLevel"
import { CommandPrisma } from "../../database/CommandPrisma"
import { ChatError } from "../../error/ChatError"
import { JoinedUser } from "../../../interfaces/prisma"

export class DeleteCommand implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    run = async () => {
        const { channel, message } = this.messageData
        const userPrisma = new UserPrisma(channel)
        const user = await userPrisma.get()
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isStreamer()) {
            throw new Error("Only streamer can delete commands")
        }
        const commandName = message.split(" ")[1]
        const commandPrisma = new CommandPrisma(user)
        const foundCommand = await commandPrisma.find(commandName)
        if (!foundCommand) {
            throw new ChatError(`Command ${commandName} not found`)
        }
        const delCommand = await commandPrisma.remove(commandName)
        this.messageData.response = `Command ${delCommand.name} deleted`

        return this.messageData
    }
}