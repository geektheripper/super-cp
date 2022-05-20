import escapeStr from "escape-string-regexp";
import glob from "glob";
import { promisify } from "util";
const pGlob = promisify(glob)

import File from "./file.js";
import Parttern, { PartternOptions } from "./pattern.js";

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
  async listFiles(): Promise<File[]> {
    const matchs = await pGlob(this.pattern.glob, this.pattern.options);
    return matchs.map(
      (path) => new File({ path, key: path.replace(this.stripRegex, "") })
    )
  }
}
