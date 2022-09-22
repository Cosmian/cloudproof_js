import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DBInterface } from '../../../interface/findex/dbInterface';
import { deserializeHashMap, deserializeList, hexDecode, hexEncode, serializeHashMap } from '../../../utils/utils';
import { Users } from '../users';

export class PostgRestDB implements DBInterface {
  users: Users = new Users();

  instance: AxiosInstance = axios.create({
    baseURL: process.env.SERVER,
    timeout: 15000,
  });

  responseBody = (response: AxiosResponse) => response.data;

  //
  // Callbacks implementations
  //
  fetchEntry = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids = deserializeList(serializedUids);
    const result = await this.getEntryTableEntriesById(uids);
    return serializeHashMap(result);
  }

  fetchChain = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids = deserializeList(serializedUids);
    const result = await this.getChainTableEntriesById(uids);
    return serializeHashMap(result);
  }

  upsertEntry = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries)
    await this.upsertEntryTableEntries(items);
    return items.length;
  }

  upsertChain = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries)
    await this.upsertChainTableEntries(items);
    return items.length;
  }

  //
  // DBInterface implementation
  //
  async getEntryTableEntriesById(uids: Uint8Array[]): Promise<{ uid: Uint8Array; value: Uint8Array; }[]> {
    const uidsHex = uids.map(uid => hexEncode(uid));
    const uidsAndValuesHex: { uid: string, value: string }[] = await this.instance.get(`/index_entry?uid=in.(${uidsHex})`).then(this.responseBody)
    const uidsAndValues: { uid: Uint8Array, value: Uint8Array }[] = [];
    uidsAndValuesHex.map(element => {
      uidsAndValues.push({ uid: hexDecode(element.uid), value: hexDecode(element.value) });
    });
    return uidsAndValues;
  }

  async getChainTableEntriesById(uids: Uint8Array[]): Promise<{ uid: Uint8Array; value: Uint8Array; }[]> {
    const uidsHex = uids.map(uid => hexEncode(uid));
    const uidsAndValuesHex: { uid: string, value: string }[] = await this.instance.get(`/index_chain?uid=in.(${uidsHex})`).then(this.responseBody)
    const uidsAndValues: { uid: Uint8Array, value: Uint8Array }[] = [];
    uidsAndValuesHex.map(element => {
      uidsAndValues.push({ uid: hexDecode(element.uid), value: hexDecode(element.value) });
    });
    return uidsAndValues;
  }

  async upsertEntryTableEntries(entries: { uid: Uint8Array, value: Uint8Array }[]): Promise<number> {
    const uidsAndValuesHex: { uid: string, value: string }[] = [];
    entries.map(element => {
      uidsAndValuesHex.push({ uid: hexEncode(element.uid), value: hexEncode(element.value) });
    });
    return this.instance.post(`/index_entry`, uidsAndValuesHex).then(this.responseBody)
  }

  async upsertChainTableEntries(entries: { uid: Uint8Array, value: Uint8Array }[]): Promise<number> {
    const uidsAndValuesHex: { uid: string, value: string }[] = [];
    entries.map(element => {
      uidsAndValuesHex.push({ uid: hexEncode(element.uid), value: hexEncode(element.value) });
    });
    return this.instance.post(`/index_chain`, uidsAndValuesHex).then(this.responseBody)
  }

  //
  // Tests utilities
  //
  async getEntryTableEntries(): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_entry`).then(this.responseBody)
  }

  async getChainTableEntries(): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_chain`).then(this.responseBody)
  }

  async getEncryptedUsers(): Promise<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }[]> {
    return this.instance.get("/encrypted_users").then(this.responseBody)
  }

  async getEncryptedUsersById(uids: string[]): Promise<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }[]> {
    return this.instance.get(`/encrypted_users?uid=in.(${uids})`).then(this.responseBody)
  }

  async getFirstEncryptedUsers(): Promise<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/encrypted_users?select=enc_basic,enc_hr,enc_security`, config).then(this.responseBody)
  }

  async upsertEncryptedUser(entry: { uid: string, enc_basic: string, enc_hr: string, enc_security: string }): Promise<{ uid: string, enc_uid: string }[]> {
    const config = {
      headers: {
        "Prefer": "return=representation"
      }
    };
    return this.instance.post(`/encrypted_users`, entry, config).then(this.responseBody)
  }

  async deleteAllEntryTableEntries(): Promise<number> {
    return this.instance.delete(`index_entry?uid=neq.null`).then(this.responseBody)
  }

  async deleteAllChainTableEntries(): Promise<number> {
    return this.instance.delete(`index_chain?uid=neq.null`).then(this.responseBody)
  }

  async deleteAllEncryptedUsers(): Promise<number> {
    return this.instance.delete(`encrypted_users?uid=neq.null`).then(this.responseBody)
  }
}
