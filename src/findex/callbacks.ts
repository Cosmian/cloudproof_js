import { WasmCallbacks as WebAssemblyCallbacks } from "../pkg/findex/cloudproof_findex"
import { UidsAndValues } from "./types"

export class Callbacks {
  private readonly _callbacks: WebAssemblyCallbacks

  constructor() {
    this._callbacks = new WebAssemblyCallbacks()
  }

  public get delete(): (uids: Uint8Array[]) => Promise<void> | undefined {
    return this._callbacks.delete
  }

  public set delete(
    callback: (uids: Uint8Array[]) => Promise<void> | undefined,
  ) {
    this._callbacks.delete = callback
  }

  public get fetch(): (
    uids: Uint8Array[],
  ) => Promise<Array<{ uid: Uint8Array; value: Uint8Array }>> | undefined {
    return this._callbacks.fetch
  }

  public set fetch(
    callback: (
      uids: Uint8Array[],
    ) => Promise<Array<{ uid: Uint8Array; value: Uint8Array }>> | undefined,
  ) {
    this._callbacks.fetch = callback
  }

  public get upsert(): (
    oldValues: UidsAndValues,
    newValues: UidsAndValues,
  ) => Promise<UidsAndValues> | undefined {
    return this._callbacks.upsert
  }

  public set upsert(
    callback: (
      oldValues: UidsAndValues,
      newValues: UidsAndValues,
    ) => Promise<UidsAndValues> | undefined,
  ) {
    this._callbacks.upsert = callback
  }

  public get insert(): (
    uidsAndValues: UidsAndValues,
  ) => Promise<void> | undefined {
    return this._callbacks.insert
  }

  public set insert(
    callback: (uidsAndValues: UidsAndValues) => Promise<void> | undefined,
  ) {
    this._callbacks.insert = callback
  }
}
