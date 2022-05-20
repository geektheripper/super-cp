import merge from "lodash/merge.js";

export type PartternOptions<T> =
  | string
  | {
    glob: string;
    options?: T;
  };

export default class Parttern<T> {
  glob: string;
  options!: T;
  constructor(opts: PartternOptions<T>) {
    if (typeof opts === "string") {
      this.glob = opts;
      return;
    }
    this.glob = opts.glob;
    if (opts.options) {
      this.options = merge({}, opts.options);
    }
  }
  defaults(options: T): T {
    this.options = merge({}, options, this.options);
    return this.options;
  }
}
