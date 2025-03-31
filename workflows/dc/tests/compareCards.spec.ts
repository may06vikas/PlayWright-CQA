import { test, expect } from '@playwright/test';
import { readUrlsFromExcel, saveDataToExcel } from '../../../utils/excelJS_utils';
import { CompareCards } from '../src/compareCards.page';
import * as path from 'path';
import * as fs from 'fs';

function extractCountryAndLocale(url: string): { country: string; locale: string } {
    try {
        const urlParts = url.split(".com/")[1]?.split("/") || [];
        const countryLocale = urlParts[0] || "";
        
        if (countryLocale.includes("_")) {
            const [country, locale] = countryLocale.split("_");
            console.log("Extracted country code:", country);
            console.log("Extracted locale:", locale);
            return { country, locale };
        } else if (countryLocale.length === 2) {
            console.log("Extracted country code:", countryLocale);
            console.log("Extracted locale:", countryLocale);
            return { country: countryLocale, locale: countryLocale };
        } else {
            console.log("Extracted country code:", countryLocale);
            console.log("Extracted locale:", countryLocale);
            return { country: countryLocale, locale: countryLocale };
        }
    } catch (error) {
        console.error("Error extracting country and locale:", error);
        return { country: "", locale: "" };
    }
}

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

    // Check card count
    const cardCount = parseInt(compareCardsData.compareCardsCount);
    if (cardCount !== 3) {
        console.log(`Card count validation failed. Expected 3, found ${cardCount}`);
        return "Fail";
    }

    // Check CTAs
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

test.describe('Compare Cards Validation', () => {
    test('DC_milo_verifyCompareCards', async ({ page }) => {
        const compareCards = new CompareCards(page);
        
        // Create test-results directory if it doesn't exist
        const testResultsDir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(testResultsDir)) {
            fs.mkdirSync(testResultsDir, { recursive: true });
        }
        
        // Read URLs from Excel
        let urls: string[] = [];
        try {
            urls = await readUrlsFromExcel();
            console.log(`Found ${urls.length} URLs to test`);
        } catch (error) {
            console.error('Error reading URLs from Excel:', error);
            return;
        }
        
        if (urls.length === 0) {
            console.error('No URLs found in Excel file');
            return;
        }
        
        // Initialize output data array with updated column headers
        const outputData: any[] = [[
            "URL", "Country", "Locale", "Compare Cards Visibility", "Card Count",
            "Card 1 Title", "Card 2 Title", "Card 3 Title",
            "CTAs", "CTA Hrefs", "Validation Status"
        ]];
        
        // Process each URL
        for (const url of urls) {
            try {
                console.log(`Processing URL: ${url}`);
                
                // Navigate to URL
                await page.goto(url);
                console.log(`URL opened: ${url}`);
                
                // Wait for initial load
                await page.waitForTimeout(7000);
                
                // Close geo popup modal if present
                await compareCards.closeGeoPopUpModal();
                
                // Extract country and locale
                const { country, locale } = extractCountryAndLocale(url);
                
                // Get compare cards data
                const compareCardsData = await compareCards.getCompareCardsData();
                console.log("Compare Cards Data:", compareCardsData);
                
                // Add row to output data
                outputData.push(createOutputRow(url, country, locale, compareCardsData));
                
                // Save intermediate results after each URL
                try {
                    const outputPath = path.join(testResultsDir, 'compareCards_results.xlsx');
                    await saveDataToExcel(outputData, outputPath);
                    console.log(`Intermediate results saved to ${outputPath}`);
                } catch (error) {
                    console.error("Error saving intermediate results:", error);
                }
                
            } catch (error) {
                console.error(`Error processing URL ${url}:`, error);
                // Add error row to output data
                outputData.push([
                    url, "Error", "Error", "Error", "0", "Error", "Error", "Error", "Error", "Error", "Fail"
                ]);
                
                // Save results after error
                try {
                    const outputPath = path.join(testResultsDir, 'compareCards_results.xlsx');
                    await saveDataToExcel(outputData, outputPath);
                    console.log(`Results saved after error to ${outputPath}`);
                } catch (saveError) {
                    console.error("Error saving results after error:", saveError);
                }
            }
        }
        
        // Save final results
        try {
            const outputPath = path.join(testResultsDir, 'compareCards_results.xlsx');
            await saveDataToExcel(outputData, outputPath);
            console.log(`Final results saved to ${outputPath}`);
        } catch (error) {
            console.error("Error saving final results:", error);
        }
    });
}); 