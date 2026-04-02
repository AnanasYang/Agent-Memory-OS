/**
 * Health Monitor Page
 * 系统健康监控面板
 */

import { Metadata } from "next";
import HealthDashboard from "@/components/health-dashboard";

export const metadata: Metadata = {
  title: "健康监控 | Agent Memory OS",
  description: "系统健康状态监控面板",
};

export default function HealthPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                健康监控
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                实时监控 AI 记忆系统运行状态、Dream 执行情况和数据健康度
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                返回首页
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 仪表盘内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HealthDashboard 
          refreshInterval={30000}
          wsEnabled={true}
          wsPort={3001}
        />
      </div>
    </main>
  );
}
