import { TwitchTitle } from "../src/models/commands/twitch/TwitchTitle"
import { TwitchFetch } from "../src/models/fetch/TwitchTv"
import { offlineTwitchChannelMock } from "./__mocks__/twitchMock"
import { messageDataMock } from "./__mocks__/tmiMock"

describe("TwitchTitle module", () => {

    it("TwitchTitle init", async () => {
        const twitchFetch = new TwitchFetch()
        const spy = jest
            .spyOn(twitchFetch, "singleChannel")
            .mockReturnValue(Promise.resolve(offlineTwitchChannelMock))
        const twitchTitle = new TwitchTitle(messageDataMock, twitchFetch)
        const twitchTitleRes = await twitchTitle.run()
        const res = twitchTitleRes.response
        const exp = "Mock title"
        expect(res).toBe(exp)
        spy.mockRestore()
    })

})