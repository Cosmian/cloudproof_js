import {
  Policy,
  PolicyAxis,
  Findex,
  FindexKey,
  type UidsAndValues,
  CoverCryptHybridEncryption,
  Label,
  IndexedValue,
  Location,
  Keyword,
  CoverCrypt,
  KmsClient,
} from "cloudproof_js"
import { FormEvent, useEffect, useState } from "react"

const COUNTRIES = ["France", "Spain", "Germany"] as Array<
  "France" | "Spain" | "Germany"
>
const DEPARTMENTS = ["Marketing", "HR", "Manager"] as Array<
  "Marketing" | "HR" | "Manager"
>
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
let users: Array<User> = []
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

const CLASSES = {
  France: "text-bg-danger",
  Spain: "text-bg-warning",
  Germany: "text-bg-success",

  Marketing: "text-bg-primary opacity-50",
  HR: "text-bg-primary opacity-75",
  Manager: "text-bg-primary",
}

const DEFAULT_USER: NewUser = {
  first: "",
  last: "",
  country: "France",
  email: "",
  project: "",
}

function Key(name: keyof typeof CLASSES) {
  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center ${CLASSES[name]}`}
    >
      <svg
        xmlns=" http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        width="15px"
        className="me-1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
        />
      </svg>
      <span>{name}</span>
    </span>
  )
}

function App() {
  const [requests, setRequests] = useState([] as Request[])

  const [kmsServerUrl, setKmsServerUrl] = useState("")
  const [usingGraphs, setUsingGraphs] = useState(false)

  const [addingUser, setAddingUser] = useState(false)
  const [newUser, setNewUser] = useState(DEFAULT_USER)

  const [encrypting, setEncrypting] = useState(false)
  const [showEncryptedData, setShowEncryptedData] = useState(true)
  const [coverCryptHybridEncryption, setCoverCryptHybridEncryption] = useState(
    null as null | CoverCryptHybridEncryption,
  )
  const [encryptedUsers, setEncryptedUsers] = useState(
    [] as {
      id: number
      marketing: Uint8Array
      hr: Uint8Array
      manager: Uint8Array
    }[],
  )

  const [aliceKey, setAliceKey] = useState(null as Uint8Array | null)
  const [bobKey, setBobKey] = useState(null as Uint8Array | null)
  const [charlieKey, setCharlieKey] = useState(null as Uint8Array | null)

  const [findexKeys, setFindexKeys] = useState(
    null as { searchKey: FindexKey; updateKey: FindexKey } | null,
  )
  const [indexesEntries, setIndexesEntries] = useState([] as UidsAndValues)
  const [indexesChains, setIndexesChains] = useState([] as UidsAndValues)

  const [indexing, setIndexing] = useState(false)
  const [indexingDone, setIndexingDone] = useState(false)

  const [selectedKey, setSelectedKey] = useState(
    null as null | "aliceKey" | "bobKey" | "charlieKey",
  )
  const [doOr, setDoOr] = useState(false)
  const [query, setQuery] = useState("")

  const [searchResults, setSearchResults] = useState(
    [] as Array<{
      first?: string
      last?: string
      country?: string
      email?: string
      project?: number
    }>,
  )

  const generateCoverCryptHybridEncryption =
    async (): Promise<CoverCryptHybridEncryption> => {
      const { CoverCryptKeyGeneration, CoverCryptHybridEncryption } =
        await CoverCrypt()

      const policy = new Policy(
        [
          new PolicyAxis("department", DEPARTMENTS, true),
          new PolicyAxis("country", COUNTRIES, false),
        ],
        100,
      )
      const policyBytes = policy.toJsonEncoded()

      let masterPublicKey
      if (kmsServerUrl) {
        const client = new KmsClient(new URL(kmsServerUrl))
        const [privateMasterKeyUID, publicKeyUID] =
          await client.createAbeMasterKeyPair(policy)
        masterPublicKey = (
          await client.retrieveAbePublicMasterKey(publicKeyUID)
        ).bytes()

        let aliceUid = await client.createAbeUserDecryptionKey(
          "country::France && department::Marketing",
          privateMasterKeyUID,
        )
        setAliceKey(
          (await client.retrieveAbeUserDecryptionKey(aliceUid)).bytes(),
        )

        let bobUid = await client.createAbeUserDecryptionKey(
          // Since the "department" axis is hierarchical it's the same as "country::Spain && (department::HR || department::Marketing)"
          "country::Spain && department::HR",
          privateMasterKeyUID,
        )
        setBobKey((await client.retrieveAbeUserDecryptionKey(bobUid)).bytes())

        let charlieUid = await client.createAbeUserDecryptionKey(
          // Since the "department" axis is hierarchical it's the same as "(country::France || country::Spain) && (department::HR || department::Marketing)"
          "(country::France || country::Spain) && department::HR",
          privateMasterKeyUID,
        )
        setCharlieKey(
          (await client.retrieveAbeUserDecryptionKey(charlieUid)).bytes(),
        )
      } else {
        const keygen = new CoverCryptKeyGeneration()
        let masterKeys = keygen.generateMasterKeys(policy)
        masterPublicKey = masterKeys.publicKey

        setAliceKey(
          keygen.generateUserSecretKey(
            masterKeys.secretKey,
            "country::France && department::Marketing",
            policy,
          ),
        )
        setBobKey(
          keygen.generateUserSecretKey(
            masterKeys.secretKey,
            // Since the "department" axis is hierarchical it's the same as "country::Spain && (department::HR || department::Marketing)"
            "country::Spain && department::HR",
            policy,
          ),
        )
        setCharlieKey(
          keygen.generateUserSecretKey(
            masterKeys.secretKey,
            // Since the "department" axis is hierarchical it's the same as "(country::France || country::Spain) && (department::HR || department::Marketing)"
            "(country::France || country::Spain) && department::HR",
            policy,
          ),
        )
      }

      const newCoverCryptHybridEncryption = new CoverCryptHybridEncryption(
        policyBytes,
        masterPublicKey,
      )
      setCoverCryptHybridEncryption(newCoverCryptHybridEncryption)
      return newCoverCryptHybridEncryption
    }

  const encryptAndSaveUser = (
    coverCryptHybridEncryption: CoverCryptHybridEncryption,
    user: User,
  ) => {
    // Encrypt user personal data for the marketing team
    // of the corresponding country
    const encryptedForMarketing = coverCryptHybridEncryption.encrypt(
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
    const encryptedForHr = coverCryptHybridEncryption.encrypt(
      `department::HR && country::${user.country}`,
      new TextEncoder().encode(
        JSON.stringify({
          email: user.email,
        }),
      ),
    )

    // Encrypt the user manager level for the manager
    // team of the corresponding country
    const encryptedForManager = coverCryptHybridEncryption.encrypt(
      `department::Manager && country::${user.country}`,
      new TextEncoder().encode(
        JSON.stringify({
          project: user.project,
        }),
      ),
    )

    let data = {
      id: user.id,
      marketing: encryptedForMarketing,
      hr: encryptedForHr,
      manager: encryptedForManager,
    }

    logRequest({
      method: "POST",
      url: "/users",
      body: data,
    })
    setEncryptedUsers((users) => [...users, data])
  }

  const encrypt = async () => {
    setEncrypting(true)

    const localCoverCryptHybridEncryption =
      coverCryptHybridEncryption || (await generateCoverCryptHybridEncryption())

    for (const user of users) {
      encryptAndSaveUser(localCoverCryptHybridEncryption, user)
    }

    setEncrypting(false)
  }

  const indexUsers = async (
    localFindexKeys: Exclude<typeof findexKeys, null>,
    users: User[],
  ) => {
    const { upsert } = await Findex()

    await upsert(
      users.map((user) => {
        return {
          indexedValue: IndexedValue.fromLocation(
            new Location(Uint8Array.from([user.id])),
          ),
          keywords: new Set([
            Keyword.fromUtf8String(user.first),
            Keyword.fromUtf8String(user.last),
            Keyword.fromUtf8String(user.country),
            Keyword.fromUtf8String(user.email),
            Keyword.fromUtf8String(user.project.toString()),
          ]),
        }
      }),
      localFindexKeys.searchKey,
      localFindexKeys.updateKey,
      FINDEX_LABEL,
      async (uids) => await fetchCallback("entries", uids),
      async (uidsAndValues) => await upsertCallback("entries", uidsAndValues),
      async (uidsAndValues) => await upsertCallback("chains", uidsAndValues),
      {
        generateGraphs: usingGraphs,
      },
    )
  }

  const index = async () => {
    setIndexing(true)

    let findexKeys = {
      searchKey: new FindexKey(Uint8Array.from(Array(32).keys())),
      updateKey: new FindexKey(Uint8Array.from(Array(32).keys())),
    }
    setFindexKeys(findexKeys)

    indexUsers(findexKeys, users)

    setIndexing(false)
    setIndexingDone(true)
  }

  const fetchCallback = async (
    table: "entries" | "chains",
    uids: Uint8Array[],
  ): Promise<UidsAndValues> => {
    const results: UidsAndValues = []
    for (const requestedUid of uids) {
      for (const { uid, value } of table === "entries"
        ? indexesEntries
        : indexesChains) {
        if (uint8ArrayEquals(uid, requestedUid)) {
          results.push({ uid, value })
          break
        }
      }
    }

    logRequest({
      method: "GET",
      url: `/index_${table}`,
      body: { uids },
      response: results,
    })
    return results
  }

  const upsertCallback = async (
    table: "entries" | "chains",
    uidsAndValues: UidsAndValues,
  ): Promise<void> => {
    for (const { uid: newUid, value: newValue } of uidsAndValues) {
      for (const tableEntry of table === "entries"
        ? indexesEntries
        : indexesChains) {
        if (uint8ArrayEquals(tableEntry.uid, newUid)) {
          tableEntry.value = newValue
          break
        }
      }

      logRequest({
        method: "POST",
        url: `/index_${table}`,
        body: { uid: newUid, value: newValue },
      })
      if (table === "entries") {
        setIndexesEntries((entries) => [
          ...entries,
          { uid: newUid, value: newValue },
        ])
      } else {
        setIndexesChains((chains) => [
          ...chains,
          { uid: newUid, value: newValue },
        ])
      }
    }
  }

  const addUser = async (e: FormEvent) => {
    e.preventDefault()
    setAddingUser(true)

    let user = { id: users.length, ...newUser }
    users.push(user)

    // Only if we didn't encrypt/index yet, encrypt and index this new user otherwise wait for the global encrypt/index
    if (encryptedUsers.length > 0) {
      if (!coverCryptHybridEncryption)
        throw new Error(
          "CoverCryptHybridEncryption should be present when first encrypting is done",
        )
      encryptAndSaveUser(coverCryptHybridEncryption, user)
    }

    if (indexingDone) {
      if (!findexKeys)
        throw new Error(
          "FindexKeys should be present when first indexing is done",
        )
      await indexUsers(findexKeys, [user])
    }

    setAddingUser(false)
    setNewUser(DEFAULT_USER)
  }

  const canAccessUserClassnames = (
    user: User,
    attribute: keyof User,
  ): string => {
    if (!selectedKey) return ""
    return canAccessUser(user, attribute)
      ? "table-success"
      : "table-warning opacity-25"
  }

  const canAccessUser = (user: User, attribute: keyof User): boolean => {
    if (!selectedKey) return true

    let countries = {
      aliceKey: ["France"],
      bobKey: ["Spain"],
      charlieKey: ["France", "Spain"],
    }[selectedKey]

    if (!countries.includes(user.country)) {
      return false
    }

    let unavailableAttributes = {
      aliceKey: ["email", "project"],
      bobKey: ["project"],
      charlieKey: ["project"],
    }[selectedKey]

    if (unavailableAttributes.includes(attribute)) {
      return false
    }

    return true
  }

  const doSearch = async () => {
    if (!query) return []
    if (!selectedKey) return []
    if (!findexKeys) throw new Error("No Findex key")

    const { search } = await Findex()
    const { CoverCryptHybridDecryption } = await CoverCrypt()

    let key
    if (selectedKey === "aliceKey") {
      key = aliceKey
    } else if (selectedKey === "bobKey") {
      key = bobKey
    } else {
      key = charlieKey
    }
    if (!key) throw new Error("No decryption key")

    let keywords = query
      .split(" ")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword)
    if (keywords.length === 0) return

    let indexedValues: Array<IndexedValue> | null = null
    if (doOr) {
      indexedValues = await search(
        new Set(keywords),
        findexKeys.searchKey,
        FINDEX_LABEL,
        1000,
        async (uids) => await fetchCallback("entries", uids),
        async (uids) => await fetchCallback("chains", uids),
      )
    } else {
      for (const keyword of keywords) {
        const newIndexedValues = await search(
          new Set([keyword]),
          findexKeys.searchKey,
          FINDEX_LABEL,
          1000,
          async (uids) => await fetchCallback("entries", uids),
          async (uids) => await fetchCallback("chains", uids),
        )

        if (indexedValues === null) {
          indexedValues = newIndexedValues
        } else {
          indexedValues = indexedValues.filter(
            (alreadyReturnedIndexedValue) => {
              for (let newIndexedValue of newIndexedValues) {
                if (
                  uint8ArrayEquals(
                    newIndexedValue.bytes,
                    alreadyReturnedIndexedValue.bytes,
                  )
                ) {
                  return true
                }
              }

              return false
            },
          )
        }
      }
    }

    if (indexedValues === null)
      throw Error("Indexed values cannot be null when a query is provided")

    let coverCryptDecryption = new CoverCryptHybridDecryption(key)

    let results = []
    for (const indexedValue of indexedValues) {
      let userId = indexedValue.bytes[1]
      let encryptedUser = encryptedUsers.find(
        (encryptedUser) => encryptedUser.id === userId,
      )
      logRequest({
        method: "GET",
        url: `/users/${userId}`,
        response: encryptedUser,
      })

      if (!encryptedUser)
        throw new Error(
          "Cannot remove encrypted users so every indexed ids should be present in the encrypted database",
        )
      let decryptedUser = {}

      try {
        decryptedUser = {
          ...decryptedUser,
          ...JSON.parse(
            decode(coverCryptDecryption.decrypt(encryptedUser.marketing).plaintext),
          ),
        }
      } catch (e) {}
      try {
        decryptedUser = {
          ...decryptedUser,
          ...JSON.parse(decode(coverCryptDecryption.decrypt(encryptedUser.hr).plaintext)),
        }
      } catch (e) {}
      try {
        decryptedUser = {
          ...decryptedUser,
          ...JSON.parse(
            decode(coverCryptDecryption.decrypt(encryptedUser.manager).plaintext),
          ),
        }
      } catch (e) {}

      results.push(decryptedUser)
    }

    setSearchResults(results)
  }

  useEffect(() => {
    doSearch().catch(console.error)
  }, [selectedKey, doOr, query]) // eslint-disable-line react-hooks/exhaustive-deps

  const logRequest = (request: Request) => {
    setRequests((requests) => [...requests.slice(-19), request])
  }

  const decode = (value: Uint8Array): string => {
    return new TextDecoder().decode(value)
  }

  const stringify = (value: object): string => {
    return JSON.stringify(
      value,
      (key, value) => {
        if (value instanceof Uint8Array) {
          return decode(value).substring(0, 15)
        } else {
          return value
        }
      },
      2,
    )
  }

  const uint8ArrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) return false

    for (let index = 0; index < a.length; index++) {
      const aValue = a[index]
      const bValue = b[index]

      if (aValue !== bValue) return false
    }

    return true
  }

  const showTdOrDecryptFail = (value: string | number | undefined) => {
    if (value) {
      return <td>{value}</td>
    } else {
      return (
        <td>
          <span className="badge text-bg-dark">Impossible to decrypt</span>
        </td>
      )
    }
  }

  return (
    <div className="pb-5">
      <nav className="navbar navbar-expand-lg bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/logo.svg" alt="" style={{ height: "50px" }} />
            <span className="fw-bold ms-4">Clouproof JS Demo</span>
          </a>
        </div>
      </nav>
      <main>
        <div className="container">
          <details className="mt-3 mb-3">
            <summary id="options">Options…</summary>

            <div className="mt-3">
              <label htmlFor="kmsServerUrl" className="form-label">
                KMS Server URL
              </label>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="kmsServerUrl"
                  value={kmsServerUrl}
                  onChange={(e) => setKmsServerUrl(e.target.value)}
                  placeholder="http://localhost:9998/kmip/2_1"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() =>
                    setKmsServerUrl("http://localhost:9998/kmip/2_1")
                  }
                >
                  Localhost
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() =>
                    setKmsServerUrl(
                      "https://demo-cloudproof.cosmian.com/kms/kmip/2_1",
                    )
                  }
                >
                  Demo
                </button>
              </div>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                onChange={(e) => setUsingGraphs(e.target.checked)}
                checked={usingGraphs}
                id="usingGraphs"
              />
              <label className="form-check-label" htmlFor="usingGraphs">
                Generate graphs during indexing
              </label>
            </div>

            <hr />
          </details>

          <div className="fs-5 mb-4">
            <p>
              Cosmian has developed a new fast Symmetric Searchable Scheme (SSE)
              codenamed <strong>Findex</strong>.
            </p>

            <p>
              The scheme is not publicly available while being patented but can
              be disclosed under NDA.
            </p>

            <p>
              Likewise, and for the same reason, the Rust implementation is not
              yet publicly available but can be obtained under NDA.
            </p>

            <p>
              In this demo, it is combined with an attribute-based encryption
              scheme : <strong>CoverCrypt</strong>.
            </p>
          </div>
        </div>

        <div className="card mx-5 mb-4">
          <div className="row g-0">
            <div className="col-md-4 d-flex flex-column justify-content-center align-items-center">
              <h5 className="card-title">Cleartext Database</h5>
              <img src="/database.png" className="card-img-top" alt="..." />
            </div>
            <div className="col-md-8">
              <div className="card-body">
                <table className="table table-sm" id="table_cleartext_users">
                  <thead>
                    <tr>
                      <th colSpan={4} className="text-center">
                        <span className="me-1">{Key("Marketing")}</span>
                      </th>
                      <th colSpan={2} className="ps-2">
                        <span className="me-1">{Key("HR")}</span>
                      </th>
                      <th className="ps-2">
                        <span className="me-1">{Key("Manager")}</span>
                      </th>
                    </tr>
                    <tr>
                      <th scope="col">Firstname</th>
                      <th scope="col">Lastname</th>
                      <th scope="col">Country</th>
                      <th scope="col"></th>

                      <th scope="col">Email</th>
                      <th scope="col"></th>

                      <th scope="col">Project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={`cleartext_${index}`}>
                        <td className={canAccessUserClassnames(user, "first")}>
                          {user.first}
                        </td>
                        <td className={canAccessUserClassnames(user, "last")}>
                          {user.last}
                        </td>
                        <td
                          className={canAccessUserClassnames(user, "country")}
                        >
                          {Key(user.country)}
                        </td>
                        <td className="border-start pe-3"></td>
                        <td className={canAccessUserClassnames(user, "email")}>
                          {user.email}
                        </td>
                        <td className="border-start pe-3"></td>
                        <td
                          className={canAccessUserClassnames(user, "project")}
                        >
                          {user.project}
                        </td>
                      </tr>
                    ))}
                    <tr id="new_user_row">
                      <td>
                        <input
                          form="newUser"
                          id="new_user_first"
                          type="text"
                          placeholder="Firstname"
                          className="form-control form-control-sm"
                          value={newUser.first}
                          onChange={(e) =>
                            setNewUser({ ...newUser, first: e.target.value })
                          }
                          required
                        />
                      </td>
                      <td>
                        <input
                          form="newUser"
                          id="new_user_last"
                          type="text"
                          placeholder="Lastname"
                          className="form-control form-control-sm"
                          value={newUser.last}
                          onChange={(e) =>
                            setNewUser({ ...newUser, last: e.target.value })
                          }
                          required
                        />
                      </td>
                      <td>
                        <select
                          form="newUser"
                          id="new_user_country"
                          className="form-select form-select-sm"
                          value={newUser.country}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              country: e.target.value as any,
                            })
                          }
                          required
                        >
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border-start pe-3"></td>
                      <td>
                        <input
                          form="newUser"
                          id="new_user_email"
                          type="email"
                          placeholder="Email"
                          className="form-control form-control-sm"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          required
                        />
                      </td>
                      <td className="border-start pe-3"></td>
                      <td>
                        <form
                          onSubmit={(e) => addUser(e)}
                          id="newUser"
                          className="d-flex align-items-start"
                        >
                          <input
                            type="text"
                            id="new_user_project"
                            style={{ width: "125px" }}
                            className="form-control form-control-sm"
                            value={newUser.project}
                            onChange={(e) =>
                              setNewUser({
                                ...newUser,
                                project: e.target.value,
                              })
                            }
                            required
                          />
                          <button
                            type="submit"
                            className="ms-5 btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center"
                          >
                            {addingUser && (
                              <div
                                className="spinner-border text-light me-3 spinner-border-sm"
                                role="status"
                              ></div>
                            )}
                            {!addingUser && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                width="20px"
                                height="20px"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                                />
                              </svg>
                            )}
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

        {encryptedUsers.length < users.length && (
          <div className="d-flex justify-content-center align-items-center">
            <button
              type="button"
              id="encrypt_user"
              onClick={async () => await encrypt()}
              className="btn btn-primary btn-lg d-flex justify-content-center align-items-center"
              disabled={encrypting}
            >
              {encrypting && (
                <div
                  className="spinner-border text-light me-3 spinner-border-sm"
                  role="status"
                >
                  {" "}
                </div>
              )}
              <div>Encrypt data</div>
            </button>
          </div>
        )}

        {encryptedUsers.length > 0 && (
          <div className="position-relative mx-5 mb-4">
            <div
              className={`${
                showEncryptedData ? "position-absolute" : ""
              } pt-2 ps-4`}
              style={{ zIndex: "999" }}
            >
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="hide_encrypted"
                  checked={showEncryptedData}
                  onChange={(e) => setShowEncryptedData(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="hide_encrypted">
                  Show encrypted data
                </label>
              </div>
            </div>
            {showEncryptedData && (
              <div className="card">
                <div className="row g-0">
                  <div className="col-md-4 d-flex flex-column justify-content-center align-items-center">
                    <h5 className="card-title">Encrypted Database</h5>
                    <img
                      src="/database_encrypted.png"
                      className="card-img-top"
                      alt="..."
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <table
                        className="table table-sm"
                        id="table_encrypted_users"
                      >
                        <thead>
                          <tr>
                            <th scope="col">{Key("Marketing")}</th>
                            <th scope="col">{Key("HR")}</th>
                            <th scope="col">{Key("Manager")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {encryptedUsers.map((user, index) => (
                            <tr key={`encrypted_${index}`}>
                              <td>
                                {decode(user.marketing).substring(0, 15)}…
                              </td>
                              <td>{decode(user.hr).substring(0, 15)}…</td>
                              <td>{decode(user.manager).substring(0, 15)}…</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {encryptedUsers.length === users.length && !indexingDone && (
          <div>
            <div className="d-flex justify-content-center align-items-center">
              <button
                type="button"
                id="index"
                onClick={async () => await index()}
                className="btn btn-primary btn-lg d-flex justify-content-center align-items-center"
                disabled={indexing}
              >
                {indexing && (
                  <div
                    className="spinner-border text-light me-3 spinner-border-sm"
                    role="status"
                  >
                    {" "}
                  </div>
                )}
                <div>Index</div>
              </button>
            </div>
          </div>
        )}

        <div className="container">
          {indexingDone && (
            <div className="card mb-4">
              <div className="card-body" id="search">
                <h5 className="card-title">Search</h5>
                <div className="mb-3">
                  <div className="input-group mb-3">
                    <div className="form-check me-5">
                      <label className="form-check-label">
                        <div className="d-flex align-items-center">
                          <input
                            className="form-check-input"
                            type="radio"
                            checked={selectedKey === "aliceKey"}
                            onChange={() => setSelectedKey("aliceKey")}
                            value="aliceKey"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            width="40px"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                          <div>
                            <div className="fs-5 ms-1">Alice</div>
                            <div className="d-flex">
                              <span className="me-1">{Key("France")}</span>
                              <span>{Key("Marketing")}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="form-check me-5">
                      <label className="form-check-label">
                        <div className="d-flex align-items-center">
                          <input
                            className="form-check-input"
                            type="radio"
                            checked={selectedKey === "bobKey"}
                            onChange={() => setSelectedKey("bobKey")}
                            value="bobKey"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            width="40px"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                          <div>
                            <div className="fs-5 ms-1">Bob</div>
                            <div className="d-flex">
                              <span className="me-1">{Key("Spain")}</span>
                              <span className="me-1">{Key("Marketing")}</span>
                              <span>{Key("HR")}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="form-check me-5">
                      <label className="form-check-label">
                        <div className="d-flex align-items-center">
                          <input
                            className="form-check-input"
                            type="radio"
                            checked={selectedKey === "charlieKey"}
                            onChange={() => setSelectedKey("charlieKey")}
                            value="charlieKey"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            width="40px"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                          <div>
                            <div className="fs-5 ms-1">Charlie</div>
                            <div className="d-flex">
                              <span className="me-1">{Key("France")}</span>
                              <span className="me-1">{Key("Spain")}</span>
                              <span className="me-1">{Key("Marketing")}</span>
                              <span>{Key("HR")}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="input-group">
                      <div className="input-group-text">
                        <label
                          className="form-check-label me-2"
                          htmlFor="andOrOr"
                        >
                          AND
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="andOrOr"
                            checked={doOr}
                            onChange={(e) => setDoOr(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="andOrOr">
                            OR
                          </label>
                        </div>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Recherche"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {!query && !selectedKey && (
                  <div
                    className="alert alert-light"
                    role="alert"
                    v-show="! query && ! key"
                  >
                    Please select a key and type a query.
                  </div>
                )}
                {!query && selectedKey && (
                  <div
                    className="alert alert-light"
                    role="alert"
                    v-show="! query && ! key"
                  >
                    Please type a query.
                  </div>
                )}
                {query && !selectedKey && (
                  <div
                    className="alert alert-light"
                    role="alert"
                    v-show="! query && ! key"
                  >
                    Please select a key.
                  </div>
                )}
                {query && selectedKey && !searchResults.length && (
                  <div
                    className="alert alert-light"
                    role="alert"
                    v-show="! query && ! key"
                  >
                    No result for "<span>{query}</span>"
                  </div>
                )}

                {searchResults.length > 0 && (
                  <table
                    className="table table-sm"
                    v-show="searchResults.length"
                  >
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
                      {searchResults.map((user, index) => (
                        <tr key={`results_${index}`}>
                          {showTdOrDecryptFail(user.first)}
                          {showTdOrDecryptFail(user.last)}
                          {showTdOrDecryptFail(user.country)}
                          {showTdOrDecryptFail(user.email)}
                          {showTdOrDecryptFail(user.project)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="position-fixed bottom-0 end-0 m-4">
          <button
            className="btn btn-primary d-flex justify-content-center align-items-center "
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#requests"
            aria-controls="requests"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="20px"
              height="20px"
              className="me-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
              />
            </svg>
            <span>Show Cloud Requests</span>
          </button>
        </div>

        <div
          className="offcanvas offcanvas-end"
          data-bs-scroll="true"
          tabIndex={-1}
          id="requests"
          aria-labelledby="requestsLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="requestsLabel">
              Cloud Requests
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            {requests
              .slice()
              .reverse()
              .map((request, index) => (
                <div className="mb-1">
                  <div>
                    <span className="badge text-bg-primary me-2">
                      {request.method}
                    </span>
                    <code>{request.url}</code>
                  </div>
                  {request.body && (
                    <pre>
                      <code>{stringify(request.body)}</code>
                    </pre>
                  )}
                  {request.response && (
                    <pre>
                      <code>{stringify(request.response)}</code>
                    </pre>
                  )}
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
