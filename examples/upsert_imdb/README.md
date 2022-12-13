# Upsert imdb

One example of upserting the entire IMDB database with Findex (in an in memory SQLite) to compare with SQLite without indexes and SQLite with classic indexes.

## Run

```
npm i
node index.mjs
```

## Results after 1% processing (searching for documentaries, limit 1000)

```
Callbacks Before Search:
	fetchEntryTableCallbackCount 102
	fetchChainTableCallbackCount 0
	insertChainTableCallbackCount 102
	upsertEntryTableCallbackCount 102

4,455 documentaries found with Findex in 50.32ms.
1,000 documentaries found with no index in 3.99ms.
1,000 documentaries found with cleartext index in 5.03ms.

Callbacks After Search:
	fetchEntryTableCallbackCount 103
	fetchChainTableCallbackCount 930
	insertChainTableCallbackCount 102
	upsertEntryTableCallbackCount 102

94,743 movies indexed:
	SQLite index in 0.7s
	Findex index in 14.01s
94,743 movies indexed in total (7.17MB on disk)
	SQLite index in 0.7s
	Findex index in 14.01s

Table entry_table (87,083 lines) is 11.63MB
Table chain_table (168,498 lines) is 36.96MB

Cleartext indexes on disk are 16.01MB
Encrypted indexes on disk are 64.73MB (x3.04)
```

## Results after 0.1% processing (searching for documentaries, limit 1000, using graphs)

```
Callbacks Before Search:
	fetchEntryTableCallbackCount 23
	fetchChainTableCallbackCount 0
	insertChainTableCallbackCount 23
	upsertEntryTableCallbackCount 23

262 documentaries found with Findex in 3.69ms.
262 documentaries found with no index in 1.58ms.
262 documentaries found with cleartext index in 1.81ms.

Callbacks After Search:
	fetchEntryTableCallbackCount 24
	fetchChainTableCallbackCount 63
	insertChainTableCallbackCount 23
	upsertEntryTableCallbackCount 23

10,562 movies indexed:
	SQLite index in 0.07s
	Findex index in 9.21s
10,562 movies indexed in total (0.77MB on disk)
	SQLite index in 0.07s
	Findex index in 9.21s

Table entry_table (106,444 lines) is 14.21MB
Table chain_table (139,230 lines) is 30.54MB

Cleartext indexes on disk are 1.71MB
Encrypted indexes on disk are 59.92MB (x34.1)
```
