import { messagePokemonDataMock, messagePokemonMachineDataMock, pokemonItemMock, pokemonMoveMock } from "./mockData"
import { PokemonAPI } from "../src/models/fetch/PokemonAPI"
import { PokemonMoveImpl } from "../src/models/commands/pokemon/PokemonMoveImpl"
import { PokemonItemImpl } from "../src/models/commands/pokemon/PokemonItemImpl"
import { PokemonHM } from "../src/models/commands/pokemon/PokemonHM"

describe("PokemonAPI module", () => {

    it("PokemonAPI init", async () => {
        const mockedPokemonAPI = new PokemonAPI()
        const spy =
            jest.spyOn(mockedPokemonAPI, "fetchMove")
            .mockImplementation(async () => pokemonMoveMock)
        // const pokemonMove = await mockedPokemonAPI.fetchMove("ember")
        const pokemonMove1 = new PokemonMoveImpl(messagePokemonDataMock, mockedPokemonAPI)
        const res = await pokemonMove1.run()
        const exp = "Ember [Fire] | PWR:40 PP:25 ACC:100 | Proc: Burn(10%)"
        expect(res.response).toBe(exp)
        spy.mockRestore()
    })

    it("Pokemon Item", async () => {
        const mockedPokemonAPI = new PokemonAPI()
        const spy = jest
            .spyOn(mockedPokemonAPI, "fetchItem")
            .mockReturnValue(Promise.resolve(pokemonItemMock))
        const pokemonItem = new PokemonItemImpl(messagePokemonDataMock, mockedPokemonAPI)
        const messageData = await pokemonItem.run()
        const res = messageData.response
        const exp = "Poké Ball[200]: Attempts to catch a wild Pokémon, using a catch rate of 1×. If used in a trainer battle, nothing happens and the ball is lost."
        expect(res).toBe(exp)
        spy.mockRestore()
    })

    it("Pokemon Machine", async () => {

        const mockedPokemonAPI = new PokemonAPI()
        const pokemonMachineMock: Record<string, string> = {
            "HM01": "Teaches the move Cut."
        }
        const spy = jest
            .spyOn(mockedPokemonAPI, "fetchMachine")
            .mockReturnValue(pokemonMachineMock)
        const pokemonMachine = new PokemonHM(messagePokemonMachineDataMock, mockedPokemonAPI)
        const messageDataPromise = await pokemonMachine.run()
        spy.mockRestore()
    })

})