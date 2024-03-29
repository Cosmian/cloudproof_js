import Database from "better-sqlite3"
import {
  Findex,
  IndexedValue,
  Keyword,
  Data,
  sqliteDbInterfaceExample,
  generateAliases,
} from "cloudproof_js"
import { randomBytes } from "crypto"
import fs from "fs"
import fetch, { Headers, Request, Response } from "node-fetch"
import path from "path"
import readline from "readline"
import { fileURLToPath } from "url"

globalThis.fetch = fetch
globalThis.Headers = Headers
globalThis.Request = Request
globalThis.Response = Response

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
const rl = readline.createInterface({ input })

// Start a new CSV file containing stats for further computing
fs.writeFileSync(
  "stats.csv",
  "numberOfMoviesIndexedSoFar,moviesSizeOnDisk,timeSqliteIndexSoFar,timeFindexSoFar,clearIndexSizeOnDisk,encryptedIndexSizeOnDisk\n",
)
const csvStats = fs.createWriteStream("stats.csv", { flags: "a+" })

// Init Findex with random key and random label
const key = randomBytes(16)
const label = randomBytes(10).toString()
const findexCloudToken = process.env.FINDEX_CLOUD_TOKEN
const baseUrl = "http://127.0.0.1:8080"

if (findexCloudToken) {
  const findexCloud = new Findex(key, label)
  await findexCloud.instantiateRestInterface(findexCloudToken, baseUrl)
}

// Init databases
const dbClear = new Database(":memory:")
if (fs.existsSync("database_clear.sqlite"))
  fs.unlinkSync("database_clear.sqlite")
createMoviesTable(dbClear)

const dbClearWithIndexes = new Database(":memory:")
if (fs.existsSync("database_clear_with_indexes.sqlite"))
  fs.unlinkSync("database_clear_with_indexes.sqlite")
createMoviesTable(dbClearWithIndexes)
createMoviesIndexes(dbClearWithIndexes)

const dbIndex = new Database(":memory:")
if (fs.existsSync("findex_indexes.sqlite"))
  fs.unlinkSync("findex_indexes.sqlite")

const dbInterfaces = await sqliteDbInterfaceExample(dbIndex)
const findexSqlite = new Findex(key, label)
await findexSqlite.instantiateCustomInterface(
  dbInterfaces.entryInterface,
  dbInterfaces.chainInterface,
)

//
// Prepare some useful SQL requests on different databases
// `prepare` a statement is a costly operation we don't want to do on every line (or in every callback)
//

const insertMovie = dbClear.prepare(
  `INSERT INTO movies (id, type, title, start_year, genre1, genre2, genre3) VALUES(?, ?, ?, ?, ?, ?, ?)`,
)
const insertMovieWithIndexes = dbClearWithIndexes.prepare(
  `INSERT INTO movies (id, type, title, start_year, genre1, genre2, genre3) VALUES(?, ?, ?, ?, ?, ?, ?)`,
)

const sizeEntryTableStmt = dbIndex.prepare(
  `SELECT SUM(LENGTH(uid) + LENGTH(value)) as sum FROM entries`,
)
const sizeChainTableStmt = dbIndex.prepare(
  `SELECT SUM(LENGTH(uid) + LENGTH(value)) as sum FROM chains`,
)
const countEntryTableStmt = dbIndex.prepare(
  `SELECT COUNT(*) as count FROM entries`,
)
const countChainTableStmt = dbIndex.prepare(
  `SELECT COUNT(*) as count FROM chains`,
)

// Some statistics on callbacks executions
let fetchEntryTableCallbackCount = 0
let fetchChainTableCallbackCount = 0
let insertChainTableCallbackCount = 0
let upsertEntryTableCallbackCount = 0

// Number of movies to index (stop after this count)
const NUMBER_OF_MOVIES = 1000 * 1000

const USE_GRAPHS = true

// Number of movies to index in a single `upsert` call
const MAX_UPSERT_LINES = 10 * 1000

let numberOfMoviesIndexedSoFar = 1
let numberOfMoviesIndexedSinceLastStatsPrint = 1

let percentageDuringLastStatsPrint = 0
let latestPercentageShown

let timeFindexSoFar = 0
let timeFindexSinceLastStatsPrint = 0
let timeFindexCloudSoFar = 0
let timeFindexCloudSinceLastStatsPrint = 0
let timeSqliteIndexSoFar = 0
let timeSqliteIndexSinceLastStatsPrint = 0

let toUpsert = []

let header = true
let end = false

for await (const line of rl) {
  // Skip pass the header
  if (header) {
    header = false
    continue
  }
  numberOfMoviesIndexedSoFar++
  numberOfMoviesIndexedSinceLastStatsPrint++

  const info = line.split("\t")

  const keywords = [info[1], info[2], info[5], ...info[8].split(",")]

  const toInsert = [info[0], ...keywords]
  while (toInsert.length < 7) {
    toInsert.push(null)
  }

  {
    const insertWithoutIndexStart = performance.now()
    insertMovie.run(...toInsert)
    const insertWithoutIndexTime = performance.now() - insertWithoutIndexStart

    const insertWithIndexStart = performance.now()
    insertMovieWithIndexes.run(...toInsert)
    timeSqliteIndexSinceLastStatsPrint +=
      performance.now() - insertWithIndexStart - insertWithoutIndexTime
  }

  toUpsert.push({
    indexedValue: IndexedValue.fromData(Data.fromString(info[0])),
    keywords: new Set(keywords.map((keyword) => Keyword.fromString(keyword))),
  })

  if (USE_GRAPHS) {
    toUpsert = [...toUpsert, ...generateAliases(info[2])]
  }

  const percentage = numberOfMoviesIndexedSoFar / NUMBER_OF_MOVIES_INSIDE_TSV
  const percentageToShow = formatPercentage(percentage)
  if (
    toUpsert.length >= MAX_UPSERT_LINES ||
    percentageToShow !== latestPercentageShown
  ) {
    const insertFindexStart = performance.now()
    await findexSqlite.add(toUpsert)
    timeFindexSinceLastStatsPrint += performance.now() - insertFindexStart

    if (findexCloudToken) {
      const insertFindexCloudStart = performance.now()
      await findexCloud.add(toUpsert)
      timeFindexCloudSinceLastStatsPrint +=
        performance.now() - insertFindexCloudStart
    }

    toUpsert = []

    if (percentageToShow !== latestPercentageShown) {
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(`Progress: ${percentageToShow}`)
      latestPercentageShown = percentageToShow
    }

    if (numberOfMoviesIndexedSoFar >= NUMBER_OF_MOVIES) {
      end = true
    }

    if (Math.floor(percentage * 100) > percentageDuringLastStatsPrint || end) {
      timeFindexSoFar += timeFindexSinceLastStatsPrint
      timeFindexCloudSoFar += timeFindexCloudSinceLastStatsPrint
      timeSqliteIndexSoFar += timeSqliteIndexSinceLastStatsPrint

      percentageDuringLastStatsPrint = Math.floor(percentage * 100)

      console.log()
      console.log("------------------")
      console.log()

      const { sum: entryTableSize } = sizeEntryTableStmt.get()
      const { sum: chainTableSize } = sizeChainTableStmt.get()
      const { count: entryTableCount } = countEntryTableStmt.get()
      const { count: chainTableCount } = countChainTableStmt.get()

      console.log()

      console.log(`Callbacks Before Search:`)
      console.log(
        `\tfetchEntryTableCallbackCount ${fetchEntryTableCallbackCount}`,
      )
      console.log(
        `\tfetchChainTableCallbackCount ${fetchChainTableCallbackCount}`,
      )
      console.log(
        `\tinsertChainTableCallbackCount ${insertChainTableCallbackCount}`,
      )
      console.log(
        `\tupsertEntryTableCallbackCount ${upsertEntryTableCallbackCount}`,
      )

      console.log()

      let findexResults
      {
        const searchNow = performance.now()

        const results = await search(new Set(["Documentary"]))

        console.log(
          `${formatNumber(
            findexResults.size,
          )} documentaries found with Findex in ${formatNumber(
            performance.now() - searchNow,
          )}ms.`,
        )
      }
      {
        const searchNow = performance.now()

        const results = new Set(
          dbClear
            .prepare(
              `SELECT id FROM movies WHERE genre1 = 'Documentary' OR genre2 = 'Documentary' OR genre3 = 'Documentary' LIMIT 1000`,
            )
            .all()
            .map(({ id }) => id),
        )

        console.log(
          `${formatNumber(
            results.size,
          )} documentaries found with no index in ${formatNumber(
            performance.now() - searchNow,
          )}ms.`,
        )
      }
      if (findexCloudToken) {
        let findexCloudResults
        {
          const searchNow = performance.now()

          const results = await findexCloud.search(new Set(["Documentary"]))

          findexCloudResults = new Set(
            results
              .data()
              .map((indexedData) =>
                new TextDecoder().decode(indexedData.bytes),
              ),
          )

          console.log(
            `${formatNumber(
              findexCloudResults.size,
            )} documentaries found with Findex Cloud in ${formatNumber(
              performance.now() - searchNow,
            )}ms.`,
          )
        }
      }

      await dbClear.backup("database_clear.sqlite")
      const moviesSizeOnDisk = fs.statSync("database_clear.sqlite").size

      {
        const searchNow = performance.now()

        const results = new Set(
          dbClearWithIndexes
            .prepare(
              `SELECT id FROM movies WHERE genre1 = 'Documentary' OR genre2 = 'Documentary' OR genre3 = 'Documentary' LIMIT 1000`,
            )
            .all()
            .map(({ id }) => id),
        )

        console.log(
          `${formatNumber(
            results.size,
          )} documentaries found with cleartext index in ${formatNumber(
            performance.now() - searchNow,
          )}ms.`,
        )
      }

      const testNow = performance.now()

      await dbClearWithIndexes.backup("database_clear_with_indexes.sqlite")
      const clearIndexSizeOnDisk = fs.statSync(
        "database_clear_with_indexes.sqlite",
      ).size

      await dbIndex.backup("findex_indexes.sqlite")
      const encryptedIndexSizeOnDisk = fs.statSync("findex_indexes.sqlite").size

      console.log(`${formatNumber(performance.now() - testNow)}ms.`)

      console.log()

      console.log(`Callbacks After Search:`)
      console.log(
        `\tfetchEntryTableCallbackCount ${fetchEntryTableCallbackCount}`,
      )
      console.log(
        `\tfetchChainTableCallbackCount ${fetchChainTableCallbackCount}`,
      )
      console.log(
        `\tinsertChainTableCallbackCount ${insertChainTableCallbackCount}`,
      )
      console.log(
        `\tupsertEntryTableCallbackCount ${upsertEntryTableCallbackCount}`,
      )

      console.log()

      console.log(
        `${formatNumber(
          numberOfMoviesIndexedSinceLastStatsPrint,
        )} movies indexed:\n\tSQLite index in ${formatNumber(
          timeSqliteIndexSinceLastStatsPrint / 1000,
        )}s\n\tFindex index in ${formatNumber(
          timeFindexSinceLastStatsPrint / 1000,
        )}s\n\tFindex Cloud index in ${formatNumber(
          timeFindexCloudSinceLastStatsPrint / 1000,
        )}s`,
      )
      console.log(
        `${formatNumber(
          numberOfMoviesIndexedSoFar,
        )} movies indexed in total (${formatNumber(
          moviesSizeOnDisk / 1024 / 1024,
        )}MB on disk)\n\tSQLite index in ${formatNumber(
          timeSqliteIndexSoFar / 1000,
        )}s \n\tFindex index in ${formatNumber(
          timeFindexSoFar / 1000,
        )}s\n\tFindex Cloud index in ${formatNumber(
          timeFindexCloudSoFar / 1000,
        )}s`,
      )
      console.log()

      console.log(
        `Table entries (${formatNumber(
          entryTableCount,
        )} lines) is ${formatNumber(entryTableSize / 1024 / 1024)}MB`,
      )
      console.log(
        `Table chains (${formatNumber(
          chainTableCount,
        )} lines) is ${formatNumber(chainTableSize / 1024 / 1024)}MB`,
      )

      console.log()

      console.log(
        `Cleartext indexes on disk are ${formatNumber(
          clearIndexSizeOnDisk / 1024 / 1024,
        )}MB`,
      )
      console.log(
        `Encrypted indexes on disk are ${formatNumber(
          encryptedIndexSizeOnDisk / 1024 / 1024,
        )}MB (x${formatNumber(
          (encryptedIndexSizeOnDisk - clearIndexSizeOnDisk) /
            clearIndexSizeOnDisk,
        )})`,
      )

      if (findexCloudToken) {
        const response = await fetch(
          `${baseUrl}/indexes/${findexCloudToken.slice(0, 5)}`,
        )
        const cloudIndex = await response.json()
        console.log(
          `Encrypted indexes in cloud are ${formatNumber(
            cloudIndex.size / 1024 / 1024,
          )}MB (x${formatNumber(
            (cloudIndex.size - clearIndexSizeOnDisk) / clearIndexSizeOnDisk,
          )})`,
        )
      }

      console.log()
      console.log()

      csvStats.write(
        `${numberOfMoviesIndexedSoFar},${moviesSizeOnDisk},${timeSqliteIndexSoFar},${timeFindexSoFar},${clearIndexSizeOnDisk},${encryptedIndexSizeOnDisk}\n`,
      )

      numberOfMoviesIndexedSinceLastStatsPrint = 1

      if (end) {
        break
      }
    }
  }
}

/**
 * @param db db
 */
function createMoviesTable(db) {
  db.prepare(
    `CREATE TABLE movies (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    start_year INTEGER NOT NULL,
    genre1 TEXT,
    genre2 TEXT,
    genre3 TEXT
  )`,
  ).run()
}

/**
 * @param db db
 */
function createMoviesIndexes(db) {
  db.prepare("CREATE INDEX idx_type ON movies(type)").run()
  db.prepare("CREATE INDEX idx_title ON movies(title)").run()
  db.prepare("CREATE INDEX idx_start_year ON movies(start_year)").run()
  db.prepare("CREATE INDEX idx_genre1 ON movies(genre1)").run()
  db.prepare("CREATE INDEX idx_genre2 ON movies(genre2)").run()
  db.prepare("CREATE INDEX idx_genre3 ON movies(genre3)").run()
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

/**
 * @param value raw
 * @returns formatted
 */
function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)
}
