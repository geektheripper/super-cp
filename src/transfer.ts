import Source, { SourceOptions } from "./source";
import Rule, { RuleOptions } from "./rule";
import distBuilder, { DistOptions, DistProto } from "./dists";

export interface TransferConfig {
  source: SourceOptions;
  dist: DistOptions;
  rules: RuleOptions[];
}

export interface TransferSendOptions {
  parallel?: number;
  dryRun?: boolean;
}

export default class Transfer {
  source: Source;
  dist: DistProto;
  rules: Rule[];

  constructor(opts: TransferConfig) {
    this.source = new Source(opts.source);
    this.dist = distBuilder(opts.dist);
    this.rules = opts.rules.map((i) => new Rule(i));
  }

  async send(opts?: TransferSendOptions): Promise<unknown> {
    const parallel = opts?.parallel || 8;
    const dryRun = opts?.dryRun || false;

    const files = await this.source.listFiles();

    const sendFile = async (
      resolve: () => void,
      reject: (e: Error) => void
    ): Promise<void> => {
      try {
        const file = files.pop();
        if (!file) return resolve();
        const rules = this.rules.filter((r) => r.test(file.key));
        await this.dist.send({ file, rules, dryRun });
        sendFile(resolve, reject);
      } catch (e) {
        reject(e);
      }
    };

    const promises: Promise<unknown>[] = [];

    for (let i = 0; i < parallel; i++) {
      promises.push(
        new Promise((resolve, reject) => sendFile(resolve, reject))
      );
    }

    return await Promise.all(promises);
  }
}
