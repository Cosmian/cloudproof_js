import { CoverCryptHybridDecryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/decryption";
import { CoverCryptHybridEncryption } from "crypto/abe/core/hybrid_crypto/cover_crypt/encryption";
import { Policy } from "crypto/abe/interfaces/policy";
import { logger } from "utils/logger";
import { hexEncode, hexDecode } from "utils/utils";
import { v4 as uuidv4 } from "uuid";
import { FindexDemo } from "../common/findex_demo";
import { Users } from "../common/users";
import { PostgRestDB } from "./db";

export class CloudproofDemoPostgRest extends FindexDemo {
  public postgrestDb: PostgRestDB;

  constructor(db: PostgRestDB) {
    super(db);
    this.postgrestDb = db;
  }

  /// Construct the encrypted users DB
  async encryptUsersPerCountryAndDepartment(
    users: Users,
    metadataUid: Uint8Array,
    policy: Policy,
    publicMasterKey: Uint8Array
  ): Promise<Users> {
    const policyBytes = policy.toJsonEncoded();
    const hybridCryptoEncrypt = new CoverCryptHybridEncryption(
      policyBytes,
      publicMasterKey
    );

    let usersToInsert = [];

    // Get all user information from the cleartext user DB
    for (const user of users.getUsers()) {
      // Encrypt user personal data for the marketing team
      // of the corresponding country
      const encryptedBasic = hybridCryptoEncrypt.encrypt(
        ["department::marketing", `country::${user.country}`],
        metadataUid,
        Buffer.from(
          JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            country: user.country,
            region: user.region,
          })
        )
      );

      // Encrypt user contact information for the HR team of
      // the corresponding country
      const encryptedHr = hybridCryptoEncrypt.encrypt(
        ["department::HR", `country::${user.country}`],
        metadataUid,
        Buffer.from(
          JSON.stringify({
            email: user.email,
            phone: user.phone,
            employeeNumber: user.employeeNumber,
          })
        )
      );

      // Encrypt the user security level for the security
      // team of the corresponding country
      const encryptedSecurity = hybridCryptoEncrypt.encrypt(
        ["department::security", `country::${user.country}`],
        metadataUid,
        Buffer.from(
          JSON.stringify({
            security: user.security,
          })
        )
      );

      // Generate a new UID
      const uid = uuidv4();

      usersToInsert.push({
        uid,
        enc_basic: hexEncode(encryptedBasic),
        enc_hr: hexEncode(encryptedHr),
        enc_security: hexEncode(encryptedSecurity),
      });


      // Update the cleartext user DB with the value of the
      // enc_uid
      users.upsertUserEncUidById(user.id, { enc_uid: uid });
    }

    // Insert user encrypted data in the encrypted user DB
    await this.postgrestDb.upsertEncryptedUser(usersToInsert);
    return users;
  }

  async fetchAndDecryptUsers(
    locations: Uint8Array[],
    userDecryptionKey: Uint8Array
  ): Promise<object[]> {
    interface EncryptedValue {
      uid: string;
      enc_basic: string;
      enc_hr: string;
      enc_security: string;
    }

    const queryUids: string[] = [];
    for (const uid of locations) {
      queryUids.push(new TextDecoder().decode(uid));
    }
    const encryptedUsers = await this.postgrestDb.getEncryptedUsersById(
      queryUids
    );
    if (!encryptedUsers || encryptedUsers.length === 0) {
      return [];
    }

    const hybridCryptoDecrypt = new CoverCryptHybridDecryption(
      userDecryptionKey
    );
    const clearValues: object[] = [];
    encryptedUsers
      .filter((item) => {
        return item !== null;
      })
      .forEach((item) => {
        const encryptedKeys = Object.keys(item) as Array<keyof EncryptedValue>;
        let encryptedElement = {};
        for (let index = 0; index < encryptedKeys.length; index++) {
          try {
            const itemKey = encryptedKeys[index + 1];
            const encryptedText = hexDecode(item[itemKey]);
            const clearText = hybridCryptoDecrypt.decrypt(encryptedText);
            if (clearText.length > 0) {
              encryptedElement = {
                ...encryptedElement,
                ...JSON.parse(new TextDecoder("utf-8").decode(clearText)),
              };
            }
          } catch (e) {
            logger.log(() => "Unable to decrypt");
          }
        }
        if (Object.keys(encryptedElement).length !== 0) {
          clearValues.push(encryptedElement);
        }
      });
    return clearValues;
  }
}
