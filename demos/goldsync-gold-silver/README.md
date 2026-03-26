# GoldSync - 金银通

实时金银价格查询工具，支持国际市场和中国市场价格对比。

## 功能特性

- 📊 实时国际金银价格（美元/盎司）
- 💰 中国市场金银价格（人民币/克）
- 🏪 零售价格参考（含工艺费）
- ♻️ 回收价格参考
- 🧮 价值计算器
- 💱 实时汇率更新

## 数据来源

### 实时数据
1. **美元兑人民币汇率（USD/CNY）**
   - 来源: [ExchangeRate-API](https://www.exchangerate-api.com)
   - 频率: 实时更新（每次刷新时获取）
   - 备用值: 7.25（API失败时使用）

### 参考价格（2026年1月28日）
2. **国际金银现货价格**
   - 黄金（XAU/USD）: ~$5,100/盎司（历史新高）
   - 白银（XAG/USD）: ~$110/盎司（历史新高）
   - 来源:
     - [FXStreet - Gold Forecast](https://www.fxstreet.com/markets/commodities/metals/gold)
     - [TradingView - XAUUSD](https://www.tradingview.com/symbols/XAUUSD/)
   - 注: 2026年1月金银价格创历史新高，黄金突破$5,000，白银突破$100

### 计算数据
3. **中国市场现货价格**
   - 计算公式: `国际价格(USD/oz) × 汇率 ÷ 31.1035(g/oz) × 1.02(溢价)`
   - 中国市场溢价: 2%（考虑进口成本、关税等）

4. **零售价格**（品牌金店挂牌价参考）
   - 黄金零售价: 中国现货价 × 1.15（含15%工艺费）
   - 白银零售价: 中国现货价 × 1.25（含25%工艺费）
   - 参考: 周大福、老凤祥等品牌金店

5. **回收价格**（典当/回收商报价参考）
   - 黄金回收价: 中国现货价 × 0.97（折价3%）
   - 白银回收价: 中国现货价 × 0.95（折价5%）
   - 参考: 典当行、银行、黄金回收商

## 本地运行

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 升级到实时金银价格

由于大多数金融API都有CORS限制或需要付费，当前版本使用市场参考价。如需实时数据，可以：

### 方案1：使用免费API（需要申请key）

1. 注册 [GoldAPI.io](https://www.goldapi.io) 或 [MetalPriceAPI](https://metalpriceapi.com)
2. 获取免费API key
3. 修改 `services/dataService.ts` 中的 `fetchMetalPrices` 函数

### 方案2：使用后端代理

创建一个简单的后端服务器来代理API请求，避免CORS限制。

### 方案3：使用Gemini API（原始方案）

如果有Gemini API key，可以使用 `services/geminiService.ts` 中的实现。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS

## 许可证

MIT
