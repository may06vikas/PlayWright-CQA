import xlsx from 'xlsx';
import path from 'path';

interface ExcelConfig {
  defaultExcelPath: string;
  sheets: {
    [key: string]: string;
  };
}

// Default configuration - can be overridden in config file
const defaultConfig: ExcelConfig = {
  defaultExcelPath: path.join(process.cwd(), 'testdata'),
  sheets: {
    urls: 'urls.xlsx',
    results: 'results.xlsx'
  }
};

/**
 * Read URLs from an Excel file
 * @returns Promise<string[]> Array of URLs
 */
async function readUrlsFromExcel(): Promise<string[]> {
  const urls: string[] = [];

  try {
    const excelFilePath = "C:/Users/ujjwalsingh/PlayWright-CQA/testData/subtance3D.xlsx";

    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    
    jsonData.forEach((row: any) => {
      if (row.url) {
        urls.push(row.url);
      }
    });
    
    console.log('Extracted URLs from Excel:', urls);
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }

  return urls;
}

/**
 * Save data to an Excel file
 * @param data Array of objects to save
 * @param fileName Name of the file to save
 */
async function saveDataToExcel(data: any[], fileName: string): Promise<void> {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

  xlsx.writeFile(wb, fileName);
}

export { saveDataToExcel, readUrlsFromExcel, ExcelConfig };