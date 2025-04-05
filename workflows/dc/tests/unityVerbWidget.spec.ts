import { test } from '@playwright/test';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { UnityVerbWidget } from '../src/unityVerbWidget.page';
import { createWorkerTests, GenericMethods, closeGeoPopUpModal } from '../../../utils/test-helpers';
import * as path from 'path';
import { config } from '../../../utils/config';
import { CommonUtils } from '../../../utils/common';

interface UnityVerbData {
    widgetVis: string;
    widgetTitle: string;
    widgetCTA: string;
    widgetCTAHref: string;
    tabName: string;
}

function validateUnityVerbData(unityVerbData: UnityVerbData): string {
    const requiredFields = [
        { value: unityVerbData.widgetVis, name: "Widget Visibility" },
        { value: unityVerbData.widgetTitle, name: "Widget Title" },
        { value: unityVerbData.widgetCTA, name: "Widget CTA" },
        { value: unityVerbData.widgetCTAHref, name: "CTA Href" },
        { value: unityVerbData.tabName, name: "Tab Name" }
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
        unityVerbData.tabName,
        unityVerbData.widgetVis,
        unityVerbData.widgetTitle,
        unityVerbData.widgetCTA,
        unityVerbData.widgetCTAHref,
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
                "URL", "Country", "Locale", "Tab Name", "Widget Visibility", 
                "Widget Title", "Widget CTA", "CTA Href", "Validation Status"
            ]];
            
            for (const url of urls) {
                try {
                    console.log(`Worker ${workerIndex + 1} processing URL: ${url}`);
                    await page.goto(url);
                    await page.waitForTimeout(2000); // Wait for initial load
                    
                    // Handle geo popup if present
                    await closeGeoPopUpModal(page);
                    
                    await page.waitForTimeout(config.timeouts.pageLoad); // Wait for page to stabilize
                    
                    // Extract country and locale using the new method
                    const urlInfo = await genericMethods.getCountryNameFromURL(process.env.ENV || 'stage', url);
                    const country = urlInfo.get('country')?.replace('/', '') || '';
                    const locale = urlInfo.get('locale')?.replace('/', '') || '';
                    
                    const businessTab = page.locator("//div[contains(@daa-lh,'tabs') or contains(@class,'tabs')][not(contains(@id,'demo') or contains(@id,'tabs-genaipdfstudents') or contains(@id,'tabs-prompts'))]//div[@class='tab-list-container' and @data-pretext='undefined']/button[not(./ancestor::div[contains(@class,'radio') and @id])]").nth(1);
                    await businessTab.click();
                    await page.waitForTimeout(config.timeouts.tabSwitch);
                    
                    const unityVerbData = await unityVerb.getUnityVerbData();
                    const row = createOutputRow(url, country, locale, unityVerbData);
                    sheetResults.push(row);
                    
                } catch (error) {
                    console.error(`Worker ${workerIndex + 1} error processing URL ${url}:`, error);
                    sheetResults.push([
                        url, "Error", "Error", "Error", "Error", "Error", "Error", "Error", "Fail"
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