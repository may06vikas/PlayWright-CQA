import { Page, Locator, expect } from '@playwright/test';


interface  MerchCardData {
    merchCardVis: string;
    merchCardTitle: string;
    merchCardCTA: string;
    merchCardCTAHref: string;
    tabName: string;
    genAIBar: string;
    cardCount: string;
}

export class MerchCard {
    private page: Page;
    private businessTab: Locator;
    private merchCard: Locator;
    private merchCardTitle: Locator;
    private merchCardCTA: Locator;
    private merchCardGenAIBar: Locator;


    constructor(page: Page) {
        this.page = page;
        this.businessTab = page.locator("//div[contains(@id,'compare') or contains(@id,'plans-and-pricing')]/child::div/child::div[contains(@class,'list')]/child::button").nth(1);
        // this.merchCard = page.locator("[class='merch-card mini-compare-chart static-links']");
        this.merchCard = page.locator("merch-card.static-links");
        this.merchCardTitle = page.locator("merch-card.static-links h3[class='card-heading']");
        this.merchCardCTA = page.locator("merch-card.static-links div[slot='footer'] p[class='action-area'] a[class='con-button outline button-l']");
        this.merchCardGenAIBar = page.locator("//div[contains(@daa-lh,'tabs') or contains(@class,'tabs')][not(contains(@id,'demo') or contains(@id,'tabs-genaipdfstudents') or contains(@id,'tabs-prompts'))]//div[contains(@class,'dark flexible')]");
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

    async clickBusinessTab() {
        try {
            await this.businessTab.click();
            await this.page.waitForTimeout(5000); // Wait for tab content to load
            console.log("Clicked on business tab");
        } catch (error) {
            console.error("Error clicking business tab:", error);
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

    
    async getMerchCardData(): Promise<MerchCardData> {
        const merchCardData: MerchCardData = {
            merchCardVis: "Not Visible",
            merchCardTitle: "Not Visible",
            merchCardCTA: "Not Visible",
            merchCardCTAHref: "Not Visible",
            tabName: "Not Visible",
            genAIBar: "Not Visible",
            cardCount: "0"
        };

        try {
            // Wait for business tab to be visible and get its text
            await this.businessTab.waitFor({ state: 'visible', timeout: 10000 });
            const tabName = await this.businessTab.textContent() || "Not Visible";
            merchCardData.tabName = tabName;

            // Click business tab first
            await this.businessTab.click();
            console.log("Clicked on business tab");
            
            // Wait for tab content to load
            await this.page.waitForTimeout(5000);

            // Check GenAI bar visibility after business tab click
            const genAIBarElements = await this.merchCardGenAIBar.all();
            const genAIBarCount = genAIBarElements.length;
            console.log(`Found ${genAIBarCount} GenAI bar elements on business tab`);

            // Simply check if GenAI bar is present
            merchCardData.genAIBar = genAIBarCount > 0 ? "Visible" : "Not Visible";
            console.log(`GenAI Bar Status: ${merchCardData.genAIBar}`);

            // Wait for merch card to be visible
            await this.merchCard.waitFor({ state: 'visible', timeout: 10000 });
            
            // Check if only one merch card is visible
            const merchCardElements = await this.merchCard.all();
            const cardCount = merchCardElements.length.toString();
            const merchCardVis = cardCount === "1" ? "Visible" : "Not Visible";
            console.log(`Found ${cardCount} merch cards`);
            merchCardData.cardCount = cardCount;

            if (merchCardVis === "Visible") {
                // Wait for title to be visible
                await this.merchCardTitle.waitFor({ state: 'visible', timeout: 10000 });
                const merchCardTitle = await this.merchCardTitle.textContent() || "Not Visible";
                console.log("Merch Card Title:", merchCardTitle);

                // Wait for CTA to be visible
                await this.merchCardCTA.waitFor({ state: 'visible', timeout: 10000 });
                const merchCardCTA = await this.merchCardCTA.textContent() || "Not Visible";
                const merchCardCTAHref = await this.merchCardCTA.getAttribute("href") || "Not Visible";
                console.log("Merch Card CTA:", merchCardCTA);
                console.log("Merch Card CTA Href:", merchCardCTAHref);
                    
                merchCardData.merchCardVis = merchCardVis;
                merchCardData.merchCardTitle = merchCardTitle;
                merchCardData.merchCardCTA = merchCardCTA;
                merchCardData.merchCardCTAHref = merchCardCTAHref;
            }
        } catch (error) {
            console.error("Error getting merch card data:", error);
        }

        return merchCardData;
        
    }
    
    
}   
