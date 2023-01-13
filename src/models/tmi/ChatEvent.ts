import { ChatUserstate } from "tmi.js";
import { CommandName } from "../../interfaces/tmi";
import { CommandList, StandardCommandList } from "../commands/StandardCommandList";
import { ICommand } from "../../interfaces/Command";
import { MessageParser } from "./MessageParse";
import { MessageData } from "./MessageData";
import { UserModel } from "../database/UserPrisma";
import { ClientSingleton } from "./ClientSingleton";
import { CustomCommand } from "../commands/CustomCommand";

export class ChatEvent {
    async onMessage(ircChannel: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
        if (self) return; // Bot self message;
        const channel = ircChannel.slice(1);
        let messageData: MessageData = new MessageData(channel, chatter, message);
        const commandName: string = MessageParser.getCommandName(message);
        const isStandardCommand: boolean = commandName in CommandName

        await ChatEvent.standardCommandAction(isStandardCommand, messageData, commandName);
        // messageData = await standardCommand.run(commandName);
        const customCommand = new CustomCommand(messageData);
        messageData = await customCommand.run();
        if (messageData.response.length > 0) {
            const client = ClientSingleton.getInstance().get();
            await client.say(messageData.channel, messageData.response)
        }
          //
          // const linkCommand = new LinkCommand(messageData);
          // messageData = await linkCommand.run()
          // if (messageData.response.length > 0) {
          //   return await this.client.say(messageData.targetChannel, messageData.response)
          // }
          //
    }

    private static async standardCommandAction(isStandardCommand: boolean, messageData: MessageData, commandName: string) {
        let commandList: CommandList;
        if (isStandardCommand) {
            commandList = new StandardCommandList(messageData);
            const isCommand: ICommand | undefined = commandList.get(commandName);
            if (isCommand) {
                messageData = await isCommand.run();
                const client = ClientSingleton.getInstance().get();
                await client.say(messageData.channel, messageData.response)
            }
        }
    }

    async onJoin(channel: string, username: string, self: boolean) {
        const userModel = new UserModel(channel);
        userModel.create()
        const joinedUser = await userModel.get();

    }
}