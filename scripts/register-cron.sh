#!/bin/bash
# 注册 Dream Cron 任务到 OpenClaw

echo "🌙 Registering Dream Cron Jobs..."

# Daily Dream - 每天 23:00
openclaw cron add \
  --name "daily-memory-dream" \
  --schedule "0 23 * * *" \
  --timezone "Asia/Shanghai" \
  --exec "cd ~/.openclaw/workspace/agent-memory-os && node scripts/daily-dream.mjs" \
  --description "每日记忆复盘 - 自动提炼L0生成L1情景记忆"

# Weekly Dream - 每周日 22:00  
openclaw cron add \
  --name "weekly-memory-dream" \
  --schedule "0 22 * * 0" \
  --timezone "Asia/Shanghai" \
  --exec "cd ~/.openclaw/workspace/agent-memory-os && node scripts/weekly-dream.mjs" \
  --description "每周深度复盘 - 整合Daily Dreams更新L2/L3"

echo "✅ Dream Cron Jobs registered!"
echo ""
echo "Schedules:"
echo "  - Daily:  每天 23:00 (Asia/Shanghai)"
echo "  - Weekly: 每周日 22:00 (Asia/Shanghai)"
