import { test } from '@playwright/test';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { CompareCards } from '../src/compareCards.page';
import { createWorkerTests, extractCountryAndLocale, closeGeoPopUpModal } from '../../../utils/test-helpers';
import * as path from 'path';
import { config } from '../../../utils/config';

interface CompareCardsData {
    compareCardsVis: string;
    compareCardsCount: string;
    compareCard1Title: string;
    compareCard2Title: string;
    compareCard3Title: string;
    compareCardsCTAs: string[];
    compareCardsCTAHrefs: string[];
}

function validateCompareCardsData(compareCardsData: CompareCardsData): string {
    const requiredFields = [
        { value: compareCardsData.compareCardsVis, name: "Compare Cards Visibility" },
        { value: compareCardsData.compareCard1Title, name: "Card 1 Title" },
        { value: compareCardsData.compareCard2Title, name: "Card 2 Title" },
        { value: compareCardsData.compareCard3Title, name: "Card 3 Title" }
    ];

    const failedFields = requiredFields.filter(field => 
        field.value === "Not Visible" || field.value === "NA" || field.value === ""
    );

    if (failedFields.length > 0) {
        console.log("Failed fields:", failedFields.map(f => f.name).join(", "));
        return "Fail";
    }

    if (parseInt(compareCardsData.compareCardsCount) !== 3) {
        console.log(`Card count validation failed. Expected 3, found ${compareCardsData.compareCardsCount}`);
        return "Fail";
    }

    if (compareCardsData.compareCardsCTAs.length !== 3 || compareCardsData.compareCardsCTAHrefs.length !== 3) {
        console.log("CTA validation failed. Expected 3 CTAs and hrefs");
        return "Fail";
    }

    return "Pass";
}

function createOutputRow(url: string, country: string, locale: string, compareCardsData: CompareCardsData): any[] {
    const validationStatus = validateCompareCardsData(compareCardsData);
    return [
        url,
        country,
        locale,
        compareCardsData.compareCardsVis,
        compareCardsData.compareCardsCount,
        compareCardsData.compareCard1Title,
        compareCardsData.compareCard2Title,
        compareCardsData.compareCard3Title,
        compareCardsData.compareCardsCTAs.join(" | "),
        compareCardsData.compareCardsCTAHrefs.join(" | "),
        validationStatus
    ];
}

createWorkerTests('Compare Cards Tests', async ({ page, workerIndex, totalWorkers }) => {
    const compareCards = new CompareCards(page);
    
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
                
                const { country, locale } = extractCountryAndLocale(url);
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
}); 