import { TwitchFetch, TwitchUptime } from "../src/models/commands/Twitch";
import { ITwitchChannel } from "../src/interfaces/twitch";
import { messageDataMock, twitchFetchMockData } from "./mockData";

describe("Standard commands", () => {

    it("Uptime command", async () => {
        const twitchFetch = new TwitchFetch(messageDataMock);
        const spy = jest
            .spyOn(twitchFetch, "getChannels")
            .mockImplementation(async (): Promise<ITwitchChannel[]> => twitchFetchMockData)
        const twitchUptime: TwitchUptime = new TwitchUptime(messageDataMock, twitchFetch);
        const updatedMessageData = await twitchUptime.run();
        const response: string = updatedMessageData.response;
        const exp: string = "habbe not online";
        expect(response).toBe(exp)
        spy.mockRestore()
    })

})