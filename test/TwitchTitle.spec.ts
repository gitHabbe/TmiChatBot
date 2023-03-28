import { TwitchTitle } from "../src/models/commands/twitch/TwitchTitle"
import { messageDataMock, offlineTwitchChannelMock } from "./mockData"
import { TwitchFetch } from "../src/models/fetch/TwitchTv"

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