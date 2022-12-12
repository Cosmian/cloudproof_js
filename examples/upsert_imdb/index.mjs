import fs from "fs"
import readline from "readline"
import { IndexedValue, Location, Keyword, Findex, FindexKey, Label } from "cloudproof_js"
import path from 'path';
import {fileURLToPath} from 'url';
import { randomBytes } from "crypto"
import Database from 'better-sqlite3';


fs.writeFileSync('stats.csv', "globalLineIndex,moviesSizeOnDisk,timeSqliteIndexGlobal,timeFindexGlobal,clearIndexSizeOnDisk,encryptedIndexSizeOnDisk\n");
const csvStats = fs.createWriteStream("stats.csv", {flags:'a+'});

const NUMBER_OF_MOVIES = 100 * 1000 * 1000;

  const dataFilename = path.join(path.dirname(fileURLToPath(import.meta.url)), "imdb.tsv");

  if (!fs.existsSync(dataFilename)) {
    console.warn(`Please download DB from "https://datasets.imdbws.com/title.akas.tsv.gz" and put it in "${dataFilename}"`)
    process.exit(1)
  }
  
  const input = fs.createReadStream(dataFilename)
  const rl = readline.createInterface({ input })
  
  const { upsert, search } = await Findex();
  const masterKey = new FindexKey(randomBytes(32))
  const label = new Label(randomBytes(10))
  

  const dbClear = new Database(':memory:');
  const dbClearWithIndexes = new Database(':memory:');
  const dbIndex = new Database(':memory:');

  dbClear.prepare(`CREATE TABLE movies (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    start_year INTEGER NOT NULL,
    genre1 TEXT,
    genre2 TEXT,
    genre3 TEXT
  )`).run();
  dbClearWithIndexes.prepare(`CREATE TABLE movies (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    start_year INTEGER NOT NULL,
    genre1 TEXT,
    genre2 TEXT,
    genre3 TEXT
  )`).run();

  dbClearWithIndexes.prepare('CREATE INDEX idx_type ON movies(type)').run();
  dbClearWithIndexes.prepare('CREATE INDEX idx_title ON movies(title)').run();
  dbClearWithIndexes.prepare('CREATE INDEX idx_start_year ON movies(start_year)').run();
  dbClearWithIndexes.prepare('CREATE INDEX idx_genre1 ON movies(genre1)').run();
  dbClearWithIndexes.prepare('CREATE INDEX idx_genre2 ON movies(genre2)').run();
  dbClearWithIndexes.prepare('CREATE INDEX idx_genre3 ON movies(genre3)').run();

  const insertMovie = dbClear.prepare(`INSERT INTO movies (id, type, title, start_year, genre1, genre2, genre3) VALUES(?, ?, ?, ?, ?, ?, ?)`);
  const insertMovieWithIndex = dbClearWithIndexes.prepare(`INSERT INTO movies (id, type, title, start_year, genre1, genre2, genre3) VALUES(?, ?, ?, ?, ?, ?, ?)`);
  
  dbIndex.prepare("CREATE TABLE entry_table (uid BLOB PRIMARY KEY, value BLOB NOT NULL)").run();
  dbIndex.prepare("CREATE TABLE chain_table (uid BLOB PRIMARY KEY, value BLOB NOT NULL)").run();

  const sizeEntryTableStmt = dbIndex.prepare(`SELECT SUM(LENGTH(uid)) + SUM(LENGTH(value)) as sum FROM entry_table`);
  const sizeChainTableStmt = dbIndex.prepare(`SELECT SUM(LENGTH(uid)) + SUM(LENGTH(value)) as sum FROM chain_table`);
  const countEntryTable = dbIndex.prepare(`SELECT COUNT(*) as count FROM entry_table`);
  const countChainTable = dbIndex.prepare(`SELECT COUNT(*) as count FROM chain_table`);

  const upsertIntoChainTableStmt = dbIndex.prepare(`INSERT OR REPLACE INTO chain_table (uid, value) VALUES(?, ?)`)
  const upsertIntoEntryTableStmt = dbIndex.prepare(`INSERT INTO entry_table (uid, value) VALUES (?, ?)  ON CONFLICT (uid)  DO UPDATE SET value = ? WHERE value = ?`)
  const selectOneEntryTableItemStmt = dbIndex.prepare(`SELECT value FROM entry_table WHERE uid = ?`)

  const fetchMultipleEntryTableStmt = {};
  const fetchMultipleChainTableStmt = {};

  let fetchEntryTableCallbackCount = 0;
  let fetchChainTableCallbackCount = 0;
  let insertChainTableCallbackCount = 0;
  let upsertEntryTableCallbackCount = 0;

  const fetchCallback = async (
      table,
      uids,
    ) => {
      let fetchMultipleStmt;
      if (table === 'entry_table') {
        fetchEntryTableCallbackCount++
        fetchMultipleStmt = fetchMultipleEntryTableStmt[uids.length] || (fetchMultipleEntryTableStmt[uids.length] = dbIndex.prepare(`
          SELECT uid, value
          FROM entry_table
          WHERE uid IN (${uids.map(() => "?").join(",")})
        `))
      } else {
        fetchChainTableCallbackCount++
        fetchMultipleStmt = fetchMultipleChainTableStmt[uids.length] || (fetchMultipleChainTableStmt[uids.length] = dbIndex.prepare(`
          SELECT uid, value
          FROM chain_table
          WHERE uid IN (${uids.map(() => "?").join(",")})
        `))
      }
      
      return fetchMultipleStmt.all(...uids);
    }
    const insertCallback = async (
      uidsAndValues,
    ) => {
      insertChainTableCallbackCount++
      for (const { uid, value } of uidsAndValues) {
        upsertIntoChainTableStmt.run(uid, value);
      }
    }
    const upsertCallback = async (
      uidsAndValues,
    ) => {
      upsertEntryTableCallbackCount++

      const rejected = []
      for (const { uid, oldValue, newValue } of uidsAndValues) {
        const changed = upsertIntoEntryTableStmt.run(uid, newValue, newValue, oldValue);
        if (!changed) {
          const valueInSqlite = selectOneEntryTableItemStmt.get(uid)
          rejected.push({ uid, value: valueInSqlite })
        }
      }
  
      return rejected
    }


  const percentageFormat = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format
  const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format

  let header = true;
  let toUpsert = [];
  // const indexedValuesByKeyword = {}
  const MAX_UPSERT_LINES = 10000;
  const APPROX_NUMBER_OF_LINES = 9427158;

  let globalLineIndex = 1
  let localLineIndex = 1

  let latestFullStatsPercentageShown = 0;
  let latestPercentageShown;

  let end = false;

  let timeFindexGlobal = 0;
  let timeFindexLocal = 0;
  let timeSqliteIndexGlobal = 0;
  let timeSqliteIndexLocal = 0;
  
  for await (const line of rl) {
    // Skip pass the header
    if (header) {
      header = false
      continue
    }
    globalLineIndex++;
    localLineIndex++;
  
    const info = line.split('\t')

    const keywords = [
      info[1],
      info[2],
      info[5],
      ...info[8].split(','),
    ]

    const toInsert = [info[0], ...keywords];
    while (toInsert.length < 7) {
      toInsert.push(null);
    }

    {
      const insertWithoutIndexStart = performance.now();
      insertMovie.run(...toInsert)
      const insertWithoutIndexTime = performance.now() - insertWithoutIndexStart;

      const insertWithIndexStart = performance.now();
      insertMovieWithIndex.run(...toInsert)
      timeSqliteIndexLocal += performance.now() - insertWithIndexStart - insertWithoutIndexTime
    }

    toUpsert.push({
      indexedValue: IndexedValue.fromLocation(Location.fromUtf8String(info[0])),
      keywords: new Set(keywords.map((keyword) => Keyword.fromUtf8String(keyword))),
    })
  
    if (toUpsert.length >= MAX_UPSERT_LINES) {
      const insertFindexStart = performance.now();
      await upsert(
        toUpsert,
        masterKey,
        label,
        async (uids) => await fetchCallback("entry_table", uids),
        async (uidsAndValues) => await upsertCallback(uidsAndValues),
        async (uidsAndValues) => await insertCallback(uidsAndValues),
      )
      timeFindexLocal += performance.now() - insertFindexStart
  
      toUpsert = []

      const percentage = globalLineIndex / APPROX_NUMBER_OF_LINES;

      const percentageToShow = percentageFormat(percentage);
      if (percentageToShow !== latestPercentageShown) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`Progress: ${percentageToShow}`);
        latestPercentageShown = percentageToShow
      }

      if (globalLineIndex >= NUMBER_OF_MOVIES) {
        end = true;
      }

      if (Math.floor(percentage * 100) > latestFullStatsPercentageShown || end) {
        timeFindexGlobal += timeFindexLocal
        timeSqliteIndexGlobal += timeSqliteIndexLocal

        latestFullStatsPercentageShown = Math.floor(percentage * 100)

        console.log()
        console.log('------------------')
        console.log()

        const { sum: entryTableSize } = sizeEntryTableStmt.get()
        const { sum: chainTableSize } = sizeChainTableStmt.get()
        const { count: entryTableCount } = countEntryTable.get()
        const { count: chainTableCount } = countChainTable.get()

        console.log()
        
        console.log(`Callbacks Before Search:`);
        console.log(`\tfetchEntryTableCallbackCount ${fetchEntryTableCallbackCount}`);
        console.log(`\tfetchChainTableCallbackCount ${fetchChainTableCallbackCount}`);
        console.log(`\tinsertChainTableCallbackCount ${insertChainTableCallbackCount}`);
        console.log(`\tupsertEntryTableCallbackCount ${upsertEntryTableCallbackCount}`);

        console.log()

        let findexResults;
        {
          const searchNow = performance.now()

          const results = await search(
            new Set(["Documentary"]),
            masterKey,
            label,
            async (uids) => await fetchCallback("entry_table", uids),
            async (uids) => await fetchCallback("chain_table", uids),
            {
              maxResultsPerKeyword: 1000,
            },
          )

          findexResults = new Set(results.map((indexedLocation) => new TextDecoder().decode(indexedLocation.bytes.slice(1))))
  
          console.log(`${numberFormat(findexResults.size)} documentaries found with Findex in ${numberFormat((performance.now() - searchNow))}ms.`);
        }
        {
          const searchNow = performance.now()

          const results = new Set(dbClear.prepare(`SELECT id FROM movies WHERE genre1 = 'Documentary' OR genre2 = 'Documentary' OR genre3 = 'Documentary' LIMIT 1000`).all().map(({ id }) => id));

          console.log(`${numberFormat(results.size)} documentaries found with no index in ${numberFormat((performance.now() - searchNow))}ms.`);

          // console.log(difference(results, findexResults));
        }

        await dbClear.backup('database_clear.sqlite')
        const moviesSizeOnDisk = fs.statSync("database_clear.sqlite").size



        {
          const searchNow = performance.now()

          const results = new Set(dbClearWithIndexes.prepare(`SELECT id FROM movies WHERE genre1 = 'Documentary' OR genre2 = 'Documentary' OR genre3 = 'Documentary' LIMIT 1000`).all().map(({ id }) => id));
  
          console.log(`${numberFormat(results.size)} documentaries found with cleartext index in ${numberFormat((performance.now() - searchNow))}ms.`);
        }

        await dbClearWithIndexes.backup('database_clear_with_indexes.sqlite')
        const clearIndexSizeOnDisk = fs.statSync("database_clear_with_indexes.sqlite").size

        await dbIndex.backup('database_index.sqlite')
        const encryptedIndexSizeOnDisk = fs.statSync("database_index.sqlite").size

        console.log()
        
        console.log(`Callbacks After Search:`);
        console.log(`\tfetchEntryTableCallbackCount ${fetchEntryTableCallbackCount}`);
        console.log(`\tfetchChainTableCallbackCount ${fetchChainTableCallbackCount}`);
        console.log(`\tinsertChainTableCallbackCount ${insertChainTableCallbackCount}`);
        console.log(`\tupsertEntryTableCallbackCount ${upsertEntryTableCallbackCount}`);

      
        console.log()

        console.log(`${numberFormat(localLineIndex)} movies indexed:\n\tSQLite index in ${numberFormat(timeSqliteIndexLocal / 1000)}s\n\tFindex index in ${numberFormat(timeFindexLocal / 1000)}s`)
        console.log(`${numberFormat(globalLineIndex)} movies indexed in total (${numberFormat(moviesSizeOnDisk / 1024 / 1024)}MB on disk)\n\tSQLite index in ${numberFormat(timeSqliteIndexGlobal / 1000)}s \n\tFindex index in ${numberFormat(timeFindexGlobal / 1000)}s`)
        console.log()

        {
          const theory = entryTableCount * 140

          const diff = (entryTableSize - theory) / theory
          console.log(`Table entry_table (${numberFormat(entryTableCount)} lines) is ${numberFormat(entryTableSize / 1024 / 1024)}MB (${numberFormat(theory / 1024 / 1024)}MB in theory, diff is ${percentageFormat(diff)})`)
        }

        {
          const theory = chainTableCount * (32 + 28 + 5 * 34)

          const diff = (chainTableSize - theory) / theory
          console.log(`Table chain_table (${numberFormat(chainTableCount)} lines) is ${numberFormat(chainTableSize / 1024 / 1024)}MB (${numberFormat(theory / 1024 / 1024)}MB in theory, diff is ${percentageFormat(diff)})`)
        }

        console.log()
        
        console.log(`Cleartext indexes on disk are ${numberFormat(clearIndexSizeOnDisk / 1024 / 1024)}MB`)
        console.log(`Encrypted indexes on disk are ${numberFormat(encryptedIndexSizeOnDisk / 1024 / 1024)}MB`)
        
        console.log()
        console.log()

        csvStats.write(`${globalLineIndex},${moviesSizeOnDisk},${timeSqliteIndexGlobal},${timeFindexGlobal},${clearIndexSizeOnDisk},${encryptedIndexSizeOnDisk}\n`)

        localLineIndex = 1

        if (end) {
          break;
        }
      }
    }
  }






function difference(setA, setB) {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}