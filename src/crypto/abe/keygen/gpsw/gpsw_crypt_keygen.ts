<<<<<<< HEAD
// /* tslint:disable:max-classes-per-file */
// import {
//   webassembly_generate_master_keys,
//   webassembly_generate_user_private_key,
//   webassembly_rotate_attributes
// } from "../../../../../wasm_lib/abe/gpsw/abe_gpsw"
// import { logger } from "../../../../utils/logger"
// import { fromBeBytes, hexDecode } from "../../../../utils/utils"
// import { AbeKeyGeneration, AbeMasterKey } from "../keygen"
// import { Policy } from "../../policy"
=======
/* tslint:disable:max-classes-per-file */
import {
  webassembly_generate_master_keys,
  webassembly_generate_user_private_key,
  webassembly_rotate_attributes
} from "../../../../../wasm_lib/abe/gpsw/abe_gpsw"
import { logger } from "../../../../utils/logger"
import { fromBeBytes, hexDecode } from "../../../../utils/utils"
import { AbeKeyGeneration, AbeMasterKey } from "../keygen"
import { Policy } from "../../policy"
>>>>>>> 5036a76 (progressing on policy ipl)

// export class GpswMasterKey extends AbeMasterKey {

// }

// export class GpswMasterKeyGeneration extends AbeKeyGeneration {
//   public generateMasterKey(policy: Policy): AbeMasterKey {
//     logger.log(() => "policy: " + policy)

//     const policyBytes = policy.toJsonEncoded()
//     const masterKeys = webassembly_generate_master_keys(policyBytes)
//     const privateKeySize = fromBeBytes(masterKeys.slice(0, 4))
//     logger.log(() => "private key size: " + privateKeySize)
//     return new AbeMasterKey(
//       masterKeys.slice(4, 4 + privateKeySize),
//       masterKeys.slice(4 + privateKeySize, masterKeys.length)
//     )
//   }

//   public generateUserPrivateKey(privateKey: Uint8Array, accessPolicy: string, policy: Policy): Uint8Array {
//     logger.log(() => "privateKey: " + privateKey)
//     logger.log(() => "accessPolicy: " + accessPolicy)
//     logger.log(() => "policy: " + policy)

//     const policyBytes = policy.toJsonEncoded()
//     const userPrivateKey = webassembly_generate_user_private_key(privateKey, accessPolicy, policyBytes)

//     return userPrivateKey
//   }



<<<<<<< HEAD
// }
=======
}
>>>>>>> 5036a76 (progressing on policy ipl)
