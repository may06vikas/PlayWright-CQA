import { test, expect } from '@playwright/test';
import { readUrlsFromExcel, saveDataToExcel } from '../../../utils/excelJS_utils';
import { UnityVerbWidget } from '../src/unityVerbWidget.page';
import * as path from 'path';
import * as fs from 'fs';

// Types
interface UnityVerbWidgetData {
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

interface ValidationResult {
    status: string;
    attrStatus: string;
    cntryStatus: string;
    errors: string[];
}

function validateUnityVerbWidget(widgetData: UnityVerbWidgetData, country: string): ValidationResult {
    const result: ValidationResult = {
        status: "Fail",
        attrStatus: "Fail",
        cntryStatus: "Fail",
        errors: []
    };

    try {
        // Check attributes
        const attr = widgetData.blockVisAttr.split("|");
        if (attr[0]?.trim().includes("verb-widget add-comment unity-enabled") && //made changes here on widget attribute name
            attr[1]?.trim().includes("unity workflow-acrobat")) {
            result.attrStatus = "Pass";
        } else {
            result.errors.push("Widget attributes validation failed");
        }

        // Check country in footer links with better logging
        console.log("Country to check:", country);
        console.log("Footer links data:", widgetData.CountryInFooterLink);
        
        // Split footer links by pipe and trim each part
        const footerLinks = widgetData.CountryInFooterLink.split("|").map(link => link.trim());
        console.log("Split footer links:", footerLinks);
        
        // Check if country exists in any of the footer links
        const countryFound = footerLinks.some(link => {
            const linkLower = link.toLowerCase();
            const countryLower = country.toLowerCase();
            
            // Check exact match
            if (linkLower === countryLower) {
                console.log(`Found exact country match: ${link}`);
                return true;
            }
            
            // Check without spaces
            const linkNoSpaces = linkLower.replace(/\s+/g, '');
            const countryNoSpaces = countryLower.replace(/\s+/g, '');
            if (linkNoSpaces === countryNoSpaces) {
                console.log(`Found country match without spaces: ${link}`);
                return true;
            }
            
            return false;
        });
        
        if (countryFound) {
            result.cntryStatus = "Pass";
            console.log("Country found in footer links");
        } else {
            result.errors.push(`Country '${country}' not found in footer links`);
            console.log("Country not found in footer links");
        }

        // Check all required elements
        const requiredChecks = [
            { condition: widgetData.blockVis !== "Not Visible", message: "Widget not visible" },
            { condition: widgetData.title !== "", message: "Title is empty" },
            { condition: widgetData.BlockFileUploadTxt !== "", message: "File upload button text is empty" },
            { condition: widgetData.footerText !== "", message: "Footer text is empty" },
            { condition: widgetData.BlockDesc !== "", message: "Description is empty" },
            { condition: widgetData.TermsLink !== "", message: "Terms link is empty" },
            { condition: widgetData.CountryInFooterLink !== "", message: "Country in footer link is empty" },
            { condition: widgetData.OnHoverBlockVis !== "", message: "Hover block visibility is empty" },
            { condition: widgetData.ToolTipText !== "", message: "Tooltip text is empty" },
            { condition: widgetData.blockTooltipDisp === "true", message: "Tooltip display is not true" },
            { condition: widgetData.BlockImg !== "Not Visible", message: "Block image is not visible" },
            { condition: widgetData.BlockText !== "", message: "Block text is empty" },
            { condition: widgetData.logo !== "Not Visible", message: "Logo is not visible" },
            { condition: widgetData.blockVisAttr !== "", message: "Block visibility attributes are empty" },
            { condition: widgetData.BlockFileUpload !== "Not Visible", message: "File upload button is not visible" },
            { condition: widgetData.BlockText !== "Not Visible", message: "Block text is not visible" },
            { condition: widgetData.BlockFileUploadTxt !== "Not Visible", message: "File upload button text is not visible" },
            { condition: widgetData.BlockDesc !== "Not Visible", message: "Description is not visible" },
            { condition: widgetData.BlockFooterIcon !== "Not Visible", message: "Footer icon is not visible" },
            { condition: widgetData.TermsLink !== "Not Visible", message: "Terms link is not visible" },
            { condition: widgetData.footerText !== "Not Visible", message: "Footer text is not visible" },
            { condition: widgetData.CountryInFooterLink !== "Not Visible", message: "Country in footer link is not visible" },
            { condition: widgetData.ToolTipText !== "Not Visible", message: "Tooltip text is not visible" },
            { condition: widgetData.ToolTipPre !== "Not Visible", message: "Tooltip pre is not visible" },
            { condition: widgetData.LinkCount === "2", message: "Link count is not 2" }
        ];

        const failedChecks = requiredChecks.filter(check => !check.condition);
        if (failedChecks.length === 0) {
            result.status = "Pass";
        } else {
            result.errors.push(...failedChecks.map(check => check.message));
        }

    } catch (error) {
        console.error("Error in validateUnityVerbWidget:", error);
        result.errors.push("Validation error occurred");
    }

    return result;
}

function extractCountryAndLocale(url: string): { country: string; locale: string } {
    try {
        // Extract country code (za) from URL
        const urlParts = url.split(".com/")[1]?.split("/") || [];
        const countryCode = urlParts[0] || ""; // This will get 'za' from the URL
        const locale = urlParts[1]?.split("-")[0] || ""; // This will get 'acrobat' from the URL
        
        console.log("Extracted country code:", countryCode);
        console.log("Extracted locale:", locale);
        
        return {
            country: countryCode,
            locale: locale
        };
    } catch (error) {
        console.error("Error extracting country and locale:", error);
        return { country: "", locale: "" };
    }
}

function createOutputRow(url: string, country: string, locale: string, widgetData: UnityVerbWidgetData, validationResult: ValidationResult): any[] {
    return [
        url, country, locale,
        widgetData.blockVis,
        widgetData.blockVisAttr,
        validationResult.attrStatus,
        widgetData.title,
        widgetData.logo,
        widgetData.BlockText,
        widgetData.BlockDesc,
        widgetData.BlockImg,
        widgetData.BlockFileUpload,
        widgetData.BlockFileUploadTxt,
        widgetData.BlockFooterIcon,
        widgetData.footerText,
        widgetData.LinkCount,
        widgetData.TermsLink,
        widgetData.CountryInFooterLink,
        validationResult.cntryStatus,
        widgetData.ToolTipPre,
        widgetData.ToolTipText,
        widgetData.OnHoverBlockVis,
        widgetData.blockTooltipDisp,
        validationResult.status
    ];
}

test.describe('Unity Verb Widget Validation', () => {
    test('DC_milo_verifyUnityVerbWidget', async ({ page }) => {
        const unityVerbWidget = new UnityVerbWidget(page);
        
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
        
        // Initialize output data array
        const outputData: any[] = [[
            "URL", "Country", "Locale", "Is Widget Visible?", "Widget Attributes", "Pass/Fail",
            "Widget Title", "Widget Logo Visible ?", "Widget Header", "Widget Description",
            "Widget Img Visible ?", "Widget Select File Btn Visible?", "Select File Btn Text",
            "Widget Footer Icon Visible ?", "Widget Footer Texts", "Widget Footer Links Count",
            "Widget Footer Links", "Widget Country In Footer Links", "Pass/Fail",
            "Widget Tool Tip Visible?", "Widget Tool Tip Text", "Widget Tool Tip Block Text",
            "Widget Tool Tip Block Visibility?", "Status"
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
                
                // Scroll to page end in steps
                await unityVerbWidget.scrollToPageEndInSteps();
                
                // Close geo popup modal if present
                await unityVerbWidget.closeGeoPopUpModal();
                
                // Wait for dynamic content
                await page.waitForTimeout(5000);
                
                // Extract country and locale
                const { country, locale } = extractCountryAndLocale(url);
                
                // Get widget data
                const verbWidgetData = await unityVerbWidget.getUnityBlockVerbWidgetFrictionless();
                
                // Validate widget data
                const validationResult = validateUnityVerbWidget(verbWidgetData, country);
                
                // Add row to output data
                outputData.push(createOutputRow(url, country, locale, verbWidgetData, validationResult));
                
                // Save intermediate results after each URL
                try {
                    const outputPath = path.join(testResultsDir, 'unityVerbWidget_results.xlsx');
                    await saveDataToExcel(outputData, outputPath);
                    console.log(`Intermediate results saved to ${outputPath}`);
                } catch (error) {
                    console.error("Error saving intermediate results:", error);
                }
                
            } catch (error) {
                console.error(`Error processing URL ${url}:`, error);
                // Add error row to output data
                outputData.push([
                    url, "Error", "Error", "Error", "Error", "Error",
                    "Error", "Error", "Error", "Error", "Error", "Error",
                    "Error", "Error", "Error", "Error", "Error", "Error",
                    "Error", "Error", "Error", "Error", "Error", "Error"
                ]);
                
                // Save results after error
                try {
                    const outputPath = path.join(testResultsDir, 'unityVerbWidget_results.xlsx');
                    await saveDataToExcel(outputData, outputPath);
                    console.log(`Results saved after error to ${outputPath}`);
                } catch (saveError) {
                    console.error("Error saving results after error:", saveError);
                }
            }
        }
        
        // Save final results
        try {
            const outputPath = path.join(testResultsDir, 'unityVerbWidget_results.xlsx');
            await saveDataToExcel(outputData, outputPath);
            console.log(`Final results saved to ${outputPath}`);
        } catch (error) {
            console.error("Error saving final results:", error);
        }
    });
}); 