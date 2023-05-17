import { exit } from "process"
import puppeteer from "puppeteer"
const host = process.argv[2] || undefined
if (!host) {
  console.error("Please provide host: chome.mjs http://localhost:8080")
  exit(1)
}

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

await page.waitForSelector("#button", { timeout: 20 * 1000 })
await page.click("#button")
await new Promise((resolve) => setTimeout(resolve, 1000))

const f = await page.$("#decrypted")
const text = await (await f.getProperty("textContent")).jsonValue()

if (text !== "Hello World!") {
  reportError(
    page,
    `Wrong text inside #decrypted element "${text}" ("Hello World!" expected)`,
  )
}

await browser.close()

console.log("\x1b[32m", `✓ All Good!`, "\x1b[0m")

/**
 *
 * @param page
 * @param message
 */
async function reportError(page, message) {
  await page.screenshot({ path: "error.png", fullPage: true })
  throw new Error(message)
}
