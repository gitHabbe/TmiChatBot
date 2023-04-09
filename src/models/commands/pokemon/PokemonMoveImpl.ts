import { ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { PokemonAPI } from "../../fetch/PokemonAPI"
import { MessageData } from "../../tmi/MessageData"
import { MessageParser } from "../../tmi/MessageParse"
import { PokemonMove } from "../../../interfaces/pokemon"
import { JoinedUser } from "../../../interfaces/prisma"

export class PokemonMoveImpl implements ICommandUser {
    public moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI
    private response: string = ""

    constructor(public messageData: MessageData, public user: JoinedUser, pokeAPI?: PokemonAPI) {
        this.pokeAPI = pokeAPI || new PokemonAPI()
    }

    async run(): Promise<MessageData> {
        const { message } = this.messageData
        const messageParser = new MessageParser()
        const pokemonMoveName = messageParser.getPokemonMove(message, 1).toLowerCase()
        const pokemonMove: PokemonMove = await this.pokeAPI.fetchMove(pokemonMoveName)

        this.messageData.response = this.formatMoveResponse(pokemonMove)
        return this.messageData
    }

    private formatMoveResponse(pokemonMove: PokemonMove) {
        const { pp, names, accuracy, name, power, meta, type, effect_entries, flavor_text_entries } = pokemonMove
        this.response = this.getName(names, name)
        const damageCategory = pokemonMove.damage_class.name === "special" ? "SP" : "PHY"
        this.response += ` [${PokemonMoveImpl.toTitleCase(type.name)}][${damageCategory}] |`
        this.addStat(power, "PWR")
        this.addStat(pp, "PP")
        this.addStat(accuracy, "ACC")
        let ailmentExplained = false
        if (meta) {
            const { crit_rate, ailment_chance, flinch_chance, ailment } = meta
            this.addStat(crit_rate, "Crit")
            this.addStat(flinch_chance, "Flinch")
            if (ailment_chance) {
                this.response += ` | ${PokemonMoveImpl.toTitleCase(ailment.name)}[${ailment_chance}%]`
            }
            ailmentExplained = effect_entries[0].short_effect.toLowerCase().includes(ailment.name.toLowerCase()) && power !== null
        }
        if (effect_entries[0]) {
            const isConfuse = meta?.ailment.name.toLowerCase() === "confusion" && effect_entries[0].short_effect.toLowerCase().includes("confuse")
            const noEffect = effect_entries[0].short_effect.toLowerCase().includes("no additional effect")
            if (!(ailmentExplained || noEffect || isConfuse)) {
                this.response += ` | ${effect_entries[0].short_effect}`
            }
        } else if (flavor_text_entries.length > 0) {
            const correctLanguage = flavor_text_entries.find(entry => entry.language.name === "en")
            if (correctLanguage) {
                const filteredFlavorText = correctLanguage.flavor_text.replace(/(\r\n|\n|\r)/gm, " ")
                this.response += ` | ${filteredFlavorText}`
            }
        } else {
            this.response += ` | No additional effect`
        }

        return this.response
    }

    private addStat(value: number | undefined, statName: string) {
        if (value) this.response += ` ${statName}:${value}`
    }

    private getName(names: [ { language: { name: string }; name: string } ], name: string) {
        const pokemonMoveName = names.find(hit => hit.language.name === "en")?.name || name
        return PokemonMoveImpl.toTitleCase(pokemonMoveName)
    }

    private static toTitleCase(str: string) {
        return str
            .toLowerCase()
            .split(' ')
            .map((word) => (word.charAt(0).toUpperCase() + word.slice(1)))
            .join(' ')
    }

}