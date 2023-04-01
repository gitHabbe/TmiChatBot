import { ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { PokemonAPI } from "../../fetch/PokemonAPI"
import { MessageData } from "../../tmi/MessageData"
import { MessageParser } from "../../tmi/MessageParse"
import { JoinedUser } from "../../../interfaces/prisma"

export class PokemonMachine implements ICommandUser {
    moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI

    constructor(public messageData: MessageData, public user: JoinedUser, pokeAPI?: PokemonAPI) {
        this.pokeAPI = pokeAPI || new PokemonAPI()
    }

    async run(): Promise<MessageData> {
        const { message } = this.messageData
        const messageParser = new MessageParser()
        const pokemonItem = messageParser.getPokemonMove(message, 1)
        const strings: Record<string, string> = this.pokeAPI.fetchMachine(pokemonItem)
        const recordKey = Object.keys(strings)[0]
        const recordValue = Object.values(strings)[0]
        this.messageData.response = recordKey + ": " + recordValue
        return this.messageData
    }
}