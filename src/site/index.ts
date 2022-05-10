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
import { HybridDecryption, DecryptionWorkerMessage, AbeHybridDecryption } from "./../crypto/hybrid_crypto/abe/gpsw/abe_decryption"
import { HybridEncryption, EncryptionWorkerMessage, AbeEncryptionParameters, AbeHybridEncryption } from "./../crypto/hybrid_crypto/abe/gpsw/abe_encryption"
import { logger } from "./../utils/logger"
import { EncryptedEntry, WorkerPool } from "./../crypto/hybrid_crypto/abe/worker_pool"
import { hexDecode } from "./../utils/utils"
import { AbeHybridEncryptionDemo } from "../crypto/hybrid_crypto/abe/gpsw/demo"



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
function hybridDecryptionTest(abeUserDecryption: string, databaseUid: string, databaseEncryptedValue: string) {
  // Check function `hybridDecryption`
  // Hex decode (uid and value)
  const uid = hexDecode(databaseUid)
  const encryptedValue = hexDecode(databaseEncryptedValue)

  const singleDatabaseEntries = new Map<Uint8Array, Uint8Array>()
  singleDatabaseEntries.set(uid, encryptedValue)

  // Init ABE decryption cache
  const abe = new AbeHybridDecryption(hexDecode(abeUserDecryption))

  // Iter as much as needed
  const startDate = new Date().getTime()
  const loops = 100
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

function benchAsymmetricDecryption(asymmetricDecryptionKeyHex: string, databaseEncryptedValueHex: string): number[] {
  // Init ABE decryption cache
  const hybridCrypto = new AbeHybridDecryption(hexDecode(asymmetricDecryptionKeyHex))

  const databaseEncryptedValue = hexDecode(databaseEncryptedValueHex)
  logger.log(() => "benchAsymmetricDecryption for databaseEncryptedValue: " + databaseEncryptedValue)

  const headerSize = webassembly_get_encrypted_header_size(databaseEncryptedValue)

  // Asymmetric part decryption
  const abeHeader = databaseEncryptedValue.slice(4, 4 + headerSize)

  // Process hybrid decryption on multiple iterations
  const results = hybridCrypto.benchDecryptHybridHeader(abeHeader)

  // Finish with cache destroying
  hybridCrypto.destroyInstance()

  return results
}
(window as any).benchAsymmetricDecryption = benchAsymmetricDecryption

// --- ENCRYPTION ---
function hybridEncryptionTest(publicKey: string, policy: string, attributes: string, uid: string, plaintext: string) {
  // Init ABE encryption cache
  const abe = new AbeHybridEncryption(hexDecode(policy), hexDecode(publicKey))

  // Hex decoded
  const uidBytes = hexDecode(uid)
  const plaintextBytes = hexDecode(plaintext)

  // Iter as much as needed
  const startDate = new Date().getTime()
  const loops = 100
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


function benchAsymmetricEncryption(publicKey: string, policy: string, attributes: string, uid: string): number[] {
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
    uidHex: "cd8ca2eeb654b5f39f347f4e3f91b3a15c450c1e52c40716237b4c18510f65b4",
    ciphertextHex: "000001bc0000019000000002000000010000000400000002b0ab30de72bd283cc8d42b3b969a3247ab1932c2edbb6958564e1edee835ec6ba0fcd7b726ab79fa8002cd2591d6210fb049610e974def02305e946461d596c8b64e3825311ad3d606e47729a3b557f4ecda243c183603ea3da4144c4ed6b0248b00fbdacc935ad6f1e52a25b83a4ba0507e7d2d16319cf68b741a380eeed717743b48b57a5d33bc7e063f148e5aa8e619debc58ac27237f54b760b856869da3df7d27f488c61c648189ba1816bbc6fa9e56ec497ecbb3025824982b39509da70ad9fbe49f916679139e9e4b1ff2a7cbdcf789dcec628f549fae8e8a0c6c0f47d4bbb1c3aa8d291ff2deeb3d9a4c199c19a88c55d4e74c3919ec55f64c3b2e56a50fdf4d0910a0810e35190cd07f4796971a1762a2cb3417c5f6009641e6f31e0cd6e3a3d9669c50f087036dbe17ec4be882195ec91c2423a2ff7256569ef32336b7ba0549ee29a44d08ee90115c107e1657739ee8db76a08855c4ed02381ee4448330168c9e2a2d63f672d9cc42a82722dd28c89e1060fbdcaae41333f4834c6693c0fa8e002d2dbb193f6d000000180ee60adb400749cc8fa9b2a33eac28b2ab8d90a968436372e09ba17fdff90afbb18546211268b8aef6517a73b701283ab334c0720372f565c751a311c1ec09a6bbb070f8a1961ca3f048b280ea36a578a0068edea8408f3cf4ab26f5a71933dffed384ea7d33e42c16fe17a1026937a345386bb980917d6d2175a48b6d69e8322689dde0bf99cee9d2da5bbee1f29b2005725b6969021462e6608284a5135677b03d8fcce03563cc4d8988f455d27b95ef62080f4c2f18e7897636ac69e9d216668765d2025f66c805d549c4ef779c32ac3286bee8d35c1b758b51f1686d2aea996cc1f3bfff2aea7d605cce963e5bc69f77f284a1c05b803df08fcdec6a6d4f0c74ad8f6076d9ca692642dcdff64a34d1fbbb4d57aea776ce8032b03d63c9e376377fb95725b6d3ac6be3a29f47d15eb22b5c81bf6168785844da8d22914076415957d9e253142f14c5c68fbe1108d74832e2347425f89b46321ac0c7b939f793e3c39e5dbb83d9e6be29db4aa3df0e645cc859aac9a0324d546b70856e2ae89c77b87a8e25eac90f9265642bbd8c407f0aa307aef613bd79fa8fd6c959c959007791621e5fe047edfcadae2c195bb681b6621a9583c8d51911e39df50331b495b603fbf826eebeffe26cd2bc0287a280801bc54cfa9fed1279a58843bb8ea1262982753481dc61852cca49279d0de5e287f6a43dca38"
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
    workerPool.decrypt(
      "00000002b3b7edd9c7f94fd16ea286404307a71db9b94ebaeb2d1f7e40df5a56eb1f7a15ead336562219497ae35b5e622f0af6e709416b7738813b06ff36af4e79a36d4bf7714ffebffed1df31d9c0f00a264b44df2e00891a4f8a9283708188c81f9adbb568cbb92ba8e73346a70ed4148e8424b5c4ac49c511ca767f85f0e376ece806c0c0c02afa544894691f566393f01b3016234d30d721e52b916b3ea63867415c5596ab8fd7558414cf1b6fb8991e291d91f573b4445f1851bb93fdb59783c2a00000000200000002000000010000000401000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed73",
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
    // decode to string from utf-8 bytes
    const jsonString = new TextDecoder().decode(v.buffer)
    // parse JSON to object
    const record = JSON.parse(jsonString)
    // recover some fields
    return record.givenName + " " + record.Sn + ": " + record.title
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


function abeDemo() : string{
  AbeHybridEncryptionDemo.run()
  return "OK"
}
(window as any).abeDemo = abeDemo
