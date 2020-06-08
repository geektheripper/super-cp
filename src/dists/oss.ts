import path from "path";
import AliOss, { ACLType, Options as AliOssOptions } from "ali-oss";
import merge from "lodash/merge";
import mime from "mime";
import md5 from "../utils/md5";
import objectHash from "object-hash";
import assignEnvironment from "../utils/assign-environment";
import { DistProto, DistSendOptions } from "./dist-types";

interface OssOption extends AliOss.Options {
  path?: string;
}

interface OssSendOptions {
  headers?: Record<string, string>;
  autoMimeType?: boolean;
  acl?: ACLType;
}

const HashKey = "x-oss-meta-hash";

export default class Oss implements DistProto {
  path: string;
  private client: AliOss;
  constructor({ path, ...aliOssOptions }: OssOption) {
    this.path = path || "/";

    const _aliOssOptions = assignEnvironment(aliOssOptions) as AliOssOptions;
    this.client = new AliOss(_aliOssOptions);
  }
  async send(opts: DistSendOptions): Promise<void> {
    const rule: OssSendOptions = merge(
      {},
      ...opts.rules.map((r) => r.distSendOptions)
    );
    const { acl, autoMimeType, ...putOptions } = rule;

    const key = path.join(this.path, opts.file.key);

    const headers = putOptions.headers || {};

    if (autoMimeType && headers["Content-Type"] === undefined) {
      const type = mime.getType(opts.file.path);
      if (type) headers["Content-Type"] = type;
    }

    const file = opts.file.path;

    const hash = objectHash({ fileHash: await md5(file), acl, headers });

    headers[HashKey] = hash;

    if (opts.dryRun) {
      console.log(`${"_".repeat(80)}
File:    ${file}
Key:     ${key}
ACL:     ${acl}
Headers:
${Object.keys(headers)
  .map((key) => `    ${key}: ${headers[key]}`)
  .join("\n")}`);
      return;
    }

    try {
      const head = await this.client.head(key);
      const remoteHash = (head.res.headers as Record<string, string>)[HashKey];
      if (remoteHash === hash) {
        return;
      }
    } catch {}

    await this.client.put(key, file, { headers });

    if (acl) await this.client.putACL(key, acl);
  }
}
