// 数据加载辅助函数
// GitHub Pages 静态托管时，从 JSON 文件直接读取
// 本地开发/Netlify 时，从 API 读取

const isStaticExport = process.env.NEXT_PUBLIC_BASE_PATH !== undefined;

export function getDataPath(filename: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  if (isStaticExport) {
    // 静态导出模式：直接从 data/ 目录读取 JSON
    return `${basePath}/data/${filename}.json`;
  }
  
  // 开发/Netlify 模式：使用 API
  return `/api/${filename}`;
}
