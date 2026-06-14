#!/usr/bin/env bash
# Smoke test: serve the site and confirm every page returns 200 with its
# expected content. Usage: bash scripts/smoke.sh
set -u

DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8799}"

python3 -m http.server "$PORT" --directory "$DIR" >/dev/null 2>&1 &
SRV=$!
trap 'kill "$SRV" 2>/dev/null' EXIT

# Wait for the server to come up.
for _ in $(seq 1 25); do
  curl -fs "http://localhost:$PORT/" >/dev/null 2>&1 && break
  sleep 0.2
done

PAGES=(
  "index.html|Treat your car to a spa day"
  "services.html|Everything your car needs"
  "membership.html|Wash often? Pay less"
  "book.html|Reserve your spot"
  "pay.html|Pay from your phone"
  "gift-cards.html|Give the gift of a clean car"
  "contact.html|Come say hello"
)

FAIL=0
TMP="$(mktemp)"
for entry in "${PAGES[@]}"; do
  page="${entry%%|*}"
  marker="${entry#*|}"
  code="$(curl -s -o "$TMP" -w "%{http_code}" "http://localhost:$PORT/$page")"
  if [ "$code" = "200" ] && grep -qF "$marker" "$TMP"; then
    echo "PASS  $page ($code)"
  else
    echo "FAIL  $page (http $code, expected marker: '$marker')"
    FAIL=1
  fi
done
rm -f "$TMP"

if [ "$FAIL" -eq 0 ]; then
  echo "All pages OK."
else
  echo "Smoke test FAILED."
fi
exit "$FAIL"
