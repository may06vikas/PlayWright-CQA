import { test, Page, BrowserContext } from '@playwright/test';
import { Consonant_Card } from '../src/dxRegression.page';
import { saveDataToExcel, readUrlsFromSheet } from '../../../utils/excelJS_utils';
import { CommonUtils } from '../../../utils/common';
import { GenericMethods } from '../../../utils/test-helpers';

const productDetails = [
  {
    url: "ujsj",
    "product name": "substance",
    price: "123",
  },
  {
    url: "ujsj",
    "product name": "substance",
    price: "123",
  }
];

test.describe('Consonant Card Tests', () => {
  let page: Page;
  let context: BrowserContext;
  let consonantCardPage: Consonant_Card;
  let genericMethods: GenericMethods;

  test.beforeEach(async ({ browser }) => {
    // Use the common method to create fresh context and page
    const { context: newContext, page: newPage } = await CommonUtils.createFreshContext(browser);
    context = newContext;
    page = newPage;
    consonantCardPage = new Consonant_Card(page);
    genericMethods = new GenericMethods(page);
  });

  test.afterEach(async () => {
    // Close the context after each test to clean up
    await context.close();
  });

  test('Launch URLs from Excel to validate consonent card', async () => {
    const urls = await readUrlsFromSheet('Sheet1');
    let allCardDetails: { sourceUrl: string; country: string; locale: string; visible: string; href: string | null; statusCode: number }[] = [];

    for (const url of urls) {
      console.log(`Running test for URL: ${url}`);

      await consonantCardPage.launchUrl(url);
      await consonantCardPage.page.waitForLoadState();
      await consonantCardPage.closeGioRoutingPopup();
      
      // Extract country and locale using the new method
      const urlInfo = await genericMethods.getCountryNameFromURL(process.env.ENV || 'stage', url);
      const country = urlInfo.get('country')?.replace('/', '') || '';
      const locale = urlInfo.get('locale')?.replace('/', '') || '';
      
      const cardDetails = await consonantCardPage.getConsonentCardsDetails();

      const enrichedCardDetails = cardDetails.map(card => ({
        sourceUrl: url,
        country: country,
        locale: locale,
        visible: card.isVisible ? 'true' : 'false',
        href: card.href,
        statusCode: card.statusCode,
      }));

      allCardDetails = allCardDetails.concat(enrichedCardDetails);
    }

    await saveDataToExcel(allCardDetails, "C:/Users/ujjwalsingh/PlayWright-CQA/test-results/output.xlsx");
    console.log("All data saved to test-results/output.xlsx");
  });
});



//     await saveDataToExcel(allCardDetails, "test-results/output.xlsx");
//     console.log("All data saved to test-results/output.xlsx");
// });

  // Reading the URLs from the Excel Input File.
  // test('Launch URLs from Excel and validate pricing', async () => {
  //   const urls = await readUrlsFromExcel();


  //   for (const url of urls) {
  //     console.log(`Running test for URL: ${url}`);

  //     await consonantCardPage.launchUrl(url);
  //     await consonantCardPage.closeGioRoutingPopup();
  //     //await consonantCardPage.getConsonentCardsDetails();
  //     const productDetails = await consonantCardPage.getConsonentCardsDetails();

  //     // Saving the runtime data of the page into Excel output sheet.
  //     await saveDataToExcel(productDetails,"test-results\\output.xlsx");

  //   }
  // });
 

