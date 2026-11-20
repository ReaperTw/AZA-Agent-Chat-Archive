# 04: 統一檔名

**What to build:** 四站所有下載檔名依規範 §5。日常檔（單獨 API、單獨 DOM、COM）一律 `{站碼}_{對話名稱}_{yyyyMMdd_HHmmss}.md`，不標模式、不加 `_INCOMPLETE`。綜合對話框另存的副本與報告才加 `_API`／`_DOM`／`_REPORT`。目前的舊格式包括 `GPT_DOM_標題_時間`、`GPT_API_…_INCOMPLETE`、`CLD_API_…`、`GEM_${method}_…`、`Grok_${method}_…`、`_COM`、`_VERIFICATION`、`_DIFFERENCES`。

**Blocked by:** 03

**Status:** done

- [x] 檔名由共用模組的單一函式產生，四站都呼叫它；程式中不得殘留上列舊格式
- [x] 測試鎖定四站 × 日常／`_API`／`_DOM`／`_REPORT` 的檔名
- [x] repo `README.md` 的檔名與 COM 說明（「檔名標記固定為 API／DOM／COM」「綜合檔以 `_COM.md` 結尾」等段落）改為新規則

驗證：14 支回歸全過（私人證據 CLI 除外）；四站腳本無舊檔名格式。隔離 Brave 四站真實 callback 的日常／API／DOM／REPORT 檔名皆 PASS，副本 Blob 一致；未驗證作業系統下載或即時登入三來源。
