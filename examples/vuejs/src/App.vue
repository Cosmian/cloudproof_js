<script lang="ts">
import { Policy, PolicyAxis, CoverCrypt, CoverCryptMasterKey, Findex, FindexKey, type UidsAndValues, Label, IndexedValue, Location, Keyword, KmipClient } from 'cloudproof_js';

const COUNTRIES = ['France', 'Spain', 'Germany'];
const DEPARTMENTS = ['Marketing', 'HR', 'Security'];
const FINDEX_LABEL = new Label(Uint8Array.from([1, 2, 3]));
// Not used. TODO explain?
const METADATA_UID = Uint8Array.from([0, 0, 1]);

export default {
  data() {
    let users: Array<{ first: string, last: string, department: typeof DEPARTMENTS[0], country: typeof COUNTRIES[0], email: string, securityNumber: number }> = [];

    let names = [
      { first: 'Thibaud', last: 'Dauce', email: 'thibaud.dauce@cosmian.com', securityNumber: 1 },
      { first: 'Thibaud', last: 'Genty', email: 'thibaud.genty@cosmian.com', securityNumber: 2 },
      { first: 'François', last: 'Colas', email: 'francois.colas@cosmian.com', securityNumber: 3 },
      { first: 'Bruno', last: 'Grieder', email: 'bruno.grieder@cosmian.com', securityNumber: 4 },
      { first: 'Laetitia', last: 'Langlois', email: 'laetitia.langlois@cosmian.com', securityNumber: 5 },
      { first: 'Célia', last: 'Corsin', email: 'celia.corsin@cosmian.com', securityNumber: 6 },
      { first: 'Emmanuel', last: 'Coste', email: 'emmanuel.coste@cosmian.com', securityNumber: 7 },
      { first: 'Chloé', last: 'Hébant', email: 'chloe.hebant@cosmian.com', securityNumber: 8 },
      { first: 'Malika', last: 'Izabachène', email: 'malika.izabachene@cosmian.com', securityNumber: 9 },
    ];


    for (const country of COUNTRIES) {
      for (const department of DEPARTMENTS) {
        const name = names.pop();
        if (!name) throw "Not enought names"
        users.push({ ...name, department, country });
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

      key: 'aliceKey' as 'aliceKey' | 'bobKey' | 'charlieKey',
      query: '',
      searchResults: [] as Array<{ first?: string, last?: string, department?: string, country?: string, email?: string, securityNumber?: number }>,
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

        this.aliceKey = keygen.generateUserDecryptionKey(
          masterKeysCoverCrypt.secretKey,
          "country::France && department::Marketing",
          policy
        )
        this.bobKey = keygen.generateUserDecryptionKey(
          masterKeysCoverCrypt.secretKey,
          "country::Spain && (department::HR || department::Marketing)",
          policy
        )
        this.charlieKey = keygen.generateUserDecryptionKey(
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
            department: user.department,
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
              Keyword.fromUtf8String(user.department),
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
      if (!this.query) return [];
      let { search } = await Findex();
      let { CoverCryptHybridDecryption } = await CoverCrypt();


      if (!this.findexKeys) throw "No Findex key";

      let key = this[this.key];
      if (!key) throw "No decryption key";

      const indexedValues = await search(
        new Set([this.query]),
        this.findexKeys.searchKey,
        FINDEX_LABEL,
        1000,
        async (uids) => await this.fetchCallback("entries", uids),
        async (uids) => await this.fetchCallback("chains", uids),
      );

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
  },
}
</script>

<template>
  <main class="container">
    <h1>Cloudproof VueJS Demo</h1>

    <details class="mb-3">
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

    <table class="table">
      <thead>
        <tr>
          <th scope="col">First</th>
          <th scope="col">Last</th>
          <th scope="col">Department</th>
          <th scope="col">Country</th>
          <th scope="col">Email</th>
          <th scope="col">Security Number</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users">
          <td>{{ user.first }}</td>
          <td>{{ user.last }}</td>
          <td>{{ user.department }}</td>
          <td>{{ user.country }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.securityNumber }}</td>
        </tr>
      </tbody>
    </table>

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

    <table class="table" v-show="encryptedUsers.length">
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

    <div v-show="indexingDone">
      <div class="mb-3">
        <div class="input-group">
          <div class="form-check me-3">
            <label class="form-check-label">
              <input class="form-check-input" type="radio" v-model="key" value="aliceKey">
              <span>Alice (France && Marketing)</span>
            </label>
          </div>
          <div class="form-check me-3">
            <label class="form-check-label">
              <input class="form-check-input" type="radio" v-model="key" value="bobKey">
              <span>Bob (Spain && (Marketing || HR))</span>
            </label>
          </div>
          <div class="form-check me-3">
            <label class="form-check-label">
              <input class="form-check-input" type="radio" v-model="key" value="charlieKey">
              <span>Charlie ((France || Spain) && (Marketing || HR))</span>
            </label>
          </div>
        </div>
        <div class="mb-3">
          <input type="email" class="form-control" placeholder="Recherche" v-model="query">
        </div>
      </div>

      <table class="table" v-show="searchResults.length">
        <thead>
          <tr>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Department</th>
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
            <td v-if="user.department">{{ user.department }}</td>
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
  </main>
</template>
