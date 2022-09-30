import axios from "axios";
import { FindexDemo } from "../../common/findex_demo";
import { FINDEX_MSK } from "../../common/keys";
import { Users } from "../../common/users";
import { PostgRestDB } from "../db";

const LABEL = "label";

test("upsert+search", async () => {
  axios.defaults.baseURL = "http://localhost:3000";
  const db = new PostgRestDB();
  const findexDemo = new FindexDemo(db);

  const users = new Users();
  expect(users.getUsers().length).toBe(99);

  await db.deleteAllChainTableEntries();
  await db.deleteAllEntryTableEntries();
  await findexDemo.upsertUsersIndexes(FINDEX_MSK, LABEL, users, "id");

  const entries = await db.getEntryTableEntries();
  const chains = await db.getChainTableEntries();
  expect(entries.length).toBe(577);
  expect(chains.length).toBe(792);

  const progress = (_: Uint8Array) => {
    // we don't use this callback here
    return true;
  };

  //
  // Search words
  //
  let queryResults = await findexDemo.searchWithLogicalSwitch(
    FINDEX_MSK.key,
    LABEL,
    "france",
    false,
    1000,
    1000,
    progress
  );
  expect(queryResults.length).toBe(30);

  queryResults = await findexDemo.searchWithLogicalSwitch(
    FINDEX_MSK.key,
    LABEL,
    "france spain",
    false,
    1000,
    1000,
    progress
  );
  expect(queryResults.length).toBe(60);

  queryResults = await findexDemo.searchWithLogicalSwitch(
    FINDEX_MSK.key,
    LABEL,
    "Joelle Becker",
    false,
    1000,
    1000,
    progress
  );
  expect(queryResults.length).toBe(1);

  queryResults = await findexDemo.searchWithLogicalSwitch(
    FINDEX_MSK.key,
    LABEL,
    "molly",
    false,
    1000,
    1000,
    progress
  );
  expect(queryResults.length).toBe(1);

  queryResults = await findexDemo.searchWithLogicalSwitch(
    FINDEX_MSK.key,
    LABEL,
    "Joelle Becker",
    true,
    1000,
    1000,
    progress
  );
  expect(queryResults.length).toBe(1);

  queryResults = await findexDemo.searchWithLogicalSwitch(
    FINDEX_MSK.key,
    LABEL,
    "spain france",
    true,
    1000,
    1000,
    progress
  );
  expect(queryResults.length).toBe(0);
});
