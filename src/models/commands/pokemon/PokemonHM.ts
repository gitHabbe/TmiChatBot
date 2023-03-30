import { ICommand } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { PokemonAPI } from "../../fetch/PokemonAPI"
import { MessageData } from "../../tmi/MessageData"
import { MessageParser } from "../../tmi/MessageParse"

export class PokemonMachine implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI

    constructor(public messageData: MessageData, pokeAPI?: PokemonAPI) {
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