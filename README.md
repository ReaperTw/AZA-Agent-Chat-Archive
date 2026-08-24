# AZA Agent Chat Archive

將 ChatGPT、Gemini、Grok 與本機 AI Agent 的對話整理成乾淨、可攜的 Markdown 檔案。

## 能做什麼

- 匯出使用者與 AI 的對話內容，方便備份、搜尋或放進 Obsidian。
- 自動捲動並載入較長的網頁對話。
- 匯出前可確認檔名，完成後直接下載 `.md`。
- 網頁版與 Agent Skill 都在本機產生檔案，不會自行把對話上傳到其他服務。

這是單篇對話匯出工具，不是 ChatGPT、Gemini、Grok 或 Discord 帳號的完整備份工具。

## 選擇版本

| 使用環境 | 類型 | 安裝 |
| --- | --- | --- |
| ChatGPT | Tampermonkey userscript | [安裝 GYC - ChatGPT](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-chatgpt.user.js) |
| Gemini | Tampermonkey userscript | [安裝 GYC - Gemini](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-gemini.user.js) |
| Grok | Tampermonkey userscript | [安裝 GYC - Grok](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-grok.user.js) |
| Codex、Grok Build、Command Code、Hermes | Agent Skill | [查看 Agent Chat Archive](skills/agent-chat-archive/) |

## 網頁對話匯出器

### 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. 從上表選擇 ChatGPT、Gemini 或 Grok 版本。
3. 在 Tampermonkey 安裝頁確認安裝。
4. 重新載入對話頁面。

### 使用

1. 開啟要保存的對話。
2. 點擊頁面右下角的 GYC 按鈕。
3. 選擇匯出方式：
   - **往下匯出**：從目前位置往下匯出。
   - **正常匯出**：回到頂端，以正常速度匯出完整對話。
   - **慢速匯出**：用較保守的速度載入長對話。
   - **快照匯出**：Grok 專用，匯出目前已載入的訊息。
4. 確認檔名，按下「下載 `.md`」。

一般情況使用「正常匯出」即可；內容很長或載入不完整時，再改用「慢速匯出」。

## Agent Chat Archive Skill

### 能做什麼

- 歸檔目前的 Codex、Grok Build、Command Code 或 Hermes 對話。
- 列出並選擇其他本機 Agent 對話進行歸檔。
- 只保留可見的使用者與助理訊息；排除系統指令、推理內容、工具呼叫與執行狀態。
- 再次匯出同一個 Session 時更新既有 Markdown，避免產生重複檔案。

### 使用

1. 將 [`skills/agent-chat-archive`](skills/agent-chat-archive/) 安裝到 Agent 支援的 Skills 目錄。
2. 對 Agent 說：`使用 agent-chat-archive 歸檔目前對話`。
3. 第一次使用時，依提示選擇輸出資料夾與命名方式。
4. 完成後，Agent 會回報檔案位置、訊息數量與警告。

不同 Agent 的 Skill 安裝位置可能不同；實際位置請依該 Agent 的 Skills 說明為準。
