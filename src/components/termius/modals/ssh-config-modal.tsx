import { useState } from "react";

interface SshConfigModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export function SshConfigModal({
  open,
  onClose,
  onImportSuccess,
}: SshConfigModalProps) {
  const [sshConfigPath, setSshConfigPath] = useState("");
  const [sshConfigResult, setSshConfigResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:3980/api/hosts/import-ssh-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPath: sshConfigPath || undefined }),
      }).then((r) => r.json());

      if (res.success) {
        setSshConfigResult(`Berhasil mengimpor ${res.count || 0} host.`);
        onImportSuccess();
      } else {
        setSshConfigResult("Gagal: " + (res.error || "Gagal membaca berkas"));
      }
    } catch (e) {
      setSshConfigResult("Error: " + e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#161c2a] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-800 dark:text-white">
        <h3 className="font-bold text-base mb-1">Import ~/.ssh/config</h3>
        <p className="text-xs text-slate-500 mb-3">Impor server langsung dari konfigurasi SSH lokal.</p>
        <div className="space-y-3 text-xs">
          <input
            type="text"
            value={sshConfigPath}
            onChange={(e) => setSshConfigPath(e.target.value)}
            placeholder="Path opsional (kosongkan untuk ~/.ssh/config default)"
            className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none"
          />
          {sshConfigResult && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
              {sshConfigResult}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
          >
            Tutup
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
          >
            {isLoading ? "Mengimpor..." : "Mulai Impor"}
          </button>
        </div>
      </div>
    </div>
  );
}
