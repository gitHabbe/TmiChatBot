import { ITwitchChannel } from "../src/interfaces/twitch";
import { TwitchFetch } from "../src/models/fetch/TwitchTv";
import { TwitchTitle } from "../src/models/commands/twitch/TwitchTitle";
import { TwitchUptime } from "../src/models/commands/twitch/TwitchUptime";
import { MessageData } from "../src/models/tmi/MessageData";
import { offlineTwitchChannelMock, onlineTwitchChannelMock } from "./__mocks__/twitchMock"
import { messageDataMock } from "./__mocks__/tmiMock"
import { joinedUserMock } from "./__mocks__/prismaMock"

describe("Standard commands", () => {

    it("Uptime channel online", async () => {
        const twitchFetch = new TwitchFetch();
        const spy = mockGetChannelsMethod(twitchFetch, onlineTwitchChannelMock);
        const twitchUptime = new TwitchUptime(messageDataMock, joinedUserMock, twitchFetch);
        const updatedMessageData: MessageData = await twitchUptime.run();
        const response: string = updatedMessageData.response;
        const exp = "2h 5m 34s";
        expect(response).toBe(exp)
        spy.mockRestore()
    })

    it("Uptime channel offline", async () => {
        const twitchFetch = new TwitchFetch();
        const spy = mockGetChannelsMethod(twitchFetch, offlineTwitchChannelMock);
        const twitchUptime = new TwitchUptime(messageDataMock, joinedUserMock, twitchFetch);
        const updatedMessageData: MessageData = await twitchUptime.run();
        const response: string = updatedMessageData.response;
        const exp = "habbe not online";
        expect(response).toBe(exp)
        spy.mockRestore()
    })

    it("Title", async () => {
        const twitchFetch = new TwitchFetch();
        const spy = mockGetChannelsMethod(twitchFetch, onlineTwitchChannelMock);
        const twitchTitle = new TwitchTitle(messageDataMock, joinedUserMock, twitchFetch);
        const updatedMessageData: MessageData = await twitchTitle.run();
        const response: string = updatedMessageData.response;
        const exp = "Mock title";
        expect(response).toBe(exp)
        spy.mockRestore()
    })

    function mockGetChannelsMethod(twitchFetch: TwitchFetch, twitchChannelMockData: ITwitchChannel) {
        return jest
            .spyOn(twitchFetch, "singleChannel")
            .mockReturnValue(Promise.resolve(twitchChannelMockData))
    }

})
