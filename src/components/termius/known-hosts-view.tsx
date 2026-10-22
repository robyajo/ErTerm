import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, KeyRound, Clock, Server } from "lucide-react";
import type { KnownHostEntry } from "@/core/types";

export function KnownHostsView() {
  const [knownHosts, setKnownHosts] = useState<KnownHostEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKnownHosts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3980/api/known-hosts");
      if (res.ok) {
        const data = await res.json();
        setKnownHosts(data.knownHosts || []);
      }
    } catch (e) {
      console.warn("Failed to load known hosts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnownHosts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:3980/api/known-hosts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKnownHosts((prev) => prev.filter((k) => k.id !== id));
      }
    } catch (e) {
      console.warn("Failed to delete known host:", e);
    }
  };

  return (
    <div className="p-6 overflow-y-auto max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" />
            <span>Known Hosts & Fingerprints</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kunci sidik jari server SSH yang telah diverifikasi dan dipercaya (Known Hosts Registry).
          </p>
        </div>
        <button
          onClick={loadKnownHosts}
          type="button"
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading known hosts...
        </div>
      ) : knownHosts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 text-center">
          <KeyRound size={28} className="text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Belum ada Host Key yang disimpan
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Saat Anda pertama kali menghubungkan ke server SSH dan menekan tombol "Accept & Connect", kunci sidik jari server akan otomatis disimpan di sini.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#121622] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#161c2a] text-slate-500 dark:text-slate-400 font-mono border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Server Host</th>
                <th className="py-3 px-4 font-semibold">Key Type</th>
                <th className="py-3 px-4 font-semibold">Fingerprint (SHA256)</th>
                <th className="py-3 px-4 font-semibold">Last Connected</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {knownHosts.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                    <div className="flex items-center gap-2">
                      <Server size={13} className="text-blue-500" />
                      <span>{entry.hostname}</span>
                      <span className="text-[10px] text-slate-400">:{entry.port || 22}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {entry.keyType || "ECDSA"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 select-all max-w-[260px] truncate text-[11px]" title={entry.fingerprint}>
                    {entry.fingerprint}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} />
                      <span>{new Date(entry.lastSeen || entry.firstSeen).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      type="button"
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Forget Host Key"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
