# AZA Agent Chat Archive

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
