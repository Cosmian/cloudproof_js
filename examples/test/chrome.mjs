import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: process.env.CI !== undefined });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
});
  page.on("pageerror", async (err) => {
    await reportError(page, `Page Error: ${err.toString()}`);
  });
  page.on("error", async (err) => {
    await reportError(page, `Page Error: ${err.toString()}`);
  });

  await page.goto('http://localhost:8000');

  await page.waitForSelector('#table_cleartext_users', { timeout: 5000 });
  const clearTextUsersCount = await countSelector(page, '#table_cleartext_users tbody tr:not(#newUserRow)');
  if (clearTextUsersCount !== 9) await reportError(page, `Should have 9 cleartext users. Found ${clearTextUsersCount}`);
  
  await page.waitForSelector('#encrypt_user', { timeout: 500 });
  await page.click('#encrypt_user');

  await page.waitForSelector('#table_encrypted_users', { timeout: 500 });
  const encryptedUsersCount = await countSelector(page, '#table_encrypted_users tbody tr');
  if (encryptedUsersCount !== clearTextUsersCount) await reportError(page, `EncryptedUsersCount ${encryptedUsersCount} is not equal to CleartextUsersCount ${clearTextUsersCount}`);

  await page.click('#index');
  await page.waitForSelector('#search', { timeout: 500 });

  const GREEN_CELLS = {
    aliceKey: 9,
    bobKey: 12,
    charlieKey: 24,
  }

  const EXPECTED_RESULTS = [
    {
      key: 'aliceKey',
      doOr: false,
      query: 'Malika',
      lines: 1,
      notDecryptedCount: 2,
    },
    {
      key: 'bobKey',
      doOr: false,
      query: 'Malika',
      lines: 1,
      notDecryptedCount: 5,
    },
    {
      key: 'charlieKey',
      doOr: false,
      query: 'Malika',
      lines: 1,
      notDecryptedCount: 1,
    },
    {
      key: 'aliceKey',
      doOr: false,
      query: 'Thibaud',
      lines: 2,
      notDecryptedCount: 7,
    },
    {
      key: 'bobKey',
      doOr: false,
      query: 'Thibaud',
      lines: 2,
      notDecryptedCount: 10,
    },
    {
      key: 'charlieKey',
      doOr: false,
      query: 'Thibaud',
      lines: 2,
      notDecryptedCount: 6,
    },
    {
      key: 'aliceKey',
      doOr: false,
      query: 'Thibaud France',
      lines: 1,
      notDecryptedCount: 2,
    },
    {
      key: 'bobKey',
      doOr: false,
      query: 'Thibaud France',
      lines: 1,
      notDecryptedCount: 5,
    },
    {
      key: 'charlieKey',
      doOr: false,
      query: 'Thibaud France',
      lines: 1,
      notDecryptedCount: 1,
    },
    {
      key: 'aliceKey',
      doOr: true,
      query: 'Thibaud France',
      lines: 4,
      notDecryptedCount: 11,
    },
    {
      key: 'bobKey',
      doOr: true,
      query: 'Thibaud France',
      lines: 4,
      notDecryptedCount: 20,
    },
    {
      key: 'charlieKey',
      doOr: true,
      query: 'Thibaud France',
      lines: 4,
      notDecryptedCount: 8,
    },
  ].sort((a, b) => 0.5 - Math.random());

  let previousDoOr = false;
  for (const expectedResult of EXPECTED_RESULTS) {
      const input = await page.$('#search input[type=text]')
      await input.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')

      await page.click(`#search input[value=${expectedResult.key}]`);

      if (previousDoOr !== expectedResult.doOr) {
        await page.click(`#search input[type=checkbox]`);
      }

      previousDoOr = expectedResult.doOr;
  
      const greenCount = await countSelector(page, '#table_cleartext_users tbody td.table-success');
      if (greenCount !== GREEN_CELLS[expectedResult.key]) await reportError(page, `Should have ${GREEN_CELLS[expectedResult.key]} cells green. ${greenCount} found.`);
      
      await page.type('#search input[type=text]', expectedResult.query, { delay: 30 });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const notDecryptedCount = await countSelector(page, '#search table td .badge');
      if (notDecryptedCount !== expectedResult.notDecryptedCount) await reportError(page, `Should have ${expectedResult.notDecryptedCount} errors on decryption. ${notDecryptedCount} found.`);
  }
  
  await browser.close();
})();

async function reportError(page, message) {
  await page.screenshot({ path: 'error.png', fullPage: true });
  throw new Error(message);
}

async function countSelector(page, selector) {
  return await page.evaluate(selector => {
    return document.querySelectorAll(selector).length;
  }, selector);
}