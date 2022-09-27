import { PropertyMetadata } from "../decorators/function";
import { TtlvType } from "../serialize/TtlvType";

export class ProtectionStorageMasks {
  @PropertyMetadata({
    name: "Software",
    type: TtlvType.Integer,
  })
  public Software: number = 0x0000_0001;

  @PropertyMetadata({
    name: "Hardware",
    type: TtlvType.Integer,
  })
  public Hardware: number = 0x0000_0002;

  @PropertyMetadata({
    name: "OnProcessor",
    type: TtlvType.Integer,
  })
  public OnProcessor: number = 0x0000_0004;

  @PropertyMetadata({
    name: "OnSystem",
    type: TtlvType.Integer,
  })
  public OnSystem: number = 0x0000_0008;

  @PropertyMetadata({
    name: "OffSystem",
    type: TtlvType.Integer,
  })
  public OffSystem: number = 0x0000_0010;

  @PropertyMetadata({
    name: "Hypervisor",
    type: TtlvType.Integer,
  })
  public Hypervisor: number = 0x0000_0020;

  @PropertyMetadata({
    name: "OperatingSystem",
    type: TtlvType.Integer,
  })
  public OperatingSystem: number = 0x0000_0040;

  @PropertyMetadata({
    name: "Container",
    type: TtlvType.Integer,
  })
  public Container: number = 0x0000_0080;

  @PropertyMetadata({
    name: "OnPremises",
    type: TtlvType.Integer,
  })
  public OnPremises: number = 0x0000_0100;

  @PropertyMetadata({
    name: "OffPremises",
    type: TtlvType.Integer,
  })
  public OffPremises: number = 0x0000_0200;

  @PropertyMetadata({
    name: "SelfManaged",
    type: TtlvType.Integer,
  })
  public SelfManaged: number = 0x0000_0400;

  @PropertyMetadata({
    name: "OutSourced",
    type: TtlvType.Integer,
  })
  public Outsourced: number = 0x0000_0800;

  @PropertyMetadata({
    name: "Validated",
    type: TtlvType.Integer,
  })
  public Validated: number = 0x0000_1000;

  @PropertyMetadata({
    name: "SameJurisdiction",
    type: TtlvType.Integer,
  })
  public SameJurisdiction: number = 0x0000_2000;
}
