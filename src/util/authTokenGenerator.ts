import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config()

const secret = process.env.JWT_SECRET || 'default'
const tokenOptions : jwt.SignOptions = {
    expiresIn: '1h',
    algorithm: 'HS256'
}
export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, secret, tokenOptions);
};