import { FindexDemo } from '../../common/findex_demo'
import { masterKeysFindex } from '../../common/keys'
import { Users } from '../../common/users'
import { RedisDB } from '../db'

const LABEL = 'label'

test('upsert+search', async () => {
  const redisDb = new RedisDB('localhost', 6379)
  //
  // Upsert Indexes
  //
  try {
    await redisDb.initInstance()
    const findexDemo = new FindexDemo(redisDb)

    const users = new Users()
    expect(users.getUsers().length).toBe(99)

    await redisDb.instance.flushAll()
    await findexDemo.upsertUsersIndexes(masterKeysFindex, LABEL, users, 'id')

    const entries = await redisDb.getEntryTableEntries()
    const chains = await redisDb.getChainTableEntries()
    expect(entries.length).toBe(577)
    expect(chains.length).toBe(792)

    //
    // Search words
    //
    const queryResults = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, 'france', false, 1000)
    expect(queryResults.length).toBe(30)
    await redisDb.instance.quit()
  } catch (error) {
    await redisDb.instance.quit()
    throw new Error('Redis test failed: ' + error)
  }
})
