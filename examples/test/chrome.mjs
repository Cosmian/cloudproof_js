import { exit } from "process"
import puppeteer from "puppeteer"

const host = process.argv[2] || undefined
const kmsHost = process.argv[3] || undefined

if (!host) {
  console.error("Please provide host: chrome.mjs http://localhost:8080")
  exit(1)
}

console.log(`Running tests on ${host}`)
if (kmsHost) {
  console.log(`Running KMS tests on ${kmsHost}`)
} else {
  console.log("Skip KMS tests because no host provided.")
}
console.log()
;(async () => {
  await runTest("JS without graphs", false, false)
  await runTest("JS with graphs", true, false)

  if (kmsHost) {
    await runTest("KMS without graphs", false, true)
    await runTest("KMS with graphs", true, true)
  }
})()

/**
 *
 * @param name
 * @param withGraphs
 * @param withKms
 */
async function runTest(name, withGraphs, withKms) {
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
    await reportError(page, `[PAGE ERROR] ${err.toString()}`)
  })
  page.on("error", async (err) => {
    await reportError(page, `[PAGE ERROR] ${err.toString()}`)
  })
  page.on("console", (msg) => {
    // This is an expected error when trying to decrypt something we don't have the correct rights
    if (
      msg.text() !==
      "Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)"
    ) {
      console.log(`[PAGE LOG] ${msg.text()}`)
    }
  })
  page.on("requestfailed", async (request) =>
    console.log(
      `[PAGE HTTP ERROR] ${request.failure().errorText} ${request.url()}`,
    ),
  )

  try {
    await page.goto(host)
  } catch {
    // In case of random error, try again.
    console.error("Cannot navigate to the example, trying again one time…")
    await page.goto(host)
  }

  await page.waitForSelector("#table_cleartext_users", { timeout: 20 * 1000 })
  await assertCountSelector(
    page,
    "#table_cleartext_users tbody tr:not(#new_user_row)",
    9,
  )

  if (withGraphs || withKms) {
    await page.click("#options")

    if (withGraphs) {
      await page.click("#usingGraphs")
    }

    if (withKms) {
      await page.type("#kmsServerUrl", `${kmsHost}`, { delay: 50 })
    }
  }

  await addNewUser(
    page,
    {
      first: "John",
      last: "Doe",
      country: "France",
      email: "john@example.org",
      project: "example",
    },
    10,
  )

  await page.click("#encrypt_user")
  await page.waitForSelector("#table_encrypted_users", { timeout: 10000 })
  await assertCountSelector(page, "#table_encrypted_users tbody tr", 10)

  await page.click("#index")
  await page.waitForSelector("#search", { timeout: 2000 })

  const GREEN_CELLS = {
    aliceKey: 12,
    bobKey: 12,
    charlieKey: 28,
  }

  const expectedResults = [
    {
      key: "aliceKey",
      doOr: false,
      query: "Margaret",
      lines: 1,
      notDecryptedCount: 2,
    },
    {
      key: "bobKey",
      doOr: false,
      query: "Margaret",
      lines: 1,
      notDecryptedCount: 5,
    },
    {
      key: "charlieKey",
      doOr: false,
      query: "Margaret",
      lines: 1,
      notDecryptedCount: 1,
    },
    {
      key: "aliceKey",
      doOr: false,
      query: "Simone",
      lines: 2,
      notDecryptedCount: 7,
    },
    {
      key: "bobKey",
      doOr: false,
      query: "Simone",
      lines: 2,
      notDecryptedCount: 10,
    },
    {
      key: "charlieKey",
      doOr: false,
      query: "Simone",
      lines: 2,
      notDecryptedCount: 6,
    },
    {
      key: "aliceKey",
      doOr: false,
      query: "Simone France",
      lines: 1,
      notDecryptedCount: 2,
    },
    {
      key: "bobKey",
      doOr: false,
      query: "Simone France",
      lines: 1,
      notDecryptedCount: 5,
    },
    {
      key: "charlieKey",
      doOr: false,
      query: "Simone France",
      lines: 1,
      notDecryptedCount: 1,
    },
    {
      key: "aliceKey",
      doOr: true,
      query: "Simone France",
      lines: 5,
      notDecryptedCount: 13,
    },
    {
      key: "bobKey",
      doOr: true,
      query: "Simone France",
      lines: 5,
      notDecryptedCount: 25,
    },
    {
      key: "charlieKey",
      doOr: true,
      query: "Simone France",
      lines: 5,
      notDecryptedCount: 9,
    },
    // eslint-disable-next-line no-unused-vars
  ].sort((a, b) => 0.5 - Math.random())

  if (withGraphs) {
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
      query: "Mar",
      lines: 2,
      notDecryptedCount: 7,
    })
    expectedResults.push({
      key: "aliceKey",
      doOr: false,
      query: "Margar",
      lines: 1,
      notDecryptedCount: 2,
    })
  }

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

    await assertCountSelector(
      page,
      "#table_cleartext_users tbody td.table-success",
      GREEN_CELLS[expectedResult.key],
      `(query ${expectedResult.query}, key ${expectedResult.key}, doOr ${expectedResult.doOr})`,
    )

    await page.type("#search input[type=text]", expectedResult.query, {
      delay: 50,
    })
    await assertCountSelector(
      page,
      "#search table td .badge",
      expectedResult.notDecryptedCount,
      `query ${expectedResult.query}, key ${expectedResult.key}, doOr ${expectedResult.doOr}).`,
    )
  }

  await addNewUser(
    page,
    {
      first: "Jane",
      last: "Doe",
      country: "Germany",
      email: "jane@example.org",
      project: "example",
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
      delay: 50,
    })
    await assertCountSelector(
      page,
      "#search table td .badge",
      expectedResult.notDecryptedCount,
      `(query ${expectedResult.query}, key ${expectedResult.key}, doOr ${expectedResult.doOr}).`,
    )
  }

  await browser.close()

  console.log("\x1b[32m", `✓ All Good for ${name}!`, "\x1b[0m")
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
 * @param expected
 * @param additionalMessage
 * @param timeout
 */
async function assertCountSelector(
  page,
  selector,
  expected,
  additionalMessage = "",
  timeout = 60000,
) {
  const start = new Date()
  let count = null
  do {
    count = await page.evaluate((selector) => {
      return document.querySelectorAll(selector).length
    }, selector)

    if (count === expected) return

    await new Promise((resolve) => setTimeout(resolve, 50))
  } while (new Date() - start < timeout)

  await reportError(
    page,
    `"${selector}" should have ${expected} elements, ${count} still found after ${timeout}ms. ${additionalMessage}`,
  )
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
  await page.type("#new_user_row input#new_user_project", newUser.project)
  await page.click("#new_user_row button")

  await assertCountSelector(
    page,
    "#table_cleartext_users tbody tr:not(#new_user_row)",
    newCount,
  )
}
