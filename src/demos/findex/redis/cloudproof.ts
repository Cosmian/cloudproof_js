import { v4 as uuidv4 } from "uuid";
import { Policy } from "../../../crypto/abe/keygen/policy";
import { Findex } from "../../../interface/findex/findex";
import { logger } from "../../../utils/logger";
import { coverCryptEncrypt, coverCryptDecrypt } from "../../abe/cover_crypt/cover_crypt";
import { Users } from "../users";
import { RedisDB } from "./db";

export class CloudProofDemoRedis extends Findex {
  public redisDb: RedisDB;

  constructor(db: RedisDB) {
    super(db)
    this.redisDb = db;
    this.redisDb.initInstance();
  }

  /// Construct the encrypted users DB
  async encryptUsers(users: Users, metadataUid: Uint8Array, policy: Policy, publicMasterKey: Uint8Array): Promise<Users> {
    const policyBytes = policy.toJsonEncoded();
    // Get all user information from the cleartext user DB
    for (const user of users.getUsers()) {
      // Encrypt user personal data for the marketing team
      // of the corresponding country
      const encryptedBasic = coverCryptEncrypt(
        policyBytes,
        publicMasterKey,
        metadataUid,
        [`department::marketing`, `country::${user.country}`],
        JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          country: user.country,
          region: user.region
        }))

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

  async decryptUsers(queryResultsBytes: Uint8Array[], policy: Policy, privateMasterKey: Uint8Array, role: string): Promise<string[]> {
    const encryptedUsers = await this.redisDb.getEncryptedUsersById(queryResultsBytes);
    if (!encryptedUsers || !encryptedUsers.length) {
      return [];
    }

    let accessPolicy = "";
    switch (role) {
      case "charlie":
        accessPolicy = "(country::France || country::Spain) && (department::HR || department::marketing)";
        break;
      case "alice":
        accessPolicy = "country::France && department::marketing";
        break;
      case "bob":
        accessPolicy = "country::Spain && (department::HR || department::marketing)";
    }
    const clearValues: string[] = [];
    encryptedUsers.filter((item) => { return item !== null }).forEach((item) => {
      try {
        const clearText = coverCryptDecrypt(
          policy.toJsonEncoded(),
          privateMasterKey,
          accessPolicy,
          item.value);
        logger.log(() => "clearText: " + clearText);
        clearValues.push(clearText)
      }
      catch (e) {
        logger.log(() => "Unable to decrypt");
      }
    });
    return clearValues;
  }
}
