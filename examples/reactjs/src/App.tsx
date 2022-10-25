import { Policy, PolicyAxis, Findex, FindexKey, type UidsAndValues, Label, IndexedValue, Location, Keyword, CoverCrypt } from 'cloudproof_js';
import { useEffect, useState } from 'react';

const COUNTRIES = ['France', 'Spain', 'Germany'];
const DEPARTMENTS = ['Marketing', 'HR', 'Security'];
const FINDEX_LABEL = new Label(Uint8Array.from([1, 2, 3]));

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
let users: Array<{ first: string, last: string, department: typeof DEPARTMENTS[0], country: typeof COUNTRIES[0], email: string, securityNumber: number }> = [];
for (const country of COUNTRIES) {
  for (const department of DEPARTMENTS) {
    const name = names.pop();
    if (!name) throw new Error("Not enought names")
    users.push({ ...name, department, country });
  }
}

function App() {
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedUsers, setEncryptedUsers] = useState([] as { marketing: Uint8Array, hr: Uint8Array, security: Uint8Array }[]);

  const [aliceKey, setAliceKey] = useState(null as Uint8Array | null);
  const [bobKey, setBobKey] = useState(null as Uint8Array | null);
  const [charlieKey, setCharlieKey] = useState(null as Uint8Array | null);

  const [findexKeys, setFindexKeys] = useState(null as { searchKey: FindexKey, updateKey: FindexKey } | null);
  const [indexesEntries, setIndexesEntries] = useState([] as UidsAndValues);
  const [indexesChains, setIndexesChains] = useState([] as UidsAndValues);

  const [indexing, setIndexing] = useState(false);
  const [indexingDone, setIndexingDone] = useState(false);


  const [selectedKey, setSelectedKey] = useState('aliceKey' as 'aliceKey' | 'bobKey' | 'charlieKey');
  const [query, setQuery] = useState('');

  const [searchResults, setSearchResults] = useState([] as Array<{ first?: string, last?: string, department?: string, country?: string, email?: string, securityNumber?: number }>);

  const encrypt = async () => {
    setEncrypting(true);
    const { CoverCryptKeyGeneration, CoverCryptHybridEncryption } = await CoverCrypt();

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

    //
    // Key generation
    //
    const keygen = new CoverCryptKeyGeneration()
    let masterKeysCoverCrypt = await keygen.generateMasterKeys(policy);

    setAliceKey(await keygen.generateUserDecryptionKey(
      masterKeysCoverCrypt.secretKey,
      "country::France && department::Marketing",
      policy
    ))
    setBobKey(await keygen.generateUserDecryptionKey(
      masterKeysCoverCrypt.secretKey,
      "country::Spain && (department::HR || department::Marketing)",
      policy
    ))
    setCharlieKey(await keygen.generateUserDecryptionKey(
      masterKeysCoverCrypt.secretKey,
      "(country::France || country::Spain) && (department::HR || department::Marketing)",
      policy
    ))

    const policyBytes = policy.toJsonEncoded()
    const hybridCryptoEncrypt = new CoverCryptHybridEncryption(policyBytes, masterKeysCoverCrypt.publicKey)

    for (const user of users) {
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

      setEncryptedUsers((users) => [...users, {
        marketing: encryptedForMarketing,
        hr: encryptedForHr,
        security: encryptedForSecurity,
      }])
    }
    setEncrypting(false);
  };

  const index = async () => {
    setIndexing(true);
    const { upsert } = await Findex();

    let findexKeys = {
      searchKey: new FindexKey(Uint8Array.from(Array(32).keys())),
      updateKey: new FindexKey(Uint8Array.from(Array(32).keys())),
    };
    setFindexKeys(findexKeys);

    await upsert(
      users.map((user, index) => {
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
      findexKeys.searchKey,
      findexKeys.updateKey,
      FINDEX_LABEL,
      async (uids) => await fetchCallback("entries", uids),
      async (uidsAndValues) => await upsertCallback("entries", uidsAndValues),
      async (uidsAndValues) => await upsertCallback("chains", uidsAndValues),
    );

    setIndexing(false);
    setIndexingDone(true);
  };

  const fetchCallback = async (
    table: "entries" | "chains",
    uids: Uint8Array[]
  ): Promise<UidsAndValues> => {
    const results: UidsAndValues = []
    for (const requestedUid of uids) {
      for (const { uid, value } of (table === "entries" ? indexesEntries : indexesChains)) {
        if (uint8ArrayEquals(uid, requestedUid)) {
          results.push({ uid, value })
          break
        }
      }
    }
    return results
  };

  const upsertCallback = async (
    table: "entries" | "chains",
    uidsAndValues: UidsAndValues
  ): Promise<void> => {
    for (const { uid: newUid, value: newValue } of uidsAndValues) {
      for (const tableEntry of (table === "entries" ? indexesEntries : indexesChains)) {
        if (uint8ArrayEquals(tableEntry.uid, newUid)) {
          tableEntry.value = newValue
          break
        }
      }

      if (table === "entries") {
        setIndexesEntries((entries) => [...entries, { uid: newUid, value: newValue }])
      } else {
        setIndexesChains((chains) => [...chains, { uid: newUid, value: newValue }])
      }
    }
  };

  const doSearch = async () => {
    if (!query) return [];
    if (!findexKeys) throw new Error("No Findex key");

    const { search } = await Findex();
    const { CoverCryptHybridDecryption } = await CoverCrypt();

    let key;
    if (selectedKey === "aliceKey") {
      key = aliceKey
    } else if (selectedKey === "bobKey") {
      key = bobKey
    } else {
      key = charlieKey
    }
    if (!key) throw new Error("No decryption key");

    const indexedValues = await search(
      new Set([query]),
      findexKeys.searchKey,
      FINDEX_LABEL,
      1000,
      async (uids) => await fetchCallback("entries", uids),
      async (uids) => await fetchCallback("chains", uids),
    );

    let coverCryptDecryption = new CoverCryptHybridDecryption(key);

    let results = [];
    for (const indexedValue of indexedValues) {
      let encryptedUser = encryptedUsers[indexedValue.bytes[1]];
      let decryptedUser = {};

      try {
        decryptedUser = { ...decryptedUser, ...JSON.parse(decode(await coverCryptDecryption.decrypt(encryptedUser.marketing))) };
      } catch (e) {
      }
      try {
        decryptedUser = { ...decryptedUser, ...JSON.parse(decode(await coverCryptDecryption.decrypt(encryptedUser.hr))) };
      } catch (e) {
      }
      try {
        decryptedUser = { ...decryptedUser, ...JSON.parse(decode(await coverCryptDecryption.decrypt(encryptedUser.security))) };
      } catch (e) {
      }

      results.push(decryptedUser);
    }

    setSearchResults(results);
  };

  useEffect(() => {
    doSearch().catch(console.error);
  }, [selectedKey, query]); // eslint-disable-line react-hooks/exhaustive-deps

  const decode = (value: Uint8Array): string => {
    return new TextDecoder().decode(value);
  };

  const uint8ArrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) return false;

    for (let index = 0; index < a.length; index++) {
      const aValue = a[index];
      const bValue = b[index];

      if (aValue !== bValue) return false;
    }

    return true;
  };

  const showTdOrDecryptFail = (value: string | number | undefined) => {
    if (value) {
      return (<td>{value}</td>);
    } else {
      return (<td><span className="badge text-bg-danger">Impossible to decrypt</span></td>)
    }
  }

  return (
    <main className="container" >
      <h1>Cloudproof VueJS Demo </h1>

      < table className="table" >
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
          {
            users.map((user, index) => (
              <tr key={`cleartext_${index}`}>
                <td>{user.first}</td>
                <td>{user.last}</td>
                <td>{user.department}</td>
                <td>{user.country}</td>
                <td>{user.email}</td>
                <td>{user.securityNumber}</td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {
        encryptedUsers.length < users.length && <div className="d-flex justify-content-center align-items-center" >
          <button type="button" onClick={async () => await encrypt()} className="btn btn-primary btn-lg d-flex justify-content-center" disabled={encrypting} >
            {encrypting && <div className="spinner-border text-light me-3 spinner-border-sm" role="status" > </div>}
            <div>Encrypt users</div>
          </button>
        </div>}

      {
        encryptedUsers.length > 0 && <table className="table" v-show="encryptedUsers.length">
          <thead>
            <tr>
              <th scope="col">Marketing</th>
              <th scope="col">HR</th>
              <th scope="col">Security</th>
            </tr>
          </thead>
          <tbody>
            {
              encryptedUsers.map((user, index) => (
                <tr key={`encrypted_${index}`}>
                  <td>{decode(user.marketing).substring(0, 30)}…</td>
                  <td>{decode(user.hr).substring(0, 30)}…</td>
                  <td>{decode(user.security).substring(0, 30)}…</td>
                </tr>
              ))
            }
          </tbody>
        </table>}

      {
        (encryptedUsers.length === users.length && !indexingDone) && <div>
          <div className="d-flex justify-content-center align-items-center">
            <button type="button" onClick={async () => await index()} className="btn btn-primary btn-lg d-flex justify-content-center"
              disabled={indexing}>
              {indexing && <div className="spinner-border text-light me-3 spinner-border-sm" role="status" > </div>}
              <div>Index users</div>
            </button>
          </div>
        </div >}

      {
        indexingDone &&
        <div className="mb-3" >
          <div className="input-group" >
            <div className="form-check me-3" >
              <label className="form-check-label" >
                <input className="form-check-input" type="radio" checked={selectedKey === "aliceKey"} onChange={() => setSelectedKey("aliceKey")} value="aliceKey" />
                <span>Alice(France && Marketing) </span>
              </label>
            </div>
            < div className="form-check me-3" >
              <label className="form-check-label" >
                <input className="form-check-input" type="radio" checked={selectedKey === "bobKey"} onChange={() => setSelectedKey("bobKey")} value="bobKey" />
                <span>Bob(Spain && (Marketing || HR)) </span>
              </label>
            </div>
            < div className="form-check me-3" >
              <label className="form-check-label" >
                <input className="form-check-input" type="radio" checked={selectedKey === "charlieKey"} onChange={() => setSelectedKey("charlieKey")} value="charlieKey" />
                <span>Charlie((France || Spain) && (Marketing || HR)) </span>
              </label>
            </div>
          </div>
          < div className="mb-3" >
            <input type="email" className="form-control" placeholder="Recherche" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      }


      {
        searchResults.length > 0 &&
        <table className="table" v-show="searchResults.length">
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
            {
              searchResults.map((user, index) => (
                <tr key={`results_${index}`}>
                  {showTdOrDecryptFail(user.first)}
                  {showTdOrDecryptFail(user.last)}
                  {showTdOrDecryptFail(user.department)}
                  {showTdOrDecryptFail(user.country)}
                  {showTdOrDecryptFail(user.email)}
                  {showTdOrDecryptFail(user.securityNumber)}
                </tr>
              ))
            }
          </tbody>
        </table>
      }
    </main>
  );
}

export default App;
