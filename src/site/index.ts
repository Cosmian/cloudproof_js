/**
 * Copyright Cosmian 2022 -
 */

// To run these examples/tests()
// Go to to the project directory and run
//    `npx webpack serve`
// then navigate to http://locahost:8080


import { CoverCryptHybridDecryption } from "../crypto/abe/hybrid_crypto/cover_crypt/decryption"
import { CoverCryptDemoKeys } from "../crypto/abe/hybrid_crypto/cover_crypt/demo_keys"
import { CoverCryptHybridEncryption } from "../crypto/abe/hybrid_crypto/cover_crypt/encryption"
import { EncryptionDecryptionDemo } from "../crypto/abe/hybrid_crypto/demo_hybrid_crypto"
import { GpswHybridDecryption } from "../crypto/abe/hybrid_crypto/gpsw/decryption"
import { GpswDemoKeys } from "../crypto/abe/hybrid_crypto/gpsw/demo_keys"
import { GpswHybridEncryption } from "../crypto/abe/hybrid_crypto/gpsw/encryption"
import { EncryptedEntry, WorkerPool } from "../crypto/abe/hybrid_crypto/worker_pool"
import { CoverCryptMasterKeyGeneration } from "../crypto/abe/keygen/cover_crypt/cover_crypt_keygen"
import { GpswMasterKeyGeneration } from "../crypto/abe/keygen/gpsw/gpsw_crypt_keygen"
import * as lib from "../lib"
import { logger } from "./../utils/logger"
import { hexDecode } from "./../utils/utils"
import { Findex } from "../interface/findex/findex"
import { DBInterface } from "../interface/db/dbInterface"
import axios, { AxiosResponse, AxiosInstance } from 'axios'
import { bobKey, aliceKey } from "./../utils/demo_keys"
import { ClearTextFileReader } from "../files/upload/ClearTextFileReader"
import { download, FileMetaData } from "../files/download/DownloadManager"
import { EncryptionTransformStream } from "../files/transformers/EncryptionTransformStream"
import { EncryptedFileReader } from "../files/upload/EncryptedFileReader"
import { DecryptionTransformStream } from "../files/transformers/DecryptionTransformStream"


class DB implements DBInterface {
  instance: AxiosInstance = axios.create({
    baseURL: process.env.SERVER,
    timeout: 15000,
  });

  responseBody = (response: AxiosResponse) => response.data;

  requests = {
    get: (url: string) => this.instance.get(url).then(this.responseBody),
  };

<<<<<<< HEAD
  getEntryTableEntries(uids: string[]): Promise<{ UID: string; Value: string }[]> {
=======
  getEntryTableEntries(uids: string[]): Promise<{ uid: string; Value: string }[]> {
>>>>>>> 5f85b23 (re-importing from old repo)
    return this.requests.get(`/index_chain?UID=in.(${uids})`)
  }


<<<<<<< HEAD
  getChainTableEntries(uids: string[]): Promise<{ UID: string; Value: string }[]> {
=======
  getChainTableEntries(uids: string[]): Promise<{ uid: string; Value: string }[]> {
>>>>>>> 5f85b23 (re-importing from old repo)
    return this.requests.get(`/index_entry?UID=in.(${uids})`)
  }

  getEncryptedDirectoryEntries(uids: string[]): Promise<{ uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }[]> {
    return this.requests.get(`/encrypted_directory?UID=in.(${uids})`)
  }

  getFirstEncryptedDirectoryEntries(): Promise<{ uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    }
    return this.instance.get(`/encrypted_directory`, config).then(this.responseBody)
  }

  getFirstUsers(): Promise<object[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    }
    return this.instance.get(`/users`, config).then(this.responseBody)
  }
}

<<<<<<< HEAD
async function loadData() {
  const db = new DB()
  const users = await db.getFirstUsers()
  const encryptedUsers = await db.getFirstEncryptedDirectoryEntries()
  const clearDb = document.getElementById("clear_db")
  const encDb = document.getElementById("enc_db")
=======
async function load_data() {
  const db = new DB()
  const users = await db.getfirstUsers()
  const encryptedUsers = await db.getfirstEncryptedDirectoryEntries()
  const clearDb = document.getElementById("clear_db")
  const encDb = document.getElementById("enc_db")
>>>>>>> 5f85b23 (re-importing from old repo)
  if (clearDb && encDb) {
    if (clearDb.innerHTML || encDb.innerHTML) {
      clearDb.innerHTML = ""
      encDb.innerHTML = ""
    }
    else {
      displayInTab(users, clearDb)
      displayInTab(encryptedUsers, encDb)
    }
  }
};
(window as any).loadData = loadData

/**
 * Display an array of simple JS objects into a an array in HTML
 * @param array array to display
 * @param parent HTML parent element to insert the line in
 * @returns void
 */
function displayInTab(array: object[], parent: HTMLElement) {
  array.forEach((item, index) => {
    if (item) {
      if (index === 0) {
        const columns = document.createElement('div')
        columns.setAttribute('class', "item columns")
        const keys = Object.keys(item)
        for (const key of keys) {
          const column = document.createElement('div')
          column.setAttribute("class", "cell")
          column.innerHTML = key
          columns.appendChild(column)
        }
        parent.appendChild(columns)
      }
      const line = document.createElement('div')
      line.setAttribute("class", "item")
      const values = Object.values(item)
      for (const value of values) {
        const cell = document.createElement('div')
        cell.setAttribute("class", "cell")
        cell.innerHTML = value
        line.appendChild(cell)
      }
      parent.appendChild(line)
    }
  })
}

/**
 * Display No result in div
 * @param parent HTML parent element to insert the line in
 * @returns void
 */
function displayNoResult(parent: HTMLElement) {
  const line = document.createElement('div')
  line.setAttribute("class", "item")
  line.innerHTML = "No results"
  parent.appendChild(line)
}

/**
 * Remove accents and uppercase to query word
 * @param str string to sanitize
 * @returns string initial string without accents and uppercase
 */
function sanitizeString(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\-]+/g, '-')
}

//
/**
 * Search terms with Findex implementation
 * @param words string of all searched terms separated by a space character
 * @param role chosen role to decrypt result
 * @param logicalSwitch boolean to select OR (false) AND (true) operator
 * @returns void
 */
<<<<<<< HEAD
async function search(words: string, role: string, logicalSwitch: boolean) {
  type EncryptedValue = { uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }
  type ClearValue = { User: string, HR_Elements: string, Security_Elements: string }

  const result = document.getElementById("result")
  const content = document.getElementById("content")
  if (result == null || content == null) {
    return
  }
  result.style.visibility = "visible"
  content.innerHTML = ""
  try {
    const db = new DB()
    const queryResults = await Findex.query(k1, k2, words.split(" ").map(word => sanitizeString(word)), db, 100)
    let searchedUids
    if (logicalSwitch && words.length > 1) {
      searchedUids = queryResults.slice(1).reduce((acc, queryResult) => { return acc.filter(value => queryResult.dbUids.includes(value)) }, queryResults[0].dbUids as string[])
    } else {
      searchedUids = queryResults.reduce((acc, queryResult) => { return [...acc, ...queryResult.dbUids] }, [] as string[])
    }
    if (queryResults) {
      const res: EncryptedValue[] = await db.getEncryptedDirectoryEntries(searchedUids)
      let key = ""
      if (res && res.length) {
        switch (role) {
          case "charlie":
            key = charlieKey
            break
          case "alice":
            key = aliceKey
            break
          case "bob":
            key = bobKey
        }
        const hybridDecryption = new GpswHybridDecryption(hexDecode(key))
        const clearValues: ClearValue[] = []
        res.filter((item) => { return item !== null }).forEach((item) => {
          const clearValue: ClearValue = { User: "", HR_Elements: "", Security_Elements: "" }
          const clearKeys = Object.keys(clearValue) as (keyof ClearValue)[]
          const encryptedKeys = Object.keys(item) as (keyof EncryptedValue)[]
          for (let index = 0; index < clearKeys.length; index++) {
            try {
              const itemKey = encryptedKeys[index * 2 + 1]
              const clearKey = clearKeys[index]
              const clearText = hybridDecryption.decrypt(hexDecode(item[itemKey].substring(2)))
              const value = new TextDecoder().decode(clearText).match(/'([^']+)'/g)
              if (value) {
                clearValue[clearKey] = value.map(val => { return val.slice(1, -1) }).join(" | ")
              }
            }
            catch (e) {
              logger.log(() => "Unable to decrypt")
            }
=======
async function search(words: string, role: string) {
  type EncryptedValue = { uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }
  type ClearValue = { User: string, HR_Elements: string, Security_Elements: string }

  const result = document.getElementById("result")
  const content = document.getElementById("content")
  if (result && content) {
    result.style.visibility = "visible"
    content.innerHTML = ""
    try {
      const db = new DB()
      const k1 = "19e1b63d2972a47b84194ed5fa6d8264fc8cbe6dfee5074c8fb1eac3a17b85e8"
      const k2 = "a2cdd03bf58eea8ae842e06ae351700cbac94c8a5dbd8f38984dfa5c104f59d0"
      const queryResults = await Findex.query(k1, k2, words.split(" ").map(word => sanitizeString(word)), db, 100)
      if (queryResults) {
        const res: EncryptedValue[] = await db.getEncryptedDirectoryEntries(queryResults.reduce((acc, queryResult) => { return [...acc, ...queryResult.dbUids] }, [] as string[]))
        if (res && res.length) {
          switch (role) {
            case "mallory":
              displayInTab(res, content)
              break
            case "alice":
            case "bob":
              let key
              if (role === "bob") {
                key = bobKey
              }
              else {
                key = aliceKey
              }
              const hybridDecryption = new GpswHybridDecryption(hexDecode(key))
              const clearValues: ClearValue[] = []
              res.forEach((item) => {
                if (item) {
                  const clearValue: ClearValue = { User: "", HR_Elements: "", Security_Elements: "" }
                  const clearKeys = Object.keys(clearValue) as (keyof ClearValue)[]
                  const encryptedKeys = Object.keys(item) as (keyof EncryptedValue)[]
                  for (let index = 0; index < clearKeys.length; index++) {
                    try {
                      const itemKey = encryptedKeys[index * 2 + 1]
                      const clearKey = clearKeys[index]
                      const clearText = hybridDecryption.decrypt(hexDecode(item[itemKey].substring(2)))
                      const value = new TextDecoder().decode(clearText).match(/'([^']+)'/g)
                      if (value) {
                        clearValue[clearKey] = value.map(val => { return val.slice(1, -1) }).join(" | ")
                      }
                    }
                    catch (e) {
                      logger.log(() => "Impossible to decrypt")
                    }
                  }
                  if (clearValue.User || clearValue.HR_Elements || clearValue.Security_Elements) {
                    clearValues.push(clearValue)
                  }
                }
              }
              )
              if (clearValues.length) {
                displayInTab(clearValues, content)
              } else {
                displayNoResult(content)
              }
              hybridDecryption.destroyInstance()
>>>>>>> 5f85b23 (re-importing from old repo)
          }
          if (clearValue.User || clearValue.HR_Elements || clearValue.Security_Elements) {
            clearValues.push(clearValue)
          }
        }
        )
        if (clearValues.length) {
          displayInTab(clearValues, content)
        } else {
          displayNoResult(content)
        }
        hybridDecryption.destroyInstance()
      } else {
        displayNoResult(content)
      }
<<<<<<< HEAD
=======
    } catch {
      displayNoResult(content)
>>>>>>> 5f85b23 (re-importing from old repo)
    }
  } catch {
    displayNoResult(content)
  }
}
(window as any).search = search

<<<<<<< HEAD
//
=======

// ----------------------------------------------------
// Local files encryption and decryption
// ----------------------------------------------------



async function encrypt_files(files: File[]) {
  Promise.all(files.map(encrypt_file))
}
(window as any).encrypt_files = encrypt_files

async function encrypt_file(file: File): Promise<void> {
  console.log("Encrypting....")
  console.log("....Name", file.name)
  console.log("....Type", file.type)
  console.log("....Size", file.size)


  // stream the clear text content from the file by block
  let clear_text_stream = new ClearTextFileReader(file, 4096)
  // encrypt a stream of blocks
  let encryption_stream = new EncryptionTransformStream("public_key")
  // save the encrypted content to disk
  const encrypted_file_meta_data = {
    uuid: "12345",
    filename: file.name + ".encrypted",
    mimeType: file.type,
  } as FileMetaData
  let encrypted_writable_stream = await download(encrypted_file_meta_data, () => { console.log("download canceled") })
  // connect all the streams and make the magic happen
  await Promise.all([
    clear_text_stream.pipeTo(encryption_stream.writable),
    encryption_stream.readable.pipeTo(encrypted_writable_stream)
  ])
}
(window as any).encrypt_file = encrypt_file


async function decrypt_files(files: File[]) {
  Promise.all(files.map(decrypt_file))
}
(window as any).decrypt_files = decrypt_files

async function decrypt_file(file: File): Promise<void> {
  console.log("Decrypting....")
  console.log("....Name", file.name)
  console.log("....Type", file.type)
  console.log("....Size", file.size)


  // stream the encrypted content from the file by block
  let encrypted_stream = new EncryptedFileReader(file, 1024, 4096)
  // decrypt a stream of blocks
  let decryption_stream = new DecryptionTransformStream("private_key")
  // save the clear text content to disk
  const decrypted_file_meta_data = {
    uuid: "12345",
    filename: file.name + ".decrypted",
    mimeType: file.type,
  } as FileMetaData
  let decrypted_writable_stream = await download(decrypted_file_meta_data, () => { console.log("download canceled") })
  // connect all the streams and make the magic happen
  await Promise.all([
    encrypted_stream.pipeTo(decryption_stream.writable),
    decryption_stream.readable.pipeTo(decrypted_writable_stream)
  ])
}
(window as any).decrypt_file = decrypt_file


>>>>>>> 5f85b23 (re-importing from old repo)
// ----------------------------------------------------
// TEST PURPOSES
// ----------------------------------------------------
// --- DECRYPTION ---
function hybridDecryptionTest(abeUserDecryption: string, databaseEncryptedValue: string) {
  // Check function `hybridDecryption`
  // Hex decode (uid and value)
  const encryptedValue = hexDecode(databaseEncryptedValue)

  const singleDatabaseEntries: Uint8Array[] = [encryptedValue]

  // Init ABE decryption cache
  let hybridCrypto
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridDecryption(hexDecode(abeUserDecryption))
  } else {
    hybridCrypto = new GpswHybridDecryption(hexDecode(abeUserDecryption))
  }

  // Iter as much as needed
  const startDate = new Date().getTime()
  const loops = 100
  for (let i = 0; i < loops; i++) {
    hybridCrypto.decryptBatch(singleDatabaseEntries)
  }
  const endDate = new Date().getTime()
  const milliseconds = (endDate - startDate) / (loops)
  logger.log(() => "webassembly-JS avg time (with cache): " + milliseconds + "ms")

  // Finish with cache destroying
  hybridCrypto.destroyInstance()

  return milliseconds
}
(window as any).hybridDecryptionTest = hybridDecryptionTest

function benchAsymmetricDecryption(asymmetricDecryptionKeyHex: string, databaseEncryptedValueHex: string): number[] {
  // Init ABE decryption cache
  let hybridCrypto
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridDecryption(hexDecode(asymmetricDecryptionKeyHex))
  } else {
    hybridCrypto = new GpswHybridDecryption(hexDecode(asymmetricDecryptionKeyHex))
  }

  const databaseEncryptedValue = hexDecode(databaseEncryptedValueHex)
  logger.log(() => "benchAsymmetricDecryption for databaseEncryptedValue: " + databaseEncryptedValue)

  const headerSize = hybridCrypto.getHeaderSize(databaseEncryptedValue)

  // Asymmetric part decryption
  const abeHeader = databaseEncryptedValue.slice(4, 4 + headerSize)

  // Process hybrid decryption on multiple iterations
  const res = hybridCrypto.benchDecryptHybridHeader(abeHeader)

  // Finish with cache destroying
  hybridCrypto.destroyInstance()

  return res
}
(window as any).benchAsymmetricDecryption = benchAsymmetricDecryption

// --- ENCRYPTION ---
function hybridEncryptionTest(publicKey: string, policy: string, attributes: string[], uid: string, plaintext: string) {
  // Init ABE encryption cache
  let hybridCrypto
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridEncryption(hexDecode(policy), hexDecode(publicKey))
  } else {
    hybridCrypto = new GpswHybridEncryption(hexDecode(policy), hexDecode(publicKey))
  }

  // Hex decoded
  const uidBytes = hexDecode(uid)
  const plaintextBytes = hexDecode(plaintext)

  // Iter as much as needed
  const startDate = new Date().getTime()
  const loops = 100
  for (let i = 0; i < loops; i++) {
    const ct = hybridCrypto.encrypt(attributes, uidBytes, plaintextBytes)
    logger.log(() => "ct:" + lib.hexEncode(ct))
  }
  const endDate = new Date().getTime()
  const milliseconds = (endDate - startDate) / (loops)
  logger.log(() => "webassembly-JS avg time (with cache): " + milliseconds + "ms")

  // Finish with cache destroying
  hybridCrypto.destroyInstance()

  return milliseconds
}
(window as any).hybridEncryptionTest = hybridEncryptionTest


function benchAsymmetricEncryption(publicKey: string, policy: string, attributes: string[], uid: string): number[] {
  // Init ABE decryption cache
  let hybridCrypto
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridEncryption(hexDecode(policy), hexDecode(publicKey))
  } else {
    hybridCrypto = new GpswHybridEncryption(hexDecode(policy), hexDecode(publicKey))
  }

  // Hex decode
  const uidBytes = hexDecode(uid)

  // Process hybrid decryption on multiple iterations
  const results = hybridCrypto.benchEncryptHybridHeader(attributes, uidBytes)

  // Finish with cache destroying
  hybridCrypto.destroyInstance()

  return results
}
(window as any).benchAsymmetricEncryption = benchAsymmetricEncryption


// /////////////////////////:
//
// Decryption Workers Demo
//
// //////////////////////////
const NUM_WORKERS = 4
const NUM_ENTRIES = 200

// instantiate a worker pool
const workerPool = new WorkerPool(NUM_WORKERS)
// display the number of workers
const wnElt = document.getElementById("workers_number")
if (wnElt == null) {
  // console.error("workers_number not found")

} else {
  wnElt.innerHTML = NUM_WORKERS + ""
}


// The function called whn clicking the decrypt button
const decryptUsingWorker = (): void => {
  // create set of test entries
  const encryptedEntries: EncryptedEntry[] = []
  let demoUid = new Uint8Array()
  let demoEncryptedData = new Uint8Array()
  let demoTopSecretMkgFinUser = new Uint8Array()
  let isGpsw = false
  if (isGpswImplementation()) {
    demoUid = GpswDemoKeys.uid
    demoEncryptedData = GpswDemoKeys.encryptedData
    demoTopSecretMkgFinUser = GpswDemoKeys.topSecretMkgFinUser
    isGpsw = true
  } else {
    demoUid = CoverCryptDemoKeys.uid
    demoEncryptedData = CoverCryptDemoKeys.encryptedData
    demoTopSecretMkgFinUser = CoverCryptDemoKeys.topSecretMkgFinUser
    isGpsw = false
  }

  logger.log(() => "isGpsw: " + isGpsw)

  for (let index = 0; index < NUM_ENTRIES; index++) {
    encryptedEntries.push({
      uidHex: lib.hexEncode(demoUid),
      ciphertextHex: lib.hexEncode(demoEncryptedData)
    })
  }

  const wrnElt = document.getElementById("workers_results_number")
  const wrElt = document.getElementById("workers_result")
  if (wrnElt == null || wrElt == null) {
    console.error("workers elements not found")
  } else {
    wrElt.innerHTML = ""
    wrnElt.innerHTML = "...running..."
    const startDate = new Date().getTime()
    workerPool.decrypt(
      lib.hexEncode(demoTopSecretMkgFinUser),
      encryptedEntries,
      isGpsw
    ).then(
      (results: Uint8Array[]) => displayResults(startDate, results, encryptedEntries.length),
      (err: any) => displayError(err)
    ).finally(() => {
      logger.log(() => "all decryption workers terminated")
    })
  }
}
(window as any).decryptUsingWorker = decryptUsingWorker

// Display the decryption results
const displayResults = (startDate: number, results: Uint8Array[], encryptedEntriesLength: number) => {
  // got results  - stope time measurement
  const endDate = new Date().getTime()
  const milliseconds = (endDate - startDate) / (encryptedEntriesLength)

  // display some stats
  const wrnElt = document.getElementById("workers_results_number")
  if (wrnElt == null) {
    console.error("workers_results_number not found")
    return
  }
  wrnElt.innerHTML = results.length + " in " + (endDate - startDate) + "ms i.e. " + milliseconds + "ms/record average"

  // the results themselves
  const wrElt = document.getElementById("workers_result")
  if (wrElt == null) {
    console.error("workers_result not found")
    return
  }
  const text = results.map((v) => {
    return new TextDecoder().decode(v)
  })
  wrElt.innerHTML = text.join("<br>")
}

// display the decryption errors
const displayError = (err: string) => {
  const wnElement = document.getElementById("workers_number")
  if (wnElement == null) {
    console.error("workers_number not found")
    return
  }
  wnElement.innerHTML = "ERROR: " + err
}

// run demo scenario for ABE implementation
function abeDemo(): string {
  if (!isGpswImplementation()) {
    const keyGeneration = new CoverCryptMasterKeyGeneration()
    const demoKeys = new CoverCryptDemoKeys()
    const hybridEncryption = new CoverCryptHybridEncryption(demoKeys.policy, demoKeys.publicKey)
    const hybridDecryption = new CoverCryptHybridDecryption(demoKeys.topSecretMkgFinUser)
    const encryptionDemo = new EncryptionDecryptionDemo(
      keyGeneration, demoKeys, hybridEncryption, hybridDecryption
    )
    encryptionDemo.run()
    // CoverCryptHybridEncryptionDemo.run()
  } else {
    const keyGeneration = new GpswMasterKeyGeneration()
    const demoKeys = new GpswDemoKeys()
    const hybridEncryption = new GpswHybridEncryption(demoKeys.policy, demoKeys.publicKey)
    const hybridDecryption = new GpswHybridDecryption(demoKeys.topSecretMkgFinUser)
    const encryptionDemo = new EncryptionDecryptionDemo(
      keyGeneration, demoKeys, hybridEncryption, hybridDecryption
    )
    encryptionDemo.run()
    // GpswHybridEncryptionDemo.run()
  }
  return "OK"
}
(window as any).abeDemo = abeDemo

function elementSetValue(id: string, value: Uint8Array | string) {
  const box = document.getElementById(id)
  if (box == null) {
    // console.error(id + " not found")
    return
  }
  if (value.constructor === Uint8Array) {
    box.setAttribute("value", lib.hexEncode(value))
  } else if (value.constructor === String) {
    box.setAttribute("value", value)
  } else {
    console.error("Type not supported: " + value)
  }
}

function isGpswImplementation(): boolean {
  const abeImplementation = document.querySelector('input[name="abe_group"]:checked')
  if (abeImplementation == null) {
    console.error("Unexpected error for ABE implementation choice")
    return false
  }
  const abeValue = abeImplementation.getAttribute("value")
  return abeValue === 'gpsw'
}

export function initPage(isGpsw: boolean) {
  if (isGpsw) {
    elementSetValue("abe_user_key_access_policy_1", GpswDemoKeys.topSecretMkgFinUserAccessPolicy)
    elementSetValue("abe_user_key_1", GpswDemoKeys.topSecretMkgFinUser)
    elementSetValue("abe_public_key", GpswDemoKeys.publicKey)
    elementSetValue("abe_policy", GpswDemoKeys.policy)
    elementSetValue("database_uid_1", GpswDemoKeys.uid)
    elementSetValue("database_value_1", GpswDemoKeys.encryptedData)
    elementSetValue("plaintext_1", GpswDemoKeys.plaintext)
  } else {
    elementSetValue("abe_user_key_access_policy_1", CoverCryptDemoKeys.topSecretMkgFinUserAccessPolicy)
    elementSetValue("abe_user_key_1", CoverCryptDemoKeys.topSecretMkgFinUser)
    elementSetValue("abe_public_key", CoverCryptDemoKeys.publicKey)
    elementSetValue("abe_policy", CoverCryptDemoKeys.policy)
    elementSetValue("database_uid_1", CoverCryptDemoKeys.uid)
    elementSetValue("database_value_1", CoverCryptDemoKeys.encryptedData)
    elementSetValue("plaintext_1", CoverCryptDemoKeys.plaintext)
  }
}
initPage(false);
(window as any).initPage = initPage
