import { Plus, Copy } from "lucide-react";
import type { SshKeyItem } from "@/core/types";

interface KeychainViewProps {
  keys: SshKeyItem[];
  onGenerateKey: () => void;
}

export function KeychainView({ keys, onGenerateKey }: KeychainViewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Keychain & SSH Keys</h2>
          <p className="text-xs text-slate-500">
            Kelola kunci kriptografis Ed25519 dan RSA untuk otentikasi SSH tanpa password.
          </p>
        </div>
        <button
          onClick={onGenerateKey}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
        >
          <Plus size={14} />
          <span>Generate Key</span>
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map((k) => (
          <div
            key={k.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{k.label}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                {k.keyType}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(k.publicKey || "");
                  alert("Kunci publik berhasil disalin ke clipboard!");
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Copy size={12} />
                <span>Copy Public Key</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
