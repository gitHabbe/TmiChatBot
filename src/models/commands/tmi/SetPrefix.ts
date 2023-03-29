import { ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageData } from "../../tmi/MessageData"
import { JoinedUser } from "../../../interfaces/prisma"
import { TrustLevel } from "../../tmi/TrustLevel"
import { SettingPrisma } from "../../database/SettingPrisma"

export class SetPrefix implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.PROTECTED

    constructor(public messageData: MessageData, public user: JoinedUser) {
    }

    async run(): Promise<MessageData> {
        const { channel, chatter } = this.messageData
        const trustLevel = new TrustLevel(this.messageData, this.user)
        if (!trustLevel.isStreamer()) {
            throw new Error("Only streamer can change prefix")
        }
        const settingPrisma = new SettingPrisma(this.user)
        let updatedPrefix
        const newPrefix = this.messageData.message.split(" ")[1]?.slice(0, 1)
        for (let setting of this.user.settings) {
            if (setting.type === "prefix") {
                if (newPrefix === "!" || !newPrefix) {
                    updatedPrefix = await settingPrisma.delete(setting.id)
                    this.messageData.response = `Command prefix changed to "!"`
                    return this.messageData
                }
                updatedPrefix = await settingPrisma.update(setting.id, "prefix", newPrefix)
                this.messageData.response = `CCommand prefix changed to "${updatedPrefix.value}"`
                return this.messageData
            }
        }
        if (!updatedPrefix) {
            await settingPrisma.add("prefix", newPrefix)
            this.messageData.response = `CCCommand prefix changed to "${newPrefix}"`
        }
        return this.messageData
    }
}