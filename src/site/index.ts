/**
 * Copyright Cosmian 2022 -
 */

// To run these examples/tests()
// Go to to the project directory and run
//    `npx webpack serve`
// then navigate to http://locahost:8080


import * as lib from "../lib"
import {
  webassembly_get_encrypted_header_size,
} from "../../wasm_lib/abe"
import { DecryptionWorkerMessage, AbeHybridDecryption } from "../crypto/hybrid_crypto/abe/cover_crypt/decryption"
import { EncryptionWorkerMessage, AbeEncryptionParameters, AbeHybridEncryption } from "../crypto/hybrid_crypto/abe/cover_crypt/encryption"
import { logger } from "./../utils/logger"
import { EncryptedEntry, WorkerPool } from "./../crypto/hybrid_crypto/abe/worker_pool"
import { hexDecode } from "./../utils/utils"
import { AbeHybridEncryptionDemo } from "../crypto/hybrid_crypto/abe/cover_crypt/demo"
import { DemoKeys } from "../crypto/hybrid_crypto/abe/cover_crypt/demo_keys"


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
  const abe = new AbeHybridDecryption(hexDecode(abeUserDecryption))

  // Iter as much as needed
  const startDate = new Date().getTime()
  const loops = 1000
  for (let i = 0; i < loops; i++) {
    abe.decryptBatch(singleDatabaseEntries)
  }
  const endDate = new Date().getTime()
  const milliseconds = (endDate - startDate) / (loops)
  logger.log(() => "webassembly-JS avg time (with cache): " + milliseconds + "ms")

  // Finish with cache destroying
  abe.destroyInstance()

  return milliseconds
}
(window as any).hybridDecryptionTest = hybridDecryptionTest

function benchAsymmetricDecryption(asymmetricDecryptionKeyHex: string, databaseEncryptedValueHex: string): number {
  // Init ABE decryption cache
  const hybridCrypto = new AbeHybridDecryption(hexDecode(asymmetricDecryptionKeyHex))

  const databaseEncryptedValue = hexDecode(databaseEncryptedValueHex)
  logger.log(() => "benchAsymmetricDecryption for databaseEncryptedValue: " + databaseEncryptedValue)

  const headerSize = webassembly_get_encrypted_header_size(databaseEncryptedValue)

  // Asymmetric part decryption
  const abeHeader = databaseEncryptedValue.slice(4, 4 + headerSize)

  // Process hybrid decryption on multiple iterations
  const milliseconds = hybridCrypto.benchDecryptHybridHeader(abeHeader)

  // Finish with cache destroying
  hybridCrypto.destroyInstance()

  return milliseconds
}
(window as any).benchAsymmetricDecryption = benchAsymmetricDecryption

// --- ENCRYPTION ---
function hybridEncryptionTest(publicKey: string, policy: string, attributes: string[], uid: string, plaintext: string) {
  // Init ABE encryption cache
  const abe = new AbeHybridEncryption(hexDecode(policy), hexDecode(publicKey))

  // Hex decoded
  const uidBytes = hexDecode(uid)
  const plaintextBytes = hexDecode(plaintext)

  // Iter as much as needed
  const startDate = new Date().getTime()
  const loops = 1000
  for (let i = 0; i < loops; i++) {
    const ct = abe.encrypt(attributes, uidBytes, plaintextBytes)
  }
  const endDate = new Date().getTime()
  const milliseconds = (endDate - startDate) / (loops)
  logger.log(() => "webassembly-JS avg time (with cache): " + milliseconds + "ms")

  // Finish with cache destroying
  abe.destroyInstance()

  return milliseconds
}
(window as any).hybridEncryptionTest = hybridEncryptionTest


function benchAsymmetricEncryption(publicKey: string, policy: string, attributes: string[], uid: string): number {
  // Init ABE decryption cache
  const hybridCrypto = new AbeHybridEncryption(hexDecode(policy), hexDecode(publicKey))

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

// create set of test entries
const encryptedEntries: EncryptedEntry[] = []
for (let index = 0; index < NUM_ENTRIES; index++) {
  encryptedEntries.push({
    uidHex: lib.hexEncode(DemoKeys.uid),
    ciphertextHex: lib.hexEncode(DemoKeys.encryptedData)
  })
}


// The function called whn clicking the decrypt button
const decryptUsingWorker = (): void => {
  const wrnElt = document.getElementById("workers_results_number")
  const wrElt = document.getElementById("workers_result")
  if (wrnElt == null || wrElt == null) {
    console.error("workers elements not found")
  } else {
    wrElt.innerHTML = ""
    wrnElt.innerHTML = "...running..."
    const startDate = new Date().getTime()
    workerPool.decrypt(lib.hexEncode(DemoKeys.topSecretMkgFinUser),
      encryptedEntries
    ).then(
      (results: Uint8Array[]) => displayResults(startDate, results),
      (err: any) => displayError(err)
    ).finally(() => {
      logger.log(() => "all decryption workers terminated")
    })
  }
}
(window as any).decryptUsingWorker = decryptUsingWorker

// Display the decryption results
const displayResults = (startDate: number, results: Uint8Array[]) => {
  // got results  - stope time measurement
  const endDate = new Date().getTime()
  const milliseconds = (endDate - startDate) / (encryptedEntries.length)

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


function abeDemo(): string {
  AbeHybridEncryptionDemo.run()
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

export function initPage() {
  elementSetValue("abe_user_key_access_policy_1", DemoKeys.topSecretMkgFinUserAccessPolicy)
  elementSetValue("abe_user_key_1", DemoKeys.topSecretMkgFinUser)
  elementSetValue("abe_public_key", DemoKeys.publicKey)
  elementSetValue("abe_policy", DemoKeys.policy)
  elementSetValue("database_uid_1", DemoKeys.uid)
  elementSetValue("database_value_1", DemoKeys.encryptedData)
  elementSetValue("plaintext_1", DemoKeys.plaintext)
}
initPage();
