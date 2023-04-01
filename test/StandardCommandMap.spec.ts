import { StandardCommandMap } from "../src/models/commands/StandardCommandMap"
import { messageDataMock } from "./__mocks__/tmiMock"
import { joinedUserMock } from "./__mocks__/prismaMock"
import { TwitchTitle } from "../src/models/commands/twitch/TwitchTitle"
import { Pokemon } from "../src/models/commands/pokemon/Pokemon"
import { MessageParser } from "../src/models/tmi/MessageParse"
import { ICommandUser } from "../src/interfaces/Command"
import { TwitchUptime } from "../src/models/commands/twitch/TwitchUptime"

describe("StandardCommandMap module", () => {
    let standardCommandMap: StandardCommandMap

    beforeEach(() => {
        standardCommandMap = new StandardCommandMap(messageDataMock)
    })

    it("StandardCommandMap title", () => {
        const res: ICommandUser | undefined = getCommand("!title")
        expect(res).toBeInstanceOf(TwitchTitle)
    })

    it("StandardCommandMap pokemon", () => {
        const res: ICommandUser | undefined = getCommand("!pokemon")
        expect(res).toBeInstanceOf(Pokemon)
    })

    it("StandardCommandMap undefined", () => {
        const res: ICommandUser | undefined = getCommand("!undefined")
        expect(res).toBeUndefined()
    })

    it("StandardCommandMap undefined 2", () => {
        const res: ICommandUser | undefined = getCommand("#undefined")
        expect(res).toBeUndefined()
    })


    it("StandardCommandMap uptime", () => {
        const res: ICommandUser | undefined = getCommand("#uptime", "#")
        expect(res).toBeInstanceOf(TwitchUptime)
    })
    
    function getCommand(mockMessage: string, targetPrefix: string = "!") {
        messageDataMock.message = mockMessage
        const { message } = messageDataMock
        const messageParser = new MessageParser()
        const commandName: string = messageParser.getCommandName(message, targetPrefix)
        let StandardCommand = standardCommandMap.get(commandName)
        if (!StandardCommand) return undefined
        return new StandardCommand(messageDataMock, joinedUserMock)
    }

})