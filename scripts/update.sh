#!/bin/sh
# Holt den neuesten Stand aus GitHub, versieht die Dateien mit der Commit-Version
# und lädt nginx neu, wenn sich die Konfiguration geändert hat.
# Läuft auf dem Server per cron alle 5 Minuten, kann aber auch von Hand gestartet werden.
set -eu
cd "$(dirname "$0")/.."
before=$(git rev-parse HEAD)
git fetch --quiet origin main
after=$(git rev-parse origin/main)
[ "$before" = "$after" ] && [ "${1:-}" != "--force" ] && exit 0

git reset --quiet --hard origin/main
short=$(git rev-parse --short HEAD)
# Cache-Busting: index.html verweist danach auf /v/<commit>/… statt /v/dev/…
sed -i "s#v/dev/#v/$short/#g" site/index.html
echo "$(date -Iseconds) aktualisiert: $(echo "$before" | cut -c1-7) -> $short"

if git diff --name-only "$before" "$after" | grep -qE '^(docker-compose\.yml|nginx\.conf)$'; then
  docker compose up -d --force-recreate
fi
