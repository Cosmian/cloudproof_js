export class FindexMasterKey {
  private readonly k: string;
  private readonly k_star: string;

  constructor(keys: { k: string; k_star: string }) {
    this.k = keys.k;
    this.k_star = keys.k_star;
  }

  public get key(): Uint8Array {
    return Buffer.from(this.k, "base64");
  }

  public get key_star(): Uint8Array {
    return Buffer.from(this.k_star, "base64");
  }
}
