# Super Copy

super-cp 用于将文件传输到任意存储系统

目前已支持的传输目标有：

- Aliyun OSS

## 安装和使用

```bash
# 全局安装
$ npm i -g super-cp
$ super-cp
# 项目安装
$ npm i super-cp
$ ./node_modules/.bin/super-cp
```

## 配置

super-cp 使用一个配置文件来设定传输规则，一般是项目目录下的 `.super-cp.yml`，你可以使用 `--config` 手动指定使用的配置文件。

在 super-cp 中有三个重要概念：`source`，`dist` 以及 `rules`，`source` 指定需要传输的本地文件集合，`dist` 指定传输目标，`rules` 指定对传输对象的处理规则集合（例如：为对象存储添加 `Content-Type`，为服务器上的文件设置正确的权限位）。

### source

```yaml
source:
  pattern: dist/**/*
  strip: dist
```

`source` 指定了要被传输的文件，它有以下参数

- pattern(string): 用于匹配文件的 glob pattern，如 `dist/**/*`，语法可以参考 [minimatch - npm](https://www.npmjs.com/package/minimatch) 的介绍
- strip(string): 剥除路径，在上面的例子中，假设匹配到一个文件：`dist/index.html`，实际传递给目标的，是 `index.html`

### dist

```yaml
dist:
  type: "@oss"
  bucket: my-bucket
  path: /test/
```

`dist` 指定了文件传输的目标，其中 `type` 参数指定目标存储插件，其他参数将被透传给目标存储插件（目前本项目仅实现了 Aliyun OSS 目标存储插件，未来将支持使用 npm 包名来指定目标存储插件，如: `@super-cp/s3`）

### rules

```yaml
rules:
  - pattern: "*/**"
    autoContentType: true
  - pattern: "*.html"
    headers:
      cacheControl: public, max-age=60
```

`rules` 是对文件的简单“处理”，每条规则有以下参数

- pattern(string): 用于筛选文件的 glob pattern，基于 strip 之后的路径进行匹配
- exclude(boolean): exclude 是一个特殊规则，当它为 `true` 时，匹配到的文件不传输
- pattern, exclude 之外的参数会传递给对应的目标插件

### environments

```yarml
environments:
  test:
    - source:
      dist:
      rules:
  production:
    - source:
      dist:
      rules:
  documents:
    - source:
      dist:
      rules:
    - source:
      dist:
      rules:
```

`environments` 帮助你编排多组传输策略，`environments` 下的每个属性里可以有多个传输策略集合，你可以使用 `super-cp -e <environment_name>` 来使用其中的某个传输策略集，如果不指定这个参数，默认会使用名为 `default` 的策略集合。

你可以使用这个特性来实现 CI/CD 环境下的多环境发布

### tips

你可以使用 yaml 的 anchor label 来实现复用，可以参考[一个复杂的配置](./example.yml)

## OSS 插件

OSS 用于将文件传输到阿里云 OSS，它实现了自动 Mime 类型补充，以及 MD5 校验（避免重复上传相同文件）

**dist options:**

详情参考[官方文档](https://github.com/ali-sdk/ali-oss#ossoptions)

值得注意的是，所有以 `$` 开头的合法 unix 变量名均会被替换成环境变量的真实值，你可以利用这个特性载入 CI 环境的秘密环境变量

```yaml
dist:
  type: "@oss"
  path: /test/
  bucket: my-bucket
  region: $OSS_REGION
  accessKeyId: $OSS_ACCESS_KEY_ID
  accessKeySecret: $OSS_ACCESS_KEY_SECRET
```

**rule options:**

- autoMimeType(boolean): 自动根据文件后缀识别并补充 `Content-Type` 元数据
- headers([key: string]: string): 设置文件的 header 元数据

```yaml
rules:
  # 所有文件自动添加 Content-Type Headers
  - pattern: "*/**"
    autoContentType: true

  # 为根目录的 html 文件设置缓存时间为 60s
  - pattern: "*.html"
    headers:
      cacheControl: public, max-age=60
```
