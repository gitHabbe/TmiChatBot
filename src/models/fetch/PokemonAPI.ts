import { AxiosInstance } from "axios"
import { pokemonAPI } from "../../config/pokemonConfig"
import { IPokemon, PokemonItem, PokemonMove } from "../../interfaces/pokemon"
import { ChatError } from "../error/ChatError"
import { JsonFile } from "../JsonArrayFile"
import { bulbapediaAPI } from "../../config/bulbapedia"
import { PokemonMoveImpl } from "../commands/pokemon/PokemonMoveImpl"


class JsonMachines {
    private jsonFile = new JsonFile<Record<string, string>>("utility/", "pokemon_data")

    findMachine() {
        return this.jsonFile.getData

    }
}

export class PokemonAPI {
    private api: AxiosInstance = pokemonAPI

    async fetchPokemon(targetPokemon: string): Promise<IPokemon> {
        try {
            const pokemonResponse = await this.api.get<IPokemon>(`/pokemon/${targetPokemon}`)
            return pokemonResponse.data
        } catch (error) {
            throw new ChatError(`Pokemon ${targetPokemon} not found.`)
        }
    }

    async fetchMove(move: string): Promise<PokemonMove> {
        try {
            const moveResponse = await this.api.get<PokemonMove>(`/move/${move}`)
            return moveResponse.data
        } catch (error) {
            throw new ChatError(`Move ${move} not found.`)
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

    fetchMachine(machine: string): Record<string, string> {
        const jsonMachines = new JsonMachines()
        const data = jsonMachines.findMachine()
        for (const key in data) {
            const isShortMachine = key.split("M")[1].toLowerCase() === machine.toLowerCase()
            const isShorterMachine = key.split("M")[1].replace("0", "").toLowerCase() === machine.toLowerCase()
            const isMachine = key.toLowerCase() === machine.toLowerCase()
            if (isMachine || isShortMachine || isShorterMachine) {
                return { [key]: data[key] }
            }
        }
        throw new ChatError(`Machine ${machine} not found.`)
    }

    async fetchBulbapedia(moveName: string) {
        try {
            const axiosResponse = await bulbapediaAPI.get(`wiki/${moveName}_(move)`)
            return axiosResponse.data
        } catch (e) {
            throw new Error(`Bulbapedia ${moveName} not found.`)
        }
    }
}