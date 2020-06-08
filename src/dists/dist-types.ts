import File from "../file";
import Rule from "../rule";

export interface DistSendOptions {
  file: File;
  rules: Rule[];
  dryRun: boolean;
}

export interface DistProto {
  send: (opts: DistSendOptions) => unknown | Promise<unknown>;
}
