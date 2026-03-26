import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MarketData, Source } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const dataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    international_gold_usd_oz: { type: Type.NUMBER, description: "Current International Spot Gold price in USD per Troy Ounce" },
    international_silver_usd_oz: { type: Type.NUMBER, description: "Current International Spot Silver price in USD per Troy Ounce" },
    china_gold_spot_cny_g: { type: Type.NUMBER, description: "Current Shanghai Gold Exchange (Au99.99) price in CNY per Gram" },
    china_silver_spot_cny_g: { type: Type.NUMBER, description: "Current Shanghai Gold Exchange Silver (Ag) price in CNY per Gram" },
    retail_gold_cny_g: { type: Type.NUMBER, description: "Today's retail gold price for major brands like Chow Tai Fook in CNY per Gram" },
    recycle_gold_cny_g: { type: Type.NUMBER, description: "Current Gold recycling/buyback price in CNY per Gram" },
    retail_silver_cny_g: { type: Type.NUMBER, description: "Today's retail silver price (e.g. 999 Fine Silver or S925) in CNY per Gram" },
    recycle_silver_cny_g: { type: Type.NUMBER, description: "Current Silver recycling/buyback price in CNY per Gram" },
    usd_cny_rate: { type: Type.NUMBER, description: "Current USD to CNY exchange rate" },
  },
  required: [
    "international_gold_usd_oz",
    "international_silver_usd_oz",
    "china_gold_spot_cny_g",
    "china_silver_spot_cny_g",
    "retail_gold_cny_g",
    "recycle_gold_cny_g",
    "retail_silver_cny_g",
    "recycle_silver_cny_g",
    "usd_cny_rate"
  ]
};

export const fetchMarketData = async (): Promise<MarketData> => {
  if (!apiKey || !ai) {
    throw new Error("未配置 API Key，无法获取真实数据。请配置环境变量 API_KEY。");
  }

  try {
    // Optimized Prompt for better Chinese context retrieval including Silver
    const prompt = `
      请利用 Google 搜索查询以下最新的实时财经数据，并以精确的 JSON 格式返回：
      1. 国际现货黄金 (XAU) 和白银 (XAG) 的最新美元/盎司价格。
      2. 上海黄金交易所 (SGE) 的 Au99.99 和 Ag(T+D) 的最新人民币/克价格。
      3. 中国知名品牌金店（如周大福、周生生、老凤祥）今日的"足金零售价" (CNY/g)。
      4. 中国国内今日黄金的大致回收/回购均价 (CNY/g)。
      5. 中国市场今日"足银"或投资银条的平均零售价 (CNY/g)。
      6. 中国国内今日白银的大致回收/回购均价 (CNY/g)。
      7. 实时美元兑离岸人民币 (USD/CNH) 汇率。
      
      注意：请确保通过搜索结果验证数据的时效性，优先使用 Kitco、新浪财经、上海黄金交易所官网或各大金店官网的数据。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Google Search Grounding
        responseMimeType: "application/json",
        responseSchema: dataSchema
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");

    const parsedData = JSON.parse(jsonText);
    
    // Extract grounding sources with URLs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const rawSources: Source[] = chunks
      .map((c: any) => ({
        name: c.web?.title || "Web Source",
        url: c.web?.uri
      }))
      .filter((s: Source) => s.url); // Filter out empty URLs

    // Deduplicate by URL
    const uniqueSources: Source[] = [];
    const seenUrls = new Set();
    for (const s of rawSources) {
      if (!seenUrls.has(s.url)) {
        seenUrls.add(s.url);
        uniqueSources.push(s);
      }
    }

    // Fallback if no sources found
    const finalSources = uniqueSources.length > 0 
      ? uniqueSources.slice(0, 4) 
      : [{ name: "Google Search (Gemini)", url: "https://google.com" }];

    return {
      ...parsedData,
      last_updated: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      sources: finalSources
    };
  } catch (error: any) {
    console.error("Failed to fetch market data:", error);
    // Propagate the error to be shown in UI
    throw new Error(error.message || "获取数据失败");
  }
};
