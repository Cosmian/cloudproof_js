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
import { Policy, PolicyAxis } from "../crypto/abe/keygen/policy"
import { coverCryptDecrypt, coverCryptEncrypt, generateMasterKeys } from "../interface/cover_crypt/cover_crypt"
import { DB } from "../interface/db/dbInterface"
import { Findex } from '../interface/findex/findex'
import * as lib from "../lib"
import { masterKeysFindex } from "./../utils/demo_keys"
import { logger } from "./../utils/logger"
import { hexDecode, hexEncode } from "./../utils/utils"

/**
 * Index users contained in DB with Findex upsert
 *  @param location string naming the key of location to index
 *  @returns void
 */
async function upsert(location: string) {
    const button = document.getElementById("index_button");
    if (button) {
        button.innerHTML = "Indexes creation...";
    }
    type User = { [key: string]: string; };
    const db = new DB();
    await db.deleteAllChainTableEntries();
    await db.deleteAllEntryTableEntries();
    const users: User[] = await db.getUsers();
    const sanitizedUsers: User[] = users.map((user) => {
        Object.keys(user).forEach((key) => { user[key] = sanitizeString(user[key]) });
        return user;
    })
    const findex = new Findex(db);
    try {
        await findex.upsert(masterKeysFindex, sanitizedUsers, location);
        if (button) {
        button.innerHTML = "Indexes created !";
        }
    } catch {
        if (button) {
        button.innerHTML = "Error indexing";
        }
    }
}

/**
 * Findex upsert users and display them
 * @returns void
 */
async function IndexAndloadUsers() {
    const db = new DB();
    await upsert('id');
    const users = await db.getFirstUsers();
    const clearDb = document.getElementById("clear_db");
    if (clearDb) {
        if (clearDb.innerHTML) {
        clearDb.innerHTML = "";
        }
        else {
        displayInTab(users, clearDb);
        }
    }
};
(window as any).IndexAndloadUsers = IndexAndloadUsers

/**
 * Encrypt users table with CoverCrypt, Findex upsert encypted users and display them
 * @returns void
 */
async function IndexAndLoadEncryptedUsers() {
    const button = document.getElementById("index_button");
    if (button) {
        button.innerHTML = "Encrypt users...";
    }

    const db = new DB();
    await db.deleteAllEncryptedUsers();

    const policy = new Policy([
        new PolicyAxis("department", ["marketing", "HR", "security"], false),
        new PolicyAxis("country", ["France", "Spain", "Germany"], false)
    ], 100)
    const masterKeysCoverCrypt = generateMasterKeys(policy);
    const policyBytes = policy.toJsonEncoded();
    sessionStorage.setItem('policy', hexEncode(policyBytes));
    sessionStorage.setItem('coverCryptPublicKey', hexEncode(masterKeysCoverCrypt.publicKey));
    sessionStorage.setItem('coverCryptPrivateKey', hexEncode(masterKeysCoverCrypt.privateKey));

    const users = await db.getUsers();
    for (const user of users) {
        const encryptedBasic = coverCryptEncrypt(policyBytes, masterKeysCoverCrypt.publicKey, [`department::marketing`, `country::${user.country}`], JSON.stringify({ firstName: user.firstName, lastName: user.lastName, country: user.country, region: user.region }))
        const encryptedHr = coverCryptEncrypt(policyBytes, masterKeysCoverCrypt.publicKey, [`department::HR`, `country::${user.country}`], JSON.stringify({ email: user.email, phone: user.phone, employeeNumber: user.employeeNumber }))
        const encryptedSecurity = coverCryptEncrypt(policyBytes, masterKeysCoverCrypt.publicKey, [`department::security`, `country::${user.country}`], JSON.stringify({ security: user.security }))
        const upsertedEncUser = await db.upsertEncryptedUser({
        enc_basic: hexEncode(encryptedBasic),
        enc_hr: hexEncode(encryptedHr),
        enc_security: hexEncode(encryptedSecurity)
        });
        await db.upsertUserEncUidById(user.id, { enc_uid: upsertedEncUser[0].uid });
    };

    await upsert('enc_uid');

    const firstUsers = await db.getFirstUsers();
    const firstEncryptedUsers = await db.getFirstEncryptedUsers();
    const clearDb = document.getElementById("clear_db");
    const encDb = document.getElementById("enc_db");
    if (clearDb && encDb) {
        if (clearDb.innerHTML || encDb.innerHTML) {
        clearDb.innerHTML = "";
        encDb.innerHTML = "";
        }
        else {
        displayInTab(firstUsers, clearDb);
        displayInTab(firstEncryptedUsers, encDb);
        }
    }
};
(window as any).IndexAndLoadEncryptedUsers = IndexAndLoadEncryptedUsers

/**
 * Search terms with Findex implementation
 * @param words string of all searched terms separated by a space character
 * @param logicalSwitch boolean to specify OR / AND search
 * @returns void
 */
async function search(words: string, logicalSwitch: boolean) {
    type User = { [key: string]: string; };

    const result = document.getElementById("result");
    const content = document.getElementById("content");
    if (result == null || content == null) {
        return
    }
    result.style.visibility = "visible";
    content.innerHTML = "";
    try {
        const db = new DB();
        const wordsArray = words.split(" ");
        const findex = new Findex(db);
        let queryResults: string[] = [];
        if (!logicalSwitch) {
        queryResults = await findex.search(masterKeysFindex, wordsArray.map(word => sanitizeString(word)));
        } else {
        await Promise.all(wordsArray.map(async (word, index) => {
            const partialResults = await findex.search(masterKeysFindex, [word])
            if (index) {
            queryResults = queryResults.filter(location => partialResults.includes(location))
            } else {
            queryResults = [ ...partialResults ]
            }
        }))
        }
        if (queryResults.length) {
        const users: User[] = await db.getUsersById(queryResults);
        displayInTab(users, content);
        } else {
        displayNoResult(content);
        }
    } catch {
        displayNoResult(content);
    }
}
(window as any).search = search

/**
 * Search terms with Findex implementation
 * @param words string of all searched terms separated by a space character
 * @param role string naming the selected user for decryption
 * @param logicalSwitch boolean to specify OR / AND search
 * @returns void
 */
async function searchAndDecrypt(words: string, role: string, logicalSwitch: boolean) {
    type EncryptedValue = { uid: string, enc_basic: string, enc_hr: string, enc_security: string };

    const result = document.getElementById("result");
    const content = document.getElementById("content");
    if (result == null || content == null) {
        return
    }
    result.style.visibility = "visible";
    content.innerHTML = "";
    try {
        const db = new DB();
        const wordsArray = words.split(" ");
        const findex = new Findex(db);
        let queryResults: string[] = [];
        if (!logicalSwitch) {
        queryResults = await findex.search(masterKeysFindex, wordsArray.map(word => sanitizeString(word)));
        } else {
        await Promise.all(wordsArray.map(async (word, index) => {
            const partialResults = await findex.search(masterKeysFindex, [word])
            if (index) {
            queryResults = queryResults.filter(location => partialResults.includes(location))
            } else {
            queryResults = [...partialResults]
            }
        }))
        }
        if (queryResults.length) {
        const res = await db.getEncryptedUsersById(queryResults);
        const policy = sessionStorage.getItem('policy');
        const masterPrivateKey = sessionStorage.getItem('coverCryptPrivateKey');
        let accessPolicy = "";
        if (res && res.length && policy && masterPrivateKey) {
            switch (role) {
            case "charlie":
                accessPolicy = "(country::France || country::Spain) && (department::HR || department::marketing)";
                break;
            case "alice":
                accessPolicy = "country::France && department::marketing";
                break;
            case "bob":
                accessPolicy = "country::Spain && (department::HR || department::marketing)";
            }
            const clearValues: Object[] = [];
            res.filter((item) => { return item !== null }).forEach((item) => {
            const encryptedKeys = Object.keys(item) as (keyof EncryptedValue)[];
            let encryptedUser = {}
            for (let index = 0; index < encryptedKeys.length; index++) {
                try {
                const itemKey = encryptedKeys[index + 1];
                const encryptedElement = hexDecode(item[itemKey]);
                const clearText = coverCryptDecrypt(hexDecode(policy), hexDecode(masterPrivateKey), accessPolicy, encryptedElement);
                if (clearText.length) {
                    encryptedUser = { ...encryptedUser, ...JSON.parse(clearText) }
                }
                }
                catch (e) {
                logger.log(() => "Unable to decrypt");
                }
            }
            if (Object.keys(encryptedUser).length !== 0) {
                clearValues.push(encryptedUser)
            }
            }
            );
            if (clearValues.length) {
            displayInTab(clearValues, content);
            } else {
            displayNoResult(content);
            }
        } else {
            displayNoResult(content);
        }
        } else {
        displayNoResult(content);
        }
    } catch {
        displayNoResult(content);
    }
}
(window as any).searchAndDecrypt = searchAndDecrypt

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
            const columns = document.createElement('div');
            columns.setAttribute('class', "item columns");
            const keys = Object.keys(item);
            for (const key of keys) {
            const column = document.createElement('div');
            column.setAttribute("class", "cell");
            column.innerHTML = key;
            columns.appendChild(column);
            }
            parent.appendChild(columns);
        }
        const line = document.createElement('div');
        line.setAttribute("class", "item");
        const values = Object.values(item);
        for (const value of values) {
            const cell = document.createElement('div');
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
 * @param parent HTML parent element to insert the line in
 * @returns void
 */
function displayNoResult(parent: HTMLElement) {
    const line = document.createElement('div');
    line.setAttribute("class", "item");
    line.innerHTML = "No results";
    parent.appendChild(line);
}

/**
 * Remove accents and uppercase to query word
 * @param str string to sanitize
 * @returns string initial string without accents and uppercase
 */
function sanitizeString(str: string): string {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\-]+/g, '-');
}

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
  const box = document.getElementById(id);
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
