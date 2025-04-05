import { Page, test, Browser, BrowserContext } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { config } from './config';

// Types
export interface TestOptions {
    page: Page;
    sheetName: string;
    testResultsDir: string;
}

export interface CountryLocale {
    country: string;
    locale: string;
}

interface TestFixture {
    page: Page;
    workerIndex: number;
    totalWorkers: number;
}

/**
 * GenericMethods class containing reusable utility
 */
export class GenericMethods {
  private page: Page;

  // Synchronized collections for storing data
  public unProcessedList: string[] = [];
  public i: number = 0;
  public j: number = 0;
  public outputData: string[][] = [];
  public ignoredStatusCodeHrefs: Set<string> = new Set<string>();
  public ignoredStatusCodeSrcs: Set<string> = new Set<string>();
  public unProcessedList1: string[] = [];
  public okHrefData: string[][] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Extracts country and locale from a URL
   * @param url - The URL to parse
   * @returns Object with country and locale information
   */
  extractCountryAndLocale(url: string): CountryLocale {
    try {
        const urlParts = url.split(".com/")[1]?.split("/") || [];
        const countryLocale = urlParts[0] || "";
        
        if (countryLocale.includes("_")) {
            const [country, locale] = countryLocale.split("_");
            return { country, locale };
        } else if (countryLocale.length === 2) {
            return { country: countryLocale, locale: countryLocale };
        } else {
            return { country: countryLocale, locale: countryLocale };
        }
    } catch (error) {
        console.error("Error extracting country and locale:", error);
        return { country: "", locale: "" };
    }
  }

  /**
   * This method will get country and locale from pageURL
   *
   * @param testEnv - The environment (live, stage, prod, etc.)
   * @param url - The URL to parse
   * @returns Map with country and locale information
   */
  async getCountryNameFromURL(testEnv: string, url: string): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    let country: string = '';
    let locale: string = '';
    
    try {
      const arr = url.split('/');
      
      switch (testEnv) {
        case 'live':
          if (arr[3].includes('_')) {
            country = '/' + arr[3].split('_')[0];
            locale = arr[3].split('_')[1] + '/';
          } else {
            country = '/' + arr[3];
            const langAttribute = await this.page.locator('html[lang]').getAttribute('lang') || '';
            locale = langAttribute.split('-')[0];
          }
          console.log(`Country---> ${country}: Locale---> ${locale}`);
          break;
        
        case 'stage':
          if (arr[3].includes('_')) {
            country = '/' + arr[3].split('_')[0];
            locale = arr[3].split('_')[1] + '/';
          } else {
            country = '/' + arr[3];
            const langAttribute = await this.page.locator('html[lang]').getAttribute('lang') || '';
            locale = langAttribute.split('-')[0];
          }
          console.log(`Country---> ${country}: Locale---> ${locale}`);
          break;
        
        case 'prod':
          country = '/' + arr[5];
          locale = arr[6] + '/';
          console.log(`Country---> ${arr[5]}: Locale---> ${arr[6]}`);
          break;
        
        case 'prod1':
          country = '/' + arr[6];
          locale = arr[7] + '/';
          console.log(`Country---> ${arr[6]}: Locale---> ${arr[7]}`);
          break;
        
        case 'us':
          country = '/us';
          locale = 'en/';
          console.log(`Country---> ${country}: Locale---> ${locale}`);
          break;
        
        default:
          country = '';
          locale = '';
          console.log('Country and locale not found in url');
          break;
      }
      
      map.set('country', country);
      map.set('locale', locale);
    } catch (e) {
      // Error handling
      console.error('Error parsing URL:', e);
    }
    
    return map;
  }

  /**
   * Gets locale and country information from the DOM
   * @returns The language attribute value from the HTML tag
   */
  async getLocaleAndCountryFromDom(): Promise<string> {
    let localeAndCountry = '';
    try {
      localeAndCountry = await this.page.locator('html[lang]').getAttribute('lang') || '';
    } catch (ex) {
      console.error('Error getting locale from DOM:', ex);
    }
    return localeAndCountry;
  }

  /**
   * Alternative method to get country and locale from URL
   * This version doesn't fetch locale from DOM for some environments
   * 
   * @param testEnv - The environment (live, stage, prod, etc.)
   * @param url - The URL to parse
   * @returns Map with country and locale information
   */
  async getCountryNameFromURL1(testEnv: string, url: string): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    let country: string = '';
    let locale: string = '';
    
    try {
      const arr = url.split('/');
      
      switch (testEnv) {
        case 'live':
          if (arr[3].includes('_')) {
            country = '/' + arr[3].split('_')[0];
            locale = arr[3].split('_')[1] + '/';
          } else {
            country = '/' + arr[3];
            locale = '';
          }
          console.log(`Country---> ${country}: Locale---> ${locale}`);
          break;
        
        case 'stage':
          if (arr[3].includes('_')) {
            country = '/' + arr[3].split('_')[0];
            locale = arr[3].split('_')[1] + '/';
          } else {
            country = '/' + arr[3];
            locale = '';
          }
          console.log(`Country---> ${country}: Locale---> ${locale}`);
          break;
        
        case 'prod':
          country = '/' + arr[5];
          locale = arr[6] + '/';
          console.log(`Country---> ${arr[5]}: Locale---> ${arr[6]}`);
          break;
        
        case 'us':
          country = '/us';
          locale = 'en/';
          console.log(`Country---> ${country}: Locale---> ${locale}`);
          break;
        
        default:
          country = '';
          locale = '';
          console.log('Country and locale not found in url');
          break;
      }
      
      map.set('country', country);
      map.set('locale', locale);
    } catch (e) {
      // Error handling
      console.error('Error parsing URL:', e);
    }
    
    return map;
  }

  /**
   * Scrolls to a specific element on the page
   * @param selector - The selector for the element to scroll to
   */
  async scrollToElement(selector: string): Promise<void> {
    try {
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, selector);
    } catch (error) {
      console.error('Error scrolling to element:', error);
    }
  }

  /**
   * Scrolls to the end of the page
   */
  async scrollToPageEnd(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Scrolls to the top of the page
   */
  async scrollToPageTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  /**
   * Gets the current URL of the page
   * @returns The current URL
   */
  async fetchCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Opens a specific URL
   * @param url - The URL to open
   */
  async openUrl(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Enters text into a field
   * @param selector - The selector for the input field
   * @param text - The text to enter
   */
  async enterData(selector: string, text: string): Promise<void> {
    await this.page.locator(selector).clear();
    await this.page.locator(selector).fill(text);
  }

  /**
   * Clicks an element
   * @param selector - The selector for the element to click
   */
  async click(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  /**
   * Gets the text of an element
   * @param selector - The selector for the element
   * @returns The text content of the element
   */
  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  /**
   * Waits for the page to finish loading
   */
  async waitTillPageLoads(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clears browser cookies
   */
  async clearBrowserCookies(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      location.reload();
    });
  }
}

/**
 * Creates tests distributed across multiple workers
 */
export function createWorkerTests(
    testName: string,
    testFn: (options: { page: Page, workerIndex: number, totalWorkers: number }) => Promise<void>
) {
    const totalWorkers = config.workers.count;
    console.log(`Creating ${totalWorkers} worker tests`);

    for (let workerIndex = 0; workerIndex < totalWorkers; workerIndex++) {
        test(`${testName} - Worker ${workerIndex + 1}/${totalWorkers}`, async ({ page }) => {
            // Ensure test results directory exists
            const testResultsDir = path.join(process.cwd(), config.paths.testResults);
            if (!fs.existsSync(testResultsDir)) {
                fs.mkdirSync(testResultsDir, { recursive: true });
            }
            
            await testFn({ page, workerIndex, totalWorkers });
        });
    }
}

/**
 * Creates parallel tests for each sheet
 */
export function createParallelTests(testFn: (options: TestOptions) => Promise<void>, sheetNames: string[]) {
    for (const sheetName of sheetNames) {
        test(`Test for sheet ${sheetName}`, async ({ page }) => {
            const testResultsDir = path.join(process.cwd(), 'test-results');
            if (!fs.existsSync(testResultsDir)) {
                fs.mkdirSync(testResultsDir, { recursive: true });
            }
            
            await testFn({ page, sheetName, testResultsDir });
        });
    }
}

/**
 * Common modal handling
 */
export async function closeGeoPopUpModal(page: Page) {
    try {
        const modal = page.locator("div[class*='modal']");
        if (await modal.isVisible()) {
            await modal.locator("button").click();
        }
    } catch (error) {
        console.log("No geo popup modal found or error closing it:", error);
    }
} 