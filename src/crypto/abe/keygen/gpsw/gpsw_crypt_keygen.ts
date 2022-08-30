/* tslint:disable:max-classes-per-file */
import {
  webassembly_generate_master_keys,
  webassembly_generate_user_private_key,
  webassembly_rotate_attributes
} from "abe_gpsw"
import { logger } from "../../../../utils/logger"
import { fromBeBytes, hexDecode } from "../../../../utils/utils"
import { AbeKeyGeneration, AbeMasterKey } from "../keygen"
import { Policy } from "../policy"

export class GpswMasterKey extends AbeMasterKey {

}

export class GpswMasterKeyGeneration extends AbeKeyGeneration {
  public generateMasterKey(policy: Policy): AbeMasterKey {
    logger.log(() => "policy: " + policy)

    const policyBytes = policy.toJsonEncoded()
    const masterKeys = webassembly_generate_master_keys(policyBytes)
    const privateKeySize = fromBeBytes(masterKeys.slice(0, 4))
    logger.log(() => "private key size: " + privateKeySize)
    return new AbeMasterKey(
      masterKeys.slice(4, 4 + privateKeySize),
      masterKeys.slice(4 + privateKeySize, masterKeys.length)
    )
  }

  public generateUserPrivateKey(privateKey: Uint8Array, accessPolicy: string, policy: Policy): Uint8Array {
    logger.log(() => "privateKey: " + privateKey)
    logger.log(() => "accessPolicy: " + accessPolicy)
    logger.log(() => "policy: " + policy)

    const policyBytes = policy.toJsonEncoded()
    const userPrivateKey = webassembly_generate_user_private_key(privateKey, accessPolicy, policyBytes)

    return userPrivateKey
  }

  public rotateAttributes(attributes: string[], policy: Policy): Policy {
    logger.log(() => "attributes: " + attributes)
    logger.log(() => "policy: " + policy)

    const policyBytes = policy.toJsonEncoded()
    const attributesBytes = new TextEncoder().encode(JSON.stringify(attributes))
    const newPolicyBytes = webassembly_rotate_attributes(attributesBytes, policyBytes)

    const newPolicyString = new TextDecoder().decode(hexDecode(newPolicyBytes))
    return Policy.fromJsonEncoded(newPolicyString)
  }

}
