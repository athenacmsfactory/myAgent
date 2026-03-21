#!/bin/bash
# Athena CMS Nightly Maintenance Script
# Dit script voert essentiële opschoon- en onderhoudstaken uit.

# Bepaal de project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FACTORY_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🌙 [$(date)] Start Athena Nightly Maintenance..."

# 1. Storage Pruning
node "$FACTORY_ROOT/factory/6-utilities/storage-prune.js"

# 2. Log Rotation (indien beschikbaar)
if [ -f "$FACTORY_ROOT/factory/6-utilities/rotate-logs.js" ]; then
    node "$FACTORY_ROOT/factory/6-utilities/rotate-logs.js"
fi

# 3. Git Maintenance (optioneel)
# git -C "$FACTORY_ROOT" gc --prune=now --quiet

echo "✅ [$(date)] Maintenance complete."
