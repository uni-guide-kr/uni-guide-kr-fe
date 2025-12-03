const express = require('express');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:8300';
const PORT = Number(process.env.PORT) || 4300;
const handbookDir = process.env.DEPARTMENT_HANDBOOK_DIR
  ? path.resolve(process.env.DEPARTMENT_HANDBOOK_DIR)
  : path.join(__dirname, '..', 'uni-guide-be', 'file', 'department handbook');

// FastAPI 백엔드로 프록시 (API 요청)
app.use('/api', createProxyMiddleware({
  target: API_ORIGIN,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
}));

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'build')));

// department handbook 폴더를 정적 파일로 제공
if (fs.existsSync(handbookDir)) {
  app.use('/department handbook', express.static(handbookDir));
} else {
  console.warn(`⚠️  department handbook 디렉터리를 찾을 수 없습니다: ${handbookDir}`);
}

// SPA 라우팅 지원 - 모든 요청을 index.html로
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 uni-guide 웹 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   API proxy target: ${API_ORIGIN}`);
});

