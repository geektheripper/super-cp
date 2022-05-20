import { DistProto } from "./dist-types.js";
export { DistProto };

type DistType = string;

export interface DistOptions {
  type: DistType;
  [key: string]: any;
}

export default async function distBuilder(
  opts: DistOptions
): Promise<DistProto> {
  if (opts.type === "@oss") {
    const Oss = (await import("./oss/index.js")).default;
    return new Oss(opts as any);
  }
  const Dist = (await import(opts.type)).default;
  return new Dist(opts);
}
