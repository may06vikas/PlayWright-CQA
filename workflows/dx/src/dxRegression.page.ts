import { expect, Page, APIResponse } from '@playwright/test';
import { Locator } from '@playwright/test';

export class Consonant_Card {
  readonly page: Page;
  readonly consonantCards: Locator;
  readonly gioRoutingPopup: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gioRoutingPopup = page.locator("button[class='dialog-close']");
    this.consonantCards = page.locator("[data-testid='consonant-CardsGrid'] [data-testid='consonant-Card']");
    //this.consonantCards = page.locator("[class='caas-preview'] [data-testid='consonant-Card']");
  }

  async launchUrl(pageUrl: string) {
    await this.page.waitForTimeout(4000);
    await this.page.goto(pageUrl);
    console.log("Navigated to URL: ", pageUrl);
    await this.page.reload();
    await this.page.waitForLoadState();
  }

  async closeGioRoutingPopup() {
    try {
      await this.page.waitForLoadState();
  
      await expect(this.gioRoutingPopup).toBeVisible();
      const isPopupVisible = await this.gioRoutingPopup.isVisible();
  
      if (isPopupVisible) {
        await this.gioRoutingPopup.click();
        console.log('Gio Routing Popup closed');
      } else {
        console.error('Gio Routing Popup is not visible or missing');
      }
    } catch (error) {
      console.error('Error closing Gio Routing Popup:', error);
    }
  }

  async scrollToMidPage() {
    try {
        const totalHeight = await this.page.evaluate(() => document.body.scrollHeight);
        const scrollHeight = totalHeight / 2;
        
        await this.page.evaluate((scroll) => window.scrollBy(0, scroll), scrollHeight);
    } catch (error) {
        console.error('Error while scrolling:', error);
    }
  }

  async scrollToPageEndInSteps() {
    try {
      
        const totalHeight = await this.page.evaluate(() => document.body.scrollHeight);
        const scrollHeight = totalHeight / 10;

        for (let i = 1; i <= 10; i++) {
            await this.page.evaluate((scroll) => window.scrollBy(0, scroll), scrollHeight);
            await this.page.waitForTimeout(200);
        }

      } catch (error) {
        console.error('Error while scrolling:', error);
    }
  }


  async getConsonentCardsDetails() {
    try {
      await this.page.waitForLoadState();
      await this.consonantCards.isVisible();
      await this.page.waitForTimeout(4000);
      await this.scrollToPageEndInSteps();
      // const pageHeight = await this.page.evaluate(() => document.body.scrollHeight);
      // await this.page.mouse.wheel(0, pageHeight / 2);
      await this.page.waitForTimeout(4000);
      
      const cardCount = await this.consonantCards.count();
      console.log(`Found ${cardCount} cards`);
  
      const cardDetails: any[] = [];
  
      for (let i = 0; i < cardCount; i++) {
        await this.page.waitForLoadState();
        await this.page.waitForTimeout(4000);
  
        const details: any = {};
        const card = this.consonantCards.nth(i);
        const isVisible = await card.isVisible();
        details['isVisible'] = isVisible;
  
        if (isVisible) {
          const anchorExists = await card.locator('a').count();
          
          if (anchorExists > 0) {
            const href = await card.locator('a').evaluate(el => (el as HTMLAnchorElement).href);
            details['href'] = href;
  
            if (href) {
              try {
                const response: APIResponse = await this.page.request.get(href);
                details['statusCode'] = response.status();
              } catch (error) {
                console.error(`Error fetching ${href}:`, error);
                details['statusCode'] = 0;
              }
            } else {
              details['statusCode'] = 0;
            }
          } else {
            console.warn(`Card ${i + 1} does not contain an anchor tag.`);
            details['href'] = null;
            details['statusCode'] = 0;
          }
        } else {
          details['statusCode'] = 0;
        }
  
        cardDetails.push(details);
        console.log(`Card ${i + 1} details:`, details);
      }
  
      return cardDetails;
    } catch (error) {
      console.error('Error fetching card details:', error);
      return [];
    }
  }

}
