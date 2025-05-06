
/* This file is a part of custom check for acrobat Blade project.
    Ticket ID: DOTCOM-152712 

*/

import { Page, Locator } from '@playwright/test';

export interface AcrobatBladeData {
    bladeVis: string;
    bladeTitle: string;
    bladeDesc: string;
    bladeBuyNowBtn: string;
    bladeCompareFeaturesLink: string;
    bladeBuyNowHref: string;
    bladeCompareFeaturesHref: string;
    bladeCompareFeaturesModalText: string;
    bladeCompareFeaturesModalCloseBtn: string;
    bladeBuyNowOsiId: string;
    productName: string;
    storeCommitmentUrl: string;
    storeEmailUrl: string;
    cartSubtotalLabel: string;
    cartSubtotalPrice: string;
    cartTotalLabel: string;
    cartTotalPrice: string;
}

export class AcrobatBlade {
    private page: Page;
    private blade: Locator;
    private bladeTitle: Locator;
    private bladeDesc: Locator;
    private bladeBuyNowBtn: Locator;
    private bladeCompareFeaturesLink: Locator;
    private bladeCompareFeaturesModalText: Locator;
    private bladeCompareFeaturesModalCloseBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.blade = page.locator("div[daa-lh='b1|text'] div div[data-valign='middle']");
        this.bladeTitle = page.locator("div[daa-lh='b1|text'] div div[data-valign='middle'] h2");
        this.bladeDesc = page.locator("div[daa-lh='b1|text'] div div[data-valign='middle'] p[class='body-m']");
        this.bladeBuyNowBtn = page.locator("p[class='body-m action-area'] a").nth(0);
        this.bladeCompareFeaturesLink = page.locator("p[class='body-m action-area'] a").nth(1);
        this.bladeCompareFeaturesModalText = page.locator("[class='foreground'] [data-valign='middle'] h2[class='heading-l']");
        this.bladeCompareFeaturesModalCloseBtn = page.locator("button[daa-ll*='compare-adobe-acrobat-pro-and-adobe-acrobat-pro-2024:modalClose:buttonClose']");
        
    }


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
    
          await this.blade.scrollIntoViewIfNeeded();
        } catch (error) {
          throw new Error(`Failed to scroll page: ${error.message}`);
        }
    }


    async getAcrobatBladeData(): Promise<AcrobatBladeData> {    
        const bladeData: AcrobatBladeData = {
            bladeVis: "Not Visible",
            bladeTitle: "Not Visible",
            bladeDesc: "Not Visible",
            bladeBuyNowBtn: "Not Visible",
            bladeCompareFeaturesLink: "Not Visible",
            bladeBuyNowHref: "Not Found",
            bladeCompareFeaturesHref: "Not Found",
            bladeCompareFeaturesModalText: "Not Visible",
            bladeCompareFeaturesModalCloseBtn: "Not Visible",
            bladeBuyNowOsiId: "Not Found",
            productName: "Not Found",
            storeCommitmentUrl: "Not Found",
            storeEmailUrl: "Not Found",
            cartSubtotalLabel: "Not Found",
            cartSubtotalPrice: "Not Found",
            cartTotalLabel: "Not Found",
            cartTotalPrice: "Not Found"
        };

        try {
            await this.scrollPage();
            await this.blade.waitFor({ state: 'visible', timeout: 15000 });
            
            bladeData.bladeVis = await this.blade.isVisible() ? "Visible" : "Not Visible";
            bladeData.bladeTitle = await this.bladeTitle.isVisible() ? await this.bladeTitle.textContent() || "Not Visible" : "Not Visible";
            bladeData.bladeDesc = await this.bladeDesc.isVisible() ? await this.bladeDesc.textContent() || "Not Visible" : "Not Visible";
            
            if (await this.bladeBuyNowBtn.isVisible()) {
                bladeData.bladeBuyNowBtn = await this.bladeBuyNowBtn.textContent() || "Not Visible";
                bladeData.bladeBuyNowHref = await this.bladeBuyNowBtn.getAttribute('href') || "Not Found";
                bladeData.bladeBuyNowOsiId = await this.bladeBuyNowBtn.getAttribute('data-wcs-osi') || "Not Found";
            }
            
            if (await this.bladeCompareFeaturesLink.isVisible()) {
                try {
                    bladeData.bladeCompareFeaturesLink = await this.bladeCompareFeaturesLink.textContent() || "Not Visible";
                    bladeData.bladeCompareFeaturesHref = await this.bladeCompareFeaturesLink.getAttribute('href') || "Not Found";
                    
                    // Click and verify modal only once
                    await this.bladeCompareFeaturesLink.click();
                    await this.bladeCompareFeaturesModalText.waitFor({ state: 'visible', timeout: 15000 });
                    bladeData.bladeCompareFeaturesModalText = await this.bladeCompareFeaturesModalText.textContent() || "Not Found";
                    bladeData.bladeCompareFeaturesModalCloseBtn = await this.bladeCompareFeaturesModalCloseBtn.isVisible() ? "Visible" : "Not Visible";
                    await this.bladeCompareFeaturesModalCloseBtn.click();
                } catch (error) {
                    console.error('Error in compare features modal verification:', error);
                    bladeData.bladeCompareFeaturesModalText = "Not Found";
                    bladeData.bladeCompareFeaturesModalCloseBtn = "Not Visible";
                }
            }

            return bladeData;
        } catch (error) {
            throw new Error(`Failed to get Acrobat Blade data: ${error.message}`);
        }
    }           

    async validateAcrobatBladeData(data: AcrobatBladeData): Promise<string> {
        try {
            const actualData = await this.getAcrobatBladeData();
            
            if (actualData.bladeVis !== data.bladeVis) return `Blade visibility mismatch. Expected: ${data.bladeVis}, Got: ${actualData.bladeVis}`;
            if (actualData.bladeTitle !== data.bladeTitle) return `Blade title mismatch. Expected: ${data.bladeTitle}, Got: ${actualData.bladeTitle}`;
            if (actualData.bladeDesc !== data.bladeDesc) return `Blade description mismatch. Expected: ${data.bladeDesc}, Got: ${actualData.bladeDesc}`;
            if (actualData.bladeBuyNowBtn !== data.bladeBuyNowBtn) return `Buy Now button mismatch. Expected: ${data.bladeBuyNowBtn}, Got: ${actualData.bladeBuyNowBtn}`;
            if (actualData.bladeCompareFeaturesLink !== data.bladeCompareFeaturesLink) return `Compare Features link mismatch. Expected: ${data.bladeCompareFeaturesLink}, Got: ${actualData.bladeCompareFeaturesLink}`;
            if (actualData.bladeBuyNowHref !== data.bladeBuyNowHref) return `Buy Now href mismatch. Expected: ${data.bladeBuyNowHref}, Got: ${actualData.bladeBuyNowHref}`;
            if (actualData.bladeCompareFeaturesHref !== data.bladeCompareFeaturesHref) return `Compare Features href mismatch. Expected: ${data.bladeCompareFeaturesHref}, Got: ${actualData.bladeCompareFeaturesHref}`;
            if (actualData.bladeBuyNowOsiId !== data.bladeBuyNowOsiId) return `Buy Now OSI ID mismatch. Expected: ${data.bladeBuyNowOsiId}, Got: ${actualData.bladeBuyNowOsiId}`;
            
            return "All elements match expected data";
        } catch (error) {
            throw new Error(`Failed to validate Acrobat Blade data: ${error.message}`);
        }
    }

    async verifyBuyNowButton(): Promise<{ href: string; productName: string; emailUrl: string; subtotalLabel: string; subtotalPrice: string; totalLabel: string; totalPrice: string }> {
        let newPage: Page | undefined;
        try {
            await this.bladeBuyNowBtn.waitFor({ state: 'visible', timeout: 15000 });
            
            // Get the href attribute
            const href = await this.bladeBuyNowBtn.getAttribute('href');
            if (!href) throw new Error('Buy Now button href not found');
            console.log(`Buy Now button href: ${href}`);

            // Click and open in new tab
            newPage = await this.page.context().newPage();
            await Promise.all([
                newPage.waitForLoadState('networkidle'),
                newPage.goto(href, { timeout: 30000 })
            ]);

            // Wait for commitment page to load
            if (!newPage.url().includes('store/commitment')) {
                throw new Error(`Expected URL to contain 'store/commitment', but got: ${newPage.url()}`);
            }

            // Get product name
            const productNameLocator = newPage.locator("div[class='vi3c6W_flex ProductInfo__productInfo___3R8Ab undefined'] div [data-testid='product-info-name']");
            await productNameLocator.waitFor({ state: 'visible', timeout: 15000 });
            const productName = await productNameLocator.textContent() || '';
            if (!productName || !productName.includes('Acrobat Pro')) {
                throw new Error('Product name not found or incorrect');
            }

            // Click continue button
            const continueButton = newPage.locator("div[data-testid='action-container'] button");
            await continueButton.waitFor({ state: 'visible', timeout: 15000 });
            await Promise.all([
                newPage.waitForURL('**/store/email**', { timeout: 30000 }),
                continueButton.click()
            ]);

            // Get the email page URL
            const emailUrl = newPage.url();
            if (!emailUrl.includes('store/email')) {
                throw new Error(`Expected URL to contain 'store/email', but got: ${emailUrl}`);
            }

            // Check for subtotal label
            await newPage.waitForLoadState('networkidle', { timeout: 15000 });
            const subtotalLabelLocator = newPage.locator("[data-testid='cart-totals-subtotals-label']");
            await subtotalLabelLocator.waitFor({ state: 'visible', timeout: 15000 });
            const subtotalLabel = await subtotalLabelLocator.textContent() || '';
            if (!subtotalLabel) {
                throw new Error('Subtotal label not found');
            }

            // Check for subtotal price
            const subtotalPriceLocator = newPage.locator("[data-testid='cart-totals-subtotals-row'] [data-testid='price-full-display']");
            await subtotalPriceLocator.waitFor({ state: 'visible', timeout: 15000 });
            const subtotalPrice = await subtotalPriceLocator.textContent() || '';
            if (!subtotalPrice) {
                throw new Error('Subtotal price not found');
            }

            // Check for total label
            const totalLabelLocator = newPage.locator("[class*='CartTotals'] [data-testid='cart-totals-total-label']");
            await totalLabelLocator.waitFor({ state: 'visible', timeout: 15000 });
            const totalLabel = await totalLabelLocator.textContent() || '';
            if (!totalLabel) {
                throw new Error('Total label not found');
            }

            // Check for total price
            const totalPriceLocator = newPage.locator("[class*='CartTotals'] span div[class*='large__priceFullDisplay']");
            await totalPriceLocator.waitFor({ state: 'visible', timeout: 15000 });
            const totalPrice = await totalPriceLocator.textContent() || '';
            if (!totalPrice) {
                throw new Error('Total price not found');
            }

            await newPage.close();
            return { 
                href, 
                productName: productName.trim(), 
                emailUrl, 
                subtotalLabel: subtotalLabel.trim(),
                subtotalPrice: subtotalPrice.trim(),
                totalLabel: totalLabel.trim(),
                totalPrice: totalPrice.trim()
            };
        } catch (error) {
            if (newPage) {
                try {
                    await newPage.close();
                } catch (e) {
                    // Ignore close errors
                }
            }
            throw new Error(`Failed to verify Buy Now button: ${error.message}`);
        }
    }
}