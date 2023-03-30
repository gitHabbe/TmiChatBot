import { ChatUserstate, Client } from "tmi.js"
import { TmiClient } from "../../src/interfaces/tmi"

export const chatterMock: ChatUserstate = {
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
    'username': 'habbe',
    'message-type': 'chat'
}

export interface TmiClientTest extends Omit<TmiClient, "say" | "part" | "join" | "connect" | "on"> {
    channel: string;
    response: string

    say(channel: string, response: string): void;

    part(channel: string): Promise<[ string ]>;

    on(event: any, listener: any): Client;

    connect(): Promise<[ string, number ]>;

    say(channel: string, message: string): void;

    join(channel: string): Promise<[ string ]>;
}

export const fakeClient: TmiClientTest = {
    channel: "no channel",
    response: "no response",
    say(channel, response) {
        this.channel = channel
        this.response = response
    },

    part(channel: string): Promise<[ string ]> {
        this.channel = channel
        this.response = `leaving channel: ${channel}`
        return Promise.resolve([ "" ])
    },
    connect(): Promise<[ string, number ]> {
        return Promise.resolve([ "", 0 ])
    },
    join(): Promise<[ string ]> {
        return Promise.resolve([ "" ])
    },
    on(event: any, listener: any): Client {
        return new Client({})
    }
}