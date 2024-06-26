import { Novel } from "../models/Novel";
import { Source } from "./Source";
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getPage, closePage } from "../Browser";
import { logger } from "../Logger";

export class WebNovel implements Source {
    /**
     * Takes a screenshot of the page and saves it as an image
     * @param imageUrl The DIRECT URL of the image to download
     * @param destinationPath The path to save the image to
     */
    async downloadImage(imageUrl: string, destinationPath: string) {
        const page = await getPage();

        try {
            await page.goto(imageUrl, { waitUntil: 'networkidle2' });
            const imageBuffer = await page.screenshot();
            fs.writeFileSync(destinationPath, imageBuffer);
        } catch (error) {
            logger.error(error)
            console.error('Error:', error);
        } finally {
            await page.close();
            closePage();
        }
    }

    async search(keywords: string): Promise<Novel[]> {
        let url = `https://www.webnovel.com/search?keywords=${keywords}`
        const response = await axios.get(url);
        let novels = [];
        const html = response.data;
        const $ = cheerio.load(html as string);
        const resultBooksContainer = $('div.result-books-container > script');
        const jsonText = $(resultBooksContainer[0]).text().trim();
        if (jsonText === '') {
            return novels;
        }
        let jsonData = JSON.parse(jsonText);
        jsonData = jsonData.itemListElement;
        for (var i = 0; i < jsonData.length; i++) {
            // let hashedUrl = crypto.createHash('md5').update(jsonData[i].url).digest('hex');
            // let imagePath = `public/images/${hashedUrl}.png`;
            // let imageUrl = jsonData[i].image;
            // if (!fs.existsSync(imagePath))
            //     this.downloadImage(imageUrl, imagePath); // Asynchronous
            novels.push({
                title: jsonData[i].name,
                url: jsonData[i].url,
                source: "webnovel",
                image: jsonData[i].image?.replace('http:', 'https:')
            });
        }
        return novels;
    }
}
