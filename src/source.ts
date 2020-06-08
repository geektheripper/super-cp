import glob from "glob";
import escapeStr from "escape-string-regexp";
import File from "./file";

export interface SourceOptions {
  pattern: string;
  strip?: string;
}

type SourceListener = (file: File) => unknown;

export default class Source {
  pattern: string;
  strip: string;
  private stripRegex: RegExp;
  constructor(opts: SourceOptions) {
    this.pattern = opts.pattern;
    this.strip = opts.strip || "";
    this.stripRegex = new RegExp("^" + escapeStr(this.strip));
  }
  listFiles(): Promise<File[]> {
    return new Promise((resolve, reject) => {
      glob(this.pattern, { nodir: true }, (err, matchs) => {
        if (err) return reject(err);
        resolve(
          matchs.map(
            (path) => new File({ path, key: path.replace(this.stripRegex, "") })
          )
        );
      });
    });
  }
}
