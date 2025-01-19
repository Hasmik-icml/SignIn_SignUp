import { CustomError } from "../errors/custom.error";

export class BadRequestError extends CustomError {
    statusCode = 400;

    constructor(public errors: string) {
        super(typeof errors === 'string' ? errors : 'Invalid request parameters');
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    serializeErrors(): { message: string; field?: string; }[] {
        return [{ message: this.errors }];
    }
}