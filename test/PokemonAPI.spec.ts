import { messagePokemonDataMock, pokemonMoveMock } from "./mockData"
import { PokemonAPI } from "../src/models/fetch/PokemonAPI"
import { PokemonMoveImpl } from "../src/models/commands/Tmi"

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

})