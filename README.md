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
   - **到頂端**：載入並回到對話頂端，不下載檔案。
   - **API匯出**：直接向網站讀取對話資料，不靠捲動；ChatGPT 僅支援個人對話，Grok 僅支援 grok.com 已保存的對話。
   - **正常匯出**：從頂端捲動掃描畫面，不使用 API；群聊與 X 版 Grok 也使用此模式。
   - **綜合匯出**：四家都獨立取得 API 與正常掃描結果，逐則比較角色、順序與呈現正文；相符下載一份 Markdown，不同則可分別下載 API、DOM 與差異／metadata 報告。
4. 確認檔名，按下「下載 `.md`」。

四家均提供「綜合匯出／API匯出／正常匯出」與回到頂端操作。綜合模式中任一路失敗，成功的一側仍可保存；單獨模式失敗時不自動切換。Claude 的正常模式與 API 分開擷取，作為比對來源與 API 失敗時的保存路徑。

Markdown 統一以 `> **匯出來源**` 開頭，正文使用 `--- [User N] ---`／`--- [Model N] ---`，實際取得的時間另列。檔名使用 `API`、`DOM`、`COMBINED`、`DIFFERENCES` 區分內容；`DOM` 即正常匯出。引用、附件與進度分開診斷，不藉由刪除未知文字讓正文看起來一致。
Claude 的分支根節點可能使用特殊 UUID，匯出器會把它視為正常結束；只有實際父訊息缺失才會顯示「分支上游有訊息不在回應裡」警告。
Claude 1.2.3 會排除系統／工具與未知角色，不把未知 sender 冒充 Model；未知內容區塊及分支循環會明確警告。保留已支援的可見 Artifact／檔案成果，避免用 `message.text` 回填已排除的推理或工具區塊。
Gemini 的 API 與正常匯出視窗都會顯示訊息數、字數及具體警告；API 匯出每組問答只在 User 前列一次來源時間，不在 Model 回覆重複列出。
ChatGPT 1.1.3 將正常匯出每步基本等待從 500ms 降為 250ms，保留 60% 視窗步距、空殼重試與缺漏回訪。實際速度仍受頁面載入與瀏覽器計時器影響；已登入對話的前後下載全文一致，不代表所有長對話已驗證。
ChatGPT 1.1.6 的 API／正常匯出共用 Markdown 排版：來源、`User N`／`Model N` 分隔、時間標記及檔尾提示格式一致；正常匯出的不完整警告也會保存到檔案，多行提示維持 Markdown 引用格式。保留各模式實際取得的時間與來源，不補造正常模式沒有的逐則時間，也不改正文擷取規則；時間數量、附件說明、警告或正文不同時，檔案大小仍可能不同。
本次在隔離瀏覽器以模擬的 4 則訊息操作兩種匯出按鈕與保存流程，API／正常匯出／獨立 DOM 正文比對通過，並確認正常模式缺時間戳的警告寫入檔案；未執行登入實測，不代表下方既有的 32／29 則差異已解決。

### 四家固定輸出與綜合模式

Gemini、Grok、Claude 1.3.0 統一採用與 ChatGPT 相同的綜合結果欄位、User／Model Markdown 分隔與獨立 API／DOM 下載。API 與正常模式各自收集資料；比對相符提供一份綜合 Markdown，不同則顯示具體位置與正文，保留兩份及差異／metadata 報告。無法識別的引用／附件數量顯示未知，不當成零；各站仍保留自己的分支及內容解析。

Claude 新增正常匯出與到頂端：正常模式不依賴 API，向上載入再向下收集，使用穩定訊息索引／ID 保留重複訊息。API 適合取得結構化分支，正常模式作為頁面核對與 API 失敗時的保存路徑。尚未實測的獨立 Artifact／檔案面板不能宣稱已由 DOM 完整保存。

本次三家均在隔離瀏覽器以合成 API 與頁面測試相符、不符、API 失敗、DOM 失敗及對應下載，並核對 Markdown 來源與 User／Model 格式。Grok 另驗證 X 不支援 API 時仍可保存 DOM；Claude 另以只掛載部分訊息的 10 則歷史驗證捲動、重複訊息與完全停用 API 的正常匯出。這些是功能與合成資料證據，不代表三家都已完成登入頁面、真實引用／Artifact 結構或所有分支的驗收。

1.3.1 依 relay 登入頁面的實際結構修正 Gemini `model-response`／`message-content` 及多行使用者文字；Claude 修正只有圖片的使用者訊息、TurnStatus 處理摘要、引用標籤與 MessageActions 日期不應混入正文，工具前文字另存進度，原始 API 文字保留。Claude API 請求加上 30 秒上限，避免實測中卡在讀取 API。回歸測試通過。

本次 relay 登入實測的正文結果：ChatGPT API 11／DOM 10（1 則前進度另列）、Gemini 2／2、Claude 6／6、Grok 6／6，四個選定對話的呈現正文均相符；Claude 引用與附件數各為 6／1，兩來源一致。Grok API 仍回報無法確認更早的上游歷史，故不宣稱完整歷史已驗證；獨立 Artifact 面板仍未實測。之後改用單一獨立測試瀏覽器，不再操作工作用 Chrome；該瀏覽器尚未登入，Grok 遇驗證頁，不能把這部分算成登入實測通過。

### ChatGPT 綜合匯出

1.2.1 比較「呈現正文」，不再直接拿 API 的 Markdown／元件原始碼與 DOM 純文字比較。腳本內附固定版本 Marked 12.0.2（MIT），解析助理訊息的標題、粗體、清單與連結；已識別的 Link／版面元件保留可見文字，Cite 與 DOM 中有引用結構標記的控制項另列 metadata。圖片佔位也與正文分離，引用控制項內的圖示不再計為圖片附件。使用者輸入保持字面內容，程式碼保留縮排、空白與空行，數字、字詞與標點的變更仍會報差異。

額外／缺少訊息先對齊相同角色的訊息群，再於後續 50 則內尋找相同正文。1.2.2 僅在 API 明確標記 `commentary`、而後續 `final` 與 DOM 正文完全相符時，把未出現在 DOM 的前進度另列報告，原始匯出仍保留；未標記或正式回答不符時仍列正文差異。畫面與報告顯示實際比較的正文、位置及兩側引用／附件數量。引用 ID 與 DOM 網域並非相同資料，報告分列來源內容，不宣稱引用或附件完全一致。

舊版 DOM Markdown 已把引用標籤、網域與附件說明攤平成文字，缺少原始結構。腳本不會猜測哪些字可以刪掉；需用新版重新擷取，才能使用結構化的正文／metadata 分離。

API 或 DOM 失敗時顯示實際錯誤，成功的一側仍可下載；收集期間切換對話會停止比對。綜合檔名使用 `_COMBINED`，分開保存使用 `_API`、`_DOM`、`_DIFFERENCES`。相符表示取得的文字一致，不代表附件本體也已備份；兩份正文不會自動合併。

1.2.0 已在隔離瀏覽器以模擬對話實際操作新按鈕、相符下載、差異原文與三份下載、API／DOM 任一路失敗後保存另一側；相符正文也與獨立 DOM 擷取逐則核對。這是功能流程驗證，不代表已完成登入實測或解決既有對話的 32／29 則差異。

1.2.1 已重播使用者提供的私人匯出檔，確認額外前進度正確定位為 API #2，而非把正式回答誤列為 API-only。隔離瀏覽器以標題、清單、Link／Cite／版面元件、引用圖示、使用者圖片及程式碼驗證：格式差異不造成正文差異，額外前進度單獨列出，數字變更仍被捕捉，程式碼縮排與空行保留，metadata 報告可下載。引用選擇器尚未完成登入頁面的實測；私人對話未加入版本庫。

1.2.2 透過 relay 檢查實際登入頁面，新增帶 favicon 的 inline popover badge 引用結構；修正 row／box／text 元件縮排誤判為 Markdown 程式碼，並正規化渲染後行尾空白，真正程式碼的空白仍保留。從該頁私下取得 API 與完整可見訊息 DOM 樹，在隔離瀏覽器保留原始節點巢狀結構重播：API 11 則、DOM 10 則，正文差異 0，前進度 1 則另列；兩側各辨識 9 項引用與 1 個真正附件，綜合檔與報告下載均通過。此證據只涵蓋該對話，不代表其他對話也已實測；私人內容不入庫。

### API 匯出的範圍與限制

- ChatGPT：依 `current_node` 的父子鏈匯出個人對話，略過工具、系統、分析與隱藏訊息；即使 `thoughts`、`reasoning_recap` 沒有 channel，也不當成正文。1.1.7 保留未被明確隱藏、且非工具接收對象的 User／Assistant 文字，包括 `commentary`；不再只因 channel 不是 `final` 就略過文字、發出可見性警告或標示 `_INCOMPLETE`。已知圖片附件保留佔位說明。未知角色、未知內容格式、分頁標記或斷鏈仍會標示不完整；群聊保留原本的 DOM 流程。
- Gemini：已驗證的回合數參數從 100 逐步提高，最多要求 10000 回合；這不是已驗證的游標分頁。若仍有後續資料但無法取得更早回合，會停止並標示不完整。依 API 的目前回答 ID（`turn[3][3]`）選取候選，未選取的空白候選不會觸發正文缺漏警告；選取 ID 無法對應時，仍標示並保留可取得的候選，不猜測選取結果。`_INCOMPLETE` 也可能由回答選取不明或所選正文空白觸發，不一定代表歷史訊息缺漏；視窗會分開說明 API 是否已回報無後續歷史，以及回答內容的疑慮。
- Grok.com：先取得訊息樹，再每批載入 50 則正文，最多 10000 則。缺少正文或含無法確認目前選取的分支時，保留警告與分支標記，不把多條分支冒充成連續對話。X 版維持 DOM 匯出。
- 對話時間取自來源資料，轉成瀏覽器本地時區；附件本體不嵌入 Markdown。這些是未公開保證的網站內部介面，可能隨改版失效。
- ChatGPT 1.1.2 已在登入的實際對話完成 API 按鈕、保存視窗與 Markdown 下載驗證；含圖片的 5 組問答正確計為 10 則訊息，不再把推理節點計入或因已知圖片附件誤標不完整。Gemini、Grok API 試用版本已通過模擬回應的瀏覽器按鈕、Markdown 下載及失敗復原檢查；不等於兩者都已完成登入實測。

### Debug 一致性驗收

共同規則以本節為準；[AGENTS.md](AGENTS.md) 要求相關變更依此驗收。四家均比對 **API／正常匯出／獨立完整 DOM**，分別確認來源、目前選取分支與完整歷史。

1. 等待生成結束，確認同一對話與目前選取分支。逐段載入全部頁面歷史，獨立擷取並核對 DOM；不可拿匯出器解析結果當 DOM 證據。掛載節點數或訊息數相等不足以證明完整。只有已知完整歷史、目前分支，且獨立 DOM 擷取完成，才能標記 `complete: true`。
2. 比較正文訊息的角色、順序與文字。只允許換行編碼、NBSP 與正文首尾空白正規化；不可丟棄未知文字、合併訊息或放寬正規化。圖片本體忽略；來源引用及已證明的工具／工具前進度可另行標註，未證明的內容仍屬正文並照常比較。正文差異是正文差異；純引用或進度 metadata 差異不得稱為缺少正式答案。
3. 在版本庫外保存私人 JSON 證據。`conversation`、`branch` 在各模式應一致且去識別；每個 capture 有 `complete` 與獨立的 `messages` 正文：

   ```json
   {
     "provider": "chatgpt",
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
4. 執行 `node tests/check-export-parity.js <私人證據.json>`；也可用 `-` 從 stdin 輸入。四家都提供 `api`、`normal`、`dom` 三份獨立 capture。報告分別列出 `body`、`references`、`process` 的 `match`／`different`／`unverified`，並標示 `bodyPassed`。結束碼 **0** 表示已驗證正文一致，**1** 表示正文訊息角色／順序／文字有差異，**2** 表示證據不完整或無效。因而 exit 0 不代表引用、進度或全部欄位都一致；metadata 有差異或未驗證仍須如實呈現。報告不得輸出正文、URL 或私人識別資料。
5. 分別記錄歷史、文字解析、分支確認及 DOM 證據狀態。比較器只檢查所提供證據，不能自行證明擷取獨立或完整；來源不明、缺登入或未完成 DOM 擷取均為未驗證。

比較器回歸：`node tests/check-export-parity-test.js`。模擬資料與 parser 測試不能替代登入實測。

目前驗證狀態：一則特定 Claude 對話的選取分支有 6 rows，其中 1 則僅含圖片；5 則文字訊息中，4 則正文相同。將 23 字元的工具前進度及 6 個來源連結分開分類後，最後一則正式正文相符；舊版嚴格比較器因此前差異而失敗。這僅是該對話的證據，不代表 Claude 全站驗證。ChatGPT 目前仍是 API 32 則對正常模式／DOM 各 29 則，差異尚未分類，不假設只是進度。Gemini／Grok 尚待登入實測；目前不得宣稱全部供應商通過。

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
