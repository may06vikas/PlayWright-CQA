import { test } from '@playwright/test';
import { readUrlsFromSheet, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { MerchCard } from '../src/merchCard.page';
import { createParallelTests, extractCountryAndLocale } from '../../../utils/test-helpers';
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

async function runMerchCardTest({ page, sheetName, testResultsDir }) {
    const merchCard = new MerchCard(page);
    const urls = await readUrlsFromSheet(sheetName);
    console.log(`Processing ${urls.length} URLs from sheet: ${sheetName}`);
    
    if (urls.length === 0) {
        console.error(`No URLs found in sheet ${sheetName}`);
        return;
    }

    const sheetResults = [[
        "URL", "Country", "Locale", "Tab Name", "Merch Card Visibility", 
        "Merch Card Title", "Merch Card CTA", "CTA Href", "Card Count", "GenAI Bar", "Validation Status"
    ]];
    
    for (const url of urls) {
        try {
            console.log(`Processing URL: ${url} from sheet: ${sheetName}`);
            await page.goto(url);
            await page.waitForTimeout(7000);
            
            const { country, locale } = extractCountryAndLocale(url);
            
            const businessTab = page.locator("//div[contains(@daa-lh,'tabs') or contains(@class,'tabs')][not(contains(@id,'demo') or contains(@id,'tabs-genaipdfstudents') or contains(@id,'tabs-prompts'))]//div[@class='tab-list-container' and @data-pretext='undefined']/button[not(./ancestor::div[contains(@class,'radio') and @id])]").nth(1);
            await businessTab.click();
            await page.waitForTimeout(5000);
            
            const merchCardData = await merchCard.getMerchCardData();
            const row = createOutputRow(url, country, locale, merchCardData);
            sheetResults.push(row);
            
        } catch (error) {
            console.error(`Error processing URL ${url} from sheet ${sheetName}:`, error);
            sheetResults.push([
                url, "Error", "Error", "Error", "Error", "Error", "Error", "Error", "0", "Error", "Fail"
            ]);
        }
    }
    
    try {
        const resultsBySheet = new Map<string, any[]>();
        resultsBySheet.set(sheetName, sheetResults);
        
        const outputPath = path.join(testResultsDir, `merchCard_results_${sheetName}.xlsx`);
        await saveDataToExcelMultiSheet(resultsBySheet, outputPath);
        console.log(`Results saved for sheet ${sheetName} to ${outputPath}`);
    } catch (error) {
        console.error(`Error saving results for sheet ${sheetName}:`, error);
    }
}

// Create parallel tests for each sheet
const sheetNames = ['dcPages1', 'dcPages2', 'dcPages3'];
createParallelTests(runMerchCardTest, sheetNames); 