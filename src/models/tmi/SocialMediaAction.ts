import { MessageData } from "./MessageData"
import { JoinedUser } from "../../interfaces/prisma"
import { LinkParser } from "../fetch/SocialMedia"

export class SocialMediaAction {
    constructor(private messageData: MessageData, private joinedUser: JoinedUser) {}

    async call() {
        const { message } = this.messageData
        const linkParser = new LinkParser(message)
        return await linkParser.getLinkMessage()
    }
}