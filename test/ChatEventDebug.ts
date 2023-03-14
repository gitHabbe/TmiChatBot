import { ChatEvent } from "../src/models/tmi/ChatEvent";
import { ClientSingleton } from "../src/models/tmi/ClientSingleton";
import { TmiClient } from "../src/interfaces/tmi";
import { chatterMock } from "./mockData";

export interface TmiClientTest extends TmiClient {
    testResults: TestResponse
}

interface TestResponse {
    channel: string;
    response: string
}

(async function() {
    const chatEvent = new ChatEvent()
    const clientSingleton = ClientSingleton.getInstance()
    // @ts-ignore
    const fakeClient: TmiClientTest = {
        testResults: {
            channel: "no channel",
            response: "no response"
        },
        say: function (channel, response) {
            this.testResults = { channel, response }
        },
        part: async function(channel: string): Promise<[ string ]> {
            this.testResults = {
                channel: channel,
                response: "leaving channel " + channel
            }
            return [""]
        }
    };

    const start = Date.now();

    clientSingleton.client = fakeClient
    await chatEvent.onMessage("#habbe", chatterMock, "!newcmd !ppog very pog command", false)
    // @ts-ignore
    const { response, channel } = clientSingleton.client.testResults;
    const end = Date.now();
    console.log(`Bot response: ${response}`);
    console.log(`To channel: ${channel}, in: ${end - start} ms`);
})();
