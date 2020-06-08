/* eslint-disable @typescript-eslint/no-explicit-any */
import isString from "lodash/isString";
import isObject from "lodash/isObject";

const env = process.env;

export default function assignEnvironment(
  source: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const value = source[key];
      if (isString(value) && /^\$[a-zA-Z1-9_]+$/.test(value)) {
        result[key] = env[value.substr(1)];
      } else if (isObject(value)) {
        result[key] = assignEnvironment(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
