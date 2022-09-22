import { v4 as uuidv4 } from "uuid";
import { AbeMasterKey } from "../../../crypto/abe/keygen/keygen";
import { Policy, PolicyAxis } from "../../../crypto/abe/keygen/policy";
import { Findex } from "../../../interface/findex/findex";
import { logger } from "../../../utils/logger";
import { hexDecode, hexEncode, sanitizeString, toBase64 } from "../../../utils/utils";
import { coverCryptDecrypt, coverCryptEncrypt, generateMasterKeys } from "../../abe/cover_crypt/cover_crypt";
import { DB, User } from "./db";
import { masterKeysFindex } from "../keys";
import { USERS } from "./users";

export class FindexDemo {
  private _db: DB;
  private _policy: Policy;
  private _masterKeysCoverCrypt: AbeMasterKey;
  private _label: Uint8Array;

  constructor(db: DB, policyAxes: PolicyAxis[], maxAttributeCreations: number) {
    this._db = db;
    this._policy = new Policy(policyAxes, maxAttributeCreations)
    this._masterKeysCoverCrypt = generateMasterKeys(this._policy);
    this._label = new Uint8Array([1, 2, 3]);
  }

  public get db(): DB {
    return this._db;
  }

  public get policy(): Policy {
    return this._policy;
  }

  public get masterKeysCoverCrypt(): AbeMasterKey {
    return this._masterKeysCoverCrypt;
  }

  /// Construct the encrypted users DB
  async insertUsers() {
    const users: User[] = [];
    USERS.map((val: any) => {
      const user: User = {
        id: uuidv4(),
        firstName: val.firstName,
        lastName: val.lastName,
        region: val.region,
        country: val.country,
        employeeNumber: val.employeeNumber,
        email: val.email,
        phone: val.phone,
        security: val.security,
        enc_uid: "",
      }
      // create User objet here
      // this.db.insertUser(user);
      users.push(user)
    })
    // insert all users in database
    this.db.insertUsers(users);
  }

  /// Construct the encrypted users DB
  async encryptUsers(metadataUid: Uint8Array) {
    const policyBytes = this._policy.toJsonEncoded();
    // Get all user information from the cleartext user DB
    const users = await this._db.getUsers();
    for (const user of users) {
      // Encrypt user personal data for the marketing team
      // of the corresponding country
      const encryptedBasic = coverCryptEncrypt(
        policyBytes,
        this._masterKeysCoverCrypt.publicKey,
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
        this._masterKeysCoverCrypt.publicKey,
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
        this._masterKeysCoverCrypt.publicKey,
        metadataUid,
        [`department::security`, `country::${user.country}`], JSON.stringify({
          security: user.security
        }))

      // Generate a new UID
      const uid = uuidv4();

      // Insert user encrypted data in the encrypted user DB
      await this._db.upsertEncryptedUser({
        uid,
        enc_basic: hexEncode(encryptedBasic),
        enc_hr: hexEncode(encryptedHr),
        enc_security: hexEncode(encryptedSecurity),
      });

      // Update the cleartext user DB with the value of the
      // enc_uid
      await this._db.upsertUserEncUidById(user.id, { enc_uid: uid });
    };

  }

  /**
   * Reset all indexes and upsert new ones
   *
   * @param location location string naming the key of location to index
   */
  async resetAndUpsert(location: string) {
    await this._db.deleteAllChainTableEntries();
    await this._db.deleteAllEntryTableEntries();
    const users = await this._db.getUsers();
    const locationAndWords: { [key: string]: string[]; } = {};
    users.map((user) => {
      let userId = user.id;
      if (location === "enc_uid") {
        userId = user.enc_uid;
      }
      if (userId) {
        locationAndWords[toBase64('l' + userId)] = [
          toBase64(user.firstName),
          toBase64(user.lastName),
          toBase64(user.phone),
          toBase64(user.email),
          toBase64(user.country),
          toBase64(user.region),
          toBase64(user.employeeNumber),
          toBase64(user.security)]
      } else {
        throw new Error("resetAndUpsert: userId cannot be null")
      }
    });
    const findex = new Findex(this._db);
    await findex.upsert(masterKeysFindex, this._label, locationAndWords);
  }

  /**
   * Search terms with Findex implementation
   * @param words string of all searched terms separated by a space character
   * @param logicalSwitch boolean to specify OR / AND search
   * @returns a promise containing results from query
   */
  async search(words: string, logicalSwitch: boolean, loopIterationLimit: number): Promise<string[]> {
    const wordsArray = words.split(" ");
    const findex = new Findex(this._db);
    let queryResults: string[] = [];
    if (!logicalSwitch) {
      queryResults = await findex.search(masterKeysFindex, this._label, wordsArray.map(word => sanitizeString(word)), loopIterationLimit);
    } else {
      for (const [index, word] of wordsArray.entries()) {
        const partialResults = await findex.search(masterKeysFindex, this._label, [sanitizeString(word)], loopIterationLimit)
        if (index) {
          queryResults = queryResults.filter(location => partialResults.includes(location))
        } else {
          queryResults = [...partialResults]
        }
      }
    }
    return queryResults
  }

  async decryptUsers(queryResults: string[], role: string): Promise<object[]> {
    type EncryptedValue = { uid: string, enc_basic: string, enc_hr: string, enc_security: string };

    const encryptedUsers = await this._db.getEncryptedUsersById(queryResults);
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
          const clearText = coverCryptDecrypt(this._policy.toJsonEncoded(), this._masterKeysCoverCrypt.privateKey, accessPolicy, encryptedText);
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
