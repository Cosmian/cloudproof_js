import {
  WordMasker as WebAssemblyWordMasker,
  WordTokenizer as WebAssemblyWordTokenizer,
  WordPatternMasker as WebAssemblyWordPatternMasker,
} from "../pkg/anonymization/cloudproof_anonymization"

export class WordMasker {
  private readonly _wordMasker: WebAssemblyWordMasker

  constructor(wordsToBlock: Iterable<string>) {
    this._wordMasker = new WebAssemblyWordMasker([...wordsToBlock].join(";"))
  }

  public apply(data: string): string {
    return this._wordMasker.apply(data)
  }
}

export class WordTokenizer {
  private readonly _wordTokenizer: WebAssemblyWordTokenizer

  constructor(wordsToBlock: Iterable<string>) {
    this._wordTokenizer = new WebAssemblyWordTokenizer(
      [...wordsToBlock].join(";"),
    )
  }

  public apply(data: string): string {
    return this._wordTokenizer.apply(data)
  }
}

export class WordPatternMasker {
  private readonly _wordPatternMasker: WebAssemblyWordPatternMasker

  constructor(patternRegex: string, replaceStr: string) {
    this._wordPatternMasker = new WebAssemblyWordPatternMasker(
      patternRegex,
      replaceStr,
    )
  }

  public apply(data: string): string {
    return this._wordPatternMasker.apply(data)
  }
}
