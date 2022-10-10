import { Index } from "crypto/sse/findex/interfaces";
import { DBInterface } from "crypto/sse/findex/interfaces/dbInterface";
import { commandOptions, createClient, RedisClientType } from "redis";
import { logger } from "utils/logger";
import {
  deserializeHashMap,
  deserializeList,
  serializeHashMap,
  toBeBytes,
} from "utils/utils";

export class RedisDB implements DBInterface {
  instance: RedisClientType;

  constructor(localhost: string, port: number) {
    this.instance = createClient({
      socket: {
        host: localhost,
        port,
      },
    });

    this.instance.on("error", (err: string) =>
      logger.log(() => `Redis Client Error: ${err}`)
    );
  }

  async initInstance(): Promise<void> {
    return await this.instance.connect();
  }

  //
  // Callbacks implementations
  //
  fetchEntry = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids = deserializeList(serializedUids);
    const result = await this.getEntryTableEntriesById(uids);
    return serializeHashMap(result);
  };

  fetchChain = async (serializedUids: Uint8Array): Promise<Uint8Array> => {
    const uids = deserializeList(serializedUids);
    const result = await this.getChainTableEntriesById(uids);
    return serializeHashMap(result);
  };

  upsertEntry = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries);
    await this.upsertEntryTableEntries(items);
    return items.length;
  };

  upsertChain = async (serializedEntries: Uint8Array): Promise<number> => {
    const items = deserializeHashMap(serializedEntries);
    await this.upsertChainTableEntries(items);
    return items.length;
  };

  //
  // DBInterface implementation
  //
  async getIndexById(
    uids: Uint8Array[],
    redisPrefix: number
  ): Promise<Index[]> {
    const keys = uids.map((uid) => this.formatKey(redisPrefix, uid));
    logger.log(() => `getIndexById: keys:${keys.length}`);

    const responses = await this.instance.mGet(
      commandOptions({ returnBuffers: true }),
      keys
    );
    logger.log(
      () => `getIndexById: ${redisPrefix} responses: ${responses.length}`
    );
    const uidsAndValues: Index[] = [];
    if (uids.length !== responses.length) {
      throw new Error("uids length must be equal to responses length");
    }
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < uids.length; i++) {
      // logger.log(()=>"r: " + r);
      const uid = uids[i];
      const value = responses[i];
      if (value === null) {
        continue;
      }
      logger.log(() => `getIndexById: uid: ${uid.length}`);
      logger.log(() => `getIndexById: value:${value.length}`);
      uidsAndValues.push({
        uid,
        value,
      });
    }

    return uidsAndValues;
  }

  async getEntryTableEntriesById(uids: Uint8Array[]): Promise<Index[]> {
    return await this.getIndexById(uids, 1);
  }

  async getChainTableEntriesById(uids: Uint8Array[]): Promise<Index[]> {
    return await this.getIndexById(uids, 2);
  }

  async upsertIndex(entries: Index[], redisPrefix: number): Promise<number> {
    const keysAndValuesFlatten: Buffer[] = [];
    for await (const element of entries) {
      const key = this.formatKey(redisPrefix, element.uid);
      const value = Buffer.from(element.value);
      logger.log(() => `upsertIndex: ${redisPrefix}: value: ${value.length}`);
      keysAndValuesFlatten.push(key);
      keysAndValuesFlatten.push(value);
    }
    const inserted = await this.instance.mSet(keysAndValuesFlatten);
    return inserted.length;
  }

  async upsertEntryTableEntries(entries: Index[]): Promise<number> {
    return await this.upsertIndex(entries, 1);
  }

  async upsertChainTableEntries(entries: Index[]): Promise<number> {
    return await this.upsertIndex(entries, 2);
  }

  //
  // Tests utilities
  //
  formatKey(prefixNumber: number, uid: Uint8Array): Buffer {
    const prefixCosmianBytes = Buffer.from("cosmian");
    const numberBytes = toBeBytes(prefixNumber);

    const key = new Uint8Array(
      prefixCosmianBytes.byteLength + numberBytes.byteLength + uid.length
    );
    key.set(prefixCosmianBytes, 0);
    key.set(numberBytes, prefixCosmianBytes.byteLength);
    key.set(uid, prefixCosmianBytes.byteLength + numberBytes.byteLength);

    logger.log(() => `formatKey: key.length: ${key.length}`);
    return Buffer.from(key);
  }

  async upsertEncryptedUser(
    uid: Uint8Array,
    encryptedValue: Uint8Array
  ): Promise<void> {
    const key = this.formatKey(3, uid);
    const inserts = await this.instance.set(key, Buffer.from(encryptedValue));
    logger.log(() => "upsertEncryptedUser: inserts: " + inserts);
  }

  async getEncryptedUsersById(uids: Uint8Array[]): Promise<Index[]> {
    return await this.getIndexById(uids, 3);
  }

  async getAllIndexes(redisPrefix: number): Promise<Uint8Array[]> {
    const keysPrefix = this.formatKey(redisPrefix, Buffer.from("*"));

    const responses = await this.instance.keys(
      commandOptions({ returnBuffers: true }),
      keysPrefix
    );
    logger.log(() => `getAllIndexes: responses: ${responses.length}`);

    const result = responses
      .filter((element) => {
        return element != null;
      })
      .map((element) => Buffer.from(element));
    return result;
  }

  async getEntryTableEntries(): Promise<Uint8Array[]> {
    return await this.getAllIndexes(1);
  }

  async getChainTableEntries(): Promise<Uint8Array[]> {
    return await this.getAllIndexes(2);
  }

  async getFirstEncryptedUsers(): Promise<Uint8Array[]> {
    const allEncryptedUsers = await this.getAllIndexes(3);
    return allEncryptedUsers.slice(0, 4);
  }

  async getEncryptedUsers(): Promise<Uint8Array[]> {
    return await this.getAllIndexes(3);
  }

  async deleteAllEntryTableEntries(): Promise<number> {
    const entryTableEntries = await this.getEntryTableEntries();
    for await (const iet of entryTableEntries) {
      await this.instance.del(Buffer.from(iet));
    }
    return entryTableEntries.length;
  }

  async deleteAllChainTableEntries(): Promise<number> {
    const chainTableEntries = await this.getChainTableEntries();
    for await (const ict of chainTableEntries) {
      await this.instance.del(Buffer.from(ict));
    }
    return chainTableEntries.length;
  }

  async deleteAllEncryptedUsers(): Promise<number> {
    const encryptedUsers = await this.getChainTableEntries();
    for await (const encryptedUser of encryptedUsers) {
      await this.instance.del(Buffer.from(encryptedUser));
    }
    return encryptedUsers.length;
  }

  async getKeyValue(
    keyPrefix: number,
    keySuffix: number
  ): Promise<{ uid: Uint8Array; value: Uint8Array }> {
    const key = this.formatKey(keyPrefix, Uint8Array.from([keySuffix]));
    const response = await this.instance.get(
      commandOptions({ returnBuffers: true }),
      key
    );
    if (response == null) {
      throw new Error("unique response expected");
    }
    logger.log(() => `getKeyValue: ${keyPrefix} response: ${response.length}`);
    return { uid: key, value: Buffer.from(response) };
  }
}