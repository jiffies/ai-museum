/**
 * Input: 无
 * Output: React应用挂载到DOM
 * 地位: 应用启动入口，初始化React
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('找不到root元素');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
