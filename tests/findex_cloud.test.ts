import { FindexCloud, Label, Location } from ".."
import { expect, test } from "vitest"

test("Findex Cloud", async () => {
  const baseUrl = `http://${process.env.FINDEX_CLOUD_HOST || "127.0.0.1"}:${
    process.env.FINDEX_CLOUD_PORT || "8080"
  }`
  const label = Label.fromString("Some label!")

  let response
  try {
    response = await fetch(`${baseUrl}/indexes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test",
      }),
    })
  } catch (e) {
    console.log(e)

    if (
      e instanceof TypeError &&
      // @ts-expect-error
      (e.cause.message.includes("ECONNREFUSED") as boolean)
    ) {
      return
    } else {
      throw e
    }
  }

  const data = await response.json()

  const { generateNewToken, upsert, search } = await FindexCloud()

  const token = generateNewToken(
    data.public_id,
    Uint8Array.from(data.fetch_entries_key),
    Uint8Array.from(data.fetch_chains_key),
    Uint8Array.from(data.upsert_entries_key),
    Uint8Array.from(data.insert_chains_key),
  )

  await upsert(
    token,
    label,
    [
      {
        indexedValue: Location.fromNumber(42),
        keywords: ["John", "Doe"],
      },
      {
        indexedValue: Location.fromNumber(38),
        keywords: ["Alice", "Doe"],
      },
    ],
    {
      baseUrl: "http://127.0.0.1:8080",
    },
  )

  const results = (await search(token, label, ["Doe"], { baseUrl })).toNumbers()
  results.sort((a, b) => a - b)

  expect(results).toEqual([38, 42])
})
