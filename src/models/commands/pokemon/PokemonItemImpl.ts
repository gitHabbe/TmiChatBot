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
        let itemData1 = pokemonItemResponse.names.find(names => names.language.name === "en")
        itemData += itemData1?.name
        if (pokemonItemResponse.cost) {
            itemData += `[${pokemonItemResponse.cost}]`
        }
        const includes = pokemonItemResponse.effect_entries[0].effect.includes(":")
        let longText = ""
        if (includes) {
            longText = pokemonItemResponse.effect_entries[0].effect.split(":")[1].trim()
        }
        if (pokemonItemResponse.effect_entries[0].short_effect.length > longText.length) {
            itemData += `: ${pokemonItemResponse.effect_entries[0].short_effect}`
        } else {
            itemData += `: ${longText}`
        }
        // itemData += `: ${itemDescription.trim()}`
        return itemData
    }
}