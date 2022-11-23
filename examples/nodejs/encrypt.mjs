import { CoverCrypt, hexEncode, hexDecode } from "cloudproof_js"
import { policy } from './utils.mjs'

process.removeAllListeners('warning'); // To remove experimental fetch warnings

(async () => {
    // Right now, `cloudproof_js` doesn't support encrypting with a KMS
    // const useKms = process.argv.includes('--kms');
    const useKms = false;

    const publicMasterKeyBytesIndex = process.argv.indexOf('--publicMasterKeyBytesHexEncoded') + 1;
    const publicMasterKeyBytes = hexDecode(process.argv[publicMasterKeyBytesIndex])

    const dataToEncryptIndex = process.argv.indexOf('--dataToEncrypt') + 1;
    const dataToEncrypt = (new TextEncoder).encode(process.argv[dataToEncryptIndex])

    const accessPolicyIndex = process.argv.indexOf('--accessPolicy') + 1;
    const accessPolicy = process.argv[accessPolicyIndex]

    let encryptedData
    if (useKms) {
        // TODO
    } else {
        const { CoverCryptHybridEncryption } = await CoverCrypt();

        const encryption = new CoverCryptHybridEncryption(policy, publicMasterKeyBytes);

        encryptedData = encryption.encrypt(accessPolicy, dataToEncrypt);
    }

    process.stdout.write(hexEncode(encryptedData));
})()