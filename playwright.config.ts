import { PlaywrightTestConfig, devices } from '@playwright/test';
import * as path from 'path';
import type { ExcelConfig } from './utils/excelJS_utils';
// import { readUrlsFromExcel, saveDataToExcel } from '../utils/excelJS_utils';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: 'workflows',
  timeout: 20 * 60000,
  retries: process.env.CI ? 2 : 0,
  
  // Enable parallel execution
  workers: process.env.CI ? 1 : undefined, // Use max workers in local, 1 in CI
  fullyParallel: true, // Enable full parallelization
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  
  use: {
    baseURL: process.env.ENV === 'prod' ? 'https://prod-url.com' : 'https://stage-url.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // Add viewport and other common settings
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--start-fullscreen']
        }
      },
    }
  ],
};

// Excel configuration
export const excelConfig: ExcelConfig = {
  defaultExcelPath: path.join(process.cwd(), 'testdata'),
  sheets: {
    urls: 'urls.xlsx',
    results: 'test-results.xlsx',
    data: 'test-data.xlsx'
  }
};

export default config;
