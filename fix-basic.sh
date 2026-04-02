#!/bin/bash
# 修复任务执行脚本 - 并行处理

echo "🚀 开始并行修复任务..."

# 任务1: 添加L0导航入口
sed -i "/nav.dashboard.*icon: Activity/a\\\    { href: '/l0', label: t('nav.l0'), icon: Activity }," /home/bruce/.openclaw/workspace/agent-memory-os/components/navigation.tsx
echo "✅ 任务1完成: L0导航入口已添加"

# 任务4: 修复搜索卡片显示
cd /home/bruce/.openclaw/workspace/agent-memory-os
# 将搜索结果中的 content 改为 title
sed -i 's/memory.content/memory.title/g' components/global-search.tsx
echo "✅ 任务4完成: 搜索卡片已修复"

echo "🎉 基础修复完成!"
