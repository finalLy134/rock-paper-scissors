import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function getOrSetUserCookie(req: Request, res: Response) {
    let userUuid = req.signedCookies?.['user_session'];
    let isNew = false;

    if (!userUuid) {
        userUuid = uuidv4();
        isNew = true;

        res.cookie('user_session', userUuid, {
            signed: true,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // False for local HTTP development
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 // 1 hour
        });
    }

    return { userUuid, isNew };
}