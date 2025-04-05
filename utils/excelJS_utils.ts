import * as xlsx from 'xlsx';
import * as path from 'path';
import { config } from './config';

/**
 * ========================================================================
 * Excel Data Utilities for Test Automation Framework
 * ========================================================================
 * 
 * This module handles all Excel-related operations for the test framework:
 * 1. Reading test data (URLs) from Excel sheets
 * 2. Distributing data across parallel workers
 * 3. Saving test results back to Excel
 * 
 * The framework uses Excel as both the data source and results repository,
 * creating a complete loop for data-driven testing.
 */

/**
 * Configuration interface for Excel operations
 * Defines paths and sheet naming conventions
 */
interface ExcelConfig {
  defaultExcelPath: string;    // Base directory for Excel files
  sheets: {                    // Named references to specific Excel files
    [key: string]: string;
  };
}

// Default configuration - can be overridden in config file
const defaultConfig: ExcelConfig = {
  defaultExcelPath: path.join(process.cwd(), 'testData'),
  sheets: {
    urls: 'urls.xlsx',         // File containing test URLs
    results: 'results.xlsx'    // File for saving test results
  }
};

/**
 * Reads URLs from a specific sheet in an Excel file
 * 
 * This function:
 * 1. Opens the configured Excel input file
 * 2. Finds the specified sheet
 * 3. Extracts URL values from rows
 * 4. Returns array of URLs for testing
 * 
 * @param sheetName - Name of the Excel sheet to read
 * @returns Promise resolving to array of URLs
 */
export async function readUrlsFromSheet(sheetName: string): Promise<string[]> {
    const urls: string[] = [];

    try {
        // Get the Excel file path from config
        const excelFilePath = path.join(process.cwd(), config.excel.inputPath);
        console.log(`Reading Excel file from: ${excelFilePath}, Sheet: ${sheetName}`);

        // Open the workbook and verify sheet exists
        const workbook = xlsx.readFile(excelFilePath);
        if (!workbook.SheetNames.includes(sheetName)) {
            throw new Error(`Sheet "${sheetName}" not found in workbook`);
        }

        // Convert sheet to JSON and extract URLs
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        
        // Extract URL from each row (assuming column is named "url")
        jsonData.forEach((row: any) => {
            if (row.url) {
                urls.push(row.url);
            }
        });
        
        console.log(`Extracted ${urls.length} URLs from sheet ${sheetName}`);
    } catch (error) {
        console.error(`Error reading Excel file (${sheetName}):`, error);
    }

    return urls;
}

/**
 * Distributes URLs from Excel sheets across parallel worker processes
 * 
 * This function implements the load balancing logic for parallel testing:
 * 1. Reads all sheets with the configured prefix
 * 2. Distributes sheets evenly across workers using modulo assignment
 * 3. Extracts URLs from each assigned sheet
 * 4. Returns a map of sheet names to URLs for the current worker
 * 
 * @param workerIndex - Current worker's index (0-based)
 * @param totalWorkers - Total number of parallel workers
 * @returns Map of sheet names to arrays of URLs for this worker
 */
export async function getUrlsForWorker(workerIndex: number, totalWorkers: number): Promise<Map<string, string[]>> {
    const allUrls = new Map<string, string[]>();
    
    try {
        // Get the Excel file path from config
        const excelFilePath = path.join(process.cwd(), config.excel.inputPath);
        console.log(`Worker ${workerIndex + 1}: Reading Excel file from ${excelFilePath}`);

        // Read workbook and filter sheets by configured prefix
        const workbook = xlsx.readFile(excelFilePath);
        const dcPagesSheets = workbook.SheetNames.filter(name => 
            name.startsWith(config.excel.sheetPrefix)
        );
        
        // Distribute sheets across workers using modulo assignment
        // Each worker is assigned sheets where (sheet_index % total_workers === worker_index)
        const sheetsForThisWorker = dcPagesSheets.filter((_, index) => 
            index % totalWorkers === workerIndex
        );
        
        // Process each sheet assigned to this worker
        for (const sheetName of sheetsForThisWorker) {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(sheet);
            const urls: string[] = [];
            
            // Extract URLs from each row
            jsonData.forEach((row: any) => {
                if (row.url) {
                    urls.push(row.url);
                }
            });
            
            // Add to results if URLs were found
            if (urls.length > 0) {
                allUrls.set(sheetName, urls);
                console.log(`Worker ${workerIndex + 1}: Found ${urls.length} URLs in sheet ${sheetName}`);
            }
        }
    } catch (error) {
        console.error(`Worker ${workerIndex + 1}: Error reading Excel file:`, error);
    }

    return allUrls;
}

/**
 * Saves test results to an Excel file with multiple sheets
 * 
 * This function:
 * 1. Creates a new Excel workbook
 * 2. Creates a sheet for each data set in the provided map
 * 3. Writes the data to each sheet
 * 4. Saves the workbook to the specified file
 * 
 * @param dataBySheet - Map of sheet names to arrays of data rows
 * @param fileName - Path to save the Excel file
 */
export async function saveDataToExcelMultiSheet(dataBySheet: Map<string, any[]>, fileName: string): Promise<void> {
    // Create a new workbook
    const wb = xlsx.utils.book_new();

    // Process each sheet's data
    for (const [sheetName, data] of dataBySheet.entries()) {
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, sheetName);
    }

    // Write the file to disk
    xlsx.writeFile(wb, fileName);
    console.log(`Data saved to ${fileName} with ${dataBySheet.size} sheets`);
}

/**
 * Saves data to a single sheet in an Excel file
 * 
 * Simpler version for cases where multiple sheets aren't needed
 * 
 * @param data - Array of objects to save
 * @param fileName - Path to save the Excel file
 */
async function saveDataToExcel(data: any[], fileName: string): Promise<void> {
  // Create a new workbook with a single sheet
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Write the file to disk
  xlsx.writeFile(wb, fileName);
  console.log(`Data saved to ${fileName}`);
}

export { 
    saveDataToExcel,
    ExcelConfig 
};