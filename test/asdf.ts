import { ChatEvent } from "../src/models/tmi/ChatEvent";
import { ChatUserstate, Client } from "tmi.js";
import { ClientSingleton } from "../src/models/tmi/ClientSingleton";

export interface TmiClient {
    // on: (eventName: string, event: Function) => void;
    on(event: any, listener: any): Client;
    // connect: () => Promise<void>;
    connect(): Promise<[string, number]>;
    say: (channel: string, message: string) => void;
}

export interface TmiClientTest extends TmiClient {
    testResults: TestResponse
}

interface TestResponse {
    channel: string;
    response: string
}

const asdf = async () => {
    try {
        const chatEvent = new ChatEvent()
        const clientSingleton = ClientSingleton.getInstance()
        clientSingleton.client = {
            // @ts-ignore
            testResults: {
                channel: "placeholder channel",
                response: "placeholder response"
            },
            say: function (channel, message) {
                console.log(message);
                // @ts-ignore
                this.testResults = { channel, response: message }
            },
        }
        const chatter: ChatUserstate = {
            'badges': { 'broadcaster': '1', 'warcraft': 'horde' },
            'color': '#FFFFFF',
            'display-name': 'Schmoopiie',
            'emotes': { '25': [ '0-4' ] },
            'mod': true,
            'room-id': '58355428',
            'subscriber': false,
            'turbo': true,
            'user-id': '58355428',
            'user-type': 'mod',
            'emotes-raw': '25:0-4',
            'badges-raw': 'broadcaster/1,warcraft/horde',
            'username': 'schmoopiie',
            'message-type': 'chat'
        };
        await chatEvent.onMessage("#habbe", chatter, "!wr sm64 120", false)
// @ts-ignore
        const res = clientSingleton.client.testResults.response;
        const exp = "fail"
        console.log(res)

    } catch (e) {
        console.log(e);

    }
// const res = "success";

}

asdf()