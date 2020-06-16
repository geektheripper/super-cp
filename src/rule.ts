import { Minimatch, IMinimatch, IOptions } from "minimatch";
import Parttern, { PartternOptions } from "./pattern";

export interface RuleOptions {
  pattern: PartternOptions<IOptions>;
  exclude?: boolean;
  [key: string]: unknown;
}

export default class Rule {
  pattern: Parttern<IOptions>;
  exclude?: boolean;
  distSendOptions: { [key: string]: unknown };
  private minimatch: IMinimatch;
  constructor({ pattern, exclude, ...distSendOptions }: RuleOptions) {
    this.pattern = new Parttern(pattern);
    this.pattern.defaults({ dot: true });
    this.exclude = exclude;
    this.distSendOptions = distSendOptions;
    this.minimatch = new Minimatch(this.pattern.glob, this.pattern.options);
  }
  test(path: string): boolean {
    return this.minimatch.match(path);
  }
}
