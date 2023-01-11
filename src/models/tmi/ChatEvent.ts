import { ChatUserstate } from "tmi.js";
import { CommandName } from "../../interfaces/tmi";
import { CommandList, StandardCommandList } from "../commands/StandardCommandList";
import { ICommand } from "../../interfaces/Command";
import { ClientSingleton } from "../database/ClientSingleton";
import { MessageParser } from "./MessageParse";
import { MessageData } from "./MessageData";

export class ChatEvent {
    async onMessage(streamer: string, chatter: ChatUserstate, message: string, self: boolean): Promise<MessageData | void> {
        if (self) return; // Bot self message;
        let messageData: MessageData = new MessageData(streamer, chatter, message);
        const messageParser: MessageParser = new MessageParser(message);
        const commandName: string = messageParser.getCommandName();
        const isStandardCommand: boolean = commandName in CommandName
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
        // messageData = await standardCommand.run(commandName);
        //   // console.log(messageData)
        //   // if (messageData.response.length > 0) {
        //   //   return await this.client.say(messageData.targetChannel, messageData.response)
        //   // }
        //   //
        //   // const customCommand = new CustomCommand(messageData);
        //   // messageData = await customCommand.run();
        //   // if (messageData.response.length > 0) {
        //   //   return await this.client.say(messageData.targetChannel, messageData.response)
        //   // }
        //   //
        //   // const linkCommand = new LinkCommand(messageData);
        //   // messageData = await linkCommand.run()
        //   // if (messageData.response.length > 0) {
        //   //   return await this.client.say(messageData.targetChannel, messageData.response)
        //   // }
        //   //
        return messageData
    }
}