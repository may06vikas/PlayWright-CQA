import { Page, Locator } from '@playwright/test';

interface CompareCardsData {
    compareCardsVis: string;
    compareCardsCount: string;
    compareCard1Title: string;
    compareCard2Title: string;
    compareCard3Title: string;
    compareCardsCTAs: string[];
    compareCardsCTAHrefs: string[];
}

export class CompareCards {
    private page: Page;
    private compareCards: Locator;
    private compareAcrobatReaderCardTitle: Locator;
    private compareAcrobatStandardCardTitle: Locator;
    private compareAcrobatProCardTitle: Locator;
    private compareCardsCTA: Locator;

    constructor(page: Page) {
        this.page = page;
        this.compareCards = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader']").first();
        this.compareAcrobatReaderCardTitle = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader'] p[id='t1-c2-header']");
        this.compareAcrobatStandardCardTitle = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader'] p[id='t1-c3-header']");
        this.compareAcrobatProCardTitle = page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader'] p[id='t1-c4-header']");
        this.compareCardsCTA = page.locator("div[class='heading-button'] p[class='action-area'] a").first();
    }

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

    async scrollToPageEndInSteps() {
        try {
            await this.page.evaluate(async () => {
                const scrollHeight = document.body.scrollHeight;
                const viewportHeight = window.innerHeight;
                let currentPosition = 0;
                
                while (currentPosition < scrollHeight) {
                    window.scrollTo(0, currentPosition);
                    currentPosition += viewportHeight;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                window.scrollTo(0, scrollHeight);
                await new Promise(resolve => setTimeout(resolve, 1000));
            });
        } catch (error) {
            console.error("Error scrolling page:", error);
        }
    }

    async getCompareCardsData(): Promise<CompareCardsData> {
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
            // Wait for page to be fully loaded
            await this.page.waitForLoadState('networkidle');
            
            // Wait for compare cards container to be visible
            const compareCardsContainer = this.page.locator("div[daa-lh='b1|table']");
            await compareCardsContainer.waitFor({ state: 'visible', timeout: 15000 });
            
            // Wait for compare cards to be visible with increased timeout
            await this.compareCards.waitFor({ state: 'visible', timeout: 15000 });
            
            // Get count of compare cards with retry
            let compareCardsElements;
            let retryCount = 0;
            while (retryCount < 3) {
                compareCardsElements = await this.page.locator("div[daa-lh='b1|table'] div[class='row row-2 row-heading'] [role='columnheader']").all();
                if (compareCardsElements.length > 0) 
                    break;
                await this.page.waitForTimeout(2000);
                retryCount++;
            }

            const cardCount = compareCardsElements?.length.toString() || "0";
            const compareCardsVis = cardCount === "3" ? "Visible" : "Not Visible";
            console.log(`Found ${cardCount} compare cards`);
            compareCardsData.compareCardsCount = cardCount;
            compareCardsData.compareCardsVis = compareCardsVis;

            if (compareCardsVis === "Visible") {
                // Get titles for each card with retry
                for (let i = 0; i < 3; i++) {
                    try {
                        await this.compareAcrobatReaderCardTitle.waitFor({ state: 'visible', timeout: 10000 });
                        await this.compareAcrobatStandardCardTitle.waitFor({ state: 'visible', timeout: 10000 });
                        await this.compareAcrobatProCardTitle.waitFor({ state: 'visible', timeout: 10000 });
                        break;
                    } catch (error) {
                        if (i === 2) throw error;
                        await this.page.waitForTimeout(2000);
                    }
                }

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

                // Get CTAs and their hrefs with retry
                for (let i = 0; i < 3; i++) {
                    try {
                        await this.compareCardsCTA.waitFor({ state: 'visible', timeout: 10000 });
                        const ctaElements = await this.page.locator("div[class='heading-button'] p[class='action-area'] a").all();
                        
                        for (const cta of ctaElements) {
                            const ctaText = await cta.textContent() || "Not Visible";
                            const ctaHref = await cta.getAttribute("href") || "Not Visible";
                            
                            compareCardsData.compareCardsCTAs.push(ctaText);
                            compareCardsData.compareCardsCTAHrefs.push(ctaHref);
                            
                            console.log("CTA:", ctaText, "Href:", ctaHref);
                        }
                        break;
                    } catch (error) {
                        if (i === 2) throw error;
                        await this.page.waitForTimeout(2000);
                    }
                }
            }
        } catch (error) {
            console.error("Error getting compare cards data:", error);
        }

        return compareCardsData;
    }
}    