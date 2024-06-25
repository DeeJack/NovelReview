import { logger } from '../Logger'
import express, { Request, Response } from 'express';
import { getNextNovel, updateNext } from '../Database';

export const nextRouter = express.Router();

// Extend the Request interface
declare module 'express-serve-static-core' {
    interface Request {
        username: string; // Use optional property to avoid issues if not set
    }
}

nextRouter.get('/next', (req: Request, res: Response) => {
    getNextNovel(req.username)
        .then((novel) => res.send(novel))
        .catch((err) => {
            logger.error(err)
            res.status(500).send('Error getting next novel')
        });
});

nextRouter.put('/next', (req: Request, res: Response) => {
    const text = req.body.text

    updateNext(text, req.username)
        .then(() => res.send('Successfully updated next'))
        .catch((err) => {
            logger.error(err)
            res.status(500).send('Error updating next')
        });
});