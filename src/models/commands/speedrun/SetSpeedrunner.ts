import { ICommandUser } from "../../../interfaces/Command"
import { UserPrisma } from "../../database/UserPrisma"
import { SettingPrisma } from "../../database/SettingPrisma"
import { MessageData } from "../../tmi/MessageData"
import { ModuleFamily } from "../../../interfaces/tmi"
import { JoinedUser } from "../../../interfaces/prisma"

export class SetSpeedrunner implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData, public user: JoinedUser) {}

    private async getUser(channel: string) {
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`User not found`);
        return user;
    }

    async run(): Promise<MessageData> {
        const { channel, message } = this.messageData;
        const newUsername: string | undefined = message.split(" ")[1];
        const user = await this.getUser(channel);
        const setting = new SettingPrisma(user);
        const settingType = "SpeedrunName";
        const isSetting = await setting.find(settingType);
        let newSetting;
        if (isSetting) {
            if (newUsername === undefined) {
                newSetting = await setting.delete(isSetting.id);
                this.messageData.response = `SpeedrunDotCom username restored to: ${channel}`;
                return this.messageData;
            }
            newSetting = await setting.update(isSetting.id, settingType, newUsername);
        } else {
            if (newUsername === undefined) {
                this.messageData.response = `No name specified.`;
                return this.messageData;
            }
            newSetting = await setting.add(settingType, newUsername)
        }
        this.messageData.response = `SpeedrunDotCom username set to: ${newSetting.value}`;

        return this.messageData;
    }
}