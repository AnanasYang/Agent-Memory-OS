#!/bin/bash
# 注册 Dream Cron 任务

echo "🌙 注册 Dream Cron 任务..."

# 获取当前时间戳
NOW=$(date +%s%3N)

# 创建临时 jobs 文件
cat > /tmp/dream-cron-jobs.json << 'CRONJOBS'
{
  "version": 1,
  "jobs": [
    {
      "id": "daily-memory-dream-v1",
      "agentId": "main",
      "name": "daily-memory-dream",
      "enabled": true,
      "createdAtMs": NOW_MS,
      "updatedAtMs": NOW_MS,
      "schedule": {
        "kind": "cron",
        "expr": "0 23 * * *",
        "tz": "Asia/Shanghai"
      },
      "sessionTarget": "main",
      "wakeMode": "now",
      "payload": {
        "kind": "systemEvent",
        "text": "🌙 Daily Memory Dream 执行中...\n\n执行命令：cd ~/.openclaw/workspace/agent-memory-os && node scripts/daily-dream.mjs\n\n此任务将：\n1. 收集当天所有会话数据\n2. 提炼关键事件和模式\n3. 生成 L1 情景记忆\n4. 保存到 memory/dreams/daily/"
      },
      "state": {
        "nextRunAtMs": NEXT_RUN_DAILY,
        "lastStatus": "pending"
      }
    },
    {
      "id": "weekly-memory-dream-v1",
      "agentId": "main",
      "name": "weekly-memory-dream",
      "enabled": true,
      "createdAtMs": NOW_MS,
      "updatedAtMs": NOW_MS,
      "schedule": {
        "kind": "cron",
        "expr": "0 22 * * 0",
        "tz": "Asia/Shanghai"
      },
      "sessionTarget": "main",
      "wakeMode": "now",
      "payload": {
        "kind": "systemEvent",
        "text": "🌙 Weekly Memory Dream 执行中...\n\n执行命令：cd ~/.openclaw/workspace/agent-memory-os && node scripts/weekly-dream.mjs\n\n此任务将：\n1. 读取本周所有 Daily Dreams\n2. 深度提炼生成周回顾\n3. 更新 L2/L3 记忆\n4. 保存到 memory/dreams/weekly/"
      },
      "state": {
        "nextRunAtMs": NEXT_RUN_WEEKLY,
        "lastStatus": "pending"
      }
    }
  ]
}
CRONJOBS

# 替换时间戳
sed -i "s/NOW_MS/$NOW/g" /tmp/dream-cron-jobs.json

# 计算下次执行时间（今天23:00或明天23:00）
CURRENT_HOUR=$(date +%H)
if [ $CURRENT_HOUR -lt 23 ]; then
  NEXT_DAILY=$(date -d "today 23:00" +%s%3N)
else
  NEXT_DAILY=$(date -d "tomorrow 23:00" +%s%3N)
fi
sed -i "s/NEXT_RUN_DAILY/$NEXT_DAILY/g" /tmp/dream-cron-jobs.json

# 计算下次周日22:00
NEXT_SUNDAY=$(date -d "next Sunday 22:00" +%s%3N 2>/dev/null || date -d "Sunday 22:00" +%s%3N)
sed -i "s/NEXT_RUN_WEEKLY/$NEXT_SUNDAY/g" /tmp/dream-cron-jobs.json

echo "✅ Cron 任务配置已生成"
echo ""
echo "执行时间："
echo "  - Daily:  每天 23:00 (Asia/Shanghai)"
echo "  - Weekly: 每周日 22:00 (Asia/Shanghai)"
echo ""
echo "配置文件：/tmp/dream-cron-jobs.json"
echo ""
echo "⚠️  需要手动将此配置合并到 ~/.openclaw/cron/jobs.json"
