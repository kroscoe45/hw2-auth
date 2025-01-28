import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'default_secret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) { return res.status(401).json({ message: 'Unauthorized: No token' }); }

    const authToken = authHeader.split(' ')[1]; // Bearer <token>

    try {
        (req as any).user = jwt.verify(authToken, secret);
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};
