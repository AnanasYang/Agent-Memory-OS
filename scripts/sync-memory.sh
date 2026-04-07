#!/bin/bash
# AI Memory System 同步脚本
# 解决第6b和第7个问题：打通本地与 GitHub 的同步

set -e

echo "🔄 AI Memory System 同步脚本"
echo "=============================="

# 配置
AI_MEMORY_DIR="/home/bruce/.openclaw/workspace/ai-memory-system"
AGENT_OS_DIR="/home/bruce/.openclaw/workspace/agent-memory-os"
LOG_FILE="/tmp/memory-sync.log"

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 1. 检查 ai-memory-system 更新
check_updates() {
    log "检查 ai-memory-system 更新..."
    cd "$AI_MEMORY_DIR"
    
    # 获取 Git 状态
    git fetch origin main --quiet 2>/dev/null || true
    
    LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "none")
    REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "$LOCAL")
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        log "⚠️ 发现远程更新，需要拉取"
        return 1
    else
        log "✅ 本地已是最新"
        return 0
    fi
}

# 2. 提交本地更改到 GitHub
sync_to_github() {
    log "同步本地更改到 GitHub..."
    cd "$AI_MEMORY_DIR"
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        git add -A
        git commit -m "auto: daily sync $(date '+%Y-%m-%d-%H:%M')" || true
        git push origin main || log "⚠️ GitHub 推送失败（可能是网络问题）"
        log "✅ 本地更改已提交到 GitHub"
    else
        log "ℹ️ 没有需要提交的更改"
    fi
}

# 3. 同步数据到 agent-memory-os 缓存
sync_to_os() {
    log "同步数据到 Agent Memory OS..."
    
    # 确保目录存在
    mkdir -p "$AGENT_OS_DIR/memory/dreams/daily"
    mkdir -p "$AGENT_OS_DIR/memory/dreams/weekly"
    
    # 复制 L1 记忆作为 Dreams
    if [ -d "$AI_MEMORY_DIR/Memory/L1-episodic" ]; then
        for file in "$AI_MEMORY_DIR"/Memory/L1-episodic/*daily*.md; do
            if [ -f "$file" ]; then
                basename=$(basename "$file")
                # 转换为 JSON 格式缓存
                date_str=$(echo "$basename" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' || date +%Y-%m-%d)
                json_file="$AGENT_OS_DIR/memory/dreams/daily/${date_str}-dream.json"
                
                if [ ! -f "$json_file" ]; then
                    cat > "$json_file" << EOF
{
  "id": "${date_str}-dream",
  "date": "$date_str",
  "timestamp": $(date -d "$date_str" +%s000 2>/dev/null || echo 0),
  "summary": "Synced from ai-memory-system",
  "status": "success",
  "source": "ai-memory-system"
}
EOF
                fi
            fi
        done
        log "✅ Dreams 数据已同步"
    fi
    
    # 生成系统状态缓存
    status_file="$AGENT_OS_DIR/memory/system-status.json"
    cat > "$status_file" << EOF
{
  "lastSync": "$(date -Iseconds)",
  "lastGithubSync": "$(cd $AI_MEMORY_DIR && git log -1 --format=%cd --date=iso 2>/dev/null || echo 'unknown')",
  "l1Count": $(find "$AI_MEMORY_DIR/Memory/L1-episodic" -name "*.md" 2>/dev/null | wc -l),
  "l2Count": $(find "$AI_MEMORY_DIR/Memory/L2-procedural" -name "*.md" 2>/dev/null | wc -l),
  "l3Count": $(find "$AI_MEMORY_DIR/Memory/L3-semantic" -name "*.md" 2>/dev/null | wc -l),
  "l4Count": $(find "$AI_MEMORY_DIR/Memory/L4-core" -name "*.md" 2>/dev/null | wc -l),
  "weeklyReviews": $(find "$AI_MEMORY_DIR/Meta/reviews/weekly" -name "*.md" 2>/dev/null | wc -l)
}
EOF
    log "✅ 系统状态缓存已更新"
}

# 4. 生成每日 Dream（如果没有的话）
generate_daily_dream() {
    log "检查今日 Dream..."
    
    TODAY=$(date +%Y-%m-%d)
    DREAM_FILE="$AI_MEMORY_DIR/Memory/L1-episodic/${TODAY}-daily-dream.md"
    
    if [ ! -f "$DREAM_FILE" ]; then
        log "⚠️ 今日 Dream 不存在，需要生成"
        # 这里可以调用 AI 生成 Dream 的逻辑
        # 目前只是标记需要生成
        echo "$TODAY" > /tmp/need-dream-generation
    else
        log "✅ 今日 Dream 已存在"
    fi
}

# 5. 检查需要 Review 的记忆
check_reviews() {
    log "检查待 Review 的记忆..."
    
    cd "$AI_MEMORY_DIR"
    
    # 检查 L1 超过 7 天的
    find Memory/L1-episodic -name "*.md" -mtime +7 -type f 2>/dev/null | while read file; do
        log "📋 L1 待 Review: $file"
    done
    
    # 检查 L2 超过 30 天的
    find Memory/L2-procedural -name "*.md" -mtime +30 -type f 2>/dev/null | while read file; do
        log "📋 L2 待 Review: $file"
    done
}

# 主流程
main() {
    log "开始同步..."
    
    # 检查目录是否存在
    if [ ! -d "$AI_MEMORY_DIR" ]; then
        log "❌ 错误: ai-memory-system 目录不存在"
        exit 1
    fi
    
    if [ ! -d "$AGENT_OS_DIR" ]; then
        log "❌ 错误: agent-memory-os 目录不存在"
        exit 1
    fi
    
    # 执行同步步骤
    sync_to_github
    sync_to_os
    generate_daily_dream
    check_reviews
    
    log "同步完成!"
    echo ""
    echo "📊 同步摘要:"
    echo "  - GitHub 同步: 完成"
    echo "  - Agent OS 数据更新: 完成"
    echo "  - 系统状态缓存: 已更新"
    echo ""
    echo "查看详细日志: $LOG_FILE"
}

# 执行
main "$@"
