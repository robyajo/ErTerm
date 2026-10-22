export function LogsView() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        Session Logs
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Riwayat log terminal dan aktivitas koneksi.
      </p>
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500">
        Belum ada log sesi yang tersimpan. Klik "Save Log" saat sesi terminal sedang aktif.
      </div>
    </div>
  );
}
