import { test, expect } from '@playwright/test';
import { readUrlsFromExcel, saveDataToExcel } from '../../../utils/excelJS_utils';
import { MerchCard } from '../src/merchCard.page';
import * as path from 'path';
import * as fs from 'fs';

// Types
interface MerchCardData {
    merchCardVis: string;
    merchCardTitle: string;
    merchCardCTA: string;
    merchCardCTAHref: string;
    tabName: string;
    cardCount: string;
    genAIBar: string;
}

function extractCountryAndLocale(url: string): { country: string; locale: string } {
    try {
        const urlParts = url.split(".com/")[1]?.split("/") || [];
        const countryLocale = urlParts[0] || ""; // This will get country/locale code from URL
        
       
        if (countryLocale.includes("_")) {          // Handle different URL patterns
            
            // For URLs with country_locale code like en_us
            const [country, locale] = countryLocale.split("_");
            console.log("Extracted country code:", country);
            console.log("Extracted locale:", locale);
            return { country, locale };
        } else if (countryLocale.length === 2) {
            // For URLs with only country code like us
            console.log("Extracted country code:", countryLocale);
            console.log("Extracted locale:", countryLocale);
            return { country: countryLocale, locale: countryLocale };
        } else {
            // For URLs with only locale code like en
            console.log("Extracted country code:", countryLocale);
            console.log("Extracted locale:", countryLocale);
            return { country: countryLocale, locale: countryLocale };
        }
    } catch (error) {
        console.error("Error extracting country and locale:", error);
        return { country: "", locale: "" };
    }
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

    // Check card count
    const cardCount = parseInt(merchCardData.cardCount);
    if (cardCount !== 1) {
        console.log(`Card count validation failed. Expected 1, found ${cardCount}`);
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

test.describe.parallel('Merch Card Validation', () => {
    test('DC_milo_verifyMerchCard', async ({ page }) => {
        const merchCard = new MerchCard(page);
        
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
        
        
        const outputData: any[] = [[
            "URL", "Country", "Locale", "Tab Name", "Merch Card Visibility", 
            "Merch Card Title", "Merch Card CTA", "CTA Href", "Card Count", "GenAI Bar", "Validation Status"
        ]];
        
        //Looping and processing each URL
        for (const url of urls) {
            try {
                console.log(`Processing URL: ${url}`);
                
                // Navigate to URL
                await page.goto(url);
                console.log(`URL opened: ${url}`);
                
                // Wait for initial load
                await page.waitForTimeout(7000);
                
                // Close geo popup modal if present
                await merchCard.closeGeoPopUpModal();
                
                // Extract country and locale
                const { country, locale } = extractCountryAndLocale(url);
                
                // Click on business tab
                const businessTab = page.locator("//div[contains(@daa-lh,'tabs') or contains(@class,'tabs')][not(contains(@id,'demo') or contains(@id,'tabs-genaipdfstudents') or contains(@id,'tabs-prompts'))]//div[@class='tab-list-container' and @data-pretext='undefined']/button[not(./ancestor::div[contains(@class,'radio') and @id])]").nth(1);
                await businessTab.click();
                console.log("Clicked on business tab");
                
                // Wait for tab content to load
                await page.waitForTimeout(5000);
                
                // Get merch card data
                const merchCardData = await merchCard.getMerchCardData();
                console.log("Merch Card Data:", merchCardData);
                
                // Add row to output data
                outputData.push(createOutputRow(url, country, locale, merchCardData));
                
                // Save intermediate results after each URL
                try {
                    const outputPath = path.join(testResultsDir, 'merchCard_results.xlsx');
                    await saveDataToExcel(outputData, outputPath);
                    console.log(`Intermediate results saved to ${outputPath}`);
                } catch (error) {
                    console.error("Error saving intermediate results:", error);
                }
                
            } catch (error) {
                console.error(`Error processing URL ${url}:`, error);
                // Add error row to output data
                outputData.push([
                    url, "Error", "Error", "Error", "Error", "Error", "Error", "Error", "0", "Error", "Fail"
                ]);
                
                // Save results after error
                try {
                    const outputPath = path.join(testResultsDir, 'merchCard_results.xlsx');
                    await saveDataToExcel(outputData, outputPath);
                    console.log(`Results saved after error to ${outputPath}`);
                } catch (saveError) {
                    console.error("Error saving results after error:", saveError);
                }
            }
        }
        
        // Save final results
        try {
            const outputPath = path.join(testResultsDir, 'merchCard_results.xlsx');
            await saveDataToExcel(outputData, outputPath);
            console.log(`Final results saved to ${outputPath}`);
        } catch (error) {
            console.error("Error saving final results:", error);
        }
        

        
    });
});


