#!/usr/bin/env node
import fs from "fs";

import { program } from "commander";
import yaml from "js-yaml";

import Transfer, { TransferConfig } from "./transfer.js";
import { getVersion } from "./utils/get-version.js";

program.version(getVersion()).description("Super CP!");

program
  .option("-e --environment <string>", "specify environment you use")
  .option(
    "-c --config [string]",
    "specify config files, defaults to ./super-cp.yml"
  )
  .option("--dry-run", "just output transfer config");

program.parse(process.argv);

const environment = program.getOptionValue("environment") || "default";
const configFile = program.getOptionValue("config") || "super-cp.yml";

let configFileContent = "";

try {
  configFileContent = fs.readFileSync(configFile, { encoding: "utf8" });
} catch (e) {
  console.error(`config file: ${configFile} not exist`);
  process.exit(1);
}

const config = yaml.load(configFileContent) as any;

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
      await transfer.send({ dryRun: !!program.getOptionValue("dryRun") });
    }
  } catch (e) {
    console.error(e);
  }
}

run();
