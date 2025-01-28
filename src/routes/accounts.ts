import { Router, Request, Response } from 'express';
import {hashPassword } from '../util/hashPassword';
import { registrationPrecheck, registerAccount } from "../util/accountUtil";

const router = Router();

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
        const regCheck = await registrationPrecheck(username, password);
        if (!regCheck.canRegister()) {
            res.status(regCheck.statusCode)
            .send('Unable to proceed with registration:\n' +
                 regCheck.usernameErrors.join('\n') + '\n' +
                 regCheck.passwordErrors.join('\n'));
        } else {
            try {
                await registerAccount(username, password);
                res.status(200).send('Registration successful');
            }
            catch (err) {
                res.status(500).send('Error inserting account');
            }
        }
    } catch (err) {
        res.status(500).send('Error inserting account');
    }
});

export { router as accountsRouter };