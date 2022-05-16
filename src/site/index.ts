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
function hybridDecryptionTest(abeUserDecryption: string, databaseEncryptedValue: string) {
  // Check function `hybridDecryption`
  // Hex decode (uid and value)
  const encryptedValue = hexDecode(databaseEncryptedValue)

  const singleDatabaseEntries: Uint8Array[] = [encryptedValue]

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
    ciphertextHex: "000001d80000019000000002000000020000000800000002931698bd3979259a4cca680ac15bea5ce8ce66eb5531401dfb0a9b22de245c31d7151c2f05d089e513fc37ead80b4f72a4dab5ff610ea44801f5a0f9c2d163879deb6733515611b3d3729c13b1cbca0aafd3195d46b5dbb542e6332371e4c373c2bc7b760ddd84c9686b12d68999a5af6788bca3aa6d63de217aa098ad544101dc8daac5917af84522528124d3df0d3a13fadafa10021bd7046263b0cc7ab7cc26643551f1aa4875bff420d7c91ece835b05245d83317cbf431090f2f2b06ccd05ce4ab4b11bfa69bd958312b240e478a9d484b7a8032f8db0dcd24dddf677c28517b01ceea033f532f9feac8091f9f70faeb819b57a7aab46683d6a82ff167f5b8044c7d10c24560679fe95bfce25d622f9455f47a438ab19fe56c9e6f9b5a10ca05a7f955713dc082776f9ba82fe0c18a4ebd6cf02e7700f2553d04cb8053fdcd49775d2760ca7cf6afa4f7edac3fa18a9b38e858ee2dffcffb7d874679b16d12a426e7a8b9a89461e6031d3effc024cfb616adff3855671f91796ab64ae84a4dfbbfe8403aabd94dd018a000000345d392fd525dd3216ce339a24e9581cf7347dab9c8fd98cfa4d5b29133d32c5875c91f7a5710ad021e632ac86ebb9ca34b3875cd38021726e7ccc74a5068dd1d6b19ce489af3eb4406cceb39c608c7fdc419f0356870682a149621f222785d95a746855a3b4dd9a69ec35c38483db1c3043d074e406a379b52d7d"
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
      "000000078ec42c844677f84b7543691e0b2b3b01eb5443ac67c1b34825bc78548de2cfb65810413a351c015d0aab27cf70ca68ac00146aa37da921fa65ea667af5fc46d251bd5d57c5504d16b279eda54ca0fcfa6696d0b11ea95488cb4d6984cfddcdf5b0e69f87c2d5951c75653531989edfe1b1c9f9808e87c3ff1e5e5845eb4b2f74cfac85ab4ed287f38af3a24242acaa4613d0ad631f7f92d2af9c756f4d9da63e52fa9e9c3c4e8ab0a6c56850a6797d6267254b117255f30185433a3e7064e686b61dad5f78109385b323617f5e05084304f631dce6a36c9773447125dece9cc3b01bcdd09852e563828ad3997eda09ed008f636077afc3525a2a39c99badc65d54081e86eaab65f874287e75c723e556f7048b261ad07e7af13c2cf964a200b2b566c1a045069a0474125634c6064d94537e57a6085c923301bedafbda4278477957cba003c9a5a5e553d2a2bf3100fc0f3172a27d88f994bd0560c92ebec5750f571a71619867a517e99aba7626810835ebcee9fbe27fc292c892f3ff8a4444803bf2ae6fe7ccae85bff5b72b8f9f2b8be38e4bf3a5335d73b8b8f31e8dba31b4f4f4de9562fca7a8c0cc9ad2a4d97b0970e2f44255dad37d68936d1b18f71e2d561c76cf857ffdfb60775e735674c4d84965336935eb47132a4baaec989d40a25a85d29c26838d8c319b7f637a27dbbd38f019770ef94558714cdd565777e3dfd63b04db802cc6e8a2c9b4ece322f9197830e1365ab524da2dbf9c6917f50dc02f90d2541db1b16db756f5f7afc223350b644f375f5576a9ca0679db79dfdaa6238f0eb30713a26ca6a1c2cc956989a3706224e5a5fdc3bab90201fd4861809712432c278ebbf3748eb719ca0c040b14c943c79f4f8aa9f1b92e9762f3c8fd362a1dc903408f6b584c0d18fd804c7b15ac2122df4c54b1e11b399309a7dfb500000007000000020000000400000008000000090000000300000002000000050000000101000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed73000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed7301000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000",
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
