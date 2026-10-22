import { useState } from "react";
import { Plus, Trash2, Power, Network } from "lucide-react";
import type { TunnelItem } from "@/core/types";

interface TunnelsViewProps {
  tunnels: TunnelItem[];
  onNewTunnel: (tunnel: Partial<TunnelItem>) => void;
  onToggleTunnel?: (id: string) => void;
  onDeleteTunnel?: (id: string) => void;
}

export function TunnelsView({
  tunnels,
  onNewTunnel,
  onToggleTunnel,
  onDeleteTunnel,
}: TunnelsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    label: "",
    tunnelType: "local" as "local" | "remote" | "socks5",
    localPort: 8080,
    remoteHost: "127.0.0.1",
    remotePort: 80,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    onNewTunnel({
      label: form.label.trim(),
      tunnelType: form.tunnelType,
      localPort: Number(form.localPort),
      remoteHost: form.remoteHost.trim() || "127.0.0.1",
      remotePort: Number(form.remotePort),
      enabled: false,
    });
    setForm({
      label: "",
      tunnelType: "local",
      localPort: 8080,
      remoteHost: "127.0.0.1",
      remotePort: 80,
    });
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Port Forwarding & SSH Tunnels</h2>
          <p className="text-xs text-slate-500">
            Pengalihan port lokal, remote, dan dynamic SOCKS5 proxy otomatis tersinkron ke backend.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors cursor-pointer shadow-xs"
          type="button"
        >
          <Plus size={14} />
          <span>New Tunnel</span>
        </button>
      </div>

      {tunnels.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Network size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada port forwarding tunnel yang terdaftar.</p>
          <p className="text-xs mt-1 text-slate-500">Klik "New Tunnel" untuk membuat konfigurasi tunnel baru.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {tunnels.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
            >
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{t.label}</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  {t.tunnelType.toUpperCase()} : {t.localPort} ➔ {t.remoteHost}:{t.remotePort}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onToggleTunnel && (
                  <button
                    onClick={() => onToggleTunnel(t.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono cursor-pointer transition-colors ${
                      t.enabled
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                    type="button"
                  >
                    <Power size={11} />
                    <span>{t.enabled ? "Active" : "Disabled"}</span>
                  </button>
                )}

                {onDeleteTunnel && (
                  <button
                    onClick={() => onDeleteTunnel(t.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus Tunnel"
                    type="button"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Tunnel Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161a26] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 text-slate-800 dark:text-slate-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Add SSH Port Tunnel</h3>
            <p className="text-xs text-slate-500 mb-4">Konfigurasi port forwarding tersinkronisasi langsung ke registry.</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tunnel Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Postgres DB Forwarding"
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tipe Tunnel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["local", "remote", "socks5"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, tunnelType: type })}
                      className={`py-1.5 rounded-xl border text-xs font-medium uppercase cursor-pointer transition-colors ${
                        form.tunnelType === type
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Local Port</label>
                  <input
                    type="number"
                    value={form.localPort}
                    onChange={(e) => setForm({ ...form, localPort: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Remote Port</label>
                  <input
                    type="number"
                    value={form.remotePort}
                    onChange={(e) => setForm({ ...form, remotePort: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Remote Host Address</label>
                <input
                  type="text"
                  value={form.remoteHost}
                  onChange={(e) => setForm({ ...form, remoteHost: e.target.value })}
                  placeholder="127.0.0.1 or domain"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Simpan Tunnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
