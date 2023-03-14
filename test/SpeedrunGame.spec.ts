import { SpeedrunApi } from "../src/models/fetch/SpeedrunCom"
import { SpeedrunGame } from "../src/interfaces/general"
import { speedrunGameMock } from "./mockData"

describe("SpeedrunGame module", () => {

    it("SpeedrunGame init", async () => {
        const speedrunGame = new SpeedrunApi("dkr")
        const spy = jest
            .spyOn(speedrunGame, "fetch")
            .mockImplementation(async (): Promise<SpeedrunGame[]> => [ speedrunGameMock ])
        const gameResponse: SpeedrunGame[] = await speedrunGame.fetch()
        console.log(gameResponse)
        const res = gameResponse[0].international
        const exp = "Diddy Kong Racing"
        expect(res).toBe(exp)
        spy.mockRestore()
    })

})
