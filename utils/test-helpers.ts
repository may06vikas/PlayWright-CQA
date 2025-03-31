import { Page, test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Types
export interface TestOptions {
    page: Page;
    sheetName: string;
    testResultsDir: string;
}

export interface CountryLocale {
    country: string;
    locale: string;
}

/**
 * Extracts country and locale from a URL
 */
export function extractCountryAndLocale(url: string): CountryLocale {
    try {
        const urlParts = url.split(".com/")[1]?.split("/") || [];
        const countryLocale = urlParts[0] || "";
        
        if (countryLocale.includes("_")) {
            const [country, locale] = countryLocale.split("_");
            return { country, locale };
        } else if (countryLocale.length === 2) {
            return { country: countryLocale, locale: countryLocale };
        } else {
            return { country: countryLocale, locale: countryLocale };
        }
    } catch (error) {
        console.error("Error extracting country and locale:", error);
        return { country: "", locale: "" };
    }
}

/**
 * Creates parallel tests for each sheet
 */
export function createParallelTests(testFn: (options: TestOptions) => Promise<void>, sheetNames: string[]) {
    for (const sheetName of sheetNames) {
        test(`Test for sheet ${sheetName}`, async ({ page }) => {
            const testResultsDir = path.join(process.cwd(), 'test-results');
            if (!fs.existsSync(testResultsDir)) {
                fs.mkdirSync(testResultsDir, { recursive: true });
            }
            
            await testFn({ page, sheetName, testResultsDir });
        });
    }
}

/**
 * Common modal handling
 */
export async function closeGeoPopUpModal(page: Page) {
    try {
        const modal = page.locator("div[class*='modal']");
        if (await modal.isVisible()) {
            await modal.locator("button").click();
        }
    } catch (error) {
        console.log("No geo popup modal found or error closing it:", error);
    }
} 