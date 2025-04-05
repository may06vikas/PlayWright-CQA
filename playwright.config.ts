import { PlaywrightTestConfig, devices } from '@playwright/test';
import * as path from 'path';
import type { ExcelConfig } from './utils/excelJS_utils';
// import { readUrlsFromExcel, saveDataToExcel } from '../utils/excelJS_utils';

/**
 * ========================================================================
 * Playwright Test Configuration
 * ========================================================================
 * 
 * This file configures Playwright Test for the automation framework.
 * It sets up:
 * - Test directory and timeout settings
 * - Parallel execution options
 * - Reporting configuration
 * - Browser settings and viewport
 * - Project-specific configurations
 * 
 * For more details, see: https://playwright.dev/docs/test-configuration
 */

/**
 * ========================================================================
 * Main Playwright test configuration
 * ========================================================================
 * 
 * This section configures the main test settings for the Playwright test framework.
 */
const config: PlaywrightTestConfig = {
  // Directory containing all test files
  testDir: 'workflows',
  
  // Maximum time one test can run (200 minutes)
  timeout: 20 * 600000,
  
  // Number of retries for failed tests (only retry in CI environments)
  retries: process.env.CI ? 2 : 0,
  
  // Parallel execution configuration
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : 3,  // Number of parallel workers
  fullyParallel: true,  // Run tests in files in parallel
  
  // Stop execution after first failure
  maxFailures: 1,
  
  // Test reporting configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],  // HTML report
    ['list'],                                         // Console reporter
    ['json', { outputFile: 'test-results/test-results.json' }]  // JSON results
  ],
  
  // Global test settings for all tests
  use: {
    // Base URL for navigation (environment-dependent)
    baseURL: process.env.ENV === 'prod' ? 'https://prod-url.com' : 'https://stage-url.com',
    
    // Visual debugging settings
    screenshot: 'only-on-failure',  // Take screenshots only when tests fail
    video: 'retain-on-failure',     // Record video only when tests fail
    trace: 'retain-on-failure',     // Record trace only when tests fail
    
    // Browser window settings
    viewport: { width: 1920, height: 1080 },  // Use large viewport for modern sites
    
    // Timeout settings
    actionTimeout: 30000,       // Maximum time to wait for UI actions
    navigationTimeout: 30000,   // Maximum time to wait for navigation
    
    // Headless mode based on environment (headless in CI, headed locally)
    headless: !!process.env.CI,
  },
  
  // Browser-specific configurations
  projects: [
    {
      name: 'chromium',  // Chrome/Chromium browser
      use: {
        ...devices['Desktop Chrome'],  // Use Chrome desktop defaults
        launchOptions: {
          args: ['--start-fullscreen']  // Launch browser in fullscreen mode
        }
      },
    }
    // Additional browsers can be added here (Firefox, Safari, etc.)
  ],
};

/**
 * ========================================================================
 * Excel configuration for test data and results
 * ========================================================================
 * 
 * This section configures the Excel file paths and sheet names for the excelJS utilities.
 */
export const excelConfig: ExcelConfig = {
  defaultExcelPath: path.join(process.cwd(), 'testdata'),  // Base path for Excel files
  sheets: {
    urls: 'urls.xlsx',           // Excel file containing test URLs
    results: 'test-results.xlsx', // Excel file for test results
    data: 'test-data.xlsx'       // Excel file for additional test data
  }
};

export default config;
