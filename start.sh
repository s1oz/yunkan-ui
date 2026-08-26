#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
exec python3 serve.py \
  --api "${YUNKAN_API:-http://127.0.0.1:23326}" \
  --media "${YUNKAN_MEDIA:-http://127.0.0.1:23406}" \
  --host "${HOST:-0.0.0.0}" \
  --port "${PORT:-18081}" \
  "$@"
