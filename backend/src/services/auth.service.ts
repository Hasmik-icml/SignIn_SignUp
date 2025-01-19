import bcrypt from "bcryptjs";
import { AppDataSource } from "../database.config";
import { Users } from "../entities/Users";
import { BadRequestError } from "../handlers/bad-request.handler";
import { Tokens } from "../entities/Tokens";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";

export interface IUser {
    id: number;
    email: string;
}

export interface ITokens {
    accessToken: string;
    refreshToken: string;
}

const secretKey = process.env.JWT_SECRET_KEY || "";
const refreshKey = process.env.JWT_REFRESH_KEY || "";

export class AuthService {
    private static _userRepo: Repository<Users>;
    private static _tokensRepo: Repository<Tokens>;

    private static get userRepo() {
        if (!this._userRepo) {
            this._userRepo = AppDataSource.getRepository(Users);
        }
        return this._userRepo;
    }

    private static get tokensRepo() {
        if (!this._tokensRepo) {
            this._tokensRepo = AppDataSource.getRepository(Tokens);
        }
        return this._tokensRepo;
    }
    public static async signUp(email: string, password: string): Promise<IUser> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await this.userRepo.findOne({
            where: { email },
        });

        if (user) {
            throw new BadRequestError("User already exists");
        }

        const createdUser = await this.userRepo.create({
            email,
            password: hashedPassword,
        });

        const savedUser = await this.userRepo.save(createdUser);

        return { id: savedUser.id, email: savedUser.email };
    }

    public static async signIn(email: string, password: string): Promise<ITokens> {

        const user = await this.userRepo.findOne({
            where: { email },
        });

        if (!user) {
            throw new BadRequestError("Invalid email or password");
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new BadRequestError("Invalid email or password");

        }

        const r = this.tokensRepo.delete({
            user: user,
        });
        console.log(r);
        const accessToken = jwt.sign(
            { user },
            secretKey!,
            { expiresIn: '15m' }
        )
        const refreshToken = jwt.sign(
            { user },
            refreshKey!,
            { expiresIn: '1d' }
        )

        this.tokensRepo.save({
            userid: user.id,
            refreshToken: refreshToken,
        });
        return { accessToken, refreshToken };
    }

    }
}