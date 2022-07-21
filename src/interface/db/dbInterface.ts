import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface DBInterface {

  getEntryTableEntries(uids: string[]): Promise<{ uid: string; value: string; }[]>

  getChainTableEntries(uids: string[]): Promise<{ uid: string; value: string; }[]>

  upsertEntryTableEntries(entries: { uid: string; value: string; }[]): Promise<number>

  upsertChainTableEntries(entries: { uid: string; value: string; }[]): Promise<number>

  deleteAllEntryTableEntries(): Promise<number>

  deleteAllChainTableEntries(): Promise<number>
}

export class DB implements DBInterface {
  instance: AxiosInstance = axios.create({
    baseURL: process.env.SERVER,
    timeout: 15000,
  });

  responseBody = (response: AxiosResponse) => response.data;

  requests = {
    get: (url: string) => this.instance.get(url).then(this.responseBody),
    post: (url: string, content: { uid: string, value: string }[]) => this.instance.post(url, content).then(this.responseBody),
    delete: (url: string) => this.instance.delete(url).then(this.responseBody),
  };

  getEntryTableEntries(uids: string[]): Promise<{ uid: string; value: string; }[]> {
    return this.requests.get(`/index_entry?uid=in.(${uids})`)
  }

  getChainTableEntries(uids: string[]): Promise<{ uid: string; value: string; }[]> {
    return this.requests.get(`/index_chain?uid=in.(${uids})`)
  }

  getEncryptedDirectoryEntries(uids: string[]): Promise<{ uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }[]> {
    return this.requests.get(`/encrypted_directory?uid=in.(${uids})`)
  }

  getFirstEncryptedDirectoryEntries(): Promise<{ uid: string, Enc_K_base: string, Enc_K_rh: string, Enc_K_sec: string }[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/encrypted_directory`, config).then(this.responseBody)
  }

  getFirstUsers(): Promise<object[]> {
    const config = {
      headers: {
        "Range-Unit": "items",
        "Range": "0-4",
      }
    };
    return this.instance.get(`/users`, config).then(this.responseBody)
  }

  getUsers(): Promise<{ id: string, firstName: string, lastName: string, phone: string, email: string, country: string, region: string, employeeNumber: string, security: string }[]> {
    return this.instance.get(`/users`).then(this.responseBody)
  }

  getUsersById(uids: string[]): Promise<{ id: string, firstName: string, lastName: string, phone: string, email: string, country: string, region: string, employeeNumber: string, security: string }[]> {
    return this.requests.get(`/users?id=in.(${uids})`)
  }

  upsertEntryTableEntries(entries: { uid: string, value: string }[]): Promise<number> {
    return this.requests.post(`/index_entry`, entries);
  }

  upsertChainTableEntries(entries: { uid: string, value: string }[]): Promise<number> {
    return this.requests.post(`/index_chain`, entries);
  }

  deleteAllEntryTableEntries(): Promise<number> {
    return this.requests.delete(`index_entry?uid=neq.null`);
  }

  deleteAllChainTableEntries(): Promise<number> {
    return this.requests.delete(`index_chain?uid=neq.null`);
  }
}
