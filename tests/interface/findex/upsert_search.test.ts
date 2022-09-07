import axios from "axios";
import { logger } from "../../../src/utils/logger";
import { DB } from "../../../src/site/demo_db";
import { Policy, PolicyAxis } from "../../../src/crypto/abe/keygen/policy";
import { coverCryptEncrypt, generateMasterKeys } from "../../../src/interface/cover_crypt/cover_crypt";
import { hexEncode } from "../../../src/utils/utils";
import { FindexDemo } from "../../../src/demos/findex";

test('upsert+search', async () => {
    axios.defaults.baseURL = 'http://localhost:3000'
    const db = new DB();
    const findexDemo = new FindexDemo(db, [
        new PolicyAxis("department", ["marketing", "HR", "security"], false),
        new PolicyAxis("country", ["France", "Spain", "Germany"], false)
    ], 100,);


    //
    // Encrypt all users data
    //
    await db.deleteAllEncryptedUsers();
    await findexDemo.encryptUsers("00000001");

    //
    // Display
    //
    const encryptedUsers = await findexDemo.db.getEncryptedUsers();
    expect(encryptedUsers.length).toBe(99)

    //
    // Upsert Indexes
    //
    await findexDemo.resetAndUpsert('enc_uid');
    const entries = await findexDemo.db.getEntryTableEntries();
    const chains = await findexDemo.db.getChainTableEntries();
    expect(entries.length).toBe(577)
    expect(chains.length).toBe(792)

    //
    // Search words
    //
    const queryResults = await findexDemo.search("france spain", false, 1000);
    expect(queryResults.length).toBe(60);

    //
    // Decrypt users
    //
    const clearValuesCharlie = await findexDemo.decryptUsers(queryResults, "charlie");
    expect(clearValuesCharlie.length).toBe(60);
    const clearValuesBob = await findexDemo.decryptUsers(queryResults, "bob");
    expect(clearValuesBob.length).toBe(30);
})
