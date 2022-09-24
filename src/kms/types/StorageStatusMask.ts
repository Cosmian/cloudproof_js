import { PropertyMetadata } from '../decorators/function'
import { TtlvType } from '../serialize/TtlvType'

export class StorageStatusMask {
  @PropertyMetadata({
    name: 'OnlineStorage',
    type: TtlvType.Integer
  })
  public OnlineStorage: number = 0x0000_0001

  @PropertyMetadata({
    name: 'ArchivalStorage',
    type: TtlvType.Integer
  })
  public ArchivalStorage: number = 0x0000_0002

  @PropertyMetadata({
    name: 'DestroyedStorage',
    type: TtlvType.Integer
  })
  public DestroyedStorage: number = 0x0000_0004
    // Extensions XXXXXXX0
}
