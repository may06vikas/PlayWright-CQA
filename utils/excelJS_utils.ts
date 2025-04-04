import * as xlsx from 'xlsx';
import * as path from 'path';
import { config } from './config';

interface ExcelConfig {
  defaultExcelPath: string;
  sheets: {
    [key: string]: string;
  };
}

// Default configuration - can be overridden in config file
const defaultConfig: ExcelConfig = {
  defaultExcelPath: path.join(process.cwd(), 'testData'),
  sheets: {
    urls: 'urls.xlsx',
    results: 'results.xlsx'
  }
};

/**
 * Read URLs from a specific sheet in an Excel file
 */
export async function readUrlsFromSheet(sheetName: string): Promise<string[]> {
    const urls: string[] = [];

    try {
        const excelFilePath = path.join(process.cwd(), config.excel.inputPath);
        console.log(`Reading Excel file from: ${excelFilePath}, Sheet: ${sheetName}`);

        const workbook = xlsx.readFile(excelFilePath);
        if (!workbook.SheetNames.includes(sheetName)) {
            throw new Error(`Sheet "${sheetName}" not found in workbook`);
        }

        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        
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
 * Read URLs from all sheets and distribute them evenly across workers
 */
export async function getUrlsForWorker(workerIndex: number, totalWorkers: number): Promise<Map<string, string[]>> {
    const allUrls = new Map<string, string[]>();
    
    try {
        const excelFilePath = path.join(process.cwd(), config.excel.inputPath);
        console.log(`Worker ${workerIndex + 1}: Reading Excel file from ${excelFilePath}`);

        const workbook = xlsx.readFile(excelFilePath);
        const dcPagesSheets = workbook.SheetNames.filter(name => 
            name.startsWith(config.excel.sheetPrefix)
        );
        
        // Distribute sheets across workers
        const sheetsForThisWorker = dcPagesSheets.filter((_, index) => 
            index % totalWorkers === workerIndex
        );
        
        for (const sheetName of sheetsForThisWorker) {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(sheet);
            const urls: string[] = [];
            
            jsonData.forEach((row: any) => {
                if (row.url) {
                    urls.push(row.url);
                }
            });
            
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
 * Save data to an Excel file with multiple sheets
 */
export async function saveDataToExcelMultiSheet(dataBySheet: Map<string, any[]>, fileName: string): Promise<void> {
    const wb = xlsx.utils.book_new();

    for (const [sheetName, data] of dataBySheet.entries()) {
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, sheetName);
    }

    xlsx.writeFile(wb, fileName);
    console.log(`Data saved to ${fileName} with ${dataBySheet.size} sheets`);
}

/**
 * Save data to a single sheet in an Excel file
 * @param data Array of objects to save
 * @param fileName Name of the file to save
 */
async function saveDataToExcel(data: any[], fileName: string): Promise<void> {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

  xlsx.writeFile(wb, fileName);
  console.log(`Data saved to ${fileName}`);
}

export { 
    saveDataToExcel,
    ExcelConfig 
};