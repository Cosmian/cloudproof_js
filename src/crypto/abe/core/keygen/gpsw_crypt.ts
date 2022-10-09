/* tslint:disable:max-classes-per-file */
import {
  webassembly_generate_master_keys,
  webassembly_generate_user_private_key,
  webassembly_rotate_attributes,
} from "cosmian_abe_gpsw";
import { AbeKeyGeneration, AbeMasterKey } from "crypto/abe/interfaces/keygen";
import { Policy } from "crypto/abe/interfaces/policy";
import { logger } from "utils/logger";
import { fromBeBytes } from "utils/utils";

export class GpswMasterKey extends AbeMasterKey {}

export class GpswMasterKeyGeneration implements AbeKeyGeneration {
  public generateMasterKey(policy: Policy): AbeMasterKey {
    logger.log(() => `policy: ${policy.toJsonEncoded().toString()}`);

    const policyBytes = policy.toJsonEncoded();
    const masterKeys = webassembly_generate_master_keys(policyBytes);
    const privateKeySize = fromBeBytes(masterKeys.slice(0, 4));
    logger.log(() => `private key size: ${privateKeySize}`);
    return new AbeMasterKey(
      masterKeys.slice(4, 4 + privateKeySize),
      masterKeys.slice(4 + privateKeySize, masterKeys.length)
    );
  }

  public generateUserPrivateKey(
    privateKey: Uint8Array,
    accessPolicy: string,
    policy: Policy
  ): Uint8Array {
    logger.log(() => `privateKey: ${privateKey.toString()}`);
    logger.log(() => "accessPolicy: " + accessPolicy);
    logger.log(() => `policy: ${policy.toJsonEncoded().toString()}`);

    const policyBytes = policy.toJsonEncoded();
    const userPrivateKey = webassembly_generate_user_private_key(
      privateKey,
      accessPolicy,
      policyBytes
    );

    return userPrivateKey;
  }

  public rotateAttributes(attributes: string[], policy: Policy): Policy {
    logger.log(() => `attributes: ${attributes.toString()}`);
    logger.log(() => "policy: " + policy.toJsonEncoded().toString());

    const policyBytes = policy.toJsonEncoded();
    const attributesBytes = new TextEncoder().encode(
      JSON.stringify(attributes)
    );
    const newPolicyString = webassembly_rotate_attributes(
      attributesBytes,
      policyBytes
    );
    logger.log(() => "new policy: " + newPolicyString);

    return Policy.fromJsonEncoded(newPolicyString);
  }
}
