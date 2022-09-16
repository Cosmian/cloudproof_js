import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DBInterface } from '../../interface/findex/dbInterface';

export interface User {
  id: string, firstName: string, lastName: string, phone: string, email: string, country: string, region: string, employeeNumber: string, security: string, enc_uid: string
}

export class DB implements DBInterface {
  instance: AxiosInstance = axios.create({
    baseURL: process.env.SERVER,
    timeout: 15000,
  });

  responseBody = (response: AxiosResponse) => response.data;

  async insertUser(user: User): Promise<{uid: String, value: String}> {
    	return this.instance.post(`/users`, user).then(this.responseBody)
  }

  async getEntryTableEntries(): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_entry`).then(this.responseBody)
  }

  async getEntryTableEntriesById(uids: string[]): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_entry?uid=in.(${uids})`).then(this.responseBody)
  }

  async getChainTableEntriesById(uids: string[]): Promise<{ uid: string; value: string; }[]> {
    return this.instance.get(`/index_chain?uid=in.(${uids})`).then(this.responseBody)
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

  async getUsers(): Promise<User[]> {
    return this.instance.get(`/users`).then(this.responseBody)
  }

  async getUsersById(uids: string[]): Promise<User[]> {
    return this.instance.get(`/users?select=firstName,lastName,phone,email,country,region,employeeNumber,security&id=in.(${uids})`).then(this.responseBody)
  }

  async getFirstUsers(): Promise<User[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/users?select=firstName,lastName,phone,email,country,region,employeeNumber,security`, config).then(this.responseBody)
  }

  async upsertEntryTableEntries(entries: { uid: string, value: string }[]): Promise<number> {
    return this.instance.post(`/index_entry`, entries).then(this.responseBody)
  }

  async upsertChainTableEntries(entries: { uid: string, value: string }[]): Promise<number> {
    return this.instance.post(`/index_chain`, entries).then(this.responseBody)
  }

  async upsertEncryptedUser(entry: { uid: string, enc_basic: string, enc_hr: string, enc_security: string }): Promise<{ uid: string, enc_uid: string }[]> {
    const config = {
      headers: {
        "Prefer": "return=representation"
      }
    };
    return this.instance.post(`/encrypted_users`, entry, config).then(this.responseBody)
  }

  async upsertUserEncUidById(id: string, encryptedUid: { enc_uid: string }): Promise<number> {
    return this.instance.patch(`/users?id=eq.${id}`, encryptedUid).then(this.responseBody)
  }

  async deleteAllEntryTableEntries(): Promise<number> {
    return this.instance.delete(`index_entry?uid=neq.null`).then(this.responseBody)
  }

  async deleteAllChainTableEntries(): Promise<number> {
    return this.instance.delete(`index_chain?uid=neq.null`).then(this.responseBody)
  }

  async deleteAllUsers(): Promise<number> {
    return this.instance.delete(`users?id=neq.null`).then(this.responseBody)
  }

  async deleteAllEncryptedUsers(): Promise<number> {
    return this.instance.delete(`encrypted_users?uid=neq.null`).then(this.responseBody)
  }
}
