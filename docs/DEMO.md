# BiasBrief 本地 Demo 指南

## 启动
- 双击 `start-demo.command`（第一次可能要右键 → 打开）。浏览器会自动打开 http://localhost:8080 。
- 演示期间不要关掉那个终端窗口；按 Ctrl+C 停止。
- 需要：Bun（`~/.bun/bin/bun`）、项目根目录下的 `.env.local`（内容 `GOOGLE_API_KEY=...`，不在 GitHub 上）、能上网。

## 场景 A：CP fan（Winrina / Jiminjeong）
1. Profile → 选 aespa → 第 3 步选 **CP fan** → 第 4 步选 **♡ Winrina / Jiminjeong (Karina × Winter)** → Save & get my brief。
2. Today 页：For Your Ship = 4 条 X + 5 条 TikTok（精选）+ YouTube；aespa 官方 X 在 Official Updates。
3. 点 **X** / **TikTok** 平台筛选；点卡片底部 "View original…" 打开原帖。

## 场景 B：Karina solo stan
1. Profile → 第 2 步选 **Karina** → 第 3 步选 **Solo stan** → 第 4 步取消 Winrina → Save。
2. Today 页：For Your Bias = 5 条 X + 5 条 TikTok + Karina 的 YouTube；For Your Ship 消失。

## 数据来源（演示时可以这样说）
- YouTube：实时 API。X / TikTok：团队手动精选的 20 条真实帖子（`src/data/curatedFandomContent.ts`），不是实时 API。
- X 日期、作者、文案来自 X 官方 oEmbed；TikTok 链接通过 TikTok 自己的跳转解析，作者/文案来自 TikTok 官方 oEmbed。没有的数据（TikTok 日期、互动数）一律为空，不编造。

## 注意
- YouTube 配额每天 10,000 单位，太平洋时间午夜重置；一组新偏好约 500–700。演示前先把两个场景各走一遍预热（结果缓存 1 小时）。重启服务器会清空缓存。
- 同一 Wi-Fi 的人可以用 `http://<你的电脑IP>:8080` 访问；校园/公司网络常常禁止设备互访，这时用手机热点或只在你的电脑上演示。
