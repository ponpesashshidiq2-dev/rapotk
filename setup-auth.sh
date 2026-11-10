#!/usr/bin/env bash
#
# Atur autentikasi Git SEKALI SUPAYA TIDAK MINTA LAGI.
#
# Pemakaian:
#   bash setup-auth.sh ssh      # lewat SSH key (disarankan, sama sekali tanpa sandi)
#   bash setup-auth.sh token    # lewat Personal Access Token (disimpan sekali)
#   bash setup-auth.sh test     # cek koneksi setelah kunci ditambahkan
#   bash setup-auth.sh help
#
set -euo pipefail

REPO_SSH="git@github.com:ponpesashshidiq2-dev/rapotk.git"
REPO_HTTPS="https://github.com/ponpesashshidiq2-dev/rapotk.git"
KEY="${HOME}/.ssh/id_ed25519"

info() { printf '\033[1;36m%s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m%s\033[0m\n' "$*"; }
err()  { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }

mode="${1:-ssh}"

set_remote() {
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git remote set-url origin "$1"
    ok "Remote 'origin' diarahkan ke: $1"
  else
    info "Belum berada di dalam repo — remote akan disetel saat clone/pull berikutnya."
  fi
}

case "$mode" in
  -h|help)
    sed -n '3,9p' "$0" | sed 's/^# \{0,1\}//'
    ;;

  ssh)
    command -v ssh-keygen >/dev/null 2>&1 || { err "ssh-keygen tidak ditemukan di server"; exit 1; }
    mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"

    if [ ! -f "$KEY" ]; then
      ssh-keygen -t ed25519 -N "" -C "$(hostname 2>/dev/null || echo server)-rapotk" -f "$KEY" >/dev/null
      ok "Kunci SSH baru dibuat: $KEY"
    else
      info "Kunci SSH sudah ada: $KEY"
    fi
    chmod 600 "$KEY" 2>/dev/null || true
    chmod 644 "$KEY.pub" 2>/dev/null || true

    echo
    info "=== PUBLIC KEY — salin seluruh baris di bawah ini ==="
    cat "$KEY.pub"
    info "==================================================="
    echo
    info "Langkah Anda (sekali saja):"
    info "  1. Buka  https://github.com/settings/ssh/new"
    info "  2. Title bebas (mis. server-modena), paste kunci di atas, klik Add SSH key"
    info "  3. Jalankan lagi:  bash setup-auth.sh test"
    echo
    set_remote "$REPO_SSH"
    ;;

  token)
    git config --global credential.helper store
    ok "credential.helper = store (tersimpan di ~/.git-credentials)"
    set_remote "$REPO_HTTPS"
    echo
    info "Jalankan sekali saja:  git pull"
    info "  Username : ponpesashshidiq2-dev"
    info "  Password : <TOKEN>  (bukan sandi akun GitHub)"
    info "Buat token : https://github.com/settings/tokens/new  (centang scope 'repo')"
    info "Setelah itu git pull/push tidak pernah bertanya lagi."
    ;;

  test)
    info "Menguji koneksi SSH ke GitHub..."
    if out=$(ssh -o StrictHostKeyChecking=accept-new -o BatchMode=yes -T git@github.com 2>&1); then
      printf '%s\n' "$out"
    else
      printf '%s\n' "$out"
    fi
    case "$out" in
      *"Hi "*)
        echo
        ok "SSH OK — git pull/push tidak akan minta sandi lagi."
        ;;
      *)
        echo
        err "GitHub belum mengenali kunci ini."
        err "Pastikan public key di atas sudah ditambahkan di:"
        err "  https://github.com/settings/ssh/new"
        exit 1
        ;;
    esac
    ;;

  *)
    err "Opsi tidak dikenal: $mode"
    err "Gunakan: bash setup-auth.sh help"
    exit 1
    ;;
esac
