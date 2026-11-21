# 06: 本機 Skill 改用相同分隔

**What to build:** 本機 Skill 歸檔（`skills/AZA-Agent-Chat-Archive/scripts/Export-AgentChat.ps1`、`Export-HermesChat.py`）的訊息分隔改成與網頁端相同的 `# User N`／`# Model N`（規範 §3.3），正文程式碼區塊外的一級標題降為二級。使用者已核准。

**Blocked by:** 無

**Status:** done

- [x] 兩支腳本輸出 `# User N` + 空行 + 正文；User／Model 各自編號
- [x] 正文中程式碼區塊外的 `# ` 標題降為 `## `，程式碼區塊內不動
- [x] 只改分隔與標題降級；檔頭（對話時間、來源 Harness、來源資料夾、Session ID 等）與 `<!-- agent-chat-archive -->` 註解不動
- [x] 檢查 `Test-AgentChatArchive.ps1`、`scripts/harnesses/*.ps1`、list／recover 流程是否依賴舊分隔，有就一起更新並加測試
- [x] `Test-AgentChatArchive.ps1` 與 `node tests/check-*.js` 全過

驗證：PowerShell 58 checks、Hermes 8 checks、Node 15 支通過（私人證據 parity CLI 略過）；遷移測試的舊「來源網站」斷言依目前 §3.1 修正。合成資料涵蓋獨立編號、四反引號／波浪線 fence、縮排程式碼、檔頭不變、list 與重新歸檔；adapter／recover 無舊分隔依賴。未操作真實封存。
