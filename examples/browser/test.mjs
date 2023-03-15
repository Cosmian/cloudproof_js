import { exit } from "process"
import puppeteer from "puppeteer"

const host = "http://localhost:8000"

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

await page.waitForSelector("#done", { timeout: 500 })

exit(0)

async function reportError(page, message) {
  await page.screenshot({ path: "error.png", fullPage: true })
  throw new Error(message)
}
