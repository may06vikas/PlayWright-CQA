import { Page } from '@playwright/test';

interface ConsoleErrorOutput {
  url: string;
  consoleError: string;
}

export class ConsoleErrorPage {
  constructor(private page: Page) {}

  // Locators
  private readonly geoPopupModal = '.geo-popup-modal';
  private readonly closeButton = 'button[aria-label="Close"]';
  private readonly footer = 'footer';

  async closeGeoPopup(): Promise<void> {
    try {
      const geoModal = this.page.locator(this.geoPopupModal);
      if (await geoModal.isVisible()) {
        const closeButton = geoModal.locator(this.closeButton);
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    } catch (error) {
      console.warn("Error closing geo popup modal:", error);
      // Continue execution as this is not critical
    }
  }

  // Page Interactions
  async scrollPage(): Promise<void> {
    try {
      await this.page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.documentElement.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      const footer = this.page.locator(this.footer);
      await footer.scrollIntoViewIfNeeded();
    } catch (error) {
      throw new Error(`Failed to scroll page: ${error.message}`);
    }
  }

  // Console Error Collection
  async getConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`SEVERE: ${msg.text()}`);
      }
    });

    try {
      // Get failed resource loads
      const resourceErrors = await this.page.evaluate(() => {
        return window.performance
          .getEntries()
          .filter(entry => entry.entryType === 'resource')
          .filter(entry => (entry as any).responseStatus >= 400)
          .map(entry => `SEVERE: ${(entry as any).name} - Status: ${(entry as any).responseStatus}`);
      });

      errors.push(...resourceErrors);
    } catch (error) {
      console.warn("Error collecting resource errors:", error);
    }

    return errors;
  }

  // Main workflow
  async checkPageForErrors(): Promise<string[]> {
    try {
      await this.closeGeoPopup();
      await this.scrollPage();
      await this.page.waitForTimeout(2000); // Wait for any delayed errors
      return await this.getConsoleErrors();
    } catch (error) {
      console.error(`Error checking page for console errors:`, error);
      return [`Error checking page: ${error.message}`];
    }
  }
}