# AZA-Agent-Chat-Archive

將 ChatGPT、Gemini、Grok、Claude 與本機 AI Agent 的可見對話，匯出為方便保存、搜尋的 Markdown。這是單篇對話匯出工具，不是帳號完整備份，也不能還原成可繼續執行的工作階段。

## 網頁對話匯出器

### 安裝

1. 安裝瀏覽器擴充套件 [Tampermonkey](https://www.tampermonkey.net/)。
2. 點選下方適用的腳本並在 Tampermonkey 確認安裝。
3. 重新載入對話頁面。

| 網站 | 安裝連結 |
| --- | --- |
| ChatGPT | [安裝 GYC - ChatGPT](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-chatgpt.user.js) |
| Gemini | [安裝 GYC - Gemini](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-gemini.user.js) |
| Grok | [安裝 GYC - Grok](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-grok.user.js) |
| Claude | [安裝 GYC - Claude](https://raw.githubusercontent.com/ReaperTw/AZA-Agent-Chat-Archive/main/userscripts/gyc-claude.user.js) |

### 使用

1. 開啟要保存的對話，點擊頁面右下角的站點圖示。
2. 選擇匯出方式：
   - **API**：讀取網站結構化資料；ChatGPT 僅支援個人對話，Grok 支援 grok.com 的一般對話與專案內已保存對話（`/project/…?chat=對話ID`）。
   - **DOM**（介面上的「正常匯出」）：捲動掃描頁面，不呼叫 API；群聊與 X 版 Grok 使用此方式。
   - **COM**（介面上的「綜合匯出」）：依平台契約整合或核對兩種來源；ChatGPT 以 DOM 為正式正文，API 只做訊息結構核對，其他三站沿用 API／DOM 正文比較與衝突保留。
   - **到頂端**：載入並回到對話頂端，不下載檔案。
3. 檢視來源數量與警告。平常只需下載 COM 的 Markdown；核對報告、API／DOM 副本需要時再另存。

檔名標記固定為 **API／DOM／COM**。綜合檔以 `_COM.md` 結尾，例如 `GPT_對話名稱_20261101_181621_COM.md`；不加批次序號。API／DOM 保留原有檔名格式。

### 範圍與限制

- 匯出器在本機瀏覽器產生檔案，不會自行把對話上傳到其他服務；匯出內容仍受你選擇的下載位置及其同步設定影響。
- 附件本體不嵌入 Markdown；圖片通常只保留可取得的提示／佔位文字，不是圖片備份。
- 網站內部 API、頁面結構可能改版。未知內容、歷史不完整、分支不明或來源失敗會以警告呈現；訊息 ID／角色／順序對上，不等於正文逐字相同或未知元件完整。
- ChatGPT 綜合匯出只核對 API 訊息結構，不做 API 與 DOM 正文逐字比對。未配對 API 內容另列待確認，不混入正式正文。

## 本機 Agent Skill

[AZA-Agent-Chat-Archive Skill](skills/AZA-Agent-Chat-Archive/) 可歸檔 Antigravity、Codex、Grok Build、Command Code、OMP、Claude Code 與 Hermes 的可見對話。將 skill 目錄安裝到 Agent 支援的 Skills 位置，再要求 Agent「使用 AZA-Agent-Chat-Archive 歸檔目前對話」。首次使用依提示設定輸出資料夾與命名方式。

各 Harness 的安裝位置、命令、支援邊界與保存規則，請依序參閱：

- [Antigravity](skills/AZA-Agent-Chat-Archive/harnesses/Antigravity.md)
- [Codex](skills/AZA-Agent-Chat-Archive/harnesses/Codex.md)
- [Grok Build](skills/AZA-Agent-Chat-Archive/harnesses/Grok.md)
- [Command Code](skills/AZA-Agent-Chat-Archive/harnesses/CommandCode.md)
- [OMP](skills/AZA-Agent-Chat-Archive/harnesses/Omp.md)
- [Claude Code](skills/AZA-Agent-Chat-Archive/harnesses/Claude.md)
- [Hermes](skills/AZA-Agent-Chat-Archive/harnesses/Hermes.md)

Skill 只匯出可見對話，不保存隱藏推理、工具活動或引用檔案；OMP 會將主對話及可取得的 subagent 對話保存為任務資料夾。它不是來源工作階段或完整檔案備份。

## 開發與驗收

解析契約、三來源核對方式及已知驗證範圍，請見[匯出驗收規格](docs/EXPORT_VALIDATION.md)；修改本專案前先讀 [AGENTS.md](AGENTS.md)。

Grok 1.4.8 修正專案對話網址的 `chat` 參數辨識，API／綜合匯出皆適用；沒有對話 ID 的專案首頁仍不支援 API。網址回歸及兩個實際匯出入口的合成 HTTP smoke 通過；未完成登入 API／DOM 三方驗收，隔離瀏覽器啟動失敗，未驗證實際畫面。
