import { hexDecode } from 'utils/utils'
import { generateCoverCryptKeys } from '../../common/cover_crypt_keys'
import { masterKeysFindex } from '../../common/keys'
import { Users } from '../../common/users'
import { CloudProofDemoRedis } from '../cloudproof'
import { RedisDB } from '../db'

const LABEL = 'label'

test('upsert+search', async () => {
  const redisDb = new RedisDB('localhost', 6379)

  const keys = generateCoverCryptKeys()

  let users = new Users()
  expect(users.getUsers().length).toBe(99)

  //
  // Encrypt all users data
  //
  try {
    const findexDemo = new CloudProofDemoRedis(redisDb)
    await findexDemo.redisDb.instance.flushAll()
    await findexDemo.redisDb.deleteAllEncryptedUsers()
    users = await findexDemo.encryptUsers(
      users,
      hexDecode('00000001'),
      keys.abePolicy,
      keys.masterKeysCoverCrypt.publicKey
    )

    //
    // Display
    //
    const encryptedUsers = await findexDemo.redisDb.getEncryptedUsers()
    expect(encryptedUsers.length).toBe(99)

    //
    // Upsert Indexes
    //
    await findexDemo.redisDb.deleteAllChainTableEntries()
    await findexDemo.redisDb.deleteAllEntryTableEntries()
    await findexDemo.upsertUsersIndexes(masterKeysFindex, LABEL, users, 'enc_uid')
    const entries = await findexDemo.redisDb.getEntryTableEntries()
    const chains = await findexDemo.redisDb.getChainTableEntries()
    expect(entries.length).toBe(577)
    expect(chains.length).toBe(792)

    //
    // Search words
    //
    const locations = await findexDemo.searchWithLogicalSwitch(masterKeysFindex, LABEL, 'france spain', false, 1000)
    expect(locations.length).toBe(60)

    //
    // Decrypt users
    //
    const clearValuesCharlie = await findexDemo.fetchAndDecryptUsers(
      locations,
      keys.charlie
    )
    expect(clearValuesCharlie.length).toBe(60)
    await findexDemo.redisDb.instance.quit()
  } catch (error) {
    await redisDb.instance.quit()
    throw new Error('Redis test failed: ' + error)
  }
})
