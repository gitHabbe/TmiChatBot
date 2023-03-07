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
            channel: "placeholder channel",
            response: "placeholder response"
        },
        say: function (channel, response) {
            this.testResults = { channel, response }
        },
    };
    clientSingleton.client = fakeClient
    await chatEvent.onMessage("#gage", chatterMock, "!wr", false)
    // @ts-ignore
    const res = clientSingleton.client.testResults.response;
    console.log(res);
})();
