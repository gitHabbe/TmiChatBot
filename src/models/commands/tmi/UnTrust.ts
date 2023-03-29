import { ICommand } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { JoinedUser } from "../../../interfaces/prisma"
import { TrustPrisma } from "../../database/TrustPrisma"

export class UnTrust implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {
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
        const deleteTrust = message.split(" ")[1]
        if (!deleteTrust) throw new Error("No user specified")
        const user: JoinedUser = await this.getUser(channel)
        const trustPrisma = new TrustPrisma(user, chatter)
        const trustee = message.split(" ")[1]
        try {
            await trustPrisma.delete(channel, trustee, chatter.username)
            this.messageData.response = `${trustee} removed from trust-list`
        } catch (error) {
            if (error instanceof Error) {
                this.messageData.response = `${error.message}`
            }
        }

        return this.messageData
    }
}