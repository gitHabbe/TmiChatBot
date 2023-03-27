import { ChatEvent } from "../src/models/tmi/ChatEvent"
import { ClientSingleton } from "../src/models/tmi/ClientSingleton"
import { chatterMock, fakeClient } from "./mockData"

(async function () {
    const chatEvent = new ChatEvent()
    const clientSingleton = ClientSingleton.getInstance()
    clientSingleton.client = fakeClient

    const start = Date.now()
    const chatMessage = "https://www.youtube.com/watch?v=FYCauVeo8OY"
    await chatEvent.onMessage("#habbe", chatterMock, chatMessage, false)
    //@ts-ignore
    const { response, channel } = clientSingleton.client
    const end = Date.now()
    console.log(`Bot response: ${response}`)
    console.log(`To channel: ${channel}, in: ${end - start} ms`)
})()
