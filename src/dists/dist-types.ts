import File from "../file.js";
import Rule from "../rule.js";

export interface DistSendOptions {
  file: File;
  rules: Rule[];
  dryRun: boolean;
}

export interface DistProto {
  send: (opts: DistSendOptions) => unknown | Promise<unknown>;
}
