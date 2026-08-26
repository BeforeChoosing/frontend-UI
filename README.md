# 选择之前前端

这是“选择之前”职业探索与能力验证平台的 React/Vite 前端。页面通过 API 服务层调用后端，前端不保存百炼密钥。

当前版本仅用于本机运行，不涉及服务器部署。默认前端地址为 `http://localhost:3000`，后端地址为 `http://127.0.0.1:8000`。

正式模式只使用动态任务工作台和后端返回的真实评价记录；旧版固定 A-02 页面、静态报告弹窗和本地写死的全局对话浮层已移除。
首页展示卡仅用于说明产品结构，不会写入个人能力库；能力卡必须经过后端经历分析和用户确认后才会进入后续职业推演。

## 前置条件

- macOS/Linux：Node.js 18+（推荐 Node.js 20+）和 npm。
- Windows：Node.js 18+（推荐 Node.js 20+）和 npm，命令示例使用 PowerShell。
- 完整联调时，需要先启动后端并配置百炼 Qwen。

## 第一次安装

macOS/Linux，在当前目录执行：

```bash
npm install
cp .env.example .env.local
```

Windows PowerShell，在当前目录执行：

```powershell
npm install
Copy-Item .env.example .env.local
```

`.env.local` 是前端本机配置文件，仅用于保存后端 API 地址，不提交 Git：

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

后端端口变化时，修改 `VITE_API_BASE_URL` 并重启 Vite。`DASHSCOPE_API_KEY` 只配置在后端 `.env`，不放入前端环境变量。

## 启动前端

```bash
npm run dev
```

页面地址：<http://localhost:3000>

停止服务：在运行窗口按 `Ctrl+C`。

## 运行模式

页面提供全局运行模式切换。首次启动默认为正式模式，最近一次选择会保存在浏览器本机。

- 演示模式：与正式模式使用相同页面、文案、按钮和操作流程。经历文本、候选能力卡、职业建议、任务材料、五步作答和评价结果已经预填，适合现场完整演示。三轮能力应用仍从 0/3 开始，五步任务仍从 0/5 开始，需要按正式流程完成操作。
- 正式模式：从空白经历开始，使用用户输入、后端会话、本地 RAG 与百炼 Qwen 完成完整流程。经历分析、职业建议、Coach 和任务评价只在用户执行对应操作时调用。

两种模式分别保存经历草稿、能力探索对话、任务步骤和会话标识，切换模式不会覆盖另一种模式的进度。界面层面的区别仅为演示模式已经预填内容；演示模式仍需启动后端读取比赛资料中的固定任务定义。预填内容本身不会产生付费模型调用，用户主动发送能力教练消息时会调用一次 Qwen。

## 完整前后端联调

需要两个终端。

终端一，在后端仓库根目录启动 API：

```bash
conda activate before-choosing-demo
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

终端二，在当前目录启动前端：

```bash
npm run dev
```

打开 <http://localhost:3000>，进入“认识自己”，先在经历草稿中整理事实，再按需通过独立的“补充交流”输入框联系能力教练。经历草稿按 Enter 只会换行并持续保存在当前浏览器；教练消息仅在点击“发送给能力教练”后，经后端 `POST /api/v1/profile/exploration/messages` 调用 Qwen。相同经历与对话会复用后端缓存，不重复产生模型调用。

确认经历内容后点击“分析经历”。前端会请求 `POST /api/v1/profile/proposals`，并把后端候选卡映射成当前 UI 使用的 `SkillCard`。能力教练交流用于补齐本人职责、判断依据、限制条件、协作过程和实际结果，不会替代用户经历原文，也不会直接写入最终能力档案。

上传 PDF、Word (`.docx`)、Markdown 或 TXT 材料时，前端会先调用 `POST /api/v1/profile/materials/extract` 提取可复制文本，用户核对后才进入 Qwen 候选卡流程。扫描件 OCR 和外部链接抓取暂不支持，页面会明确提示而不会生成模拟解析结果。

职业探索完成后，后端会从 12 个固定任务中选择一项最适合补充当前证据的任务。选择依据是已确认能力卡、待验证项、最近评价中的能力等级、置信度、下一步建议和已完成任务，不由大模型自由出题。前端把任务 ID 交给第三阶段工作台，再加载对应材料、五步作答 Schema、中途事件和 Coach 提示。

第三阶段分为两个阶段。第一阶段针对已选任务按顺序完成三轮能力应用推演：每轮从完整的已确认能力卡库中选择 1–3 张卡牌，后端依据固定任务评价维度返回高度适用、部分适用或关联较弱的结果。后续挑战在前一轮完成后解锁；三轮全部完成后才能查看任务简报。匹配过程不调用大模型，出牌结果只代表任务前判断，不直接形成评分。第二阶段先展示任务背景、交付步骤和资料简报，再进入独立工作台。工作台上方用于阅读并引用任务库材料，下方用于完成五步微型工作交付物，右侧按需使用三级 Coach 提示。出牌、作答、引用、修改和 Coach 使用都会保存到后端。

页面会在浏览器本机保存当前模块、已选任务、02 的能力卡组合和五步位置；03 的当前能力挑战、各轮选择、匹配反馈与任务作答由后端会话保存。每次进入 03 都先显示三轮挑战进度，已完成轮次无需重做，再由用户明确进入任务简报。相同卡组再次请求职业建议时，后端复用已经校验的结果；相同能力探索内容、候选卡输入、任务提交和评价同样具备重复请求保护。

提交后由后端调用百炼 Qwen，按照该任务固定的隐藏 Rubric 和 L1–L5 行为锚点评价。结果页展示分项任务分、主测能力 `Observed Level`、证据依据、Coach 依赖和置信度；不会把一次任务直接显示成稳定能力等级或岗位匹配百分比。评价结果和 `Observed Evidence` 会写入本机画像概览，个人档案只展示已有来源的任务记录。

职业探索页的“出牌探索路径”会把已确认能力卡 ID 发给 `POST /api/v1/career/recommendations`。后端先检索本地岗位知识库，再调用 Qwen 返回带引用的 AI 产品经理推演；前端只展示摘要、支持性判断、未知项和引用片段，不保存或直连百炼密钥。

## 检查和构建

状态一致性回归测试：

```bash
npm run test:state
```

类型检查：

```bash
npm run lint
```

生产构建：

```bash
npm run build
```

`npm run build` 生成的 `dist/` 和单文件预览产物仅用于本机预览，相关路径已加入 `.gitignore`。只想启动开发页面时不需要执行构建。

预览生产构建：

```bash
npm run preview
```

## 当前接入边界

- `src/api/`：HTTP 请求和 API DTO。
- `src/features/profile/profileAdapter.ts`：后端候选卡到前端 `SkillCard` 的转换。
- `src/hooks/useExperienceAnalysis.ts`：加载、成功、失败状态。
- `src/hooks/useDynamicTrialTask.ts`：动态任务加载、会话续接、Coach、事件与提交状态。
- `src/hooks/useProfileCards.ts`：能力卡、任务证据和画像版本的读取与保存。
- `src/components/ExperienceInputScreen.tsx`：只负责页面交互和展示。
- `src/components/DynamicTrialTaskScreen.tsx`：第三阶段出牌、任务状态与评价结果编排。
- `src/components/TrialWorkbenchScreen.tsx`：任务简报、资料预览和独立实战工作台。
- `src/components/TaskStepInput.tsx`：根据任务库 `input_mode` 提供流程、矩阵、排序、分类和结构化文本编辑提示。

因此后续修改 UI 布局、主题和卡牌组件时，不需要改动后端请求逻辑。

## 常见问题

| 现象 | 处理方式 |
|---|---|
| 页面能打开但点击分析失败 | 检查后端是否在 `8000` 端口运行 |
| `Failed to fetch` | 检查 `.env.local` 的 `VITE_API_BASE_URL`，修改后重启 Vite |
| 后端返回 `503` | 在后端仓库根目录的 `.env` 配置百炼密钥，并检查额度和网络；职业推演还需确认后端已建立本地知识库索引 |
| 职业探索页没有手牌 | 先完成经历分析并在确认页点击“加入能力库”；职业探索只展示已确认卡，不使用首页示例卡 |
