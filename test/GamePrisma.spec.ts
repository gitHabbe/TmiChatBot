import { GamePrisma } from "../src/models/database/GamePrisma"
import { SpeedrunGame } from "../src/interfaces/general"
import { prismaSpeedrunGameMock } from "./mockData"

describe("GamePrisma module", () => {

    it("GamePrisma init", () => {
        const gamePrisma = new GamePrisma("habbe")
        const spy = jest
            .spyOn(gamePrisma, "get")
            .mockImplementation(async (): Promise<SpeedrunGame> => prismaSpeedrunGameMock)
        const res = gamePrisma.get()
        const exp = "fail"
        expect(res).toBe(exp)
        spy.mockRestore()
    })

})