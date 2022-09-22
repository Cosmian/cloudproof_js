import axios from "axios";
import { masterKeysFindex } from "../../../../src/demos/findex/keys";
import { PostgRestDB } from "../../../../src/demos/findex/postgrest/db";
import { Users } from "../../../../src/demos/findex/users";
import { Findex } from "../../../../src/interface/findex/findex";

const LABEL = "label";

test('upsert+search', async () => {
    axios.defaults.baseURL = 'http://localhost:3000'
    const db = new PostgRestDB();
    const findexDemo = new Findex(db);

    const users = new Users();
    expect(users.getUsers().length).toBe(99)

    await db.deleteAllChainTableEntries();
    await db.deleteAllEntryTableEntries();
    await findexDemo.upsertUsersIndexes(masterKeysFindex, LABEL, users, "id");

    const entries = await db.getEntryTableEntries();
    const chains = await db.getChainTableEntries();
    expect(entries.length).toBe(577)
    expect(chains.length).toBe(792)

    //
    // Search words
    //
    let queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "france", false, 1000);
    expect(queryResults.length).toBe(30);

    queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "france spain", false, 1000);
    expect(queryResults.length).toBe(60);

    queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "Joelle Becker", false, 1000);
    expect(queryResults.length).toBe(1);

    queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "molly", false, 1000);
    expect(queryResults.length).toBe(1);

    queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "Joelle Becker", true, 1000);
    expect(queryResults.length).toBe(1);

    queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "spain france", true, 1000);
    expect(queryResults.length).toBe(0);


})
