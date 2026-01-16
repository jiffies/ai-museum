<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xvZWEDI_wBTFh_IijY8n_m1fCrgzn8Gx

## 使用说明

- User Address：填写 0x 开头的钱包地址
- Market Slug：填写市场 slug（如 `btc-updown-15m-1766558700`），留空表示不过滤
- 数据来源：先用 getTrades 两次标注 Maker/Taker，再用 getActivity 做分析与统计
- 本地开发若遇到 Gamma CORS，会优先走 `/api/gamma`（Vite 代理），失败后再尝试公共代理（`GAMMA_API_PROXIES`）

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
