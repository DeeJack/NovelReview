/**
 * Starts, stops, and handles the server stuff
 */
import { config } from 'dotenv'

config(); // Load the environment variables

import { getLibrary, closeDatabase, backup, saveReview, deleteNovel, init, updateNovel, getNextNovel, updateNext } from './Database';
import { Request, Response, NextFunction } from 'express'
import { getMTLNovelSource, getWebNovelSource, sources } from './sources/SourceUtils';
import * as cron from 'node-cron';

import fs from 'fs';
import express from 'express';
const app = express();
import cors from 'cors';
import { closeBrowser } from './Browser';
import { onLogin, onRegister, checkJWT } from './Authentication';
import { JwtPayload } from 'jsonwebtoken';

/**
 * Create the image folder
 */
if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images');
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

/**
 * USER handlers
 */

app.post('/api/login', async (request, response) => {
    let username = request.body.username;
    let password = request.body.password;

    let result = await onLogin(username, password);
    if (result) {
        response.send({ token: result });
    } else {
        response.status(401).send('Invalid login');
    }
});

app.post('/api/register', async (request, response) => {
    let username = request.body.username;
    let password = request.body.password;

    let result = await onRegister(username, password);
    if (result) {
        response.send({ token: result });
    } else {
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
        .catch((err) => res.send('Error getting library'));
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
        .catch(() => res.send('Error updating library'))
});

/**
 * Delete a novel from the library
 */
app.delete('/api/library/', (req: Request, res: Response) => {
    const url = req.body.url

    deleteNovel(url, req.username)
        .then(() => res.send('Successfully deleted from library'))
        .catch((err) => res.send('Error deleting from library'));
});

/**
 * NEXT SECTION HANDLERS
 */

app.get('/api/next', (req: Request, res: Response) => {
    getNextNovel(req.username)
        .then((novel) => res.send(novel))
        .catch((err) => res.send('Error getting next novel'));
});

app.put('/api/next', (req: Request, res: Response) => {
    const text = req.body.text

    updateNext(text, req.username)
        .then(() => res.send('Successfully updated next'))
        .catch((err) => res.send('Error updating next'));
});

app.listen(3000, '0.0.0.0', () => {
    console.log(`Server is running on port 3000`);
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
    console.error('Uncaught Exception:', err);
    cleanup();
});