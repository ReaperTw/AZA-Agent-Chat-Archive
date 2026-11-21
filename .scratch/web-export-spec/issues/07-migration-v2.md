# 07: 轉換工具支援全部舊格式

**What to build:** 擴充 `scripts/migrate-web-exports.js`／`convert-web-export.js`，讓 MainVault 的 `AIChats`（網頁匯出）與 `AgentSessions`（Skill 歸檔）舊檔都能轉成規範 §3 目前格式。

**Blocked by:** 06

**Status:** done

已盤點的舊分隔（行數）：`--- [Model N] ---` 12937、`--- [User N] ---` 8777、`--- [USER N] ---` 3329、`--- [ASSISTANT N] ---` 2027、`--- [ChatGPT N] ---` 974、`--- [MODEL N] ---` 358、`--- [User] ---` 30、`--- [Grok N] ---` 29、`--- [Assistant N] ---` 4、`--- [Perplexity N] ---` 2、`--- [滾動第 N 次] ---` 2。

- [x] 依內容選檔，不依檔名：Skill 歸檔（`OMP_…`、`AGY_…`、`Claude_…` 等）與任務資料夾中的 `conversation.md` 也要處理
- [x] 分隔對應：User／USER → `# User N`；Model／MODEL／ASSISTANT／Assistant／ChatGPT／Grok／Perplexity → `# Model N`；依角色重新編號。`[滾動第 N 次]` 等不認得的不動並列入報告
- [x] 只有在分隔編號連續時才轉換該檔（舊格式的全域編號如 USER 1、ASSISTANT 2、USER 3 也算連續），否則跳過並報告，避免把正文引用的分隔字樣當成分隔
- [x] 程式碼區塊外的正文 `# ` 降為 `## `；移除網頁檔頭的「來源網站」行；Skill 檔頭其他欄位不動
- [x] `--exclude` 比對相對路徑（任務資料夾內的檔名都是 `conversation.md`）
- [x] 保留 BOM 與換行格式；第二次執行沒有任何變更（冪等）
- [x] 驗證輔助：dry-run 報告每檔的分隔數（轉換前／後）與「去掉分隔、檔頭行與標題井號後正文是否逐位元相同」
- [x] 測試只用合成 fixture，涵蓋上列每種分隔、正文引用分隔字樣、程式碼區塊、BOM／CRLF

驗證：17 支公開 Node 檢查通過（私人證據 parity CLI 略過）；CLI `--help` 實際啟動通過。合成資料驗證兩種連續編號、全部角色、未知／引用分隔、Skill 原始檔頭、fence／inline／縮排程式碼、BOM／CRLF、相對路徑排除、備份及既有改名保護。三道關卡亦驗證會如實回報既有引用／metadata 轉換造成的正文差異，不把它當成無損。
