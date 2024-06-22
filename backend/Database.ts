/**
 * Contains functions used for the SQLite database
 */
import * as sqlite3 from 'sqlite3'
import * as fs from 'fs';
import { Novel } from './models/Novel';
import { getSourceFromURL, sources } from './sources/SourceUtils';
import * as path from 'path';
import { comparePassword } from './Authentication';

/**
 * Instance for the SQLite database
 */
const db = new sqlite3.Database('../data/library.db')
const IMAGE_PATH = './public/images'

/**
 * FUNCTIONS FOR THE DATABASE
 */

/**
 * Create tables if they do not exist
 */
export async function init() {
    try {
        // Create table library if it doesn't exist
        await runQueryAsync('CREATE TABLE IF NOT EXISTS library (id INTEGER PRIMARY KEY, title TEXT, url TEXT, image TEXT, chapter INT, source TEXT, rating FLOAT, review TEXT, notes TEXT, tags TEXT, added_at datetime default current_timestamp)')
        // db.run('CREATE TABLE IF NOT EXISTS next (id INTEGER PRIMARY KEY, order int, title TEXT, url TEXT, comments TEXT, read BOOLEAN, image TEXT)')
        await runQueryAsync('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)')
        await runQueryAsync('CREATE TABLE IF NOT EXISTS nextTemp (id INTEGER PRIMARY KEY, description TEXT)')
        await runQueryAsync('INSERT OR IGNORE INTO nextTemp (id, description) VALUES (1, "")')
    } catch (e) {
        console.log(e)
    }
}

/**
 * The lib sqlite3 module does not support async/await, so we wrap the function in a promise
 */
async function selectAllAsync<T>(query: string, params?: any[]) {
    return new Promise<T[]>(function (resolve, reject) {
        db.all(query, params, function (err, rows: T[]) {
            if (err) { return reject(err); }
            resolve(rows);
        });
    });
}

/**
 * The lib sqlite3 module does not support async/await, so we wrap the function in a promise
 */
async function runQueryAsync<T>(query: string, params?: any[]) {
    return new Promise<T[]>(function (resolve, reject) {
        db.run(query, params, function (err, rows: T[]) {
            if (err) { return reject(err); }
            resolve(rows);
        });
    });
}

/**
 * Closes the database
 */
export function closeDatabase() {
    db.close()
}

/**
 * Backup the database to a file. The backup is saved in the backups folder, with the current date as the name.
 * The function also deletes backups older than 7 days.
 */
export function backup() {
    const directory = './backups';

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }

    db.backup(`./backups/backup-${new Date().toISOString()}.db`, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Backup completed successfully.');
    });

    // Delete backups older than 7 days
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            const backupDate = new Date(file.split('-')[1].split('.')[0])
            const today = new Date()
            const diffTime = Math.abs(today.getTime() - backupDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 7) {
                fs.unlink(`${directory}/${file}`, err => {
                    if (err) throw err;
                });
            }
        }
    });
}

/**
 * The backup function is added with Prototype, so it is not included in the type definitions for sqlite3
 */
declare module "sqlite3" {
    interface Database {
        backup: (path: string, callback: (err: Error | null) => void) => void;
    }
}

/**
 * SECTION "LIBRARY" (saved novels)
 */

/**
 * Get all novels in the library, ordered based on the parameters
 * @param orderBy The parameter to order by, possible values are 0 (date added), 1 (rating), 2 (last chapter), 3 (title)
 * @param direction The direction to order by, possible values are 0 (descending) and 1 (ascending)
 */
export async function getLibrary(orderBy: string, direction: string): Promise<Novel[]> {
    let order = 'added_at'
    let directionString = 'DESC'

    /**
     * Set the parameter we want to order by, and the direction, for the SQL query.
     */
    if (orderBy === '1')
        order = 'rating'
    else if (orderBy === '2')
        order = 'chapter'
    else if (orderBy === '3')
        order = 'title'

    if (direction === '1')
        directionString = 'ASC'

    const selectQuery = `SELECT id, title, url, image, source, rating, review, chapter, notes, tags FROM library ORDER BY ${order} ${directionString}`

    /**
     * Download the images for all the novels found, if they weren't downloaded already
     */
    let novels = await selectAllAsync<Novel>(selectQuery);
    novels.forEach(async (row) => {
        let originalImage = row.image
        let imagePath = path.join(IMAGE_PATH, `${row.id}.png`)
        // If the image was not downloaded already
        if (!fs.existsSync(imagePath)) {
            let novelSource = getSourceFromURL(row.url);
            await novelSource.downloadImage(originalImage, imagePath)
        }

        row.image = `images/${row.id}.png`
    });
    return novels;
}

/**
 * Saves a review to the library
 */
export async function saveReview(url: string, title: string, image: string, source: string, rating: string, review: string): Promise<number> {
    /**
     * Check if the novel is already in the library
     */
    let rows = await selectAllAsync<{ url: string }>('SELECT * FROM library WHERE url = ?');
    if (rows.length > 0) {
        throw new Error('Novel already in library');
    }

    const insertQuery = `INSERT INTO library (title, url, image, source, rating, review) 
        VALUES (?, ?, ?, ?, ?, ?)`;

    try {
        await runQueryAsync(insertQuery, [title, url, image, source, rating, review]);
    } catch (e) {
        throw e;
    }


    let lastId = await selectAllAsync<{ id: number }>('SELECT last_insert_rowid() as id');
    let novelSource = getSourceFromURL(url);
    await novelSource.downloadImage(image, `./public/images/${lastId[0]['id']}.png`);
    return lastId[0]['id'];
}


/**
 * Modifies a novel in the library
 */
export async function updateNovel(url: string, title: string, rating: number, review: string, chapter: number, notes: string, tags: string) {
    const updateQuery = `UPDATE library SET rating = ?, review = ?, chapter = ?, notes = ?, tags = ?, title = ? WHERE url = ?`

    try {
        await runQueryAsync(updateQuery, [rating, review, chapter, notes, tags, title, url]);
    } catch (e) {
        throw e;
    }
}

/**
 * Delete a novel from the library
 */
export async function deleteNovel(url: string) {
    const deleteQuery = `DELETE FROM library WHERE url = ?`;
    const idQuery = `SELECT id FROM library WHERE url = ?`;

    try {
        // Get the ID from the URL
        let ids = await selectAllAsync<{ id: number }>(idQuery, [url]);
        // Delete the novel
        await runQueryAsync(deleteQuery, [url]);
        // Delete the thumbnail
        fs.unlinkSync(`./public/images/${ids[0]['id']}.png`);
    } catch (e) {
        throw e;
    }
}

/**
 * SECTION "NEXT" (novels to read next)
 */

/**
 * Delete a novel from the "next" section (I don't think it's implemented yet)
 */
export async function deleteNovelFromNext(id: string) {
    const deleteQuery = `DELETE FROM next WHERE id = ?`

    try {
        await runQueryAsync(deleteQuery, [id]);
    } catch (e) {
        throw e;
    }
}

export async function getNextNovel() {
    const selectQuery = 'SELECT description FROM nextTemp WHERE id = 1'

    try {
        let rows = await selectAllAsync<{ description: string }>(selectQuery);
        return rows[0];
    } catch (e) {
        throw e;
    }
}

export async function addNext(title: string, url: string, image: string) {
    const insertQuery = `INSERT INTO next (title, url, image) VALUES (?, ?, ?)`

    try {
        await runQueryAsync(insertQuery, [title, url, image]);
    } catch (e) {
        throw e
    }
}

export async function updateNext(description: string) {
    const updateQuery = 'UPDATE nextTemp SET description = ? WHERE id = 1'

    try {
        await runQueryAsync(updateQuery, [description]);
    } catch (e) {
        throw e
    }
}

export async function login(username: string, clearPassword: string): Promise<boolean> {
    const selectQuery = 'SELECT * FROM users WHERE username = ?';

    try {
        let rows = await selectAllAsync<{ password: string }>(selectQuery, [username]);
        if (rows.length === 0) {
            return false;
        }
        let hashedPassword = rows[0].password;
        return await comparePassword(clearPassword, hashedPassword);
    } catch (e) {
        console.log(e);
        return false;
    }
}

export async function register(username: string, password: string): Promise<boolean> {
    let existingUsers = await selectAllAsync<{ username: string }>('SELECT username FROM users WHERE username = ?', [username]);

    if (existingUsers.length > 0) {
        return false;
    }

    const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)'

    try {
        await runQueryAsync(insertQuery, [username, password]);
        return true;
    } catch (e) {
        return false;
    }
}