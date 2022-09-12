import { AbeMasterKey } from "../../crypto/abe/keygen/keygen";
import { Policy, PolicyAxis } from "../../crypto/abe/keygen/policy";
import { generateMasterKeys, coverCryptEncrypt, coverCryptDecrypt } from "../abe/cover_crypt/cover_crypt";
import { Findex } from "../../interface/findex/findex";
import { DB, User } from "./demo_db";
import { masterKeysFindex } from "./demo_keys";
import { logger } from "../../utils/logger";
import { hexDecode, hexEncode, sanitizeString } from "../../utils/utils";

export class FindexDemo {
  private _db: DB;
  private _policy: Policy;
  private _masterKeysCoverCrypt: AbeMasterKey;

  constructor(db: DB, policyAxes: PolicyAxis[], maxAttributeCreations: number) {
    this._db = db;
    this._policy = new Policy(policyAxes, maxAttributeCreations)
    this._masterKeysCoverCrypt = generateMasterKeys(this._policy);
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

  async encryptUsers(metadataUid: Uint8Array) {
    const policyBytes = this._policy.toJsonEncoded();

    const users = await this._db.getUsers();
    for (const user of users) {
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

      const encryptedSecurity = coverCryptEncrypt(
        policyBytes,
        this._masterKeysCoverCrypt.publicKey,
        metadataUid,
        [`department::security`, `country::${user.country}`], JSON.stringify({
          security: user.security
        }))

      const upsertedEncElement = await this._db.upsertEncryptedUser({
        enc_basic: hexEncode(encryptedBasic),
        enc_hr: hexEncode(encryptedHr),
        enc_security: hexEncode(encryptedSecurity)
      });

      await this._db.upsertUserEncUidById(user.id, { enc_uid: upsertedEncElement[0].uid });
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
    const sanitizedElements = users.map((user) => {
      let key: keyof typeof user;
      for (key in user) {
        if (user[key]) {
          user[key] = sanitizeString(user[key])
        }
      }
      return user;
    })
    const locationAndWords: { [key: string]: string[]; } = {};
    sanitizedElements.map((user) => {
      let userId = user.id;
      if (location === "enc_uid") {
        userId = user.enc_uid;
      }
      if (userId) {
        locationAndWords[userId] = [
          user.firstName,
          user.lastName,
          user.phone,
          user.email,
          user.country,
          user.region,
          user.employeeNumber,
          user.security]
      } else {
        throw new Error("resetAndUpsert: userId cannot be null")
      }
    });
    const findex = new Findex(this._db);
    await findex.upsert(masterKeysFindex, locationAndWords);
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
      queryResults = await findex.search(masterKeysFindex, wordsArray.map(word => sanitizeString(word)), loopIterationLimit);
    } else {
      for (const [index, word] of wordsArray.entries()) {
        const partialResults = await findex.search(masterKeysFindex, [sanitizeString(word)], loopIterationLimit)
        if (index) {
          queryResults = queryResults.filter(location => partialResults.includes(location))
        } else {
          queryResults = [...partialResults]
        }
      }
    }
    return queryResults;
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
