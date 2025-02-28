import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';
import type { ExcelConfig } from './utils/excelJS_utils';
// import { readUrlsFromExcel, saveDataToExcel } from '../utils/excelJS_utils';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// Excel configuration
const excelConfig: ExcelConfig = {
  defaultExcelPath: path.join(process.cwd(), 'testdata'),
  sheets: {
    urls: 'urls.xlsx',
    results: 'test-results.xlsx',
    data: 'test-data.xlsx'
  }
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './workflows',
  timeout: 600000000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }]
  ],
  use: {
    baseURL: process.env.ENV === 'prod' ? 'https://prod-url.com' : 'https://stage-url.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    // {
    //   name: 'Chromium',
    //   use: {
    //     browserName: 'chromium',
    //     viewport: { width: 1920, height: 1080 },
    //     launchOptions: {
    //       args: ['--start-maximized']
    //     }
    //   },
    // },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 1920, height: 1080 },
      },
    },
    // {
    //   name: 'Webkit',
    //   use: {
    //     browserName: 'webkit',
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },
  ],
};

export { config as default, excelConfig };
