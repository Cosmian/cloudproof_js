<script lang="ts">
import {
  CoverCrypt,
  Findex,
  FindexKey,
  type UidsAndValues,
  Label,
  Location,
  KmsClient,
  type UidsAndValuesToUpsert,
  generateAliases,
} from "cloudproof_js"
import { defineComponent } from "vue"
import Key from "./Key.vue"

const COUNTRIES = ["France", "Spain", "Germany"] as Array<
  "France" | "Spain" | "Germany"
>
const COUNTRIES_AXIS = [
  { name: "France", isHybridized: false },
  { name: "Spain", isHybridized: false },
  { name: "Germany", isHybridized: false },
]
const DEPARTMENTS_AXIS = [
  { name: "Marketing", isHybridized: false },
  { name: "HR", isHybridized: false },
  { name: "Manager", isHybridized: false },
]
const FINDEX_LABEL = new Label(Uint8Array.from([1, 2, 3]))

type NewUser = {
  first: string
  last: string
  country: typeof COUNTRIES[0]
  email: string
  project: string
}
type User = { id: number } & NewUser

type Request = { method: string; url: string; body?: object; response?: object }

type EncrypterAndDecrypter = {
  encrypt: (accessPolicy: string, data: Uint8Array) => Promise<Uint8Array>
  decrypt: (
    selectedKey: "aliceKey" | "bobKey" | "charlieKey",
    data: Uint8Array,
  ) => Promise<Uint8Array>
}

const DEFAULT_USER: NewUser = {
  first: "",
  last: "",
  country: "France",
  email: "",
  project: "",
}

export default defineComponent({
  components: { Key },

  data() {
    let users: Array<User> = []

    let names = [
      {
        first: "Simone",
        last: "De Beauvoir",
        email: "simone.beauvoir@example.org",
        project: "women",
      },
      {
        first: "Wangari",
        last: "Maathai",
        email: "wangari.maathai@example.org",
        project: "ecology",
      },
      {
        first: "Marie",
        last: "Curie",
        email: "marie.curie@example.org",
        project: "science",
      },
      {
        first: "Malala",
        last: "Yousafzai",
        email: "malala.yousafzai@example.org",
        project: "women",
      },
      {
        first: "Kathrine",
        last: "Switzer",
        email: "kathrine.switzer@example.org",
        project: "sport",
      },
      {
        first: "Rosa",
        last: "Parks",
        email: "rosa.parks@example.org",
        project: "civil rights",
      },
      {
        first: "Valentina",
        last: "Terechkova",
        email: "valentina.terechkova@example.org",
        project: "science",
      },
      {
        first: "Margaret",
        last: "Hamilton",
        email: "margaret.hamilton@example.org",
        project: "science",
      },
      {
        first: "Simone",
        last: "Veil",
        email: "simone.veil@example.org",
        project: "women",
      },
    ]

    let id = 0
    const NUMBER_OF_USER_BY_COUNTRY = names.length / COUNTRIES.length
    for (const country of COUNTRIES) {
      for (let index = 0; index < NUMBER_OF_USER_BY_COUNTRY; index++) {
        const name = names.pop()
        if (!name) throw new Error("Not enough names")
        users.push({ id, ...name, country })
        id++
      }
    }

    return {
      requests: [] as Request[],

      kmsServerUrl: "",
      usingGraphs: false,

      users,
      addingUser: false,
      newUser: { ...DEFAULT_USER },

      encrypterAndDecrypter: null as null | EncrypterAndDecrypter,

      encrypting: false,
      showEncryptedData: true,
      encryptedUsers: [] as {
        marketing: Uint8Array
        hr: Uint8Array
        manager: Uint8Array
      }[],

      masterKey: null as FindexKey | null,
      indexes: {
        entries: [] as UidsAndValues,
        chains: [] as UidsAndValues,
      },
      indexing: false,
      indexingDone: false,

      selectedKey: null as null | "aliceKey" | "bobKey" | "charlieKey",

      doOr: false,
      query: "",
      searchResults: [] as Array<{
        first?: string
        last?: string
        country?: string
        email?: string
        project?: number
      }>,

      COUNTRIES,
    }
  },

  methods: {
    async getEncrypterAndDecrypter(): Promise<EncrypterAndDecrypter> {
      if (this.encrypterAndDecrypter) return this.encrypterAndDecrypter
      const { Policy, PolicyAxis } = await CoverCrypt()

      const policy = new Policy(
        [
          new PolicyAxis("department", DEPARTMENTS_AXIS, true),
          new PolicyAxis("country", COUNTRIES_AXIS, false),
        ],
        100,
      )

      if (this.kmsServerUrl) {
        const client = new KmsClient(new URL(this.kmsServerUrl))
        const [privateMasterKeyUID, publicKeyUID] =
          await client.createCoverCryptMasterKeyPair(policy)

        const aliceUid = await client.createCoverCryptUserDecryptionKey(
          "country::France && department::Marketing",
          privateMasterKeyUID,
        )

        const bobUid = await client.createCoverCryptUserDecryptionKey(
          // Since the "department" axis is hierarchical it's the same as "country::Spain && (department::HR || department::Marketing)"
          "country::Spain && department::HR",
          privateMasterKeyUID,
        )

        const charlieUid = await client.createCoverCryptUserDecryptionKey(
          // Since the "department" axis is hierarchical it's the same as "(country::France || country::Spain) && (department::HR || department::Marketing)"
          "(country::France || country::Spain) && department::HR",
          privateMasterKeyUID,
        )

        return (this.encrypterAndDecrypter = {
          encrypt: async (
            accessPolicy: string,
            data: Uint8Array,
          ): Promise<Uint8Array> => {
            return await client.coverCryptEncrypt(
              publicKeyUID,
              accessPolicy,
              data,
            )
          },
          decrypt: async (
            selectedKey: "aliceKey" | "bobKey" | "charlieKey",
            data: Uint8Array,
          ): Promise<Uint8Array> => {
            let keyUid
            if (selectedKey === "aliceKey") {
              keyUid = aliceUid
            } else if (selectedKey === "bobKey") {
              keyUid = bobUid
            } else if (selectedKey === "charlieKey") {
              keyUid = charlieUid
            } else {
              throw new Error("No key selected to decrypt.")
            }

            return (await client.coverCryptDecrypt(keyUid, data)).plaintext
          },
        })
      } else {
        const {
          CoverCryptKeyGeneration,
          CoverCryptHybridEncryption,
          CoverCryptHybridDecryption,
        } = await CoverCrypt()

        const keygen = new CoverCryptKeyGeneration()
        let masterKeys = keygen.generateMasterKeys(policy)
        const coverCryptHybridEncryption = new CoverCryptHybridEncryption(
          policy,
          masterKeys.publicKey,
        )

        const aliceKey = keygen.generateUserSecretKey(
          masterKeys.secretKey,
          "country::France && department::Marketing",
          policy,
        )
        const bobKey = keygen.generateUserSecretKey(
          masterKeys.secretKey,
          // Since the "department" axis is hierarchical it's the same as "country::Spain && (department::HR || department::Marketing)"
          "country::Spain && department::HR",
          policy,
        )
        const charlieKey = keygen.generateUserSecretKey(
          masterKeys.secretKey,
          // Since the "department" axis is hierarchical it's the same as "(country::France || country::Spain) && (department::HR || department::Marketing)"
          "(country::France || country::Spain) && department::HR",
          policy,
        )

        return (this.encrypterAndDecrypter = {
          encrypt: async (
            accessPolicy: string,
            data: Uint8Array,
          ): Promise<Uint8Array> => {
            return coverCryptHybridEncryption.encrypt(accessPolicy, data)
          },
          decrypt: async (
            selectedKey: "aliceKey" | "bobKey" | "charlieKey",
            data: Uint8Array,
          ): Promise<Uint8Array> => {
            let key
            if (selectedKey === "aliceKey") {
              key = aliceKey
            } else if (selectedKey === "bobKey") {
              key = bobKey
            } else if (selectedKey === "charlieKey") {
              key = charlieKey
            } else {
              throw new Error("No key selected to decrypt.")
            }

            return new CoverCryptHybridDecryption(key).decrypt(data).plaintext
          },
        })
      }
    },

    async encryptAndSaveUser(
      encrypter: (
        accessPolicy: string,
        data: Uint8Array,
      ) => Promise<Uint8Array>,
      user: User,
    ) {
      // Encrypt user personal data for the marketing team
      // of the corresponding country
      const encryptedForMarketing = await encrypter(
        `department::Marketing && country::${user.country}`,
        new TextEncoder().encode(
          JSON.stringify({
            first: user.first,
            last: user.last,
            country: user.country,
          }),
        ),
      )

      // Encrypt user contact information for the HR team of
      // the corresponding country
      const encryptedForHr = await encrypter(
        `department::HR && country::${user.country}`,
        new TextEncoder().encode(
          JSON.stringify({
            email: user.email,
          }),
        ),
      )

      // Encrypt the user manager level for the manager
      // team of the corresponding country
      const encryptedForManager = await encrypter(
        `department::Manager && country::${user.country}`,
        new TextEncoder().encode(
          JSON.stringify({
            project: user.project,
          }),
        ),
      )

      let data = {
        marketing: encryptedForMarketing,
        hr: encryptedForHr,
        manager: encryptedForManager,
      }

      this.logRequest({
        method: "POST",
        url: "/users",
        body: data,
      })
      this.encryptedUsers[user.id] = data
    },

    async encrypt() {
      this.encrypting = true
      const encrypter = (await this.getEncrypterAndDecrypter()).encrypt

      let jobs = this.users.map((user) =>
        this.encryptAndSaveUser(encrypter, user),
      )

      await Promise.all(jobs)

      this.encrypting = false
    },

    async indexUsers(
      masterKey: Exclude<typeof this.masterKey, null>,
      users: User[],
    ) {
      let { upsert } = await Findex()

      await upsert(
        this.users.flatMap((user, index) => {
          return [
            {
              indexedValue: Location.fromString(index.toString()),
              keywords: [
                user.first,
                user.last,
                user.country,
                user.email,
                user.project.toString(),
              ],
            },
            ...(this.usingGraphs
              ? [
                  // Not required to generate aliases for all fields, you can choose which one you want to alias
                  ...generateAliases(user.first),
                  ...generateAliases(user.last),
                  ...generateAliases(user.email),
                ]
              : []),
          ]
        }),
        masterKey,
        FINDEX_LABEL,
        async (uids) => await this.fetchCallback("entries", uids),
        async (uidsAndValues) =>
          await this.upsertCallback("entries", uidsAndValues),
        async (uidsAndValues) =>
          await this.insertCallback("chains", uidsAndValues),
      )
    },

    async index() {
      this.indexing = true

      this.masterKey = new FindexKey(Uint8Array.from(Array(16).fill(1)))

      this.indexUsers(this.masterKey, this.users)

      this.indexing = false
      this.indexingDone = true
    },

    async fetchCallback(
      table: "entries" | "chains",
      uids: Uint8Array[],
    ): Promise<UidsAndValues> {
      const results: UidsAndValues = []
      for (const requestedUid of uids) {
        for (const { uid, value } of this.indexes[table]) {
          if (this.uint8ArrayEquals(uid, requestedUid)) {
            results.push({ uid, value })
            break
          }
        }
      }

      this.logRequest({
        method: "GET",
        url: `/index_${table}`,
        body: { uids },
        response: results,
      })
      return results
    },

    async insertCallback(
      table: "entries" | "chains",
      uidsAndValues: UidsAndValues,
    ): Promise<void> {
      for (const { uid: newUid, value: newValue } of uidsAndValues) {
        for (const tableEntry of this.indexes[table]) {
          if (this.uint8ArrayEquals(tableEntry.uid, newUid)) {
            tableEntry.value = newValue
            break
          }
        }

        // The uid doesn't exist yet.
        this.logRequest({
          method: "POST",
          url: `/index_${table}`,
          body: { uid: newUid, value: newValue },
        })
        this.indexes[table].push({ uid: newUid, value: newValue })
      }
    },

    async upsertCallback(
      table: "entries" | "chains",
      uidsAndValues: UidsAndValuesToUpsert,
    ): Promise<UidsAndValues> {
      const rejected = []
      uidsAndValuesLoop: for (const {
        uid: newUid,
        oldValue,
        newValue,
      } of uidsAndValues) {
        for (const tableEntry of this.indexes[table]) {
          if (this.uint8ArrayEquals(tableEntry.uid, newUid)) {
            if (
              oldValue !== null &&
              this.uint8ArrayEquals(tableEntry.value, oldValue)
            ) {
              tableEntry.value = newValue
            } else {
              rejected.push(tableEntry)
            }
            continue uidsAndValuesLoop
          }
        }

        // The uid doesn't exist yet.
        this.logRequest({
          method: "POST",
          url: `/index_${table}`,
          body: { uid: newUid, value: newValue },
        })
        this.indexes[table].push({ uid: newUid, value: newValue })
      }
      return rejected
    },

    async search() {
      if (!this.query || !this.selectedKey) return []

      let { search } = await Findex()
      const decrypter = (await this.getEncrypterAndDecrypter()).decrypt

      if (!this.masterKey) throw "No Findex key"

      const query = this.query

      let keywords = query
        .split(" ")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword)
      if (keywords.length === 0) return

      let locations: Array<Location> | null = null
      if (this.doOr) {
        locations = (
          await search(
            keywords,
            this.masterKey,
            FINDEX_LABEL,
            async (uids) => await this.fetchCallback("entries", uids),
            async (uids) => await this.fetchCallback("chains", uids),
          )
        ).locations()
      } else {
        for (const keyword of keywords) {
          const newLocations = (
            await search(
              [keyword],
              this.masterKey,
              FINDEX_LABEL,
              async (uids) => await this.fetchCallback("entries", uids),
              async (uids) => await this.fetchCallback("chains", uids),
            )
          ).locations()

          if (locations === null) {
            locations = newLocations
          } else {
            locations = locations.filter((alreadyReturnedLocations) => {
              for (let newLocation of newLocations) {
                if (
                  this.uint8ArrayEquals(
                    newLocation.bytes,
                    alreadyReturnedLocations.bytes,
                  )
                ) {
                  return true
                }
              }

              return false
            })
          }
        }
      }

      if (locations === null)
        throw Error("Indexed values cannot be null when a query is provided")

      let results = []
      for (const location of locations) {
        const userId = parseInt(location.toString())

        let encryptedUser = this.encryptedUsers[userId]
        this.logRequest({
          method: "GET",
          url: `/users/${userId}`,
          response: { encryptedUser },
        })
        let decryptedUser = {}

        try {
          decryptedUser = {
            ...decryptedUser,
            ...JSON.parse(
              this.decode(
                await decrypter(this.selectedKey, encryptedUser.marketing),
              ),
            ),
          }
        } catch (e) {}
        try {
          decryptedUser = {
            ...decryptedUser,
            ...JSON.parse(
              this.decode(await decrypter(this.selectedKey, encryptedUser.hr)),
            ),
          }
        } catch (e) {}
        try {
          decryptedUser = {
            ...decryptedUser,
            ...JSON.parse(
              this.decode(
                await decrypter(this.selectedKey, encryptedUser.manager),
              ),
            ),
          }
        } catch (e) {}

        results.push(decryptedUser)
      }

      // Show the results only if the query didn't change during the search/decrypt
      if (this.query === query) {
        this.searchResults = results
      }
    },

    async addUser() {
      this.addingUser = true

      let user = { id: this.users.length, ...this.newUser }
      this.users.push(user)

      // Only if we didn't encrypt/index yet, encrypt and index this new user otherwise wait for the global encrypt/index
      if (this.encryptedUsers.length > 0) {
        const encrypter = (await this.getEncrypterAndDecrypter()).encrypt
        this.encryptAndSaveUser(encrypter, user)
      }

      if (this.indexingDone) {
        if (!this.masterKey)
          throw new Error(
            "masterKey should be present when first indexing is done",
          )
        await this.indexUsers(this.masterKey, [user])
      }

      this.addingUser = false
      this.newUser = { ...DEFAULT_USER }
    },

    canAccessUser(user: User, attribute: keyof User): boolean {
      if (!this.selectedKey) return true

      let countries = {
        aliceKey: ["France"],
        bobKey: ["Spain"],
        charlieKey: ["France", "Spain"],
      }[this.selectedKey]

      if (!countries.includes(user.country)) {
        return false
      }

      let unavailableAttributes = {
        aliceKey: ["email", "project"],
        bobKey: ["project"],
        charlieKey: ["project"],
      }[this.selectedKey]

      if (unavailableAttributes.includes(attribute)) {
        return false
      }

      return true
    },

    logRequest(request: Request) {
      this.requests.push(request)
      this.requests = this.requests.slice(-20)
    },

    decode(value: Uint8Array): string {
      return new TextDecoder().decode(value)
    },

    stringify(value: object): string {
      return JSON.stringify(
        value,
        (key, value) => {
          if (value instanceof Uint8Array) {
            return this.decode(value).substring(0, 15)
          } else {
            return value
          }
        },
        2,
      )
    },

    uint8ArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
      if (a.length != b.length) return false

      for (let index = 0; index < a.length; index++) {
        const aValue = a[index]
        const bValue = b[index]

        if (aValue !== bValue) return false
      }

      return true
    },
  },

  watch: {
    query() {
      this.search()
    },
    selectedKey() {
      this.search()
    },
    doOr() {
      this.search()
    },
  },
})
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">
        <img src="/logo.svg" alt="" style="height: 50px" />
        <span class="fw-bold ms-4">Clouproof JS Demo</span>
      </a>
    </div>
  </nav>
  <main class="pb-5">
    <div class="container">
      <details class="mt-3 mb-3">
        <summary id="options">Options…</summary>

        <div class="mt-3">
          <label for="kmsServerUrl" class="form-label">KMS Server URL</label>
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control"
              id="kmsServerUrl"
              v-model="kmsServerUrl"
              placeholder="http://localhost:9998/kmip/2_1"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="kmsServerUrl = 'http://localhost:9998/kmip/2_1'"
            >
              Localhost
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="
                kmsServerUrl =
                  'https://demo-cloudproof.cosmian.com/kms/kmip/2_1'
              "
            >
              Demo
            </button>
          </div>
        </div>

        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="usingGraphs"
            id="usingGraphs"
          />
          <label class="form-check-label" for="usingGraphs">
            Generate graphs during indexing
          </label>
        </div>

        <hr />
      </details>

      <div class="fs-5 mb-4">
        <p>
          Cosmian has developed a new fast Symmetric Searchable Scheme (SSE)
          codenamed <strong>Findex</strong>.
        </p>

        <p>
          The scheme is not publicly available while being patented but can be
          disclosed under NDA.
        </p>

        <p>
          Likewise, and for the same reason, the Rust implementation is not yet
          publicly available but can be obtained under NDA.
        </p>

        <p>
          In this demo, it is combined with an attribute-based encryption scheme
          : <strong>CoverCrypt</strong>.
        </p>
      </div>
    </div>

    <div class="card mx-5 mb-4">
      <div class="row g-0">
        <div
          class="col-md-4 d-flex flex-column justify-content-center align-items-center"
        >
          <h5 class="card-title">Cleartext Database</h5>
          <img src="/database.png" class="card-img-top" alt="..." />
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <table class="table table-sm" id="table_cleartext_users">
              <thead>
                <tr>
                  <th colspan="4" class="text-center">
                    <Key name="Marketing" class="me-1" />
                  </th>
                  <th colspan="2" class="ps-2">
                    <Key name="HR" class="me-1" />
                  </th>
                  <th class="ps-2">
                    <Key name="Manager" class="me-1" />
                  </th>
                </tr>
                <tr>
                  <th scope="col">First</th>
                  <th scope="col">Last</th>
                  <th scope="col">Country</th>
                  <th scope="col"></th>
                  <th scope="col">Email</th>
                  <th scope="col"></th>
                  <th scope="col">Project</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users">
                  <td
                    :class="{
                      'table-warning opacity-25':
                        selectedKey && !canAccessUser(user, 'first'),
                      'table-success':
                        selectedKey && canAccessUser(user, 'first'),
                    }"
                  >
                    {{ user.first }}
                  </td>
                  <td
                    :class="{
                      'table-warning opacity-25':
                        selectedKey && !canAccessUser(user, 'last'),
                      'table-success':
                        selectedKey && canAccessUser(user, 'last'),
                    }"
                  >
                    {{ user.last }}
                  </td>
                  <td
                    :class="{
                      'table-warning opacity-25':
                        selectedKey && !canAccessUser(user, 'country'),
                      'table-success':
                        selectedKey && canAccessUser(user, 'country'),
                    }"
                  >
                    <Key :name="user.country" />
                  </td>
                  <td class="border-start pe-3"></td>
                  <td
                    :class="{
                      'table-warning opacity-25':
                        selectedKey && !canAccessUser(user, 'email'),
                      'table-success':
                        selectedKey && canAccessUser(user, 'email'),
                    }"
                  >
                    {{ user.email }}
                  </td>
                  <td class="border-start pe-3"></td>
                  <td
                    :class="{
                      'table-warning opacity-25':
                        selectedKey && !canAccessUser(user, 'project'),
                      'table-success':
                        selectedKey && canAccessUser(user, 'project'),
                    }"
                  >
                    {{ user.project }}
                  </td>
                </tr>
                <tr id="new_user_row">
                  <td>
                    <input
                      form="newUser"
                      id="new_user_first"
                      type="text"
                      placeholder="Firstname"
                      class="form-control form-control-sm"
                      v-model="newUser.first"
                      required
                    />
                  </td>
                  <td>
                    <input
                      form="newUser"
                      id="new_user_last"
                      type="text"
                      placeholder="Lastname"
                      class="form-control form-control-sm"
                      v-model="newUser.last"
                      required
                    />
                  </td>
                  <td>
                    <select
                      form="newUser"
                      id="new_user_country"
                      class="form-select form-select-sm"
                      v-model="newUser.country"
                      required
                    >
                      <option
                        v-for="country in COUNTRIES"
                        :key="country"
                        :value="country"
                      >
                        {{ country }}
                      </option>
                    </select>
                  </td>
                  <td class="border-start pe-3"></td>
                  <td>
                    <input
                      form="newUser"
                      id="new_user_email"
                      type="email"
                      placeholder="Email"
                      class="form-control form-control-sm"
                      v-model="newUser.email"
                      required
                    />
                  </td>
                  <td class="border-start pe-3"></td>
                  <td>
                    <form
                      @submit.prevent="addUser"
                      id="newUser"
                      class="d-flex align-items-start"
                    >
                      <input
                        type="text"
                        id="new_user_project"
                        style="width: 125px"
                        class="form-control form-control-sm"
                        v-model="newUser.project"
                        required
                      />
                      <button
                        type="submit"
                        class="ms-5 btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center"
                      >
                        <div
                          v-if="addingUser"
                          class="spinner-border text-light me-3 spinner-border-sm"
                          role="status"
                        ></div>
                        <svg
                          v-if="!addingUser"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          width="20px"
                          height="20px"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                          />
                        </svg>
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-show="encryptedUsers.length < users.length">
      <div class="d-flex justify-content-center align-items-center">
        <button
          type="button"
          id="encrypt_user"
          @click="encrypt"
          class="btn btn-primary btn-lg d-flex justify-content-center align-items-center"
          :disabled="encrypting"
        >
          <div v-show="encrypting">
            <div
              class="spinner-border text-light me-3 spinner-border-sm"
              role="status"
            ></div>
          </div>
          <div>Encrypt data</div>
        </button>
      </div>
    </div>

    <div class="position-relative mx-5 mb-4" v-show="encryptedUsers.length">
      <div
        class="pt-2 ps-4"
        style="z-index: 999"
        :class="{ 'position-absolute': showEncryptedData }"
      >
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="hide_encrypted"
            v-model="showEncryptedData"
          />
          <label class="form-check-label" for="hide_encrypted"
            >Show encrypted data</label
          >
        </div>
      </div>
      <div class="card" v-show="showEncryptedData">
        <div class="row g-0">
          <div
            class="col-md-4 d-flex flex-column justify-content-center align-items-center"
          >
            <h5 class="card-title">Encrypted Database</h5>
            <img src="/database_encrypted.png" class="card-img-top" alt="..." />
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <table class="table table-sm" id="table_encrypted_users">
                <thead>
                  <tr>
                    <th scope="col">Marketing</th>
                    <th scope="col">HR</th>
                    <th scope="col">Manager</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in encryptedUsers">
                    <td>{{ decode(user.marketing).substring(0, 15) }}…</td>
                    <td>{{ decode(user.hr).substring(0, 15) }}…</td>
                    <td>{{ decode(user.manager).substring(0, 15) }}…</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="encryptedUsers.length === users.length && !indexingDone">
      <div class="d-flex justify-content-center align-items-center">
        <button
          type="button"
          id="index"
          @click="index"
          class="btn btn-primary btn-lg d-flex justify-content-center align-items-center"
          :disabled="indexing"
        >
          <div v-show="indexing">
            <div
              class="spinner-border text-light me-3 spinner-border-sm"
              role="status"
            ></div>
          </div>
          <div>Index</div>
        </button>
      </div>
    </div>

    <div class="container">
      <div class="card mb-4" v-show="indexingDone">
        <div class="card-body" id="search">
          <h5 class="card-title">Search</h5>
          <div class="mb-3">
            <div class="input-group mb-3">
              <div class="form-check me-5">
                <label class="form-check-label">
                  <div class="d-flex align-items-center">
                    <input
                      class="form-check-input"
                      type="radio"
                      v-model="selectedKey"
                      value="aliceKey"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      width="40px"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    <div>
                      <div class="fs-5 ms-1">Alice</div>
                      <div class="d-flex">
                        <Key name="France" class="me-1" />
                        <Key name="Marketing" />
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              <div class="form-check me-5">
                <label class="form-check-label">
                  <div class="d-flex align-items-center">
                    <input
                      class="form-check-input"
                      type="radio"
                      v-model="selectedKey"
                      value="bobKey"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      width="40px"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    <div>
                      <div class="fs-5 ms-1">Bob</div>
                      <div class="d-flex">
                        <Key name="Spain" class="me-1" />
                        <Key name="Marketing" class="me-1" />
                        <Key name="HR" />
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              <div class="form-check me-5">
                <label class="form-check-label">
                  <div class="d-flex align-items-center">
                    <input
                      class="form-check-input"
                      type="radio"
                      v-model="selectedKey"
                      value="charlieKey"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      width="40px"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    <div>
                      <div class="fs-5 ms-1">Charlie</div>
                      <div class="d-flex">
                        <Key name="France" class="me-1" />
                        <Key name="Spain" class="me-1" />
                        <Key name="Marketing" class="me-1" />
                        <Key name="HR" />
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div class="mb-3">
              <div class="input-group">
                <div class="input-group-text">
                  <label class="form-check-label me-2" for="andOrOr">AND</label>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="andOrOr"
                      v-model="doOr"
                    />
                    <label class="form-check-label" for="andOrOr">OR</label>
                  </div>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Recherche"
                  v-model="query"
                />
              </div>
            </div>
          </div>

          <div
            class="alert alert-light"
            role="alert"
            v-show="!query && !selectedKey"
          >
            Please select a key and type a query.
          </div>
          <div
            class="alert alert-light"
            role="alert"
            v-show="!query && selectedKey"
          >
            Please type a query.
          </div>
          <div
            class="alert alert-light"
            role="alert"
            v-show="query && !selectedKey"
          >
            Please select a key.
          </div>
          <div
            class="alert alert-light"
            role="alert"
            v-show="query && selectedKey && !searchResults.length"
          >
            No result for "{{ query }}"
          </div>

          <table class="table table-sm" v-show="searchResults.length">
            <thead>
              <tr>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Country</th>
                <th scope="col">Email</th>
                <th scope="col">Project</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in searchResults">
                <td v-if="user.first">{{ user.first }}</td>
                <td v-else>
                  <span class="badge text-bg-dark">Impossible to decrypt</span>
                </td>
                <td v-if="user.last">{{ user.last }}</td>
                <td v-else>
                  <span class="badge text-bg-dark">Impossible to decrypt</span>
                </td>
                <td v-if="user.country">{{ user.country }}</td>
                <td v-else>
                  <span class="badge text-bg-dark">Impossible to decrypt</span>
                </td>
                <td v-if="user.email">{{ user.email }}</td>
                <td v-else>
                  <span class="badge text-bg-dark">Impossible to decrypt</span>
                </td>
                <td v-if="user.project">{{ user.project }}</td>
                <td v-else>
                  <span class="badge text-bg-dark">Impossible to decrypt</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="position-fixed bottom-0 end-0 m-4">
      <button
        class="btn btn-primary d-flex justify-content-center align-items-center"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#requests"
        aria-controls="requests"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="20px"
          height="20px"
          class="me-2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
          />
        </svg>
        <span>Show Cloud Requests</span>
      </button>
    </div>

    <div
      class="offcanvas offcanvas-end"
      data-bs-scroll="true"
      tabindex="-1"
      id="requests"
      aria-labelledby="requestsLabel"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="requestsLabel">Cloud Requests</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <div class="mb-1" v-for="request in requests.slice().reverse()">
          <div>
            <span
              class="badge text-bg-primary me-2"
              v-text="request.method"
            ></span>
            <code v-text="request.url"></code>
          </div>
          <pre
            v-if="request.body"
          ><code v-text="stringify(request.body)"></code></pre>
          <pre
            v-if="request.response"
          ><code v-text="stringify(request.response)"></code></pre>
        </div>
      </div>
    </div>
  </main>
</template>
