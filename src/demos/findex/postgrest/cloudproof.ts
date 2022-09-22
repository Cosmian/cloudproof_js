import { v4 as uuidv4 } from "uuid";
import { Policy } from "../../../crypto/abe/keygen/policy";
import { Findex } from "../../../interface/findex/findex";
import { logger } from "../../../utils/logger";
import { hexDecode, hexEncode } from "../../../utils/utils";
import { coverCryptDecrypt, coverCryptEncrypt } from "../../abe/cover_crypt/cover_crypt";
import { Users } from "../users";
import { PostgRestDB } from "./db";

export class CloudproofDemoPostgRest extends Findex {
  public postgrestDb: PostgRestDB;

  constructor(db: PostgRestDB) {
    super(db);
    this.postgrestDb = db;
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

      // Encrypt user contact information for the HR team of
      // the corresponding country
      const encryptedHr = coverCryptEncrypt(
        policyBytes,
        publicMasterKey,
        metadataUid,
        [`department::HR`, `country::${user.country}`], JSON.stringify({
          email: user.email,
          phone: user.phone,
          employeeNumber: user.employeeNumber
        })
      )

      // Encrypt the user security level for the security
      // team of the corresponding country
      const encryptedSecurity = coverCryptEncrypt(
        policyBytes,
        publicMasterKey,
        metadataUid,
        [`department::security`, `country::${user.country}`], JSON.stringify({
          security: user.security
        }))

      // Generate a new UID
      const uid = uuidv4();

      // Insert user encrypted data in the encrypted user DB
      await this.postgrestDb.upsertEncryptedUser({
        uid,
        enc_basic: hexEncode(encryptedBasic),
        enc_hr: hexEncode(encryptedHr),
        enc_security: hexEncode(encryptedSecurity),
      });

      // Update the cleartext user DB with the value of the
      // enc_uid
      users.upsertUserEncUidById(user.id, { enc_uid: uid });
    };
    return users;
  }

  async decryptUsers(queryUidsBytes: Uint8Array[], policy: Policy, privateMasterKey: Uint8Array, role: string): Promise<object[]> {
    type EncryptedValue = { uid: string, enc_basic: string, enc_hr: string, enc_security: string };

    const queryUids: string[] = []
    for (const uid of queryUidsBytes) {
      queryUids.push(new TextDecoder().decode(uid));
    }
    const encryptedUsers = await this.postgrestDb.getEncryptedUsersById(queryUids);
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
    const clearValues: object[] = [];
    encryptedUsers.filter((item) => { return item !== null }).forEach((item) => {
      const encryptedKeys = Object.keys(item) as (keyof EncryptedValue)[];
      let encryptedElement = {}
      for (let index = 0; index < encryptedKeys.length; index++) {
        try {
          const itemKey = encryptedKeys[index + 1];
          const encryptedText = hexDecode(item[itemKey]);
          const clearText = coverCryptDecrypt(
            policy.toJsonEncoded(),
            privateMasterKey,
            accessPolicy,
            encryptedText
          );
          if (clearText.length) {
            encryptedElement = { ...encryptedElement, ...JSON.parse(clearText) }
          }
        }
        catch (e) {
          logger.log(() => "Unable to decrypt");
        }
      }
      if (Object.keys(encryptedElement).length !== 0) {
        clearValues.push(encryptedElement)
      }
    });
    return clearValues;
  }
}
