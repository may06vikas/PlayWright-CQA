import { test } from '@playwright/test';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { CompareCards } from '../src/compareCards.page';
import { createWorkerTests, GenericMethods, closeGeoPopUpModal } from '../../../utils/test-helpers';
import * as path from 'path';
import { config } from '../../../utils/config';

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

// Create worker-based tests
createWorkerTests('Compare Cards Tests', async ({ page, workerIndex, totalWorkers }) => {
    // Initialize page objects and utilities
    const compareCards = new CompareCards(page);
    const genericMethods = new GenericMethods(page);
    
    // Get the URLs assigned to this worker from the Excel sheets
    const urlsBySheet = await getUrlsForWorker(workerIndex, totalWorkers);
    console.log(`Worker ${workerIndex + 1} received ${Array.from(urlsBySheet.keys()).length} sheets to process`);
    
    // Process each sheet's URLs
    for (const [sheetName, urls] of urlsBySheet.entries()) {
        console.log(`Worker ${workerIndex + 1} processing sheet ${sheetName} with ${urls.length} URLs`);
        
        // Define headers for the results spreadsheet
        const sheetResults = [[
            "URL", "Country", "Locale", "Compare Cards Visibility", "Card Count",
            "Card 1 Title", "Card 2 Title", "Card 3 Title",
            "CTAs", "CTA Hrefs", "Validation Status"
        ]];
        
        // Process each URL in the current sheet
        for (const url of urls) {
            try {
                console.log(`Processing URL: ${url}`);
                
                // Step 1: Navigate to the URL and handle initial page setup
                await page.goto(url);
                await closeGeoPopUpModal(page);
                await page.waitForTimeout(5000); // Wait for page to stabilize
                
                // Step 2: Extract country/locale and get component data
                const { country, locale } = genericMethods.extractCountryAndLocale(url);
                const cardData = await compareCards.getCompareCardsData();
                
                // Step 3: Validate the data and create output row
                const validationStatus = validateCardData(cardData);
                sheetResults.push([
                    url,
                    country,
                    locale,
                    cardData.compareCardsVis,
                    cardData.compareCardsCount,
                    cardData.compareCard1Title,
                    cardData.compareCard2Title,
                    cardData.compareCard3Title,
                    cardData.compareCardsCTAs.join(" | "),      // Join array values for Excel
                    cardData.compareCardsCTAHrefs.join(" | "),  // Join array values for Excel
                    validationStatus
                ]);
                
            } catch (error) {
                // Record errors in the results with placeholders
                console.error(`Error processing URL ${url}:`, error);
                sheetResults.push([
                    url, "Error", "Error", "Error", "0", "Error", "Error", "Error", "Error", "Error", "Fail"
                ]);
            }
        }
        
        // Save the results to an Excel file
        try {
            const resultsBySheet = new Map([[sheetName, sheetResults]]);
            const outputPath = path.join(process.cwd(), config.paths.testResults, `compareCards_worker${workerIndex + 1}_${sheetName}.xlsx`);
            await saveDataToExcelMultiSheet(resultsBySheet, outputPath);
            console.log(`Results saved to ${outputPath}`);
        } catch (error) {
            console.error(`Error saving results:`, error);
        }
    }
});

/**
 * Validates compare cards data against expected criteria
 * 
 * Validation rules:
 * 1. All cards must be visible (not "Not Visible")
 * 2. All cards must have titles
 * 3. There must be exactly 3 cards
 * 4. There must be 3 CTAs with corresponding hrefs
 * 
 * @param cardData - The compare cards data to validate
 * @returns "Pass" if all validation checks pass, otherwise "Fail"
 */
function validateCardData(cardData: CompareCardsData): string {
    // Check required fields
    if (cardData.compareCardsVis === "Not Visible" || 
        cardData.compareCard1Title === "" || 
        cardData.compareCard2Title === "" || 
        cardData.compareCard3Title === "") {
        return "Fail";
    }
    
    // Check card count
    if (parseInt(cardData.compareCardsCount) !== 3) {
        return "Fail";
    }
    
    // Check CTAs and their hrefs
    if (cardData.compareCardsCTAs.length !== 3 || cardData.compareCardsCTAHrefs.length !== 3) {
        return "Fail";
    }
    
    return "Pass";
} 