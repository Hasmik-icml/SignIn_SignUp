import { Request, Response } from "express";
import { CustomError } from "../errors/custom.error";
import { AuthService } from "../services/auth.service";

export class AuthController {
    public static async signUp(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        try {
            const result: IUser = await AuthService.signUp(email, password);
            console.log("111", result);
            res.status(201).send(result);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(400).send({ message: 'Something went wrong' });
            }
        }
    }

}