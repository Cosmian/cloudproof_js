import fs from "fs"
import readline from "readline"
import { Location, Findex, FindexKey, Label, Keyword, callbacksExamplesBetterSqlite3 } from "cloudproof_js"
import path from "path"
import { fileURLToPath } from "url"
import { randomBytes } from "crypto"
import Database from "better-sqlite3"
import { removeStopwords, eng } from "stopword"
import natural from "natural"
import synonyms from "synonyms"

const files = fs.readdirSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "data"),
)
const contents = {}
for (const file of files) {
  const name = path.parse(file).name
  const content = new TextDecoder().decode(
    fs.readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "data", file),
    ),
  )
  contents[name] = content
}

// Init Findex with random key and random label
const key = new FindexKey(randomBytes(16))
const label = new Label(randomBytes(10))
const db = new Database(":memory:")
const callbacks = await callbacksExamplesBetterSqlite3(db)
const findex = new Findex(key, label)
await findex.instantiateCustomBackend(
  callbacks.entryCallbacks,
  callbacks.chainCallbacks,
)

const uniqueWords = new Set()

// Index raw words in documents (except stopwords)
for (const [name, content] of Object.entries(contents)) {
  console.log("---")
  console.log(`Indexing ${name}…`)
  console.log("---")
  const nameBytes = new TextEncoder().encode(name)
  const lowerCasedContent = content.toLowerCase()

  const words = removeStopwords(
    lowerCasedContent.split(/[,.[\]|{}=/"?!;<>*:\s]/),
    eng,
  )

  const toUpsert = []

  for (const word of words) {
    if (!word) continue

    uniqueWords.add(word)

    let start = 0
    const positions = []

    while (true) {
      const index = lowerCasedContent.indexOf(word, start)
      if (index < 0) break

      positions.push(index)
      start = index + word.length
      const locationBytes = Uint8Array.from([
        ...encode(nameBytes.length),
        ...nameBytes,
        ...encode(index),
        ...encode(index + word.length),
      ])

      toUpsert.push({
        indexedValue: new Location(locationBytes),
        keywords: [word],
      })
    }
  }

  await findex.add(toUpsert)
}

console.log("---")
console.log(`Add aliases from word's stem to word…`)
console.log("---")
await findex.add(
  Array.from(uniqueWords)
    .map((word) => ({ word, stem: natural.PorterStemmer.stem(word) }))
    .filter(({ word, stem }) => word !== stem)
    .map(({ word, stem }) => ({
      indexedValue: Keyword.fromString(word),
      keywords: [stem],
    })),
)

console.log("---")
console.log(`Add aliases from word's phonetic to word…`)
console.log("---")
// Since phonetic is not a correct word (for example the phonetic for "Phrase" is "FRS")
// we don't want a search for "FRS" to return "Phrase". To prevent that, we'll add a prefix to "FRS"
// which will make searching for it highly unlikely. We'll use this prefix in our search below.
await findex.add(
  Array.from(uniqueWords).map((word) => ({
    indexedValue: Keyword.fromString(word),
    keywords: ["phonetic_prefix_" + natural.Metaphone.process(word)],
  })),
)

console.log("---")
console.log(`Add aliases from word's synonyms to word…`)
console.log("---")
await findex.add(
  Array.from(uniqueWords)
    .map((word) => {
      const wordSynonyms = synonyms(word)
      if (!wordSynonyms) return null

      return {
        indexedValue: Keyword.fromString(word),
        keywords: [...(wordSynonyms.n || []), ...(wordSynonyms.v || [])].filter(
          (synonym) => synonym !== word,
        ),
      }
    })
    .filter((synonymsToUpsert) => synonymsToUpsert !== null),
)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

while (true) {
  const originalQuery = await new Promise((resolve) => {
    rl.question("\n---------------------\nSearch: ", resolve)
  })
  const query = originalQuery.toLowerCase()

  const stem = natural.PorterStemmer.stem(query)
  const phonetic = natural.Metaphone.process(query)

  const rawResults = await findex.search([
    query,
    stem,
    "phonetic_prefix_" + phonetic,
  ])

  console.log(
    `Searching for ${query} (${stem}, ${phonetic}), ${rawResults.total()} results.`,
  )

  // Parse locations and compute distances
  const results = rawResults.locations().map((result) => {
    const { result: filenameLength, tail } = decode(result.bytes)
    const filename = new TextDecoder().decode(tail.slice(0, filenameLength))

    const { result: startIndex, tail: tail2 } = decode(
      tail.slice(filenameLength),
    )
    const { result: endIndex } = decode(tail2)

    const beforeArray = contents[filename]
      .slice(startIndex - 50, startIndex)
      .split("\n")
    const before = beforeArray[beforeArray.length - 1]
    const word = contents[filename].slice(startIndex, endIndex)
    const afterArray = contents[filename]
      .slice(endIndex, endIndex + 50)
      .split("\n")
    const after = afterArray[afterArray.length - 1]

    const distance = natural.JaroWinklerDistance(query, word, undefined, true)

    return { filename, startIndex, endIndex, before, word, after, distance }
  })

  results.sort(({ distance: a }, { distance: b }) => b - a)

  for (const { filename, before, word, after } of results) {
    console.log()

    console.log(`\x1b[33mIn ${filename}.txt:\x1b[0m`)

    let explain = ""
    if (word.toLowerCase() !== query) {
      const wordStem = natural.PorterStemmer.stem(word.toLowerCase())
      if (wordStem === stem) {
        explain = ` (stem ${wordStem})`
      }

      const wordPhonetic = natural.Metaphone.process(word.toLowerCase())
      if (wordPhonetic === phonetic) {
        explain = ` (phonetic ${wordPhonetic})`
      }

      const wordSynonyms = synonyms(word) || {}
      const synonymsList = [
        ...(wordSynonyms.n || []),
        ...(wordSynonyms.v || []),
      ]
      if (synonymsList.includes(query)) {
        explain = ` (synonym of ${query})`
      }
    }

    console.log(`${before}\x1b[32m${word}\x1b[2m${explain}\x1b[0m${after}`)

    console.log()
  }
}

/**
 * decodes a LEB128 encoded unsigned integer
 *
 * @param buffer the buffer of bytes to read
 * @returns the decoded number
 */
function decode(buffer) {
  let result = 0
  let shift = 0
  let bytesRead = 0
  for (const byte of buffer) {
    bytesRead++
    result |= (byte & 0x7f) << shift
    if ((0x80 & byte) === 0) break
    shift += 7
  }

  return {
    result,
    tail: Uint8Array.from(buffer.slice(bytesRead)),
  }
}

/**
 * encodes an unsigned integer to LEB128
 *
 * @param value the unsigned integer
 * @returns the LEB128 bytes
 */
function encode(value) {
  const result = []

  while (true) {
    let byte_ = value & 0x7f
    value >>= 7
    if (value !== 0) {
      byte_ = byte_ | 0x80
    }

    result.push(byte_)

    if (value === 0) {
      break
    }
  }

  return Uint8Array.from(result)
}
