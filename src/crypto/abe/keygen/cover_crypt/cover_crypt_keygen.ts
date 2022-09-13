/* tslint:disable:max-classes-per-file */
import { webassembly_generate_master_keys, webassembly_generate_user_private_key, webassembly_rotate_attributes } from "cover_crypt"
import { fromBeBytes } from "../../../../utils/utils"
import { AbeKeyGeneration, AbeMasterKey } from "../keygen"
import { Policy } from "../policy"

export class CoverCryptMasterKey extends AbeMasterKey {

}

export class CoverCryptMasterKeyGeneration extends AbeKeyGeneration {
  public generateMasterKey(policy: Policy): AbeMasterKey {
    const policyBytes = policy.toJsonEncoded()
    const masterKeys = webassembly_generate_master_keys(policyBytes)
    const privateKeySize = fromBeBytes(masterKeys.slice(0, 4))
    return new AbeMasterKey(
      masterKeys.slice(4, 4 + privateKeySize),
      masterKeys.slice(4 + privateKeySize, masterKeys.length)
    )
  }

  public generateUserPrivateKey(privateKey: Uint8Array, accessPolicy: string, policy: Policy): Uint8Array {
    const policyBytes = policy.toJsonEncoded()
    const userPrivateKey = webassembly_generate_user_private_key(privateKey, accessPolicy, policyBytes)
    return userPrivateKey
  }

  public rotateAttributes(attributes: string[], policy: Policy): Policy {
    const policyBytes = policy.toJsonEncoded()
    const attributesBytes = new TextEncoder().encode(JSON.stringify(attributes))
    const newPolicyString = webassembly_rotate_attributes(attributesBytes, policyBytes)

    return Policy.fromJsonEncoded(newPolicyString)
  }

}
