import { CoverCryptMasterKeyGeneration } from "crypto/abe/core/keygen/cover_crypt";
import { Policy, PolicyAxis } from "crypto/abe/interfaces/policy";

/**
 *
 */
export function generateCoverCryptKeys() {
  //
  // Declare arbitrary policy
  ///
  const abePolicy = new Policy(
    [
      new PolicyAxis("department", ["marketing", "HR", "security"], false),
      new PolicyAxis("country", ["France", "Spain", "Germany"], false),
    ],
    100
  );

  //
  // Key generation
  //
  const keygen = new CoverCryptMasterKeyGeneration();
  const masterKeysCoverCrypt = keygen.generateMasterKey(abePolicy);
  const alice = keygen.generateUserPrivateKey(
    masterKeysCoverCrypt.privateKey,
    "country::France && department::marketing",
    abePolicy
  );
  const bob = keygen.generateUserPrivateKey(
    masterKeysCoverCrypt.privateKey,
    "country::Spain && (department::HR || department::marketing)",
    abePolicy
  );
  const charlie = keygen.generateUserPrivateKey(
    masterKeysCoverCrypt.privateKey,
    "(country::France || country::Spain) && (department::HR || department::marketing)",
    abePolicy
  );
  return { alice, bob, charlie, masterKeysCoverCrypt, abePolicy };
}
