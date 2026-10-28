# AZA Agent Chat Archive

將 ChatGPT、Gemini、Grok、Claude 與本機 AI Agent 的對話整理成乾淨、可攜的 Markdown 檔案。

## 能做什麼

- 匯出使用者與 AI 的對話內容，方便備份、搜尋或放進 Obsidian。
- 自動捲動並載入較長的網頁對話。
- 匯出前可確認檔名，完成後直接下載 `.md`。
- 網頁版與 Agent Skill 都在本機產生檔案，不會自行把對話上傳到其他服務。

這是單篇對話匯出工具，不是 ChatGPT、Gemini、Grok、Claude 或 Discord 帳號的完整備份工具。

## 選擇版本

| 使用環境 | 類型 | 安裝 |
| --- | --- | --- |
| ChatGPT | Tampermonkey userscript | [安裝 GYC - ChatGPT](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-chatgpt.user.js) |
| Gemini | Tampermonkey userscript | [安裝 GYC - Gemini](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-gemini.user.js) |
| Grok | Tampermonkey userscript | [安裝 GYC - Grok](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-grok.user.js) |
| Claude | Tampermonkey userscript | [安裝 GYC - Claude](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-claude.user.js) |
| Codex、Grok Build、Command Code、OMP、Claude Code、Hermes | Agent Skill | [查看 Agent Chat Archive](skills/agent-chat-archive/) |

### 歷史版本與更新說明

前往 [GitHub Releases](https://github.com/ReaperTw/AZA-Agent-Chat-Archive/releases) 查看各版本差異並下載固定版本；userscript 附 `.user.js`，Agent Skill 附完整安裝目錄 ZIP。

版本依元件獨立編號，例如 `claude-v1.2.1` 與 `archive-skill-v1.4.1`，不代表其他元件同時升級。歷史版本只包含 Git 已保存的版號，未保存的中間版本不補號。

上表安裝連結跟隨 `main` 更新。若要停留在舊版，請從對應 Release 安裝，並關閉該腳本在 Tampermonkey 的自動更新。

## 網頁對話匯出器

### 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. 從上表選擇 ChatGPT、Gemini、Grok 或 Claude 版本。
3. 在 Tampermonkey 安裝頁確認安裝。
4. 重新載入對話頁面。

### 使用

1. 開啟要保存的對話。
2. 點擊頁面右下角的 GYC 按鈕。
3. 選擇匯出方式：
   - **到頂端**：ChatGPT、Gemini、Grok 載入並回到對話頂端，不下載檔案。
   - **API匯出**：直接向網站讀取對話資料，不靠捲動；ChatGPT 僅支援個人對話，Grok 僅支援 grok.com 已保存的對話。
   - **正常匯出**：ChatGPT、Gemini、Grok 從頂端捲動掃描畫面，不使用 API；群聊與 X 版 Grok 也使用此模式。
4. 確認檔名，按下「下載 `.md`」。

ChatGPT、Gemini、Grok 只提供「到頂端／API匯出／正常匯出」。API 權限、格式或內容有問題時，可手動改用「正常匯出」，不會自動切換模式。
Claude 只提供「API匯出」，直接讀取目前分支，不需要捲動；API 失敗時會顯示錯誤。
Claude 網頁版匯出檔名使用 `CLD_<標題>_<匯出時間>.md`。
Claude 的分支根節點可能使用特殊 UUID，匯出器會把它視為正常結束；只有實際父訊息缺失才會顯示「分支上游有訊息不在回應裡」警告。
Gemini 的 API 與正常匯出視窗都會顯示訊息數、字數及具體警告；API 匯出每組問答只在 User 前列一次來源時間，不在 Model 回覆重複列出。

### API 匯出的範圍與限制

- ChatGPT：依 `current_node` 的父子鏈匯出個人對話，略過工具、系統、分析與隱藏訊息。若回應有分頁標記或斷鏈，正文與檔名會標示不完整；群聊保留原本的 DOM 流程。
- Gemini：已驗證的回合數參數從 100 逐步提高，最多要求 10000 回合；這不是已驗證的游標分頁。若仍有後續資料但無法取得更早回合，會停止並標示不完整。依 API 的目前回答 ID（`turn[3][3]`）選取候選，未選取的空白候選不會觸發正文缺漏警告；選取 ID 無法對應時，仍標示並保留可取得的候選，不猜測選取結果。`_INCOMPLETE` 也可能由回答選取不明或所選正文空白觸發，不一定代表歷史訊息缺漏；視窗會分開說明 API 是否已回報無後續歷史，以及回答內容的疑慮。
- Grok.com：先取得訊息樹，再每批載入 50 則正文，最多 10000 則。缺少正文或含無法確認目前選取的分支時，保留警告與分支標記，不把多條分支冒充成連續對話。X 版維持 DOM 匯出。
- 對話時間取自來源資料，轉成瀏覽器本地時區；附件本體不嵌入 Markdown。這些是未公開保證的網站內部介面，可能隨改版失效。
- API 試用版本已通過模擬回應的瀏覽器按鈕、Markdown 下載及失敗復原檢查；這不等於三個平台都已完成登入實測。

## Agent Chat Archive Skill

### 能做什麼

- 歸檔目前的 Codex、Grok Build、Command Code、OMP、Claude Code 或 Hermes 對話。
- 列出並選擇其他本機 Agent 對話進行歸檔。
- 只保留可見的使用者與助理訊息；排除系統指令、推理內容、工具呼叫與執行狀態。
- 再次匯出同一個 Session 時更新既有歸檔，避免產生重複檔案；OMP 使用任務資料夾，其他環境維持單一 Markdown。

### OMP 任務歸檔（Skill 1.5.0）

OMP 預設將主對話與可取得的 subagent 可見對話一起保存。格式、保存邊界與完整性判定見 [`harnesses/Omp.md`](skills/agent-chat-archive/harnesses/Omp.md#task-bundle)。

主檔提供 subagent 附件索引；manifest 保存 ID、父子關係與匯出狀態。巢狀 agent、失敗與取消的任務也納入發現範圍。缺漏或無法確認完整性時明確回報部分匯出，重新匯出失敗的附件保留上次成功版本。

舊版 OMP 單檔會在任務資料夾成功保存後遷移。來源對話不會自動刪除；歸檔不包含隱藏推理、工具紀錄或外部檔案，也不能還原成可接續執行的 OMP session。

### 使用

1. 將 [`skills/agent-chat-archive`](skills/agent-chat-archive/) 安裝到 Agent 支援的 Skills 目錄。
2. 對 Agent 說：`使用 agent-chat-archive 歸檔目前對話`。
3. 第一次使用時，依提示選擇輸出資料夾與命名方式。
4. 完成後，Agent 會回報檔案位置、訊息數量與警告。

不同 Agent 的 Skill 安裝位置可能不同；實際位置請依該 Agent 的 Skills 說明為準。

Claude Code 會讀取 `~/.claude/skills/agent-chat-archive`。網頁版 Claude 仍用上方的 userscript，不走這個 Skill。
