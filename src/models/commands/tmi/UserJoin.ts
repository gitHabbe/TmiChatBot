import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { JsonChannels } from "../../JsonArrayFile"
import { UserPrisma } from "../../database/UserPrisma"
import { ClientSingleton } from "../../tmi/ClientSingleton"
import { JoinedUser } from "../../../interfaces/prisma"

export class UserJoin implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    async run() {
        const { channel, chatter } = this.messageData
        const botName = process.env.TWITCH_USERNAME
        if (channel !== botName) {
            this.messageData.response = `!join only works in ${botName}'s channel`
            return this.messageData
        }
        if (!chatter.username) {
            this.messageData.response = "User not found"
            return this.messageData
        }

        const jsonUser = new JsonChannels("private/", "tmi_channels")
        const isInJson = jsonUser.data().some((channel: string) => {
            return channel.toLowerCase() === chatter.username?.toLowerCase()
        })
        if (isInJson) {
            this.messageData.response = "I am already in your chat"
            return this.messageData
        }

        const user = new UserPrisma(chatter.username)
        const newPrismaUser = await user.get()

        if (newPrismaUser) {
            jsonUser.add(newPrismaUser.name)
            const client = ClientSingleton.getInstance().client
            await client.join(newPrismaUser.name)
        }
        this.messageData.response = `I have joined channel: ${newPrismaUser.name}`

        return this.messageData
    }
}