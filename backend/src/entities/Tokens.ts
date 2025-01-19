import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Users } from "./Users";

@Entity()
export class Tokens {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    refreshToken: string

    @OneToOne(() => Users)
    @JoinColumn()
    user: Users; 
}