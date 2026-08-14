#!/usr/bin/env bash
# Visual QA capture.
#
# Renders each route at each breakpoint with headless Chrome and writes PNGs to
# the output directory. Used to produce docs/VISUAL-QA.md.
#
#   ./scripts/qa-capture.sh [outdir] [baseurl]
#
# Requires Google Chrome. Start the dev server first (npm run dev).

set -euo pipefail

OUT="${1:-.qa}"
BASE="${2:-http://localhost:3000}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "Google Chrome not found at $CHROME" >&2
  exit 1
fi

# Breakpoints from docs/VISUAL-QA.md. Height is generous so the capture is
# full-page rather than a single viewport.
WIDTHS="${WIDTHS:-1440 1280 1024 768 430 390 360}"
ROUTES="${ROUTES:-/ /menu /menu/cocktails /menu/brunch /events /events/oasis-fridays /catering /private-events /visit /careers /not-a-real-page}"

mkdir -p "$OUT"

for route in $ROUTES; do
  slug=$(echo "$route" | sed 's#^/##; s#/#_#g')
  [ -z "$slug" ] && slug="home"
  for w in $WIDTHS; do
    # Tall window so the whole page lands in one capture.
    h=$(( w >= 1024 ? 4200 : 6400 ))
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
      --window-size="${w},${h}" \
      --screenshot="${OUT}/${slug}@${w}.png" \
      --virtual-time-budget=6000 \
      "${BASE}${route}" >/dev/null 2>&1 || echo "  ! failed ${route} @ ${w}"
    echo "  ${slug}@${w}.png"
  done
done

echo "Captures written to ${OUT}/"
