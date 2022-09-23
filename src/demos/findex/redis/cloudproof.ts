import { v4 as uuidv4 } from "uuid";
import { CoverCryptHybridDecryption } from "../../../crypto/abe/hybrid_crypto/cover_crypt/decryption";
import { CoverCryptHybridEncryption } from "../../../crypto/abe/hybrid_crypto/cover_crypt/encryption";
import { Policy } from "../../../crypto/abe/keygen/policy";
import { logger } from "../../../utils/logger";
import { FindexDemo } from "../findexDemo";
import { Users } from "../users";
import { RedisDB } from "./db";

export class CloudProofDemoRedis extends FindexDemo {
  public redisDb: RedisDB;

  constructor(db: RedisDB) {
    super(db)
    this.redisDb = db;
    this.redisDb.initInstance();
  }

  /// Construct the encrypted users DB
  async encryptUsers(users: Users, metadataUid: Uint8Array, policy: Policy, publicMasterKey: Uint8Array): Promise<Users> {
    const policyBytes = policy.toJsonEncoded();
    const hybridCryptoEncrypt = new CoverCryptHybridEncryption(policyBytes, publicMasterKey);
    // Get all user information from the cleartext user DB
    for (const user of users.getUsers()) {
      // Encrypt user personal data for the marketing team
      // of the corresponding country
      const encryptedBasic = hybridCryptoEncrypt.encrypt(
        [`department::marketing`, `country::${user.country}`],
        metadataUid,
        Buffer.from(JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          region: user.region
        }))
      );

      // Generate a new UID
      const uid = uuidv4();

      // Insert user encrypted data in the encrypted user DB
      await this.redisDb.upsertEncryptedUser(
        Buffer.from(uid),
        encryptedBasic,
      );

      // Update the cleartext user DB with the value of the
      // enc_uid
      users.upsertUserEncUidById(user.id, { enc_uid: uid });
    };
    return users;
  }

  async fetchAndDecryptUsers(locations: Uint8Array[], userDecryptionKey: Uint8Array): Promise<Uint8Array[]> {
    const encryptedUsers = await this.redisDb.getEncryptedUsersById(locations);

    if (!encryptedUsers || !encryptedUsers.length) {
      return [];
    }

    const hybridCryptoDecrypt = new CoverCryptHybridDecryption(userDecryptionKey)

    const clearValues: Uint8Array[] = [];
    encryptedUsers.filter((item) => { return item !== null }).forEach((item) => {
      try {
        const clearText = hybridCryptoDecrypt.decrypt(
          item.value
        );
        logger.log(() => "clearText: " + clearText);
        clearValues.push(clearText)
      }
      catch (e) {
        logger.log(() => "Unable to decrypt: " + e);
      }
    });
    return clearValues;
  }
}
