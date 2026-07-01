# 官長、主任退休祝福卡片

這是一個可放到 GitHub Pages 的靜態祝福頁，沿用「泓豪新婚祝福卡片」的資料邏輯：祝福先存在瀏覽器本機，可複製含祝福資料的分享連結，也可用 JSON 匯出、匯入整理成最後留念版。

## 使用方式

1. 開啟 `index.html`。
2. 填寫署名與祝福語。
3. 需要整理或備份時，使用「匯出祝福」下載 JSON。
4. 要合併其他人的祝福時，使用「匯入祝福」選擇 JSON 檔。
5. 要分享目前留言內容時，使用「複製分享連結」。

## 發布到 GitHub Pages

1. 建立 GitHub repository。
2. 上傳 `github-pages` 資料夾中的所有檔案到 repository 根目錄。
3. 到 repository 的 `Settings` -> `Pages`。
4. Source 選 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`。
6. 等 GitHub Pages 產生網址。

網址通常會長這樣：

```text
https://你的帳號.github.io/你的repository名稱/
```

## 重新產出發布檔

```powershell
python build_outputs.py
```

會產出：

- `github-pages/`：適合直接上傳 GitHub Pages 的多檔版本。
- `github-pages-single/index.html`：把圖片、CSS、JS 合成在同一個檔案中的版本。
