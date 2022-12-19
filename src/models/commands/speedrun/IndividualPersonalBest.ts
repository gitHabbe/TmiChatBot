import { ICommand } from "../../../interfaces/Command";
import { MessageData } from "../../MessageData";
import { StringExtract } from "../../StringExtract";
import { InduvidualLevelSupport } from "../../../interfaces/speedrun";
import { IndividualPersonalBestDiddyKongRacing } from "./IndividualPersonalBestDiddyKongRacing";

export class IndividualPersonalBest implements ICommand {
    constructor(public messageData: MessageData) {
    }

    run = async () => {
        const stringExtract = new StringExtract(this.messageData);
        const game: string = await stringExtract.game();
        switch (game.toUpperCase()) {
            case InduvidualLevelSupport.DKR:
                return new IndividualPersonalBestDiddyKongRacing(this.messageData).run();
            default:
                throw Error(`${game} doesn't support !ilpb`);
        }
    };
}