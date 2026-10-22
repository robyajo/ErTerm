# Changelog — ErTerm

Semua perubahan penting pada proyek **ErTerm** didokumentasikan di berkas ini.
Format ini berbasis pada [Keep a Changelog](https://keepachangelog.com/id/1.1.0/),
dan proyek ini mematuhi [Semantic Versioning](https://semver.org/lang/id/).

## [1.0.4] - 2026-10-22

### Added
- **Desain Antarmuka Termius 1:1 & Dukungan Penuh Mode Terang (Light Mode) & Mode Gelap (Dark Mode)**: Mendukung peralihan tema instan via tombol di bilah atas, latar belakang adaptif (soft grey di Light Mode, midnight navy di Dark Mode), serta kartu putih bersudut membulat halus (`rounded-2xl`).
- **Bilah Judul Terpadu Khas macOS**: Mengintegrasikan tombol profil awan (*Vaults*), tab terminal & SFTP langsung di bilah atas (*top bar tabs*), tombol tambah tab (`+`), toggle tema, dan lonceng notifikasi sejajar dengan *traffic lights* macOS.
- **Bilah Pencarian Cerdas (Omni-Search Bar)**: Kotak pencarian besar di atas dengan tombol `Connect` terintegrasi untuk koneksi instan ke server berdasarkan label atau format `user@hostname:port`.
- **Pengelompokan Visual *Groups* & Grid Kartu *Hosts* 3-Kolom**: Tampilan seksi *Groups* dengan ikon map biru dan kartu server dengan lencana distro OS asli (Ubuntu oranye dan Rak Server biru).
- **Sidebar Navigasi Termius**: Menu navigasi presisi mencakup `Hosts`, `Keychain`, `Port Forwarding`, `Snippets`, `Known Hosts`, dan `Logs`.

### Fixed
- **Keandalan Inisialisasi Koneksi Sesi Terminal**: Memperbaiki pencarian host pada WebSocket handshake (`type: "init"`) dengan menyertakan objek host cadangan dan seeding data otomatis pada saat pertama kali inisialisasi agar tidak terjadi galat `Host not found`.
- **Penyelarasan Bilah Judul macOS & Windows**: Penataan presisi posisi tombol kontrol jendela bawaan macOS (*traffic lights*) dengan padding adaptif, pencegahan kebocoran tombol kontrol Windows ke macOS, serta eliminasi duplikasi logo pada navigasi samping agar batas antarmuka sejajar rapi.
- **Pemuatan Modul Native Desktop**: Mengonfigurasi eksternalisasi modul native runtime (`ssh2`, `cpu-features`, `node-pty`) dan auto-unpack biner native dari arsip ASAR untuk mencegah kegagalan kompilasi bundler saat membaca berkas biner.

## [1.0.3] - 2026-10-22
- **Migrasi Arsitektur Penuh ke React 19 + Vite + Tailwind CSS + shadcn/ui**: Membangun antarmuka terminal desktop modern dengan komponen UI terlengkap dari shadcn/ui, TanStack Router, dan tema gelap presisi.
- **Integrasi Mesin Inti Terminal (Core Engine)**: Menanamkan mesin terminal backend teruji (port 3980) yang mencakup WebSocket streaming, PTY lokal (Windows ConPTY / macOS zsh), dan klien SSH2.
- **Folder Grouping & Interactive Drag-and-Drop**: Pengelompokan server dalam folder kustom dengan warna dan ikon, serta interaksi seret-dan-lepas (*drag-and-drop*) langsung ke dalam folder atau ke area root.
- **Per-Account Scoped Registry (`registry-<accountId>.json`)**: Penyimpanan lokal terisolasi per akun pengguna yang mengabadikan seluruh struktur folder, host, tunnel, keys, dan settings.
- **Sinkronisasi Multi-Device Cloud Database**: Integrasi penuh ke backend Neon PostgreSQL untuk memastikan seluruh tata letak dan konfigurasi tampil 100% identik di perangkat lain saat login.
- **Real Socket Port Forwarding & SOCKS5 Proxy**: Penerusan port aktif lokal, remote, dan dynamic SOCKS5 (RFC 1928) dengan auto-boot listener dan status diagnostik langsung.
- **SSH ProxyJump / Bastion Gateway Chaining**: Akses server privat melalui perantara jump host dengan socket chaining bawaan.
- **Dual-Pane SFTP Manager & In-App Text Editor**: Eksplorasi berkas lokal ⇄ remote dengan editor kode internal dan shortcut simpan instan `Ctrl+S`.
- **Multi-Terminal Broadcast Input**: Kemampuan pengetikan serentak ke seluruh tab terminal yang sedang terbuka.
- **1-Click Import ~/.ssh/config**: Membaca dan mengimpor seluruh host, port, user, key, dan aturan ProxyJump dari konfigurasi OpenSSH lokal.
- **Cryptographic SSH Key Vault**: Pembuatan pasangan kunci Ed25519 & RSA 2048-bit instan dengan penyalinan kunci publik 1-klik.
- **Top-Right Version Badge & Update Notification**: Penampil versi `v1.0.3` dan lencana notifikasi pembaruan di pojok kanan atas.
