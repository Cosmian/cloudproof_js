<script lang="ts">
import { Policy, PolicyAxis, CoverCrypt, CoverCryptMasterKey, Findex, FindexKey, type UidsAndValues, Label, IndexedValue, Location, Keyword, KmipClient } from 'cloudproof_js';
import Key from './Key.vue';

const COUNTRIES = ['France', 'Spain', 'Germany'];
const DEPARTMENTS = ['Marketing', 'HR', 'Security'];
const FINDEX_LABEL = new Label(Uint8Array.from([1, 2, 3]));

type User = { first: string, last: string, country: typeof COUNTRIES[0], email: string, securityNumber: number };

export default {
  components: { Key },

  data() {
    let users: Array<User> = [];

    let names = [
      { first: 'Thibaud', last: 'Dauce', email: 'thibaud.dauce@cosmian.com', securityNumber: 1 },
      { first: 'Chloé', last: 'Hébant', email: 'chloe.hebant@cosmian.com', securityNumber: 2 },
      { first: 'François', last: 'Colas', email: 'francois.colas@cosmian.com', securityNumber: 3 },
      { first: 'Bruno', last: 'Grieder', email: 'bruno.grieder@cosmian.com', securityNumber: 4 },
      { first: 'Laetitia', last: 'Langlois', email: 'laetitia.langlois@cosmian.com', securityNumber: 5 },
      { first: 'Célia', last: 'Corsin', email: 'celia.corsin@cosmian.com', securityNumber: 6 },
      { first: 'Emmanuel', last: 'Coste', email: 'emmanuel.coste@cosmian.com', securityNumber: 7 },
      { first: 'Thibaud', last: 'Genty', email: 'thibaud.genty@cosmian.com', securityNumber: 8 },
      { first: 'Malika', last: 'Izabachène', email: 'malika.izabachene@cosmian.com', securityNumber: 9 },
    ];


    for (const country of COUNTRIES) {
      for (const department of DEPARTMENTS) {
        const name = names.pop();
        if (!name) throw "Not enought names"
        users.push({ ...name, country });
      }
    }

    return {
      kmsServerUrl: '',

      users,

      encrypting: false,
      encryptedUsers: [] as { marketing: Uint8Array, hr: Uint8Array, security: Uint8Array }[],

      masterKeysCoverCrypt: null as CoverCryptMasterKey | null,
      aliceKey: null as Uint8Array | null,
      bobKey: null as Uint8Array | null,
      charlieKey: null as Uint8Array | null,

      findexKeys: null as { searchKey: FindexKey, updateKey: FindexKey } | null,
      indexes: {
        entries: [] as UidsAndValues,
        chains: [] as UidsAndValues,
      },
      indexing: false,
      indexingDone: false,

      key: null as null | 'aliceKey' | 'bobKey' | 'charlieKey',
      doOr: false,
      query: '',
      searchResults: [] as Array<{ first?: string, last?: string, country?: string, email?: string, securityNumber?: number }>,
    }
  },

  methods: {
    async encrypt() {
      let { CoverCryptKeyGeneration, CoverCryptHybridEncryption } = await CoverCrypt();

      this.encrypting = true;
      //
      // Create Policy
      //
      const policy = new Policy(
        [
          new PolicyAxis("department", DEPARTMENTS, false),
          new PolicyAxis("country", COUNTRIES, false),
        ],
        100,
      );
      const policyBytes = policy.toJsonEncoded()

      //
      // Key generation
      //
      const keygen = new CoverCryptKeyGeneration()

      let masterPublicKey;
      if (this.kmsServerUrl) {
        console.log('Using KMS server');

        const client = new KmipClient(new URL("http://localhost:9998/kmip/2_1"))
        const [privateMasterKeyUID, publicKeyUID] = await client.createAbeMasterKeyPair(policy)
        masterPublicKey = (await client.retrieveAbePublicMasterKey(publicKeyUID)).bytes();

        let aliceUid = await client.createAbeUserDecryptionKey(
          "country::France && department::Marketing",
          privateMasterKeyUID,
        )
        this.aliceKey = (await client.retrieveAbeUserDecryptionKey(aliceUid)).bytes();

        let bobUid = await client.createAbeUserDecryptionKey(
          "country::Spain && (department::HR || department::Marketing)",
          privateMasterKeyUID,
        )
        this.bobKey = (await client.retrieveAbeUserDecryptionKey(bobUid)).bytes();

        let charlieUid = await client.createAbeUserDecryptionKey(
          "(country::France || country::Spain) && (department::HR || department::Marketing)",
          privateMasterKeyUID,
        )
        this.charlieKey = (await client.retrieveAbeUserDecryptionKey(charlieUid)).bytes();
      } else {
        let masterKeysCoverCrypt = keygen.generateMasterKeys(policy)
        masterPublicKey = masterKeysCoverCrypt.publicKey;

        this.aliceKey = keygen.generateUserSecretKey(
          masterKeysCoverCrypt.secretKey,
          "country::France && department::Marketing",
          policy
        )
        this.bobKey = keygen.generateUserSecretKey(
          masterKeysCoverCrypt.secretKey,
          "country::Spain && (department::HR || department::Marketing)",
          policy
        )
        this.charlieKey = keygen.generateUserSecretKey(
          masterKeysCoverCrypt.secretKey,
          "(country::France || country::Spain) && (department::HR || department::Marketing)",
          policy
        )
      }

      const hybridCryptoEncrypt = new CoverCryptHybridEncryption(policyBytes, masterPublicKey)

      for (const user of this.users) {
        // Encrypt user personal data for the marketing team
        // of the corresponding country
        const encryptedForMarketing = await hybridCryptoEncrypt.encrypt(
          `department::Marketing && country::${user.country}`,
          new TextEncoder().encode(JSON.stringify({
            first: user.first,
            last: user.last,
            country: user.country,
          })),
        )

        // Encrypt user contact information for the HR team of
        // the corresponding country
        const encryptedForHr = await hybridCryptoEncrypt.encrypt(
          `department::HR && country::${user.country}`,
          new TextEncoder().encode(JSON.stringify({
            email: user.email,
          })),
        )

        // Encrypt the user security level for the security
        // team of the corresponding country
        const encryptedForSecurity = await hybridCryptoEncrypt.encrypt(
          `department::Security && country::${user.country}`,
          new TextEncoder().encode(JSON.stringify({
            securityNumber: user.securityNumber,
          })),
        )

        this.encryptedUsers.push({
          marketing: encryptedForMarketing,
          hr: encryptedForHr,
          security: encryptedForSecurity,
        })
      }
      this.encrypting = false;
    },

    async index() {
      this.indexing = true;
      let { upsert } = await Findex();

      this.findexKeys = {
        searchKey: new FindexKey(Uint8Array.from(Array(32).fill(1))),
        updateKey: new FindexKey(Uint8Array.from(Array(32).fill(2))),
      };

      await upsert(
        this.users.map((user, index) => {
          return {
            indexedValue: IndexedValue.fromLocation(new Location(Uint8Array.from([index]))),
            keywords: new Set([
              Keyword.fromUtf8String(user.first),
              Keyword.fromUtf8String(user.last),
              Keyword.fromUtf8String(user.country),
              Keyword.fromUtf8String(user.email),
              Keyword.fromUtf8String(user.securityNumber.toString()),
            ]),
          };
        }),
        this.findexKeys.searchKey,
        this.findexKeys.updateKey,
        FINDEX_LABEL,
        async (uids) => await this.fetchCallback("entries", uids),
        async (uidsAndValues) => await this.upsertCallback("entries", uidsAndValues),
        async (uidsAndValues) => await this.upsertCallback("chains", uidsAndValues),
      );

      console.log(`Done indexing ${this.indexes.entries.length} entries / ${this.indexes.chains.length} chains`);
      this.indexing = false;
      this.indexingDone = true;
    },

    async fetchCallback(
      table: "entries" | "chains",
      uids: Uint8Array[]
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
      return results
    },

    async upsertCallback(
      table: "entries" | "chains",
      uidsAndValues: UidsAndValues
    ): Promise<void> {
      for (const { uid: newUid, value: newValue } of uidsAndValues) {
        for (const tableEntry of this.indexes[table]) {
          if (this.uint8ArrayEquals(tableEntry.uid, newUid)) {
            tableEntry.value = newValue
            break
          }
        }

        // The uid doesn't exist yet.
        this.indexes[table].push({ uid: newUid, value: newValue })
      }
    },

    async search() {
      if (!this.query || !this.key) return [];
      let { search } = await Findex();
      let { CoverCryptHybridDecryption } = await CoverCrypt();


      if (!this.findexKeys) throw "No Findex key";

      let key = this[this.key];
      if (!key) throw "No decryption key";

      let keywords = this.query.split(' ').map((keyword) => keyword.trim()).filter((keyword) => keyword);
      if (keywords.length === 0) return;

      let indexedValues: Array<IndexedValue> | null = null;
      if (this.doOr) {
        indexedValues = await search(
          new Set(keywords),
          this.findexKeys.searchKey,
          FINDEX_LABEL,
          1000,
          async (uids) => await this.fetchCallback("entries", uids),
          async (uids) => await this.fetchCallback("chains", uids),
        );
      } else {
        for (const keyword of keywords) {
          const newIndexedValues = await search(
            new Set([keyword]),
            this.findexKeys.searchKey,
            FINDEX_LABEL,
            1000,
            async (uids) => await this.fetchCallback("entries", uids),
            async (uids) => await this.fetchCallback("chains", uids),
          );

          if (indexedValues === null) {
            indexedValues = newIndexedValues;
          } else {
            indexedValues = indexedValues.filter((alreadyReturnedIndexedValue) => {
              for (let newIndexedValue of newIndexedValues) {
                if (this.uint8ArrayEquals(newIndexedValue.bytes, alreadyReturnedIndexedValue.bytes)) {
                  return true;
                }
              }

              return false;
            })
          }
        }
      }

      if (indexedValues === null) throw Error("Indexed values cannot be null when a query is provided");

      let coverCryptDecryption = new CoverCryptHybridDecryption(key);

      let results = [];
      for (const indexedValue of indexedValues) {
        let encryptedUser = this.encryptedUsers[indexedValue.bytes[1]];
        let decryptedUser = {};

        try {
          decryptedUser = { ...decryptedUser, ...JSON.parse(this.decode(await coverCryptDecryption.decrypt(encryptedUser.marketing))) };
        } catch (e) { }
        try {
          decryptedUser = { ...decryptedUser, ...JSON.parse(this.decode(await coverCryptDecryption.decrypt(encryptedUser.hr))) };
        } catch (e) { }
        try {
          decryptedUser = { ...decryptedUser, ...JSON.parse(this.decode(await coverCryptDecryption.decrypt(encryptedUser.security))) };
        } catch (e) { }

        results.push(decryptedUser);
      }

      this.searchResults = results;
    },

    canAccessUser(user: User, attribute: keyof User): boolean {
      if (!this.key) return true;

      let countries = {
        'aliceKey': ['France'],
        'bobKey': ['Spain'],
        'charlieKey': ['France', 'Spain'],
      }[this.key];

      if (!countries.includes(user.country)) {
        return false;
      }

      let unavailableAttributes = {
        'aliceKey': ['email', 'securityNumber'],
        'bobKey': ['securityNumber'],
        'charlieKey': ['securityNumber'],
      }[this.key];

      if (unavailableAttributes.includes(attribute)) {
        return false;
      }

      return true;
    },

    decode(value: Uint8Array): string {
      return new TextDecoder().decode(value);
    },

    uint8ArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
      if (a.length != b.length) return false;

      for (let index = 0; index < a.length; index++) {
        const aValue = a[index];
        const bValue = b[index];

        if (aValue !== bValue) return false;
      }

      return true;
    },
  },

  watch: {
    query() {
      this.search();
    },
    key() {
      this.search();
    },
    doOr() {
      this.search();
    },
  },
}
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">
        <img src="/logo.png" alt="" style="height: 30px">
        <span class="fw-bold ms-4">Clouproof Demo</span>
      </a>
    </div>
  </nav>
  <main class="container">
    <details class="mt-3 mb-3">
      <summary>Options…</summary>

      <div class="mt-3">
        <label for="kmsServer" class="form-label">KMS Server URL</label>
        <div class="input-group mb-3">
          <input type="email" class="form-control" id="kmsServer" v-model="kmsServerUrl"
            placeholder="http://localhost:9998/kmip/2_1">
          <button class="btn btn-outline-secondary" type="button"
            @click="kmsServerUrl = 'http://localhost:9998/kmip/2_1'">Default</button>
        </div>
      </div>

      <hr>
    </details>

    <div class="fs-5 mb-5">
      <p>Cosmian has developed a new fast Symmetric Searchable Scheme (SSE) codenamed <strong>Findex</strong>.</p>

      <p>The scheme is not publicly available while being patented but can be disclosed under NDA.</p>

      <p>Likewise, and for the same reason, the Rust implementation is not yet publicly available but can be obtained
        under
        NDA.</p>

      <p>In this demo, it is combined with an attribute-based encryption scheme : <strong>CoverCrypt</strong>.</p>
    </div>

    <div class="card mb-5">
      <img src="/database.png" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">Cleartext Database</h5>
        <table class="table">
          <thead>
            <tr>
              <th colspan="4" class="text-center">
                <Key name="Marketing" class="me-1" />
              </th>
              <th colspan="2" class="ps-2">
                <Key name="HR" class="me-1" />
              </th>
              <th class="ps-2">
                <Key name="Security" class="me-1" />
              </th>
            </tr>
            <tr>
              <th scope="col">
                First
              </th>
              <th scope="col">
                Last
              </th>
              <th scope="col">
                Country
              </th>
              <th scope="col"></th>
              <th scope="col">
                Email
              </th>
              <th scope="col"></th>
              <th scope="col">
                Security Number
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users">
              <td :class="{
                'table-warning opacity-25': key && !canAccessUser(user, 'first'),
                'table-success': key && canAccessUser(user, 'first'),
              }">{{ user.first }}</td>
              <td :class="{
                'table-warning opacity-25': key && !canAccessUser(user, 'last'),
                'table-success': key && canAccessUser(user, 'last'),
              }">{{ user.last }}</td>
              <td :class="{
                'table-warning opacity-25': key && !canAccessUser(user, 'country'),
                'table-success': key && canAccessUser(user, 'country'),
              }">
                <Key :name="user.country" />
              </td>
              <td class="border-start pe-3"></td>
              <td :class="{
                'table-warning opacity-25': key && !canAccessUser(user, 'email'),
                'table-success': key && canAccessUser(user, 'email'),
              }">{{ user.email }}</td>
              <td class="border-start pe-3"></td>
              <td :class="{
                'table-warning opacity-25': key && !canAccessUser(user, 'securityNumber'),
                'table-success': key && canAccessUser(user, 'securityNumber'),
              }"> {{ user.securityNumber }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>



    <div v-show="encryptedUsers.length < users.length">
      <div class="d-flex justify-content-center align-items-center">
        <button type="button" @click="encrypt" class="btn btn-primary btn-lg d-flex justify-content-center"
          :disabled="encrypting">
          <div v-show="encrypting">
            <div class="spinner-border text-light me-3 spinner-border-sm" role="status"></div>
          </div>
          <div>Encrypt users</div>
        </button>
      </div>
    </div>

    <div class="card mb-5" v-show="encryptedUsers.length">
      <img src="/database_encrypted.png" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">Encrypted Database</h5>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Marketing</th>
              <th scope="col">HR</th>
              <th scope="col">Security</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in encryptedUsers">
              <td>{{ decode(user.marketing).substring(0, 30) }}…</td>
              <td>{{ decode(user.hr).substring(0, 30) }}…</td>
              <td>{{ decode(user.security).substring(0, 30) }}…</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-show="encryptedUsers.length === users.length && !indexingDone">
      <div class="d-flex justify-content-center align-items-center">
        <button type="button" @click="index" class="btn btn-primary btn-lg d-flex justify-content-center"
          :disabled="indexing">
          <div v-show="indexing">
            <div class="spinner-border text-light me-3 spinner-border-sm" role="status"></div>
          </div>
          <div>Index users</div>
        </button>
      </div>
    </div>

    <div class="card mb-5" v-show="indexingDone">
      <div class="card-body">
        <h5 class="card-title">Search</h5>
        <div class="mb-3">
          <div class="input-group mb-3">
            <div class="form-check me-5">
              <label class="form-check-label">
                <div class="d-flex align-items-center">
                  <input class="form-check-input" type="radio" v-model="key" value="aliceKey">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" width="40px">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
                  <input class="form-check-input" type="radio" v-model="key" value="bobKey">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" width="40px">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
                  <input class="form-check-input" type="radio" v-model="key" value="charlieKey">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" width="40px">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
                  <input class="form-check-input" type="checkbox" role="switch" id="andOrOr" v-model="doOr">
                  <label class="form-check-label" for="andOrOr">OR</label>
                </div>
              </div>
              <input type="email" class="form-control" placeholder="Recherche" v-model="query">
            </div>
          </div>
        </div>

        <table class="table" v-show="searchResults.length">
          <thead>
            <tr>
              <th scope="col">First</th>
              <th scope="col">Last</th>
              <th scope="col">Country</th>
              <th scope="col">Email</th>
              <th scope="col">Security Number</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in searchResults">
              <td v-if="user.first">{{ user.first }}</td>
              <td v-else><span class="badge text-bg-danger">Impossible to decrypt</span></td>
              <td v-if="user.last">{{ user.last }}</td>
              <td v-else><span class="badge text-bg-danger">Impossible to decrypt</span></td>
              <td v-if="user.country">{{ user.country }}</td>
              <td v-else><span class="badge text-bg-danger">Impossible to decrypt</span></td>
              <td v-if="user.email">{{ user.email }}</td>
              <td v-else><span class="badge text-bg-danger">Impossible to decrypt</span></td>
              <td v-if="user.securityNumber">{{ user.securityNumber }}</td>
              <td v-else><span class="badge text-bg-danger">Impossible to decrypt</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>
</template>
