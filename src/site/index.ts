/**
 * Copyright Cosmian 2022 -
 */

// To run these examples/tests()
// Go to to the project directory and run
//    `npx webpack serve`
// then navigate to http://locahost:8080


import {
  webassembly_get_encrypted_header_size
} from "../../wasm_lib/abe"
import { CoverCryptHybridDecryption } from "../crypto/hybrid_crypto/abe/cover_crypt/decryption"
import { CoverCryptHybridEncryptionDemo } from "../crypto/hybrid_crypto/abe/cover_crypt/demo"
import { CoverCryptDemoKeys } from "../crypto/hybrid_crypto/abe/cover_crypt/demo_keys"
import { CoverCryptHybridEncryption } from "../crypto/hybrid_crypto/abe/cover_crypt/encryption"
import { GpswHybridDecryption } from "../crypto/hybrid_crypto/abe/gpsw/decryption"
import { GpswHybridEncryptionDemo } from "../crypto/hybrid_crypto/abe/gpsw/demo"
import { GpswDemoKeys } from "../crypto/hybrid_crypto/abe/gpsw/demo_keys"
import { GpswHybridEncryption } from "../crypto/hybrid_crypto/abe/gpsw/encryption"
import * as lib from "../lib"
import { EncryptedEntry, WorkerPool } from "./../crypto/hybrid_crypto/abe/worker_pool"
import { logger } from "./../utils/logger"
import { hexDecode } from "./../utils/utils"


/**
 * Hex Encode a string
 * @param s the string to encode
 * @returns the hex encoding of th UTF-8 bytes of the string
 */
function hexEncodeString(s: string): string {
  return lib.hexEncode(new TextEncoder().encode(s))
}

/**
 * Hex decode an hex string
 * @param hex the hex string
 * @returns the string from the utf-8 decoded bytes of the hex string
 */
function hexDecodeString(hex: string): string {
  return new TextDecoder().decode(lib.hexDecode(hex).buffer)
}

// expose the functions to the DOM / HTML
(window as any).hexEncodeString = hexEncodeString;
(window as any).hexDecodeString = hexDecodeString

//
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
  let hybridCrypto;
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
  let hybridCrypto;
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridDecryption(hexDecode(asymmetricDecryptionKeyHex))
  } else {
    hybridCrypto = new GpswHybridDecryption(hexDecode(asymmetricDecryptionKeyHex))
  }

  const databaseEncryptedValue = hexDecode(databaseEncryptedValueHex)
  logger.log(() => "benchAsymmetricDecryption for databaseEncryptedValue: " + databaseEncryptedValue)

  const headerSize = webassembly_get_encrypted_header_size(databaseEncryptedValue)

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
  let hybridCrypto;
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
  let hybridCrypto;
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
  console.error("workers_number not found")

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
    CoverCryptHybridEncryptionDemo.run()
  } else {
    GpswHybridEncryptionDemo.run()
  }
  return "OK"
}
(window as any).abeDemo = abeDemo

function elementSetValue(id: string, value: Uint8Array | string) {
  const box = document.getElementById(id);
  if (box == null) {
    console.error(id + " not found")
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
initPage(true);
(window as any).initPage = initPage
