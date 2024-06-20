/**
 * Starts, stops, and handles the server stuff
 */
import { getLibrary, close, backup, saveReview, deleteNovel, init, updateNovel, deleteNovelFromNext, getNextNovel, addNext, updateNext } from './Database';
import { Request, Response, NextFunction } from 'express'
import { getMTLNovelSource, getWebNovelSource, sources } from './sources/SourceUtils';
import * as cron from 'node-cron';

import fs from 'fs';
import express from 'express';
const app = express();
import cors from 'cors';

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

    let library = await getLibrary(orderBy.toString(), direction.toString())
    res.send(library)
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

    saveReview(url, title, image, source, rating, review)
        .then((id) => {
            res.send({ image: `http://localhost:3000/images/${id}.png` });
        })
        .catch((err) => {
            throw err;
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

    updateNovel(url, rating, review, chapter, notes, tags)
        .then(() => res.send('Successfully updated library'))
        .catch(() => res.send('Error updating library'))
});

/**
 * Delete a novel from the library
 */
app.delete('/api/library/', (req: Request, res: Response) => {
    const url = req.body.url

    deleteNovel(url)
        .then(() => res.send('Successfully deleted from library'))
        .catch((err) => res.send('Error deleting from library'));
});

/**
 * NEXT SECTION HANDLERS
 */

app.get('/api/next', (req: Request, res: Response) => {
    getNextNovel()
        .then((novel) => res.send(novel))
        .catch((err) => res.send('Error getting next novel'));
});

app.post('/api/next', (req: Request, res: Response) => {
    const title = req.body.title
    const url = req.body.url
    const image = req.body.image

    addNext(title, url, image)
        .then(() => res.send('Successfully added to next'))
        .catch((err) => res.send('Error adding to next'));
});

app.put('/api/next', (req: Request, res: Response) => {
    const text = req.body.text
    
    updateNext(text)
        .then(() => res.send('Successfully updated next'))
        .catch((err) => res.send('Error updating next'));
});

app.delete('/api/next/', (req: Request, res: Response) => {
    const id = req.body.id

    deleteNovelFromNext(id)
        .then(() => res.send('Successfully deleted from next'))
        .catch((err) => res.send('Error deleting from next'));
});

app.listen(3000, '0.0.0.0', () => {
    console.log(`Server is running on port 3000`);
});

cron.schedule('0 0 * * *', () => { // This will run at midnight every day
    backup();
});

// ON close event
process.on('SIGINT', async () => {
    console.log('Closing database connection...');
    close();
    getWebNovelSource().closeBrowser();
    process.exit();
});

