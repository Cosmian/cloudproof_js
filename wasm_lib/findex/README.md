<!-- # Goal: complete process for SSE/ABE including the limitations, risks and proofs. -->

Findex helps to securely make search queries on outsourced encrypted data and can be used combined with Cloudproof Encryption.

This document explains how to use Findex implementation.

# I) Theory
Findex technical documentation can be found here: *[Findex](http://gitlab.cosmian.com/other/cryptography/-/tree/main/crypto_clients/CA-TS/docs)*

<!-- TODO: Add link to deployed Findex crypto documentation -->

# II) Description of the Findex Tables
Findex relies on two server-side tables, Index Entry Table and Index Chain Table, to solve the following search problem:

    How to securely recover the UIDs of DB Table to obtain the matching lines from a given keyword?

This solution is on top of an encrypted database, called DB Table for consistency, that actually stores the content to be requested.

- Index Entry Table: provides the mandatory values to access the Index Chain Table.
- Index Chain Table: securely stores all the lists of uids from DB Table for the indexed keywords.

Each index table contains two columns: the `uid` and `value` columns where `value` is an encrypted value.

|              | uid | encrypted value |
|--------------|-----|-----------------|
| Size (bytes) | 32  | see below       |


    the encrypted value for the Index Chain Table:

|              | AES-GCM encrypted data | MAC | Nonce |
|--------------|------------------------|-----|-------|
| Size (bytes) | 32                     | 16  | 12    |

    the encrypted value for the Index Entry Table:

|              | AES-GCM encrypted data | MAC | Nonce |
|--------------|------------------------|-----|-------|
| Size (bytes) | Size_UID + Size_Key    | 16  | 12    |

    where Size_UID = 32 bytes, and Size_Key = 32 bytes.

# III) Using callbacks

Findex implementation uses callback functions in order to keep all the Findex algorithm in the same place. Those callbacks are then responsible of database queries and insertions.

Findex algorithm is implemented in Rust, and two functions are exposed:
- Upsert: index keywords from DB Table
- Search: perform query over the encrypted elements and return uids from DB Table

Those Rust functions can be used directly in Rust, and are also exposed as FFI, working with Python and Java wrappers.

# IV) Upsert function

Upsert function aims to index data from DB Table.
Takes as arguments:
- K: key of 32 bytes - known by authorized users and Directory Authority
- K*: key of 32 bytes - known by Directory Authority
- Data to index (DB Table uids and associated keywords)
- 3 callbacks to query on server-side tables:
    - fetch (uid, value) from Index Entry Table for specific uids (function `fetch_entry`)
    - upsert (uid, value) elements on Index Entry Table (function `upsert_entry`)
    - upsert (uid, value) elements on Index Chain Table (function `upsert_chain`)

## Implementation details

This diagram illustrates the `Upsert` function when Java client call Findex through FFI function.

<div class="right">

```mermaid
sequenceDiagram
    Java->>+Rust: Call FFI function `h_upsert` taking words to be indexed against DB Table uids and 3 callback functions
    Rust->>Rust: Pre-allocate Rust memory to fetch entry table items
    Rust->>Java: Run callback function `fetch_entry` (updates needed?)
    Java->>Java: SELECT uid, value FROM entry_table WHERE uid in (?,..,?)
    Java->>Rust: Copy database results to Rust buffer
    Rust->>Rust: Create new Findex indexes
    Rust->>Java: Run callback function `upsert_entry` only once
    Java->>Java: BULK INSERT OR REPLACE INTO entry_table
    Rust->>Java: Run callback function `upsert_chain` only once
    Java->>Java: BULK INSERT OR REPLACE INTO chain_table
```
</div>

# V) Search function

Search function uses the indexed elements to retrieve uids from DB Table containing the requested keywords. In another words, search function recovers all DB Table uids of the researched words.

Takes as arguments:
- K: key of 32 bytes - known by authorized users and Directory Authority
- K*: key of 32 bytes - known by Directory Authority
- Words: words to search
- 2 callbacks:
    - fetch (uid, value) from Index Entry Table for specific uids
    - fetch (uid, value) from Index Chain Table for specific uids

## Implementation details

This diagram illustrates the `Search` function when Java client call Findex through FFI function.

<div class="right">

```mermaid
sequenceDiagram
    Java->>+Rust: Call FFI function `h_search` taking words to be searched and 2 callback functions
    Rust->>Rust: Pre-allocate Rust memory to fetch entry table items
    Rust->>Java: Run callback function `fetch_entry` (any word found?)
    Java->>Java: SELECT uid, value FROM entry_table WHERE uid in (?,..,?)
    Java->>Rust: Copy database results to Rust buffer
    Rust->>Rust: Unchain the entry table values (if any) and recover all chain table uids
    Rust->>Rust: Pre-allocate Rust memory to fetch chain table items
    Rust->>Java: Run callback function `fetch_chain` with the recovered chain table uids
    Java->>Java: SELECT uid, value FROM chain_table WHERE uid in (?,..,?)
    Java->>Rust: Copy database results to Rust buffer
    Rust->>Java: Decrypt all chain table values and get all the DB Table uids
```
</div>

# VI) Launch project

### Build Rust

The crate is 2 main modules:
- `core`: contains the **Findex** algorithm with the 2 traits `Upsert` and `Search` to be implemented in external interfaces
- `interfaces`: contains interfaces such as FFI interface or WebAssembly interface (that implements the 2 **Findex** *core traits*)

To build the core only, run:

```
cargo build --release
```

To build the FFI Cosmian interfaces:

```
cargo build --release ffi
```

To build the WebAssembly interface:
```
cargo build --release wasm_bindgen
```

And finally, to build everything and test it, run:

```
cargo build --release --all-features
cargo test --release --all-features
```

### Run python
From root's repository, create a Python virtual environment and run Findex:

```
virtualenv env
source env/bin/activate
pip install -r python/requirements.txt
python python/main.py
```

The current example in main.py uses a SQLite DB, with a Users table, that can be indexed and queried from Findex implementation.

# VI) Technical elements of code implementation
### Buffer serialization

Data passed between Rust code and external callbacks is serialized using LEB128 algorithm.

LEB128 or **Little Endian Base 128** is a variable-length code compression used to store arbitrarily large integers in a small number of bytes. Here LEB128 is used to encode **byte array length**.

In Findex, 2 data structures are serialized/deserialized:
- `Vec<Vec<u8>>` (corresponding to a list of UIDs for example)
- `HashMap<Vec<u8>,Vec<u8>>` (corresponding to an list of **Entry Table** items or a list of **Chain Table** items)

#### `Vec<Vec<u8>>` serialization

Each element of the array is an byte array. Each byte array is serialized separately and written contiguously at the end of the final output byte array. Serialization has the following structure:

|              | LEB128 first byte array length | byte array | ... | LEB128 last byte array length | byte array |
|--------------|--------------------------------|------------|-----|-------------------------------|------------|
| Size (bytes) | from 1 to 8                    | n          | ... | from 1 to 8                   | n          |

Example with a vector of 100 uids of 32 bytes:

|              | LEB128 uid_1 length | uid_1 | ... | LEB128 uid_100 length | uid_100 |
|--------------|---------------------|-------|-----|-----------------------|---------|
| Size (bytes) | 1                   | 32    | ... | 1                     | 32      |

#### `HashMap<Vec<u8>,Vec<u8>>` serialization

Each element of the map is a **Key/Value** of byte arrays. First the **Key** byte array is serialized then the **Value** byte array and both are written contiguously at the end of the final output byte array. Serialization has the following structure:


|              | LEB128 first Key length | Key | LEB128 first Value length | Value | ... | LEB128 last Key length | Key | LEB128 last value length | Value |
|--------------|-------------------------|-----|---------------------------|-------|-----|------------------------|-----|--------------------------|-------|
| Size (bytes) | from 1 to 8             | n   | from 1 to 8               | n     | ... | from 1 to 8            | n   | from 1 to 8              | n     |

Example of a hashmap of 100 uids and values of Entry Table:

|              | LEB128 uid_1 length | uid_1 | LEB128 value_1 length | value_1 | ... | LEB128 uid_100 length | uid_100 | LEB128 value_100 length | value_100 |
|--------------|---------------------|-------|-----------------------|---------|-----|-----------------------|---------|-------------------------|-----------|
| Size (bytes) | 1                   | 32    | 1                     | 92      | ... | 1                     | 32      | 1                       | 92        |

#### Zoom on callback serialization

When Java client (for example) runs Findex using shared native libraries (build from Rust), here is an illustration on how data is sent:
<div class="right">

```mermaid
sequenceDiagram
    Java->>+Rust: Run FFI function
    Rust->>+Rust: Serialize data to be sent in callback function
    Rust->>+Java: Run callback function with serialized data
    Java->>Java: Deserialize data
    Java->>Java: Run database request
    Java->>Java: Serialize output database response
    Java->>Rust: Write serialized data to Rust buffer
    Rust->>Rust: Deserialize data and continue process
```
</div>


## Changes and TODOs

 - separation of concerns: in `FindexUpsert`, the methods
    ```rust
        fn fetch_entry_table_items(
        &self,
        serialized_entry_uids: &[u8],
        uids_number: usize,
    ) -> Result<Vec<u8>, SseErr>;

    fn database_upsert(
        &mut self,
        serialized_entry_table_items: &[u8],
        serialized_chain_table_items: &[u8],
    ) -> Result<(), SseErr>;
    ```
    should not take serialized bytes IMHO but rather `HashMap<Vec<u8>,Vec<u8>>`: it is up to the implementer (such as in the FFI or SQLite) to decide how to serialize (or not). The core API should concentrate on semantics and provide explicit types.


- `MasterKeys`  should hold `SymmetricCrypto::Key`s as properties, not `Vec<u8>`. Custome serializer and Deserializer should be implemented but ... do they really need to be serialized and deserialized ? (Derived Keys in particular)

- As Generics can't be passed to const argument (for the hdkf function for example) - we had to define KEY_LENGTH as a const, and can't use the length directly from T::Key. This has to be changed when we'v decide what to do with hkdf function.