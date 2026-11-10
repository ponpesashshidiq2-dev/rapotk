#!/usr/bin/env bash
#
# Tarik hasil build terbaru dari GitHub Pages ke folder web.
# Tidak butuh Node.js / npm — cukup curl. Cocok untuk server tanpa Node.
#
# Pemakaian:
#   bash update-web.sh                          # update folder tempat skrip ini berada
#   WEB_ROOT=/var/www/rapotk bash update-web.sh # ke folder lain
#   BASE_URL=https://...   bash update-web.sh   # sumber build lain
#
# Contoh (sekali jalan di server):
#   curl -fsSL https://raw.githubusercontent.com/ponpesashshidiq2-dev/rapotk/main/update-web.sh -o update-web.sh
#   bash update-web.sh
#
# Contoh cron (tiap 30 menit, tanpa prompt):
#   */30 * * * * cd /path/docroot && bash update-web.sh >> /tmp/rapotk-update.log 2>&1
#
set -euo pipefail

BASE_URL="${BASE_URL:-https://ponpesashshidiq2-dev.github.io/rapotk}"

case "$0" in
  */*) _dir="${0%/*}" ;;
  *)   _dir="." ;;
esac
WEB_ROOT="${WEB_ROOT:-$(cd "$_dir" && pwd)}"
unset _dir

log()  { printf '\033[1;36m[%s]\033[0m %s\n' "$(date '+%H:%M:%S')" "$*"; }
die()  { printf '\033[1;31m[GAGAL]\033[0m %s\n' "$*" >&2; exit 1; }

case "${1:-}" in
  -h|--help|help)
    cat <<'EOF'
Tarik hasil build terbaru (GitHub Pages) ke folder web — tanpa Node.js.

  bash update-web.sh                           update folder tempat skrip berada
  WEB_ROOT=/var/www/rapotk bash update-web.sh   ke folder lain
  BASE_URL=https://...   bash update-web.sh     sumber build lain

Cron (tiap 30 menit, tanpa prompt):
  */30 * * * * cd /path/docroot && bash update-web.sh >> /tmp/rapotk-update.log 2>&1
EOF
    exit 0
    ;;
  "")
    ;;
  *)
    die "Opsi tidak dikenal: $1 (gunakan -h untuk bantuan)"
    ;;
esac

command -v curl >/dev/null 2>&1 || die "curl tidak ditemukan di server"
command -v grep >/dev/null 2>&1 || die "grep tidak ditemukan di server"
[ -d "$WEB_ROOT" ] || die "Folder web tidak ada: $WEB_ROOT"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

log "Sumber build : $BASE_URL"
log "Folder web   : $WEB_ROOT"

# ---------------------------------------------------------------- unduh
log "Unduh index.html"
if ! curl -fsSL --retry 3 --connect-timeout 15 "$BASE_URL/index.html" -o "$TMP/index.html"; then
  die "Gagal mengunduh index.html dari $BASE_URL"
fi
[ -s "$TMP/index.html" ] || die "index.html hasil unduhan kosong"

grep -q 'assets/index-' "$TMP/index.html" \
  || die "index.html tidak memuat rujukan asset (sumber mungkin bukan hasil build Vite)"

mkdir -p "$TMP/assets"
for f in $(grep -oE 'assets/index-[A-Za-z0-9_-]+\.(js|css)' "$TMP/index.html" | sort -u); do
  log "Unduh $f"
  if ! curl -fsSL --retry 3 --connect-timeout 15 "$BASE_URL/$f" -o "$TMP/$f"; then
    die "Gagal mengunduh $f"
  fi
  [ -s "$TMP/$f" ] || die "File hasil unduhan kosong: $f"
done

# ---------------------------------------------------------------- pasang
# Hanya ganti setelah semua unduhan sukses, supaya situs tidak pernah kosong.
log "Pasang ke $WEB_ROOT"
rm -rf "$WEB_ROOT/assets"
cp -R "$TMP/." "$WEB_ROOT/"

# ---------------------------------------------------------------- periksa
[ -f "$WEB_ROOT/index.html" ] || die "index.html gagal ditulis ke $WEB_ROOT"
grep -q 'assets/index-' "$WEB_ROOT/index.html" || die "index.html di $WEB_ROOT rusak"

for f in $(grep -oE 'assets/index-[A-Za-z0-9_-]+\.(js|css)' "$WEB_ROOT/index.html" | sort -u); do
  [ -s "$WEB_ROOT/$f" ] || die "Asset hilang setelah pemasangan: $f"
  log "  $f  ($(wc -c < "$WEB_ROOT/$f") byte)"
done

log "Selesai — build terbaru sudah terpasang di $WEB_ROOT"
