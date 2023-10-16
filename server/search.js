// This file contains the code needed to search MTLNovel and WebNovel for novels, given a query.
// It returns a list of objects with the following properties:
// - title: the title of the novel
// - url: the url of the novel
// - source: the source of the novel (either "mtlnovel" or "webnovel")
// - image: the url of the novel's cover image
const axios = require('axios')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer');
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// const natural = require('natural');
let browser = null;
(async () => {
    browser = await puppeteer.launch({headless: 'new'});
})();

const downloadImage = async (imageUrl, destinationPath) => {
    if (imageUrl.includes("mtlnovel.com")) {
        try {
            let response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'Referer': 'https://www.mtlnovel.com/',
                    'User-Agent':
                        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
                        "Chrome/83.0.4103.116 Safari/537.36",
                }
            })
            if (response.status !== 200) {
                throw new Error('Response status was not 200')
            }
            if (response.data.length === 0) {
                if (!imageUrl.endsWith('.webp')) {
                    return downloadImage(imageUrl + '.webp', destinationPath)
                }
                else
                    throw new Error('Response data was empty')
            }
            fs.writeFileSync(destinationPath, Buffer.from(response.data, 'binary'));
            return
        } catch(e) {
            console.log('Cloudflare?', e)
            // Cloudflare detected, open browser using selenium to solve the challenge and then download the image
            const chromeOptions = new chrome.Options();
            chromeOptions.addArguments('--disable-notifications');
            chromeOptions.addArguments('--window-size=1920,1080');

            // Initialize WebDriver using Chrome
            const driver = new webdriver.Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();

            try {
                await driver.get(imageUrl);
                await driver.sleep(5000);
                // Save the screenshot as an image
                const cookies = await driver.manage().getCookies();
                const formattedCookies = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
                axios.defaults.headers.common['Cookie'] = formattedCookies;
                const imageBase64 = await driver.takeScreenshot();
                const imageBuffer = Buffer.from(imageBase64, 'base64');
                fs.writeFileSync(destinationPath, imageBuffer);
            } catch (error) {
                console.error('Error:', error);
            }
            finally {
                await driver.quit();
            }
            
            return
        }
    }

    if (!browser)
        browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();

    try {
        await page.goto(imageUrl, { waitUntil: 'networkidle2' });

        const imageBuffer = await page.screenshot();
        fs.writeFileSync(destinationPath, imageBuffer);
        console.log('Image saved successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
};

// This function searches MTLNovel for novels, given a query.
// URL: https://www.mtlnovel.com/wp-admin/admin-ajax.php?action=autosuggest&q=test&__amp_source_origin=https://www.mtlnovel.com
async function searchMTL(query) {
    let url = `https://www.mtlnovel.com/wp-admin/admin-ajax.php?action=autosuggest&q=${query}&__amp_source_origin=https://www.mtlnovel.com`
    const searchUrl =
        'https://www.mtlnovel.com/wp-admin/admin-ajax.php?action=autosuggest&q=' +
        query +
        '&__amp_source_origin=https%3A%2F%2Fwww.mtlnovel.com';


    let headers = new Headers({
        headers: {
            referer: 'https://www.mtlnovel.com/',
            'User-Agent':
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
        }
    });
    // TODO: open browser if it detects cloudflare
    // const { cookies = '' } = loadCookiesFromStorage();

    // if (cookies) {
    //     headers.append('cookie', cookies);
    // }
    const res = await fetch(searchUrl, { headers });
    let results = []
    try {
        results = await res.json();
    } catch (e) {
        console.log(e)
        return []
    }
    let novels = []
    results = results.items[0].results
    for (var i = 0; i < results.length; i++) {
        if (results[i] === undefined)
            continue
        novels.push({
            title: results[i].title,
            url: results[i].permalink,
            source: "mtlnovel",
            image: results[i].thumbnail
        })
    }
    return novels
}

// This function searches WebNovel for novels, given a query.
// URL: 	https://www.webnovel.com/search?keywords=test
// THe response is an HTML file
// The json is in the div.result-books-container
function searchWebnovel(query) {
    let url = `https://www.webnovel.com/search?keywords=${query}`
    return axios.get(url)
        .then(function (response) {
            let novels = []
            const html = response.data;
            const $ = cheerio.load(html);

            const resultBooksContainer = $('div.result-books-container > script');
            const jsonText = $(resultBooksContainer[0]).text().trim();
            if (jsonText === '') {
                return novels
            }
            let jsonData = JSON.parse(jsonText);
            jsonData = jsonData.itemListElement

            for (var i = 0; i < jsonData.length; i++) {
                novels.push({
                    title: jsonData[i].name,
                    url: jsonData[i].url,
                    source: "webnovel",
                    image: jsonData[i].image
                })
            }
            return novels
        })
}

const express = require('express');
const app = express();
const cors = require('cors');
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('./library.db')



// Create table library if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS library (id INTEGER PRIMARY KEY, title TEXT, url TEXT, image TEXT, chapter INT, source TEXT, rating FLOAT, review TEXT, kisses TEXT, tags TEXT, added_at datetime default current_timestamp)')

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.json());

app.use(express.static('public'));

app.get('/search', (req, res) => {
    const query = req.query.query
    const mtlnovel = searchMTL(query)
    const webnovel = searchWebnovel(query)

    Promise.all([mtlnovel, webnovel]).then(function (values) {
        // console.log(values[0].concat(values[1]))
        const searchResults = values[0].concat(values[1])

        res.send(searchResults)
    });
});

app.get('/api/mtlnovel/search', (req, res) => {
    const query = req.query.query
    searchMTL(query).then(function (results) {
        res.send(results)
    });
});

app.get('/api/webnovel/search', (req, res) => {
    const query = req.query.query
    searchWebnovel(query).then(function (results) {
        res.send(results)
    });
});

app.get('/api/library', (req, res) => {
    const selectQuery = `SELECT id, title, url, image, source, rating, review, chapter, kisses, tags FROM library ORDER BY added_at DESC`

    db.all(selectQuery, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            let originalImage = row.image
            if (!fs.existsSync(`./public/images/${row.id}.png`)) {
                downloadImage(originalImage, `./public/images/${row.id}.png`)
            }
            
            row.image = `http://localhost:3000/images/${row.id}.png`
        });
        res.send(rows)
    });
});

app.post('/api/library', (req, res) => {
    const title = req.body.title
    const url = req.body.url
    const image = req.body.image
    const source = req.body.source
    const rating = req.body.rating
    const review = req.body.review

    db.all('SELECT * FROM library WHERE url = ?', [url], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows.length > 0) {
            res.send('Already in library')
            return
        }

        const insertQuery = `INSERT INTO library (title, url, image, source, rating, review) 
        VALUES (?, ?, ?, ?, ?, ?)`

        db.run(insertQuery, [title, url, image, source, rating, review], (err) => {
            if (err) {
                throw err;
            }
            db.all('SELECT last_insert_rowid() as id', [], async (err, rows) => {
                if (err) {
                    throw err;
                }
                downloadImage(image, `./public/images/${rows[0]['id']}.png`)
                res.send({ image: `http://localhost:3000/images/${rows[0]['id']}.png`})
            });

            // downloadImage(image, `./public/images/${}.png`)
        });
    });
});

app.put('/api/library', (req, res) => {
    const rating = req.body.rating
    const review = req.body.review
    const chapter = req.body.chapter
    const kisses = req.body.kisses
    const tags = req.body.tags
    const url = req.body.url

    const updateQuery = `UPDATE library SET rating = ?, review = ?, chapter = ?, kisses = ?, tags = ? WHERE url = ?`

    db.run(updateQuery, [rating, review, chapter, kisses, tags, url], (err) => {
        if (err) {
            throw err;
        }
        res.send('Successfully updated library')
    });
});

app.delete('/api/library/', (req, res) => {
    const url = req.body.url

    const deleteQuery = `DELETE FROM library WHERE url = ?`

    db.run(deleteQuery, [url], (err) => {
        if (err) {
            throw err;
        }
        res.send('Successfully deleted from library')
    });
});

app.listen(3000)

const cron = require('node-cron')

cron.schedule('0 0 * * *', () => { // This will run at midnight every day
    db.serialize(() => {
        db.backup(`./backups/backup-${new Date().toISOString()}.db`, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Backup completed successfully.');
        });
    });

    // Delete backups older than 7 days
    const fs = require('fs');
    const directory = './backups';

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            const backupDate = new Date(file.split('-')[1].split('.')[0])
            const today = new Date()
            const diffTime = Math.abs(today - backupDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 7) {
                fs.unlink(`${directory}/${file}`, err => {
                    if (err) throw err;
                });
            }
        }
    });
});

// ON close event
process.on('SIGINT', async () => {
    console.log('Closing database connection...');
    db.close();
    await browser.close();
    process.exit();
});

// const { Builder } = require('selenium-webdriver');

// async function onStartup() {
//     let driver = await new Builder().forBrowser('chrome').build();
//     try {
//         // Open the protected page with Selenium
//         await driver.get('https://mtlnovel.com');

//         // Retrieve the cookies
//         const cookies = await driver.manage().getCookies();

//         // Pass the cookies to Axios
//         savedCookies = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
//         console.log('Done!')
//         app.listen(3000);
//         // Make authorized requests using Axios
//         // const response = await axios.get('https://mtlnovel.com');

//         // console.log(response.data);
//     } finally {
//         console.log('Error')
//         await driver.quit();
//     }
// }
// onStartup();

// axios.get(searchUrl,
// }).then(function (response) {
//     console.log(response.data);
// });
// return

// const browser = await puppeteer.launch({
//     headless: false, //launch in non-headless mode so you can see graphics
//     defaultViewport: null,
//     args: ['--start-minimized']
// });
// const page = await browser.newPage();
// await page.goto(url);
// await page.setRequestInterception(true);
// const session = await page.target().createCDPSession();
// const { windowId } = await session.send('Browser.getWindowForTarget');
// await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
// // await browser._connection.send('Browser.windowMinimized');

// let content = await page.content();
// // console.log(content)
// const $ = cheerio.load(content);
// const json = $('pre').text().trim();
// console.log(json)
// jsonContent = JSON.parse(json)

// // await page.waitForSelector('#challenge-form');
// // await page.evaluate(() => {
// //     document.querySelector('#challenge-form').submit();
// // });
// // await page.waitForNavigation();

// // content = await page.content();
// // console.log(content)

// // Wait for some content to load (if needed)
// // const jsonContent = await page.evaluate(() => {
// //     // Assuming the content is in JSON format, replace this with the correct selector or logic to get the JSON data
// //     console.log(document)
// //     const jsonString = document.textContent;
// //     return JSON.parse(jsonString);
// // });

// // const content = await page.content();

// console.log(jsonContent);

// await browser.close();
// return novels
