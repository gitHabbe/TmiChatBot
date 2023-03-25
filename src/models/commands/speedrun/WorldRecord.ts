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

    async getFullSpeedrunGame(index: number = 1): Promise<FullSpeedrunGame> {
        const messageParser = new MessageParser()
        const gameName: string = await messageParser.gameName(this.messageData, index)
        const gamePrisma = new GamePrisma(gameName)
        let fullSpeedrunGame: FullSpeedrunGame | null = await gamePrisma.get()
        if (!fullSpeedrunGame) {
            const { fetchedGame, validCategories } = await this.fetchFullSpeedrunGame(gameName)
            await gamePrisma.save(fetchedGame, validCategories)
            fullSpeedrunGame = SpeedrunGameData.buildFullSpeedrunGame(fetchedGame, validCategories)
        }
        return fullSpeedrunGame
    }

    private async fetchFullSpeedrunGame(gameName: string): Promise<{ validCategories: Category[]; fetchedGame: SpeedrunGame }> {
        const speedrunGame = new SpeedrunApi(gameName)
        const gameList: SpeedrunGame[] = await speedrunGame.fetch()
        const fetchedGame: SpeedrunGame | undefined = gameList.find(game => {
            const isNameCorrect: boolean = game.international.toUpperCase() === gameName.toUpperCase()
            const isAbbreviationCorrect: boolean = game.abbreviation.toUpperCase() === gameName.toUpperCase()
            return isNameCorrect || isAbbreviationCorrect
        })
        if (!fetchedGame || gameList.length === 0) {
            throw new ChatError(`Game "${gameName}" not found on SpeedrunDotCom`)
        }
        const speedrunCategory = new SpeedrunCategory(fetchedGame)
        const categoryList: SpeedrunResponse<Category[]> = await speedrunCategory.fetch()
        const validCategories: Category[] = categoryList.data.filter(category => {
            return category.links.find(link => link.rel === "leaderboard")
        })
        return { fetchedGame, validCategories }
    }

    private static buildFullSpeedrunGame(foundGame: SpeedrunGame, validCategories: Category[]): FullSpeedrunGame {
        const { links, platforms, twitch, id, international, abbreviation } = foundGame
        return {
            id,
            abbreviation,
            international,
            twitch,
            links,
            categories: validCategories,
            platforms,
        }
    }
}

export class WorldRecord implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.SPEEDRUN;

    constructor(public messageData: MessageData) {}

    async run(): Promise<MessageData> {
        const speedrunGameData = new SpeedrunGameData(this.messageData)
        const index = 1
        const fullSpeedrunGame: FullSpeedrunGame = await speedrunGameData.getFullSpeedrunGame(index)
        const messageParser = new MessageParser()
        const categoryName: string = await messageParser.categoryName(this.messageData, index + 1)
        const leaderboard = new Leaderboard(fullSpeedrunGame);
        const fuzzyCategory = leaderboard.fuzzyCategory(categoryName);
        const [ { item: category } ] = fuzzyCategory;
        const worldRecord: IRun = await leaderboard.fetchWorldRecord(category);
        this.messageData.response = await formatWorldRecord(worldRecord, category.name);
        return this.messageData;
    };
}