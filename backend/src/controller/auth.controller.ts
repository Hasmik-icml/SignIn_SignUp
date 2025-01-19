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

    public static async signIn(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        try {
            const tokens: ITokens = await AuthService.signIn(email, password,)
            if (tokens) {
                res.cookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    path: '/',
                    maxAge: 1 * 24 * 60 * 60 * 1000
                })
                res.status(200).send({ accessToken: tokens.accessToken });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(400).send({ message: 'Something went wrong' });
            }
        }
    }


}