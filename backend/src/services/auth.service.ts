import bcrypt from "bcryptjs";
import { AppDataSource } from "../database.config";
import { Users } from "../entities/Users";
import { BadRequestError } from "../handlers/bad-request.handler";
import { Repository } from "typeorm";

export interface IUser {
    id: number;
    email: string;
}



export class AuthService {
    private static _userRepo: Repository<Users>;

    private static get userRepo() {
        if (!this._userRepo) {
            this._userRepo = AppDataSource.getRepository(Users);
        }
        return this._userRepo;
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

}