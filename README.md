# ErTerm — Modern Cross-Platform SSH & Terminal Client

Aplikasi SSH Client dan Terminal Emulator modern berbasis **React 19**, **Vite**, **Electron**, **Tailwind CSS**, dan **shadcn/ui**, mengintegrasikan mesin terminal tingkat lanjut dengan paritas fitur khas **Termius** dan sinkronisasi multi-perangkat ke cloud database **Neon PostgreSQL**.

---

## ⚡ Fitur Utama

1. **Saved Hosts & Folder Grouping dengan Drag-and-Drop**:
   - Organisasi server SSH dan shell lokal ke dalam folder kustom berikon dan berwarna.
   - Interaksi seret dan lepas (*drag and drop*) kartu server langsung ke dalam folder atau ke area unassigned.
   - Pilihan ProxyJump (Bastion host) dan pengait kunci SSH Key Vault.
2. **Terminal Workspace Multi-Tab**:
   - Tab terminal simultan dengan mesin xterm.js (FitAddon, WebLinksAddon).
   - Pengetikan serentak (*Broadcast Input*) ke seluruh tab aktif.
   - Perekaman riwayat terminal (*Save Session Log* ke file `.log`).
   - Bilah perintah cepat (*Quick Snippets*) dengan dukungan template variabel `{{variable}}`.
3. **Dual-Pane SFTP Manager**:
   - Eksplorasi dua panel: Komputer Lokal ⇄ Server Remote.
   - Editor teks/kode terintegrasi (*In-App File Editor*) dengan penyimpanan instan `Ctrl+S` / `Cmd+S`.
4. **Port Forwarding / SSH Tunnels**:
   - Runtime listener socket TCP nyata untuk Local Forwarding, Remote Reverse Forwarding, dan Dynamic SOCKS5 Proxy (RFC 1928).
   - Pemantauan status langsung (*Listening*, *Error*, *Inactive*) dan auto-boot saat aplikasi start.
5. **Cryptographic SSH Key Vault**:
   - Pembuat pasangan kunci Ed25519 & RSA 2048-bit instan dan tombol salin kunci publik 1-klik.
6. **Per-Account Registry & Multi-Device Cloud Sync**:
   - Seluruh status pengguna disimpan dalam `registry-<accountId>.json` di disk lokal.
   - Sinkronisasi instan ke database cloud memastikan saat login di komputer lain seluruh folder dan host tampil identik.
7. **1-Click Import ~/.ssh/config**:
   - Deteksi otomatis file konfigurasi OpenSSH lokal.

---

## 🛠️ Stack Teknologi

- **Runtime & Desktop**: Electron + Node.js (Express + WebSocket PTY server di port `3980`)
- **Frontend**: React 19, Vite, TanStack Router, Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Terminal Engine**: `@xterm/xterm`, `@xterm/addon-fit`, `node-pty`, `ssh2`
- **Testing**: Vitest, Playwright

---

## 🚀 Perintah Operasional

```bash
# Instalasi dependensi
npm install

# Menjalankan aplikasi dalam mode pengembangan
npm start

# Menjalankan pengujian unit
npm test

# Memaketkan aplikasi ke paket desktop
npm run package
```
