import { Findex } from "crypto/sse/findex/interfaces/findex";
import { FindexMasterKey } from "crypto/sse/findex/interfaces/master_keys";
import { sanitizeString, toBase64 } from "utils/utils";
import { Users } from "./users";

/**
 * Findex class implementing callbacks using DbInterface and upsert and search functions
 *
 * @param db DB Interface, implementing the minimal DB requests for Findex algorithm
 */
export class FindexDemo extends Findex {
  /**
   * Reset all indexes and upsert new ones
   *
   * @param masterKeysFindex
   * @param label
   * @param users
   * @param location location string naming the key of location to index
   * @param useGraph if true, upsert the graph of the keywords
   */
  async upsertUsersIndexes(
    masterKeysFindex: FindexMasterKey,
    label: string,
    users: Users,
    location: string,
    useGraph: Boolean = false
  ): Promise<void> {
    const generatedUsers = users.getUsers();

    const locationAndWords: { [key: string]: string[] } = {};
    generatedUsers.map((user) => {
      let userId = user.id;
      if (location === "enc_uid") {
        userId = user.enc_uid;
      }
      if (userId.length > 0) {
        locationAndWords[toBase64("l" + userId)] = [
          toBase64(user.firstName),
          toBase64(user.lastName),
          toBase64(user.phone),
          toBase64(user.email),
          toBase64(user.country),
          toBase64(user.region),
          toBase64(user.employeeNumber),
          toBase64(user.security),
        ];
      } else {
        throw new Error("upsertUsersIndexes: userId cannot be null");
      }
    });
    await super.upsert(masterKeysFindex, Buffer.from(label), locationAndWords);

    if (useGraph) {
      const locationAndWords: { [key: string]: string[] } = {};
      generatedUsers.map((user) => {
        let userId = user.id;
        if (location === "enc_uid") {
          userId = user.enc_uid;
        }
        if (userId.length > 0) {
          locationAndWords[toBase64("l" + userId)] = [
            toBase64(user.country),
            toBase64(user.firstName),
            toBase64(user.lastName),
          ];
        } else {
          throw new Error("upsertUsersIndexes: userId cannot be null");
        }
      });
      await super.graph_upsert(
        masterKeysFindex,
        Buffer.from(label),
        locationAndWords
      );
    }
  }

  compareTwoArray(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  isArrayContains(myArray: Uint8Array[], element: Uint8Array): boolean {
    for (const e of myArray) {
      if (this.compareTwoArray(e, element)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Search terms with Findex implementation
   *
   * @param key_search
   * @param label
   * @param words string of all searched terms separated by a space character
   * @param logicalSwitch boolean to specify OR / AND search
   * @param loopIterationLimit
   * @param graphRecursionLimit
   * @param progress
   * @returns a promise containing results from query
   */
  async searchWithLogicalSwitch(
    key_search: Uint8Array,
    label: string,
    words: string,
    logicalSwitch: boolean,
    loopIterationLimit: number,
    graphRecursionLimit: number,
    progress: Function
  ): Promise<Uint8Array[]> {
    const wordsArray = words.split(" ");
    let indexedValues: Uint8Array[] = [];
    if (!logicalSwitch) {
      indexedValues = await super.search(
        key_search,
        Buffer.from(label),
        wordsArray.map((word) => sanitizeString(word)),
        loopIterationLimit,
        graphRecursionLimit,
        progress
      );
    } else {
      for (const [index, word] of wordsArray.entries()) {
        const partialIndexedValues = await super.search(
          key_search,
          Buffer.from(label),
          [sanitizeString(word)],
          loopIterationLimit,
          graphRecursionLimit,
          progress
        );

        if (index) {
          indexedValues = indexedValues.filter((location) =>
            this.isArrayContains(partialIndexedValues, location)
          );
        } else {
          indexedValues = [...partialIndexedValues];
        }
      }
    }

    // Remove the first character of an indexed value ('l')
    let locations: Uint8Array[] = [];
    for (const indexedValue of indexedValues) {
      locations = [...locations, indexedValue.slice(1)];
    }

    return locations;
  }
}
