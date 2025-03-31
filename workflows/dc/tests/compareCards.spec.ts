import { test } from '@playwright/test';
import { readUrlsFromSheet, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { CompareCards } from '../src/compareCards.page';
import { createParallelTests, extractCountryAndLocale } from '../../../utils/test-helpers';
import * as path from 'path';
import * as fs from 'fs';

function validateCompareCardsData(compareCardsData: any): string {
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

function createOutputRow(url: string, country: string, locale: string, compareCardsData: any): any[] {
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

async function runCompareCardsTest({ page, sheetName, testResultsDir }) {
    const compareCards = new CompareCards(page);
    const urls = await readUrlsFromSheet(sheetName);
    console.log(`Processing ${urls.length} URLs from sheet: ${sheetName}`);
    
    if (urls.length === 0) {
        console.error(`No URLs found in sheet ${sheetName}`);
        return;
    }

    const sheetResults = [[
        "URL", "Country", "Locale", "Compare Cards Visibility", "Card Count",
        "Card 1 Title", "Card 2 Title", "Card 3 Title",
        "CTAs", "CTA Hrefs", "Validation Status"
    ]];
    
    for (const url of urls) {
        try {
            console.log(`Processing URL: ${url} from sheet: ${sheetName}`);
            await page.goto(url);
            await page.waitForTimeout(7000);
            
            const { country, locale } = extractCountryAndLocale(url);
            const compareCardsData = await compareCards.getCompareCardsData();
            
            const row = createOutputRow(url, country, locale, compareCardsData);
            sheetResults.push(row);
            
        } catch (error) {
            console.error(`Error processing URL ${url} from sheet ${sheetName}:`, error);
            sheetResults.push([
                url, "Error", "Error", "Error", "0", "Error", "Error", "Error", "Error", "Error", "Fail"
            ]);
        }
    }
    
    try {
        const resultsBySheet = new Map<string, any[]>();
        resultsBySheet.set(sheetName, sheetResults);
        
        const outputPath = path.join(testResultsDir, `compareCards_results_${sheetName}.xlsx`);
        await saveDataToExcelMultiSheet(resultsBySheet, outputPath);
        console.log(`Results saved for sheet ${sheetName} to ${outputPath}`);
    } catch (error) {
        console.error(`Error saving results for sheet ${sheetName}:`, error);
    }
}

// Create parallel tests for each sheet
const sheetNames = ['dcPages1', 'dcPages2', 'dcPages3'];
createParallelTests(runCompareCardsTest, sheetNames); 