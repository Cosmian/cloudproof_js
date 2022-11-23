import { Policy, PolicyAxis } from "cloudproof_js"

export const policy = new Policy([
    new PolicyAxis("Department", ["R&D", "HR", "FIN", "MKG"], false),
    new PolicyAxis(
      "Security Level",
      ["Protected", "Low Secret", "Medium Secret", "High Secret", "Top Secret"],
      true,
    ),
])
  