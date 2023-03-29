import { ICommand } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { JoinedUser } from "../../../interfaces/prisma"
import { UserPrisma } from "../../database/UserPrisma"
import { TrustPrisma } from "../../database/TrustPrisma"

export class NewTrust implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData) {
    }

    private async getUser(channel: string): Promise<JoinedUser> {
        const userPrisma = new UserPrisma(channel)
        return await userPrisma.get()
    }

    async run(): Promise<MessageData> {
        const { channel, message, chatter } = this.messageData
        if (!chatter.username) throw new Error("Creator not specified")
        const newTrust = message.split(" ")[1]
        if (!newTrust) throw new Error("No user specified")
        const user = await this.getUser(channel)
        const trust = new TrustPrisma(user, chatter)
        const addTrust = await trust.save(chatter.username, newTrust)
        this.messageData.response = `${addTrust.name} added to trust-list`

        return this.messageData
    }
}