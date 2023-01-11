export class MessageParser {
    constructor(private message: string) {
    }

    getCommandName(): string {
        const chatterCommand: string = this.message.split(" ")[0];
        return chatterCommand.slice(1).toUpperCase();
    };
}