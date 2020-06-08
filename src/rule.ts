import { Minimatch, IMinimatch } from "minimatch";

export interface RuleOptions {
  pattern: string;
  exclude?: boolean;
  [key: string]: unknown;
}

export default class Rule {
  pattern: string;
  exclude?: boolean;
  distSendOptions: { [key: string]: unknown };
  private minimatch: IMinimatch;
  constructor({ pattern, exclude, ...distSendOptions }: RuleOptions) {
    this.pattern = pattern;
    this.exclude = exclude;
    this.distSendOptions = distSendOptions;
    this.minimatch = new Minimatch(this.pattern);
  }
  test(path: string): boolean {
    return this.minimatch.match(path);
  }
}
