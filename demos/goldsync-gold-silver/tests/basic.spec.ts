// File input: Playwright 测试框架
// File output: 基础 E2E 测试用例
// File position: 测试目录，验证应用基本功能

import { test, expect } from '@playwright/test';

test.describe('金银通应用基础测试', () => {
  test('应用能正常加载', async ({ page }) => {
    await page.goto('/');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证标题存在
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('页面包含主要元素', async ({ page }) => {
    await page.goto('/');

    // 等待内容加载
    await page.waitForLoadState('domcontentloaded');

    // 验证页面有内容
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});
