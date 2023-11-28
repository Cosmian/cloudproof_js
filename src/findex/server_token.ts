import { WasmToken } from "../pkg/findex/cloudproof_findex"
import { loadWasm } from "./init"

export class ServerToken {
  TOKEN_LENGTH: number = 42

  public static async new(
    indexId: string,
    fetchEntriesKey: Uint8Array,
    fetchChainsKey: Uint8Array,
    upsertEntriesKey: Uint8Array,
    insertChainsKey: Uint8Array,
  ): Promise<string> {
    await loadWasm()
    const token = WasmToken.create(
      indexId,
      fetchEntriesKey,
      fetchChainsKey,
      upsertEntriesKey,
      insertChainsKey,
    )

    return token
  }
}
