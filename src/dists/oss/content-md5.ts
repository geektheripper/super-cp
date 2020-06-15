// ref: https://github.com/ali-sdk/ali-oss/blob/0f3b21bb8b0f51f051284349f794669069682de8/publish-check.js
import crypto from "crypto";
import fs from "fs";

export default function caculateFileMd5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(filePath);

    const hash = crypto.createHash("md5");
    rs.on("data", hash.update.bind(hash));
    rs.on("error", (err) => {
      reject(err);
    });
    rs.on("end", () => {
      const md5Content = hash.digest("base64");
      resolve(md5Content);
    });
  });
}
