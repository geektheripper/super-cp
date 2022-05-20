import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonFile = resolve(__dirname, "../../package.json");

export const getVersion = () =>
  JSON.parse(readFileSync(packageJsonFile, "utf-8")).version;
