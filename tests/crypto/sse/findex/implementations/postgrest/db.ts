import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Index } from "crypto/sse/findex/interfaces";
import { DBInterface } from "crypto/sse/findex/interfaces/dbInterface";
import {
  deserializeList,
  serializeHashMap,
  deserializeHashMap,
  hexEncode,
  hexDecode,
} from "utils/utils";
import { IndexString } from "../common/index_string";
import { Users } from "../common/users";

export interface EncryptedUser {
  uid: string;
  enc_basic: string;
  enc_hr: string;
  enc_security: string;
}
export class PostgRestDB implements DBInterface {
  users: Users = new Users();

  instance: AxiosInstance = axios.create({
    baseURL: process.env.SERVER,
    timeout: 15000,
  });

  responseBody = (response: AxiosResponse): any => response.data;

  //
  // Callbacks implementations
  //
  fetchEntry = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    console.time("fetchEntry");
    const uids = deserializeList(serializedUids);
    const result = await this.getEntryTableEntriesById(uids);
    let serialized = serializeHashMap(result);
    console.timeEnd("fetchEntry");
    return serialized;
  };

  fetchChain = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    console.time("fetchChain");
    const uids = deserializeList(serializedUids);
    const result = await this.getChainTableEntriesById(uids);
    let serialized = serializeHashMap(result);
    console.timeEnd("fetchChain");
    return serialized;
  };

  upsertEntry = async (serializedEntries: Uint8Array): Promise<number> => {
    console.time("upsertEntry");
    const items = deserializeHashMap(serializedEntries);
    await this.upsertEntryTableEntries(items);
    console.timeEnd("upsertEntry");
    return items.length;
  };

  upsertChain = async (serializedEntries: Uint8Array): Promise<number> => {
    console.time("upsertChain");
    const items = deserializeHashMap(serializedEntries);
    await this.upsertChainTableEntries(items);
    console.timeEnd("upsertChain");
    return items.length;
  };

  //
  // DBInterface implementation
  //
  async getEntryTableEntriesById(uids: Uint8Array[]): Promise<Index[]> {
    const uidsHex = uids.map((uid) => hexEncode(uid));
    const uidsAndValuesHex: IndexString[] = await this.instance
      .get(`/index_entry?uid=in.(${uidsHex.toString()})`)
      .then(this.responseBody);
    return uidsAndValuesHex.map(
      (element) => new Index(hexDecode(element.uid), hexDecode(element.value))
    );
  }

  async getChainTableEntriesById(uids: Uint8Array[]): Promise<Index[]> {
    const uidsHex = uids.map((uid) => hexEncode(uid));
    const uidsAndValuesHex: IndexString[] = await this.instance
      .get(`/index_chain?uid=in.(${uidsHex.toString()})`)
      .then(this.responseBody);
    return uidsAndValuesHex.map(
      (element) => new Index(hexDecode(element.uid), hexDecode(element.value))
    );
  }

  async upsertEntryTableEntries(entries: Index[]): Promise<number> {
    const uidsAndValuesHex = entries.map(
      (element) =>
        new IndexString(hexEncode(element.uid), hexEncode(element.value))
    );
    return await this.instance
      .post("/index_entry", uidsAndValuesHex)
      .then(this.responseBody);
  }

  async upsertChainTableEntries(entries: Index[]): Promise<number> {
    const uidsAndValuesHex = entries.map(
      (element) =>
        new IndexString(hexEncode(element.uid), hexEncode(element.value))
    );
    return await this.instance
      .post("/index_chain", uidsAndValuesHex)
      .then(this.responseBody);
  }

  //
  // Tests utilities
  //
  async getEntryTableEntries(): Promise<IndexString[]> {
    return await this.instance.get("/index_entry").then(this.responseBody);
  }

  async getChainTableEntries(): Promise<IndexString[]> {
    return await this.instance.get("/index_chain").then(this.responseBody);
  }

  async getEncryptedUsers(): Promise<EncryptedUser[]> {
    return await this.instance.get("/encrypted_users").then(this.responseBody);
  }

  async getEncryptedUsersById(uids: string[]): Promise<EncryptedUser[]> {
    return await this.instance
      .get(`/encrypted_users?uid=in.(${uids.toString()})`)
      .then(this.responseBody);
  }

  async getFirstEncryptedUsers(): Promise<EncryptedUser[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        Range: "0-4",
      },
    };
    return await this.instance
      .get("/encrypted_users?select=enc_basic,enc_hr,enc_security", config)
      .then(this.responseBody);
  }

  async upsertEncryptedUser(
    entry: EncryptedUser[],
  ): Promise<Array<{ uid: string; enc_uid: string }>> {
    const config = {
      headers: {
        Prefer: "return=representation",
      },
    };
    return await this.instance
      .post("/encrypted_users", entry, config)
      .then(this.responseBody);
  }

  async deleteAllEntryTableEntries(): Promise<number> {
    return await this.instance
      .delete("index_entry?uid=neq.null")
      .then(this.responseBody);
  }

  async deleteAllChainTableEntries(): Promise<number> {
    return await this.instance
      .delete("index_chain?uid=neq.null")
      .then(this.responseBody);
  }

  async deleteAllEncryptedUsers(): Promise<number> {
    return await this.instance
      .delete("encrypted_users?uid=neq.null")
      .then(this.responseBody);
  }
}
