import { Page } from '@playwright/test';

export class CommonUtils {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Wait for element to be visible and click
     * @param selector Element selector
     */
    async clickElement(selector: string): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'visible' });
        await this.page.click(selector);
    }

    /**
     * Wait for element and type text
     * @param selector Element selector
     * @param text Text to type
     */
    async typeText(selector: string, text: string): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'visible' });
        await this.page.fill(selector, text);
    }

    /**
     * Get text from element
     * @param selector Element selector
     * @returns Text content
     */
    async getText(selector: string): Promise<string> {
        await this.page.waitForSelector(selector, { state: 'visible' });
        return await this.page.textContent(selector) || '';
    }

    /**
     * Wait for navigation to complete
     */
    async waitForNavigation(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    // /**
    //  * Take screenshot
    //  * @param name Screenshot name
    //  */
    async takeScreenshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `./reports/screenshots/${name}.png` });
    }
} 