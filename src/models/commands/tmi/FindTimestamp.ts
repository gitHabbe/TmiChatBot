import { ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { TrustLevel } from "../../tmi/TrustLevel"
import { TimestampPrisma } from "../../database/TimestampPrisma"
import { ChatError } from "../../error/ChatError"
import { JoinedUser } from "../../../interfaces/prisma"

export class FindTimestamp implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.TIMESTAMP

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    private getUser = async (channel: string) => {
        const userPrisma = new UserPrisma(channel)
        const user = await userPrisma.get()
        if (!user) throw new Error(`msg`)
        return user
    }

    run = async () => {
        const { channel, message, chatter } = this.messageData
        const user = await this.getUser(channel)
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error(`This user cannot find timestamps`)
        }
        const timestampPrisma = new TimestampPrisma(user)
        const targetTimestamp: string = message.split(" ")[1]
        console.log("targetTimestamp:", targetTimestamp)
        if (targetTimestamp === undefined) {
            const allTimestamps = await timestampPrisma.findAll()
            console.log("~ allTimestamps", allTimestamps)
            const timestampsList = allTimestamps
                .map((timestamp) => {
                    return timestamp.name
                })
                .join(", ")
            this.messageData.response = `Timestamps: ${timestampsList}`
            return this.messageData
        }
        const foundTimestamp = await timestampPrisma.find(targetTimestamp)
        if (!foundTimestamp) throw new ChatError(`Timestamp: ${targetTimestamp} not found. Use "!findts" to list all`)
        const backtrackLength = 90
        const { name, url, timestamp } = foundTimestamp
        this.messageData.response = `${name}: ${url}?t=${timestamp - backtrackLength}s`

        return this.messageData
    }
}