import { test } from '@playwright/test';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { CompareCards } from '../src/compareCards.page';
import { createWorkerTests, GenericMethods, closeGeoPopUpModal } from '../../../utils/test-helpers';
import * as path from 'path';
import { config } from '../../../utils/config';
import { CommonUtils } from '../../../utils/common';

/**
 * ========================================================================
 * Compare Cards Component Test Automation
 * ========================================================================
 * 
 * This test suite validates the Compare Cards component across multiple URLs.
 * It checks for:
 * - Visibility of compare cards component
 * - Presence of expected number of cards (3)
 * - Correct titles on each card
 * - Presence of CTAs with valid hrefs
 * 
 * The tests run in parallel across multiple workers for efficiency.
 * Results are saved to Excel files for each test sheet and worker.
 */

/**
 * Interface representing the data structure for Compare Cards components
 * This defines the shape of data that will be extracted from the web pages
 */
interface CompareCardsData {
    compareCardsVis: string;     // Visibility status
    compareCardsCount: string;   // Number of cards found
    compareCard1Title: string;   // Title of first card
    compareCard2Title: string;   // Title of second card
    compareCard3Title: string;   // Title of third card
    compareCardsCTAs: string[];  // Array of CTA texts
    compareCardsCTAHrefs: string[]; // Array of CTA URLs
}

/**
 * Creates a row of data for the results spreadsheet
 * @param url The URL being tested
 * @param country The country code extracted from the URL
 * @param locale The locale code extracted from the URL
 * @param data The compare cards data extracted from the page
 * @returns An array representing a row in the results spreadsheet
 */
function createOutputRow(url: string, country: string, locale: string, data: CompareCardsData): any[] {
    return [
        url,
        country,
        locale,
        data.compareCardsVis,
        data.compareCardsCount,
        data.compareCard1Title,
        data.compareCard2Title,
        data.compareCard3Title,
        data.compareCardsCTAs.join(" | "),      // Join array values for Excel
        data.compareCardsCTAHrefs.join(" | "),  // Join array values for Excel
        validateCardData(data)
    ];
}

/**
 * Validates the compare cards data
 * @param data The compare cards data to validate
 * @returns "Pass" if validation succeeds, "Fail" with reason otherwise
 */
function validateCardData(data: CompareCardsData): string {
    if (data.compareCardsVis !== "Visible") {
        return "Fail - Cards not visible";
    }
    
    const cardCount = parseInt(data.compareCardsCount);
    if (cardCount !== 3) {
        return `Fail - Expected 3 cards, found ${cardCount}`;
    }
    
    if (!data.compareCard1Title || !data.compareCard2Title || !data.compareCard3Title) {
        return "Fail - Missing card title(s)";
    }
    
    if (data.compareCardsCTAs.length !== 3 || data.compareCardsCTAHrefs.length !== 3) {
        return "Fail - Missing CTAs or CTA hrefs";
    }
    
    return "Pass";
}

createWorkerTests('Compare Cards Tests', async ({ page: oldPage, workerIndex, totalWorkers }) => {
    const browser = oldPage.context().browser();
    if (!browser) {
        throw new Error('Browser instance not found');
    }
    
    // Create fresh context for this worker
    const { context, page } = await CommonUtils.createFreshContext(browser);
    const compareCards = new CompareCards(page);
    const genericMethods = new GenericMethods(page);
    
    try {
        // Get URLs assigned to this worker
        const urlsBySheet = await getUrlsForWorker(workerIndex, totalWorkers);
        console.log(`Worker ${workerIndex + 1} received ${Array.from(urlsBySheet.keys()).length} sheets to process`);
        
        // Process each sheet's URLs
        for (const [sheetName, urls] of urlsBySheet.entries()) {
            console.log(`Worker ${workerIndex + 1} processing sheet ${sheetName} with ${urls.length} URLs`);
            
            const sheetResults = [[
                "URL", "Country", "Locale", "Compare Cards Visibility", "Card Count",
                "Card 1 Title", "Card 2 Title", "Card 3 Title",
                "CTAs", "CTA Hrefs", "Validation Status"
            ]];
            
            for (const url of urls) {
                try {
                    console.log(`Worker ${workerIndex + 1} processing URL: ${url}`);
                    await page.goto(url);
                    await page.waitForTimeout(2000); // Wait for initial load
                    
                    // Handle geo popup if present
                    await closeGeoPopUpModal(page);
                    
                    await page.waitForTimeout(5000); // Wait for page to stabilize
                    
                    // Extract country and locale using the new method
                    const urlInfo = await genericMethods.getCountryNameFromURL(process.env.ENV || 'stage', url);
                    const country = urlInfo.get('country')?.replace('/', '') || '';
                    const locale = urlInfo.get('locale')?.replace('/', '') || '';
                    
                    const compareCardsData = await compareCards.getCompareCardsData();
                    const row = createOutputRow(url, country, locale, compareCardsData);
                    sheetResults.push(row);
                    
                } catch (error) {
                    console.error(`Worker ${workerIndex + 1} error processing URL ${url}:`, error);
                    sheetResults.push([
                        url, "Error", "Error", "Error", "0", "Error", "Error", "Error", "Error", "Error", "Fail"
                    ]);
                }
            }
            
            try {
                const resultsBySheet = new Map<string, any[]>();
                resultsBySheet.set(sheetName, sheetResults);
                
                const outputPath = path.join(process.cwd(), config.paths.testResults, `compareCards_results_worker${workerIndex + 1}_${sheetName}.xlsx`);
                await saveDataToExcelMultiSheet(resultsBySheet, outputPath);
                console.log(`Worker ${workerIndex + 1} saved results for ${sheetName} to ${outputPath}`);
            } catch (error) {
                console.error(`Worker ${workerIndex + 1} error saving results for ${sheetName}:`, error);
            }
        }
    } finally {
        // Always close the context when done
        await context.close();
    }
}); 