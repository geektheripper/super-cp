import { DistProto } from "./dist-types";
export { DistProto };

type DistType = string;

export interface DistOptions {
  type: DistType;
  [key: string]: string;
}

export default function distBuilder(opts: DistOptions): DistProto {
  if (opts.type === "@oss") {
    const Oss = require("./oss").default;
    return new Oss(opts);
  }
  const Dist = require(opts.type).default;
  return new Dist(opts);
}
