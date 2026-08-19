# 选择之前前端

这是“选择之前”职业探索与能力验证平台的 React/Vite 前端。页面通过 API 服务层调用同级目录的 `backend`，前端不保存百炼密钥。

当前版本仅用于本机运行，不涉及服务器部署。默认前端地址为 `http://localhost:3000`，后端地址为 `http://127.0.0.1:8000`。

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

从职业探索进入阶段一时，当前最小试路任务固定为任务库中的 `A-02｜这个 Agent 为什么总是失败？`。作答会话通过后端保存，页面刷新后可恢复；提交后由后端调用 Qwen 按任务 Rubric 评价。

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
- `src/components/ExperienceInputScreen.tsx`：只负责页面交互和展示。

因此后续修改 UI 布局、主题和卡牌组件时，不需要改动后端请求逻辑。

## 常见问题

| 现象 | 处理方式 |
|---|---|
| 页面能打开但点击分析失败 | 检查后端是否在 `8000` 端口运行 |
| `Failed to fetch` | 检查 `.env.local` 的 `VITE_API_BASE_URL`，修改后重启 Vite |
| 后端返回 `503` | 在 `backend/.env` 配置百炼密钥，并检查额度和网络 |
| 页面仍显示旧的固定卡牌 | 确认进入的是“认识自己”分析流程，而不是首页展示或预览静态页面 |
