import { WasmToken as WebAssemblyToken } from "../pkg/findex/cloudproof_findex"

export class ServerToken {
  TOKEN_LENGTH: number = 42

  public static new(
    indexId: string,
    fetchEntriesKey: Uint8Array,
    fetchChainsKey: Uint8Array,
    upsertEntriesKey: Uint8Array,
    insertChainsKey: Uint8Array,
  ): string {
    const token = WebAssemblyToken.create(
      indexId,
      fetchEntriesKey,
      fetchChainsKey,
      upsertEntriesKey,
      insertChainsKey,
    )

    return token
  }
}
