import path from "path";

import AliOss from "ali-oss";
import merge from "lodash/merge.js";
import mime from "mime";
import objectHash from "object-hash";

import assignEnvironment from "../../utils/assign-environment.js";
import { DistProto, DistSendOptions } from "../dist-types.js";

import caculateFileMd5 from "./content-md5.js";

export interface OssOption
  extends Omit<AliOss.Options, "accessKeyId" | "accessKeySecret"> {
  path?: string;
}

interface OssSendOptions {
  headers?: Record<string, string>;
  autoMimeType?: boolean;
  acl?: AliOss.ACLType;
}

enum HeaderKeys {
  ContentType = "Content-Type",
  // can't get same content-md5 with oss server
  ContentMd5 = "x-oss-meta-content-type",
  HeadersHash = "x-oss-meta-headers-hash",
  Acl = "x-oss-object-acl",
}

export default class Oss implements DistProto {
  path: string;
  private client: AliOss;
  private bucketAcl: AliOss.ACLType | null = null;
  private ossOptions: AliOss.Options;
  constructor({ path, ...aliOssOptions }: OssOption) {
    this.path = path || "/";

    this.ossOptions = assignEnvironment(aliOssOptions) as AliOss.Options;
    this.client = new AliOss(this.ossOptions);
  }
  async getBucketAcl(): Promise<AliOss.ACLType> {
    if (!this.bucketAcl) {
      const result = await this.client.getBucketACL(
        this.ossOptions.bucket as string,
        {}
      );
      this.bucketAcl = result.acl as AliOss.ACLType;
    }
    return this.bucketAcl;
  }
  async send(opts: DistSendOptions): Promise<void> {
    const rule: OssSendOptions = merge(
      {},
      ...opts.rules.map((r) => r.distSendOptions)
    );

    const key = path.join(this.path, opts.file.key);

    const headers = rule.headers || {};

    if (rule.autoMimeType && headers[HeaderKeys.ContentType] === undefined) {
      const type = mime.getType(opts.file.path);
      if (type) headers[HeaderKeys.ContentType] = type;
    }

    const bucketAcl = await this.getBucketAcl();
    const acl = rule.acl || bucketAcl;

    const file = opts.file.path;
    headers[HeaderKeys.HeadersHash] = objectHash(headers);
    headers[HeaderKeys.ContentMd5] = await caculateFileMd5(file);

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

    let remoteHeaders: Record<string, string> = {};

    try {
      const head = await this.client.head(key);
      remoteHeaders = head.res.headers as Record<string, string>;
    } catch {
      //
    }

    // object content changed
    // can't reset header for object via aliyun oss api
    if (
      remoteHeaders[HeaderKeys.ContentMd5] !== headers[HeaderKeys.ContentMd5] ||
      remoteHeaders[HeaderKeys.HeadersHash] !== headers[HeaderKeys.HeadersHash]
    ) {
      await this.client.put(key, file, { headers });
      if (bucketAcl !== acl) {
        await this.client.putACL(key, acl);
      }
      return;
    }

    // `head` api response not includes acl info
    const aclInfo = await this.client.getACL(key);

    // object acl changed
    if (aclInfo.acl !== acl) {
      await this.client.putACL(key, acl);
    }
  }
}
