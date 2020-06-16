import glob from "glob";
import escapeStr from "escape-string-regexp";
import File from "./file";
import Parttern, { PartternOptions } from "./pattern";

export interface SourceOptions {
  pattern: PartternOptions<glob.IOptions>;
  strip?: string;
}

export default class Source {
  pattern: Parttern<glob.IOptions>;
  strip: string;
  private stripRegex: RegExp;
  constructor(opts: SourceOptions) {
    const { pattern, strip } = opts;
    this.pattern = new Parttern(pattern);
    this.pattern.defaults({ nodir: true });
    this.strip = strip || "";
    this.stripRegex = new RegExp("^" + escapeStr(this.strip));
  }
  listFiles(): Promise<File[]> {
    return new Promise((resolve, reject) => {
      glob(this.pattern.glob, this.pattern.options, (err, matchs) => {
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
