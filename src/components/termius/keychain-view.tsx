import { useState } from "react";
import { Plus, Copy, Trash2, Key, Check } from "lucide-react";
import type { SshKeyItem } from "@/core/types";

interface KeychainViewProps {
  keys: SshKeyItem[];
  onGenerateKey: (label: string, keyType: "ed25519" | "rsa") => void;
  onDeleteKey?: (id: string) => void;
}

export function KeychainView({ keys, onGenerateKey, onDeleteKey }: KeychainViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [keyType, setKeyType] = useState<"ed25519" | "rsa">("ed25519");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onGenerateKey(label.trim(), keyType);
    setLabel("");
    setModalOpen(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Keychain & SSH Keys</h2>
          <p className="text-xs text-slate-500">
            Kelola pasangan kunci kriptografis Ed25519 dan RSA untuk otentikasi SSH otomatis tersinkron ke backend.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors cursor-pointer shadow-xs"
          type="button"
        >
          <Plus size={14} />
          <span>Generate Key</span>
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Key size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada SSH Key yang tersimpan.</p>
          <p className="text-xs mt-1 text-slate-500">Klik "Generate Key" untuk membuat kunci kriptografi baru.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {keys.map((k) => (
            <div
              key={k.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{k.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    {k.keyType}
                  </span>
                </div>
                {k.fingerprint && (
                  <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                    SHA256:{k.fingerprint}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => handleCopy(k.id, k.publicKey || "")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                  type="button"
                >
                  {copiedId === k.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedId === k.id ? "Disalin!" : "Salin Public Key"}</span>
                </button>

                {onDeleteKey && (
                  <button
                    onClick={() => onDeleteKey(k.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus Kunci"
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

      {/* Generate Key Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161a26] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 text-slate-800 dark:text-slate-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Generate New SSH Key Pair</h3>
            <p className="text-xs text-slate-500 mb-4">Buat pasangan kunci publik & privat langsung di backend ErTerm.</p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Label Kunci</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. My Ubuntu VPS Key"
                  required
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Algoritma / Tipe Kunci</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyType("ed25519")}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      keyType === "ed25519"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    Ed25519 (Direkomendasikan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyType("rsa")}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      keyType === "rsa"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    RSA (2048-bit Legacy)
                  </button>
                </div>
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
                  Buat Kunci Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
