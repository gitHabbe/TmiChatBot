import { MessageData } from "./MessageData"
import { JoinedUser } from "../../interfaces/prisma"
import { Trust } from "@prisma/client"

export class TrustLevel {
    constructor(private messageData: MessageData, private user: JoinedUser) {
    }

    isStreamer(): boolean {
        const { channel, chatter } = this.messageData
        return channel.toLowerCase() === chatter.username?.toLowerCase()
    }

    isTrusted(): boolean {
        const { chatter } = this.messageData
        const isTrusted = this.user.trusts.find((trust: Trust) => trust.name.toLowerCase() === chatter.username?.toLowerCase())
        return !!(isTrusted || chatter.mod || this.isStreamer())
    }
}