import {
  webassembly_add_axis,
  webassembly_policy,
  webassembly_policy_axis,
} from "../../pkg/cover_crypt/cloudproof_cover_crypt"

/* tslint:disable:max-classes-per-file */
export class PolicyAxis {
  private readonly _policyAxisJson: string

  constructor(
    name: string,
    attributeProperties: Array<{ name: string; isHybridized: boolean }>,
    isHierarchical: boolean,
  ) {
    this._policyAxisJson = webassembly_policy_axis(
      name,
      attributeProperties,
      isHierarchical,
    )
  }

  public toString(): string {
    return this._policyAxisJson
  }
}

export class Policy {
  private _policyBytes: Uint8Array

  constructor(axes: PolicyAxis[]) {
    let policy = webassembly_policy()
    for (const axis of axes) {
      policy = webassembly_add_axis(policy, axis.toString())
    }
    this._policyBytes = policy
  }

  /**
   * Returns the policy bytes.
   * @returns {Uint8Array} the string
   */
  public toBytes(): Uint8Array {
    return this._policyBytes
  }

  static fromBytes(policyBytes: Uint8Array): Policy {
    const policy = new Policy([])
    policy._policyBytes = policyBytes
    return policy
  }
}
