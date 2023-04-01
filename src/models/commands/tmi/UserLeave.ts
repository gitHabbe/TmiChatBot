import { ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily, TmiClient } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { JsonChannels } from "../../JsonArrayFile"
import { UserPrisma } from "../../database/UserPrisma"
import { ClientSingleton } from "../../tmi/ClientSingleton"
import { JoinedUser } from "../../../interfaces/prisma"

export class UserLeave implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    run = async () => {
        const { channel, chatter } = this.messageData
        if (!chatter.username) {
            throw new Error("User not found")
        }
        if (channel.toLowerCase() !== chatter.username?.toLowerCase()) {
            this.messageData.response = `Only streamer can remove me`
            return this.messageData
        }
        const jsonUser = new JsonChannels("private/", "tmi_channels")
        const jsonData: string[] = jsonUser.data()
        const isInJson = jsonData.find((jsonChanel: string) => {
            return channel.toLowerCase() === jsonChanel.toLowerCase()
        })
        if (!isInJson) {
            this.messageData.response = `I am not in your chat`
            return this.messageData
        }
        const user = new UserPrisma(chatter.username)
        const deleteUser = await user.get()
        await user.delete()
        if (user) {
            const jsonUser = new JsonChannels("private/", "tmi_channels")
            jsonUser.remove(deleteUser.name)
            const client: TmiClient = ClientSingleton.getInstance().get()
            await client.part(deleteUser.name)
        }
        this.messageData.response = `I have left channel: ${deleteUser.name}`

        return this.messageData
    }
}