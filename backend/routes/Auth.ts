import express, { Request, Response } from 'express';
import { onLogin, onRegister, checkJWT } from '../Authentication';
import { JwtPayload } from 'jsonwebtoken';
import { logger } from '../Logger'

export const authRouter = express.Router();

authRouter.post('/login', async (request, response) => {
    let username = request.body.username;
    let password = request.body.password;

    let result = await onLogin(username, password);
    if (result) {
        logger.info(`Successful login ${username} ${request.ip}`)
        response.send({ token: result });
    } else {
        logger.warn(`Invalid login ${username} ${password} ${request.ip}`)
        response.status(401).send('Invalid login');
    }
});

authRouter.post('/register', async (request, response) => {
    let username = request.body.username;
    let password = request.body.password;

    let result = await onRegister(username, password);
    if (result) {
        logger.info(`Successful registration ${username} ${request.ip}`)
        response.send({ token: result });
    } else {
        logger.warn(`Invalid registration ${username} ${password} ${request.ip}`)
        response.status(401).send('Invalid registration');
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null)
        return res.sendStatus(401)

    let user: JwtPayload | null = checkJWT(token)
    if (!user) {
        return res.sendStatus(403)
    }

    req.username = user.username

    next();
}

authRouter.use(authenticateToken);