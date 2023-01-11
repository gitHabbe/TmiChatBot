import { Client } from "tmi.js";
import { tmiOptions } from "../../config/tmiConfig";

export class ClientSingleton {
    private static instance: ClientSingleton;
    public client = new Client(tmiOptions)

    static getInstance(): ClientSingleton {
        if (!ClientSingleton.instance) {
            ClientSingleton.instance = new ClientSingleton();
        }
        return ClientSingleton.instance
    }

    get(): Client {
        return this.client
    }
}