import { Router, Request, Response } from 'express';
import { checkValidCredentials, registerAccount } from "../util/accountUtil";

const router = Router();

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
        const credCheck = await checkValidCredentials(username, password);
        if (!credCheck.canRegister()) {
            res.status(credCheck.statusCode)
            .send('Unable to proceed with registration:\n' +
                credCheck.usernameErrors.join('\n') + '\n' +
                credCheck.passwordErrors.join('\n'));
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