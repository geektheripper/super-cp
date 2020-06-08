import _md5 from "md5";
import fs from "fs";

export default function md5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, function(err, buf) {
      if (err) {
        return reject(err);
      }
      resolve(_md5(buf));
    });
  });
}
