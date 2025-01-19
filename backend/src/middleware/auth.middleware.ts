import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).send({ message: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;
        const userId = Array.isArray(payload.userId) ? payload.userId[0] : payload.userId;

        if (!userId) {           
            res.status(400).send({ message: 'Invalid or missing User ID' });
            return;
        }

        (req as any).userId = userId;
        next();
    } catch (error) {
        res.status(401).send({ message: 'Unauthorized' });
        return;
    }

}