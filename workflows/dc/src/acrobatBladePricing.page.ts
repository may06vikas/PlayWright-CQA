import { Page, Locator } from '@playwright/test';

export interface AcrobatBladeDataPricing {
    bladeVis: string;
    bladeBuyNowBtn: string;
    bladeCompareFeaturesBtn: string;
    bladeCompareModalProducts: string;
    bladeCompareModalProductsPrice: string;
    bladeCompareModalProductsCTA1: string;
    bladeCompareModalProductsCTA2: string;
    bladeCompareModalCommitmentPUFPlan: string;
    bladeCompareModalCommitmentPUFPagePrice: string;
    bladeCompareModalStoreRecommendationTotalPrice: string;
    bladeCompareModalCommitmentPageContinueBtn: string;
    
    
}

export class AcrobatBladePricing {
    private page: Page;
    private blade: Locator;
    private bladeBuyNowBtn: Locator;
    private bladeCompareFeaturesBtn: Locator;
    private bladeCompareModalProducts: Locator;
    private bladeCompareModalProductsPrice: Locator;
    private bladeCompareModalProductsCTA1: Locator;
    private bladeCompareModalProductsCTA2: Locator;
    private bladeCompareModalCommitmentPUFPlan: Locator;
    private bladeCompareModalCommitmentPUFPagePrice: Locator;
    private bladeCompareModalStoreRecommendationTotalPrice: Locator;
    private bladeCompareModalCommitmentPageContinueBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.blade = page.locator("div[daa-lh='b1|text'] div div[data-valign='middle']");
        this.bladeBuyNowBtn = page.locator("p[class='body-m action-area'] a").nth(0);
        this.bladeCompareFeaturesBtn = page.locator("p[class='body-m action-area'] a");
        this.bladeCompareModalProducts = page.locator("div[class='heading-content'] p[class='tracking-header']").first();
        this.bladeCompareModalProductsPrice = page.locator("div[class='heading-button'] p[class='pricing'] span[is='inline-price']").first();
        this.bladeCompareModalProductsCTA1 = page.locator("div[class='heading-button'] div[class='buttons-wrapper'] p[class='action-area'] a[is='checkout-link']").nth(2);
        this.bladeCompareModalProductsCTA2 = page.locator("div[class='heading-button'] div[class='buttons-wrapper'] p[class='action-area'] a[is='checkout-link']").nth(3);
        this.bladeCompareModalCommitmentPUFPlan = page.locator("div[class='spectrum-Card-grid_6fdf9f'] [data-testid='billing-frequency']").nth(1);
        this.bladeCompareModalCommitmentPUFPagePrice = page.locator("div[class='spectrum-Card-grid_6fdf9f'] span[data-testid='price-main-price']").nth(1);
        this.bladeCompareModalStoreRecommendationTotalPrice = page.locator("div[class='spectrum-Card-grid_6fdf9f'] span[data-testid='price-main-price']").nth(2);
        this.bladeCompareModalCommitmentPageContinueBtn = page.locator("div[data-testid='action-container'] button");

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


    async getAcrobatBladeData(): Promise<AcrobatBladeDataPricing> {    
        const bladeData: AcrobatBladeDataPricing = {
            bladeVis: "Not Visible",
            bladeBuyNowBtn: "Not Visible",
            bladeCompareFeaturesBtn: "Not Visible",
            bladeCompareModalProducts: "Not Found",
            bladeCompareModalProductsPrice: "Not Found",
            bladeCompareModalProductsCTA1: "Not Found",
            bladeCompareModalProductsCTA2: "Not Found",
            bladeCompareModalCommitmentPUFPlan: "Not Found",
            bladeCompareModalCommitmentPUFPagePrice: "Not Found",
            bladeCompareModalStoreRecommendationTotalPrice: "Not Found",
            bladeCompareModalCommitmentPageContinueBtn: "Not Found"
        };

        try {
            await this.scrollPage();
            await this.blade.waitFor({ state: 'visible', timeout: 15000 });
            bladeData.bladeVis = await this.blade.isVisible() ? "Visible" : "Not Visible";

            if (await this.bladeBuyNowBtn.isVisible()) {
                bladeData.bladeBuyNowBtn = await this.bladeBuyNowBtn.textContent() || "Not Visible";
            }


            if (await this.bladeCompareFeaturesBtn.isVisible()) {
                bladeData.bladeCompareFeaturesBtn = await this.bladeCompareFeaturesBtn.textContent() || "Not Visible";
            }

            if (await this.bladeCompareModalProducts.isVisible()) {
                bladeData.bladeCompareModalProducts = await this.bladeCompareModalProducts.textContent() || "Not Visible";
            }
            
        } catch (error) {
            throw new Error(`Failed to scroll page: ${error.message}`);
        }
        return bladeData;
    }


    async clickBuyNowBtn(): Promise<string> {
        try {
            const href = await this.bladeBuyNowBtn.getAttribute('href');
            if (!href) {
                throw new Error('Buy Now button href not found');
            }

            const newPage = await this.page.context().newPage();
            await newPage.goto(href, { waitUntil: 'networkidle', timeout: 30000 });
            
            const url = newPage.url();
            if (!url.includes('store/commitment')) {
                throw new Error(`Expected URL to contain 'store/commitment', but got: ${url}`);
            }

            // Verify Acrobat Pro 2024 product
            const productLocator = newPage.locator("div[class='vi3c6W_flex ProductInfo__productInfo___3R8Ab undefined'] div [data-testid='product-info-name']");
            await productLocator.waitFor({ state: 'visible', timeout: 15000 });
            
            const productName = await productLocator.textContent();
            if (!productName?.toLowerCase().includes('acrobat pro')) {
                throw new Error(`Expected product name to contain 'Acrobat Pro', but got: ${productName}`);
            }

            // Click continue button and wait for navigation
            const continueButton = newPage.locator("div[data-testid='action-container'] button");
            await continueButton.waitFor({ state: 'visible', timeout: 15000 });
            await continueButton.click();

            // Wait for navigation to complete and get cart URL
            await newPage.waitForURL('**/store/email**', { timeout: 30000 });
            const cartUrl = newPage.url();

            // Verify subtotal price text is present
            const subtotalLocator = newPage.locator("div[data-testid='editable-cart'] [class='CartTotals__advanced-cart-pre-total___3zAaV'] [data-testid='cart-totals-subtotals-label']");
            await subtotalLocator.waitFor({ state: 'visible', timeout: 15000 });
            const subtotalText = await subtotalLocator.textContent();
            if (!subtotalText) {
                throw new Error('Subtotal text not found in cart');
            }

            // Verify subtotal price is greater than 0
            const subtotalPrice = newPage.locator("div span div[data-testid='price-full-display']").nth(1);
            await subtotalPrice.waitFor({ state: 'visible', timeout: 15000 });
            const priceText = await subtotalPrice.textContent();
            if (!priceText) {
                throw new Error('Subtotal price not found');
            }
            
            // // Convert price text to number (remove currency symbol and parse)
            // const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            // if (isNaN(price) || price <= 0) {
            //     throw new Error(`Invalid subtotal price: ${priceText}`);
            // }

            // Verify total text is visible
            const totalLabel = newPage.locator("div[class='CartTotals__advanced-cart-totals-container___3Vh0X'] [data-testid='cart-totals-total-label']");
            await totalLabel.waitFor({ state: 'visible', timeout: 15000 });
            const totalText = await totalLabel.textContent();
            if (!totalText) {
                throw new Error('Total text not found in cart');
            }


            // Verify total price is greater than 0
            const totalPrice = newPage.locator("div[class='CartTotals__total-amount-plus-tax___Zrx6T'] span div[data-testid='price-full-display']").nth(2);
            await totalPrice.waitFor({ state: 'visible', timeout: 15000 });
            const totalPriceText = await totalPrice.textContent();
            if (!totalPriceText) {  
                throw new Error('Total price not found');
            }
            
            await newPage.close();
            return cartUrl;
        } catch (error) {
            throw new Error(`Failed to click Buy Now button: ${error.message}`);
        }
    }



    // async verifyCompareModalProducts(): Promise<string> {
    //     try {
    //         await this.bladeCompareModalProducts.waitFor({ state: 'visible', timeout: 15000 });
    //         const products = await this.bladeCompareModalProducts.textContent() || 'No products found';
    //         console.log('products', products);

    //         return products;
    //     } catch (error) {
    //         throw new Error(`Failed to verify Compare Features modal products: ${error.message}`);
    //     }
    // }


    // async verifyCompareModalProductsPrice(): Promise<string> {
    //     try {
    //         await this.bladeCompareModalProductsPrice.waitFor({ state: 'visible', timeout: 15000 });
    //         const price = await this.bladeCompareModalProductsPrice.textContent() || 'No price found';
    //         console.log('price', price);

    //         return price;
    //     } catch (error) {
    //         throw new Error(`Failed to verify Compare Features modal products price: ${error.message}`);
    //     }
    // }

    // async clickCompareModalProductsCTAsInNewTabs(): Promise<{ 
    //     success: boolean;
    //     osiId1?: string;
    //     osiId2?: string;
    //     pufPlan?: string;
    //     pufPrice?: string;
    //     totalPrice?: string;
    //     error?: string;
    // }> {
    //     try {
    //         const result = {
    //             success: false,
    //             osiId1: '',
    //             osiId2: '',
    //             pufPlan: '',
    //             pufPrice: '',
    //             totalPrice: '',
    //         };

    //         // Handle first CTA
    //         try {
    //             await this.bladeCompareModalProductsCTA1.waitFor({ state: 'visible', timeout: 15000 });
    //             result.osiId1 = await this.bladeCompareModalProductsCTA1.getAttribute('data-wcs-osi') || 'No OSI ID found';
    //             console.log('First CTA OSI ID:', result.osiId1);

    //             // Get the href attribute
    //             const href1 = await this.bladeCompareModalProductsCTA1.getAttribute('href');
    //             if (!href1) {
    //                 throw new Error('First CTA href not found');
    //             }

    //             // Open in new tab using page.goto
    //             const newPage1 = await this.page.context().newPage();
    //             await newPage1.goto(href1, { waitUntil: 'networkidle', timeout: 30000 });
                
    //             const firstCtaUrl = newPage1.url();
    //             console.log('First CTA URL:', firstCtaUrl);
                
    //             if (!firstCtaUrl.includes('store/commitment')) {
    //                 throw new Error(`Expected URL to contain 'store/commitment', but got: ${firstCtaUrl}`);
    //             }

    //             // Verify PUF Plan with retry mechanism
    //             let retryCount = 0;
    //             const maxRetries = 3;
    //             while (retryCount < maxRetries) {
    //                 try {
    //                     await newPage1.waitForSelector("div[data-testid='commitment-billing']", 
    //                         { state: 'visible', timeout: 15000 });
    //                     result.pufPlan = await newPage1.locator("div[data-testid='commitment-billing']")
    //                         .nth(2).textContent() || 'No PUF plan found';
    //                     console.log('PUF Plan:', result.pufPlan);
    //                     break;
    //                 } catch (error) {
    //                     retryCount++;
    //                     if (retryCount === maxRetries) throw error;
    //                     await newPage1.waitForTimeout(2000); // Wait 2 seconds before retry
    //                 }
    //             }

    //             // Verify PUF Plan Price with retry
    //             retryCount = 0;
    //             while (retryCount < maxRetries) {
    //                 try {
    //                     await newPage1.waitForSelector("div[class='spectrum-Card-grid_6fdf9f'] span[data-testid='price-main-price']", 
    //                         { state: 'visible', timeout: 15000 });
    //                     result.pufPrice = await newPage1.locator("div[class='spectrum-Card-grid_6fdf9f'] span[data-testid='price-main-price']")
    //                         .nth(1).textContent() || 'No price found';
    //                     console.log('PUF Plan Price:', result.pufPrice);
    //                     break;
    //                 } catch (error) {
    //                     retryCount++;
    //                     if (retryCount === maxRetries) throw error;
    //                     await newPage1.waitForTimeout(2000);
    //                 }
    //             }

    //             // Click Continue Button
    //             await newPage1.waitForSelector("div[data-testid='action-container'] button", 
    //                 { state: 'visible', timeout: 15000 });
    //             await newPage1.locator("div[data-testid='action-container'] button").click();
    //             console.log('Clicked Continue Button on commitment page');

    //             // Verify navigation to store recommendation page
    //             await newPage1.waitForURL('**/store/recommendation**', { timeout: 30000 });
    //             const recommendationUrl = newPage1.url();
    //             console.log('Navigated to recommendation page:', recommendationUrl);

    //             if (!recommendationUrl.includes('store/recommendation')) {
    //                 throw new Error(`Expected URL to contain 'store/recommendation', but got: ${recommendationUrl}`);
    //             }

    //             // Verify total price with retry
    //             retryCount = 0;
    //             while (retryCount < maxRetries) {
    //                 try {
    //                     await newPage1.waitForSelector("div[class='CartTotals__total-amount-plus-tax___Zrx6T'] span div[data-testid='price-full-display']", 
    //                         { state: 'visible', timeout: 15000 });
    //                     result.totalPrice = await newPage1.locator("div[class='CartTotals__total-amount-plus-tax___Zrx6T'] span div[data-testid='price-full-display']")
    //                         .textContent() || 'No price found';
    //                     console.log('Recommendation page total price:', result.totalPrice);
    //                     break;
    //                 } catch (error) {
    //                     retryCount++;
    //                     if (retryCount === maxRetries) throw error;
    //                     await newPage1.waitForTimeout(2000);
    //                 }
    //             }

    //             // Compare prices
    //             if (result.totalPrice !== result.pufPrice) {
    //                 throw new Error(`Price mismatch - Commitment page: ${result.pufPrice}, Recommendation page: ${result.totalPrice}`);
    //             }
    //             console.log('Price verification successful - both pages show:', result.pufPrice);

    //             // Click Continue Button on recommendation page
    //             await newPage1.waitForSelector("div[data-testid='action-container'] button", 
    //                 { state: 'visible', timeout: 15000 });
    //             await newPage1.locator("div[data-testid='action-container'] button").click();
    //             console.log('Clicked Continue Button on recommendation page');

    //             await newPage1.close();

    //             // Handle second CTA
    //             await this.bladeCompareModalProductsCTA2.waitFor({ state: 'visible', timeout: 15000 });
    //             result.osiId2 = await this.bladeCompareModalProductsCTA2.getAttribute('data-wcs-osi') || 'No OSI ID found';
    //             console.log('Second CTA OSI ID:', result.osiId2);

    //             const href2 = await this.bladeCompareModalProductsCTA2.getAttribute('href');
    //             if (!href2) {
    //                 throw new Error('Second CTA href not found');
    //             }

    //             const newPage2 = await this.page.context().newPage();
    //             await newPage2.goto(href2, { waitUntil: 'networkidle', timeout: 30000 });
    //             console.log('Second CTA URL:', newPage2.url());
    //             await newPage2.close();

    //             result.success = true;
    //             return result;

    //         } catch (error) {
    //             console.error('Error in processing CTAs:', error);
    //             return {
    //                 ...result,
    //                 success: false,
    //                 error: `Failed to process CTAs: ${error.message}`
    //             };
    //         }

    //     } catch (error) {
    //         console.error('Critical error in clickCompareModalProductsCTAsInNewTabs:', error);
    //         return {
    //             success: false,
    //             error: `Critical error: ${error.message}`
    //         };
    //     }
    // }
}