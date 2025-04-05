import { Page, Locator } from '@playwright/test';

/**
 * ========================================================================
 * Compare Cards Page Object Model
 * ========================================================================
 * 
 * This Page Object Model (POM) class encapsulates interactions with the 
 * Compare Cards component on the website. It provides methods to:
 * 
 * 1. Extract data from the compare cards table
 * 2. Handle geo-specific popups
 * 3. Manage page scrolling for dynamic content
 * 
 * The POM pattern separates the test logic from the page structure details,
 * making tests more maintainable when the UI changes.
 */

/**
 * Interface defining the data structure for Compare Cards component
 * This represents all data points that will be extracted from the UI
 */
interface CompareCardsData {
    compareCardsVis: string;        // Visibility status of the component
    compareCardsCount: string;      // Number of cards found on the page
    compareCard1Title: string;      // Title of first card (Adobe Acrobat Reader)
    compareCard2Title: string;      // Title of second card (Adobe Acrobat Standard)
    compareCard3Title: string;      // Title of third card (Adobe Acrobat Pro)
    compareCardsCTAs: string[];     // Text of all call-to-action buttons
    compareCardsCTAHrefs: string[]; // URLs (hrefs) of all call-to-action buttons
}

export class CompareCards {
    private page: Page;
    
    // Main UI element locators for the compare cards component
    private compareCards: Locator;                     // Container for all compare cards
    private compareAcrobatReaderCardTitle: Locator;    // Title of Reader card
    private compareAcrobatStandardCardTitle: Locator;  // Title of Standard card 
    private compareAcrobatProCardTitle: Locator;       // Title of Pro card
    private compareCardsCTA: Locator;                  // CTA buttons

    /**
     * Constructor initializes all locators for the Compare Cards component
     * 
     * @param page - The Playwright Page object
     */
    constructor(page: Page) {
        this.page = page;
        // Define locators for all important elements in the Compare Cards component
        this.compareCards = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader']").first();
        this.compareAcrobatReaderCardTitle = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader'] p[id='t1-c2-header']");
        this.compareAcrobatStandardCardTitle = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader'] p[id='t1-c3-header']");
        this.compareAcrobatProCardTitle = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader'] p[id='t1-c4-header']");
        this.compareCardsCTA = page.locator("div[class='heading-button'] p[class='action-area'] a").first();
    }

    /**
     * Closes geo-specific popup modals if they appear
     * 
     * Many websites show location-specific popups on first visit,
     * which need to be closed for automation to continue
     */
    async closeGeoPopUpModal() {
        try {
            const geoModal = this.page.locator('.geo-popup-modal');
            if (await geoModal.isVisible()) {
                const closeButton = geoModal.locator('button[aria-label="Close"]');
                if (await closeButton.isVisible()) {
                    await closeButton.click();
                }
            }
        } catch (error) {
            console.error("Error closing geo popup modal:", error);
        }
    }

    /**
     * Scrolls the page gradually to handle lazy-loaded content
     * 
     * Slowly scrolls the page in steps to ensure all dynamic content 
     * is loaded properly, especially important for pages with 
     * lazy-loading mechanisms
     */
    async scrollToPageEndInSteps() {
        try {
            await this.page.evaluate(async () => {
                const scrollHeight = document.body.scrollHeight;
                const viewportHeight = window.innerHeight;
                let currentPosition = 0;
                
                // Scroll in viewport-sized steps with pause between each step
                while (currentPosition < scrollHeight) {
                    window.scrollTo(0, currentPosition);
                    currentPosition += viewportHeight;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                // Final scroll to ensure we reach the bottom
                window.scrollTo(0, scrollHeight);
                await new Promise(resolve => setTimeout(resolve, 1000));
            });
        } catch (error) {
            console.error("Error scrolling page:", error);
        }
    }

    /**
     * Extracts all relevant data from the Compare Cards component
     * 
     * This method:
     * 1. Waits for the page to load completely
     * 2. Checks if the compare cards component is visible
     * 3. Extracts the number of cards and their titles
     * 4. Extracts CTA text and links
     * 5. Returns a structured data object with all information
     * 
     * @returns Promise resolving to CompareCardsData object with all extracted information
     */
    async getCompareCardsData(): Promise<CompareCardsData> {
        // Initialize data structure with default "not found" values
        const compareCardsData: CompareCardsData = {
            compareCardsVis: "Not Visible",
            compareCardsCount: "0",
            compareCard1Title: "Not Visible",
            compareCard2Title: "Not Visible",
            compareCard3Title: "Not Visible",
            compareCardsCTAs: [],
            compareCardsCTAHrefs: []
        };

        try {
            // Step 1: Wait for page to be fully loaded
            await this.page.waitForLoadState('networkidle');
            
            // Step 2: Check if compare cards container exists and is visible
            const compareCardsContainer = this.page.locator("div[daa-lh='b1|table']");
            await compareCardsContainer.waitFor({ state: 'visible', timeout: 15000 });
            
            // Step 3: Wait for compare cards to be visible (with generous timeout)
            await this.compareCards.waitFor({ state: 'visible', timeout: 15000 });
            
            // Step 4: Count the number of cards with retry logic in case of slow loading
            let compareCardsElements;
            let retryCount = 0;
            while (retryCount < 3) {
                compareCardsElements = await this.page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader']").all();
                if (compareCardsElements.length > 0) 
                    break;
                await this.page.waitForTimeout(2000);
                retryCount++;
            }

            // Step 5: Set visibility and count of cards
            const cardCount = compareCardsElements?.length.toString() || "0";
            const compareCardsVis = cardCount === "3" ? "Visible" : "Not Visible";
            console.log(`Found ${cardCount} compare cards`);
            compareCardsData.compareCardsCount = cardCount;
            compareCardsData.compareCardsVis = compareCardsVis;

            // Step 6: If cards are visible, extract titles and CTAs
            if (compareCardsVis === "Visible") {
                // Get titles for each card with retry logic for reliability
                for (let i = 0; i < 3; i++) {
                    try {
                        await this.compareAcrobatReaderCardTitle.waitFor({ state: 'visible', timeout: 10000 });
                        await this.compareAcrobatStandardCardTitle.waitFor({ state: 'visible', timeout: 10000 });
                        await this.compareAcrobatProCardTitle.waitFor({ state: 'visible', timeout: 10000 });
                        break;
                    } catch (error) {
                        if (i === 2) throw error; // Throw error on final retry only
                        await this.page.waitForTimeout(2000);
                    }
                }

                // Step 7: Extract title text for each card
                const readerTitle = await this.compareAcrobatReaderCardTitle.textContent() || "Not Visible";
                const standardTitle = await this.compareAcrobatStandardCardTitle.textContent() || "Not Visible";
                const proTitle = await this.compareAcrobatProCardTitle.textContent() || "Not Visible";

                console.log("Compare Cards Titles:", {
                    reader: readerTitle,
                    standard: standardTitle,
                    pro: proTitle
                });

                compareCardsData.compareCard1Title = readerTitle;
                compareCardsData.compareCard2Title = standardTitle;
                compareCardsData.compareCard3Title = proTitle;

                // Step 8: Extract CTAs and their hrefs with retry logic
                for (let i = 0; i < 3; i++) {
                    try {
                        await this.compareCardsCTA.waitFor({ state: 'visible', timeout: 10000 });
                        const ctaElements = await this.page.locator("div[class='heading-button'] p[class='action-area'] a").all();
                        
                        // Step 9: Process each CTA button to extract text and URL
                        for (const cta of ctaElements) {
                            const ctaText = await cta.textContent() || "Not Visible";
                            const ctaHref = await cta.getAttribute("href") || "Not Visible";
                            
                            compareCardsData.compareCardsCTAs.push(ctaText);
                            compareCardsData.compareCardsCTAHrefs.push(ctaHref);
                            
                            console.log("CTA:", ctaText, "Href:", ctaHref);
                        }
                        break;
                    } catch (error) {
                        if (i === 2) throw error; // Throw error on final retry only
                        await this.page.waitForTimeout(2000);
                    }
                }
            }
        } catch (error) {
            console.error("Error getting compare cards data:", error);
        }

        // Return the populated data structure
        return compareCardsData;
    }
}    