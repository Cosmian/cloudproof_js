import { CoverCrypt, KmsClient, hexEncode } from "cloudproof_js"
import { policy } from './utils.mjs'

(async () => {
    const useKms = process.argv.includes('--kms');
    
    let publicKeyBytes;
    let privateKeyBytes;

    let publicKeyUID = null
    let privateKeyUID = null

    if (useKms) {
        const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))
        const keys = await client.createAbeMasterKeyPair(policy)

        privateKeyUID = keys[0];
        publicKeyUID = keys[1];

        publicKeyBytes = (await client.retrieveAbePublicMasterKey(publicKeyUID)).bytes()
        privateKeyBytes = (await client.retrieveAbePublicMasterKey(privateKeyUID)).bytes()
    } else {
        const { CoverCryptKeyGeneration } = await CoverCrypt();

        const generation = new CoverCryptKeyGeneration();

        const masterKeys = generation.generateMasterKeys(policy)
        publicKeyBytes = masterKeys.publicKey
        privateKeyBytes = masterKeys.secretKey
    }

    process.stdout.write(JSON.stringify({
        publicKeyBytesHexEncoded: hexEncode(publicKeyBytes),
        privateKeyBytesHexEncoded: hexEncode(privateKeyBytes),

        publicKeyUID,
        privateKeyUID,
    }))
})()