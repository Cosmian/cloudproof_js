import puppeteer from "puppeteer"
;(async () => {
  await runTest("without graphs")
  await runTest(
    "with graphs",
    async (page) => {
      await page.click("#options")
      await page.click("#usingGraphs")
    },
    (expectedResults) => {
      expectedResults.push({
        key: "aliceKey",
        doOr: false,
        query: "Ma",
        lines: 0,
        notDecryptedCount: 0,
      })
      expectedResults.push({
        key: "aliceKey",
        doOr: false,
        query: "Mal",
        lines: 1,
        notDecryptedCount: 2,
      })

      return expectedResults
    },
  )
})()

/**
 *
 * @param name
 * @param optionsCallback
 * @param expectedResultsCallback
 */
async function runTest(
  name,
  optionsCallback = async () => {},
  expectedResultsCallback = (e) => e,
) {
  const browser = await puppeteer.launch({
    headless: process.env.CI !== undefined,
    args: ["--no-sandbox"],
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
  })
  page.on("pageerror", async (err) => {
    await reportError(page, `Page Error: ${err.toString()}`)
  })
  page.on("error", async (err) => {
    await reportError(page, `Page Error: ${err.toString()}`)
  })

  await page.goto("http://localhost:8080")

  {
    await page.waitForSelector("#table_cleartext_users", { timeout: 50000 })
    const clearTextUsersCount = await countSelector(
      page,
      "#table_cleartext_users tbody tr:not(#new_user_row)",
    )
    if (clearTextUsersCount !== 9)
      await reportError(
        page,
        `Should have 9 cleartext users. Found ${clearTextUsersCount}`,
      )
  }

  await optionsCallback(page)

  await addNewUser(
    page,
    {
      first: "John",
      last: "Doe",
      country: "France",
      email: "john@example.org",
      securityNumber: "42",
    },
    10,
  )

  await page.click("#encrypt_user")
  await page.waitForSelector("#table_encrypted_users", { timeout: 500 })
  const encryptedUsersCount = await countSelector(
    page,
    "#table_encrypted_users tbody tr",
  )
  if (encryptedUsersCount !== 10)
    await reportError(
      page,
      `EncryptedUsersCount ${encryptedUsersCount} is not equal to CleartextUsersCount 10`,
    )

  await page.click("#index")
  await page.waitForSelector("#search", { timeout: 500 })

  const GREEN_CELLS = {
    aliceKey: 12,
    bobKey: 12,
    charlieKey: 28,
  }

  const expectedResults = expectedResultsCallback(
    [
      {
        key: "aliceKey",
        doOr: false,
        query: "Malika",
        lines: 1,
        notDecryptedCount: 2,
      },
      {
        key: "bobKey",
        doOr: false,
        query: "Malika",
        lines: 1,
        notDecryptedCount: 5,
      },
      {
        key: "charlieKey",
        doOr: false,
        query: "Malika",
        lines: 1,
        notDecryptedCount: 1,
      },
      {
        key: "aliceKey",
        doOr: false,
        query: "Thibaud",
        lines: 2,
        notDecryptedCount: 7,
      },
      {
        key: "bobKey",
        doOr: false,
        query: "Thibaud",
        lines: 2,
        notDecryptedCount: 10,
      },
      {
        key: "charlieKey",
        doOr: false,
        query: "Thibaud",
        lines: 2,
        notDecryptedCount: 6,
      },
      {
        key: "aliceKey",
        doOr: false,
        query: "Thibaud France",
        lines: 1,
        notDecryptedCount: 2,
      },
      {
        key: "bobKey",
        doOr: false,
        query: "Thibaud France",
        lines: 1,
        notDecryptedCount: 5,
      },
      {
        key: "charlieKey",
        doOr: false,
        query: "Thibaud France",
        lines: 1,
        notDecryptedCount: 1,
      },
      {
        key: "aliceKey",
        doOr: true,
        query: "Thibaud France",
        lines: 5,
        notDecryptedCount: 13,
      },
      {
        key: "bobKey",
        doOr: true,
        query: "Thibaud France",
        lines: 5,
        notDecryptedCount: 25,
      },
      {
        key: "charlieKey",
        doOr: true,
        query: "Thibaud France",
        lines: 5,
        notDecryptedCount: 9,
      },
      // eslint-disable-next-line no-unused-vars
    ].sort((a, b) => 0.5 - Math.random()),
  )

  let previousDoOr = false
  for (const expectedResult of expectedResults) {
    const input = await page.$("#search input[type=text]")
    await input.click({ clickCount: 3 })
    await page.keyboard.press("Backspace")

    await page.click(`#search input[value=${expectedResult.key}]`)

    if (previousDoOr !== expectedResult.doOr) {
      await page.click(`#search input[type=checkbox]`)
    }

    previousDoOr = expectedResult.doOr

    const greenCount = await countSelector(
      page,
      "#table_cleartext_users tbody td.table-success",
    )
    if (greenCount !== GREEN_CELLS[expectedResult.key])
      await reportError(
        page,
        `Should have ${
          GREEN_CELLS[expectedResult.key]
        } cells green. ${greenCount} found.  (query ${
          expectedResult.query
        }, key ${expectedResult.key}, doOr ${expectedResult.doOr})`,
      )

    await page.type("#search input[type=text]", expectedResult.query, {
      delay: 30,
    })
    await new Promise((resolve) => setTimeout(resolve, 500))
    const notDecryptedCount = await countSelector(
      page,
      "#search table td .badge",
    )
    if (notDecryptedCount !== expectedResult.notDecryptedCount)
      await reportError(
        page,
        `Should have ${expectedResult.notDecryptedCount} errors on decryption. ${notDecryptedCount} found (query ${expectedResult.query}, key ${expectedResult.key}, doOr ${expectedResult.doOr}).`,
      )
  }

  await addNewUser(
    page,
    {
      first: "Jane",
      last: "Doe",
      country: "Germany",
      email: "jane@example.org",
      securityNumber: "42",
    },
    11,
  )
  expectedResults.unshift({
    key: "charlieKey",
    doOr: false,
    query: "Doe",
    lines: 2,
    notDecryptedCount: 6,
  })

  for (const expectedResult of expectedResults) {
    const input = await page.$("#search input[type=text]")
    await input.click({ clickCount: 3 })
    await page.keyboard.press("Backspace")

    await page.click(`#search input[value=${expectedResult.key}]`)

    if (previousDoOr !== expectedResult.doOr) {
      await page.click(`#search input[type=checkbox]`)
    }

    previousDoOr = expectedResult.doOr

    await page.type("#search input[type=text]", expectedResult.query, {
      delay: 30,
    })
    await new Promise((resolve) => setTimeout(resolve, 500))
    const notDecryptedCount = await countSelector(
      page,
      "#search table td .badge",
    )
    if (notDecryptedCount !== expectedResult.notDecryptedCount)
      await reportError(
        page,
        `Should have ${expectedResult.notDecryptedCount} errors on decryption. ${notDecryptedCount} found (query ${expectedResult.query}, key ${expectedResult.key}, doOr ${expectedResult.doOr}).`,
      )
  }

  await browser.close()

  console.log("\x1b[32m", `✓ All Good for ${name}!`)
}

/**
 *
 * @param page
 * @param message
 */
async function reportError(page, message) {
  await page.screenshot({ path: "error.png", fullPage: true })
  throw new Error(message)
}

/**
 *
 * @param page
 * @param selector
 */
async function countSelector(page, selector) {
  return await page.evaluate((selector) => {
    return document.querySelectorAll(selector).length
  }, selector)
}

/**
 *
 * @param page
 * @param newUser
 * @param newCount
 */
async function addNewUser(page, newUser, newCount) {
  await page.type("#new_user_row input#new_user_first", newUser.first)
  await page.type("#new_user_row input#new_user_last", newUser.last)
  await page.select("#new_user_row select#new_user_country", newUser.country)
  await page.type("#new_user_row input#new_user_email", newUser.email)
  await page.type(
    "#new_user_row input#new_user_security_number",
    newUser.securityNumber,
  )
  await page.click("#new_user_row button")

  await new Promise((resolve) => setTimeout(resolve, 50))
  const clearTextUsersCount = await countSelector(
    page,
    "#table_cleartext_users tbody tr:not(#new_user_row)",
  )
  if (clearTextUsersCount !== newCount)
    await reportError(
      page,
      `Should have ${newCount} cleartext users. Found ${clearTextUsersCount}`,
    )
}
