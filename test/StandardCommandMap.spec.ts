import { StandardCommandMap } from "../src/models/commands/StandardCommandMap"
import { messageDataMock } from "./__mocks__/tmiMock"
import { joinedUserMock } from "./__mocks__/prismaMock"
import { TwitchTitle } from "../src/models/commands/twitch/TwitchTitle"
import { CommandName, ComponentsSupport } from "../src/interfaces/tmi"
import { Pokemon } from "../src/models/commands/pokemon/Pokemon"
import { MessageParser } from "../src/models/tmi/MessageParse"
import { ICommand } from "../src/interfaces/Command"

describe("StandardCommandMap module", () => {
    let standardCommandMap: StandardCommandMap

    beforeEach(() => {
        standardCommandMap = new StandardCommandMap(messageDataMock, joinedUserMock)
    })

    it("StandardCommandMap title", () => {
        const res: ICommand | undefined = getCommand("!title")
        if (!res) expect(res).toBeUndefined()
        expect(res).toBeInstanceOf(TwitchTitle)
    })

    it("StandardCommandMap pokemon", () => {
        const res: ICommand | undefined = getCommand("!pokemon")
        if (!res) expect(res).toBeUndefined()
        expect(res).toBeInstanceOf(Pokemon)
    })

    it("StandardCommandMap undefined", () => {
        const res: ICommand | undefined = getCommand("!undefined")
        if (!res) expect(res).toBeUndefined()
    })

    function getCommand(mockMessage: string) {
        messageDataMock.message = mockMessage
        const { message } = messageDataMock
        const messageParser = new MessageParser()
        const commandName: string = messageParser.getCommandName(message, "!")
        return standardCommandMap.get(commandName)
    }

})