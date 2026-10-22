import { useState, useEffect } from "react";
import {
  X,
  Terminal as TerminalIcon,
  Palette,
  Cloud,
  Info,
  Check,
  RotateCcw,
  UploadCloud,
  DownloadCloud,
} from "lucide-react";
import type { SettingsData } from "@/core/types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: SettingsData;
  onSaveSettings: (newSettings: SettingsData) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export function SettingsModal({
  open,
  onClose,
  settings,
  onSaveSettings,
  theme,
  toggleTheme,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"terminal" | "appearance" | "cloud" | "about">("terminal");
  const [formData, setFormData] = useState<SettingsData>({
    fontFamily: settings.fontFamily || "Geist Mono, monospace",
    fontSize: settings.fontSize || 14,
    lineHeight: settings.lineHeight || 1.2,
    cursorBlink: settings.cursorBlink !== undefined ? settings.cursorBlink : true,
    cursorStyle: settings.cursorStyle || "block",
    scrollback: settings.scrollback || 5000,
    bellSound: settings.bellSound || false,
    copyOnSelect: settings.copyOnSelect !== undefined ? settings.copyOnSelect : true,
    cloudApiUrl: settings.cloudApiUrl || "http://127.0.0.1:3980/api",
    cloudSyncKey: settings.cloudSyncKey || "",
    cloudAutoSync: settings.cloudAutoSync || false,
  });

  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        fontFamily: settings.fontFamily || "Geist Mono, monospace",
        fontSize: settings.fontSize || 14,
        lineHeight: settings.lineHeight || 1.2,
        cursorBlink: settings.cursorBlink !== undefined ? settings.cursorBlink : true,
        cursorStyle: settings.cursorStyle || "block",
        scrollback: settings.scrollback || 5000,
        bellSound: settings.bellSound || false,
        copyOnSelect: settings.copyOnSelect !== undefined ? settings.copyOnSelect : true,
        cloudApiUrl: settings.cloudApiUrl || "http://127.0.0.1:3980/api",
        cloudSyncKey: settings.cloudSyncKey || "",
        cloudAutoSync: settings.cloudAutoSync || false,
      });
      setSyncStatus(null);
    }
  }, [open, settings]);

  if (!open) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:3980/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).then((r) => r.json());

      if (res.success) {
        onSaveSettings(res.settings);
        onClose();
      } else {
        onSaveSettings(formData);
        onClose();
      }
    } catch {
      onSaveSettings(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushCloud = async () => {
    setSyncStatus("Mengunggah data ke Cloud Vault...");
    try {
      const res = await fetch("http://127.0.0.1:3980/api/sync/push", {
        method: "POST",
      }).then((r) => r.json());
      if (res.success) {
        setSyncStatus("✓ Sinkronisasi Cloud berhasil!");
      } else {
        setSyncStatus(`Gagal: ${res.error || "Gagal sinkronisasi"}`);
      }
    } catch (e: any) {
      setSyncStatus(`Error: ${e.message}`);
    }
  };

  const handlePullCloud = async () => {
    setSyncStatus("Mengunduh data dari Cloud Vault...");
    try {
      const res = await fetch("http://127.0.0.1:3980/api/sync/pull", {
        method: "POST",
      }).then((r) => r.json());
      if (res.success) {
        setSyncStatus("✓ Data berhasil diperbarui dari Cloud!");
      } else {
        setSyncStatus(`Gagal: ${res.error || "Gagal unduh"}`);
      }
    } catch (e: any) {
      setSyncStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TerminalIcon size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                Settings & Preferences
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Kustomisasi terminal, tema antarmuka, dan sinkronisasi Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup (Esc)"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content with Sidebar Tabs */}
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Nav Sidebar */}
          <div className="w-44 border-r border-slate-200 dark:border-white/10 p-3 space-y-1 bg-slate-50/40 dark:bg-black/20 flex-shrink-0">
            <button
              onClick={() => setActiveTab("terminal")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                activeTab === "terminal"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
              type="button"
            >
              <TerminalIcon size={14} />
              <span>Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                activeTab === "appearance"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
              type="button"
            >
              <Palette size={14} />
              <span>Tampilan</span>
            </button>

            <button
              onClick={() => setActiveTab("cloud")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                activeTab === "cloud"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
              type="button"
            >
              <Cloud size={14} />
              <span>Cloud Vault</span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                activeTab === "about"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
              type="button"
            >
              <Info size={14} />
              <span>Tentang</span>
            </button>
          </div>

          {/* Settings Body Panel */}
          <div className="flex-1 p-5 overflow-y-auto no-scrollbar space-y-4">
            {/* Tab: Terminal */}
            {activeTab === "terminal" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Font Family
                  </label>
                  <select
                    value={formData.fontFamily}
                    onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Geist Mono, monospace">Geist Mono (Default Modern)</option>
                    <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                    <option value="'Fira Code', monospace">Fira Code</option>
                    <option value="Consolas, monospace">Consolas (Windows Classic)</option>
                    <option value="'Courier New', monospace">Courier New</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Font Size ({formData.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min="11"
                      max="20"
                      step="1"
                      value={formData.fontSize}
                      onChange={(e) => setFormData({ ...formData, fontSize: Number(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cursor Style
                    </label>
                    <select
                      value={formData.cursorStyle}
                      onChange={(e) => setFormData({ ...formData, cursorStyle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                      <option value="block">Block (█)</option>
                      <option value="underline">Underline (_)</option>
                      <option value="bar">Bar (|)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        Cursor Blink
                      </div>
                      <div className="text-[11px] text-slate-400">Kedipkan kursor terminal saat aktif</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.cursorBlink}
                      onChange={(e) => setFormData({ ...formData, cursorBlink: e.target.checked })}
                      className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        Copy on Select
                      </div>
                      <div className="text-[11px] text-slate-400">Salin teks otomatis ke clipboard saat diseleksi</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.copyOnSelect}
                      onChange={(e) => setFormData({ ...formData, copyOnSelect: e.target.checked })}
                      className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Live Font Preview Box */}
                <div className="pt-2">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Pratinjau Terminal (Live Preview)
                  </div>
                  <div
                    className="p-3 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 overflow-hidden"
                    style={{
                      fontFamily: formData.fontFamily,
                      fontSize: `${formData.fontSize}px`,
                      lineHeight: formData.lineHeight,
                    }}
                  >
                    <div>roby@home-vps:~$ uname -a</div>
                    <div className="text-slate-400">
                      Linux home-vps 6.8.0-45-generic x86_64 GNU/Linux
                    </div>
                    <div className="text-slate-200">
                      Active sessions: 2 • ErTerm High-Performance SSH
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Appearance */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Tema Aplikasi (Theme Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => theme !== "dark" && toggleTheme()}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        theme === "dark"
                          ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900 text-white"
                          : "border-slate-200 dark:border-white/10 bg-slate-800 text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs">🌙 Midnight Dark</span>
                        {theme === "dark" && <Check size={14} className="text-indigo-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Tema gelap kontras tinggi terinspirasi Termius Desktop
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => theme === "dark" && toggleTheme()}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        theme === "light"
                          ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-white text-slate-900"
                          : "border-slate-200 dark:border-white/10 bg-slate-100 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs">☀️ Clean Light</span>
                        {theme === "light" && <Check size={14} className="text-indigo-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Tema terang bersih untuk penggunaan di siang hari
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Cloud Vault */}
            {activeTab === "cloud" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cloud API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={formData.cloudApiUrl}
                    onChange={(e) => setFormData({ ...formData, cloudApiUrl: e.target.value })}
                    placeholder="https://api.erterm.dev/sync"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cloud Secret Sync Key
                  </label>
                  <input
                    type="password"
                    value={formData.cloudSyncKey}
                    onChange={(e) => setFormData({ ...formData, cloudSyncKey: e.target.value })}
                    placeholder="Masukkan token enkripsi Cloud Vault..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handlePushCloud}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors cursor-pointer"
                    type="button"
                  >
                    <UploadCloud size={14} />
                    <span>Push to Cloud</span>
                  </button>

                  <button
                    onClick={handlePullCloud}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-medium transition-colors cursor-pointer"
                    type="button"
                  >
                    <DownloadCloud size={14} />
                    <span>Pull from Cloud</span>
                  </button>
                </div>

                {syncStatus && (
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-mono">
                    {syncStatus}
                  </div>
                )}
              </div>
            )}

            {/* Tab: About */}
            {activeTab === "about" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5">
                  <div className="h-10 w-10 rounded-2xl bg-[#004878] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    ET
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      ErTerm Desktop
                    </div>
                    <div className="text-xs text-slate-400">
                      Version 1.0.4 • High Performance Terminal & SSH Client
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
                    <span>Backend Server Core</span>
                    <span className="font-mono text-emerald-400">127.0.0.1:3980 (Active)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
                    <span>Engine</span>
                    <span className="font-mono text-slate-300">Node / Electron / Vite</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-white/5">
                    <span>Terminal Renderer</span>
                    <span className="font-mono text-slate-300">Xterm.js Canvas + FitAddon</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            onClick={() => {
              setFormData({
                fontFamily: "Geist Mono, monospace",
                fontSize: 14,
                lineHeight: 1.2,
                cursorBlink: true,
                cursorStyle: "block",
                scrollback: 5000,
                bellSound: false,
                copyOnSelect: true,
                cloudApiUrl: "http://127.0.0.1:3980/api",
                cloudSyncKey: "",
                cloudAutoSync: false,
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs transition-colors cursor-pointer"
            type="button"
          >
            <RotateCcw size={13} />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
              type="button"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              type="button"
            >
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
