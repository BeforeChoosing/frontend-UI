# Design QA: 首页底部展示

- Source visual truth: `/var/folders/88/s9yw6y8d1mn_4npcx9wdld4m0000gn/T/codex-clipboard-fc919e04-d5cf-4e16-bbc9-61ccdd4d6f79.png`
- Implementation screenshot: `.tmp/home-bottom-implementation-final.png`
- Combined comparison: `.tmp/home-bottom-comparison.png`
- Source pixels: 2396 × 948; reference content is a Retina capture, interpreted as approximately 1198 × 474 CSS px at 2× density.
- Implementation pixels: 1274 × 717; browser-reported viewport 1280 × 720 CSS px, browser DPR 2.
- State: 演示模式首页，滚动至页面底部。
- Density normalization: visual comparison used equal displayed widths; the implementation was additionally checked at the browser-reported CSS viewport.

## Full-view comparison evidence

The combined comparison confirms the same two-level composition: one centered title, five pastel user-story tiles, a thin divider, and four centered award items. The implementation includes the tail of the preceding card-style section because the live page is taller than the cropped reference; this is outside the requested bottom section.

## Focused region comparison evidence

The browser-rendered bottom section was inspected directly. All five people, their labels and descriptions, the divider, and all four award items are visible without overlap at the desktop breakpoint. The Apple mark intentionally uses `` instead of the apple emoji, following the established project requirement.

## Required fidelity surfaces

- Fonts and typography: display serif hierarchy, centered title, compact labels, and muted descriptions match the existing Demo implementation.
- Spacing and layout rhythm: five-column user grid and four-column award grid match the reference; section spacing and divider remain intact.
- Colors and visual tokens: pastel green, amber, blue, stone, and rose tiles match the reference palette.
- Image quality and asset fidelity: the restored implementation reuses the original Demo symbols and existing visual treatment; no placeholder asset was introduced.
- Copy and content: title, five personas, STEPHEN description, and four award labels/descriptions match the original Demo. The `` mark is the only intentional content-level deviation.

## Findings

No actionable P0, P1, or P2 mismatch remains in the requested section.

## Comparison history

- Initial comparison: copy drift was found in the title, STEPHEN description, and four award descriptions.
- Fix: restored the original Demo copy and retained the required `` mark.
- Post-fix evidence: `.tmp/home-bottom-implementation-final.png`; layout and copy verified in the browser with no console warnings or errors.

## Primary interactions and runtime checks

- Persona tiles remain clickable and continue to enter the exploration flow.
- Browser console warnings/errors: none.
- Responsive source structure remains `2 / 3 / 5` columns for persona tiles and `2 / 4` columns for awards.

final result: passed

---

# Design QA: 01 探索目标、Profile Skills 与成长陪伴追问

- Source visual truth: `codex-clipboard-7ac9b57a-297a-48a0-be76-5e4cd5b6308d.png`, `codex-clipboard-5c77d0b8-d4e3-4aeb-a88d-0950483a73bb.png`, `codex-clipboard-247249f1-bc8a-4643-abea-97e3619c4367.png`, `codex-clipboard-e95c7941-367e-4150-a517-6bfea38f8a88.png`, `codex-clipboard-cff09ac4-7aa8-436d-b141-fef93c1e7bcf.png`, `codex-clipboard-8a051c75-7c78-44ed-bba5-d3e29222d6bc.png`, `codex-clipboard-6ccdd29a-85d9-4018-b5c3-ec53c0745910.png`
- State: 演示模式·01 认识自己·已预填「AI 产品经理」。
- Viewports: 默认桌面视口与 390 × 844 窄屏视口。

## Required fidelity surfaces

- 探索目标保留双选项胶囊，已选状态使用深色填充；有目标时展示可编辑岗位。
- 目标岗位编辑态采用完整胶囊容器、显式确认和取消操作，不再显示浏览器原生矩形输入框。
- Profile Skills 使用独立弹层，Skill 统一为 `/extract`、`/experience`、`/target`，并声明前置条件与输出边界。
- 输入框输入 `/` 时打开 Skill 菜单；完整 Skill 按 Enter 后执行对应操作，不会追加为聊天消息。
- 演示模式发送预填经历后先显示固定打字机回复，再进入四轮成长陪伴追问；四轮均由用户实际选择或填写。
- 390 px 宽度下，目标选项、岗位标签、四轮追问卡与输入区域均可见，无横向溢出（`scrollWidth === clientWidth`）。

## Runtime checks

- `/target` 执行后输入框清空，目标岗位编辑框获得焦点；Enter 确认，Escape 取消。
- 正式模式执行 Skill 时复用现有审计接口记录 `profile_skill_invoked` 事件；演示模式不落库。
- 演示固定回复在进入 `exploreProfile` 前完成分流，不产生 Qwen 调用；系统减少动态效果时直接展示完整回复。
- 四轮追问全部完成后进入候选能力卡确认页。
- 页面控制台无 error 日志。
- TypeScript 检查、21 项状态回归与生产构建通过。

final result: passed
