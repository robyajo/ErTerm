import type { FolderItem } from "@/core/types";

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
  folderForm: Partial<FolderItem>;
  setFolderForm: React.Dispatch<React.SetStateAction<Partial<FolderItem>>>;
  onSave: (folder: FolderItem) => void;
}

export function FolderModal({
  open,
  onClose,
  folderForm,
  setFolderForm,
  onSave,
}: FolderModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#161c2a] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-white">
        <h3 className="font-bold text-base mb-3">Tambah Group Baru</h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Nama Group</label>
            <input
              type="text"
              value={folderForm.name || ""}
              onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Mis: KOMINFO VPS"
              className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (!folderForm.name) return;
              const newFolder: FolderItem = {
                id: "grp_" + Date.now(),
                name: folderForm.name,
                icon: "📁",
                color: "#3b82f6",
              };
              onSave(newFolder);
            }}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
