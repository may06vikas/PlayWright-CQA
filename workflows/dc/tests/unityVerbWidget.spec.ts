import { test } from '@playwright/test';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { UnityVerbWidget } from '../src/unityVerbWidget.page';
import { createWorkerTests, GenericMethods, closeGeoPopUpModal } from '../../../utils/test-helpers';
import * as path from 'path';
import { config } from '../../../utils/config';
import { CommonUtils } from '../../../utils/common';

interface UnityVerbData {
    blockVis: string;
    blockVisAttr: string;
    title: string;
    logo: string;
    BlockText: string;
    BlockDesc: string;
    BlockImg: string;
    BlockFileUpload: string;
    BlockFileUploadTxt: string;
    BlockFooterIcon: string;
    footerText: string;
    LinkCount: string;
    TermsLink: string;
    CountryInFooterLink: string;
    ToolTipPre: string;
    ToolTipText: string;
    OnHoverBlockVis: string;
    blockTooltipDisp: string;
}

function validateUnityVerbData(unityVerbData: UnityVerbData): string {
    const requiredFields = [
        { value: unityVerbData.blockVis, name: "Block Visibility" },
        { value: unityVerbData.title, name: "Title" },
        { value: unityVerbData.logo, name: "Logo" },
        { value: unityVerbData.BlockText, name: "Block Text" },
        { value: unityVerbData.BlockDesc, name: "Block Description" },
        { value: unityVerbData.BlockImg, name: "Block Image" },
        { value: unityVerbData.BlockFileUpload, name: "File Upload Button" },
        { value: unityVerbData.BlockFooterIcon, name: "Footer Security Icon" },
        { value: unityVerbData.footerText, name: "Footer Text" }
    ];

    const failedFields = requiredFields.filter(field => 
        field.value === "Not Visible" || field.value === "NA" || field.value === ""
    );

    if (failedFields.length > 0) {
        console.log("Failed fields:", failedFields.map(f => f.name).join(", "));
        return "Fail";
    }

    return "Pass";
}

function createOutputRow(url: string, country: string, locale: string, unityVerbData: UnityVerbData): any[] {
    const validationStatus = validateUnityVerbData(unityVerbData);
    return [
        url,
        country,
        locale,
        unityVerbData.blockVis,
        unityVerbData.blockVisAttr,
        unityVerbData.title,
        unityVerbData.logo,
        unityVerbData.BlockText,
        unityVerbData.BlockDesc,
        unityVerbData.BlockImg,
        unityVerbData.BlockFileUpload,
        unityVerbData.BlockFileUploadTxt,
        unityVerbData.BlockFooterIcon,
        unityVerbData.footerText,
        unityVerbData.LinkCount,
        unityVerbData.TermsLink,
        unityVerbData.CountryInFooterLink,
        unityVerbData.ToolTipPre,
        unityVerbData.ToolTipText,
        unityVerbData.OnHoverBlockVis,
        unityVerbData.blockTooltipDisp,
        validationStatus
    ];
}

// Create worker-based tests
createWorkerTests('Unity Verb Widget Tests', async ({ page: oldPage, workerIndex, totalWorkers }) => {
    const browser = oldPage.context().browser();
    if (!browser) {
        throw new Error('Browser instance not found');
    }
    
    // Create fresh context for this worker
    const { context, page } = await CommonUtils.createFreshContext(browser);
    const unityVerb = new UnityVerbWidget(page);
    const genericMethods = new GenericMethods(page);
    
    try {
        // Get URLs assigned to this worker
        const urlsBySheet = await getUrlsForWorker(workerIndex, totalWorkers);
        console.log(`Worker ${workerIndex + 1} received ${Array.from(urlsBySheet.keys()).length} sheets to process`);
        
        // Process each sheet's URLs
        for (const [sheetName, urls] of urlsBySheet.entries()) {
            console.log(`Worker ${workerIndex + 1} processing sheet ${sheetName} with ${urls.length} URLs`);
            
            const sheetResults = [[
                "URL", "Country", "Locale", "Block Visibility", "Block Attributes", 
                "Title", "Logo", "Block Text", "Block Description", "Block Image",
                "File Upload Button", "File Upload Text", "Footer Security Icon",
                "Footer Text", "Link Count", "Terms Links", "Country in Footer Links",
                "Tooltip Presence", "Tooltip Text", "Tooltip Hover Visibility",
                "Tooltip Display", "Validation Status"
            ]];
            
            for (const url of urls) {
                try {
                    console.log(`Worker ${workerIndex + 1} processing URL: ${url}`);
                    await page.goto(url);
                    await page.waitForTimeout(2000); // Wait for initial load
                    
                    // Handle geo popup if present
                    await unityVerb.closeGeoPopUpModal();
                    
                    // Scroll page to ensure all elements are loaded
                    await unityVerb.scrollToPageEndInSteps();
                    
                    await page.waitForTimeout(config.timeouts.pageLoad); // Wait for page to stabilize
                    
                    // Extract country and locale using the generic method
                    const { country, locale } = await genericMethods.extractCountryAndLocaleInfo(url, process.env.ENV || 'stage');
                    
                    // Log the extracted values for debugging
                    console.log('URL:', url);
                    console.log('Extracted country:', country);
                    console.log('Extracted locale:', locale);
                    
                    const unityVerbData = await unityVerb.getUnityBlockVerbWidgetFrictionless();
                    const row = createOutputRow(url, country, locale, unityVerbData);
                    sheetResults.push(row);
                    
                } catch (error) {
                    console.error(`Worker ${workerIndex + 1} error processing URL ${url}:`, error);
                    // Push a row with error status for failed URLs
                    sheetResults.push([
                        url, "Error", "Error", "Error", "Error", "Error", "Error", 
                        "Error", "Error", "Error", "Error", "Error", "Error", "Error",
                        "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Fail"
                    ]);
                }
            }
            
            try {
                const resultsBySheet = new Map<string, any[]>();
                resultsBySheet.set(sheetName, sheetResults);
                
                const outputPath = path.join(process.cwd(), config.paths.testResults, `unityVerb_results_worker${workerIndex + 1}_${sheetName}.xlsx`);
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