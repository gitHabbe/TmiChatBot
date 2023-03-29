import { AxiosInstance } from "axios"
import { pokemonAPI } from "../../config/pokemonConfig"
import { IPokemon, PokemonItem, PokemonMove } from "../../interfaces/pokemon"
import { ChatError } from "../error/ChatError"

export class PokemonAPI {
    private api: AxiosInstance = pokemonAPI

    async fetchMove(move: string): Promise<PokemonMove> {
        try {
            const moveResponse = await this.api.get<PokemonMove>(`/move/${move}`)
            return moveResponse.data
        } catch (error) {
            throw new ChatError(`Move ${move} not found.`)
        }
    }

    async fetchPokemon(targetPokemon: string): Promise<IPokemon> {
        try {
            const pokemonResponse = await this.api.get<IPokemon>(`/pokemon/${targetPokemon}`)
            return pokemonResponse.data
        } catch (error) {
            throw new ChatError(`Pokemon ${targetPokemon} not found.`)
        }
    }

    async fetchItem(item: string) {
        try {
            const itemResponse = await this.api.get<PokemonItem>(`/item/${item}`)
            return itemResponse.data
        } catch (error) {
            throw new ChatError(`Item ${item} not found.`)
        }
    }
}