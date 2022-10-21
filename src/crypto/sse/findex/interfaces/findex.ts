// import {
//   webassembly_search,
//   webassembly_graph_upsert,
//   webassembly_upsert,
// } from "cosmian_findex"
// import { deserializeList } from "../../../../utils/utils"
// import { DBInterface } from "./dbInterface"
// import { FindexMasterKey } from "./master_keys"

// /**
//  * Findex class implementing callbacks using DbInterface and upsert and search functions
//  *
//  * @param db DB Interface, implementing the minimal DB requests for Findex algorithm
//  */
// export class Findex {
//   private readonly _db: DBInterface

//   public get db(): DBInterface {
//     return this._db
//   }

//   constructor(db: DBInterface) {
//     this._db = db
//   }

//   /**
//    * This function is responsible of the Findex-indexes creation
//    *
//    * @param {FindexMasterKey} masterKeys containing K and K*
//    * @param {Uint8Array} label used to create all indexes and to refresh them later on
//    * @param locationAndWords correspondence between locations in database and words
//    * @returns {void} does not return anything if everything went well
//    */
//   public async upsert(
//     masterKeys: FindexMasterKey,
//     label: Uint8Array,
//     locationAndWords: { [key: string]: string[] }
//   ): Promise<void> {
//     try {
//       await webassembly_upsert(
//         JSON.stringify(masterKeys),
//         label,
//         JSON.stringify(locationAndWords),
//         this.db.fetchEntry,
//         this.db.upsertEntry,
//         this.db.upsertChain
//       )
//     } catch (e) {
//       console.log("Error upserting : ", e)
//       throw new Error(`Error upserting : ${e as string}`)
//     }
//   }

//   /**
//    * This function is the same as `upsert` but it will create letter-graphs for
//    * words of more than 3 letters. For example, for "robert" :
//    *
//    * "rob" -> "robe" -> "rober" -> "robert"
//    *
//    * Searching for "rob" with a `graphRecursionLimit` greater or equal to
//    * 3 will lead to the results associated to "robert".
//    *
//    * @param {FindexMasterKey} masterKeys containing K and K*
//    * @param {Uint8Array} label used to create all indexes and to refresh them later on
//    * @param locationAndWords correspondence between locations in database and words
//    * @returns {void} does not return anything if everything went well
//    */
//   public async graph_upsert(
//     masterKeys: FindexMasterKey,
//     label: Uint8Array,
//     locationAndWords: { [key: string]: string[] }
//   ): Promise<void> {
//     try {
//       await webassembly_graph_upsert(
//         JSON.stringify(masterKeys),
//         label,
//         JSON.stringify(locationAndWords),
//         this.db.fetchEntry,
//         this.db.upsertEntry,
//         this.db.upsertChain
//       )
//     } catch (e) {
//       console.log("Error upserting : ", e)
//       throw new Error(`Error upserting : ${e as string}`)
//     }
//   }

//   /**
//    *
//    * This function is used to search indexed words among Entry Table and Chain Table indexes
//    *
//    * @param {FindexMasterKey} masterKeys containing K and K*
//    * @param key_search
//    * @param {Uint8Array} label used to create all indexes and to refresh them later on
//    * @param {string[]} words a list of words
//    * @param {number} loopIterationLimit this number helps to limit the number of results in a search query when unchaining Index Table Entry item
//    * @param graphRecursionLimit
//    * @param progress
//    * @returns {Uint8Array[]} a list of Indexed Values
//    */
//   public async search(
//     key_search: Uint8Array,
//     label: Uint8Array,
//     words: string[],
//     loopIterationLimit: number,
//     graphRecursionLimit: number,
//     progress: Function
//   ): Promise<Uint8Array[]> {
//     try {
//       const serializedIndexedValues = await webassembly_search(
//         key_search,
//         label,
//         JSON.stringify(words),
//         loopIterationLimit,
//         graphRecursionLimit,
//         progress,
//         this.db.fetchEntry,
//         this.db.fetchChain
//       )
//       const indexedValues = deserializeList(serializedIndexedValues)
//       return indexedValues
//     } catch (e) {
//       console.log("Error searching : ", e)
//       throw new Error(`Error searching : ${e as string}`)
//     }
//   }
// }
