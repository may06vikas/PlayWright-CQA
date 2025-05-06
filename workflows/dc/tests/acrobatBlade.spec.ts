import { test } from '@playwright/test';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { AcrobatBlade, AcrobatBladeData } from '../src/acrobatBlade.page';
import { createWorkerTests, GenericMethods, closeGeoPopUpModal } from '../../../utils/test-helpers';
import * as path from 'path';
import { config } from '../../../utils/config';
import { CommonUtils } from '../../../utils/common';

/**
 * ========================================================================
 * Acrobat Blade Component Test Automation
 * ========================================================================
 */

/**
 * Creates a row of data for the results spreadsheet
 * @param url The URL being tested
 * @param country The country code extracted from the URL
 * @param locale The locale code extracted from the URL
 * @param data The blade data extracted from the page
 * @returns An array representing a row in the results spreadsheet
 */
function createOutputRow(url: string, country: string, locale: string, data: AcrobatBladeData): any[] {
    return [
        url,
        country,
        locale,
        data.bladeVis,
        data.bladeTitle,
        data.bladeDesc,
        data.bladeBuyNowBtn,
        data.bladeBuyNowHref,
        data.bladeBuyNowOsiId,
        data.productName,
        data.storeCommitmentUrl,
        data.storeEmailUrl,
        data.cartSubtotalLabel,
        data.cartSubtotalPrice,
        data.cartTotalLabel,
        data.cartTotalPrice,
        data.bladeCompareFeaturesLink,
        data.bladeCompareFeaturesHref,
        data.bladeCompareFeaturesModalText,

        validateBladeData(data)
    ];
}

/**
 * @param data The blade data to validate
 * @returns "Pass" if validation succeeds, "Fail" with reason otherwise
 */
function validateBladeData(data: AcrobatBladeData): string {
    if (data.bladeVis !== "Visible") {
        return "Fail - Blade not visible";
    }
    
    if (data.bladeTitle === "Not Visible") {
        return "Fail - Blade title not visible";
    }
    
    if (data.bladeDesc === "Not Visible") {
        return "Fail - Blade description not visible";
    }
    
    if (data.bladeBuyNowBtn === "Not Visible") {
        return "Fail - Buy Now button not visible";
    }
    
    if (data.bladeCompareFeaturesLink === "Not Visible") {
        return "Fail - Compare Features link not visible";
    }

    if (data.bladeBuyNowBtn !== "Not Visible") {
        if (data.cartSubtotalLabel === "Not Found") {
            return "Fail - Cart subtotal label not found";
        }
        if (data.cartSubtotalPrice === "Not Found") {
            return "Fail - Cart subtotal price not found";
        }
        if (data.cartTotalLabel === "Not Found") {
            return "Fail - Cart total label not found";
        }
        if (data.cartTotalPrice === "Not Found") {
            return "Fail - Cart total price not found";
        }
    }
    
    return "Pass";
}

createWorkerTests('Acrobat Blade Tests', async ({ page: oldPage, workerIndex, totalWorkers }) => {
    const browser = oldPage.context().browser();
    if (!browser) {
        throw new Error('Browser instance not found');
    }
    
    // Create fresh context for this worker
    const { context, page } = await CommonUtils.createFreshContext(browser);
    const acrobatBlade = new AcrobatBlade(page);
    const genericMethods = new GenericMethods(page);
    
    try {
        // Get URLs assigned to this worker
        const urlsBySheet = await getUrlsForWorker(workerIndex, totalWorkers);
        console.log(`Worker ${workerIndex + 1} received ${Array.from(urlsBySheet.keys()).length} sheets to process`);
        
        // Process each sheet's URLs
        for (const [sheetName, urls] of urlsBySheet.entries()) {
            console.log(`Worker ${workerIndex + 1} processing sheet ${sheetName} with ${urls.length} URLs`);
            
            const sheetResults = [[
                "URL", "Country", "Locale", "Blade Visibility", "Blade Title",
                "Blade Description", "Buy Now Button", "Buy Now Href", "Buy Now OSI ID",
                "Product Name", "Store Commitment URL", "Store Email URL",
                "Cart Subtotal Label", "Cart Subtotal Price", "Cart Total Label", "Cart Total Price",
                "Compare Features Link", "Compare Features Href", "Compare Features Modal Text",
                "Validation Status"
            ]];
            
            for (const url of urls) {
                try {
                    console.log(`Worker ${workerIndex + 1} processing URL: ${url}`);
                    await page.goto(url);
                    await page.waitForTimeout(4000); 
                    
                    await closeGeoPopUpModal(page);
                    
                    await page.waitForTimeout(5000);
                    
                    // Extract country and locale
                    const { country, locale } = await genericMethods.extractCountryAndLocaleInfo(url, process.env.ENV || 'stage');
                    const bladeData = await acrobatBlade.getAcrobatBladeData();
                    
                    if (bladeData.bladeBuyNowBtn !== "Not Visible") {
                        const buyNowData = await acrobatBlade.verifyBuyNowButton();
                        bladeData.productName = buyNowData.productName;
                        bladeData.storeCommitmentUrl = buyNowData.href;
                        bladeData.storeEmailUrl = buyNowData.emailUrl;
                        bladeData.cartSubtotalLabel = buyNowData.subtotalLabel;
                        bladeData.cartSubtotalPrice = buyNowData.subtotalPrice;
                        bladeData.cartTotalLabel = buyNowData.totalLabel;
                        bladeData.cartTotalPrice = buyNowData.totalPrice;
                    }

                    // if (bladeData.bladeCompareFeaturesLink !== "Not Visible") {
                    //     await acrobatBlade.verifyCompareFeaturesLinkStatus();
                    // }

                    const row = createOutputRow(url, country, locale, bladeData);
                    sheetResults.push(row);
                    
                } catch (error) {
                    console.error(`Worker ${workerIndex + 1} error processing URL ${url}:`, error);
                    sheetResults.push([
                        url, "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Fail"
                    ]);
                }
            }
            
            try {
                const resultsBySheet = new Map<string, any[]>();
                resultsBySheet.set(sheetName, sheetResults);
                
                const outputPath = path.join(process.cwd(), config.paths.testResults, `acrobatBlade_results_worker${workerIndex + 1}_${sheetName}.xlsx`);
                await saveDataToExcelMultiSheet(resultsBySheet, outputPath);
                console.log(`Worker ${workerIndex + 1} saved results for ${sheetName} to ${outputPath}`);
            } catch (error) {
                console.error(`Worker ${workerIndex + 1} error saving results for ${sheetName}:`, error);
            }
        }
    } finally {
        await context.close();
    }
}); 