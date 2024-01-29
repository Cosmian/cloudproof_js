import { spawn } from "node:child_process"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

const process = spawn("node", [
  path.join(dirname(fileURLToPath(import.meta.url)), "index.mjs"),
])
process.stdin.setEncoding("utf-8")

let stdout = ""

process.stdout.on("data", (data) => {
  const dataAsString = new TextDecoder().decode(data)
  console.log(dataAsString)
  stdout = stdout + dataAsString
})
process.stderr.on("data", (data) => {
  throw new Error(`Error while running: ${data}`)
})

while (!stdout.includes("Search:")) {
  // Wait 10 seconds before killing the importation
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

process.stdin.write("title\n")
process.stdin.end()

// Wait the search results
await new Promise((resolve) => setTimeout(resolve, 1000))

if (!stdout.includes("Searching for title (titl, TTL), 20 results.")) {
  console.log(stdout)
  throw new Error("Search didn't end or wrong number of results")
}

if (!stdout.includes("If you modify the section \x1b[32mtitle\x1b[2m")) {
  console.log(stdout)
  throw new Error("Stdout doesn't contains a simple search result")
}

if (!stdout.includes("such as \x1b[32mtitles\x1b[2m (stem titl)")) {
  console.log(stdout)
  throw new Error("Stdout doesn't contains a stem result")
}

if (
  !stdout.includes("dots represent the \x1b[32mtotal\x1b[2m (phonetic TTL)")
) {
  console.log(stdout)
  throw new Error("Stdout doesn't contains a phonetic result")
}
