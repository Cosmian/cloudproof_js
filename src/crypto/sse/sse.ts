/* tslint:disable:max-classes-per-file */
import { webassembly_unchain_entry_table_value, webassembly_aesgcm_decrypt, webassembly_hmac_sha256 } from "../../../wasm_lib/sse"

const UID_SIZE = 32
const AES_MAC_SIZE = 16
const AESGCM_NONCE_SIZE = 12
const CHAIN_ENCRYPTED_DATA_SIZE = UID_SIZE + AES_MAC_SIZE
const CHAIN_ENCRYPTED_DATA_AND_NONCE_SIZE = CHAIN_ENCRYPTED_DATA_SIZE + AESGCM_NONCE_SIZE

export class EntryTableUnchainedValue {
    private _kWord: Uint8Array
    private _chainTableUids: Uint8Array[]

    constructor(kWord: Uint8Array, chainTableUids: Uint8Array[]) {
        this._kWord = kWord
        this._chainTableUids = chainTableUids
    }

    public get kWord(): Uint8Array {
        return this._kWord
    }
    public set kWord(value: Uint8Array) {
        this._kWord = value
    }
    public get chainTableUids(): Uint8Array[] {
        return this._chainTableUids
    }
    public set chainTableUids(value: Uint8Array[]) {
        this._chainTableUids = value
    }

}

/**
 * This class exposes the simple/managed SSE primitives.
 *
 * Counters Management is done by the SSE Server
 */
 export class Sse {
  /**
   * Compute the table-1 UID from the word value
   *
   * @param k1 key to encrypt word
   * @param word string to encrypt
   * @returns table-1 UID
   */
  public static computeEntryTableUid(k1: Uint8Array, word: string): Uint8Array {
      return webassembly_hmac_sha256(k1, word)
  }

  /**
   * Search for entries in the index
   *
   * @param k2 key to encrypt word
   * @param word requested word
   * @param entryTableValue the encrypted value found in entry table corresponding to a entry table UID
   * @param loopIterationLimit number limiting the unchaining process
   * @returns a list of chain table uids
   */
  public static unchainEntryTableValue(word: string, k2: Uint8Array, entryTableValue: Uint8Array, loopIterationLimit: number): EntryTableUnchainedValue | null {
      if (entryTableValue) {
          // This function returns the decrypted `K_word` followed by the chain table UIDs
          const entryTableUnchainedValue = webassembly_unchain_entry_table_value(word, k2, entryTableValue, loopIterationLimit)
          // The following checks only works because decrypted `K_word` and chain table UIDs have the same size
          if ((entryTableUnchainedValue.length % UID_SIZE) !== 0) {
              throw new Error("Invalid size of unchain uids output. Should be a multiple of " + UID_SIZE)
          }

          const chainTableUids: Uint8Array[] = []
          for (let i = 0; i < entryTableUnchainedValue.length / UID_SIZE; i = i + 1) {
              const element = entryTableUnchainedValue.slice(i * UID_SIZE, (i + 1) * UID_SIZE)
              chainTableUids.push(element)
          }

          if (chainTableUids.length < 2) {
              throw new Error("Entry table unchained value should have at least 2 elements")
          }

          // Entry table unchained value contains:
          // - k_word
          // - the list of chain table UIDs
          const result = new EntryTableUnchainedValue(chainTableUids[0], chainTableUids.slice(1))
          return result
      }
      return null
  }

  /**
   * Decrypt database UIDs from a list of chain table encrypted values
   *
   * @param kWord the AES decryption key
   * @param chainTableValues the encrypted chain table values
   * @returns a list of database UIDs
   */
  public static getDatabaseUids(kWord: Uint8Array, chainTableValues: Uint8Array[]): Uint8Array[] {
      const databaseUids: Uint8Array[] = []
      for (const chainTableValue of chainTableValues) {
          if (chainTableValue.length !== CHAIN_ENCRYPTED_DATA_AND_NONCE_SIZE) {
              throw new Error("Invalid size of table 2 value. Should be " + CHAIN_ENCRYPTED_DATA_AND_NONCE_SIZE + " bytes")
          }
          const encData = chainTableValue.slice(0, CHAIN_ENCRYPTED_DATA_SIZE)
          const aesNonce = chainTableValue.slice(CHAIN_ENCRYPTED_DATA_SIZE, CHAIN_ENCRYPTED_DATA_AND_NONCE_SIZE)

          const databaseUid = webassembly_aesgcm_decrypt(kWord, aesNonce, encData)
          databaseUids.push(databaseUid)
      }

      return databaseUids
  }
}