import assert from "assert";
import { deserializeList } from "utils/utils";
import { FindexDemo } from "../../common/findex_demo";
import { FINDEX_MSK } from "../../common/keys";
import { Users } from "../../common/users";
import { RedisDB } from "../db";

const LABEL = "label";

test("upsert+search", async () => {
  const redisDb = new RedisDB("localhost", 6379);
  //
  // Upsert Indexes
  //
  try {
    await redisDb.initInstance();
    const findexDemo = new FindexDemo(redisDb);

    const users = new Users();
    expect(users.getUsers().length).toBe(99);

    await redisDb.instance.flushAll();
    await findexDemo.upsertUsersIndexes(FINDEX_MSK, LABEL, users, "id");

    const entries = await redisDb.getEntryTableEntries();
    const chains = await redisDb.getChainTableEntries();
    expect(entries.length).toBe(577);
    expect(chains.length).toBe(792);

    //
    // Search words
    //
    const queryResults = await findexDemo.searchWithLogicalSwitch(
      FINDEX_MSK.key,
      LABEL,
      "france",
      false,
      1000,
      1000,
      (_: Uint8Array) => {
        return true;
      }
    );
    expect(queryResults.length).toBe(30);
    await redisDb.instance.quit();
  } catch (error) {
    await redisDb.instance.quit();
    throw new Error("Redis test failed: " + error);
  }
});

test("upsert_graph+search", async () => {
  const redisDb = new RedisDB("localhost", 6379);
  //
  // Upsert Indexes
  //
  try {
    await redisDb.initInstance();
    const findexDemo = new FindexDemo(redisDb);

    const users = new Users();
    expect(users.getUsers().length).toBe(99);

    await redisDb.instance.flushAll();
    // upsert graphs of the country
    await findexDemo.upsertUsersIndexes(FINDEX_MSK, LABEL, users, "id", true);

    const entries = await redisDb.getEntryTableEntries();
    const chains = await redisDb.getChainTableEntries();
    expect(entries.length).toBe(1071);
    expect(chains.length).toBe(1610);

    //
    // Search words
    //
    const franceQueryResults = await findexDemo.searchWithLogicalSwitch(
      FINDEX_MSK.key,
      LABEL,
      "fra",
      false,
      1000,
      1000,
      (_: Uint8Array[]) => {
        return true;
      }
    );
    expect(franceQueryResults.length).toBe(30);
    let counter = 0;
    const queryResults = await findexDemo.searchWithLogicalSwitch(
      FINDEX_MSK.key,
      LABEL,
      "fel",
      false,
      1000,
      1000,
      (serialized_results: Uint8Array) => {
        const res = deserializeList(serialized_results);
        if (res.length != 0) {
          counter += res.length;
          const decoded_res = res.map((e) => new TextDecoder().decode(e));
          console.log(decoded_res);
        }
        return true;
      }
    );
    // There is 3 "Felix"
    assert(
      counter == 3,
      "Wrong intermediate result size: " + counter + " should be 3"
    );
    // There also one "Felicia" (is not returned as intermediate result since
    // it is found in the last recursion level)
    expect(queryResults.length).toBe(4);
    await redisDb.instance.quit();
  } catch (error) {
    await redisDb.instance.quit();
    throw new Error("Redis test failed: " + error);
  }
});
