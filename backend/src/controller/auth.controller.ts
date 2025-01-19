import { Request, Response } from "express";
import { CustomError } from "../errors/custom.error";
import { AuthService, ITokens, IUser } from "../services/auth.service";

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
                res.status(500).send({ message: 'Something went wrong' });
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
                res.status(500).send({ message: 'Something went wrong' });
            }
        }
    }

    public static async refreshToken(req: Request, res: Response): Promise<void> {
        const refreshToken = req.cookies.refreshToken;
        console.log('aaa', refreshToken);

        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token not provided' });
        }

        try {
            const token = await AuthService.refreshToken(refreshToken);
            if (token) {
                res.cookie('refreshToken', token.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    path: '/',
                    maxAge: 1 * 24 * 60 * 60 * 1000
                })
                res.status(200).send({ accessToken: token?.accessToken });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(500).send({ message: 'Something went wrong' });
            }
        }
    }

    public static async signOut(req: Request, res: Response): Promise<void> {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token not provided' });
        }

        try {
            const msg = await AuthService.signOut(refreshToken);
            if (msg) {
                res.clearCookie('refreshToken', { httpOnly: true });
                res.status(200).json({ message: "Successfully logged out" });
            } else {
                res.status(400).send({ message: 'Something went wrong' });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(500).send({ message: 'Something went wrong' });
            }
        }
    }

    public static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const [data, count] = await AuthService.getAll();
            res.status(200).send({ data, count });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(500).send({ message: 'Something went wrong' });
            }
        }
    }

    public static async getById(req: Request, res: Response): Promise<void> {
        const userId = Number(req.params.id);
        console.log(555, userId);
        try {
            const user = await AuthService.getOne(userId);
            res.status(200).send({ data: user });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(500).send({ message: 'Something went wrong' });
            }
        }
    }

    public static async updateUser(req: Request, res: Response): Promise<void> {
        const userId = Number(req.params.id);
        const email = req.body.email;
        try {
            const user = await AuthService.update(email, userId);
            res.status(200).send({ data: user });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(500).send({ message: 'Something went wrong' });
            }
        }
    }

    public static async deleteUser(req: Request, res: Response): Promise<void> {
        const userId = (req as any).userId;
        try {
            const user = await AuthService.delete(userId);
            res.status(200).send({ data: user });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).send({ errors: error.serializeErrors() });
            } else {
                res.status(500).send({ message: 'Something went wrong' });
            }
        }
    }
}