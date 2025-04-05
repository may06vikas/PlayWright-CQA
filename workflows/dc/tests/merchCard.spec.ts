import { test } from '@playwright/test';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { MerchCard } from '../src/merchCard.page';
import { createWorkerTests, GenericMethods, closeGeoPopUpModal } from '../../../utils/test-helpers';
import { CommonUtils } from '../../../utils/common';
import * as path from 'path';

interface MerchCardData {
    merchCardVis: string;
    merchCardTitle: string;
    merchCardCTA: string;
    merchCardCTAHref: string;
    tabName: string;
    cardCount: string;
    genAIBar: string;
}

function validateMerchCardData(merchCardData: MerchCardData): string {
    const requiredFields = [
        { value: merchCardData.merchCardVis, name: "Merch Card Visibility" },
        { value: merchCardData.merchCardTitle, name: "Merch Card Title" },
        { value: merchCardData.merchCardCTA, name: "Merch Card CTA" },
        { value: merchCardData.merchCardCTAHref, name: "CTA Href" },
        { value: merchCardData.tabName, name: "Tab Name" },
        { value: merchCardData.genAIBar, name: "GenAI Bar" }
    ];

    const failedFields = requiredFields.filter(field => 
        field.value === "Not Visible" || field.value === "NA" || field.value === ""
    );

    if (failedFields.length > 0) {
        console.log("Failed fields:", failedFields.map(f => f.name).join(", "));
        return "Fail";
    }

    if (parseInt(merchCardData.cardCount) !== 1) {
        console.log(`Card count validation failed. Expected 1, found ${merchCardData.cardCount}`);
        return "Fail";
    }

    return "Pass";
}

function createOutputRow(url: string, country: string, locale: string, merchCardData: MerchCardData): any[] {
    const validationStatus = validateMerchCardData(merchCardData);
    return [
        url,
        country,
        locale,
        merchCardData.tabName,
        merchCardData.merchCardVis,
        merchCardData.merchCardTitle,
        merchCardData.merchCardCTA,
        merchCardData.merchCardCTAHref,
        merchCardData.cardCount,
        merchCardData.genAIBar,
        validationStatus
    ];
}

// Create test-results directory if it doesn't exist
const testResultsDir = path.join(process.cwd(), 'test-results');

// Create worker-based tests
createWorkerTests('MerchCard Tests', async ({ page: oldPage, workerIndex, totalWorkers }) => {
    const browser = oldPage.context().browser();
    if (!browser) {
        throw new Error('Browser instance not found');
    }
    
    // Create fresh context for this worker
    const { context, page } = await CommonUtils.createFreshContext(browser);
    const merchCard = new MerchCard(page);
    const genericMethods = new GenericMethods(page);
    
    try {
        // Get URLs assigned to this worker
        const urlsBySheet = await getUrlsForWorker(workerIndex, totalWorkers);
        console.log(`Worker ${workerIndex + 1} received ${Array.from(urlsBySheet.keys()).length} sheets to process`);
        
        // Process each sheet's URLs
        for (const [sheetName, urls] of urlsBySheet.entries()) {
            console.log(`Worker ${workerIndex + 1} processing sheet ${sheetName} with ${urls.length} URLs`);
            
            const sheetResults = [[
                "URL", "Country", "Locale", "Tab Name", "Merch Card Visibility", 
                "Merch Card Title", "Merch Card CTA", "CTA Href", "Card Count", "GenAI Bar", "Validation Status"
            ]];
            
            for (const url of urls) {
                try {
                    console.log(`Worker ${workerIndex + 1} processing URL: ${url}`);
                    await page.goto(url);
                    await page.waitForTimeout(4000); // Wait for initial load
                    
                    // Handle geo popup if present
                    await closeGeoPopUpModal(page);
                    
                    await page.waitForTimeout(5000); // Wait for page to stabilize
                    
                    const { country, locale } = genericMethods.extractCountryAndLocale(url);
                    
                    const businessTab = page.locator("//div[contains(@id,'compare') or contains(@id,'plans-and-pricing')]/child::div/child::div[contains(@class,'list')]/child::button").nth(1);
                    await businessTab.click();
                    await page.waitForTimeout(5000);
                    
                    const merchCardData = await merchCard.getMerchCardData();
                    const row = createOutputRow(url, country, locale, merchCardData);
                    sheetResults.push(row);
                    
                } catch (error) {
                    console.error(`Worker ${workerIndex + 1} error processing URL ${url}:`, error);
                    sheetResults.push([
                        url, "Error", "Error", "Error", "Error", "Error", "Error", "Error", "0", "Error", "Fail"
                    ]);
                }
            }
            
            try {
                const resultsBySheet = new Map<string, any[]>();
                resultsBySheet.set(sheetName, sheetResults);
                
                const outputPath = path.join(testResultsDir, `merchCard_results_worker${workerIndex + 1}_${sheetName}.xlsx`);
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