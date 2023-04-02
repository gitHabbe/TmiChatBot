import { ChatUserstate } from "tmi.js"
import { MessageData } from "./MessageData"
import { UserPrisma } from "../database/UserPrisma"
import { ClientSingleton } from "./ClientSingleton"
import { JoinedUser } from "../../interfaces/prisma"
import { ChatError } from "../error/ChatError"
import { StandardCommandAction } from "./StandardCommandAction"
import { CustomCommandAction } from "./CustomCommandAction"
import { SocialMediaAction } from "./SocialMediaAction"


export class ChatEvent {
    async onMessage(ircChannel: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
        if (self) return // Bot self message;
        const channel: string = ircChannel.slice(1)
        const messageData: MessageData = new MessageData(channel, chatter, message)
        const userModel = new UserPrisma(messageData.channel)
        const joinedUser: JoinedUser = await userModel.get()
        const client = ClientSingleton.getInstance().get()
        const commandsList = [
            new CustomCommandAction(messageData, joinedUser),
            new StandardCommandAction(messageData, joinedUser),
            new SocialMediaAction(messageData, joinedUser)
        ]

        try {
            for (let commandActionObject of commandsList) {
                const commandResponse = await commandActionObject.call()
                if (commandResponse) {
                    client.say(channel, commandResponse)
                    return
                }
            }
        }
        catch (error) {
            if (error instanceof ChatError) {
                client.say(channel, error.message)
            }
            else if (error instanceof Error) {
                console.log(`NON-CHAT-MSG: ${error.message}`)
            }
        }
    }

    async onJoin(ircChannel: string, username: string, self: boolean) {
        console.log(`I HAVE JOINED ${ircChannel}`)
        const channel: string = ircChannel.slice(1)
        const userModel = new UserPrisma(channel)
        await userModel.get()
    }
}