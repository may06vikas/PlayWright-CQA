import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
    workers: {
        // Use WORKERS env var if set, otherwise use DEFAULT_WORKERS from .env, fallback to 4
        count: process.env.WORKERS ? 
            parseInt(process.env.WORKERS) : 
            (process.env.DEFAULT_WORKERS ? parseInt(process.env.DEFAULT_WORKERS) : 4)
    },
    excel: {
        inputPath: process.env.EXCEL_INPUT_PATH || 'testData/inputSheet.xlsx',
        sheetPrefix: process.env.SHEET_PREFIX || 'dcPages'
    },
    paths: {
        testResults: process.env.TEST_RESULTS_DIR || 'test-results'
    },
    timeouts: {
        pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '7000'),
        tabSwitch: parseInt(process.env.TAB_SWITCH_TIMEOUT || '5000')
    }
}; 