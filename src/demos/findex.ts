import { AbeMasterKey } from "../crypto/abe/keygen/keygen";
import { Policy, PolicyAxis } from "../crypto/abe/keygen/policy";
import { generateMasterKeys, coverCryptEncrypt, coverCryptDecrypt } from "../interface/cover_crypt/cover_crypt";
import { Findex } from "../interface/findex/findex";
import { DB } from "../site/demo_db";
import { masterKeysFindex } from "../site/demo_keys";
import { logger } from "../utils/logger";
import { hexDecode, hexEncode, sanitizeString } from "../utils/utils";

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

  async encryptUsers(metadataUid: string) {
    const policyBytes = this._policy.toJsonEncoded();

    const elements = await this._db.getUsers();
    for (const element of elements) {
      const encryptedBasic = coverCryptEncrypt(
        policyBytes,
        this._masterKeysCoverCrypt.publicKey,
        metadataUid,
        [`department::marketing`, `country::${element.country}`],
        JSON.stringify({
          firstName: element.firstName,
          lastName: element.lastName,
          country: element.country,
          region: element.region
        }))

      const encryptedHr = coverCryptEncrypt(
        policyBytes,
        this._masterKeysCoverCrypt.publicKey,
        metadataUid,
        [`department::HR`, `country::${element.country}`], JSON.stringify({
          email: element.email,
          phone: element.phone,
          employeeNumber: element.employeeNumber
        })
      )

      const encryptedSecurity = coverCryptEncrypt(
        policyBytes,
        this._masterKeysCoverCrypt.publicKey,
        metadataUid,
        [`department::security`, `country::${element.country}`], JSON.stringify({
          security: element.security
        }))

      const upsertedEncElement = await this._db.upsertEncryptedUser({
        enc_basic: hexEncode(encryptedBasic),
        enc_hr: hexEncode(encryptedHr),
        enc_security: hexEncode(encryptedSecurity)
      });

      await this._db.upsertUserEncUidById(element.id, { enc_uid: upsertedEncElement[0].uid });
    };

  }

  async resetAndUpsert(location: string) {
    await this._db.deleteAllChainTableEntries();
    await this._db.deleteAllEntryTableEntries();
    type Element = { [key: string]: string; };
    const elements: Element[] = await this._db.getUsers();
    const sanitizedElements: Element[] = elements.map((element) => {
      Object.keys(element).forEach((key) => {
        if (element[key]) {
          element[key] = sanitizeString(element[key])
        }
      });
      return element;
    })
    let locationAndWords = {};
    sanitizedElements.map((element) => {
      const elementId = element[location];
      delete element.id;
      delete element.enc_uid;
      locationAndWords = {
        ...locationAndWords,
        ...(elementId ? { [elementId]: [element.firstName, element.lastName, element.phone, element.email, element.country, element.region, element.employeeNumber, element.security] } : {})
      };
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
