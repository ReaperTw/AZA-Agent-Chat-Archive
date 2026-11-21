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

API／DOM／COM 日常檔名皆為 `{站碼}_{對話名稱}_{yyyyMMdd_HHmmss}.md`，例如 `GPT_對話名稱_20261101_181621.md`；站碼為 `GPT`／`CLD`／`GEM`／`Grok`，不標模式、不加批次序號或不完整尾碼。只有綜合對話框另存的偵錯副本與報告加 `_API`／`_DOM`／`_REPORT`（在 `.md` 前）。

API／DOM／COM 共用閱讀格式：檔頭只列對話時間範圍與網址；每則以 `# User N`／`# Model N` 一級標題分隔，可在 Obsidian 整則折疊；歷史缺漏、分支未確認或未輸出的未知內容以單行「不完整」標記。引用、附件及已證明可見的處理狀態各佔一行，雙來源補充資料合併去重；無網址的引用保留名稱。來源失敗、相對時間、結構核對及正文差異等資訊只進報告，不混入正文。

### 範圍與限制

- 匯出器在本機瀏覽器產生檔案，不會自行把對話上傳到其他服務；匯出內容仍受你選擇的下載位置及其同步設定影響。
- 附件本體不嵌入 Markdown；圖片通常只保留可取得的提示／佔位文字，不是圖片備份。
- 網站內部 API、頁面結構可能改版。未知內容、歷史不完整、分支不明或來源失敗會以警告呈現；訊息 ID／角色／順序對上，不等於正文逐字相同或未知元件完整。
- ChatGPT 綜合匯出只核對 API 訊息結構，不做 API 與 DOM 正文逐字比對。未配對 API 內容另列待確認，不混入正式正文。

### 舊網頁匯出檔轉換

本機工具 `scripts/migrate-web-exports.js` 將四站舊 API／DOM／COM／COMBINED 檔案轉為目前格式。先自行指定資料夾預覽，確認摘要與改名清單後才套用：

```sh
node scripts/migrate-web-exports.js "D:/Exports" --rename
node scripts/migrate-web-exports.js "D:/Exports" --apply --backup-dir "D:/Export-Backups/content"
node scripts/migrate-web-exports.js "D:/Exports" --apply --rename --backup-dir "D:/Export-Backups/rename"
```

- `--exclude 詞1,詞2` 排除檔名含這些詞的檔案，`AUTO_BACKUP_` 開頭的檔案一律排除；被排除的檔案不讀取、不轉換、不改名。
- 預設 dry-run；`--rename` 只把改名加入計畫，沒有 `--apply` 不會寫入。`--apply` 單獨使用只轉內容；加 `--rename` 才同時改名。
- 套用前備份原始位元組到指定資料夾，保留相對路徑；備份資料夾須在來源之外，既有備份不覆寫。請先關閉可能同時修改來源的程式。
- 套用改名需 Windows PowerShell，使用 [.NET `File.Move` 的不覆寫版本](https://learn.microsoft.com/en-us/dotnet/api/system.io.file.move)；其他平台僅支援 dry-run 與內容轉換，不退回會覆寫目標的改名方式。
- 目標已存在或多檔指向同一名稱時，整檔跳過；`(1)` 等重複檔只列報告，不刪除。catalog 與筆記中指向舊檔名的連結不會自動更新。
- 僅辨識的匯出中繼資料、佔位字及 Gemini 引用標記會轉換；程式碼區塊與一般正文保留。合成回歸：`node tests/check-web-export-migration.js`。真實封存資料由使用者自行執行，測試不讀取個人對話。

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

本機 Skill 與網頁端同樣使用 `# User N`／`# Model N`（各自編號），正文的非程式碼一級標題降為二級；原有歸檔註解及 Harness、來源資料夾等檔頭保留。合成驗證：`powershell -NoProfile -ExecutionPolicy Bypass -File skills/AZA-Agent-Chat-Archive/scripts/Test-AgentChatArchive.ps1` 與 `python skills/AZA-Agent-Chat-Archive/scripts/Export-HermesChat.py --self-test`，含列出、搬移後重新歸檔及 OMP bundle 流程。

## 開發與驗收

四站共用的輸出格式見[輸出規範](docs/OUTPUT_SPEC.md)。解析契約、三來源核對方式及已知驗證範圍，請見[匯出驗收規格](docs/EXPORT_VALIDATION.md)；修改本專案前先讀 [AGENTS.md](AGENTS.md)。

共用渲染與整合對話框的來源是 `userscripts/shared/export-renderer.js`。修改來源後執行 `node scripts/build-userscripts.js`，將標記區段內嵌回四個單檔 userscript；不要手改產物的共用區段。`node scripts/build-userscripts.js --check` 檢查產物是否同步。

回歸：逐一執行 `tests/check-*.js`（`check-export-parity.js` 需私人證據，略過）。`check-render-snapshots.js` 以規範 fixture 逐字比較四站 × API／DOM／COM，並檢查不完整標記與補充資料去重；ticket 01 的重構前快照保留在該次 commit。`check-shared-renderer.js` 檢查共用區段同步及手改產物的偵測。DOM fixture 與即時登入三來源驗收另依驗收規格執行。

啟動驗收規格中的本機 HTTP server 後，可開啟 `tests/check-shared-dialog.html`，以純合成資料操作四站共用對話框、下載 callback 與 Gemini 差異分頁；此頁不讀取登入對話。

`tests/check-export-delivery.html` 在隔離 iframe 驗證四站真實選單排列、版本提示，以及 API／DOM 副本與單獨匯出的 Blob 正文逐字一致。下載介面以合成替身接收 Blob，不會下載真實對話；報告另驗來源取得狀態、引用／附件計數與資訊提示。`check-export-delivery.js` 鎖定完整差異不截短及未知 metadata 不冒稱為零。

`check-export-filenames.js` 鎖定四站 × 日常／API 副本／DOM 副本／報告的檔名；瀏覽器交付 fixture 也會核對真實 callback 產生的四種名稱。

Grok 1.4.8 修正專案對話網址的 `chat` 參數辨識，API／綜合匯出皆適用；沒有對話 ID 的專案首頁仍不支援 API。網址回歸及兩個實際匯出入口的合成 HTTP smoke 通過；未完成登入 API／DOM 三方驗收，隔離瀏覽器啟動失敗，未驗證實際畫面。

Grok 1.4.9 修正 API 比較正文誤吃單個 `~` 的問題，保留頁面原樣顯示的符號，雙 `~~` 刪除線仍按 Markdown 呈現。即時差異報告已確認 7 筆為此解析問題；另 2 筆僅 API 有的訊息仍待分支／DOM 完整性確認。回歸與合成 16／14 則比較 smoke 通過；偵錯連線中斷後未重連，未宣稱修正版已通過即時三方驗收。

Claude 1.4.6 統一工具選單由上到下的排列：到頂端、綜合匯出、API 匯出、正常匯出，與其他三站一致。

Claude 1.4.7 修正 DOM 掃描時較早訊息延遲載入而被追加到末尾的排序問題，改以快照中既有訊息的穩定識別碼定位插入；無識別碼時保留原有重疊比對。16 則訊息的延遲載入回歸由整合 19 則／6 筆差異恢復為 16 則／0 差異，並驗證局部快照插入、重複正文及較長版本保留。`node tests/check-claude-combined.js` 通過；隔離瀏覽器進入登入頁，未完成登入 API／正常匯出／獨立 DOM 三方驗收。
