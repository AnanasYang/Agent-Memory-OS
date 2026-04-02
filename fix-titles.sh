#!/bin/bash
# Add title field to all memory nodes in data.ts

cd /home/bruce/.openclaw/workspace/agent-memory-os

# Create a backup
cp lib/data.ts lib/data.ts.backup

# Use sed to add title field after id field for each memory node
sed -i 's/id: "L1-001",/id: "L1-001",\n    title: "VLM Project Documentation Discussion",/g' lib/data.ts
sed -i 's/id: "L1-002",/id: "L1-002",\n    title: "Industry Competition Concerns",/g' lib/data.ts
sed -i 's/id: "L1-003",/id: "L1-003",\n    title: "Cursor IDE Recommendation",/g' lib/data.ts
sed -i 's/id: "L1-004",/id: "L1-004",\n    title: "JSON Output Preference",/g' lib/data.ts
sed -i 's/id: "L1-005",/id: "L1-005",\n    title: "Resource Approval Challenges",/g' lib/data.ts
sed -i 's/id: "L1-006",/id: "L1-006",\n    title: "AI News Digest Review",/g' lib/data.ts
sed -i 's/id: "L1-007",/id: "L1-007",\n    title: "Tesla FSD v12 Discussion",/g' lib/data.ts
sed -i 's/id: "L1-008",/id: "L1-008",\n    title: "AI Agent Memory Architecture",/g' lib/data.ts
sed -i 's/id: "L1-009",/id: "L1-009",\n    title: "Legacy Code Maintenance Frustration",/g' lib/data.ts
sed -i 's/id: "L1-010",/id: "L1-010",\n    title: "Data Pipeline Automation Request",/g' lib/data.ts

# L2 nodes
sed -i 's/id: "L2-001",/id: "L2-001",\n    title: "Modern Development Tools Preference",/g' lib/data.ts
sed -i 's/id: "L2-002",/id: "L2-002",\n    title: "AI News Consumption Habit",/g' lib/data.ts
sed -i 's/id: "L2-003",/id: "L2-003",\n    title: "Documentation Value Pattern",/g' lib/data.ts
sed -i 's/id: "L2-004",/id: "L2-004",\n    title: "Legacy System Friction Pattern",/g' lib/data.ts
sed -i 's/id: "L2-005",/id: "L2-005",\n    title: "Automation Seeking Pattern",/g' lib/data.ts
sed -i 's/id: "L2-006",/id: "L2-006",\n    title: "Early Morning Focus Pattern",/g' lib/data.ts
sed -i 's/id: "L2-007",/id: "L2-007",\n    title: "Visual Communication Pattern",/g' lib/data.ts
sed -i 's/id: "L2-008",/id: "L2-008",\n    title: "Structured Review Cycle Pattern",/g' lib/data.ts

# L3 nodes
sed -i 's/id: "L3-001",/id: "L3-001",\n    title: "Resource-Constrained Context Framework",/g' lib/data.ts
sed -i 's/id: "L3-002",/id: "L3-002",\n    title: "Clarity and Structure Framework",/g' lib/data.ts
sed -i 's/id: "L3-003",/id: "L3-003",\n    title: "Organizational Navigation Framework",/g' lib/data.ts
sed -i 's/id: "L3-004",/id: "L3-004",\n    title: "AI\/ADAS Industry Awareness Framework",/g' lib/data.ts
sed -i 's/id: "L3-005",/id: "L3-005",\n    title: "Memory Architecture Understanding",/g' lib/data.ts

# L4 nodes
sed -i 's/id: "L4-001",/id: "L4-001",\n    title: "Commitment to Bruce Success",/g' lib/data.ts
sed -i 's/id: "L4-002",/id: "L4-002",\n    title: "Belief in Clarity and Structure",/g' lib/data.ts
sed -i 's/id: "L4-003",/id: "L4-003",\n    title: "Drive for Continuous Improvement",/g' lib/data.ts

echo "✅ Added title fields to all memory nodes"
