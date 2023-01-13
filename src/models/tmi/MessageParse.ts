export class MessageParser {
    static getCommandName(message: string): string {
        const chatterCommand: string = message.split(" ")[0];
        return chatterCommand.slice(1).toUpperCase();
    };
}