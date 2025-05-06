import { test } from '@playwright/test';
import { ConsoleErrorPage } from '../src/consoleError.page';
import { getUrlsForWorker, saveDataToExcelMultiSheet } from '../../../utils/excelJS_utils';
import { CommonUtils } from '../../../utils/common';
import { GenericMethods, createWorkerTests, closeGeoPopUpModal } from '../../../utils/test-helpers';
import { config } from '../../../utils/config';
import * as path from 'path';

/**
 * ========================================================================
 * Console Error Detection Test Automation
 * ========================================================================
 */

interface ConsoleErrorData {
    sourceUrl: string;
    country: string;
    locale: string;
    pageStatus: number;
    consoleErrors: string;
    timestamp: string;
    validationStatus: string;
}

/**
 * Creates a row of data for the results spreadsheet
 */
function createOutputRow(data: ConsoleErrorData): any[] {
    return [
        data.sourceUrl,
        data.country,
        data.locale,
        data.pageStatus.toString(),
        data.consoleErrors,
        data.timestamp,
        data.validationStatus
    ];
}

/**
 * Validates the console error data
 */
function validateErrorData(data: ConsoleErrorData): string {
    if (data.pageStatus === 0) {
        return "Fail - Page failed to load";
    }
    if (data.pageStatus >= 400) {
        return `Fail - Page returned status ${data.pageStatus}`;
    }
    if (data.consoleErrors && data.consoleErrors !== 'No errors found') {
        return "Fail - Console errors detected";
    }
    return "Pass";
}

createWorkerTests('Console Error Tests', async ({ page: oldPage, workerIndex, totalWorkers }) => {
    const browser = oldPage.context().browser();
    if (!browser) {
        throw new Error('Browser instance not found');
    }
    
    // Create fresh context for this worker
    const { context, page } = await CommonUtils.createFreshContext(browser);
    const consoleErrorPage = new ConsoleErrorPage(page);
    const genericMethods = new GenericMethods(page);
    
    try {
        // Get URLs assigned to this worker
        const urlsBySheet = await getUrlsForWorker(workerIndex, totalWorkers);
        console.log(`Worker ${workerIndex + 1} received ${Array.from(urlsBySheet.keys()).length} sheets to process`);
        
        // Process each sheet's URLs
        for (const [sheetName, urls] of urlsBySheet.entries()) {
            console.log(`Worker ${workerIndex + 1} processing sheet ${sheetName} with ${urls.length} URLs`);
            
            const sheetResults: string[][] = [[
                "URL", "Country", "Locale", "Page Status",
                "Console Errors", "Timestamp", "Validation Status"
            ]];
            
            for (const url of urls) {
                try {
                    console.log(`Worker ${workerIndex + 1} processing URL: ${url}`);
                    
                    // Navigate to URL and wait for network idle
                    const response = await page.goto(url, { 
                        waitUntil: 'networkidle',
                        timeout: 60000 
                    });
                    const pageStatus = response?.status() || 0;
                    
                    // Wait for page load and handle geo popup
                    await page.waitForLoadState();
                    await closeGeoPopUpModal(page);
                    await page.waitForTimeout(2000); // Wait for any delayed errors
                    
                    // Extract country and locale
                    const urlInfo = await genericMethods.getCountryNameFromURL(process.env.ENV || 'stage', url);
                    const country = urlInfo.get('country')?.replace('/', '') || '';
                    const locale = urlInfo.get('locale')?.replace('/', '') || '';
                    
                    // Check for console errors
                    const errors = await consoleErrorPage.checkPageForErrors();
                    
                    const errorData: ConsoleErrorData = {
                        sourceUrl: url,
                        country,
                        locale,
                        pageStatus,
                        consoleErrors: errors.join(', ') || 'No errors found',
                        timestamp: new Date().toISOString(),
                        validationStatus: ''
                    };
                    
                    errorData.validationStatus = validateErrorData(errorData);
                    sheetResults.push([
                        errorData.sourceUrl,
                        errorData.country,
                        errorData.locale,
                        errorData.pageStatus.toString(),
                        errorData.consoleErrors,
                        errorData.timestamp,
                        errorData.validationStatus
                    ]);
                    
                } catch (error) {
                    console.error(`Worker ${workerIndex + 1} error processing URL ${url}:`, error);
                    sheetResults.push([
                        url,
                        "Error",
                        "Error",
                        "0",
                        `Error: ${error.message}`,
                        new Date().toISOString(),
                        "Fail - Processing error"
                    ]);
                }
            }
            
            try {
                const resultsBySheet = new Map<string, any[]>();
                resultsBySheet.set(sheetName, sheetResults);
                
                const outputPath = path.join(process.cwd(), config.paths.testResults, `consoleErrors_results_worker${workerIndex + 1}_${sheetName}.xlsx`);
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