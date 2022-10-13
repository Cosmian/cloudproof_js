/**
 * Copyright Cosmian 2022 -
 */

// To run these examples/tests()
// Go to to the project directory and run
//    `npx webpack serve`
// then navigate to http://locahost:8080

import { CoverCryptHybridDecryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/decryption";
import { CoverCryptHybridEncryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/encryption";
import { GpswHybridDecryption } from "crypto/abe/core/hybrid_crypto/gpsw/decryption";
import { GpswHybridEncryption } from "crypto/abe/core/hybrid_crypto/gpsw/encryption";
import {
  EncryptedEntry,
  WorkerPool,
} from "crypto/abe/core/hybrid_crypto/worker/worker_pool";
import { CoverCryptMasterKeyGeneration } from "crypto/abe/core/keygen/cover_crypt";
import { GpswMasterKeyGeneration } from "crypto/abe/core/keygen/gpsw_crypt";
import { logger } from "utils/logger";
import { hexDecode, hexEncode } from "utils/utils";
import { EncryptionDecryptionDemo } from "../../tests/crypto/abe/common/demo_hybrid_crypto";
import { CoverCryptDemoKeys } from "../../tests/crypto/abe/core/cover_crypt/demo_keys";
import { GpswDemoKeys } from "../../tests/crypto/abe/core/gpsw/demo_keys";
import { generateCoverCryptKeys } from "../../tests/crypto/sse/findex/implementations/common/cover_crypt_keys";
import { FINDEX_MSK } from "../../tests/crypto/sse/findex/implementations/common/keys";
import { Users } from "../../tests/crypto/sse/findex/implementations/common/users";
import { CloudproofDemoPostgRest } from "../../tests/crypto/sse/findex/implementations/postgrest/cloudproof";
import { PostgRestDB } from "../../tests/crypto/sse/findex/implementations/postgrest/db";

const FINDEX_DEMO = new CloudproofDemoPostgRest(new PostgRestDB());
const COVER_CRYPT_KEYS = generateCoverCryptKeys();
const LABEL = "label";
let USERS = new Users();

const LOOP_ITERATION_LIMIT = 1000;
const GRAPH_RECURSION_LIMIT = 1000;

/**
 * Index elements contained in DB with Findex upsert
 *
 *  @param location string naming the key of location to index
 *  @returns void
 */
async function upsert(location: string): Promise<void> {
  const button = document.getElementById("index_button") as HTMLButtonElement;
  if (button) {
    button.innerHTML = "Indexes creation...";
  }

  try {
    await FINDEX_DEMO.upsertUsersIndexes(
      FINDEX_MSK,
      LABEL,
      USERS,
      location,
      true
    );
    if (button) {
      button.innerHTML = "Indexes created !";
      button.style.backgroundColor = "#4CAF50";
      button.disabled = true;
    }
  } catch (error) {
    if (button) {
      button.innerHTML = "Error indexing";
      console.log(error);
    }
  }
}

/**
 * Findex upsert elements and display them
 *
 * @returns void
 */
async function IndexAndLoadElements(): Promise<void> {
  const elements = USERS.getFirstUsers();
  const clearDb = document.getElementById("clear_db");
  if (clearDb != null) {
    if (clearDb.innerHTML) {
      clearDb.innerHTML = "";
    } else {
      displayInTab(elements, clearDb);
    }
  }
  await upsert("id");
}
(window as any).IndexAndLoadElements = IndexAndLoadElements;

/**
 * Encrypt elements table with CoverCrypt, Findex upsert encrypted elements and display them
 *
 * @returns void
 */
async function IndexAndLoadEncryptedElements(): Promise<void> {
  console.time("IndexAndLoadEncryptedElements");

  const button = document.getElementById("index_button");
  if (button != null) {
    button.innerHTML = "Encrypt elements...";
  }

  console.time("firstElements");
  const firstElements = await USERS.getFirstUsers();
  const clearDb = document.getElementById("clear_db");
  if (clearDb != null) {
    if (clearDb.innerHTML) {
      clearDb.innerHTML = "";
    } else {
      displayInTab(firstElements, clearDb);
    }
  }
  console.timeEnd("firstElements");

  console.time("deleteAll");
  await FINDEX_DEMO.postgrestDb.deleteAllEncryptedUsers();
  await FINDEX_DEMO.postgrestDb.deleteAllEntryTableEntries();
  await FINDEX_DEMO.postgrestDb.deleteAllChainTableEntries();
  console.timeEnd("deleteAll");

  console.time("encryptUsersPerCountryAndDepartment");
  USERS = await FINDEX_DEMO.encryptUsersPerCountryAndDepartment(
    USERS,
    hexDecode("00000001"),
    COVER_CRYPT_KEYS.abePolicy,
    COVER_CRYPT_KEYS.masterKeysCoverCrypt.publicKey
  );
  console.timeEnd("encryptUsersPerCountryAndDepartment");

  console.time("getFirstEncryptedUsers");
  const firstEncryptedElements =
    await FINDEX_DEMO.postgrestDb.getFirstEncryptedUsers();
  const encDb = document.getElementById("enc_db");
  if (encDb != null) {
    if (encDb.innerHTML) {
      encDb.innerHTML = "";
    } else {
      displayInTab(firstEncryptedElements, encDb);
    }
  }
  console.timeEnd("getFirstEncryptedUsers");

  console.time("upsert");
  await upsert("enc_uid");
  console.timeEnd("upsert");

  console.timeEnd("IndexAndLoadEncryptedElements");
}
(window as any).IndexAndLoadEncryptedElements = IndexAndLoadEncryptedElements;

/**
 * Search terms with Findex implementation
 *
 * @param words string of all searched terms separated by a space character
 * @param logicalSwitch boolean to specify OR / AND search
 * @returns void
 */
async function searchElements(
  words: string,
  logicalSwitch: boolean
): Promise<void> {
  const result = document.getElementById("result");
  const content = document.getElementById("content");
  if (result == null || content == null) {
    return;
  }
  result.style.visibility = "visible";
  content.innerHTML = "";

  try {
    const locations = await FINDEX_DEMO.searchWithLogicalSwitch(
      FINDEX_MSK.key,
      LABEL,
      words,
      logicalSwitch,
      LOOP_ITERATION_LIMIT,
      GRAPH_RECURSION_LIMIT,
      progress
    );
    if (locations.length > 0) {
      const locationsString: string[] = [];
      for (const location of locations) {
        locationsString.push(new TextDecoder().decode(location));
      }
      const users = USERS.getUsersById(locationsString);
      displayInTab(users, content);
    } else {
      displayNoResult(content);
    }
  } catch (error) {
    displayNoResult(content);
    console.log(error);
  }
}
(window as any).searchElements = searchElements;

/**
 *
 * @param _serialized_intermediate_results
 */
async function progress(
  _serialized_intermediate_results: Uint8Array
): Promise<boolean> {
  return true;
}

/**
 * Search terms with Findex implementation
 *
 * @param words string of all searched terms separated by a space character
 * @param role string naming the selected role for decryption
 * @param logicalSwitch boolean to specify OR / AND search
 * @returns void
 */
async function searchAndDecryptElements(
  words: string,
  role: string,
  logicalSwitch: boolean
): Promise<void> {
  const result = document.getElementById("result");
  const content = document.getElementById("content");
  if (result == null || content == null) {
    return;
  }
  result.style.visibility = "visible";
  content.innerHTML = "";
  try {
    const queryResults = await FINDEX_DEMO.searchWithLogicalSwitch(
      FINDEX_MSK.key,
      LABEL,
      words,
      logicalSwitch,
      LOOP_ITERATION_LIMIT,
      GRAPH_RECURSION_LIMIT,
      (_: Uint8Array) => true
    );
    if (queryResults.length === 0) {
      displayNoResult(content);
      return;
    }

    let userDecryptionKey = new Uint8Array();
    switch (role) {
      case "charlie":
        userDecryptionKey = COVER_CRYPT_KEYS.charlie;
        break;
      case "alice":
        userDecryptionKey = COVER_CRYPT_KEYS.alice;
        break;
      case "bob":
        userDecryptionKey = COVER_CRYPT_KEYS.bob;
    }
    const clearValues = await FINDEX_DEMO.fetchAndDecryptUsers(
      queryResults,
      userDecryptionKey
    );
    if (clearValues.length > 0) {
      displayInTab(clearValues, content);
    } else {
      displayNoResult(content);
    }
  } catch (error) {
    displayNoResult(content);
    console.log(error);
  }
}
(window as any).searchAndDecryptElements = searchAndDecryptElements;

/**
 * Display an array of simple JS objects into a an array in HTML
 *
 * @param array array to display
 * @param parent HTML parent element to insert the line in
 * @returns void
 */
function displayInTab(array: object[], parent: HTMLElement): void {
  array.forEach((item, index) => {
    if (item) {
      if (index === 0) {
        const columns = document.createElement("div");
        columns.setAttribute("class", "item columns");
        const keys = Object.keys(item);
        for (const key of keys) {
          const column = document.createElement("div");
          column.setAttribute("class", "cell");
          column.innerHTML = key;
          columns.appendChild(column);
        }
        parent.appendChild(columns);
      }
      const line = document.createElement("div");
      line.setAttribute("class", "item");
      const values = Object.values(item);
      for (const value of values) {
        const cell = document.createElement("div");
        cell.setAttribute("class", "cell");
        cell.innerHTML = value;
        line.appendChild(cell);
      }
      parent.appendChild(line);
    }
  });
}

/**
 * Display No result in div
 *
 * @param parent HTML parent element to insert the line in
 * @returns void
 */
function displayNoResult(parent: HTMLElement): void {
  const line = document.createElement("div");
  line.setAttribute("class", "item");
  line.innerHTML = "No results";
  parent.appendChild(line);
}

//
// ----------------------------------------------------
// TEST PURPOSES
// ----------------------------------------------------
// --- DECRYPTION ---
/**
 *
 * @param abeUserDecryption
 * @param databaseEncryptedValue
 */
function hybridDecryptionTest(
  abeUserDecryption: string,
  databaseEncryptedValue: string
): number {
  // Check function `hybridDecryption`
  // Hex decode (uid and value)
  const encryptedValue = hexDecode(databaseEncryptedValue);

  const singleDatabaseEntries: Uint8Array[] = [encryptedValue];

  // Init ABE decryption cache
  let hybridCrypto;
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridDecryption(hexDecode(abeUserDecryption));
  } else {
    hybridCrypto = new GpswHybridDecryption(hexDecode(abeUserDecryption));
  }

  // Iter as much as needed
  const startDate = new Date().getTime();
  const loops = 100;
  for (let i = 0; i < loops; i++) {
    hybridCrypto.decryptBatch(singleDatabaseEntries);
  }
  const endDate = new Date().getTime();
  const milliseconds = (endDate - startDate) / loops;
  const newLocal = `webassembly-JS avg time (with cache): ${milliseconds}ms`;
  logger.log(() => newLocal);

  // Finish with cache destroying
  hybridCrypto.destroyInstance();

  return milliseconds;
}
(window as any).hybridDecryptionTest = hybridDecryptionTest;

/**
 *
 * @param asymmetricDecryptionKeyHex
 * @param databaseEncryptedValueHex
 */
function benchAsymmetricDecryption(
  asymmetricDecryptionKeyHex: string,
  databaseEncryptedValueHex: string
): number[] {
  // Init ABE decryption cache
  let hybridCrypto;
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridDecryption(
      hexDecode(asymmetricDecryptionKeyHex)
    );
  } else {
    hybridCrypto = new GpswHybridDecryption(
      hexDecode(asymmetricDecryptionKeyHex)
    );
  }

  const databaseEncryptedValue = hexDecode(databaseEncryptedValueHex);
  logger.log(
    () =>
      "benchAsymmetricDecryption for databaseEncryptedValue: " +
      databaseEncryptedValue
  );

  const headerSize = hybridCrypto.getHeaderSize(databaseEncryptedValue);

  // Asymmetric part decryption
  const abeHeader = databaseEncryptedValue.slice(4, 4 + headerSize);

  // Process hybrid decryption on multiple iterations
  const res = hybridCrypto.benchDecryptHybridHeader(abeHeader);

  // Finish with cache destroying
  hybridCrypto.destroyInstance();

  return res;
}
(window as any).benchAsymmetricDecryption = benchAsymmetricDecryption;

// --- ENCRYPTION ---
/**
 *
 * @param publicKey
 * @param policy
 * @param attributes
 * @param uid
 * @param plaintext
 */
function hybridEncryptionTest(
  publicKey: string,
  policy: string,
  attributes: string[],
  uid: string,
  plaintext: string
) {
  // Init ABE encryption cache
  let hybridCrypto;
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridEncryption(
      hexDecode(policy),
      hexDecode(publicKey)
    );
  } else {
    hybridCrypto = new GpswHybridEncryption(
      hexDecode(policy),
      hexDecode(publicKey)
    );
  }

  // Hex decoded
  const uidBytes = hexDecode(uid);
  const plaintextBytes = hexDecode(plaintext);

  // Iter as much as needed
  const startDate = new Date().getTime();
  const loops = 100;
  for (let i = 0; i < loops; i++) {
    const ct = hybridCrypto.encrypt(attributes, uidBytes, plaintextBytes);
    logger.log(() => "ct:" + hexEncode(ct));
  }
  const endDate = new Date().getTime();
  const milliseconds = (endDate - startDate) / loops;
  logger.log(
    () => "webassembly-JS avg time (with cache): " + milliseconds + "ms"
  );

  // Finish with cache destroying
  hybridCrypto.destroyInstance();

  return milliseconds;
}
(window as any).hybridEncryptionTest = hybridEncryptionTest;

/**
 *
 * @param publicKey
 * @param policy
 * @param attributes
 * @param uid
 */
function benchAsymmetricEncryption(
  publicKey: string,
  policy: string,
  attributes: string[],
  uid: string
): number[] {
  // Init ABE decryption cache
  let hybridCrypto;
  if (!isGpswImplementation()) {
    hybridCrypto = new CoverCryptHybridEncryption(
      hexDecode(policy),
      hexDecode(publicKey)
    );
  } else {
    hybridCrypto = new GpswHybridEncryption(
      hexDecode(policy),
      hexDecode(publicKey)
    );
  }

  // Hex decode
  const uidBytes = hexDecode(uid);

  // Process hybrid decryption on multiple iterations
  const results = hybridCrypto.benchEncryptHybridHeader(attributes, uidBytes);

  // Finish with cache destroying
  hybridCrypto.destroyInstance();

  return results;
}
(window as any).benchAsymmetricEncryption = benchAsymmetricEncryption;

// /////////////////////////:
//
// Decryption Workers Demo
//
// //////////////////////////
const NUM_WORKERS = 4;
const NUM_ENTRIES = 200;

// instantiate a worker pool
const workerPool = new WorkerPool(NUM_WORKERS);
// display the number of workers
const wnElt = document.getElementById("workers_number");
if (wnElt == null) {
  // console.error("workers_number not found")
} else {
  wnElt.innerHTML = `${NUM_WORKERS}`;
}

// The function called whn clicking the decrypt button
const decryptUsingWorker = (): void => {
  // create set of test entries
  const encryptedEntries: EncryptedEntry[] = [];
  let demoUid = new Uint8Array();
  let demoEncryptedData = new Uint8Array();
  let demoTopSecretMkgFinUser = new Uint8Array();
  let isGpsw = false;
  if (isGpswImplementation()) {
    demoUid = GpswDemoKeys.uid;
    demoEncryptedData = GpswDemoKeys.encryptedData;
    demoTopSecretMkgFinUser = GpswDemoKeys.topSecretMkgFinUser;
    isGpsw = true;
  } else {
    demoUid = CoverCryptDemoKeys.uid;
    demoEncryptedData = CoverCryptDemoKeys.encryptedData;
    demoTopSecretMkgFinUser = CoverCryptDemoKeys.topSecretMkgFinUser;
    isGpsw = false;
  }

  logger.log(() => `isGpsw: ${isGpsw.toString()}`);

  for (let index = 0; index < NUM_ENTRIES; index++) {
    encryptedEntries.push({
      uidHex: hexEncode(demoUid),
      ciphertextHex: hexEncode(demoEncryptedData),
    });
  }

  const wrnElt = document.getElementById("workers_results_number");
  const wrElt = document.getElementById("workers_result");
  if (wrnElt == null || wrElt == null) {
    console.error("workers elements not found");
  } else {
    wrElt.innerHTML = "";
    wrnElt.innerHTML = "...running...";
    const startDate = new Date().getTime();
    workerPool
      .decrypt(hexEncode(demoTopSecretMkgFinUser), encryptedEntries, isGpsw)
      .then(
        (results: Uint8Array[]) =>
          displayResults(startDate, results, encryptedEntries.length),
        (err: any) => displayError(err)
      )
      .finally(() => {
        logger.log(() => "all decryption workers terminated");
      });
  }
};
(window as any).decryptUsingWorker = decryptUsingWorker;

// Display the decryption results
const displayResults = (
  startDate: number,
  results: Uint8Array[],
  encryptedEntriesLength: number
): void => {
  // got results  - stope time measurement
  const endDate = new Date().getTime();
  const milliseconds = (endDate - startDate) / encryptedEntriesLength;

  // display some stats
  const wrnElt = document.getElementById("workers_results_number");
  if (wrnElt == null) {
    console.error("workers_results_number not found");
    return;
  }
  wrnElt.innerHTML = `${results.length} in ${endDate - startDate}ms i.e. ${milliseconds}ms/record average`;

  // the results themselves
  const wrElt = document.getElementById("workers_result");
  if (wrElt == null) {
    console.error("workers_result not found");
    return;
  }
  const text = results.map((v) => {
    return new TextDecoder().decode(v);
  });
  wrElt.innerHTML = text.join("<br>");
};

// display the decryption errors
const displayError = (err: string): void => {
  const wnElement = document.getElementById("workers_number");
  if (wnElement == null) {
    console.error("workers_number not found");
    return;
  }
  wnElement.innerHTML = "ERROR: " + err;
};

// run demo scenario for ABE implementation
/**
 *
 */
function abeDemo(): string {
  if (!isGpswImplementation()) {
    const keyGeneration = new CoverCryptMasterKeyGeneration();
    const demoKeys = new CoverCryptDemoKeys();
    const hybridEncryption = new CoverCryptHybridEncryption(
      demoKeys.policy,
      demoKeys.publicKey
    );
    const hybridDecryption = new CoverCryptHybridDecryption(
      demoKeys.topSecretMkgFinUser
    );
    const encryptionDemo = new EncryptionDecryptionDemo(
      keyGeneration,
      demoKeys,
      hybridEncryption,
      hybridDecryption
    );
    encryptionDemo.run();
    // CoverCryptHybridEncryptionDemo.run()
  } else {
    const keyGeneration = new GpswMasterKeyGeneration();
    const demoKeys = new GpswDemoKeys();
    const hybridEncryption = new GpswHybridEncryption(
      demoKeys.policy,
      demoKeys.publicKey
    );
    const hybridDecryption = new GpswHybridDecryption(
      demoKeys.topSecretMkgFinUser
    );
    const encryptionDemo = new EncryptionDecryptionDemo(
      keyGeneration,
      demoKeys,
      hybridEncryption,
      hybridDecryption
    );
    encryptionDemo.run();
    // GpswHybridEncryptionDemo.run()
  }
  return "OK";
}
(window as any).abeDemo = abeDemo;

/**
 *
 * @param id
 * @param value
 */
function elementSetValue(id: string, value: Uint8Array | string) {
  const box = document.getElementById(id);
  if (box == null) {
    // console.error(id + " not found")
    return;
  }
  if (value.constructor === Uint8Array) {
    box.setAttribute("value", hexEncode(value));
  } else if (value.constructor === String) {
    box.setAttribute("value", value);
  } else {
    console.error("Type not supported: " + value);
  }
}

/**
 *
 */
function isGpswImplementation(): boolean {
  const abeImplementation = document.querySelector(
    'input[name="abe_group"]:checked'
  );
  if (abeImplementation == null) {
    console.error("Unexpected error for ABE implementation choice");
    return false;
  }
  const abeValue = abeImplementation.getAttribute("value");
  return abeValue === "gpsw";
}

/**
 *
 * @param isGpsw
 */
export function initPage(isGpsw: boolean) {
  if (isGpsw) {
    elementSetValue(
      "abe_user_key_access_policy_1",
      GpswDemoKeys.topSecretMkgFinUserAccessPolicy
    );
    elementSetValue("abe_user_key_1", GpswDemoKeys.topSecretMkgFinUser);
    elementSetValue("abe_public_key", GpswDemoKeys.publicKey);
    elementSetValue("abe_policy", GpswDemoKeys.policy);
    elementSetValue("database_uid_1", GpswDemoKeys.uid);
    elementSetValue("database_value_1", GpswDemoKeys.encryptedData);
    elementSetValue("plaintext_1", GpswDemoKeys.plaintext);
  } else {
    elementSetValue(
      "abe_user_key_access_policy_1",
      CoverCryptDemoKeys.topSecretMkgFinUserAccessPolicy
    );
    elementSetValue("abe_user_key_1", CoverCryptDemoKeys.topSecretMkgFinUser);
    elementSetValue("abe_public_key", CoverCryptDemoKeys.publicKey);
    elementSetValue("abe_policy", CoverCryptDemoKeys.policy);
    elementSetValue("database_uid_1", CoverCryptDemoKeys.uid);
    elementSetValue("database_value_1", CoverCryptDemoKeys.encryptedData);
    elementSetValue("plaintext_1", CoverCryptDemoKeys.plaintext);
  }
}
initPage(false);
(window as any).initPage = initPage;
