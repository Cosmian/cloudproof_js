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

## Results after 1% processing (searching for documentaries, limit 1000, using graphs)

```
Callbacks Before Search:
	fetchEntryTableCallbackCount 102
	fetchChainTableCallbackCount 0
	insertChainTableCallbackCount 102
	upsertEntryTableCallbackCount 102

4,336 documentaries found with Findex in 45.3ms.
1,000 documentaries found with no index in 4.31ms.
1,000 documentaries found with cleartext index in 3.33ms.

Callbacks After Search:
	fetchEntryTableCallbackCount 103
	fetchChainTableCallbackCount 907
	insertChainTableCallbackCount 102
	upsertEntryTableCallbackCount 102

94,743 movies indexed:
	SQLite index in 0.91s
	Findex index in 66.39s
94,743 movies indexed in total (7.16MB on disk)
	SQLite index in 0.91s
	Findex index in 66.39s

Table entry_table (243,030 lines) is 32.45MB
Table chain_table (579,221 lines) is 127.05MB

Cleartext indexes on disk are 16.07MB
Encrypted indexes on disk are 212.87MB (x12.24)
```
