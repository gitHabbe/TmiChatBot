import { MessageData } from "./MessageData"
import { JoinedUser } from "../../interfaces/prisma"
import { CustomCommand } from "../commands/CustomCommand"

export class CustomCommandAction {
    constructor(private messageData: MessageData, private joinedUser: JoinedUser) {}

    async call() {
        const customCommand = new CustomCommand(this.messageData, this.joinedUser)
        const customCommandContent = await customCommand.run()
        return customCommandContent.response || ""
    }
}