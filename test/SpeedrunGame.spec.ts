import { SpeedrunApi } from "../src/models/fetch/SpeedrunCom"
import { SpeedrunGame } from "../src/interfaces/general"
import { prismaSpeedrunGameMock } from "./__mocks__/prismaMock"

describe("SpeedrunGame module", () => {

    it("SpeedrunGame init", async () => {
        const speedrunGame = new SpeedrunApi("dkr")
        const spy = jest
            .spyOn(speedrunGame, "fetch")
            .mockReturnValue(Promise.resolve([ prismaSpeedrunGameMock ]))
        const gameResponse: SpeedrunGame[] = await speedrunGame.fetch()
        const res = gameResponse[0].international
        const exp = "Diddy Kong Racing"
        expect(res).toBe(exp)
        spy.mockRestore()
    })

})
