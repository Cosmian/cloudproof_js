import { CoverCrypt, hexEncode, hexDecode } from "cloudproof_js"

(async () => {
    // Right now, `cloudproof_js` doesn't support decrypting with a KMS
    // const useKms = process.argv.includes('--kms');
    const useKms = false;

    const userKeyBytesIndex = process.argv.indexOf('--userKeyBytesHexEncoded') + 1;
    const userKeyBytes = hexDecode(process.argv[userKeyBytesIndex])

    // const userKeyUIDIndex = process.argv.indexOf('--userKeyUID') + 1;
    // const userKeyUID = process.argv[userKeyUIDIndex]

    const encryptedDataHexEncodedIndex = process.argv.indexOf('--encryptedDataHexEncoded') + 1;
    const encryptedData = hexDecode(process.argv[encryptedDataHexEncodedIndex])

    let decryptedData
    if (useKms) {
        // TODO
    } else {
        const { CoverCryptHybridDecryption } = await CoverCrypt();

        const encryption = new CoverCryptHybridDecryption(userKeyBytes);

        decryptedData = encryption.decrypt(encryptedData);
    }

    process.stdout.write(hexEncode(decryptedData))
})()