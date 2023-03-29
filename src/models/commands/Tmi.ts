import { ICommand } from "../../interfaces/Command"
import { UserPrisma } from "../database/UserPrisma"
import { ComponentPrisma } from "../database/ComponentPrisma"
import { MessageData } from "../tmi/MessageData"
import { ModuleFamily } from "../../interfaces/tmi"
import { randomInt } from "../../utility/math"

export class Slots implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.SLOTS

    constructor(public messageData: MessageData) {}

    run = async () => {
        const { channel, message, chatter } = this.messageData;
        const targetComponent = "SLOTS";
        const userPrisma = new UserPrisma(channel);
        const user = await userPrisma.get();
        if (!user) throw new Error(`msg`);
        const component = new ComponentPrisma(user, targetComponent);
        const isEnabled = await component.isEnabled();
        if (!isEnabled) {
            this.messageData.response = `Component ${targetComponent} is not enabled`;
            return this.messageData
        }

        const emoteSelection = [
            "PogChamp",
            "EleGiggle",
            "Jebaited",
            "VoHiYo",
            "SeemsGood",
        ];
        const maxLength = emoteSelection.length;
        const rolls = [
            randomInt(maxLength),
            randomInt(maxLength),
            randomInt(maxLength),
        ];
        const isBingo: boolean = rolls.every((roll) => roll === rolls[0]);
        const gameResult = [
            emoteSelection[rolls[0]],
            emoteSelection[rolls[1]],
            emoteSelection[rolls[2]],
        ];
        const gameResultSentence = gameResult.join(" | ");
        this.messageData.response = gameResultSentence;

        return this.messageData;

    }
}

