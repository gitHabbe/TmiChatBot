import { ICommand } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { PokemonAPI } from "../../fetch/PokemonAPI"
import { MessageData } from "../../tmi/MessageData"
import { MessageParser } from "../../tmi/MessageParse"
import { PokemonMove } from "../../../interfaces/pokemon"

export class PokemonMoveImpl implements ICommand {
    public moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI

    constructor(public messageData: MessageData, pokeAPI?: PokemonAPI) {
        this.pokeAPI = pokeAPI || new PokemonAPI()
    }

    async run(): Promise<MessageData> {
        const { message } = this.messageData
        const messageParser = new MessageParser()
        const pokemonMoveName = messageParser.getPokemonMove(message, 1)
        const pokemonMove: PokemonMove = await this.pokeAPI.fetchMove(pokemonMoveName)
        const { pp, names, accuracy, name, power, meta, type } = pokemonMove
        const pokemonName = names.find(hit => hit.language.name === 'en')?.name || name
        let response = ""
        response += `${this.toTitleCase(pokemonName)}`
        response += ` [${this.toTitleCase(type.name)}] |`
        response += ` PWR:${power}`
        response += ` PP:${pp}`
        response += ` ACC:${accuracy}`
        const { crit_rate, ailment_chance, flinch_chance, ailment } = meta
        if (crit_rate) {
            response += ` Crit: ${crit_rate}`
        }
        if (flinch_chance) {
            response += ` Flinch: ${flinch_chance}`
        }
        if (ailment_chance) {
            response += ` | Proc: ${this.toTitleCase(ailment.name)}(${ailment_chance}%)`
        }

        this.messageData.response = response
        return this.messageData
    }

    private toTitleCase(str: string) {
        return str.toLowerCase().split(' ').map(function (word) {
            return (word.charAt(0).toUpperCase() + word.slice(1))
        }).join(' ')
    }

}