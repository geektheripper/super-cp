import minimatch from "minimatch";

import Parttern, { PartternOptions } from "./pattern.js";

export interface RuleOptions {
  pattern: PartternOptions<minimatch.IOptions>;
  exclude?: boolean;
  [key: string]: unknown;
}

export default class Rule {
  pattern: Parttern<minimatch.IOptions>;
  exclude?: boolean;
  distSendOptions: { [key: string]: unknown };
  private minimatch: minimatch.IMinimatch;
  constructor({ pattern, exclude, ...distSendOptions }: RuleOptions) {
    this.pattern = new Parttern(pattern);
    this.pattern.defaults({ dot: true });
    this.exclude = exclude;
    this.distSendOptions = distSendOptions;
    this.minimatch = new minimatch.Minimatch(this.pattern.glob, this.pattern.options);
  }
  test(path: string): boolean {
    return this.minimatch.match(path);
  }
}
