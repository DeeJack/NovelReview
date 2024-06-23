/**
 * Starts, stops, and handles the server stuff
 */
import { config } from 'dotenv'

config(); // Load the environment variables

import { getLibrary, closeDatabase, backup, saveReview, deleteNovel, init, updateNovel, getNextNovel, updateNext } from './Database';
import { Request, Response, NextFunction } from 'express'
import { getMTLNovelSource, getWebNovelSource, sources } from './sources/SourceUtils';
import * as cron from 'node-cron'; // For scheduling backups
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { closeBrowser } from './Browser';
import { onLogin, onRegister, checkJWT } from './Authentication';
import { JwtPayload } from 'jsonwebtoken';
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
    const privateKey = fs.readFileSync(path.resolve(__dirname, '../ssl/server.key'), 'utf8');
    const certificate = fs.readFileSync(path.resolve(__dirname, '../ssl/server.cert'), 'utf8');
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
 * USER handlers
 */

app.post('/api/login', async (request, response) => {
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

app.post('/api/register', async (request, response) => {
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

    let user: JwtPayload = checkJWT(token)
    if (!user) {
        return res.sendStatus(403)
    }

    req.username = user.username

    next();
}

declare module "express" {
    interface Request {
        username: string;
    }
}

app.use(authenticateToken); // All routes after this will require authentication

/**
 * LIBRARY HANDLERS
 */

/**
 * Search from all sources
 */
app.get('/search', (req: Request, res: Response) => {
    const query = req.query.query || ''
    let sourcesSearch = sources.map(source => source.search(query.toString()))

    Promise.all(sourcesSearch)
        .then(function (values) {
            const searchResults = values.reduce((acc, val) => acc.concat(val), [])

            res.send(searchResults)
        })
        .catch((err) => {
            logger.error(err)
            res.send('Error searching for novels')
        });
});

/**
 * Search for a novel from MTLNovel
 */
app.get('/api/mtlnovel/search', (req: Request, res: Response) => {
    const query = req.query.query || ''
    getMTLNovelSource().search(query.toString())
        .then(function (results) {
            res.send(results)
        })
        .catch((err) => {
            logger.error(err)
            res.send('Error searching for novels')
        });
});

/**
 * Search for a novel from WebNovel
 */
app.get('/api/webnovel/search', (req: Request, res: Response) => {
    const query = req.query.query || ''
    getWebNovelSource().search(query.toString())
        .then(function (results) {
            res.send(results)
        })
        .catch((err) => {
            logger.error(err)
            res.send('Error searching for novels')
        });
});

/**
 * Get all the novels in the library, ordered based on the chosen parameters
 */
app.get('/api/library', async (req: Request, res: Response) => {
    const orderBy = req.query.orderBy || '0'
    const direction = req.query.direction || '0'

    getLibrary(orderBy.toString(), direction.toString(), req.username)
        .then((library) => res.send(library))
        .catch((err) => {
            logger.error(err)
            res.send('Error getting library')
        });
});

/**
 * Save a review to the db
 */
app.post('/api/library', (req: Request, res: Response) => {
    const title = req.body.title
    const url = req.body.url
    const image = req.body.image
    const source = req.body.source
    const rating = req.body.rating
    const review = req.body.review

    if (!url || !title || !source) {
        res.status(400).send('URL, title, and source required!')
    }

    saveReview(url, title, image, source, rating, review, req.username)
        .then((id) => {
            res.send({ image: `images/${id}.png` });
        })
        .catch((err) => {
            logger.error(err)
            res.send('Error saving review')
        });
});

/**
 * Update a novel in the library
 */
app.put('/api/library', async (req: Request, res: Response) => {
    const rating = req.body.rating
    const review = req.body.review
    const chapter = req.body.chapter
    const notes = req.body.notes
    const tags = req.body.tags
    const url = req.body.url
    const title = req.body.title

    if (!url || !title) {
        res.status(400).send('URL and title required!')
    }

    updateNovel(url, title, rating, review, chapter, notes, tags, req.username)
        .then(() => res.send('Successfully updated library'))
        .catch((err) => {
            logger.error(err)
            res.send('Error updating library')
        })
});

/**
 * Delete a novel from the library
 */
app.delete('/api/library/', (req: Request, res: Response) => {
    const url = req.body.url

    deleteNovel(url, req.username)
        .then(() => res.send('Successfully deleted from library'))
        .catch((err) => {
            logger.error(err)
            res.send('Error deleting from library')
        });
});

/**
 * NEXT SECTION HANDLERS
 */

app.get('/api/next', (req: Request, res: Response) => {
    getNextNovel(req.username)
        .then((novel) => res.send(novel))
        .catch((err) => {
            logger.error(err)
            res.send('Error getting next novel')
        });
});

app.put('/api/next', (req: Request, res: Response) => {
    const text = req.body.text

    updateNext(text, req.username)
        .then(() => res.send('Successfully updated next'))
        .catch((err) => {
            logger.error(err)
            res.send('Error updating next')
        });
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