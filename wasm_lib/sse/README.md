<!-- # Goal: complete process for SSE/ABE including the limitations, risks and proofs. -->

The goal of this project is to outsource a directory while being able to securely make search queries on it.
This document explains the cryptographic details of the proposed solution.
As it relies on different tables on the server side, the first section describes their contain and usefulness.
Then, a second section illustrates the interactions to make a search query between the user (i.e. the application) and the server having the encrypted directory, and thus the tables presented in the first section.
Finally, a third section provides the limits and the risks of the solution and presents the limitations we choose to restrict their impacts on the security while guaranteeing efficiency.

# I) Description of the Tables

The solutions relies on three server-side tables.
Each sub-section describes their content with an illustrative example.

![](images/ServerTables.png)

## 1) DB table - Encrypted Directory

The main table of the solution is the encrypted directory.
This encryption is an hybrid encryption which means that a line of the directory is encrypted with a symmetric encryption scheme under a symmetric key also encrypted but with a public key scheme.

In our solution, the public-key scheme will have additional properties because we use an advanced public-key encryption scheme called Attribute-Based Encryption (ABE) scheme.

**To illustrate:**

Let us suppose we have in the directory in clear (i.e. non-encrypted):

Firstname | Lastname | Phone Number   | Country
----------|----------|----------------|--------
...       | ...      | ...            | ...
Martin    | Dupont   | 01 23 45 67 89 | France
...       | ...      | ...            | ...

First, each line will be encrypted under a different symmetric key. Here, the line `Martin Dupont` will be encrypted under the symmetric key $`K_p`$:

$`Enc_Sym(K_p, (Martin, Dupont, 01 23 45 67 89, France))`$

and the symmetric key will be encrypted by an ABE scheme with (master) public key $`mpk`$ and the attributes relative to the line (known by the Directory Authority):

$`Enc_ABE(mpk, Attr_α, K_p)`$

*Note:* The notations and algorithms used are given in the appendix Section [ Cryptographic Algorithms](#sec:cryptographic-algorithms).

<!-- TODO: fix the problem of internal references -->

Finally, the DB table looks like:

<!-- UID | Enc_K                         | last name                    | first name                    | ...
---------|-------------------------------|------------------------------|-------------------------------|--------
p        | $`Enc_ABE(mpk, Attr_α, K_p)`$ | $`Enc_Sym(K_p, lastname_1)`$ | $`Enc_Sym(K_p, firstname_1)`$ | ...
q        | $`Enc_ABE(mpk, Attr_δ, K_q)`$ | $`Enc_Sym(K_q, lastname_2)`$ | $`Enc_Sym(K_q, firstname_2)`$ | ...
r        | $`Enc_ABE(mpk, Attr_β, K_r)`$ | $`Enc_Sym(K_r, lastname_3)`$ | $`Enc_Sym(K_r, firstname_3)`$ | ...
s        | $`Enc_ABE(mpk, Attr_α, K_s)`$ | $`Enc_Sym(K_s, lastname_4)`$ | $`Enc_Sym(K_s, firstname_4)`$ | ...
t        | $`Enc_ABE(mpk, Attr_α, K_t)`$ | $`Enc_Sym(K_t, lastname_5)`$ | $`Enc_Sym(K_t, firstname_5)`$ | ... -->

UID | Enc_K                         | Enc_line
----|-------------------------------|----------------------------------------------
... | ...                           | ...
p   | $`Enc_ABE(mpk, Attr_α, K_p)`$ | $`Enc_Sym(K_p, (firstname_p,lastname_p,...)`$
... | ...                           | ...


Obviously, the lines in the encrypted table are not in the same order that the lines in the directory in clear.
The UIDs are random.

It is important to have a different symmetric key for each line as a user must not be able to decrypt a line without being able to decrypt the column `Enc_K`.

*Example of attack:*

A user makes a first search query and obtain the UID `p` and is able to decrypt $`Enc_ABE(mpk, Attr_α, K_p)`$ because $`Attr_α`$ matches its access rights.
The user recovers $`K_p`$ and uses it to decrypt $`Enc_Sym(K_p, lastname_1)`$, $`Enc_Sym(K_p, firstname_1)`$, and the rest of the line. Then, if another line with UID `r` is:

r  | $`Enc_ABE(mpk, Attr_β, K_p)`$ | $`Enc_Sym(K_p, lastname_3)`$ | $`Enc_Sym(K_p, firstname_3)`$ | ...

Even if $`Attr_β`$ does not match the user access rights, it can decrypt $`Enc_Sym(K_p, lastname_3)`$, $`Enc_Sym(K_p, firstname_3)`$, and the rest of the line as it already knows $`K_p`$.
This must not be possible: a user must be able to decrypt a line of the directory if and only if its access rights match the attributes chosen by the authority for that line.

<!-- Size of the table -->
About the size of DB Table,

- the number of lines is equal to the number of lines in the non-encrypted directory,
- a line is composed of:
    - `UID`: 32 bytes
    - `Enc_K`:

$`\quad`$    | gamma               | e_i_prime | e_i
-------------|---------------------|-----------|---------------------
Size (bytes) | 4+`Nb_attributes`*4 | 288       | 4+`Nb_attributes`*48

where :

- `Nb_attributes` is the number of attributes (and 4 attributes are encoded on 4 bytes)
- `gamma`, `e_i_prime` and `e_i` refer to ciphertext construction of [@GPSW06]

    - `Enc_line`:

$`\quad`$    | Additional Authenticated Data combined with the file UID | AES-GCM encrypted data | MAC
-------------|----------------------------------------------------------|------------------------|----
Size (bytes) | 12                                                       | 4068                   | 16

For this table, the total cryptographic overhead for one line is (in bytes):

crypto_overhead = 332 + `Nb_attributes` * 52 + `Nb_blocks` * 28

where:

- `Nb_blocks` = “file size” / 4068 + 1

## 2) Index Tables

The first presented table, called DB table, aims at guarantee the access rights of the directory.
The two other tables of the solution come to solve the search problem: how to recover the UIDs of the DB Table to obtain the matching lines of the directory from a keyword.

### Index Chain Table

For any searchable keyword, it exists a list of the matching entries on the (non-encrypted) directory.
The goal of Index Chain Table is to store that list *securely*.

*For example:* The keyword "Martin" is present in the lines 3, 5 and 10 of the non encrypted directory.
These lines correspond to the UIDs: $`UID_a`$, $`UID_b`$, and $`UID_c`$ of the DB Table (i.e. the encrypted directory).
The Index Chain Table will securely store $`\{UID_a,UID_b,UID_c\}`$.

<!-- Pourquoi ? -->

It is important to store the lists *securely*, and thus, encrypted because it is important to not be able to distinguish the lines of the (encrypted) directory related to a common keyword.
Otherwise, a user with some access rights can exceed its rights.

*Example of attack:* A user can decrypt `Martin Dupont, 01 23 45 67 89, executive, France`.
With its access rights, the user can not decrypt `Marie Dupont, 06 11 22 33 44, technician, France` because of the job position of Marie but, if the user learns the two lines match the keyword `Dupont`, the user learns some information about a person that it does not have access: it exceeds its rights.

The above example illustrates the importance of the encryption of the content of the lists matching the keywords.
However, it is not enough: not only the content must be protected but also the size of the lists.

*Example of attack:* If `Dupont` is a frequent family name, the length of the list will be large, on the contrary the size of the list of an uncommon family name will be small.
If the attacker can see the length of the lists, it can exploit the frequency of the keywords to retrieve the search query of an honest user which must be forbidden.

<!-- TODO: Ref de cette attaque ? This attack is described in the case of Symmetric Searchable Encryption in [??] -->

<!-- Comment ? -->

After the security remarks, let us see the content of the Index Chain Table.

We denote by $`db_{w_{i}}`$ the list of the UIDs of DB Table matching the keyword $`w_{i}`$ and $`\ell_{w_{i}}`$ its length.
To hide $`\ell_{w_{i}}`$, $`db_{w_{i}}`$ will be divided in parts of equal size $`db_{w_{i}} = \{ db_{w_{i},1}`$, $`db_{w_{i},2}`$, ..., $`db_{w_{i},x_{w_{i}}}\}`$ (potentially, the last "block" is not full).

*Note:* The size $`t`$ of a block is a common parameter for all the keywords that depends on the possibly searchable keywords and thus dependent of the use of the solution.

Then, all the parts of the list $`db_{w_{i}}`$ are encrypted with a symmetric encryption scheme under a key $`K_{w_{i}}`$ that is specific to the keyword:

$`Enc_Sym(K_{w_{i}}, db_{w_{i},1})`$, $`Enc_Sym(K_{w_{i}}, db_{w_{i},2})`$, ..., $`Enc_Sym(K_{w_{i}}, db_{w_{i},x_{w_{i}}})`$

<!-- Add explications sur $`K_{w_{i}}`$ et $`K^*`$ -->

*Note:* The key $`K_{w_{i}}`$ comes from a derivation of the key $`K^*`$ only known by the Directory Authority: $`K_{w_{i}} \leftarrow H(K^*,w_{i})`$.

<!-- TODO: CORRIGER car pas très clair et peut-être pas très juste non plus :-->
Before to store these values in Index Chain Table, one needs their respective UIDs.
It would be possible to store all of them with random UIDs but it would imply to transmit later all these UIDs to the user (as they correspond to the matching entries of its search request).
The number of these UIDs is exactly the number $`x_{w_{i}}`$ of blocks, and thus, is strictly smaller than the number of UIDs in the original list $`db_{w_{i}}`$.
However, for the same reason than the length $`\ell_{w_{i}}`$ must be hidden, $`x_{w_{i}}`$ must be hidden too.
The solution would be to repeat the same process by adding a new Index Table, and so on, but it is not practical.

To avoid that, our solution will exploit linked lists to create the UIDs of Index Chain Table:

- from $`w_i`$ and the key $`K_{w_{i}}`$, one can compute: $`H(K_{w_{i}}, w_i) \rightarrow m`$
- then, from $`m`$ and the key $`K_{w_{i}}`$, one can compute: $`H(K_{w_{i}}, m) \rightarrow k`$
- then, from $`k`$ and the key $`K_{w_{i}}`$, one can compute: $`H(K_{w_{i}}, k) \rightarrow r`$
- and so on, until to have $`x_{w_{i}}`$ values of UIDs.

At the end, instead of having $`x_{w_{i}}`$ values to transmit to the user, we only have the last value of the linked list to know the stop criterion (and the key $`K_{w_{i}}`$). This will be the goal of the last table of our solution: Index Entry Table.

<!-- Attention: Pour le chainage des chiffrements sym, il ne faut pas que l'on puisse retrouver des infos sur la clé -->

Finally, if for example $`x_{w_{i}} = 3`$, the Index Chain Table could be:

UID | Value
----|-------------------------------------
... | ...
k   | $`Enc_Sym(K_{w_{i}}, db_{w_{i},2})`$
... | ...
r   | $`Enc_Sym(K_{w_{i}}, db_{w_{i},1})`$
... | ...
m   | $`Enc_Sym(K_{w_{i}}, db_{w_{i},3})`$
... | ...

with the UIDs computed as presented above and in other lines, the lists of the UIDs of DB Table matching the other keywords also divided in blocks.

<!-- Que faire si PRF(K_w_i, message) = PRF(K_w_j, message')? Statistiquement ça ne doit pas arriver -->

<!-- Size of the table -->
About the size of Index Chain Table,

- the number of lines depends on the number of searchable keywords *and* on the number on necessary lines to store all the positions of the keywords
- a line is composed of:
    - `UID`: 32 bytes
    - `Value`:

$`\quad`$    | AES-GCM encrypted data | MAC | Nonce
-------------|------------------------|-----|------
Size (bytes) | 32                     | 16  | 12

### Index Entry Table

The goal of Index Entry Table is to store all the last values of the linked lists for all the possible keywords (i.e. tuples like ($`r`$,$`K_{w_{i}}`$) from the example of the previous section).

<!-- TODO: ci-dessous a corriger car pas vraiment vrai -->

This problematic is exactly the problem solved by the Symmetric Searchable Encryption (SSE) schemes. Seny Kamara, a researcher in this domain, wrote an interesting blog post [[link]](http://esl.cs.brown.edu/blog/how-to-search-on-encrypted-data-searchable-symmetric-encryption-part-5/#fnref:6) introducing the SSE with the historical references.

<!-- Comment ? -->
In our use case, it is possible to use a simple SSE scheme. First, for each keyword, the data is symmetricly encrypted under a common secret key $`K_2`$. Then, the UIDs are computed from a common secret key $`K_1`$.

*For Example:*
To follow the example of the previous section, if $`r`$ is the last value of the linked list and $`K_{w_{i}}`$ is the key used in Index Chain Table both for the keyword $`w_{i}`$, the data are encrypted under $`K_2`$:

$`Enc_Sym(K_{2}, (r,K_{w_{i}}))`$

Then, the UID is computed:

$`H(K_{1}, w_{i})`$

The two keys $`K_1`$ and $`K_2`$ come from a secret key $`K`$ known by all the authorized entities (i.e. the Directory Authority and all the users).

Finally, the Index Entry Table looks like:

UID                 | Value
--------------------|----------------------------------
...                 | ...
$`H(K_{1}, w_{i})`$ | $`Enc_Sym(K_{2}, (r,K_{w_{i}}))`$
...                 | ...

<!-- Size of the table -->
About the size of Index Entry Table,

- the number of lines only depends on the number of searchable keywords
- a line is composed of:
    - `UID`: 32 bytes
    - `Value`:

$`\quad`$    | AES-GCM encrypted data  | MAC | Nonce
-------------|-------------------------|-----|------
Size (bytes) | `Size_UID` + `Size_Key` | 16  | 12

where:

- `Size_UID`: 32 bytes
- `Size_Key`: 32 bytes

# II) Search Query Process

The search query process travels along the tables in the opposite order as describe in the previous section.

We recall the scenario, a user (i.e. an application) wants to make a search query on an encrypted directory hosted in an external (an untrusted) server. The goal of this section is to draw the interactions between the user and the server.

![](images/interactions.png)

In the figure below, the user query to the Index Entry Table:

![](images/IndexTable1.png)

Then, the user queries to the Index Chain Table:

![](images/IndexTable2.png)

Finally, the user queries to the DB Table:

![](images/DBTable.png)

# III) Limits

Besides all the limitations to avoid simple attacks already given all along the description of the entire process, we provide in this section, the general limits of our solution.

## 1) Requests Relative to a Keyword

The most important limit concerns the number of requests between the users and the server.
If there are not enough requests for different keywords then, the server can "see" the interactions related to a keyword.
This is true for the three tables: Index Entry Table, Index Chain Table and DB Table.
To avoid that, the simplest way is to generate fake requests to scramble the communications.

## 2) Leakages for Authorized Users

In our scenario, an authorized user interacts with the server until its gets the list of all the UIDs of DB Table matching its keyword.
Hence, even if the user can not decrypt all the lines of the directory, the user learns the number of matching lines.
It is unavoidable.
The main risk is that the user can build a statistical attack on the database.

However, the user does not learn information on the non requestable fields of the database: for example, if no keyword can be requested on the address or on the phone number in the directory, the user can not learn information on these fields.
Hence, the Directory Authority must be wise when data is added in the database and keywords must be selected carefully.

## 3) Forward Secrecy

In Symmetric Searchable Encryption, a security notion called Forward Secrecy guarantee that updates do not reveal any information a priori about the modifications they carry out.

<!-- TODO: add ref -->

In our solution there is no Forward Secrecy but again it is possible to scramble the information during changes on the directory by adding fake modifications.

# IV) Updates

## 1) Directory Updates

<!-- Les modifications sur des colonnes non requetables sont faciles et possibles directement en changeant les lignes de DB Table impactées -->

<!-- Ensuite, pour nous updates = delete + add -->
<!-- Donc on va voir comment faire ces deux étapes -->

<!-- Add -->

<!-- Delete -->

<!-- Parler de Incremental/Soft Update ? -->

<!-- Décrire tout le processus et les implications que ça a table après table -->

## 2) User Updates

<!-- Je ne sais pas s'il faut en parler ici parce que ça fait plutôt référence à de la gestion de clé -->

<!-- Parler de Hard Update ? -->

# Appendix

## A) Cryptographic Algorithms {#sec:cryptographic-algorithms}

<!-- TODO: préciser les notations des algos crypto avec l'implémentation utilisée, les standards-->

### Hash Function

- $`H(key, m)`$ : Hash-based Message Authentication Code of $`m`$ under the key $`key`$.

The implementation uses the HMAC-SHA256 scheme with a key $`key`$ of size 256 bit.

### Symmetric Scheme

- $`Enc_Sym(key, m)`$: Symmetric Encryption of $`m`$ under the key $`key`$.
- $`Dec_Sym(key, m)`$: Symmetric Decryption of $`m`$ under the key $`key`$. This algorithm "reverses" the $`Enc_Sym(key, m)`$ function. <!-- for a valid key -->

The implementation uses the AES-GCM scheme with a key $`key`$ of size 256 bit.
<!-- TODO: add ref -->

### Public-Key Scheme

- $`Enc_ABE(mpk, A, m)`$: Attribute-Based Encryption of $`m`$ with attribute $`A`$ under the key $`mpk`$.
- $`Dec_ABE(sk, C)`$: Attribute-Based Decryption of $`C`$ with secret-key $`sk`$. If the implicit policy contained in $`sk`$ matches the implicit attributes contained in $`C`$, it "reverses" the $`Enc_ABE(mpk, A, m)`$ function.

The implementation uses GPSW ABE [[link]](https://github.com/Cosmian/abe_gpsw). The keys are of size:

- master secret key $`msk`$:
- master public key $`mpk`$:
- secret key $`sk`$: <!-- en nombre d'attributs surement -->

<!-- TODO: a compléter -->

## B) Keys

Key     | Size (bits) | Known by
--------|-------------|--------------------
$`K`$   | 256         | All
$`K^*`$ | 256         | Directory Authority
$`msk`$ |             | Directory Authority
$`mpk`$ |             | All
$`sk`$  |             | User


For the column "Known by",

- 'All' means all the authorized users and the Directory Authority,
- 'User' means that the key is different for each user and depends on its policy

# References

