import { webassembly_generate_master_keys, webassembly_generate_user_private_key } from "cover_crypt";
import { CoverCryptHybridDecryption } from "../../../crypto/abe/hybrid_crypto/cover_crypt/decryption";
import { CoverCryptHybridEncryption } from "../../../crypto/abe/hybrid_crypto/cover_crypt/encryption";
import { AbeMasterKey } from "../../../crypto/abe/keygen/keygen";
import { Policy } from "../../../crypto/abe/keygen/policy";
import { fromBeBytes, hexDecode } from "../../../utils/utils";

export function generateMasterKeys(policy: Policy): AbeMasterKey {
    const policyBytes: Uint8Array = policy.toJsonEncoded();

    const masterKeysBytes = webassembly_generate_master_keys(policyBytes);
    const privateKeySize = fromBeBytes(masterKeysBytes.slice(0, 4));

    const masterKeys = new AbeMasterKey(
        masterKeysBytes.slice(4, 4 + privateKeySize),
        masterKeysBytes.slice(4 + privateKeySize, masterKeysBytes.length)
    );
    return masterKeys;
}

export function coverCryptEncrypt(policy: Uint8Array, publicMasterKey: Uint8Array, uid: Uint8Array, attributes: string[], plainData: string) {
    const hybridCryptoEncrypt = new CoverCryptHybridEncryption(policy, publicMasterKey);

    const plainTextBytes = new TextEncoder().encode(plainData);

    const encryptedData= hybridCryptoEncrypt.encrypt(attributes, uid, plainTextBytes);

    hybridCryptoEncrypt.destroyInstance();
    return encryptedData;
}


export function coverCryptDecrypt(policy: Uint8Array, privateMasterKey: Uint8Array, accessPolicy: string, encryptedData: Uint8Array): string {
    const userPrivateKey = webassembly_generate_user_private_key(privateMasterKey, accessPolicy, policy)

    const hybridCryptoDecrypt = new CoverCryptHybridDecryption(userPrivateKey)
    try {
        const decryptedData = hybridCryptoDecrypt.decrypt(encryptedData)
        const plainData = new TextDecoder("utf-8").decode(decryptedData);
        hybridCryptoDecrypt.destroyInstance()
        return plainData
    } catch {
        hybridCryptoDecrypt.destroyInstance()
        return ""
    }
}
