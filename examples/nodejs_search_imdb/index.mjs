import fs from "fs"
import readline from "readline"
import {
  Location,
  Findex,
  FindexKey,
  Label,
  callbacksExamplesBetterSqlite3,
} from "cloudproof_js"
import path from "path"
import { fileURLToPath } from "url"
import { randomBytes } from "crypto"
import Database from "better-sqlite3"

let end = false

process.on("SIGINT", function () {
  if (end) {
    process.exit()
  } else {
    end = true
  }
})

// Check the IMDB file, create a stream to parse line by line.
const NUMBER_OF_MOVIES_INSIDE_TSV = 9427158 - 1 // Number of line of the .tsv (useful to show percentage completion)
const dataFilename = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "imdb.tsv",
)
if (!fs.existsSync(dataFilename)) {
  console.warn(
    `Please download DB from "https://datasets.imdbws.com/title.basics.tsv.gz" and put it in "${dataFilename}"`,
  )
  process.exit(1)
}
const input = fs.createReadStream(dataFilename)

// Init Findex with random key and random label
const { upsert, search } = await Findex()
const masterKey = new FindexKey(randomBytes(16))
const label = new Label(randomBytes(10))

const db = new Database(":memory:")
const callbacks = callbacksExamplesBetterSqlite3(db)

// Number of movies to index in a single `upsert` call
let numberOfMoviesIndexedSoFar = 0
const MAX_UPSERT_LINES = 1000

let latestPercentageShown

let toUpsert = []

let header = true

console.log("Press Ctrl-C to quit the importation and start the search.")

for await (const line of readline.createInterface({ input })) {
  // Skip pass the header
  if (header) {
    header = false
    continue
  }

  const info = line.split("\t")

  const keywords = [info[1], info[2], info[5], ...info[8].split(",")]

  const toInsert = [info[0], ...keywords]
  while (toInsert.length < 7) {
    toInsert.push(null)
  }

  toUpsert.push({
    indexedValue: Location.fromString(info[0]),
    keywords,
  })

  numberOfMoviesIndexedSoFar++

  const percentage = numberOfMoviesIndexedSoFar / NUMBER_OF_MOVIES_INSIDE_TSV
  const percentageToShow = formatPercentage(percentage)
  if (percentageToShow !== latestPercentageShown) {
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0, null)
    process.stdout.write(`Progress: ${percentageToShow}`)
    latestPercentageShown = percentageToShow
  }

  if (toUpsert.length >= MAX_UPSERT_LINES || end) {
    await upsert(
      masterKey,
      label,
      toUpsert,
      [],
      callbacks.fetchEntries,
      callbacks.upsertEntries,
      callbacks.insertChains,
    )

    toUpsert = []

    if (end) break
  }
}

const queries = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

console.log()
console.log()
console.log()
console.log("Press CTRL-C again to quit the search.")
process.stdout.write("Search for: ")

for await (const query of queries) {
  console.log(query)

  const results = await search(
    masterKey,
    label,
    [query],
    callbacks.fetchEntries,
    callbacks.fetchChains,
  )

  console.log(`Searching for ${query} returned ${results.total()} results:`)
  for (const result of results) {
    console.log(`\t- https://www.imdb.com/title/${result}`)
  }
  console.log()
  process.stdout.write("Search for: ")
}

/**
 * @param value raw
 * @returns formatted
 */
function formatPercentage(value) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value)
}
