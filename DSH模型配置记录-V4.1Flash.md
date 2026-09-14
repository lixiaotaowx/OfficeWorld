# DSH 模型配置记录：让 DeepSeek-V4.1-Flash 出现在模型列表

> 记录日期：2026-09-10 之后
> 涉及环境：DSH（DeepSeek Harness）Web GUI — http://127.0.0.1:3080
> 涉及文件：`C:\Users\Administrator\.dsh\settings.yaml`

---

## 一、问题现象

DeepSeek 官方已发布 V4.1 模型，但在 DSH 的模型选择器里**看不到 4.1**。

## 二、官方事实（已核实）

来源：[DeepSeek API Change Log](https://api-docs.deepseek.com/updates/)

| 项目 | 结论 |
|---|---|
| 发布时间 | 2026-09-10 正式发布 **DeepSeek-V4.1-Flash** |
| 最新模型 API 名 | **`deepseek-flash`** |
| 兼容别名 | `deepseek-v4-flash`、`deepseek-v4-flash-vision-exp` 暂时路由到 V4.1 Flash |
| V4 Pro | `deepseek-v4-pro`，继续提供服务，计费不变 |
| 能力 | V4.1 Flash 是新架构家族中最小的一款，原生多模态视觉理解 |

## 三、根因分析

**结论：不是模型没上线，也不是 harness 版本旧，而是本地配置把内置模型表整体覆盖坏了。**

定位过程与依据：

1. **插件本身早已支持**
   `@deepseek-ai/dsh-llm-deepseek`（v0.1.5-rc.1）内置的 `DEFAULT_MODELS` 里**已经包含**
   `deepseek-flash`，并带图片输入配置。→ 无需升级任何包。

2. **GUI 模型列表的数据来源**
   前端 `@deepseek-ai/dsh-client-ui-model-selection` 通过 `ctx.remote.session.modelCatalog()`
   拉取目录，渲染字段是 `model.name`。
   Host 侧由 `DeepSeekAdapter.listModels()` 直接返回配置里的 `models` 数组。

3. **schema 的覆盖语义**
   `dsh-llm-deepseek` 的 `Config.models` 定义为 `z.array(catalogModel).default(DEFAULT_MODELS)`。
   YAML 数组是**整体替换，不是合并**——只要用户在 settings.yaml 里写了 `llm-deepseek.models`，
   插件内置那份正确的默认表就完全失效。

4. **你的 settings.yaml 里那段列表是坏的**
   - `deepseek-v4.1-flash-expires-on-0910` —— 编造的 id，官方根本不存在；
   - `deepseek鈥v4鈥ash鈥ision鈥xp` —— 连字符已损坏为乱码字符（U+9225 / U+618A 等），不是合法的 `-`；
   - 列表里**没有** `deepseek-flash`。

   因此真正的 V4.1 被顶掉，剩下的“4.1”项指向不存在的 id，选中也会失败。

## 四、修改内容

**只改一个文件**：`C:\Users\Administrator\.dsh\settings.yaml`
（未改任何代码、未升级包、未触碰项目文件）

### 改前

```yaml
agent-default-model:
  provider: deepseek-official
  model: deepseek-v4-pro
  reasoningEffort: high
llm-deepseek:
  models:
    - id: deepseek-v4-flash
      name: DeepSeek-V4-Flash
      contextWindow: 1000000
    - id: deepseek-v4-pro
      name: DeepSeek-V4-Pro
      contextWindow: 1000000
    - id: deepseek-v4.1-flash-expires-on-0910   # ❌ 不存在的 id
      name: deepseek-v4.1-flash
    - id: deepseek鈥v4鈥ash鈥ision鈥xp              # ❌ 连字符乱码
      name: deepseek鈥v4鈥ash鈥ision鈥xp
```

### 改后（当前）

```yaml
ui-onboarding:
  welcomeNoticeVersion: 2026-08-13.1
ui-theme:
  preference: system
agent-default-model:
  provider: deepseek-official
  model: deepseek-flash
  reasoningEffort: high
llm-deepseek:
  models:
    - id: deepseek-flash
      name: DeepSeek-V4.1-Flash
      contextWindow: 1000000
      inputModalities: [ text, image ]
    - id: deepseek-v4-pro
      name: DeepSeek-V4-Pro
      contextWindow: 1000000
    - id: deepseek-v4-flash
      name: DeepSeek-V4-Flash
      contextWindow: 1000000
    - id: deepseek-v4-flash-vision-exp
      name: DeepSeek-V4-Flash-Vision-Exp
      contextWindow: 1000000
      inputModalities: [ text, image ]
```

### 字段说明

| 字段 | 含义 |
|---|---|
| `id` | 真正发给 API 的模型名，**必须与官方一致** |
| `name` | 下拉框里显示的文字 |
| `contextWindow` | 上下文窗口，V4 系列为 1,000,000 |
| `inputModalities` | 输入模态；含 `image` 才可识图 |

## 五、生效机制（无需重启）

- `dsh-settings-file` 用 chokidar 监听 `settings.yaml`（`watch: true`），保存后自动热重载。
- 重载后发出 `settings/document-updated`，前端模型选择器收到即自动刷新目录。
- **若下拉框没刷新，刷新浏览器页面即可**，不必重启 `dsh`。

> 旁证：当前文件里 `inputModalities: [ text, image ]` 带上了空格，这是 harness 自己回写
> 序列化的风格，说明配置已被正确读取并接管。

## 六、当前状态

| 项目 | 值 |
|---|---|
| 默认模型 | `deepseek-flash`（DeepSeek-V4.1-Flash） |
| 推理等级 | `high` |
| 可选模型 | V4.1-Flash / V4-Pro / V4-Flash(别名) / V4-Flash-Vision-Exp(别名) |
| 识图能力 | 已实测通过 |

## 七、后续可调整项

- **换默认模型**：改 `agent-default-model.model`，或直接用 GUI 模型选择器（会自动回写该文件）
- **精简列表**：只保留 `deepseek-flash` + `deepseek-v4-pro` 两条，删掉兼容别名
- **补描述文案**：给条目加 `description`，下拉框会显示灰色说明文字
- **完全还原内置默认**：删除整个 `llm-deepseek:` 段即可回落 `DEFAULT_MODELS`
  （注意：内置那版把名字写成了 `DeepSeek-V41-Flash`，少一个点）

## 八、关键路径速查

| 用途 | 路径 |
|---|---|
| 用户配置 | `C:\Users\Administrator\.dsh\settings.yaml` |
| DSH 安装目录 | `C:\Users\Administrator\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh` |
| DeepSeek 适配插件 | `...\node_modules\@deepseek-ai\dsh-llm-deepseek\lib\index.js` |
| 模型选择 UI | `...\node_modules\@deepseek-ai\dsh-client-ui-model-selection\lib\client.js` |
| 设置文件加载 | `...\node_modules\@deepseek-ai\dsh-settings-file\lib\index.js` |
| Web GUI | http://127.0.0.1:3080 |

## 九、一句话总结

官方模型是 **`deepseek-flash`**；harness 早就支持；问题出在本地 `settings.yaml`
用一段带**编造 id + 乱码连字符**的列表把内置模型表整体覆盖了。修法就是重写这段列表。
