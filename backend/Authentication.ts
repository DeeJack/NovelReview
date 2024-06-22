import bcrypt from "bcryptjs";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { login, register } from './Database';

const jwtSecret: Secret = process.env.JWT_SECRET || 'asderino';

export async function onRegister(username: string, password: string): Promise<string | null> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);


    let registered = await register(username, hashedPassword);
    if (registered) {
        return jwt.sign({ username }, jwtSecret);
    } else {
        return null;
    }
}

export async function onLogin(username: string, password: string): Promise<string | null> {
    let loggedIn = await login(username, password);
    if (loggedIn) {
        return jwt.sign({ username }, jwtSecret);
    } else {
        return null;
    }
}

/**
 * Check the validity of the JWT token, return the username if valid, null otherwise
 */
export function checkJWT(token: string): string |JwtPayload | null {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (e) {
        return null;
    }
}

export async function comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}