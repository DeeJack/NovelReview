import { Browser, launch, Page } from "puppeteer";

/**
 * Maximum number of pages that can be opened at once, for performance reasons
 */
const MAX_PAGES = 5;

let browser: Browser;
/**
 * Needed, otherwise if the function is called multiple times before the browser is opened, it will open multiple browsers
 */
let isBrowserOpen: boolean = false;
let openedPagesCount: number = 0;

export async function getPage() : Promise<Page> {
    if (!isBrowserOpen) {
        isBrowserOpen = true; 
        browser = await launch({ headless: false });
    }

    /**
     * Since I'm using the boolean variable to check, the browser is still not opened at this stage, if the function gets called multiple times before the browser opens
     */
    while (!browser) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await new Promise(resolve => setImmediate(resolve));
    }

    /**
     * Until there are pages available, wait
     */
    while (openedPagesCount >= MAX_PAGES) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await new Promise(resolve => setImmediate(resolve));
    }
    openedPagesCount++;
    return await browser.newPage();
}

export async function closeBrowser(): Promise<void> {
    if (browser)
        await browser.close();
}

export function closePage() {
    openedPagesCount--;
}