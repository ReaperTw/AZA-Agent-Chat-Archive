# AZA-Agent-Chat-Archive

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
| Antigravity、Codex、Grok Build、Command Code、OMP、Claude Code、Hermes | Agent Skill | [查看 AZA-Agent-Chat-Archive](skills/AZA-Agent-Chat-Archive/) |

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
2. 點擊頁面右下角的站點圖示按鈕：ChatGPT 標誌、Claude `✳`、Gemini `✦` 或 Grok `𝕏`。
3. 選擇匯出方式：
   - **到頂端**：載入並回到對話頂端，不下載檔案。
   - **API匯出**：直接向網站讀取對話資料，不靠捲動；ChatGPT 僅支援個人對話，Grok 僅支援 grok.com 已保存的對話。
   - **正常匯出**：從頂端捲動掃描畫面，不使用 API；群聊與 X 版 Grok 也使用此模式。
   - **綜合匯出**：分別取得 API 與正常掃描結果，整合為一份 Markdown；正文不同時顯示警告與兩側內容，衝突版本保留在同一份檔案。
4. 綜合模式按「下載整合 Markdown」；可另下載比對報告，或展開「另存個別來源」保存 API／頁面各自的可見訊息 Markdown。單獨模式確認檔名後下載。

四家均提供「綜合匯出／API匯出／正常匯出」與回到頂端操作。綜合模式中任一路失敗，成功的一側仍可保存；單獨模式失敗時不自動切換。Claude 的正常模式與 API 分開擷取，作為比對來源與 API 失敗時的保存路徑。

Markdown 統一以 `> **匯出來源**` 開頭，正文使用 `--- [User N] ---`／`--- [Model N] ---`，實際取得的時間另列。檔名使用 `API`、`DOM`、`COMBINED`、`DIFFERENCES` 區分內容；`DOM` 即正常匯出。引用、附件與進度分開診斷，不藉由刪除未知文字讓正文看起來一致。
Claude 的分支根節點可能使用特殊 UUID，匯出器會把它視為正常結束；只有實際父訊息缺失才會顯示「分支上游有訊息不在回應裡」警告。
Claude 1.2.3 會排除系統／工具與未知角色，不把未知 sender 冒充 Model；未知內容區塊及分支循環會明確警告。保留已支援的可見 Artifact／檔案成果，避免用 `message.text` 回填已排除的推理或工具區塊。
Gemini 的 API 與正常匯出視窗都會顯示訊息數、字數及具體警告；API 匯出每組問答只在 User 前列一次來源時間，不在 Model 回覆重複列出。
ChatGPT 1.1.3 將正常匯出每步基本等待從 500ms 降為 250ms，保留 60% 視窗步距、空殼重試與缺漏回訪。實際速度仍受頁面載入與瀏覽器計時器影響；已登入對話的前後下載全文一致，不代表所有長對話已驗證。
ChatGPT 1.1.6 的 API／正常匯出共用 Markdown 排版：來源、`User N`／`Model N` 分隔、時間標記及檔尾提示格式一致；正常匯出的不完整警告也會保存到檔案，多行提示維持 Markdown 引用格式。保留各模式實際取得的時間與來源，不補造正常模式沒有的逐則時間，也不改正文擷取規則；時間數量、附件說明、警告或正文不同時，檔案大小仍可能不同。
1.1.6 當時以隔離瀏覽器的模擬對話驗證 API／正常匯出／獨立 DOM 正文及缺少時間戳的提示；這份歷史證據不代表所有長對話均已驗證。

### 四家固定輸出與綜合模式

四家 userscript 的綜合模式會整合兩份已取得的訊息，而非只在相符時選用 API。ChatGPT／Claude／Gemini 1.4.4、Grok 1.4.5 起統一採用以下精簡格式：

- 呈現正文與角色相符：只保留一份 API 正文，不逐則標來源，也不附上格式不同的 DOM 副本；需要各來源原文時使用「另存個別來源」。
- 單邊訊息：保留並標記來源，不以去重刪除重複出現的訊息。正文衝突：在同一則中保留 API／DOM 兩版及各自角色，不自動覆蓋；結果視窗顯示警告並展開具體差異。
- 各來源取得的引用、附件說明、時間及可見處理狀態隨訊息保留；未知 metadata 不當成零，也不以計數相同推定內容相同。已證明的 API 前進度一併保留，不算正式正文衝突。
- 來源取得失敗：顯示實際錯誤，仍可下載成功一側的整合檔；不把未取得的來源宣稱為正文差異。兩側均失敗時不提供空白整合檔。
- 分支不確定及其他來源警告集中在整合檔檔頭，不混入每則正文；不能因此視為已確認目前分支。
- 比對報告不逐則列出空值或沒有內容的 metadata；未知狀態保留摘要，不當成零。有內容的引用／附件及已支援的處理狀態保留，Gemini 的 metadata 仍標示未知。

結果視窗使用 API／頁面／整合訊息數卡片、主要下載按鈕及可展開的差異與來源紀錄；支援明暗主題、窄螢幕、鍵盤焦點與 Escape 關閉。無差異時不顯示衝突警告。

Claude 新增正常匯出與到頂端：正常模式不依賴 API，向上載入再向下收集，使用穩定訊息索引／ID 保留重複訊息。API 適合取得結構化分支，正常模式作為頁面核對與 API 失敗時的保存路徑。尚未實測的獨立 Artifact／檔案面板不能宣稱已由 DOM 完整保存。

1.3.0 的隔離瀏覽器驗證涵蓋合成 API／頁面相符、不符及單路失敗；Grok 另驗證 X 不支援 API 時仍可保存 DOM，Claude 另驗證虛擬化歷史、重複訊息與停用 API 的正常匯出。

1.4.0 的來源守恆回歸：`node tests/check-integrated-export.js`，涵蓋四家的重複訊息、長缺口、角色／文字衝突、原文字面差異、metadata、前進度與單路失敗。隔離無頭瀏覽器實際操作四家結果視窗的相符、衝突、API 失敗及雙路失敗，共 16 個場景；24 份整合檔／報告確認下載並核對內容。另驗證 390px 淺色畫面、焦點及 Escape。這輪未重新登入四站，擷取器未修改；登入樣本證據如下。

1.4.1 重測修正雙來源均失敗時的誤導狀態說明：零訊息不再宣稱已保留成功內容；四家空結果畫面均已用隔離瀏覽器確認，且不提供整合檔下載。

1.4.2 修正長差異視窗的自動聚焦捲動：下載按鈕仍取得鍵盤焦點，但開啟時保留視窗頂端，避免標題被捲走。已在使用者登入的 Brave 以長篇訊息重播四家結果視窗，確認初始捲動為 0、標題可見、鍵盤焦點保留。另用實際擷取資料的記憶體副本驗證正文衝突及單／雙來源失敗；這些是受控輸入，不是網站真的傳回錯誤。

Grok 1.4.3 修正 API 大寫 `ASSISTANT` 被漏讀，並以 response ID 接回訊息樹提供的父子關係；網站正文回應沒有附帶父 ID 時，不再因此把每則訊息誤當成獨立分支。真正多分支的提示仍保留於原文與來源警告，提示本身與比較正文分開。Markdown 助理標題維持 `Model N`。去識別的 146 組問答已跑過實際擷取、解析、整合與瀏覽器結果視窗：兩路各 292 則，整合 292 則、正文差異 0；分支與角色回歸亦通過。使用者回報案例的 API 已觀察到 146 個 `human`、147 個 `ASSISTANT`；該頁後續偵錯連線被取消，修正後的原對話結果尚未重新驗證，不能把模擬資料結果當成該對話的完成證據。

啟動按鈕圖示修正：ChatGPT／Claude／Gemini 1.4.3、Grok 1.4.4 保留各站原有圖示與圓形按鈕，不再覆蓋成「匯出」文字；新版選單與整合結果面板不變。四家的圖示、56px 圓形尺寸與開啟選單已在隔離瀏覽器實際確認。

Grok 1.4.5 精簡閱讀用 Markdown：呈現正文與角色相符時只保留 API 正文，不再附上格式不同的 DOM 副本，也不逐則列來源；單邊訊息、前進度及真正的文字／角色衝突仍標記來源並保留內容。分支不確定與其他來源警告集中於檔頭，不插進每則正文；所有候選訊息仍保留，不能視為已確認目前分支。個別來源原文仍可透過「另存個別來源」下載。比對報告只逐則列出有內容的引用／附件，未知狀態集中摘要，不當成零。

此版驗證：`node tests/check-integrated-export.js`、`node tests/check-grok-api.js`、`node tests/check-grok-combined.js` 通過；隔離瀏覽器實際操作整合檔與比對報告按鈕，核對產生的 Blob 內容及結果視窗。私人既有匯出資料於記憶體重播，API 444 則／DOM 438 則，整合仍為 444 則、10 筆衝突與 6 筆單邊訊息；移除 428 段相符副本後輸出縮小約 52%。原始私人檔案未修改或提交。本輪沒有重新登入網站擷取；完整歷史、目前分支及獨立 DOM 三路驗收仍為未驗證，重播不代表已解決原本的 16 筆差異。

ChatGPT／Claude／Gemini 1.4.4 同步上述精簡規則，四家共用回歸 `node tests/check-integrated-export.js` 通過。三家隔離瀏覽器各操作相符、正文衝突、有內容 metadata、API 失敗四種受控情境，共 12 個場景；點擊整合檔／比對報告按鈕並核對 24 份 Blob 內容，確認單份正文、必要警告、衝突兩版、補充資料及失敗後成功來源保留，並檢查三家結果視窗。此輪僅修改輸出層，未重新登入網站擷取；完整歷史、目前分支及獨立 DOM 驗收仍為未驗證。

1.3.1 依 relay 登入頁面的實際結構修正 Gemini `model-response`／`message-content` 及多行使用者文字；Claude 修正只有圖片的使用者訊息、TurnStatus 處理摘要、引用標籤與 MessageActions 日期不應混入正文，工具前文字另存進度，原始 API 文字保留。Claude API 請求加上 30 秒上限，避免實測中卡在讀取 API。回歸測試通過。

1.4.x 已在使用者登入的 Brave 重新完成以下選定對話的 API／正常擷取、整合檔及報告下載；呈現正文相符，並逐則檢查兩側原文都存在於整合檔。ChatGPT 整合後保留 11 則，其餘整合數與表中相同：

| 平台 | API 訊息 | DOM 訊息 | 備註 |
| --- | ---: | ---: | --- |
| ChatGPT | 11 | 10 | 1 則前進度另列；兩側各辨識 9 項引用、1 個附件 |
| Gemini | 2 | 2 | 引用／附件 metadata 未驗證 |
| Claude | 6 | 6 | 兩側各辨識 6 項引用、1 個附件；獨立 Artifact 面板未實測 |
| Grok | 6 | 6 | API 缺少部分父訊息，上游完整性未確認 |

### ChatGPT 綜合匯出

1.2.1 比較「呈現正文」，不再直接拿 API 的 Markdown／元件原始碼與 DOM 純文字比較。腳本內附固定版本 Marked 12.0.2（MIT），解析助理訊息的標題、粗體、清單與連結；已識別的 Link／版面元件保留可見文字，Cite 與 DOM 中有引用結構標記的控制項另列 metadata。圖片佔位也與正文分離，引用控制項內的圖示不再計為圖片附件。使用者輸入保持字面內容，程式碼保留縮排、空白與空行，數字、字詞與標點的變更仍會報差異。

額外／缺少訊息先對齊相同角色的訊息群，再於後續 50 則內尋找相同正文。1.2.2 僅在 API 明確標記 `commentary`、而後續 `final` 與 DOM 正文完全相符時，把未出現在 DOM 的前進度另列報告，原始匯出仍保留；未標記或正式回答不符時仍列正文差異。畫面與報告顯示實際比較的正文、位置及兩側引用／附件數量。引用 ID 與 DOM 網域並非相同資料，報告分列來源內容，不宣稱引用或附件完全一致。

舊版 DOM Markdown 已把引用標籤、網域與附件說明攤平成文字，缺少原始結構。腳本不會猜測哪些字可以刪掉；需用新版重新擷取，才能使用結構化的正文／metadata 分離。

收集期間切換對話會停止比對，避免整合不同對話。綜合模式的合併規則與警告行為以「四家固定輸出與綜合模式」為準。

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

最新功能流程與登入樣本範圍見「四家固定輸出與綜合模式」。這些選定對話的呈現正文證據，不替代本節要求的完整歷史、分支及獨立 DOM 驗收；未取得各項證據時，分項記錄為未驗證。

## AZA-Agent-Chat-Archive Skill

### 能做什麼

- 歸檔目前的 Antigravity（桌面版／`agy` CLI）、Codex、Grok Build、Command Code、OMP、Claude Code 或 Hermes 對話。
- 列出並選擇其他本機 Agent 對話進行歸檔。
- 只保留可見的使用者與助理訊息；排除系統指令、推理內容、工具呼叫與執行狀態。
- 再次匯出同一個 Session 時更新既有歸檔，避免產生重複檔案；OMP 使用任務資料夾，其他環境維持單一 Markdown。

### Antigravity 與 AZA 命名（Skill 1.6.0）

Skill 名稱、來源目錄、安裝目錄與顯示名稱統一為 `AZA-Agent-Chat-Archive`，採 `AZA-` 全大寫、其餘單字首字大寫及連字號分隔。舊安裝需移除 `agent-chat-archive` 目錄或連結，改裝 `AZA-Agent-Chat-Archive`；既有 `.agent-chat-archive.json` 設定檔與歸檔識別標記保持不變，避免丟失偏好或重複匯出。OMP 已開啟的工作階段需重新載入 skills 或重啟，才會更新名稱清單。

Antigravity 的來源、選擇目前對話、命令及保存邊界見 [`harnesses/Antigravity.md`](skills/AZA-Agent-Chat-Archive/harnesses/Antigravity.md)。需要 Python 3（僅標準函式庫）與 PowerShell；預設搜尋桌面版及 CLI 的 SQLite 對話，唯讀處理 WAL，保留原始使用者顯示文字與助理答案，不匯出推理、展開後的系統上下文或工具內容。同一對話內的 fork 使用資料庫已複製的目前分支，不拼接被放棄的分支。無目前對話 ID 且 workspace 有多筆候選時，要求選擇，不把最近修改時間當成目前任務證據。

已以真實桌面版對話（29 則，含同對話 fork）及 CLI 對話（2 則）完成 PowerShell 匯出、順序／文字核對、推理排除及來源資料庫雜湊不變檢查；私人輸出於驗證後刪除。這是本機儲存與命令流程驗證，不代表已完成 Antigravity UI 全歷史比對。跨對話／裁剪的父軌跡、未知 step 格式／類型、缺步及舊 `.pb` 會明確拒絕，不覆蓋既有成功歸檔。

回歸：`python -B tests/test_antigravity_export.py -v`（6 項）、`powershell -NoProfile -ExecutionPolicy Bypass -File skills/AZA-Agent-Chat-Archive/scripts/Test-AgentChatArchive.ps1`（52 項既有檢查）、`python -B skills/AZA-Agent-Chat-Archive/scripts/Export-HermesChat.py --self-test`（4 項）。

### OMP 任務歸檔（Skill 1.5.0）

OMP 預設將主對話與可取得的 subagent 可見對話一起保存。格式、保存邊界與完整性判定見 [`harnesses/Omp.md`](skills/AZA-Agent-Chat-Archive/harnesses/Omp.md#task-bundle)。

主檔提供 subagent 附件索引；manifest 保存 ID、父子關係與匯出狀態。巢狀 agent、失敗與取消的任務也納入發現範圍。缺漏或無法確認完整性時明確回報部分匯出，重新匯出失敗的附件保留上次成功版本。

舊版 OMP 單檔會在任務資料夾成功保存後遷移。來源對話不會自動刪除；歸檔不包含隱藏推理、工具紀錄或外部檔案，也不能還原成可接續執行的 OMP session。

### 使用

1. 將 [`skills/AZA-Agent-Chat-Archive`](skills/AZA-Agent-Chat-Archive/) 安裝到 Agent 支援的 Skills 目錄。
2. 對 Agent 說：`使用 AZA-Agent-Chat-Archive 歸檔目前對話`。
3. 第一次使用時，依提示選擇輸出資料夾與命名方式。
4. 完成後，Agent 會回報檔案位置、訊息數量與警告。

不同 Agent 的 Skill 安裝位置可能不同；實際位置請依該 Agent 的 Skills 說明為準。

Claude Code 會讀取 `~/.claude/skills/AZA-Agent-Chat-Archive`。Antigravity 桌面版與 CLI 共用 `~/.gemini/config/skills/AZA-Agent-Chat-Archive`，必須安裝為實體目錄：目前 Windows 掃描器會略過 junction，不能沿用 OMP 的連結安裝方式；更新時需同步複製整份 skill。已直接呼叫正在執行的 Antigravity `getAllSkills`，確認實體安裝會載入大寫名稱 `AZA-Agent-Chat-Archive`，junction 則不會。`~/.gemini/antigravity/skills` 不是目前版本的全域自訂 skill 來源。網頁版 Claude 仍用上方的 userscript，不走這個 Skill。
