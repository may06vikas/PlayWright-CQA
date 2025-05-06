import { Page, test, Browser, BrowserContext } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { config } from './config';

/**
 * ========================================================================
 * Playwright Web Automation Framework - Core Test Helpers
 * ========================================================================
 * 
 * This file contains the fundamental utilities and helper methods used across
 * the test automation framework. It provides:
 *  - Type definitions for test data structures
 *  - GenericMethods class with common web automation actions
 *  - Utilities for parallel test execution
 *  - Helper functions for common workflows
 */

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
 * GenericMethods class containing reusable utility methods for Playwright automation
 * 
 * This class encapsulates common operations to perform on web pages such as:
 * - URL and locale management
 * - Page navigation and interaction
 * - Element manipulation and scrolling
 * - Browser state management
 */
export class GenericMethods {
  private page: Page;

  // Synchronized collections for storing data during test execution
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
   * Extracts country and locale information from URL and DOM
   * Handles special paths like 'acrobat' and 'online'
   * Gets locale from DOM's lang attribute
   * 
   * @param url - The URL to process
   * @param env - The environment (stage, live, prod, etc.)
   * @returns Object containing country and locale
   */
  async extractCountryAndLocaleInfo(url: string, env: string = 'stage'): Promise<{ country: string; locale: string }> {
    // Get locale from DOM's lang attribute first
    const langAttribute = await this.page.locator('html[lang]').getAttribute('lang') || '';
    let locale = langAttribute.split('-')[0] || '';
    let country = langAttribute.split('-')[1]?.toLowerCase() || '';

    // Clean URL and split into parts
    const urlParts = url.split('/').filter(part => part && !part.includes('.html') && !part.includes('.htm'));
    
    // Special paths to ignore
    const specialPaths = ['acrobat', 'online', 'pdf-reader', 'pdf'];
    
    // Find potential country segment
    for (let i = 0; i < urlParts.length; i++) {
      const part = urlParts[i].toLowerCase();
      
      // Skip special paths
      if (specialPaths.includes(part)) {
        continue;
      }
      
      // Check for country_locale format
      if (part.includes('_')) {
        const [countryPart, localePart] = part.split('_');
        country = countryPart;
        // Only update locale if we couldn't get it from lang attribute
        if (!locale) {
          locale = localePart;
        }
        break;
      }
      
      // Check for two-letter country codes
      if (part.length === 2 && /^[a-zA-Z]{2}$/.test(part)) {
        country = part;
        break;
      }
    }

    // Clean up country and locale
    country = country.replace(/^\/+|\/+$/g, '');
    locale = locale.replace(/^\/+|\/+$/g, '');

    // If still no country, try getting it from the URL using existing method
    if (!country) {
      const urlInfo = await this.getCountryNameFromURL(env, url);
      country = urlInfo.get('country')?.replace(/^\/+|\/+$/g, '') || '';
    }

    // Log for debugging
    console.log('URL Parts:', urlParts);
    console.log('Lang Attribute:', langAttribute);
    console.log('Final Country:', country);
    console.log('Final Locale:', locale);

    return { country, locale };
  }

  /**
   * Gets country and locale from page URL based on environment
   * 
   * This method handles different URL patterns across various environments 
   * (live, stage, production) and extracts locale from DOM when needed.
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
   * 
   * Extracts the language attribute from the HTML tag, which often contains
   * locale information in format like 'en-US'
   * 
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
   * Scrolls to a specific element on the page
   * 
   * Useful for bringing elements into view before interacting with them,
   * especially for pages with lazy-loading or dynamic content
   * 
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
   * 
   * Useful for triggering lazy loading content or infinite scroll pages
   */
  async scrollToPageEnd(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Scrolls to the top of the page
   * 
   * Useful for returning to navigation elements typically located at the top
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
   * 
   * Navigates to the URL and waits for DOM content to be loaded
   * 
   * @param url - The URL to open
   */
  async openUrl(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Enters text into a field
   * 
   * Clears the field first, then enters the new text
   * 
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
   * 
   * Waits for both DOM content and network requests to complete
   */
  async waitTillPageLoads(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clears browser cookies and storage
   * 
   * Useful for testing in a clean state or for logout scenarios
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
 * Creates tests distributed across multiple worker processes
 * 
 * This function divides testing workload across multiple parallel workers
 * to improve test execution speed. Each worker gets a subset of the tests
 * to run concurrently.
 * 
 * @param testName - The base name for the tests
 * @param testFn - The function containing the test logic
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
 * Creates parallel tests for each data sheet
 * 
 * This function creates separate test cases for each sheet in the test data,
 * enabling parallel processing of multiple data sets.
 * 
 * @param testFn - The function containing the test logic
 * @param sheetNames - Array of Excel sheet names to process
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
 * Handles geo-location popup modals
 * 
 * Many websites display location-based popups on initial visit.
 * This function detects and closes such modals to prevent them
 * from interfering with automated tests.
 * 
 * @param page - The Playwright page object
 */
export async function closeGeoPopUpModal(page: Page) {
    try {
        const modal = page.locator("//div[@daa-lh='locale-modal-v2-modal']/child::button");
        if (await modal.isVisible()) {
          await modal.click();
        }
    } catch (error) {
        console.log("No geo popup modal found or error closing it:", error);
    }
} 