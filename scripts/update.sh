#!/bin/sh
# Holt den neuesten Stand aus GitHub und lädt nginx neu, wenn sich die Konfiguration geändert hat.
# Läuft auf dem Server per cron alle 5 Minuten, kann aber auch von Hand gestartet werden.
set -eu
cd "$(dirname "$0")/.."
before=$(git rev-parse HEAD)
git fetch --quiet origin main
git reset --quiet --hard origin/main
after=$(git rev-parse HEAD)
[ "$before" = "$after" ] && exit 0
echo "$(date -Iseconds) aktualisiert: ${before%"${before#???????}"} -> ${after%"${after#???????}"}"
if git diff --name-only "$before" "$after" | grep -qE '^(docker-compose\.yml|nginx\.conf)$'; then
  docker compose up -d --force-recreate
fi
