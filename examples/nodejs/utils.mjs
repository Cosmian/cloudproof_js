import { CoverCrypt, PolicyKms } from "cloudproof_js"

/* Importing the functions from the CoverCrypt library. */
const { Policy, PolicyAxis } = await CoverCrypt()

export const policy = new Policy([
  new PolicyAxis(
    "Security Level",
    [
      { name: "Protected", isHybridized: false },
      { name: "Low Secret", isHybridized: false },
      { name: "Medium Secret", isHybridized: false },
      { name: "High Secret", isHybridized: false },
      { name: "Top Secret", isHybridized: false },
    ],
    true,
  ),
  new PolicyAxis(
    "Department",
    [
      { name: "R&D", isHybridized: false },
      { name: "HR", isHybridized: false },
      { name: "MKG", isHybridized: false },
      { name: "FIN", isHybridized: false },
    ],
    false,
  ),
])

export const bytesPolicy = new PolicyKms(policy.toBytes())
