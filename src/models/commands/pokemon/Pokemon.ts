import { ICommand, ICommandUser } from "../../../interfaces/Command"
import { ModuleFamily } from "../../../interfaces/tmi"
import { PokemonAPI } from "../../fetch/PokemonAPI"
import { MessageData } from "../../tmi/MessageData"
import { UserPrisma } from "../../database/UserPrisma"
import { IPokemon, IPokemonStat } from "../../../interfaces/pokemon"
import { JoinedUser } from "../../../interfaces/prisma"

export class Pokemon implements ICommandUser {
    public moduleFamily: ModuleFamily = ModuleFamily.POKEMON
    private pokeAPI: PokemonAPI

    constructor(public messageData: MessageData, public user: JoinedUser, pokeAPI?: PokemonAPI) {
        this.pokeAPI = pokeAPI || new PokemonAPI()
    }

    private getUser = async (userPrisma: UserPrisma) => {
        const user = await userPrisma.get()
        if (!user) throw new Error(`msg`)
        return user
    }

    private formatPokemonStats = (pokemon: IPokemon) => {
        const truncatedStats = [ "HP", "A", "D", "SA", "SD", "S" ]
        const stats = pokemon.stats.map((stat: IPokemonStat, i: number) => {
            return `${truncatedStats[i]}:${stat.base_stat}`
        })
        const statsString = stats.join(" ")
        const types = pokemon.types.map((type) => {
            return type.type.name[0].toUpperCase() + type.type.name.slice(1)
        })
        const typesString = types.join(" & ")
        const { name, id } = pokemon
        const formalName = name[0].toUpperCase() + name.slice(1)

        return `${formalName} #${id} | ${typesString} | ${statsString}`
    }

    run = async () => {
        const { channel, message } = this.messageData
        const targetPokemon = message.split(" ")[1]
        const userPrisma = new UserPrisma(channel)
        const user = await this.getUser(userPrisma)
        const pokemon = await this.pokeAPI.fetchPokemon(targetPokemon)
        this.messageData.response = this.formatPokemonStats(pokemon)

        return this.messageData
    }
}