import axios from 'axios'
import { hexDecode } from 'utils/utils'
import { generateCoverCryptKeys } from '../../common/cover_crypt_keys'
import { masterKeysFindex } from '../../common/keys'
import { Users } from '../../common/users'
import { CloudproofDemoPostgRest } from '../cloudproof'
import { PostgRestDB } from '../db'
const LABEL = 'label'

test('upsert+search', async () => {
  axios.defaults.baseURL = 'http://localhost:3000'

  const keys = generateCoverCryptKeys()

  let users = new Users()
  expect(users.getUsers().length).toBe(99)

  const findexDemo = new CloudproofDemoPostgRest(new PostgRestDB())

  //
  // Encrypt all users data
  //
  await findexDemo.postgrestDb.deleteAllEncryptedUsers()
  users = await findexDemo.encryptUsersPerCountryAndDepartment(
    users,
    hexDecode('00000001'),
    keys.abePolicy,
    keys.masterKeysCoverCrypt.publicKey
  )

  //
  // Display
  //
  const encryptedUsers = await findexDemo.postgrestDb.getEncryptedUsers()
  expect(encryptedUsers.length).toBe(99)

  //
  // Upsert Indexes
  //
  await findexDemo.postgrestDb.deleteAllChainTableEntries()
  await findexDemo.postgrestDb.deleteAllEntryTableEntries()
  await findexDemo.upsertUsersIndexes(masterKeysFindex, LABEL, users, 'enc_uid')
  const entries = await findexDemo.postgrestDb.getEntryTableEntries()
  const chains = await findexDemo.postgrestDb.getChainTableEntries()
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
  const clearValuesBob = await findexDemo.fetchAndDecryptUsers(
    locations,
    keys.bob
  )
  expect(clearValuesBob.length).toBe(30)
})
