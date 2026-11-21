# 08: 對 MainVault 舊檔做 dry-run 並停下等使用者核准

**What to build:** 用 07 的工具對真實資料做預覽，確認安全後**停止**，交給使用者核准；不在本 ticket 套用。使用者已同意由本 Agent（OpenAI 模型）處理這些資料。

**Blocked by:** 07

**Status:** done

- 範圍：`C:/Drivesync/MainVault/Backend/AIChats` 與 `C:/Drivesync/MainVault/Backend/AgentSessions`
- 一律加 `--exclude 崖宿,霄燈,溯洄,浮笙`；`AUTO_BACKUP_` 開頭由工具自動排除。**不加 `--rename`**（改名留給之後的標題整理）

- [x] dry-run 報告寫到檔案（`.scratch/web-export-spec/dry-run-AIChats.txt`、`dry-run-AgentSessions.txt`，不 commit）；對話中只輸出各 status 的計數，不印檔名清單或內容
- [x] 三道關卡全過才算通過：每個要轉換的檔案正文逐位元相同、轉換後分隔數等於轉換前、對 dry-run 結果再跑一次沒有變更
- [x] 不讀取對話正文內容做其他用途；跳過與錯誤的檔案只回報計數與原因類別
- [x] 回報後停止，等使用者說「套用」。套用指令（使用者核准後才執行）：加 `--apply --backup-dir C:/Drivesync/MainVault/Backend/System/Backups/turn_headings_{yyyyMMdd}/{AIChats|AgentSessions}`

Dry-run（未套用、未改名）：AIChats planned 669、skipped-non-conversation 158、skipped-protected 16、skipped-nonsequential 10、skipped-duplicate 3、error 0；AgentSessions planned 481、skipped-non-conversation 103、skipped-nonsequential 2、error 0。

PROMPT3 重跑：正文比較共用轉換器中繼資料規則後，AIChats 669／669、AgentSessions 481／481 皆通過正文位元組、分隔數及第二次轉換冪等性三道關卡；各 status 計數與上列一致，error 0。前次 AIChats 63 筆為允許的中繼資料變更誤判，並非正文缺漏。兩份私人報告已更新但不提交；未套用、未改名，等待使用者說「套用」。
