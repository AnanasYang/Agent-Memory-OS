#!/bin/bash
# 将会话摘要保存到 L0 记忆

DATE_STR=$(date +%Y-%m-%d)
TIME_STR=$(date +%H:%M:%S)
MEMORY_DIR="$HOME/.openclaw/workspace/agent-memory-os/memory"
L0_DIR="$MEMORY_DIR/L0-raw/$DATE_STR"

mkdir -p "$L0_DIR"

# 保存会话摘要
cat >> "$L0_DIR/backup-session.jsonl" << EOF
{"ts":$(date +%s%3N),"time":"$TIME_STR","role":"system","content":"Session checkpoint at $TIME_STR","source":"manual-backup"}
EOF

echo "✅ 会话检查点已保存到: $L0_DIR/"