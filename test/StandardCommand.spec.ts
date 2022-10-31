import { TwitchFetch, TwitchTitle, TwitchUptime } from "../src/models/commands/Twitch";
import { ITwitchChannel } from "../src/interfaces/twitch";
import { messageDataMock, offlineTwitchChannelMock, onlineTwitchChannelMock } from "./mockData";
import { MessageData } from "../src/models/MessageData";

describe("Standard commands", () => {

    it("Uptime channel online", async () => {
        const twitchFetch = new TwitchFetch(messageDataMock);
        const spy = mockGetChannelsMethod(twitchFetch, onlineTwitchChannelMock);
        const twitchUptime = new TwitchUptime(messageDataMock, twitchFetch);
        const updatedMessageData: MessageData = await twitchUptime.run();
        const response: string = updatedMessageData.response;
        const exp = "2h 5m 34s";
        expect(response).toBe(exp)
        spy.mockRestore()
    })

    it("Uptime channel offline", async () => {
        const twitchFetch = new TwitchFetch(messageDataMock);
        const spy = mockGetChannelsMethod(twitchFetch, offlineTwitchChannelMock);
        const twitchUptime = new TwitchUptime(messageDataMock, twitchFetch);
        const updatedMessageData: MessageData = await twitchUptime.run();
        const response: string = updatedMessageData.response;
        const exp = "habbe not online";
        expect(response).toBe(exp)
        spy.mockRestore()
    })

    it("Title", async () => {
        const twitchFetch = new TwitchFetch(messageDataMock);
        const spy = mockGetChannelsMethod(twitchFetch, onlineTwitchChannelMock);
        const twitchTitle = new TwitchTitle(messageDataMock, twitchFetch);
        const updatedMessageData: MessageData = await twitchTitle.run();
        const response: string = updatedMessageData.response;
        const exp = "Mock title";
        expect(response).toBe(exp)
        spy.mockRestore()
    })

    function mockGetChannelsMethod(twitchFetch: TwitchFetch, twitchChannelMockData: ITwitchChannel[]) {
        return jest
            .spyOn(twitchFetch, "getChannels")
            .mockImplementation(async (): Promise<ITwitchChannel[]> => twitchChannelMockData);
    }

})