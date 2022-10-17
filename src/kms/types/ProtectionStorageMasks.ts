import { metadata } from "../decorators/function"
import { TtlvType } from "../serialize/TtlvType"

export class ProtectionStorageMasks {
  @metadata({
    name: "Software",
    type: TtlvType.Integer,
  })
  public Software: number = 0x0000_0001

  @metadata({
    name: "Hardware",
    type: TtlvType.Integer,
  })
  public Hardware: number = 0x0000_0002

  @metadata({
    name: "OnProcessor",
    type: TtlvType.Integer,
  })
  public OnProcessor: number = 0x0000_0004

  @metadata({
    name: "OnSystem",
    type: TtlvType.Integer,
  })
  public OnSystem: number = 0x0000_0008

  @metadata({
    name: "OffSystem",
    type: TtlvType.Integer,
  })
  public OffSystem: number = 0x0000_0010

  @metadata({
    name: "Hypervisor",
    type: TtlvType.Integer,
  })
  public Hypervisor: number = 0x0000_0020

  @metadata({
    name: "OperatingSystem",
    type: TtlvType.Integer,
  })
  public OperatingSystem: number = 0x0000_0040

  @metadata({
    name: "Container",
    type: TtlvType.Integer,
  })
  public Container: number = 0x0000_0080

  @metadata({
    name: "OnPremises",
    type: TtlvType.Integer,
  })
  public OnPremises: number = 0x0000_0100

  @metadata({
    name: "OffPremises",
    type: TtlvType.Integer,
  })
  public OffPremises: number = 0x0000_0200

  @metadata({
    name: "SelfManaged",
    type: TtlvType.Integer,
  })
  public SelfManaged: number = 0x0000_0400

  @metadata({
    name: "OutSourced",
    type: TtlvType.Integer,
  })
  public Outsourced: number = 0x0000_0800

  @metadata({
    name: "Validated",
    type: TtlvType.Integer,
  })
  public Validated: number = 0x0000_1000

  @metadata({
    name: "SameJurisdiction",
    type: TtlvType.Integer,
  })
  public SameJurisdiction: number = 0x0000_2000
}
