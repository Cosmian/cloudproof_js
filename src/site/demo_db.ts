import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DBInterface } from '../interface/findex/dbInterface';

export class DB implements DBInterface {
  instance: AxiosInstance = axios.create({
    baseURL: process.env.SERVER,
    timeout: 15000,
  });

  responseBody = (response: AxiosResponse) => response.data;

  getEntryTableEntries(): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_entry`).then(this.responseBody)
  }

  getEntryTableEntriesById(uids: string[]): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_entry?uid=in.(${uids})`).then(this.responseBody)
  }

  getChainTableEntriesById(uids: string[]): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_chain?uid=in.(${uids})`).then(this.responseBody)
  }

  getChainTableEntries(): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_chain`).then(this.responseBody)
  }

  getEncryptedUsers(): Promise<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }[]> {
    return this.instance.get("/encrypted_users").then(this.responseBody)
  }

  getEncryptedUsersById(uids: string[]): Promise<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }[]> {
    return this.instance.get(`/encrypted_users?uid=in.(${uids})`).then(this.responseBody)
  }

  getFirstEncryptedUsers(): Promise<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/encrypted_users?select=enc_basic,enc_hr,enc_security`, config).then(this.responseBody)
  }

  getUsers(): Promise<{ id: string, firstName: string, lastName: string, phone: string, email: string, country: string, region: string, employeeNumber: string, security: string }[]> {
    return this.instance.get(`/users`).then(this.responseBody)
  }

  getUsersById(uids: string[]): Promise<{ id: string, firstName: string, lastName: string, phone: string, email: string, country: string, region: string, employeeNumber: string, security: string }[]> {
    return this.instance.get(`/users?select=firstName,lastName,phone,email,country,region,employeeNumber,security&id=in.(${uids})`).then(this.responseBody)
  }

  getFirstUsers(): Promise<{ id: string, firstName: string, lastName: string, phone: string, email: string, country: string, region: string, employeeNumber: string, security: string }[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/users?select=firstName,lastName,phone,email,country,region,employeeNumber,security`, config).then(this.responseBody)
  }

  upsertEntryTableEntries(entries: { uid: string, value: string }[]): Promise<number> {
    return this.instance.post(`/index_entry`, entries).then(this.responseBody)
  }

  upsertChainTableEntries(entries: { uid: string, value: string }[]): Promise<number> {
    return this.instance.post(`/index_chain`, entries).then(this.responseBody)
  }

  upsertEncryptedUser(entry: { enc_basic: string, enc_hr: string, enc_security: string }): Promise<{ uid: string, enc_uid: string }[]> {
    const config = {
      headers: {
        "Prefer": "return=representation"
      }
    };
    return this.instance.post(`/encrypted_users`, entry, config).then(this.responseBody)
  }

  upsertUserEncUidById(id: string, encryptedUid: { enc_uid: string }): Promise<number> {
    return this.instance.patch(`/users?id=eq.${id}`, encryptedUid).then(this.responseBody)
  }

  deleteAllEntryTableEntries(): Promise<number> {
    return this.instance.delete(`index_entry?uid=neq.null`).then(this.responseBody)
  }

  deleteAllChainTableEntries(): Promise<number> {
    return this.instance.delete(`index_chain?uid=neq.null`).then(this.responseBody)
  }

  deleteAllEncryptedUsers(): Promise<number> {
    return this.instance.delete(`encrypted_users?uid=neq.null`).then(this.responseBody)
  }
}
