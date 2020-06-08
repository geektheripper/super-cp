#!/usr/bin/env node
import program from "commander";
import fs from "fs";
import yaml from "js-yaml";
import Transfer, { TransferConfig } from "./transfer";

program.version(require("../package.json").version).description("Super CP!");

program
  .option("-e --environment <string>", "specify environment you use")
  .option(
    "-c --config [string]",
    "specify config files, defaults to ./super-cp.yml"
  )
  .option("--dry-run", "just output transfer config");

program.parse(process.argv);

const environment = program.environment || "default";
const configFile = program.config || "super-cp.yml";

let configFileContent = "";

try {
  configFileContent = fs.readFileSync(configFile, { encoding: "utf8" });
} catch (e) {
  console.error(`config file: ${configFile} not exist`);
  process.exit(1);
}

const config = yaml.safeLoad(configFileContent);

const transferOptionsList: TransferConfig[] | undefined =
  config.environments[environment];

if (!transferOptionsList) {
  console.error(`environment "${environment}" not defined in config file`);
  process.exit(1);
}

const transfers = transferOptionsList.map((i) => new Transfer(i));

async function run(): Promise<void> {
  try {
    for (const transfer of transfers) {
      await transfer.send({ dryRun: !!program.dryRun });
    }
  } catch (e) {
    console.error(e);
  }
}

run();
