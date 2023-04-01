import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { TrustLevel } from "../../tmi/TrustLevel"
import { ChatError } from "../../error/ChatError"
import { ComponentPrisma } from "../../database/ComponentPrisma"
import { JoinedUser } from "../../../interfaces/prisma"

export class ToggleComponent implements ICommandUser {
    public moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    private async getUser(channel: string) {
        const userPrisma = new UserPrisma(channel)
        const user = await userPrisma.get()
        if (!user) throw new Error(`msg`)
        return user
    }

    async run(): Promise<MessageData> {
        const { channel, message } = this.messageData
        const user = await this.getUser(channel)
        const trustLevel = new TrustLevel(this.messageData, user)
        if (!trustLevel.isStreamer()) {
            throw new Error("Only streamer can toggle components")
        }
        const targetComponent = message.split(" ")[1].toUpperCase()
        const isModuleFamily = targetComponent in ModuleFamily
        if (!isModuleFamily) {
            throw new ChatError(`${targetComponent} is not a valid component`)
        }
        const component = new ComponentPrisma(user, targetComponent)
        await component.toggle()
        const componentStatus =
            (await component.isEnabled()) === true ? "Enabled" : "Disabled"
        this.messageData.response = `Component ${targetComponent} is now: ${componentStatus}`

        return this.messageData

    }
}