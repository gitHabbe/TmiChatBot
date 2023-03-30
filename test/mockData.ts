import { JoinedUser } from "../src/interfaces/prisma"
import { MessageData } from "../src/models/tmi/MessageData"
import { FullSpeedrunGame, SpeedrunGame } from "../src/interfaces/general"
import { Command } from "@prisma/client"

export const commandMockData: Command = {
    id: 1,
    content: "This is the content",
    madeBy: "Made by",
    name: "This is name of command",
    createdAt: new Date(),
    userId: 2,
    updatedAt: new Date()
}


export const messageDataMock = new MessageData("#habbe", {}, "This is a test message");
export const messagePokemonDataMock = new MessageData("#habbe", {}, "!pokemonmove slash");
export const messagePokemonMachineDataMock = new MessageData("#habbe", {}, "!pokemontm TM46");

export const joinedUserMock: JoinedUser = {
    id: 1,
    name: "habbe",
    createdAt: new Date("28-10-2022"),
    updatedAt: new Date("29-10-2022"),
    components: [],
    commands: [],
    settings: [],
    timestamps: [],
    trusts: []
}

export const speedrunGameMock: SpeedrunGame = {
    abbreviation: "dkr",
    id: "9dow9e1p",
    links: [
        {
            rel: "leaderboard",
            uri: "https://www.speedrun.com/api/v1/leaderboards/9dow9e1p/category/q25qqv2o"
        }
    ],
    international: "Diddy Kong Racing",
    twitch: "Diddy Kong Racing",
    platforms: []
}
export const prismaSpeedrunGameMock: FullSpeedrunGame = {
    abbreviation: "dkr",
    id: "9dow9e1p",
    links: [
        {
            rel: "leaderboard",
            uri: "https://www.speedrun.com/api/v1/leaderboards/9dow9e1p/category/q25qqv2o"
        }
    ],
    international: "Diddy Kong Racing",
    twitch: "Diddy Kong Racing",
    categories: [
        {
            id: "q25qqv2o",
            name: "100%",
            links: [
                {
                    rel: "category",
                    uri: "https://www.speedrun.com/api/v1/categories/q25qqv2o"
                }
            ]
        }
    ],
    platforms: []
}

