# 01: 抽出共用渲染模組並以建置步驟內嵌到四站

**What to build:** 四站目前各自複製 `formatTimeRange`、`buildComHeader`、`formatComMetadata`、整合後渲染與整合對話框。把這些移到單一共用來源，由建置腳本內嵌進四個 `.user.js`，讓 Tampermonkey 安裝連結維持單檔、不依賴執行期 `@require`。本 ticket 是純重構：輸出必須與現況逐字相同。

**Blocked by:** None (can start immediately)

**Status:** done

- [x] 共用來源只有一份；四個 `.user.js` 由建置腳本產生（或更新標記區段），手改產物會被檢查抓到
- [x] 新增檢查：共用區段與共用來源不一致時失敗（可放在既有 tests 執行流程中）
- [x] 以固定合成訊息模型對四站 COM 輸出做 snapshot，重構前後逐字相同
- [x] 現有 tests 全過；README「開發與驗收」說明如何重新建置

驗證：12 支 `check-*.js` 全過（私人證據 CLI 除外），24 組重構前 COM 快照逐字一致；隔離 Brave 通過 ChatGPT／Gemini DOM fixture、四站對話框 callback 與 Gemini 差異分頁。未做即時登入三來源驗收。
