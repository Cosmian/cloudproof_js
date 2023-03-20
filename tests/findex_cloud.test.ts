import { FindexCloud, Label, Location } from ".."
import { expect, test } from "vitest"

test("Findex Cloud", async () => {
  const baseUrl = `http://${process.env.FINDEX_CLOUD_HOST || "127.0.0.1"}:${
    process.env.FINDEX_CLOUD_PORT || "8080"
  }`
  const label = Label.fromString("Some label!")

  // We put the base URL inside an env variable to avoid polluting
  // the examples below (the examples are used inside the docs).
  // If you want to specify the base URL, it's better to use the `options.baseUrl`
  // parameter.
  process.env.FINDEX_CLOUD_BASE_URL = baseUrl

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

  const { generateNewToken } = await FindexCloud()

  const token = generateNewToken(
    data.public_id,
    Uint8Array.from(data.fetch_entries_key),
    Uint8Array.from(data.fetch_chains_key),
    Uint8Array.from(data.upsert_entries_key),
    Uint8Array.from(data.insert_chains_key),
  )

  const { upsert } = await FindexCloud()

  await upsert(token, label, [
    {
      indexedValue: Location.fromNumber(42),
      keywords: ["John", "Doe"],
    },
    {
      indexedValue: Location.fromNumber(38),
      keywords: ["Alice", "Doe"],
    },
  ])

  const { search } = await FindexCloud()

  const results = await search(token, label, ["Doe"])

  const ids = results.toNumbers()
  ids.sort((a, b) => a - b)

  expect(ids).toEqual([38, 42])
})
