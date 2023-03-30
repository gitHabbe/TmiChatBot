import { GamePrisma } from "../src/models/database/GamePrisma"
import { FullSpeedrunGame } from "../src/interfaces/general"
import { prismaSpeedrunGameMock } from "./__mocks__/prismaMock"

describe("GamePrisma module", () => {

    it("GamePrisma init", async () => {
        const gamePrisma = new GamePrisma("habbe")
        const spy = jest
            .spyOn(gamePrisma, "get")
            .mockImplementation(async (): Promise<FullSpeedrunGame> => prismaSpeedrunGameMock)
        const fullSpeedrunGame: FullSpeedrunGame | null = await gamePrisma.get()
        if (!fullSpeedrunGame) {
            expect(fullSpeedrunGame).toBeNull()
        }
        const targetCategory = "100%"
        const targetCategoryId = fullSpeedrunGame?.categories.find(category => category.name === targetCategory)
        const res = targetCategoryId?.id
        const exp = "q25qqv2o"
        expect(res).toBe(exp)
        spy.mockRestore()
    })

})