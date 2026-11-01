# Laporan Analisis Arsitektur ErTerm

**Tanggal:** Sun Nov 01 2026  
**Project:** ErTerm — Modern Cross-Platform SSH & Terminal Client  
**Teknologi:** JavaScript/Node.js, TypeScript, React, Electron, Express, Tailwind CSS

---

## 1. Evaluasi Arsitektur & Pola Desain

### 1.1 Overall Structure Assessment
ErTerm menggunakan arsitektur **Electron SPA (Single Page Application)** dengan pembagian yang jelih antara proses utama (main process) dan renderer process. Struktur folder menunjukkan pola desain yang konsisten:

**Layer Utama:**
- **Main Process** (`src/main.ts`, `src/core/server.ts`): Mengelola window Electron, lifecycle, dan server HTTP/WS
- **IPC Layer** (`src/ipc/`): Or MCP (Message Port Communication) menggunakan `@orpc/server` untuk RPC antar main/main-thread
- **Renderer Process** (`src/`): Aplikasi React dengan TanStack Router, di-manage oleh Vite
- **Data Layer** (`src/core/server.ts`): Express server bersemat di dalam Electron main process, mengelola state data lokal melalui JSON files di `DATA_DIR`
- **UI Layer** (`src/components/`, `src/layouts/`): shadcn/ui primitives dengan Tailwind v4 styling

**Struktur Folder kunci:**
```
src/
├── actions/          # Action creators/handlers untuk fitur
├── components/       # UI komponen (termidus/ui, termius, dll)
├── context/          # React context (tab-context.tsx)
├── core/             # Core logika (server.ts, types.ts) - "brain" aplikasi
├── hooks/            # Custom React hooks
├── ipc/              # IPC router dan handlers
├── lib/              # Library utilities (highlighter, utils)
├── layouts/          # Struktur tata letak (base-layout.tsx)
├── routes/           # TanTanStack Router route definitions
├── styles/           # Global CSS + Tailwind config
├── utils/            # Utility functions (path.ts)
└── types/            # TypeScript interfaces
```

### 1.2 Modularitas & Separation of Concerns

**Strengths:**
- **Clear IPC boundary**: Fungsi-fungsi SSH, SFTP, dan terminal di-separate ke `src/core/server.ts` dengan API endpoints yang jelas
- **Orpc integration**: Penggunaan `@orpc/server` untuk typed IPC mengurangi runtime errors
- **Data persistence abstraction**: Fungsi `getWritableDataDir()`, `readData()`, `writeData()` mengabstraksi perbedaan ASAR vs development environment
- **Registry pattern**: `AccountRegistry` mengelola workspace state secara global dengan `syncActiveRegistry()`

**Weaknesses:**
- **Tight coupling between server and data layer**: `src/core/server.ts` bertanggung jawab atas Express config, SSH management, Data I/O, dan API routes sekaligus (Single Responsibility Principle violated)
- **Imperative file I/O**: Banyak `fs.readFileSync`/`writeFileSync` langsung di server code tanpa layer abstraksi
- **Router-server duality**: TanStack Router digunakan di renderer, namun Express routes ditanam langsung di main process server

### 1.3 Folder Structure Adequacy

| Category | Evaluation |
|----------|------------|
| `src/core/` | Baik - mengandung types dan server logic |
| `src/ipc/` | Baik - terorganisasi per domain (app, shell, theme, window) |
| `src/components/` | Baik - mengikuti pola shadcn/ui |
| `src/lib/` | Cukup - hanya 2 file (highlighter, utils), bisa diperluas |
| `src/actions/` | Baik - berisi action handlers |
| `src/context/` | Baik - tab-context untuk state management |
| `src/hooks/` | Baik - custom hooks terintegrasi |

---

## 2. Potensi Risiko & Area Optimasi

### 2.1 Performans

| Risiko | Dampak | Peluang |
|--------|--------|---------|
| **WebSocket polling bottleneck** | Server WS (`wss`) di main process menangani semua koneksi terminal. Jumlah koneksi sekaligus terbatas oleh sumber daya process Node.js. | Tingkatkan dengan menskalakan ke worker threads atau separate processes untuk terminal heavy users |
| **Synchronous fs operations** | `readData()`/`writeData()` menggunakan `fs.readFileSync`/`writeFileSync` yang blocking. Dalam scenario traffic tinggi, bisa memblokir event loop. | Pindahkan ke `fs.promises` dengan caching layer, atau gunakan `lowdb` / `jsonfile` dengan watch mechanism |
| **ASAR read-only limitations** | Sudah di-resolution dengan `getWritableDataDir()`, namun copy seeds pada startup menambah waktu boot. | Implementasikan lazy loading untuk seed files, atau gunakan `asar` selectively unpack untuk file yang sering diakses |
| **Large file transfer over WebSocket** | SFTP transfer menggunakan native streams, namun init/control melalui JSON over WebSocket bisa lambat untuk metadata intensif. | Gunakan binary buffer over WebSocket atau langsung ke SFTP data channel untuk transfer besar |

### 2.2 Keamanan

| Risiko | Dampak | Peluang |
|--------|--------|---------|
| **CORS wildcard** | `res.header("Access-Control-Allow-Origin", "*")` di seluruh API endpoints. Kombinasi dengan credensial SSH bisa berbahaya jika diexploitasi. | Ganti dengan domain-specific origin, atau implementasi token-based auth di API level |
| **Private key exposure in memory** | Private key disimpan sebagai string di `hosts.json`/`keys.json`. Jika process di-comromise, semua key tersalur. | Implementasikan encrypted storage di level OS (Keyring/Credential Manager), atau zero-out keys setelah digunakan |
| **SSH Fingerprint Verification** | Memverifikasi fingerprint melalui UI prompt, tapi tidak ada mekanisme pemeriksaan otomatis terhadap key yang berubah drastis. | Tambahkan warning otomatis saat fingerprint berubah, dan fitur "trusted host management" |
| **Expression CRLF vulnerability** | Input dari SSH channel dinamis parsing tanpa sanitasi lengkap di `parseSshConfig`. | Tambahkan validasi input rigor dan escaped parsing |
| **No rate limiting** | Express middleware tidak memiliki rate limiting. Vulnerable terhadap DOS pada endpoint API. | Tambahkan `express-rate-limit` atau middleware terfokus per endpoint |

### 2.3 Dependencies & Maintenance

| Area | Evaluasi |
|------|----------|
| **Electron 44.4.3** | Versi yang cukup baru (November 2026), tapi perlu monitoring untuk electron-updater compatibility |
| **Orpc library** | `@orpc/server` ^1.15.3 - library yang aktif, tapi pastikan versi sesuai dengan `@orpc/client` di renderer |
| **Express 5.3.0** | Major version upgrade dari Express 4.x. Pastikan tidak ada breaking changes yang belum ditangani |
| **Tailwind CSS v4** | Versi baru dengan konfigurasi yang berbeda dari v3. Pastikan build pipeline kompatibel |
| **Node-pty & ssh2** | Native modules yang butuh `AutoUnpackNativesPlugin` di forge.config.ts - sudah dihandle dengan benar |
| **Dependency count**: 70+ packages - monitor untuk vulnerability dengan `npm audit` rutin |

### 2.4 Area Optimasi Prioritas

1. **Implementasikan response caching untuk API read-only** (hosts, folders, settings) - mengurangi I/O disk operations
2. **Tahapkan rate limiting di Express** - mitigasi DOS risk
3. **Enkripsi kredensial di level OS** - mitigasi data exposure jika asar ter-ekstrak
4. **Lazy load seed data** - mempercepat startup time
5. **Type-safe IPC validation** - pastikan semua schema input/output ter-check di compile time

---

## 3. Rekomendasi Standar Koding Khusus untuk AI Agent

Berikut 5 pedoman spesifik agar AI coding konsisten dengan struktur proyek ErTerm:

### 3.1 Gunakan Pattern Data Abstraction untuk File I/O

**Prinsip:** Selalu gunakan fungsi `readData()`/`writeData()` dari `src/core/server.ts` daripada langsung menggunakan `fs` module.

**Alasan:** Fungsi ini sudah menangani ASAR vs development environment resolution, default values, dan error handling konsisten.

**Contoh implementasi yang benar:**
```typescript
// Baik: Menggunakan abstraksi yang sudah ada
import { readData, writeData } from '@/core/server';

const hosts = readData<HostItem[]>('hosts.json', []);

// Buruk: Direct fs operations tanpa ASAR awareness
const { readFileSync, writeFileSync } = await import('fs');
const content = readFileSync(path.join(__dirname, 'hosts.json'), 'utf-8');
```

### 3.2 Terapkan Validasi Schema di Level IPC Handler

**Prinsip:** Setiap handler IPC harus menggunakan schema validasi dari `@orpc/server` sebelum memproses input.

**Alasan:** Mencegah bad input menjangkau logika bisnis dan memberikan error message yang jelas ke frontend.

**Contoh:**
```typescript
// Baik: Dengan schema validation
import { z } from 'zod';
import { os } from '@orpc/server';

const connectSchema = z.object({
  hostname: z.string().min(1),
  port: z.number().optional().default(22),
  username: z.string().min(1),
});

// Di handler
export const connectHandler = os.input(connectSchema).handler(({ input }) => {
  // input sudah ter-validasi tipe dan required fields
  // proceed with connection logic
});
```

### 3.3 Pertahankan Konsistensi Path Resolution

**Prinsip:** Selalu gunakan `getBasePath()` dari `src/utils/path.ts` untuk menentukan path absolut, dan `@/prefix` untuk impor dalam src.

**Alasan:** Mengatasi perbedaan antara development (`__dirname`) dan production (asar/package), serta menjaga konsistensi impor modular.

**Contoh:**
```typescript
// Baik: Menggunakan getBasePath
import { getBasePath } from '@/utils/path';
const base = getBasePath();
const configPath = path.join(base, 'data', 'config.json');

// Baik: Impor dengan @ alias
import Component from '@/components/ui/button';
```

### 3.4 Gunakan Type-Safe Patterns untuk SSH Config

**Prinsil:** Jika membuat fungsi build SSH config, pastikan type sesuai dengan interface yang sudah didefinisikan di `src/core/types.ts`.

**Alasan:** Mencegah runtime errors akibat property yang tidak defined, dan memudahkan refactoring.

**Contoh:**
```typescript
// Baik: Menggunakan type yang sudah ada
import type { HostItem } from '@/core/types';

function buildSshConfig(host: HostItem): Record<string, unknown> {
  return {
    host: host.hostname,
    port: host.port || 22,
    username: host.username,
    // ... pastikan semua property sesuai tipe
  };
}
```

### 3.5 Implementasikan Error Handling Standar di API Routes

**Prinsip:** Semua API routes harus mengembalikan objek `{ success: boolean, error?: string }` atau `{ success: true, data: T }`, dengan error message yang konsisten.

**Alasan:** Frontend team (termasuk AI agent) bisa menangani error dengan pola yang konsisten tanpa perlu memahami logika internal setiap endpoint.

**Contoh:**
```typescript
// Baik: Error handling standar
app.post('/api/hosts', (req, res) => {
  try {
    // ... processing logic
    res.json({ success: true, host: newHost });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga';
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// Buruk: Tidak ada error handling atau response yang inconsistens
app.post('/api/hosts', (req, res) => {
  // Jika error, bisa menyebabkan 500 error tanpa JSON body yang konsisten
  res.json({ success: true }); // Apa jika gagal?
})