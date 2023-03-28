import { CustomCommand } from "../src/models/commands/CustomCommand";
import { Command } from "@prisma/client";
import { commandMockData } from "./mockData";
import { MessageData } from "../src/models/tmi/MessageData";
import { UserPrisma } from "../src/models/database/UserPrisma"

describe("Test CustomCommand", () => {

  it("Init CustomCommand", async () => {
    const messageData = new MessageData("habbe", {}, "!test");
    const userPrisma = new UserPrisma("habbe")
    const joinedUser = await userPrisma.get()
    const customCommand = new CustomCommand(messageData, joinedUser);
    const spy = jest
      .spyOn(customCommand, "isCustomCommand")
      .mockImplementation((): Command | undefined => commandMockData)
    const response = "This is the content";
    const expected: MessageData = await customCommand.run();
    expect(expected.response).toBe(response)
    spy.mockRestore()
  })

})