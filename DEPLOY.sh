#!/bin/bash
# =============================================================================
# Agent Memory OS v2 — 一键部署脚本
# 在本地终端运行此脚本即可推送所有更改到 GitHub 并触发 Netlify 构建
# =============================================================================

set -e

echo "=========================================="
echo "🚀 Agent Memory OS v2 部署"
echo "=========================================="
echo ""

cd ~/.openclaw/workspace/agent-memory-os

echo "📊 当前状态:"
git status --short | head -10
echo ""

# 检查是否有未推送的 commit
if git log --oneline origin/main..HEAD | grep -q .; then
    echo "📤 发现未推送的 commit，准备推送..."
    echo ""
    
    # 显示将要推送的 commits
    echo "将要推送的 commits:"
    git log --oneline origin/main..HEAD
    echo ""
    
    # Push
    echo "🚀 推送到 GitHub..."
    git push origin main
    
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📋 下一步:"
    echo "   1. Netlify 会自动检测到 push 并开始构建"
    echo "   2. 构建通常需要 1-3 分钟"
    echo "   3. 访问你的 Netlify 域名查看新界面"
    echo ""
    echo "🔗 验证链接:"
    echo "   主页面: https://你的域名.netlify.app/"
    echo "   数据检查: https://你的域名.netlify.app/api/unified-data"
    echo ""
else
    echo "⚠️ 没有未推送的 commit"
    echo ""
    echo "如果需要手动添加所有新文件:"
    echo "   git add -A"
    echo "   git commit -m 'feat: Neural Core v2 redesign'"
    echo "   git push origin main"
    echo ""
fi

echo "=========================================="
echo "🎨 v2 新功能预览"
echo "=========================================="
echo ""
echo "6 个全新页面:"
echo "   /          — 记忆核心 (5层同心圆动画)"
echo "   /memory    — 记忆星座 (轨道力导向图)"
echo "   /timeline  — 记忆河流 (流动时间轴)"
echo "   /dreams    — 梦境档案 (卡片时间轴)"
echo "   /insights  — 模式雷达 (雷达图+健康度)"
echo "   /l0        — L0 流 (实时消息)"
echo ""
echo "设计亮点:"
echo "   🌌 深空黑主题 + 浮动粒子背景"
echo "   🎯 5级色彩系统 (蓝→青→琥珀→紫→红)"
echo "   ✨ 玻璃态发光卡片 + Canvas 动画"
echo "   📱 底部浮动导航栏"
echo ""
echo "数据覆盖:"
echo "   20 条记忆 (L1:13 L2:4 L3:2 L4:1)"
echo "   19 条梦境回顾"
echo "   649 条 L0 实时消息"
echo "   1 个活跃意图目标"
echo ""
