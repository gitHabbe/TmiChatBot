import { ICommand } from "../../../interfaces/Command"
import { Leaderboard } from "../../fetch/Leaderboard"
import { IRun } from "../../../interfaces/speedrun"
import { formatWorldRecord } from "../../../utility/math"
import { GamePrisma } from "../../database/GamePrisma"
import { MessageData } from "../../tmi/MessageData"
import { ModuleFamily } from "../../../interfaces/tmi"
import { MessageParser } from "../../tmi/MessageParse"
import { SpeedrunApi, SpeedrunCategory } from "../../fetch/SpeedrunCom"
import { Category, FullSpeedrunGame, SpeedrunGame, SpeedrunResponse } from "../../../interfaces/general"
import { ChatError } from "../../error/ChatError"

export class SpeedrunGameData {

    constructor(private messageData: MessageData) {}

    async getFullSpeedrunGame(index: number = 1) {
        const messageParser = new MessageParser()
        const gameName: string = await messageParser.gameName(this.messageData, index)
        const gameModel = new GamePrisma(gameName)
        let fullSpeedrunGame: FullSpeedrunGame | null = await gameModel.get()
        const categoryName: string = await messageParser.categoryName(this.messageData, index + 1)
        if (!fullSpeedrunGame) {
            const { foundGame, validCategories } = await this.fetchFullSpeedrunGame(gameName)
            const gameModel = new GamePrisma(foundGame.international)
            await gameModel.save(foundGame, validCategories)
            fullSpeedrunGame = SpeedrunGameCollection.buildFullSpeedrunGame(foundGame, validCategories)
        }
        return { fullSpeedrunGame, categoryName }
    }

    private async fetchFullSpeedrunGame(gameName: string) {
        const speedrunGame = new SpeedrunApi(gameName)
        const gameList: SpeedrunGame[] = await speedrunGame.fetch()
        const foundGame: SpeedrunGame | undefined = gameList.find(game => {
            const isNameCorrect = game.international.toUpperCase() === gameName.toUpperCase()
            const isAbbreviationCorrect = game.abbreviation.toUpperCase() === gameName.toUpperCase()
            return isNameCorrect || isAbbreviationCorrect
        })
        if (!fetchedGame || gameList.length === 0) {
            throw new ChatError(`Game "${gameName}" not found on SpeedrunDotCom`)
        }
        const speedrunCategory = new SpeedrunCategory(foundGame)
        const categoryList: SpeedrunResponse<Category[]> = await speedrunCategory.fetch()
        const validCategories: Category[] = categoryList.data.filter(category => {
            return category.links.find(link => link.rel === "leaderboard")
        })
        return { foundGame, validCategories }
    }

    private static buildFullSpeedrunGame(foundGame: SpeedrunGame, validCategories: Category[]) {
        return {
            id: foundGame.id,
            abbreviation: foundGame.abbreviation,
            international: foundGame.international,
            twitch: foundGame.twitch,
            links: foundGame.links,
            categories: validCategories,
            platforms: foundGame.platforms,
        }
    }
}

export class WorldRecord implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData) {}

    async run(): Promise<MessageData> {
        const speedrunGameCollection = new SpeedrunGameCollection(this.messageData)
        const { fullSpeedrunGame, categoryName } = await speedrunGameCollection.getFullSpeedrunGame(1)
        const leaderboard = new Leaderboard(fullSpeedrunGame);
        const fuzzyCategory = leaderboard.fuzzyCategory(categoryName);
        const [ { item: category } ] = fuzzyCategory;
        const worldRecord: IRun = await leaderboard.fetchWorldRecord(category);
        this.messageData.response = await formatWorldRecord(worldRecord, category.name);
        return this.messageData;
    };
}