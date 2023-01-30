import { ICommand } from "../../../interfaces/Command";
import { StringExtract } from "../../StringExtract";
import { Leaderboard } from "../../fetch/Leaderboard";
import {
    ICategoryResponse,
    ICategoryType,
    IGameResponse,
    IGameSearchResponse,
    IGameType,
    IRun
} from "../../../interfaces/speedrun";
import { formatWorldRecord } from "../../../utility/math";
import { FullGame } from "../../../interfaces/prisma";
import { GamePrisma, SpeedrunCategory, SpeedrunGame } from "../../database/GamePrisma";
import { MessageData } from "../../tmi/MessageData";
import { ModuleFamily } from "../../../interfaces/tmi";
import { MessageParser } from "../../tmi/MessageParse";
import { TwitchFetch } from "../../fetch/TwitchTv";
import { SpeedrunCategories } from "../../fetch/DepricatedSpeedrunCom";

export class WorldRecord implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData) {
    }

    async run(): Promise<MessageData> {
        const messageParser = new MessageParser();
        const gameName: string = await messageParser.gameName(this.messageData, 1);
        const gameModel = new GamePrisma(gameName);
        let databaseGame = await gameModel.get();
        const categoryName: string = await messageParser.categoryName(this.messageData, 2);
        if (!databaseGame) {
            const speedrunGame = new SpeedrunGame(gameName);
            const gameList: IGameType[] = await speedrunGame.fetch();
            console.log(gameList);
            const foundGame: IGameType | undefined = gameList.find(iGameType => {
                const isNameCorrect = iGameType.names.international.toUpperCase() === gameName.toUpperCase();
                const isAbbreviationCorrect = iGameType.abbreviation.toUpperCase() === gameName.toUpperCase();
                return isNameCorrect || isAbbreviationCorrect;
            })
            if (gameList.length === 0 || !foundGame) {
                this.messageData.response = `Game ${gameName} not found on SpeedrunDotCom`;
                return this.messageData;
            }
            const speedrunCategory = new SpeedrunCategory(foundGame);
            const categoryList: ICategoryResponse = await speedrunCategory.fetch()
            const validCategoryList = categoryList.data.filter(iCategoryType => {
                return iCategoryType.links.find(link => link.rel === "leaderboard")
            })
            console.log(validCategoryList);
            const gameModel = new GamePrisma(foundGame.names.international);
            const savedGame = await gameModel.save(foundGame, validCategoryList);
        }
        databaseGame = await gameModel.get();
        if (!databaseGame) {
            this.messageData.response = `Game ${gameName} not found on SpeedrunDotCom`;
            return this.messageData;
        }
        const leaderboard = new Leaderboard(databaseGame);
        const fuzzyCategory = leaderboard.fuzzyCategory(categoryName);
        const [ { item: category } ] = fuzzyCategory;
        const worldRecord: IRun = await leaderboard.fetchWorldRecord(category);
        console.log(worldRecord);
        this.messageData.response = await formatWorldRecord(worldRecord, category.name);
        // this.messageData.response = `${gameName} ${categoryName}`

        return this.messageData;
    };
}