import express, { Request, Response } from 'express';import { getMTLNovelSource, getWebNovelSource, sources } from '../sources/SourceUtils';
import { getLibrary, closeDatabase, backup, saveReview, deleteNovel, init, updateNovel, getNextNovel, updateNext } from '../Database';
import { logger } from '../Logger'

export const libraryRouter = express.Router();

// Extend the Request interface
declare module 'express-serve-static-core' {
    interface Request {
        username: string; // Use optional property to avoid issues if not set
    }
}

/**
 * Search from all sources
 */
libraryRouter.get('/search', (req: Request, res: Response): void => {
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
libraryRouter.get('/mtlnovel/search', (req, res) => {
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
libraryRouter.get('/webnovel/search', (req, res) => {
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
libraryRouter.get('/library', async (req: Request, res) => {
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
libraryRouter.post('/library', (req, res) => {
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
            res.send({ image: `/images/${id}.png` });
        })
        .catch((err) => {
            logger.error(err)
            res.send('Error saving review')
        });
});

/**
 * Update a novel in the library
 */
libraryRouter.put('/library', async (req, res) => {
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
libraryRouter.delete('/library/', (req, res) => {
    const url = req.body.url

    deleteNovel(url, req.username)
        .then(() => res.send('Successfully deleted from library'))
        .catch((err) => {
            logger.error(err)
            res.send('Error deleting from library')
        });
});