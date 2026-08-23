# 选择之前前端

这是“选择之前”职业探索与能力验证平台的 React/Vite 前端。页面通过 API 服务层调用后端，前端不保存百炼密钥。

当前版本仅用于本机运行，不涉及服务器部署。默认前端地址为 `http://localhost:3000`，后端地址为 `http://127.0.0.1:8000`。

主流程只使用动态任务工作台和后端返回的真实评价记录；旧版固定 A-02 页面、静态报告弹窗和本地写死的全局对话浮层已移除。
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

打开 <http://localhost:3000>，进入“认识自己”，输入经历后点击“分析经历”。前端会请求 `POST /api/v1/profile/proposals`，并把后端候选卡映射成当前 UI 使用的 `SkillCard`。

上传 PDF、Word (`.docx`)、Markdown 或 TXT 材料时，前端会先调用 `POST /api/v1/profile/materials/extract` 提取可复制文本，用户核对后才进入 Qwen 候选卡流程。扫描件 OCR 和外部链接抓取暂不支持，页面会明确提示而不会生成模拟解析结果。

职业探索完成后，后端会从 12 个固定任务中选择一项最适合补充当前证据的任务。选择依据是已确认能力卡、待验证项、最近评价中的能力等级、置信度、下一步建议和已完成任务，不由大模型自由出题。前端把任务 ID 交给第三阶段工作台，再加载对应材料、五步作答 Schema、中途事件和 Coach 提示。

第三阶段分为两个阶段。第一阶段针对已选任务完成三轮能力应用推演：每轮从完整的已确认能力卡库中选择 1–3 张卡牌，后端依据固定任务评价维度返回高度适用、部分适用或关联较弱的结果。匹配过程不调用大模型，出牌结果只代表任务前判断，不直接形成评分。第二阶段进入固定三栏工作台：左侧查看并引用任务库材料，中间完成五步微型工作交付物，右侧按需使用三级 Coach 提示。出牌、作答、引用、修改和 Coach 使用都会保存到后端，本机刷新后可以续接。

页面会在浏览器本机保存当前模块、已选任务、02 的能力卡组合、03 的当前阶段和五步位置；03 的当前能力挑战、各轮选择、匹配反馈与任务作答由后端会话保存。刷新页面后会直接恢复到未完成位置。相同卡组再次请求职业建议时，后端复用已经校验的结果；任务提交和评价同样具备重复请求保护。

提交后由后端调用百炼 Qwen，按照该任务固定的隐藏 Rubric 和 L1–L5 行为锚点评价。结果页展示分项任务分、主测能力 `Observed Level`、证据依据、Coach 依赖和置信度；不会把一次任务直接显示成稳定能力等级或岗位匹配百分比。评价结果和 `Observed Evidence` 会写入本机画像概览，个人档案只展示已有来源的任务记录。

职业探索页的“出牌探索路径”会把已确认能力卡 ID 发给 `POST /api/v1/career/recommendations`。后端先检索本地岗位知识库，再调用 Qwen 返回带引用的 AI 产品经理推演；前端只展示摘要、支持性判断、未知项和引用片段，不保存或直连百炼密钥。

## 检查和构建

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
- `src/components/DynamicTrialTaskScreen.tsx`：第三阶段固定三栏工作台与评价结果。
- `src/components/TaskStepInput.tsx`：根据任务库 `input_mode` 提供流程、矩阵、排序、分类和结构化文本编辑提示。

因此后续修改 UI 布局、主题和卡牌组件时，不需要改动后端请求逻辑。

## 常见问题

| 现象 | 处理方式 |
|---|---|
| 页面能打开但点击分析失败 | 检查后端是否在 `8000` 端口运行 |
| `Failed to fetch` | 检查 `.env.local` 的 `VITE_API_BASE_URL`，修改后重启 Vite |
| 后端返回 `503` | 在后端仓库根目录的 `.env` 配置百炼密钥，并检查额度和网络；职业推演还需确认后端已建立本地知识库索引 |
| 职业探索页没有手牌 | 先完成经历分析并在确认页点击“加入能力库”；职业探索只展示已确认卡，不使用首页示例卡 |
