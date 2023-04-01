import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { TimestampPrisma } from "../../database/TimestampPrisma"
import { JoinedUser } from "../../../interfaces/prisma"
import { ChatError } from "../../error/ChatError"
import { TrustLevel } from "../../tmi/TrustLevel"

export class DeleteTimestamp implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel)
        const user = await userPrisma.get()
        if (!user) throw new Error(`User not found`)
        return user
    }

    run = async () => {
        const { channel, message } = this.messageData
        const user = await this.getUser(channel)
        const timestampName: string = message.split(" ")[1]
        this.chatterNotTrustedError(user)
        DeleteTimestamp.noTimestampSpecifiedError(message, timestampName)
        await this.timestampAlreadyExistsError(user, timestampName)

        const timestampPrisma = new TimestampPrisma(user)
        const deleteTimestamp = await timestampPrisma.remove(timestampName.toLowerCase())
        this.messageData.response = `Timestamp ${deleteTimestamp.name} deleted`

        return this.messageData
    }

    private async timestampAlreadyExistsError(user: JoinedUser, timestampName: string) {
        const foundTimestamp = user.timestamps.find((timestamp) => {
            return timestamp.name.toLowerCase() === timestampName.toUpperCase()
        })
        if (foundTimestamp) throw new ChatError(`Timestamp ${foundTimestamp.name} doesn't exist`)
    }

    private chatterNotTrustedError(user: JoinedUser) {
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error("This user cannot delete timestamps")
        }
    }

    private static noTimestampSpecifiedError(message: string, targetTimestamp: string) {
        if (!targetTimestamp) {
            throw new ChatError("No timestampPrisma specified")
        }
        return targetTimestamp
    }
}