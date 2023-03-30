import { CustomCommand } from "../src/models/commands/CustomCommand";
import { Command } from "@prisma/client";
import { MessageData } from "../src/models/tmi/MessageData";
import { UserPrisma } from "../src/models/database/UserPrisma"
import { commandMockData } from "./__mocks__/prismaMock"

describe("Test CustomCommand", () => {

  it("Init CustomCommand", async () => {
    const messageData = new MessageData("habbe", {}, "!test");
    const userPrisma = new UserPrisma("habbe")
    const joinedUser = await userPrisma.get()
    const customCommand = new CustomCommand(messageData, joinedUser);
    const spy = jest
      .spyOn(customCommand, "isCustomCommand")
      .mockReturnValue(commandMockData)
    const response = "This is the content";
    const expected: MessageData = await customCommand.run();
    expect(expected.response).toBe(response)
    spy.mockRestore()
  })

})