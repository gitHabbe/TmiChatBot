import { Client } from "tmi.js";
import { tmiOptions } from "../../config/tmiConfig";
import { TmiClient } from "../../../test/ChatEvent.spec";

export class ClientSingleton {
    private static instance: ClientSingleton;
    public client: TmiClient = new Client(tmiOptions)

    static getInstance(): ClientSingleton {
        if (!ClientSingleton.instance) {
            ClientSingleton.instance = new ClientSingleton();
        }
        return ClientSingleton.instance
    }

    get(): TmiClient {
        return this.client
    }
}