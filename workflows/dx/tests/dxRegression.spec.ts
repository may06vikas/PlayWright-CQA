import { test, Page } from '@playwright/test';
import { Consonant_Card } from '../src/dxRegression.page';
import { saveDataToExcel, readUrlsFromExcel } from '../../../utils/excelJS_utils';

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
  let consonantCardPage: Consonant_Card;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    consonantCardPage = new Consonant_Card(page);
  });

  test('Launch URLs from Excel to validate consonent card', async () => {
    const urls = await readUrlsFromExcel();
    let allCardDetails: { sourceUrl: string; visible: string; href: string | null; statusCode: number }[] = [];

    for (const url of urls) {
      console.log(`Running test for URL: ${url}`);

      await consonantCardPage.launchUrl(url);
      await consonantCardPage.page.waitForLoadState();
      await consonantCardPage.closeGioRoutingPopup();
      const cardDetails = await consonantCardPage.getConsonentCardsDetails();

      const enrichedCardDetails = cardDetails.map(card => ({
        sourceUrl: url,
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










    // Save all card details to a single Excel file
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
 
