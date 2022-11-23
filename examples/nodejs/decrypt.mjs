import { CoverCrypt, KmsClient, hexEncode, hexDecode } from "cloudproof_js"

process.removeAllListeners('warning'); // To remove experimental fetch warnings

(async () => {
    const useKms = process.argv.includes('--kms');

    const userKeyBytesIndex = process.argv.indexOf('--userKeyBytesHexEncoded') + 1;
    const userKeyBytes = hexDecode(process.argv[userKeyBytesIndex])

    const userKeyAccessPolicyIndex = process.argv.indexOf('--userKeyAccessPolicy') + 1;
    const userKeyAccessPolicy = process.argv[userKeyAccessPolicyIndex]

    const userKeyUIDIndex = process.argv.indexOf('--userKeyUID') + 1;
    let userKeyUID = process.argv[userKeyUIDIndex]

    const encryptedDataHexEncodedIndex = process.argv.indexOf('--encryptedDataHexEncoded') + 1;
    const encryptedData = hexDecode(process.argv[encryptedDataHexEncodedIndex])

    let decryptedData
    if (useKms) {
        const client = new KmsClient(new URL("http://localhost:9998/kmip/2_1"))

        if (! userKeyUID) {
            const uniqueIdentifier = Math.random().toString(36).slice(2, 7);
            userKeyUID = await client.importAbeUserDecryptionKey(uniqueIdentifier, { bytes: userKeyBytes, policy: userKeyAccessPolicy });
        }

        decryptedData = await client.decrypt(userKeyUID, encryptedData)
    } else {
        const { CoverCryptHybridDecryption } = await CoverCrypt();

        const encryption = new CoverCryptHybridDecryption(userKeyBytes);

        decryptedData = encryption.decrypt(encryptedData);
    }

    process.stdout.write(hexEncode(decryptedData))
})()