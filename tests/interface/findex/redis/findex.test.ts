import { PolicyAxis } from "../../../../src/crypto/abe/keygen/policy";
import { masterKeysFindex } from "../../../../src/demos/findex/keys";
import { RedisDB } from "../../../../src/demos/findex/redis/db";
import { Users } from "../../../../src/demos/findex/users";
import { Findex } from "../../../../src/interface/findex/findex";

const LABEL = "label";

test('upsert+search', async () => {
    const redisDb = new RedisDB("localhost", 6379);
    //
    // Upsert Indexes
    //
    try {
        redisDb.initInstance();
        const findexDemo = new Findex(redisDb);

        const users = new Users();
        expect(users.getUsers().length).toBe(99)

        await redisDb.instance.flushAll();
        await findexDemo.upsertUsersIndexes(masterKeysFindex, LABEL, users, "id");

        const entries = await redisDb.getEntryTableEntries();
        const chains = await redisDb.getChainTableEntries();
        expect(entries.length).toBe(577)
        expect(chains.length).toBe(792)

        //
        // Search words
        //
        const queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, "france", false, 1000);
        expect(queryResults.length).toBe(30);
        redisDb.instance.quit()
    } catch (error) {
        redisDb.instance.quit()
        throw new Error("Redis test failed: " + error);
    }
})
