import { CustomCommand } from "../src/models/commands/CustomCommand";
import { Command } from "@prisma/client";
import { commandMockData } from "./mockData";
import { MessageData } from "../src/models/tmi/MessageData";

describe("Test CustomCommand", () => {

  it("Init CustomCommand", async () => {
    const messageData = new MessageData("habbe", {}, "This is a test message");
    const customCommand = new CustomCommand(messageData);
    const spy = jest
      .spyOn(customCommand, "isCustomCommand")
      .mockImplementation(async (): Promise<Command> => commandMockData)
    const response = "This is the content";
    const expected: MessageData = await customCommand.run();
    expect(expected.response).toBe(response)
    spy.mockRestore()
  })

})