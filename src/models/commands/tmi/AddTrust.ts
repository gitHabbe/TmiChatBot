import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { JoinedUser } from "../../../interfaces/prisma"
import { ChatUserstate } from "tmi.js"
import { TrustPrisma } from "../../database/TrustPrisma"
import { UserPrisma } from "../../database/UserPrisma"
import { Trust } from "@prisma/client"
import { ChatError } from "../../error/ChatError"
import { TrustLevel } from "../../tmi/TrustLevel"

export class AddTrust implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    private static async addTrust(user: JoinedUser, chatter: ChatUserstate, newTrust: string) {
        const trust = new TrustPrisma(user, chatter)
        return await trust.save(newTrust, newTrust)
    }

    private static async getUser(channel: string): Promise<JoinedUser> {
        const userPrisma = new UserPrisma(channel)
        return await userPrisma.get()
    }

    async run(): Promise<MessageData> {
        const { channel, message, chatter } = this.messageData
        const user: JoinedUser = await AddTrust.getUser(channel)
        this.cannotCreateTrustError(user)
        const newTrust = this.newTrustNotSpecifiedError(message)
        this.alreadyTrustedError(user, newTrust)

        const addTrust = await AddTrust.addTrust(user, chatter, newTrust)
        this.messageData.response = `${addTrust.name} added to trust-list`
        return this.messageData
    }

    private alreadyTrustedError(user: JoinedUser, newTrust: string) {
        const isAlreadyTrusted = user.trusts.find((user: Trust) => {
            return user.name.toUpperCase() === newTrust.toUpperCase()
        })
        if (isAlreadyTrusted) {
            throw new ChatError(`${isAlreadyTrusted.name} is already trusted`)
        }
    }

    private newTrustNotSpecifiedError(message: string) {
        const newTrust = message.split(" ")[1]
        if (!newTrust) throw new ChatError("No user specified")
        return newTrust
    }

    private cannotCreateTrustError(user: JoinedUser) {
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isTrusted()) {
            throw new Error("This user cannot create trust")
        }
    }
}