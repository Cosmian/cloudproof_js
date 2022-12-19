import { Database, Statement } from "better-sqlite3"
import {
  FetchChains,
  FetchEntries,
  InsertChains,
  UidsAndValues,
  UidsAndValuesToUpsert,
  UpsertEntries,
} from "./findex"

/**
 * @param db the SQLite3 connection
 * @returns the callbacks
 */
export function callbacksExamplesBetterSqlite3(db: Database): {
  fetchEntries: FetchEntries
  fetchChains: FetchChains
  upsertEntries: UpsertEntries
  insertChains: InsertChains
} {
  db.prepare(
    "CREATE TABLE entries (uid BLOB PRIMARY KEY, value BLOB NOT NULL)",
  ).run()
  db.prepare(
    "CREATE TABLE chains (uid BLOB PRIMARY KEY, value BLOB NOT NULL)",
  ).run()

  //
  // Prepare some useful SQL requests on different databases
  // `prepare` a statement is a costly operation we don't want to do on every line (or in every callback)
  //
  const upsertIntoChainsTableStmt = db.prepare(
    `INSERT OR REPLACE INTO chains (uid, value) VALUES(?, ?)`,
  )
  const upsertIntoEntriesTableStmt = db.prepare(
    `INSERT INTO entries (uid, value) VALUES (?, ?) ON CONFLICT (uid)  DO UPDATE SET value = ? WHERE value = ?`,
  )
  const selectOneEntriesTableItemStmt = db.prepare(
    `SELECT value FROM entries WHERE uid = ?`,
  )

  // Save some prepare statements inside these objects
  // These queries have `WHERE IN (?, ?, ?)` so we need multiple prepare
  // statements for each different number of parameters (but we can reuse them if
  // two callbacks have the same number of parameters)
  const fetchMultipleEntriesTableStmt: { [id: number]: Statement } = {}
  const fetchMultipleChainsTableStmt: { [id: number]: Statement } = {}

  const prepareFetchMultipleQuery = (
    table: "entries" | "chains",
    numberOfUids: number,
  ): Statement => {
    let cache
    if (table === "entries") {
      cache = fetchMultipleEntriesTableStmt
    } else {
      cache = fetchMultipleChainsTableStmt
    }

    if (typeof cache[numberOfUids] !== "undefined") {
      return cache[numberOfUids]
    }

    const statement = db.prepare(`
      SELECT uid, value
      FROM ${table}
      WHERE uid IN (${Array(numberOfUids).fill("?").join(",")})
    `)

    cache[numberOfUids] = statement
    return statement
  }

  const fetchCallback = async (
    table: "entries" | "chains",
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    return prepareFetchMultipleQuery(table, uids.length).all(
      ...uids,
    ) as UidsAndValues
  }

  const upsertEntries = async (
    uidsAndValues: UidsAndValuesToUpsert,
  ): Promise<UidsAndValues> => {
    const rejected = []
    for (const { uid, oldValue, newValue } of uidsAndValues) {
      const result = upsertIntoEntriesTableStmt.run(
        uid,
        newValue,
        newValue,
        oldValue,
      )

      if (result.changes === 0) {
        const valueInSqlite = selectOneEntriesTableItemStmt.get(uid).value
        rejected.push({ uid, value: valueInSqlite })
      }
    }

    return rejected
  }

  const insertChains = async (uidsAndValues: UidsAndValues): Promise<void> => {
    for (const { uid, value } of uidsAndValues) {
      upsertIntoChainsTableStmt.run(uid, value)
    }
  }

  return {
    fetchEntries: async (uids: Uint8Array[]) =>
      await fetchCallback("entries", uids),
    fetchChains: async (uids: Uint8Array[]) =>
      await fetchCallback("chains", uids),
    upsertEntries,
    insertChains,
  }
}