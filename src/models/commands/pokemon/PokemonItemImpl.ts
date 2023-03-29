import { ICommand } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { PokemonAPI } from "../../fetch/PokemonAPI"
import { MessageData } from "../../tmi/MessageData"
import { MessageParser } from "../../tmi/MessageParse"
import { PokemonItem } from "../../../interfaces/pokemon"

export class PokemonItemImpl implements ICommand {
    moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI

    constructor(public messageData: MessageData, pokeAPI?: PokemonAPI) {
        this.pokeAPI = pokeAPI || new PokemonAPI()
    }

    async run(): Promise<MessageData> {
        const { message } = this.messageData
        const messageParser = new MessageParser()
        const pokemonItem = messageParser.getPokemonMove(message, 1)
        const pokemonItemResponse = await this.pokeAPI.fetchItem(pokemonItem)
        this.messageData.response = PokemonItemImpl.itemDescription(pokemonItemResponse)
        return this.messageData
    }


    private static itemDescription(pokemonItemResponse: PokemonItem): string {
        let itemData = ""
        itemData += pokemonItemResponse.names[0].name
        if (pokemonItemResponse.cost) {
            itemData += `[${pokemonItemResponse.cost}]`
        }
        const itemDescription = pokemonItemResponse.effect_entries.effect.split(":")[1]
        itemData += `: ${itemDescription.trim()}`
        return itemData
    }
}