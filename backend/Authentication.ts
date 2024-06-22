import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
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
    // password = bcrypt.hashSync(password, 10);
    let loggedIn = await login(username, password);
    if (loggedIn) {
        return jwt.sign({ username }, jwtSecret);
    } else {
        return null;
    }
}

export function checkJWT(token: string): boolean {
    try {
        return jwt.verify(token, jwtSecret) !== null;
    } catch (e) {
        return false;
    }
}

export async function comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}