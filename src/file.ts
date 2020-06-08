interface Headers {
  contentType?: string;
  contentEncoding?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  cacheControl?: string;
  expires?: string;
  [key: string]: string | undefined;
}

interface FileOptions {
  path: string;
  key: string;
}

export default class File {
  path: string;
  key: string;
  headers: Headers = {};
  constructor(opts: FileOptions) {
    this.path = opts.path;
    this.key = opts.key;
  }
}
