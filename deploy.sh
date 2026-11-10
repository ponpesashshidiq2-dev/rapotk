#!/usr/bin/env bash
#
# Deploy Raport TK di server lewat git pull + build + salin ke folder web.
#
# Pemakaian:
#   ./deploy.sh                                  # pakai default (WEB_ROOT=$REPO_DIR/public_html)
#   WEB_ROOT="$PWD" ./deploy.sh                  # langsung ke docroot domain
#   WEB_ROOT=/var/www/rapotk ./deploy.sh         # path lain
#   BRANCH=main WEB_ROOT=... ./deploy.sh
#
# Contoh cron (build tiap jam, tanpa prompt):
#   */30 * * * * cd /path/raportk.ponpesashshidiq.or.id && WEB_ROOT="$PWD/public_html" ./deploy.sh >> /tmp/rapotk-deploy.log 2>&1
#
set -euo pipefail

case "$0" in
  */*) _dir="${0%/*}" ;;
  *)   _dir="." ;;
esac
REPO_DIR="${REPO_DIR:-$(cd "$_dir" && pwd)}"
unset _dir
BRANCH="${BRANCH:-main}"
WEB_ROOT="${WEB_ROOT:-$REPO_DIR/public_html}"

# Agar tidak pernah menunggu input username/sandi (penting untuk cron).
export GIT_TERMINAL_PROMPT=0
export GIT_TERMINAL_PAGER=cat

log()  { printf '\033[1;36m[%s]\033[0m %s\n' "$(date '+%H:%M:%S')" "$*"; }
warn() { printf '\033[1;33m[perhatian]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[GAGAL]\033[0m %s\n' "$*" >&2; exit 1; }

show_auth_help() {
  cat >&2 <<'EOF'

Belum ada kredensial GitHub di server ini. Pilih salah satu (sekali saja):

  A. SSH key (disarankan, tanpa username/sandi sama sekali)
       ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -C "server"
       cat ~/.ssh/id_ed25519.pub
     -> salin isinya, lalu GitHub > Settings > SSH and GPG keys > New SSH key
       git remote set-url origin git@github.com:ponpesashshidiq2-dev/rapotk.git
       ./deploy.sh

  B. Personal Access Token (disimpan otomatis)
       git config --global credential.helper store
       git pull
       Username : ponpesashshidiq2-dev
       Password : <TOKEN>   (GitHub > Settings > Developer settings >
                  Personal access tokens > Generate new token, scope: repo)
     -> cukup sekali, berikutnya tidak ditanya lagi.

EOF
}

case "${1:-}" in
  -h|--help)
    cat <<'EOF'
Deploy Raport TK lewat git pull + build + salin ke folder web.

  ./deploy.sh                            default: WEB_ROOT=$REPO_DIR/public_html
  WEB_ROOT="$PWD" ./deploy.sh            langsung ke docroot domain
  WEB_ROOT=/var/www/rapotk ./deploy.sh   path lain
  BRANCH=main WEB_ROOT=... ./deploy.sh

Cron (tiap 30 menit, tanpa prompt):
  */30 * * * * cd /path/repo && WEB_ROOT="$PWD/public_html" ./deploy.sh >> /tmp/rapotk-deploy.log 2>&1
EOF
    exit 0
    ;;
  "")
    ;;
  *)
    die "Opsi tidak dikenal: $1 (gunakan -h untuk bantuan)"
    ;;
esac

cd "$REPO_DIR"
[ -f package.json ] || die "Folder ini bukan proyek Raport TK: $REPO_DIR"
command -v git  >/dev/null 2>&1 || die "git tidak ditemukan di server"
command -v npm  >/dev/null 2>&1 || die "npm tidak ditemukan di server (butuh Node.js)"

# ---------------------------------------------------------------- git pull
log "Ambil kode terbaru (branch $BRANCH)"
if ! err=$(git fetch origin "$BRANCH" 2>&1); then
  printf '%s\n' "$err" >&2
  show_auth_help
  exit 1
fi

if ! git rev-parse --verify --quiet "$BRANCH" >/dev/null; then
  git checkout -b "$BRANCH" --track "origin/$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"
else
  git checkout "$BRANCH" >/dev/null 2>&1 || warn "Gagal checkout $BRANCH, tetap melanjutkan"
fi

if ! out=$(git pull --ff-only origin "$BRANCH" 2>&1); then
  printf '%s\n' "$out" >&2
  warn "Pull berhenti. Jika ada perubahan lokal yang Anda edit sendiri, jalankan:
  git stash && ./deploy.sh && git stash pop"
  exit 1
fi
if [ -n "$out" ]; then
  printf '  %s\n' "$out"
fi

SHA=$(git rev-parse --short HEAD)
log "Commit aktif: $SHA"

# ---------------------------------------------------------------- build
if [ -f package-lock.json ]; then
  log "npm ci"
  npm ci --no-audit --no-fund
else
  log "npm install"
  npm install --no-audit --no-fund
fi

log "Build (npm run build)"
npm run build
[ -d dist ] || die "Folder dist tidak ada setelah build"

# ---------------------------------------------------------------- salin
log "Salin hasil build ke $WEB_ROOT"
mkdir -p "$WEB_ROOT"
rm -rf "$WEB_ROOT/assets"
cp -R "$REPO_DIR/dist/." "$WEB_ROOT/"

if [ ! -f "$WEB_ROOT/index.html" ]; then
  die "index.html tidak ada di $WEB_ROOT"
fi

log "Selesai. commit $SHA tersalin ke $WEB_ROOT"
