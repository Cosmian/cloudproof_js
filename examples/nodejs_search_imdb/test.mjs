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

// Wait 10 seconds before killing the importation
await new Promise((resolve) => setTimeout(resolve, 5 * 100))

process.kill("SIGINT")

await new Promise((resolve) => setTimeout(resolve, 1 * 100))
process.stdin.write("Documentary\n")
process.stdin.end()

// Wait the search results
await new Promise((resolve) => setTimeout(resolve, 5 * 100))

if (!stdout.includes("https://www.imdb.com/title/tt0000001")) {
  console.log(stdout)
  throw new Error("Stdout doesn't contains the documentary link")
}
