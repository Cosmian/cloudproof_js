

import { hexDecode } from 'cloudproof_js';
import { spawn } from 'node:child_process'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url';

(async () => {
    const TEST_COUNT = process.argv[2];

    for (let index = 1; index <= TEST_COUNT; index++) {
        console.log(`Test ${index}/${TEST_COUNT}`);

        const masterKeys = JSON.parse(await run('generate_master_keys.mjs'))
    
        const encryptedDataHexEncoded = await run('encrypt.mjs', [
            '--publicMasterKeyBytesHexEncoded', masterKeys.publicKeyBytesHexEncoded,
            '--publicMasterKeyUID', masterKeys.publicKeyUID || '',
            '--dataToEncrypt', "Hello World",
            '--accessPolicy', "Department::HR && Security Level::Medium Secret",
        ])
    
        {
            // Medium Secret User Key should be able to decrypt
    
            const userKey = JSON.parse(await run('generate_user_key.mjs', [
                '--privateMasterKeyBytesHexEncoded', masterKeys.privateKeyBytesHexEncoded,
                '--privateMasterKeyUID', masterKeys.privateKeyUID || '',
                '--accessPolicy', "Department::HR && Security Level::Medium Secret",
            ]))
        
            const decryptedDataHexEncoded = await run('decrypt.mjs', [
                '--userKeyBytesHexEncoded', userKey.bytesHexEncoded,
                '--encryptedDataHexEncoded', encryptedDataHexEncoded,
                '--userKeyUID', userKey.uid || '',
            ])
        
            const decryptedData = (new TextDecoder).decode(hexDecode(decryptedDataHexEncoded));
            if (decryptedData !== "Hello World") {
                throw new Error(`Decrypted data should be "Hello World". "${decryptedData}" found.`);
            }
        }
    
        {
            // High Secret User Key should be able to decrypt
    
            const userKey = JSON.parse(await run('generate_user_key.mjs', [
                '--privateMasterKeyBytesHexEncoded', masterKeys.privateKeyBytesHexEncoded,
                '--privateMasterKeyUID', masterKeys.privateKeyUID || '',
                '--accessPolicy', "Department::HR && Security Level::High Secret",
            ]))
        
            const decryptedDataHexEncoded = await run('decrypt.mjs', [
                '--userKeyBytesHexEncoded', userKey.bytesHexEncoded,
                '--encryptedDataHexEncoded', encryptedDataHexEncoded,
                '--userKeyUID', userKey.uid || '',
            ])
        
            const decryptedData = (new TextDecoder).decode(hexDecode(decryptedDataHexEncoded));
            if (decryptedData !== "Hello World") {
                throw new Error(`Decrypted data should be "Hello World". "${decryptedData}" found.`);
            }
        }
    
        {
            // Low Secret User Key shouldn't be able to decrypt
    
            const userKey = JSON.parse(await run('generate_user_key.mjs', [
                '--privateMasterKeyBytesHexEncoded', masterKeys.privateKeyBytesHexEncoded,
                '--privateMasterKeyUID', masterKeys.privateKeyUID || '',
                '--accessPolicy', "Department::HR && Security Level::Low Secret",
            ]))
        
            const decryptedDataHexEncoded = await run('decrypt.mjs', [
                '--userKeyBytesHexEncoded', userKey.bytesHexEncoded,
                '--encryptedDataHexEncoded', encryptedDataHexEncoded,
                '--userKeyUID', userKey.uid || '',
            ], true)
        
            const decryptedData = (new TextDecoder).decode(hexDecode(decryptedDataHexEncoded));
            if (decryptedData !== "") {
                throw new Error(`Shouldn't be able to decrypt. "${decryptedData}" received`);
            }
        }
    }
})()

/**
 * Run a sub-script to do one task
 * 
 * @param filename name of the file to run
 * @param args additional arguments
 * @param shouldCrash return empty string if the program crash and shouldCrash is true
 */
async function run(filename, args = [], shouldCrash = false) {
    args = [path.join(dirname(fileURLToPath(import.meta.url)), filename), ...args];

    if (Math.random() < 0.5) {
        args.push('--kms')
    }

    const process = spawn('node', args);
    
    let result = null

    process.stdout.on('data', (data) => {
        if (shouldCrash) {
            throw Error(`${filename} should crash but ${data} received.`)
        } else {
            result = (new TextDecoder).decode(data)
        }
    });
    process.stderr.on('data', (data) => {
        if (shouldCrash) {
            result = ''
        } else {
            throw new Error(`Error while running ${filename}: ${data}`);
        }
    });

    while(true) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (result !== null) return result
    }
}

// import { CoverCrypt, KmsClient, Policy, PolicyAxis } from "cloudproof_js"

// const assert = (x, y) => {
//   if (new TextDecoder().decode(x) !== new TextDecoder().decode(y))
//     throw new Error("Items MUST be equal (left: " + x + " right: " + y + ")")
// }

// //
// // Creating a policy
// //
// const policy = new Policy([
//   new PolicyAxis("Department", ["R&D", "HR", "FIN", "MKG"], false),
//   new PolicyAxis(
//     "Security Level",
//     ["Protected", "Low Secret", "Medium Secret", "High Secret", "Top Secret"],
//     true,
//   ),
// ])

// ;(async () => {
//   const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))

//   //
//   // Generating the master keys
//   //
//   // create master keys
//   const [privateMasterKeyUID, publicKeyUID] =
//     await client.createAbeMasterKeyPair(policy)

//   // fetch the keys from the KMS
//   const privateMasterKey = await client.retrieveAbePrivateMasterKey(
//     privateMasterKeyUID,
//   )
//   // eslint-disable-next-line no-unused-vars
//   const privateMasterKeyBytes = privateMasterKey.bytes()
//   const publicKey = await client.retrieveAbePublicMasterKey(publicKeyUID)
//   const publicKeyBytes = publicKey.bytes()

//   //
//   // Encrypting Data
//   //
//   const { CoverCryptHybridDecryption, CoverCryptHybridEncryption } =
//     await CoverCrypt()

//   // a low secret marketing message
//   const lowSecretMkgData = new TextEncoder().encode("low_secret_mkg_message")
//   // The constructor also accepts the public key object returned by the KMS
//   let encrypter = new CoverCryptHybridEncryption(policy, publicKeyBytes)
//   const lowSecretMkgCiphertext = encrypter.encrypt(
//     "Department::MKG && Security Level::Low Secret",
//     lowSecretMkgData,
//   )

//   // a top secret marketing message
//   const topSecretMkgData = new TextEncoder().encode("top_secret_mkg_message")
//   encrypter = new CoverCryptHybridEncryption(policy, publicKeyBytes)
//   const topSecretMkgCiphertext = encrypter.encrypt(
//     "Department::MKG && Security Level::Top Secret",
//     topSecretMkgData,
//   )

//   // a low secret finance message
//   const lowSecretFinData = new TextEncoder().encode("low_secret_fin_message")
//   encrypter = new CoverCryptHybridEncryption(policy, publicKeyBytes)
//   const lowSecretFinCiphertext = encrypter.encrypt(
//     "Department::FIN && Security Level::Low Secret",
//     lowSecretFinData,
//   )

//   //
//   // Generating User Decryption Keys
//   //
//   // the medium secret marketing user
//   const mediumSecretMkgAccess =
//     "Department::MKG && Security Level::Medium Secret"
//   const mediumSecretMkgUserKeyUid = await client.createAbeUserDecryptionKey(
//     mediumSecretMkgAccess,
//     privateMasterKeyUID,
//     )
//   const mediumSecretMkgUserKey = await client.retrieveAbeUserDecryptionKey(
//     mediumSecretMkgUserKeyUid,
//   )
//   const mediumSecretMkgUserKeyBytes = mediumSecretMkgUserKey.bytes()

//   // the top secret marketing financial user
//   const topSecretMkgFinAccess =
//     "(Department::MKG || Department::FIN) && Security Level::Top Secret"
//   const topSecretMkgFinUserKeyUid = await client.createAbeUserDecryptionKey(
//     topSecretMkgFinAccess,
//     privateMasterKeyUID,
//   )
//   const topSecretMkgFinUserKey = await client.retrieveAbeUserDecryptionKey(
//     topSecretMkgFinUserKeyUid,
//   )
//   const topSecretMkgFinUserKeyBytes = topSecretMkgFinUserKey.bytes()

//   // the top secret financial user
//   const topSecretFinAccess = "(Department::FIN) && Security Level::Top Secret"
//   const topSecretFinUserKeyUid = await client.createAbeUserDecryptionKey(
//     topSecretFinAccess,
//     privateMasterKeyUID,
//   )
//   const topSecretFinUserKey = await client.retrieveAbeUserDecryptionKey(
//     topSecretFinUserKeyUid,
//   )
//   // eslint-disable-next-line no-unused-vars
//   const topSecretFinUserKeyBytes = topSecretFinUserKey.bytes()

//   //
//   // Decrypting Ciphertexts
//   //
//   //  note: the constructor also accepts the private key object returned by the KMS
//   const lowSecretMkgCleartext = new CoverCryptHybridDecryption(
//     mediumSecretMkgUserKeyBytes,
//   ).decrypt(lowSecretMkgCiphertext)
//   assert(lowSecretMkgCleartext, lowSecretMkgData)

//   // .. however it can neither decrypt a marketing message with higher security:
//   try {
//     // will throw
//     new CoverCryptHybridDecryption(mediumSecretMkgUserKey).decrypt(
//       topSecretMkgCiphertext,
//     )
//   } catch (error) {
//     // ==> the user is not be able to decrypt
//   }

//   // ... nor decrypt a message from another department even with a lower security:
//   try {
//     // will throw
//     new CoverCryptHybridDecryption(topSecretFinUserKey).decrypt(
//       lowSecretMkgCiphertext,
//     )
//   } catch (error) {
//     // ==> the user is not be able to decrypt
//   }

//   // lowSecretMkgCiphertext
//   const lowSecretMkgCleartext2 = new CoverCryptHybridDecryption(
//     topSecretMkgFinUserKeyBytes,
//   ).decrypt(lowSecretMkgCiphertext)
//   assert(lowSecretMkgData, lowSecretMkgCleartext2)

//   // lowSecretFinCiphertext
//   const topSecretMkgCleartext = new CoverCryptHybridDecryption(
//     topSecretMkgFinUserKeyBytes,
//   ).decrypt(topSecretMkgCiphertext)
//   assert(topSecretMkgData, topSecretMkgCleartext)

//   // lowSecretFinCiphertext
//   const lowSecretFinCleartext = new CoverCryptHybridDecryption(
//     topSecretMkgFinUserKeyBytes,
//   ).decrypt(lowSecretFinCiphertext)
//   assert(lowSecretFinData, lowSecretFinCleartext)

//   //
//   // Rotating Attributes
//   //
//   // retrieve the key
//   const originalMediumSecretMkgUserKey =
//     await client.retrieveAbeUserDecryptionKey(mediumSecretMkgUserKeyUid)

//   // Now revoke the MKG attribute - all active keys will be rekeyed
//   client.rotateAbeAttributes(privateMasterKeyUID, ["Department::MKG"])

//   // retrieve the rekeyed public key
//   const rekeyedPublicKey = await client.retrieveAbePublicMasterKey(publicKeyUID)
//   // retrieve the rekeyed user decryption key
//   const rekeyedMediumSecretMkgUserKey =
//     await client.retrieveAbeUserDecryptionKey(mediumSecretMkgUserKeyUid)

//   //
//   // creating a new medium secret marketing message
//   //
//   const mediumSecretMkgData = new TextEncoder().encode(
//     "medium_secret_mkg_message",
//   )
//   encrypter = new CoverCryptHybridEncryption(policy, rekeyedPublicKey)
//   const newMediumSecretMkgCiphertext = encrypter.encrypt(
//     "Department::MKG && Security Level::Medium Secret",
//     mediumSecretMkgData,
//   )

//   //
//   // decrypting the messages with the rekeyed key
//   //
//   // lowSecretMkgCiphertext
//   const oldMediumSecretMkgCleartext = new CoverCryptHybridDecryption(
//     rekeyedMediumSecretMkgUserKey,
//   ).decrypt(lowSecretMkgCiphertext)
//   assert(lowSecretMkgData, oldMediumSecretMkgCleartext)

//   // newMediumSecretMkgCiphertext
//   const newMediumSecretMkgCleartext = new CoverCryptHybridDecryption(
//     rekeyedMediumSecretMkgUserKey,
//   ).decrypt(newMediumSecretMkgCiphertext)
//   assert(mediumSecretMkgData, newMediumSecretMkgCleartext)

//   //
//   // decrypting the messages with the NON rekeyed key
//   //
//   // lowSecretMkgCiphertext
//   const plaintext_ = new CoverCryptHybridDecryption(
//     originalMediumSecretMkgUserKey,
//   ).decrypt(lowSecretMkgCiphertext)
//   assert(lowSecretMkgData, plaintext_)

//   // newMediumSecretMkgCiphertext
//   try {
//     // will throw
//     new CoverCryptHybridDecryption(originalMediumSecretMkgUserKey).decrypt(
//       newMediumSecretMkgCiphertext,
//     )
//   } catch (error) {
//     // ==> the non rekeyed key cannot decrypt new message after rotation
//   }

//   console.log("Succeeded!")
// })()
