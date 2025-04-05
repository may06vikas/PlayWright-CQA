import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * ========================================================================
 * Configuration Module for Playwright Automation Framework
 * ========================================================================
 * 
 * This module manages centralized configuration for the test framework.
 * It loads settings from environment variables (.env file) and provides
 * default values when environment variables are not set.
 * 
 * The configuration covers:
 * - Worker parallelization settings
 * - Excel data file paths and naming
 * - Output paths for test results
 * - Timeout settings for various operations
 */

// Load environment variables from .env file
dotenv.config();

/**
 * Main configuration object for the framework
 * All settings are accessible through this object
 */
export const config = {
    /**
     * Worker configuration for parallel test execution
     */
    workers: {
        // Use WORKERS env var if set, otherwise use DEFAULT_WORKERS from .env, fallback to 4
        count: process.env.WORKERS ? 
            parseInt(process.env.WORKERS) : 
            (process.env.DEFAULT_WORKERS ? parseInt(process.env.DEFAULT_WORKERS) : 4)
    },
    
    /**
     * Excel file configuration for test data
     */
    excel: {
        // Path to the input Excel file containing test URLs
        inputPath: process.env.EXCEL_INPUT_PATH || 'testData/inputSheet.xlsx',
        
        // Prefix for sheet names to be included in testing
        sheetPrefix: process.env.SHEET_PREFIX || 'dcPages'
    },
    
    /**
     * Path configuration for test outputs
     */
    paths: {
        // Directory to store test results and reports
        testResults: process.env.TEST_RESULTS_DIR || 'test-results'
    },
    
    /**
     * Timeout settings for various operations
     */
    timeouts: {
        // Maximum wait time for page loading (milliseconds)
        pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '7000'),
        
        // Wait time after switching tabs (milliseconds)
        tabSwitch: parseInt(process.env.TAB_SWITCH_TIMEOUT || '5000')
    }
}; 