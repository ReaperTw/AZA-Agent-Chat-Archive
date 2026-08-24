# AZA AI Chat Archive

把 Web 對話匯出器與本機 Agent 對話歸檔 Skill 放在同一個發布庫，但維持各自獨立安裝。只下載自己需要的平台即可。

目前統整版本：`1.0.0`

## 可下載項目

| 項目 | 類型 | 用途 | 原始檔 |
| --- | --- | --- | --- |
| GYC - ChatGPT | Tampermonkey userscript | 從 ChatGPT 網頁匯出 Markdown | [`gyc-chatgpt.user.js`](userscripts/gyc-chatgpt.user.js) |
| GYC - Gemini | Tampermonkey userscript | 從 Gemini 網頁匯出 Markdown | [`gyc-gemini.user.js`](userscripts/gyc-gemini.user.js) |
| GYC - Grok | Tampermonkey userscript | 從 Grok 網頁匯出 Markdown | [`gyc-grok.user.js`](userscripts/gyc-grok.user.js) |
| Agent Chat Archive | Agent Skill | 從 Codex、Grok Build、Command Code 或 Hermes 歸檔 Markdown | [`agent-chat-archive`](skills/agent-chat-archive/) |

前三項是 Tampermonkey userscript；Skill 的實際叫用名稱固定為 `agent-chat-archive`。

## 目錄

```text
AZA-AI-Chat-Archive/
├─ userscripts/
│  ├─ gyc-chatgpt.user.js
│  ├─ gyc-gemini.user.js
│  └─ gyc-grok.user.js
├─ skills/
│  └─ agent-chat-archive/
├─ tests/
└─ README.md
```

## 命名與版本規則

- Repo 內檔名保持穩定，不把版本號寫進路徑，避免更新後下載網址失效。
- Userscript 名稱統一為 `GYC - <平台>`；版本放在 `@version`。
- Skill 資料夾與 frontmatter `name` 都使用 `agent-chat-archive`。
- 全部可下載項目共用同一個 SemVer 版本；這次重新以 `1.0.0` 為基線。
- GitHub Release 資產才帶版本號：
  - `gyc-chatgpt-v1.0.0.user.js`
  - `gyc-gemini-v1.0.0.user.js`
  - `gyc-grok-v1.0.0.user.js`
  - `agent-chat-archive-v1.0.0.zip`
