import { Router } from 'express';
import { getOrSetUserCookie } from '../utils/auth';

const authRouter = Router();

authRouter.get('/', (req, res) => {
    const { userUuid, isNew } = getOrSetUserCookie(req, res);

    res.json({
        message: isNew ? 'Signed cookie set successfully!' : 'Valid signed cookie received',
        uuid: userUuid
    });
});

export default authRouter;