import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { DBInterface } from 'crypto/sse/findex/interfaces/dbInterface'
import { deserializeList, serializeHashMap, deserializeHashMap, hexEncode, hexDecode } from 'utils/utils'
import { Users } from '../common/users'

export class PostgRestDB implements DBInterface {
  users: Users = new Users()

  instance: AxiosInstance = axios.create({
    baseURL: process.env.SERVER,
    timeout: 15000
  })

  responseBody = (response: AxiosResponse) => response.data

  //
  // Callbacks implementations
  //
  fetchEntry = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids = deserializeList(serializedUids)
    const result = await this.getEntryTableEntriesById(uids)
    return serializeHashMap(result)
  }

  fetchChain = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids = deserializeList(serializedUids)
    const result = await this.getChainTableEntriesById(uids)
    return serializeHashMap(result)
  }

  upsertEntry = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries)
    await this.upsertEntryTableEntries(items)
    return items.length
  }

  upsertChain = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries)
    await this.upsertChainTableEntries(items)
    return items.length
  }

  //
  // DBInterface implementation
  //
  async getEntryTableEntriesById (uids: Uint8Array[]): Promise<Array<{ uid: Uint8Array, value: Uint8Array }>> {
    const uidsHex = uids.map(uid => hexEncode(uid))
    const uidsAndValuesHex: Array<{ uid: string, value: string }> = await this.instance.get(`/index_entry?uid=in.(${uidsHex})`).then(this.responseBody)
    const uidsAndValues: Array<{ uid: Uint8Array, value: Uint8Array }> = []
    uidsAndValuesHex.map(element => {
      uidsAndValues.push({ uid: hexDecode(element.uid), value: hexDecode(element.value) })
    })
    return uidsAndValues
  }

  async getChainTableEntriesById (uids: Uint8Array[]): Promise<Array<{ uid: Uint8Array, value: Uint8Array }>> {
    const uidsHex = uids.map(uid => hexEncode(uid))
    const uidsAndValuesHex: Array<{ uid: string, value: string }> = await this.instance.get(`/index_chain?uid=in.(${uidsHex})`).then(this.responseBody)
    const uidsAndValues: Array<{ uid: Uint8Array, value: Uint8Array }> = []
    uidsAndValuesHex.map(element => {
      uidsAndValues.push({ uid: hexDecode(element.uid), value: hexDecode(element.value) })
    })
    return uidsAndValues
  }

  async upsertEntryTableEntries (entries: Array<{ uid: Uint8Array, value: Uint8Array }>): Promise<number> {
    const uidsAndValuesHex: Array<{ uid: string, value: string }> = []
    entries.map(element => {
      uidsAndValuesHex.push({ uid: hexEncode(element.uid), value: hexEncode(element.value) })
    })
    return await this.instance.post('/index_entry', uidsAndValuesHex).then(this.responseBody)
  }

  async upsertChainTableEntries (entries: Array<{ uid: Uint8Array, value: Uint8Array }>): Promise<number> {
    const uidsAndValuesHex: Array<{ uid: string, value: string }> = []
    entries.map(element => {
      uidsAndValuesHex.push({ uid: hexEncode(element.uid), value: hexEncode(element.value) })
    })
    return await this.instance.post('/index_chain', uidsAndValuesHex).then(this.responseBody)
  }

  //
  // Tests utilities
  //
  async getEntryTableEntries (): Promise<Array<{ uid: string, value: string }>> {
    return await this.instance.get('/index_entry').then(this.responseBody)
  }

  async getChainTableEntries (): Promise<Array<{ uid: string, value: string }>> {
    return await this.instance.get('/index_chain').then(this.responseBody)
  }

  async getEncryptedUsers (): Promise<Array<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }>> {
    return await this.instance.get('/encrypted_users').then(this.responseBody)
  }

  async getEncryptedUsersById (uids: string[]): Promise<Array<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }>> {
    return await this.instance.get(`/encrypted_users?uid=in.(${uids})`).then(this.responseBody)
  }

  async getFirstEncryptedUsers (): Promise<Array<{ uid: string, enc_basic: string, enc_hr: string, enc_security: string }>> {
    const config = {
      headers: {
        'Range-Unit': 'items',
        Range: '0-4'
      }
    }
    return await this.instance.get('/encrypted_users?select=enc_basic,enc_hr,enc_security', config).then(this.responseBody)
  }

  async upsertEncryptedUser (entry: { uid: string, enc_basic: string, enc_hr: string, enc_security: string }): Promise<Array<{ uid: string, enc_uid: string }>> {
    const config = {
      headers: {
        Prefer: 'return=representation'
      }
    }
    return await this.instance.post('/encrypted_users', entry, config).then(this.responseBody)
  }

  async deleteAllEntryTableEntries (): Promise<number> {
    return await this.instance.delete('index_entry?uid=neq.null').then(this.responseBody)
  }

  async deleteAllChainTableEntries (): Promise<number> {
    return await this.instance.delete('index_chain?uid=neq.null').then(this.responseBody)
  }

  async deleteAllEncryptedUsers (): Promise<number> {
    return await this.instance.delete('encrypted_users?uid=neq.null').then(this.responseBody)
  }
}
