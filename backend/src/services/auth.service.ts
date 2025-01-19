import bcrypt from "bcryptjs";
import { AppDataSource } from "../database.config";
import { Users } from "../entities/Users";
import { BadRequestError } from "../handlers/bad-request.handler";
import { Tokens } from "../entities/Tokens";
import jwt, { JwtPayload } from "jsonwebtoken";
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

        this.tokensRepo.delete({
            user: { id: user.id },
        });

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            secretKey!,
            { expiresIn: '15m' }
        )
        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            refreshKey!,
            { expiresIn: '1d' }
        )

        this.tokensRepo.save({
            user: { id: user.id },
            refreshToken: refreshToken,
        });
        return { accessToken, refreshToken };
    }

    public static async refreshToken(refreshToken: string): Promise<ITokens | undefined> {
        const decoded = jwt.verify(refreshToken, refreshKey!) as JwtPayload;
        const user = await this.userRepo.findOne({
            where: { id: decoded.userId },
        })

        if (!user) {
            throw Error('User not found');
        }

        const tokenExists = await this.tokensRepo.findOne({
            where: {
                user: { id: Number(user.id) },
                refreshToken,
            }
        });

        if (!tokenExists) {
            throw new Error('Invalid Refresh Token');
        }

        this.tokensRepo.delete({
            user: { id: user.id },
        });

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            secretKey!,
            { expiresIn: '15m' }
        )

        const newRefreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            refreshKey!,
            { expiresIn: '1d' }
        )

        this.tokensRepo.save({
            user: { id: user.id },
            refreshToken: refreshToken,
        });

        return { accessToken, refreshToken: newRefreshToken };
    }

    public static async signOut(refreshToken: string): Promise<{ message: string }> {
        const decoded = jwt.verify(refreshToken, refreshKey!) as JwtPayload;
        const user = await this.userRepo.findOne({
            where: { id: decoded.userId },
        })

        if (!user) {
            throw Error('User not found');
        }

        const tokenExists = await this.tokensRepo.findOne({
            where: {
                user: { id: Number(user.id) },
                refreshToken,
            }
        });

        if (!tokenExists) {
            throw new Error('Invalid Refresh Token');
        }

        this.tokensRepo.delete({
            user: { id: user.id },
        });

        return { message: 'Successfully logged out' };
    }

    public static async getAll(): Promise<[data: Users[], count: number]> {
        const [data, count] = await this.userRepo.findAndCount({});

        return [data, count];
    }

    public static async getOne(userId: number): Promise<Users> {
        const data = await this.userRepo.findOneOrFail({ where: { id: Number(userId) } });

        return data;
    }

    public static async update(email: string, userId: number): Promise<Users | null> {
        await this.userRepo.update(
            { id: Number(userId) },
            { email }
        );

        const updatedUser = await this.userRepo.findOne({ where: { id: Number(userId) } });

        return updatedUser;
    }

    public static async delete(id: number): Promise<Users> {
        const existingUser = await this.userRepo.findOneOrFail({ where: { id } });
        if (existingUser) {
            this.userRepo.softDelete(
                { id },
            );
        }
        return existingUser;
    }
}