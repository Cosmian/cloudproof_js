/**
 * Copyright Cosmian 2022 -
 */

// To run these examples/tests()
// Go to to the project directory and run
//    `npx webpack serve`
// then navigate to http://locahost:8080


import {
  webassembly_get_encrypted_header_size
} from "../../wasm_lib/abe/gpsw"
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
import { Findex } from "../interface/findex/findex"
import { DBInterface } from "../interface/db/dbInterface"
import axios, { AxiosResponse, AxiosInstance } from 'axios';


class DB implements DBInterface {
  instance: AxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:3000',
    timeout: 15000,
  });

  responseBody = (response: AxiosResponse) => response.data;

  requests = {
    get: (url: string) => this.instance.get(url).then(this.responseBody),
  };

  getEntryTableEntries(uids: string[]): Promise<{ uid: string; Value: string; }[]> {
    const result = this.requests.get(`/index_chain?UID=in.(${uids})`)
    return result;
  }


  getChainTableEntries(uids: string[]): Promise<{ uid: string; Value: string; }[]> {
    const result = this.requests.get(`/index_entry?UID=in.(${uids})`)
    return result;
  }

  getEncryptedDirectoryEntries(uids: string[]): Promise<{ uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }[]> {
    const result = this.requests.get(`/encrypted_directory?UID=in.(${uids})`)
    return result;
  }

  getfirstEncryptedDirectoryEntries(): Promise<{ uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }[]> {
    const config = {
      headers:{
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/encrypted_directory`, config).then(this.responseBody)
  }

  getfirstUsers(): Promise<Object[]> {
    const config = {
      headers:{
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/users`, config).then(this.responseBody)
  }
}

async function load_data() {
  const db = new DB;
  const users = await db.getfirstUsers();
  const encrypted_users = await db.getfirstEncryptedDirectoryEntries();
  const clear_db = document.getElementById("clear_db");
  const enc_db = document.getElementById("enc_db");
  if (clear_db && enc_db) {
    if (clear_db.innerHTML || enc_db.innerHTML) {
      clear_db.innerHTML = "";
      enc_db.innerHTML = "";
    }
    else {
      users.forEach((item, index) => {
        if (item) {
          displayInTab(item, index, clear_db);
        }
      });
      encrypted_users.forEach((item, index) => {
        if (item) {
          displayInTab(item, index, enc_db);
        }
      });
    }
  }
};
(window as any).load_data = load_data

/**
 * Display a simple JS object into a line of an array in HTML
 * @param object object to display in a line
 * @param index index of the line in the global array
 * @param parent HTML parent element to insert the line in
 * @returns void
 */
function displayInTab(object: Object, index: number, parent: HTMLElement) {
  if (index === 0) {
    let columns = document.createElement('div');
    columns.setAttribute('class', "columns");
    const keys = Object.keys(object);
    for (const key of keys) {
      let column = document.createElement('div');
      column.setAttribute("class", "cell");
      column.innerHTML = key;
      columns.appendChild(column);
    }
    parent.appendChild(columns);
  }
  let line = document.createElement('div');
  line.setAttribute("class", "item");
  const values = Object.values(object);
  for (const value of values) {
    let cell = document.createElement('div');
    cell.setAttribute("class", "cell");
    cell.innerHTML = value;
    line.appendChild(cell);
  }
  parent.appendChild(line);
}

/**
 * Remove accents and uppercase to query word
 * @param str string to sanitize
 * @param string initial string without accents and uppercase
 * @returns void
 */
function sanitizeString(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\-]+/g, '-');
}

//
/**
 * Search terms with Findex implementation and store the results into sessionStorage
 * @param words string of all searched terms separated by a space character
 * @param role chosen role to decrypt result
 * @returns void
 */
async function search(words: string, role: string) {
  const result = document.getElementById("result");
  const content = document.getElementById("content");
  if (result && content) {
    result.style.visibility = "visible";
    content.innerHTML = "";
    try {
      const db = new DB;
      const k1 = "19e1b63d2972a47b84194ed5fa6d8264fc8cbe6dfee5074c8fb1eac3a17b85e8";
      const k2 = "a2cdd03bf58eea8ae842e06ae351700cbac94c8a5dbd8f38984dfa5c104f59d0";
      const query_results = await Findex.query(k1, k2, words.split(" ").map(word => sanitizeString(word)), db, 100);
      if (query_results) {
        const res: { uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }[] = await db.getEncryptedDirectoryEntries(query_results.reduce((acc, result) => { return [...acc, ...result.dbUids] }, [] as string[]));
        if (res && res.length) {
          switch (role) {
            case "mallory":
              res.forEach((item, index) => {
                if (item) {
                  displayInTab(item, index, content);
                }
              });
              break;
            case "alice":
            case "bob":
              let key;
              if (role === "bob") {
                key = "000000029024acd8939bc232bc576c56188a99b09ad710c12c3b2910202c7f58aa04c7bc08ecd78ea45a684f5a9bcd8f6ebb14ee01852ca969af502d8b3103cc52702032629344a30c3a27c8ae465ccfd586771b3b1db90b542cf3409cfa6aef892c787fa9d342174d62d39f87d59f5d0b1dc906265ec9d764bcf1e7cb1d4901deecd5671c8596eb741d9de68f73915d46d3cfb502b73d9397d2d9687fe3b318bbcb794ca229cdefe855869fd15e0734601e2005fcf554ada1ad7ac6817fa2de284d76bb0000000200000002000000020000000501000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed73";
              }
              else {
                key = "0000000296bc80fefb445765edd87706f4df1fe443a5da07950a3f3ea48f6ffba316e599c77d49979a8c4d896f0386d6e6a53b13175798775f0702903dbe0a6270f0fe05cb33913f216d54e5d751f84b9d5d9af4622b0447cd17d42b20128d7268f947f898bc94e484d49c1c6bd3246414c5a5f4e892b67fa4892c5a0b59869df2fb094e38f73ebfb6b23b3202181978cb060c9000eaecfc00a31079cbfa1c335c355002208850a9a0239e6e80fc377c0860b00d8dfad550ccd9b5bb7d564c1fb40b00cb0000000200000002000000010000000401000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fffffffffe5bfeff02a4bd5305d8a10908d83933487d9d2953a7ed73";
              }
              const hybridDecryption = new GpswHybridDecryption(hexDecode(key));
              const clearValues: { User: string, HR_Elements: string, Security_Elements: string }[] = [];
              res.forEach((item) => {
                if (item) {
                  let clearValue:{ User: string, HR_Elements: string, Security_Elements: string } = { User: "", HR_Elements: "", Security_Elements: ""};
                  try {
                    const cleartextBase = hybridDecryption.decrypt(hexDecode(item.Enc_K_base.substring(2)));                   
                    clearValue.User = new TextDecoder().decode(cleartextBase);
                  }
                  catch (e) {
                    console.log("Impossible to decrypt", e)
                  }
                  try {
                    const cleartextHR = hybridDecryption.decrypt(hexDecode(item.Enc_K_rh.substring(2)));
                    clearValue.HR_Elements = new TextDecoder().decode(cleartextHR);
                  }
                  catch (e) {
                    console.log("Impossible to decrypt", e)
                  }
                  try {
                    const cleartextSecurity = hybridDecryption.decrypt(hexDecode(item.Enc_K_sec.substring(2)));
                    clearValue.Security_Elements = new TextDecoder().decode(cleartextSecurity);
                  }
                  catch (e) {
                    console.log("Impossible to decrypt", e)
                  }
                  if (clearValue.User || clearValue.HR_Elements || clearValue.Security_Elements) {
                    clearValues.push(clearValue);
                  }
                }
              });
              clearValues.forEach((item, index) => {
                if (item) {
                  displayInTab(item, index, content);
                }
              });
              hybridDecryption.destroyInstance();
              break;
          }
        } else {
          let line = document.createElement('div');
          line.setAttribute("class", "item");
          line.innerHTML = "No results";
          content.appendChild(line);
        }
      }
    } catch {
      let line = document.createElement('div');
      line.setAttribute("class", "item");
      line.innerHTML = "No results";
      content.appendChild(line);
    }
  }
}
(window as any).search = search

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
