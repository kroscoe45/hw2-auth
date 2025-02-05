import bcrypt from 'bcrypt';
import dotenv from "dotenv";
dotenv.config();

const rounds : number = parseInt(process.env.ROUNDS || '10', 10);
const salt : string | undefined = process.env.SALT;

// hash to avoid storing plain text passwords
const hashPassword = (password : string) => {
    return new Promise<string>((resolve, reject) => {
        bcrypt.hash(password, salt || rounds, (err, hash) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(hash);
        });
    });
}

// compare given password with the stored hash
const comparePasswords = (password: string, hash: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

export { hashPassword, comparePasswords };