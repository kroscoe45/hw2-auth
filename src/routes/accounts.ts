import express, {Request, Response} from 'express';
import {hashPassword, comparePasswords} from '../util/hashPassword';
import {generateToken} from '../util/authTokenGenerator';
import {authenticateToken} from '../middleware/authManager';
import db from '../database';
import {registrationPrecheck} from "../util/accountUtil";

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const { username, password, ...rest } = req.body;
    const regCheck = await registrationPrecheck(username, password);
    if (!regCheck.canRegister()) {
        res.status(regCheck.statusCode)
            .send('Unable to proceed with registration:\n' +
                 regCheck.usernameErrors.join('\n') + '\n' +
                 regCheck.passwordErrors.join('\n'))
        return;
    }
    const hashedPassword = await hashPassword(password);
    db.serialize(() => {
        db.run(
            'INSERT INTO accounts (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            function (err) {
                if (err) {
                    res.status(500).send('Error inserting account');
                    return;
                }
                res.status(201).send({id: this.lastID, username});
            }
        );
    });
});