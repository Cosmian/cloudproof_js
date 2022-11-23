import { CoverCrypt, KmsClient, hexDecode, hexEncode } from "cloudproof_js"
import { policy } from './utils.mjs'

(async () => {
    const useKms = process.argv.includes('--kms');
    
    const accessPolicyIndex = process.argv.indexOf('--accessPolicy') + 1;
    const accessPolicy = process.argv[accessPolicyIndex]
    
    const privateMasterKeyBytesIndex = process.argv.indexOf('--privateMasterKeyBytesHexEncoded') + 1;
    const privateMasterKeyBytes = hexDecode(process.argv[privateMasterKeyBytesIndex])

    const privateMasterKeyUIDIndex = process.argv.indexOf('--privateMasterKeyUID') + 1;
    const privateMasterKeyUID = process.argv[privateMasterKeyUIDIndex]

    let userKeyUID = null;
    let userKeyBytes;

    if (useKms) {
        const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))

        if (! privateMasterKeyUID) {
            throw new Error("The API is really bad here: put unique identifier as optional, accept bytes instead of PrivateKey")
            // privateMasterKeyUID = await client.importAbePrivateMasterKey();
        }

        userKeyUID = await client.createAbeUserDecryptionKey(accessPolicy, privateMasterKeyUID)
        userKeyBytes = (await client.retrieveAbeUserDecryptionKey(userKeyUID)).bytes()
    } else {
        const { CoverCryptKeyGeneration } = await CoverCrypt();

        const generation = new CoverCryptKeyGeneration();
        userKeyBytes = generation.generateUserSecretKey(privateMasterKeyBytes, accessPolicy, policy)
    }

    process.stdout.write(JSON.stringify({
        uid: userKeyUID,
        bytesHexEncoded: hexEncode(userKeyBytes),
    }))
})()