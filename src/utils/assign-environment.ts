import isObject from "lodash/isObject.js";
import isString from "lodash/isString.js";

const env = process.env;

export default function assignEnvironment(
  source: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in source) {
    if (key in source) {
      const value = source[key];
      if (isString(value) && /^\$[a-zA-Z1-9_]+$/.test(value)) {
        result[key] = env[value.substring(1)];
      } else if (isObject(value)) {
        result[key] = assignEnvironment(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
