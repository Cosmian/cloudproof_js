import { CoverCrypt, KmsClient, hexEncode, hexDecode } from "cloudproof_js"
import { policy } from './utils.mjs'

process.removeAllListeners('warning'); // To remove experimental fetch warnings

(async () => {
  const useKms = process.argv.includes('--kms');
  
  const publicMasterKeyBytesIndex = process.argv.indexOf('--publicMasterKeyBytesHexEncoded') + 1;
  const publicMasterKeyBytes = hexDecode(process.argv[publicMasterKeyBytesIndex])
  
  const publicMasterKeyUIDIndex = process.argv.indexOf('--publicMasterKeyUID') + 1;
  let publicMasterKeyUID = process.argv[publicMasterKeyUIDIndex]
  
  const dataToEncryptIndex = process.argv.indexOf('--dataToEncrypt') + 1;
  const dataToEncrypt = (new TextEncoder).encode(process.argv[dataToEncryptIndex])
  
  const accessPolicyIndex = process.argv.indexOf('--accessPolicy') + 1;
  const accessPolicy = process.argv[accessPolicyIndex]
  
  let headerMetadata
  if (process.argv.includes('--header-metadata')) {
    const headerMetadataIndex = process.argv.indexOf('--header-metadata') + 1;
    headerMetadata = (new TextEncoder).encode(process.argv[headerMetadataIndex])
  }
  
  let authenticationData
  if (process.argv.includes('--authentication-data')) {
    const authenticationDataIndex = process.argv.indexOf('--authentication-data') + 1;
    authenticationData = (new TextEncoder).encode(process.argv[authenticationDataIndex])
  }
  
  let encryptedData
  if (useKms) {
    const client = new KmsClient(new URL(`http://${process.env.KMS_HOST || 'localhost'}:9998/kmip/2_1`))
    
    if (! publicMasterKeyUID) {
      const uniqueIdentifier = Math.random().toString(36).slice(2, 7);
      publicMasterKeyUID = await client.importCoverCryptPublicMasterKey(uniqueIdentifier, { bytes: publicMasterKeyBytes, policy });
    }
    
    encryptedData = await client.coverCryptEncrypt(publicMasterKeyUID, accessPolicy, dataToEncrypt, {
      headerMetadata,
      authenticationData,
    })
  } else {
    const { CoverCryptHybridEncryption } = await CoverCrypt();
    
    const encryption = new CoverCryptHybridEncryption(policy, publicMasterKeyBytes);
    
    encryptedData = encryption.encrypt(accessPolicy, dataToEncrypt, {
      headerMetadata,
      authenticationData,
    });
  }
  
  process.stdout.write(hexEncode(encryptedData));
})()