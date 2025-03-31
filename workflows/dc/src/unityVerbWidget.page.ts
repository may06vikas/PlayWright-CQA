import { Page, Locator } from '@playwright/test';

interface UnityVerbWidgetData {
    blockVis: string;
    blockVisAttr: string;
    title: string;
    logo: string;
    BlockText: string;
    BlockDesc: string;
    BlockImg: string;
    BlockFileUpload: string;
    BlockFileUploadTxt: string;
    BlockFooterIcon: string;
    footerText: string;
    LinkCount: string;
    TermsLink: string;
    CountryInFooterLink: string;
    ToolTipPre: string;
    ToolTipText: string;
    OnHoverBlockVis: string;
    blockTooltipDisp: string;
}

export class UnityVerbWidget {
    private page: Page;
    private unityBlockVerbWidget: Locator;
    private unityBlockVerbWidgetTitle: Locator;
    private unityBlockVerbWidgetLogo: Locator;
    private unityBlockVerbWidgetHeader: Locator;
    private unityBlockVerbWidgetDesc: Locator;
    private unityBlockVerbWidgetImage: Locator;
    private unityBlockVerbWidgetFileUploadButton: Locator;
    private unityBlockfooterSecurityIcon: Locator;
    private unityBlockVerbWidgetFooterLegalText: Locator;
    private unityBlockVerbWidgetFooterLegal2Text: Locator;
    private unityBlockVerbWidgetFooterTermsLink: Locator;
    private unityBlockVerbWidgetFooterToolTip: Locator;

    constructor(page: Page) {
        this.page = page;

        // Compress PDF
        // this.unityBlockVerbWidget = page.locator("//div[@class='section']//div[contains(@daa-lh,'b1|verb-widget') or contains(@daa-lh,'b2|unity')]");
        // this.unityBlockVerbWidgetTitle = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[contains(@class,'verb-title')]");
        // this.unityBlockVerbWidgetLogo = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[contains(@class,'verb-icon')]");
        // this.unityBlockVerbWidgetHeader = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[contains(@class,'verb-heading')]");
        // this.unityBlockVerbWidgetDesc = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[contains(@class,'verb-copy')]");
        // this.unityBlockVerbWidgetImage = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//div[contains(@class,'verb-image')]");
        // this.unityBlockVerbWidgetFileUploadButton = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//button[contains(@for,'file-upload')]");
        // this.unityBlockfooterSecurityIcon = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//div[contains(@class,'security-icon')]");
        // this.unityBlockVerbWidgetFooterLegalText = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[@class='verb-legal']");
        // this.unityBlockVerbWidgetFooterLegal2Text = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[contains(@class,'legal-two')]");
        // this.unityBlockVerbWidgetFooterTermsLink = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[contains(@class,'legal-two')]//a[contains(@class,'url')]");
        // this.unityBlockVerbWidgetFooterToolTip = page.locator("//div[contains(@class,'verb-widget compress-pdf unity-enabled')]//*[contains(@class,'info-icon milo-tooltip right')]");

        /*---------*/
        // Split PDF Widget Locators:
        // this.unityBlockVerbWidget = page.locator("//div[@class='section']//div[contains(@daa-lh,'b1|verb-widget') or contains(@daa-lh,'b2|unity')]");
        // this.unityBlockVerbWidgetTitle = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[contains(@class,'verb-title')]");
        // this.unityBlockVerbWidgetLogo = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[contains(@class,'verb-icon')]");
        // this.unityBlockVerbWidgetHeader = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[contains(@class,'verb-heading')]");
        // this.unityBlockVerbWidgetDesc = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[contains(@class,'verb-copy')]");
        // this.unityBlockVerbWidgetImage = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//div[contains(@class,'verb-image')]");
        // this.unityBlockVerbWidgetFileUploadButton = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//button[contains(@for,'file-upload')]");
        // this.unityBlockfooterSecurityIcon = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//div[contains(@class,'security-icon')]");
        // this.unityBlockVerbWidgetFooterLegalText = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[@class='verb-legal']");
        // this.unityBlockVerbWidgetFooterLegal2Text = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[contains(@class,'legal-two')]");
        // this.unityBlockVerbWidgetFooterTermsLink = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[contains(@class,'legal-two')]//a[contains(@class,'url')]");
        // this.unityBlockVerbWidgetFooterToolTip = page.locator("//div[contains(@class,'verb-widget split-pdf unity-enabled')]//*[contains(@class,'info-icon milo-tooltip right')]");


        // Edit a PDF Widget Locators:
        this.unityBlockVerbWidget = page.locator("//div[@class='section']//div[contains(@daa-lh,'b1|verb-widget') or contains(@daa-lh,'b2|unity')]");
        this.unityBlockVerbWidgetTitle = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[contains(@class,'verb-title')]");
        this.unityBlockVerbWidgetLogo = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[contains(@class,'verb-icon')]");
        this.unityBlockVerbWidgetHeader = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[contains(@class,'verb-heading')]");
        this.unityBlockVerbWidgetDesc = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[contains(@class,'verb-copy')]");
        this.unityBlockVerbWidgetImage = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//div[contains(@class,'verb-image')]");
        this.unityBlockVerbWidgetFileUploadButton = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//button[contains(@for,'file-upload')]");
        this.unityBlockfooterSecurityIcon = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//div[contains(@class,'security-icon')]");
        this.unityBlockVerbWidgetFooterLegalText = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[@class='verb-legal']");
        this.unityBlockVerbWidgetFooterLegal2Text = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[contains(@class,'legal-two')]");
        this.unityBlockVerbWidgetFooterTermsLink = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[contains(@class,'legal-two')]//a[contains(@class,'url')]");
        this.unityBlockVerbWidgetFooterToolTip = page.locator("//div[contains(@class,'verb-widget add-comment unity-enabled')]//*[contains(@class,'info-icon milo-tooltip right')]");

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

    async getUnityBlockVerbWidgetFrictionless(): Promise<UnityVerbWidgetData> {
        const widgetData: UnityVerbWidgetData = {
            blockVis: "Not Visible",
            blockVisAttr: "NA",
            title: "Not Visible",
            logo: "Not Visible",
            BlockText: "Not Visible",
            BlockDesc: "Not Visible",
            BlockImg: "Not Visible",
            BlockFileUpload: "Not Visible",
            BlockFileUploadTxt: "NA",
            BlockFooterIcon: "Not Visible",
            footerText: "Not Visible",
            LinkCount: "0",
            TermsLink: "NA",
            CountryInFooterLink: "NA",
            ToolTipPre: "Not Visible",
            ToolTipText: "NA",
            OnHoverBlockVis: "NA",
            blockTooltipDisp: "false"
        };
        
        try {

            await this.page.waitForTimeout(7000);
            
            const widgetElements = await this.unityBlockVerbWidget.all(); // Check widget visibility
            const blockPre = widgetElements.length > 0 ? "Visible" : "Not Visible";
            
            if (blockPre === "Visible") {
                await widgetElements[0].scrollIntoViewIfNeeded(); // Scroll to widget
                await this.page.waitForTimeout(4000);
                
                const unityblockAttr1 = await widgetElements[0].getAttribute("class") || "";            // Get widget attributes
                const unityblockAttr2 = widgetElements[1] ? await widgetElements[1].getAttribute("class") || "" : "";
                const unityblockAttr = `${unityblockAttr1} |\n${unityblockAttr2}`;
                
                const title = await this.unityBlockVerbWidgetTitle.isVisible()  // Get title
                    .then(async (visible) => visible ? await this.unityBlockVerbWidgetTitle.textContent() || "Not Visible" : "Not Visible")
                    .catch(() => "Not Visible");
                
                
                const logo = await this.unityBlockVerbWidgetLogo.isVisible()  // Get logo visibility
                    .then((visible) => visible ? "Visible" : "Not Visible")
                    .catch(() => "Not Visible");
                
                const unityHeader = await this.unityBlockVerbWidgetHeader.isVisible()  // Get header
                    .then(async (visible) => {
                        if (visible) {
                            const headerText = await this.unityBlockVerbWidgetHeader.textContent();
                            console.log("Raw header text:", headerText);
                            // Clean up the header text by removing extra whitespace and newlines
                            const cleanedHeaderText = headerText?.replace(/\s+/g, ' ').trim() || "Not Visible";
                            console.log("Cleaned header text:", cleanedHeaderText);
                            return cleanedHeaderText;
                        }
                        return "Not Visible";
                    })
                    .catch((error) => {
                        console.error("Error getting header text:", error);
                        return "Not Visible";
                    });
                
                
                const unityDesc = await this.unityBlockVerbWidgetDesc.isVisible()   // Get description
                    .then(async (visible) => visible ? await this.unityBlockVerbWidgetDesc.textContent() || "Not Visible" : "Not Visible")
                    .catch(() => "Not Visible");
                
                
                const unityImg = await this.unityBlockVerbWidgetImage.isVisible()  // Get image visibility
                    .then((visible) => visible ? "Visible" : "Not Visible")
                    .catch(() => "Not Visible");
                
                
                const fileBtnPre = await this.unityBlockVerbWidgetFileUploadButton.isVisible()  // Get file upload button
                    .then((visible) => visible ? "Visible" : "Not Visible")
                    .catch(() => "Not Visible");
                
                const fileBtnText = fileBtnPre === "Visible" 
                    ? await this.unityBlockVerbWidgetFileUploadButton.textContent() || "NA"
                    : "NA";
                
               
                const securityIcon = await this.unityBlockfooterSecurityIcon.isVisible()    // Get the security icon
                    .then((visible) => visible ? "Visible" : "Not Visible")
                    .catch(() => "Not Visible");
                

               
                let footerTexts = "";     // Get the footer texts
                try {
                    await this.page.waitForLoadState('domcontentloaded');
                    const footerText1 = await this.unityBlockVerbWidgetFooterLegalText.isVisible()
                        .then(async (visible) => visible ? await this.unityBlockVerbWidgetFooterLegalText.textContent() || "Not Visible" : "Not Visible")
                        .catch(() => "Not Visible");
                    
                    const legal2Elements = await this.unityBlockVerbWidgetFooterLegal2Text.all();
                    const footerText2 = legal2Elements.length > 0 
                        ? await legal2Elements[0].isVisible()
                            .then(async (visible) => visible ? await legal2Elements[0].textContent() || "Not Visible" : "Not Visible")
                            .catch(() => "Not Visible")
                        : "Not Visible";
                    
                    footerTexts = `${footerText1} \n${footerText2}`;
                } catch (error) {
                    console.error("Error getting footer texts:", error);
                }
                
              
                let linkPre = "", countryLink = "";          // Get the footer links
                let termsLinks: Locator[] = [];
                try {
                    termsLinks = await this.unityBlockVerbWidgetFooterTermsLink.all();
                    
                    if (termsLinks.length >= 2) {
                        const link1 = termsLinks[0];
                        const link2 = termsLinks[1];
                        
                        if (await link1.isVisible()) {
                            const href1 = await link1.getAttribute("href") || "";
                            console.log("First link href:", href1);
                            // Extract country code from href
                            const country1 = href1.split(".com/")[1]?.split("/")[0] || "NA";
                            linkPre = href1;
                            countryLink = country1;
                        }
                        
                        if (await link2.isVisible()) {
                            const href2 = await link2.getAttribute("href") || "";
                            console.log("Second link href:", href2);
                            // Extract country code from href
                            const country2 = href2.split(".com/")[1]?.split("/")[0] || "NA";
                            linkPre = `${linkPre} | ${href2}`;
                            countryLink = `${countryLink} | ${country2}`;
                        }
                    }
                    console.log("Extracted country codes:", countryLink);
                } catch (error) {
                    console.error("Error getting footer links:", error);
                }
                
                // Get the tooltip
                let tooltipPre = "Not Visible", tooltipText = "NA", tooltipDisptext = "NA", onhoverToolTipBlockPre = "false";
                try {
                    if (await this.unityBlockVerbWidgetFooterToolTip.isVisible()) {
                        tooltipPre = "Visible";
                        await this.unityBlockVerbWidgetFooterToolTip.hover();
                        tooltipText = await this.unityBlockVerbWidgetFooterToolTip.getAttribute("data-tooltip") || "NA";
                        
                        // Check tooltip display
                        const tooltipDisplay = await this.page.evaluate(() => {
                            const tooltip = document.querySelector('.milo-tooltip:hover');
                            return tooltip ? window.getComputedStyle(tooltip, '::before').display : 'none';
                        });
                        
                        tooltipDisptext = tooltipDisplay;
                        onhoverToolTipBlockPre = tooltipDisplay === "block" ? "true" : "false";
                    }
                } catch (error) {
                    console.error("Error getting tooltip:", error);
                }

                
                //Store all data in the widgetData object
                widgetData.blockVis = blockPre;
                widgetData.blockVisAttr = unityblockAttr;
                widgetData.title = title;
                widgetData.logo = logo;
                widgetData.BlockText = unityHeader;
                widgetData.BlockDesc = unityDesc;
                widgetData.BlockImg = unityImg;
                widgetData.BlockFileUpload = fileBtnPre;
                widgetData.BlockFileUploadTxt = fileBtnText;
                widgetData.BlockFooterIcon = securityIcon;
                widgetData.footerText = footerTexts;
                widgetData.LinkCount = termsLinks.length.toString();
                widgetData.TermsLink = linkPre;
                widgetData.CountryInFooterLink = countryLink;
                widgetData.ToolTipPre = tooltipPre;
                widgetData.ToolTipText = tooltipText;
                widgetData.OnHoverBlockVis = tooltipDisptext;
                widgetData.blockTooltipDisp = onhoverToolTipBlockPre;
            }
        } catch (error) {
            console.error("Error in getUnityBlockVerbWidgetFrictionless:", error);
        }
        
        return widgetData;
    }
} 