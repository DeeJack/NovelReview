import { Browser, launch, Page } from "puppeteer";

let browser: Browser;

export async function getPage() : Promise<Page> {
    if (!browser)
        browser = await launch({ headless: false });
    return await browser.newPage();
}

export async function closeBrowser(): Promise<void> {
    await browser.close();
}