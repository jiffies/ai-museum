import { chromium } from 'playwright';

async function fetchRetailPrices() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('正在获取首饰专柜价格...');
    await page.goto('https://quote.cngold.org/gjs/swhj.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待内容加载
    await page.waitForTimeout(3000);

    // 获取黄金和白银的零售价格
    const retailPrices = await page.evaluate(() => {
      const data = { gold_prices: [], silver_prices: [] };

      try {
        // 查找所有包含价格的元素（多种可能的选择器）
        const priceElements = document.querySelectorAll('[class*="price"], [class*="num"], [class*="value"], .quote-item, div[data-price]');

        // 遍历所有文本节点查找价格
        const allText = document.body.innerText;
        const lines = allText.split('\n');

        lines.forEach((line) => {
          const trimmed = line.trim();
          // 查找格式like "黄金价格：XXX" 或 "XXX元/克"
          const goldMatch = trimmed.match(/(\d+\.?\d*)\s*(元\/克|\/克)?/);
          if (goldMatch && trimmed.includes('黄金') || trimmed.includes('Au')) {
            const price = parseFloat(goldMatch[1]);
            if (price > 300 && price < 2000) {  // 合理价格范围
              data.gold_prices.push(price);
            }
          }

          if (goldMatch && (trimmed.includes('白银') || trimmed.includes('Ag'))) {
            const price = parseFloat(goldMatch[1]);
            if (price > 5 && price < 100) {  // 白银合理价格范围
              data.silver_prices.push(price);
            }
          }
        });

        console.log(`找到 ${data.gold_prices.length} 个黄金价格`);
        console.log(`找到 ${data.silver_prices.length} 个白银价格`);

      } catch (e) {
        console.error('解析价格失败:', e.message);
      }

      return data;
    });

    // 计算平均价格
    const result = {};
    if (retailPrices.gold_prices.length > 0) {
      result.gold_retail = Math.round(
        retailPrices.gold_prices.reduce((a, b) => a + b, 0) / retailPrices.gold_prices.length
      );
    }
    if (retailPrices.silver_prices.length > 0) {
      result.silver_retail = parseFloat(
        (retailPrices.silver_prices.reduce((a, b) => a + b, 0) / retailPrices.silver_prices.length).toFixed(1)
      );
    }

    console.log('首饰专柜价格:', result);
    await browser.close();
    return result;
  } catch (error) {
    console.error('获取首饰专柜价格失败:', error.message);
    await browser.close();
    return {};
  }
}

async function fetchRecyclePrices() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('正在获取回收价格...');
    await page.goto('https://quote.cngold.org/gjs/hjhs.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待内容加载
    await page.waitForTimeout(3000);

    // 获取黄金和白银的回收价格
    const recyclePrices = await page.evaluate(() => {
      const data = { gold_prices: [], silver_prices: [] };

      try {
        // 遍历所有文本查找价格
        const allText = document.body.innerText;
        const lines = allText.split('\n');

        lines.forEach((line) => {
          const trimmed = line.trim();
          // 查找格式like "黄金回收：XXX" 或 "XXX元/克"
          const goldMatch = trimmed.match(/(\d+\.?\d*)\s*(元\/克|\/克)?/);
          if (goldMatch && (trimmed.includes('黄金') || trimmed.includes('Au') || trimmed.includes('回收'))) {
            const price = parseFloat(goldMatch[1]);
            if (price > 300 && price < 2000) {  // 合理价格范围
              data.gold_prices.push(price);
            }
          }

          if (goldMatch && (trimmed.includes('白银') || trimmed.includes('Ag'))) {
            const price = parseFloat(goldMatch[1]);
            if (price > 5 && price < 100) {  // 白银合理价格范围
              data.silver_prices.push(price);
            }
          }
        });

        console.log(`找到 ${data.gold_prices.length} 个黄金回收价`);
        console.log(`找到 ${data.silver_prices.length} 个白银回收价`);

      } catch (e) {
        console.error('解析价格失败:', e.message);
      }

      return data;
    });

    // 计算平均价格
    const result = {};
    if (recyclePrices.gold_prices.length > 0) {
      result.gold_recycle = Math.round(
        recyclePrices.gold_prices.reduce((a, b) => a + b, 0) / recyclePrices.gold_prices.length
      );
    }
    if (recyclePrices.silver_prices.length > 0) {
      result.silver_recycle = parseFloat(
        (recyclePrices.silver_prices.reduce((a, b) => a + b, 0) / recyclePrices.silver_prices.length).toFixed(1)
      );
    }

    console.log('回收价格:', result);
    await browser.close();
    return result;
  } catch (error) {
    console.error('获取回收价格失败:', error.message);
    await browser.close();
    return {};
  }
}

async function main() {
  console.log('开始爬取中国金银价格...\n');

  const retailPrices = await fetchRetailPrices();
  console.log('');
  const recyclePrices = await fetchRecyclePrices();

  const priceData = {
    timestamp: new Date().toISOString(),
    retail: retailPrices,
    recycle: recyclePrices,
    updated_at: new Date().toLocaleString('zh-CN')
  };

  console.log('\n=== 汇总数据 ===');
  console.log(JSON.stringify(priceData, null, 2));

  return priceData;
}

main().catch(console.error);
