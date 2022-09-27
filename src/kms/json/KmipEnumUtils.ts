// TODO: find correct types

export class KmipEnumUtils {
  public static to_string(e?: any): string {
    return e.name().replace("_", "");
  }

  public static to_map(e: any[]): string[] {
    return e.map((e) => e.to_string());
  }
}
