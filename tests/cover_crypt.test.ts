import * as fs from "fs"
import { test } from "vitest"

import { NonRegressionVector } from "./cover_crypt.non_regression_vector"

test("Generate non-regression tests vector", async () => {
  const nonRegVector = await NonRegressionVector.generate()

  // Uncomment this code to write new test vector on disk
  fs.writeFile(
    "node_modules/non_regression_vector.json",
    nonRegVector.toJson(),
    (err: any) => {
      if (err !== null) {
        console.error(err)
      }
      // file written successfully
    },
  )
})

test("Verify non-regression vector", async () => {
  const testFolder = "tests/data/cover_crypt/non_regression/"
  fs.readdirSync(testFolder).forEach((file: string) => {
    const content = fs.readFileSync(testFolder + file, "utf8")
    const nrv = NonRegressionVector.fromJson(content)
    nrv.verify()
  })
})
