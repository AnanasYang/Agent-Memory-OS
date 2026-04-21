#!/bin/bash
# =============================================================================
# Agent Memory OS - 记忆数据同步脚本
# 用途: 将 ai-memory-system 的最新记忆数据同步到 agent-memory-os
#       并触发 Netlify 重新构建
# =============================================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 路径配置
AI_MEMORY_DIR="/home/bruce/.openclaw/workspace/ai-memory-system"
AGENT_OS_DIR="/home/bruce/.openclaw/workspace/agent-memory-os"
LOG_FILE="/tmp/memory-sync.log"

# 日期
DATE=$(date '+%Y-%m-%d %H:%M:%S')
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================" | tee -a "$LOG_FILE"
echo "🔄 记忆数据同步 - $DATE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# =============================================================================
# Step 1: 同步 ai-memory-system（记忆源仓库）
# =============================================================================
echo ""
echo -e "${BLUE}[Step 1/4]${NC} 同步 ai-memory-system 记忆源..." | tee -a "$LOG_FILE"

cd "$AI_MEMORY_DIR"

# 检查是否有未提交的更改
if [ -n "$(git status --short)" ]; then
    echo "  📝 检测到新记忆数据，正在提交..." | tee -a "$LOG_FILE"
    git add -A
    git commit -m "memory sync: $TIMESTAMP" || true
    git push origin main
    echo -e "  ${GREEN}✅ ai-memory-system 已推送${NC}" | tee -a "$LOG_FILE"
else
    echo "  ⏭️  记忆源无新数据，跳过提交" | tee -a "$LOG_FILE"
fi

# =============================================================================
# Step 2: 生成静态数据
# =============================================================================
echo ""
echo -e "${BLUE}[Step 2/4]${NC} 生成静态数据文件..." | tee -a "$LOG_FILE"

cd "$AGENT_OS_DIR"

# 重新生成 public/data/*.json
node scripts/build-static-data.js 2>&1 | tee -a "$LOG_FILE"

# 统计生成的数据
MEMORY_COUNT=$(grep -o '"memoryNodes"' public/data/unified-data.json | wc -l)
DREAM_COUNT=$(grep -o '"dreams"' public/data/dreams.json | wc -l)

echo -e "  ${GREEN}✅ 静态数据生成完成${NC}" | tee -a "$LOG_FILE"

# =============================================================================
# Step 3: 同步 agent-memory-os（触发 Netlify 构建）
# =============================================================================
echo ""
echo -e "${BLUE}[Step 3/4]${NC} 同步 agent-memory-os 构建仓库..." | tee -a "$LOG_FILE"

cd "$AGENT_OS_DIR"

if [ -n "$(git status --short public/data/)" ]; then
    echo "  📝 静态数据有更新，正在提交..." | tee -a "$LOG_FILE"
    git add public/data/
    git commit -m "sync: memory data $TIMESTAMP" || true
# 尝试推送（如果失败则提示手动推送）
PUSH_OUTPUT=$(git push origin main 2>&1) && {
    echo -e "  ${GREEN}✅ agent-memory-os 已推送，Netlify 将自动构建${NC}" | tee -a "$LOG_FILE"
} || {
    echo -e "  ${YELLOW}⚠️ 自动推送失败，请手动执行:${NC}" | tee -a "$LOG_FILE"
    echo "     cd $AGENT_OS_DIR && git push origin main" | tee -a "$LOG_FILE"
    echo -e "  ${YELLOW}   或检查 ~/.ssh/config 和 GitHub Token 配置${NC}" | tee -a "$LOG_FILE"
}
else
    echo "  ⏭️  静态数据无变化，跳过推送" | tee -a "$LOG_FILE"
fi

# =============================================================================
# Step 4: 验证构建（可选：本地模拟 Netlify 构建）
# =============================================================================
echo ""
echo -e "${BLUE}[Step 4/4]${NC} 验证数据完整性..." | tee -a "$LOG_FILE"

# 检查 JSON 数据有效性
for file in public/data/unified-data.json public/data/memory.json public/data/dreams.json public/data/l0-memories.json; do
    if [ -f "$file" ]; then
        SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
        echo "  📄 $(basename $file): ${SIZE} bytes" | tee -a "$LOG_FILE"
        
        # 验证 JSON 格式
        if node -e "JSON.parse(require('fs').readFileSync('$file'));" 2>/dev/null; then
            echo -e "    ${GREEN}✓ JSON 有效${NC}" | tee -a "$LOG_FILE"
        else
            echo -e "    ${RED}✗ JSON 格式错误${NC}" | tee -a "$LOG_FILE"
        fi
    else
        echo -e "  ${RED}✗ $file 不存在${NC}" | tee -a "$LOG_FILE"
    fi
done

echo ""
echo "========================================" | tee -a "$LOG_FILE"
echo -e "${GREEN}🎉 同步完成！${NC}" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo ""
echo "📋 摘要:" | tee -a "$LOG_FILE"
echo "  • 记忆源:  $AI_MEMORY_DIR" | tee -a "$LOG_FILE"
echo "  • 构建源:  $AGENT_OS_DIR" | tee -a "$LOG_FILE"
echo "  • 日志:    $LOG_FILE" | tee -a "$LOG_FILE"
echo "  • Netlify: 构建将在推送后自动触发" | tee -a "$LOG_FILE"
echo ""
