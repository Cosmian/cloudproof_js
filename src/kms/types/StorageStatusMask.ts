import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class StorageStatusMask {
  @metadata({
    name: "OnlineStorage",
    type: TtlvType.Integer,
  })
  public OnlineStorage: number = 0x0000_0001;

  @metadata({
    name: "ArchivalStorage",
    type: TtlvType.Integer,
  })
  public ArchivalStorage: number = 0x0000_0002;

  @metadata({
    name: "DestroyedStorage",
    type: TtlvType.Integer,
  })
  public DestroyedStorage: number = 0x0000_0004;
  // Extensions XXXXXXX0
}
