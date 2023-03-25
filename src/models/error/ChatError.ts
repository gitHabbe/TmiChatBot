export class ChatError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, ChatError.prototype);
    }

}

export class ApiError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}