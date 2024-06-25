/**
 * Starts, stops, and handles the server stuff
 */
import { config } from 'dotenv'

config(); // Load the environment variables

import { closeDatabase, backup, init } from './Database';
import { Request, Response, NextFunction } from 'express'
import * as cron from 'node-cron'; // For scheduling backups
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { closeBrowser } from './Browser';
import { logger } from './Logger'

import https from 'https';
import path from 'path';

const app = express();
const useHTTPS = process.env.USE_HTTPS === 'true'
const PORT_STRING = process.env.PORT || '3000'
let PORT = 3000;

try {
    PORT = parseInt(PORT_STRING);
    if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
        throw new Error(`Invalid port number: ${PORT_STRING}`);
    }
} catch (err) {
    logger.error(err);
}

if (useHTTPS) {
    // Load SSL certificates
    const privateKey = fs.readFileSync('../ssl/server.key', 'utf8');
    const certificate = fs.readFileSync('../ssl/server.cert', 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port 3000`);
    });
} else {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port 3000`);
    });
}

/**
 * Create the image folder
 */
if (!fs.existsSync('public/')) {
    fs.mkdirSync('public/');
}

if (!fs.existsSync('public/images/')) {
    fs.mkdirSync('public/images/');
}

/**
 * Create database/backup folder
 */
if (!fs.existsSync('../data/')) {
    fs.mkdirSync('../data/');
    fs.mkdirSync('../data/backups/');
}
/**
 * Create log folder
 */
if (!fs.existsSync('../log/')) {
    fs.mkdirSync('../log/');
}

init(); // Initialize the database

/**
 * Initialize middlewares
 */
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
app.use(express.json());
app.use(express.static('public'));

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('images')) {
        next();
        return;
    }
    logger.info(`${req.method} ${req.url} ${req.ip}`)
    next();
});

/**
 * ROUTES 
 */

import routes from './routes/routes';

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

cron.schedule('0 0 * * *', () => { // This will run at midnight every day
    backup();
});

async function cleanup() {
    console.log('Closing database connection...');
    await closeBrowser();
    closeDatabase();
    process.exit();
}

// ON close event
process.on('SIGINT', cleanup);

process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
process.on('uncaughtException', (err) => {
    logger.error(err)
    console.error('Uncaught Exception:', err);
    cleanup();
});