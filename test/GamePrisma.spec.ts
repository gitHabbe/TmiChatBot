import { GamePrisma } from "../src/models/database/GamePrisma"
import { FullSpeedrunGame } from "../src/interfaces/general"
import { prismaSpeedrunGameMock } from "./__mocks__/prismaMock"

describe("GamePrisma module", () => {

    async function createSpy() {
        const gamePrisma = new GamePrisma("habbe")
        const spy = jest
            .spyOn(gamePrisma, "get")
            .mockReturnValue(Promise.resolve(prismaSpeedrunGameMock))
        const fullSpeedrunGame: FullSpeedrunGame | null = await gamePrisma.get()
        return { spy, fullSpeedrunGame }
    }

    it("GamePrisma category id", async () => {
        const { spy, fullSpeedrunGame } = await createSpy()
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

    it("GamePrisma category name", async () => {
        const { spy, fullSpeedrunGame } = await createSpy()
        if (!fullSpeedrunGame) {
            expect(fullSpeedrunGame).toBeNull()
        }
        const targetCategory = "q25qqv2o"
        const targetCategoryId = fullSpeedrunGame?.categories.find(category => category.id === targetCategory)
        const res = targetCategoryId?.name
        const exp = "100%"
        expect(res).toBe(exp)
        spy.mockRestore()
    })

})