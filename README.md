# Super Copy

super-cp 用于将文件传输到任意操作系统

## 安装和使用

global install

```bash
$ npm i -g super-cp
$ super-cp
```

install in project

```bash
$ npm i super-cp
$ ./node_modules/.bin/super-cp
```

## 配置

super-cp 的配置文件为项目目录下的 `.super-cp.yml`，使用如下示例文件，运行 `super-cp -e test`，即可将 dist 目录下的所有文件传到阿里云 OSS `my-bucket` 存储桶的 test 目录下，为所有的文件设置正确的 `Content-Type`，并给 dist 下的 html 文件设置 `Cache-Control`

```yaml
environments:
  test:
    - source:
        pattern: dist/**/*
        strip: dist
      dist:
        type: oss
        bucket: my-bucket
        path: /test/
      rules:
        - pattern: "*/**"
          autoContentType: true
        - pattern: "*.html"
          headers:
            cacheControl: public, max-age=60
```

### Environment

`super-cp` 运行时需要指定 `-e` 参数来指定真实使用配置集合，这对 CI/CD 环境下的多环境发布很有帮助

### Source

`source` 指定了要被传输的文件，它有以下参数

- pattern(string): 匹配文件的 glob，如 `dist/**/*`
- strip(string): 剥除的路径，比如你使用 path 指定了 `dist/**/*`，但不希望 `dist` 出现在目标目录中，就可以使用 `strip: dist`

### Dist

`dist` 指定了文件传输的目标，它有一个 type 参数指定了目标存储的类型，其他参数为对应类型的参数，目前支持的类型仅有阿里云 OSS

OSS:

- type(string): `oss`
- path(string): 路径
- type, path 之外的所有参数均会直接传给 OSS 客户端构造器，包括 `bucket` `region` `accessKeyId` `accessKeySecret`，详情参考[官方文档](https://github.com/ali-sdk/ali-oss#ossoptions)，你可以在这些值中使用 `$` 来引用环境变量，所有 `$` 开始的值会被替换成环境变量的值

### Rule

`rules` 是对文件的简单“处理”，每条规则有以下参数

- pattern(string): 匹配文件的 glob，参考 `.gitignore` 文件的匹配方式
- exclude(boolean): 匹配到的文件不进行传输
- pattern, exclude 之外的参数会传递给对应的处理器

对于阿里云 OSS，有：

- autoMimeType(boolean): 自动根据文件后缀识别并补充 `Content-Type` 元数据
- headers([key: string]: string)
- ...

你可以参考一个复杂一些例子来理解文档：[example.yaml](./example.yaml)
