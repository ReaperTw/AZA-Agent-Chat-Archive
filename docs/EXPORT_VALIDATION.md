# 匯出一致性驗收

本文件定義三來源驗收與正文／metadata 比較規則。[`../AGENTS.md`](../AGENTS.md) 要求相關變更依此驗收。三來源均須獨立取得，分別確認目前分支與完整歷史；各平台依匯出契約評分。不得把模擬資料或舊證據重播宣稱為登入實測。

## ChatGPT 1.4.9+ 結構核對

ChatGPT 1.4.9 起採頁面優先契約：API 證據保存目前父鏈的訊息 ID／角色／順序與完整性；正常擷取保存 DOM 正文及來源 ID；獨立完整 DOM 另行取得正文。核對 API／正常擷取的訊息結構，以及正常擷取／獨立 DOM 的角色、順序、文字。後者只允許換行編碼、NBSP 與首尾空白正規化；附件提示與引用 metadata 分開。API 正文一致性固定為未驗證。

ChatGPT 1.4.10 允許頁面明確列出多個來源 ID 時，以連續、同角色、各自唯一且沒有重複配對的 API 訊息核對同一 DOM 段落，並逐項保存 API 補充資料。不同角色、非連續 ID、重複 ID 與未知內容仍保留警告。前置進度只在助理 `commentary` 且 `is_thinking_preamble_message === true` 時排除；不要求同 exchange 的完整 final。未標記 commentary、字串 `"true"`、正式 final 均不刪除。

ID 全部對上只代表訊息結構核對完成，不代表同一 ID 內的文字逐字相同、沒有截斷，或未知元件已完整擷取。無法提供 ID、重複 ID、角色／順序異常、分支／歷史不明均明確警告；時間戳缺失提示不單獨判為歷史缺漏。未配對 API 訊息完整保留在「待確認 API 內容（不屬於正式正文）」附錄，標示原 API 索引與角色，不自動混入正文。疑似漏抓與分支差異尚未證實時，不冒稱已補齊。

API 失敗時仍可保存 DOM 正文，核對標為未完成。DOM 失敗時正式正文為 0，API 僅存待確認附錄；兩側均失敗不提供空白整合檔。收集期間換對話仍停止核對。DOM 不主動展開思考區，並略過已識別展開區，以及沒有原生訊息 ID 的 tertiary 處理摘要。原生 `hidden` 容器中的訊息不屬於可見正文，即使具有訊息 ID 也須排除；同一群組拆出的片段同樣適用。只是在視窗外的正常訊息仍保留。單獨 API 匯出仍保存來源文字與上述保守篩選結果；可另存 API／DOM 原文。

## Claude、Gemini、Grok 與舊版 ChatGPT 三方正文診斷

1. 等待生成結束，確認同一對話與目前選取分支。逐段載入全部頁面歷史，獨立擷取並核對 DOM；不可拿匯出器解析結果當 DOM 證據。掛載節點數或訊息數相等不足以證明完整。只有已知完整歷史、目前分支，且獨立 DOM 擷取完成，才能標記 `complete: true`。
2. 比較正文訊息的角色、順序與文字。只允許換行編碼、NBSP 與正文首尾空白正規化；不可丟棄未知文字、合併訊息或放寬正規化。圖片本體忽略；來源引用及已證明的工具／工具前進度可另行標註，未證明的內容仍屬正文並照常比較。正文差異是正文差異；純引用或進度 metadata 差異不得稱為缺少正式答案。
3. 在版本庫外保存私人 JSON 證據。`conversation`、`branch` 在各模式應一致且去識別；每個 capture 有 `complete` 與獨立的 `messages` 正文：

   ```json
   {
     "provider": "claude",
     "api": {
       "conversation": "private-chat-A",
       "branch": "selected-branch-A",
       "complete": true,
       "messages": [{ "role": "user", "text": "Example" }],
       "references": [{ "messageIndex": 1, "label": "Source", "url": "https://example.test" }],
       "process": [{ "messageIndex": 1, "text": "Searching…", "evidence": "Observed in the UI before the answer." }]
     },
     "normal": { "conversation": "private-chat-A", "branch": "selected-branch-A", "complete": true, "messages": [{ "role": "user", "text": "Example" }] },
     "dom": { "conversation": "private-chat-A", "branch": "selected-branch-A", "complete": true, "messages": [{ "role": "user", "text": "Example" }] }
   }
   ```

   `references` 與 `process` 是可選 capture 欄位；缺少或 `null` 表示未驗證，`[]` 表示已檢查且沒有項目。`messageIndex` 以該 capture 的正文 `messages` 為準，從 1 起算。引用須保留標籤與 URL；進度須有非空 `evidence`，說明實際觀察到的 UI／協定證據。不得只因文字不是 final channel 就把它歸為 `process`；未證明的工具進度／前置文字不得移出正文。
4. 執行 `node tests/check-export-parity.js <私人證據.json>`（在專案根目錄）；也可用 `-` 從 stdin 輸入。四家都提供 `api`、`normal`、`dom` 三份獨立 capture。報告分別列出 `body`、`references`、`process` 的 `match`／`different`／`unverified`，並標示 `bodyPassed`。結束碼 0 表示已驗證正文一致，1 表示正文訊息角色／順序／文字有差異，2 表示證據不完整或無效。exit 0 不代表引用、進度或全部欄位都一致；metadata 有差異或未驗證仍須如實呈現。報告不得輸出正文、URL 或私人識別資料。
5. 分別記錄歷史、文字解析、分支確認及 DOM 證據狀態。比較器只檢查所提供證據，不能自行證明擷取獨立或完整；來源不明、缺登入或未完成 DOM 擷取均為未驗證。

比較器回歸：`node tests/check-export-parity-test.js`（專案根目錄）。模擬資料與 parser 測試不能替代登入實測。

## 已知驗收證據

ChatGPT 1.4.10：parser／整合回歸通過；22 篇皆已產生修正版匯出，全部 22 篇現已完成即時頁面核對，待確認 0。最後 7 篇也已相對先前獨立 DOM 驗證。此為訊息結構核對，不代表 API／DOM 逐字相同；不可擴大宣稱未涵蓋的內容或 metadata 已驗證。

ChatGPT 1.4.12：一篇新樣本的額外 DOM 訊息位於原生 `hidden` 容器，API 同 ID 有明確前置進度標記。讀取即時 API／DOM 後，在 Chromium 的獨立 HTMLDocument 重播：DOM 由 5 則降為 4 則，API 4 則、待確認 0，四則可見訊息 ID 全部保留。原生 DOM fixture 通過隱藏訊息／群組片段排除、視窗外訊息保留及原有正文回歸。介面標題節點已改為 `AZA-Agent-Chat-Archive / ChatGPT`；未在使用者工作頁重載新版，也未驗證實際畫面排版。

Gemini 1.4.8：四篇獨立 API／正常匯出／DOM 樣本，正文訊息數分別為 98／4／90／118，正文差異為 0；引用與進度 metadata 尚未獨立驗證。這不是所有 Gemini 對話的完整性保證。Claude、Grok 不在本次登入對話驗收範圍。

## 回歸與瀏覽器驗證

在專案根目錄執行對應回歸：`node tests/check-chatgpt-api.js`、`node tests/check-integrated-export.js`、`node tests/check-gemini-api.js`、`node tests/check-claude-export.js`、`node tests/check-claude-combined.js`、`node tests/check-grok-api.js`、`node tests/check-grok-combined.js`。這些合成資料檢查不證明真實頁面完整。

ChatGPT DOM fixture：在根目錄啟動 `python -m http.server 18763 --bind 127.0.0.1`，用隔離瀏覽器開啟 `http://127.0.0.1:18763/tests/check-chatgpt-dom.html`，觀察實際 PASS／FAIL；不可只讀原始碼宣稱通過。

本次 COM 命名變更已執行四站的實際下載 callback／Blob 檢查：綜合檔均為 `_COM.md`，API／DOM 標記維持原格式，整合正文未被額外加上來源標頭。此檢查使用合成資料與下載介面替身；隔離瀏覽器啟動失敗，未驗證真實 UI 或作業系統下載。

真實對話、token、cookie、原始回應及完整請求標頭留在私人暫存，不加入版本庫。測試使用專用背景分頁，不改動使用者工作分頁；使用者取消偵錯連線時立即停止。隔離細節依 [AGENTS.md](../AGENTS.md)。
