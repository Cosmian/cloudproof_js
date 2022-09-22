import axios from "axios";
import { Policy, PolicyAxis } from "../../../../src/crypto/abe/keygen/policy";
import { generateMasterKeys } from "../../../../src/demos/abe/cover_crypt/cover_crypt";
import { masterKeysFindex } from "../../../../src/demos/findex/keys";
import { PostgRestDB } from "../../../../src/demos/findex/postgrest/db";
import { Users } from "../../../../src/demos/findex/users";
import { hexDecode } from "../../../../src/utils/utils";
import { CloudproofDemoPostgRest } from "../../../../src/demos/findex/postgrest/cloudproof"

const LABEL = "label"

test('upsert+search', async () => {
    axios.defaults.baseURL = 'http://localhost:3000'
    const abePolicy = new Policy([
        new PolicyAxis("department", ["marketing", "HR", "security"], false),
        new PolicyAxis("country", ["France", "Spain", "Germany"], false)
    ], 100);
    const masterKeysCoverCrypt = generateMasterKeys(abePolicy);

    let users = new Users();
    expect(users.getUsers().length).toBe(99)

    const findexDemo = new CloudproofDemoPostgRest(new PostgRestDB());

    //
    // Encrypt all users data
    //
    await findexDemo.postgrestDb.deleteAllEncryptedUsers();
    users = await findexDemo.encryptUsers(
        users,
        hexDecode("00000001"),
        abePolicy,
        masterKeysCoverCrypt.publicKey
    );

    //
    // Display
    //
    const encryptedUsers = await findexDemo.postgrestDb.getEncryptedUsers();
    expect(encryptedUsers.length).toBe(99)

    //
    // Upsert Indexes
    //
    await findexDemo.postgrestDb.deleteAllChainTableEntries();
    await findexDemo.postgrestDb.deleteAllEntryTableEntries();
    await findexDemo.upsertUsersIndexes(masterKeysFindex, LABEL, users, "enc_uid");
    const entries = await findexDemo.postgrestDb.getEntryTableEntries();
    const chains = await findexDemo.postgrestDb.getChainTableEntries();
    expect(entries.length).toBe(577)
    expect(chains.length).toBe(792)

    //
    // Search words
    //
    const queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "france spain", false, 1000);
    expect(queryResults.length).toBe(60);

    //
    // Decrypt users
    //
    const clearValuesCharlie = await findexDemo.decryptUsers(
        queryResults,
        abePolicy,
        masterKeysCoverCrypt.privateKey,
        "charlie");
    expect(clearValuesCharlie.length).toBe(60);
    const clearValuesBob = await findexDemo.decryptUsers(
        queryResults,
        abePolicy,
        masterKeysCoverCrypt.privateKey,
        "bob");
    expect(clearValuesBob.length).toBe(30);
})
