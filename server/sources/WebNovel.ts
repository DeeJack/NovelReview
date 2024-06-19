import { Novel } from "../Novel";
import { Source } from "./Source";
import puppeteer = require('puppeteer');
import fs = require('fs');
import axios from 'axios';
import cheerio = require('cheerio');

export class WebNovel implements Source {
    browser = null;

    /**
     * Takes a screenshot of the page and saves it as an image
     * @param imageUrl The DIRECT URL of the image to download
     * @param destinationPath The path to save the image to
     */
    async downloadImage(imageUrl: string, destinationPath: string) {
        if (!this.browser) {
            this.browser = await puppeteer.launch({ headless: true });

        }
        const page = await this.browser.newPage();

        try {
            await page.goto(imageUrl, { waitUntil: 'networkidle2' });
            const imageBuffer = await page.screenshot();
            fs.writeFileSync(destinationPath, imageBuffer);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async search(keywords: string): Promise<Novel[]> {
        let url = `https://www.webnovel.com/search?keywords=${keywords}`
        const response = await axios.get(url);
        let novels = [];
        const html = response.data;
        const $ = cheerio.load(html);
        const resultBooksContainer = $('div.result-books-container > script');
        const jsonText = $(resultBooksContainer[0]).text().trim();
        if (jsonText === '') {
            return novels;
        }
        let jsonData = JSON.parse(jsonText);
        jsonData = jsonData.itemListElement;
        for (var i = 0; i < jsonData.length; i++) {
            novels.push({
                title: jsonData[i].name,
                url: jsonData[i].url,
                source: "webnovel",
                image: jsonData[i].image
            });
        }
        return novels;
    }

    closeBrowser() {
        if (this.browser)
            this.browser.close()
    }
}
