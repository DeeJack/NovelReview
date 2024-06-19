import { Novel } from "../Novel";
import { Source } from "./Source";
import axios from 'axios';
import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

const HEADERS = {
    'Referer': 'https://www.webnovel.com/',
    'User-Agent':
        "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/83.0.4103.116 Safari/537.36",
}

export class MTLNovel implements Source {
    async downloadImage(imageUrl: string, destinationPath: string) {
        try {
            this.downloadWithAxios(imageUrl, destinationPath)
        } catch (e) {
            console.error('Error downloading image with axios, cloudflare?')
            this.downloadWithPuppeteer(imageUrl, destinationPath)
        }
    }

    /**
     * Try downloading the image with axios, which is faster and easier.
     * This may not work due to the presence of Cloudflare
     * @param imageUrl URL of the image to download
     * @param destinationPath Path to save the image to
     */
    async downloadWithAxios(imageUrl: string, destinationPath: string) {
        let response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: HEADERS
        })
        if (response.status !== 200) {
            throw new Error('Response status was not 200')
        }
        if (response.data.length === 0) {
            if (!imageUrl.endsWith('.webp')) {
                return this.downloadImage(imageUrl + '.webp', destinationPath)
            }
            else
                throw new Error('Response data was empty')
        }
        fs.writeFileSync(destinationPath, Buffer.from(response.data, 'binary'));
    }

    /**
     * Download the image using Puppeteer, which is slower and more complex.
     * This is used when the image cannot be downloaded with axios, likely due to Cloudflare
     * @param imageUrl URL of the image to download
     * @param destinationPath Path to save the image to
     */
    async downloadWithPuppeteer(imageUrl: string, destinationPath: string) {
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
    }

    async search(keywords: string): Promise<Novel[]> {
        const searchUrl = `https://www.mtlnovel.com/wp-admin/admin-ajax.php?action=autosuggest&q=${keywords}&__amp_source_origin=https%3A%2F%2Fwww.mtlnovel.com`;
        let results: any;

        try {
            const res = await axios.get(searchUrl, { headers: HEADERS });
            results = res.data;
        } catch (e) {
            console.log(e);
            return [];
        }
        let novels: Novel[] = []
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
}
