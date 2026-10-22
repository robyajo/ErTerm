import type { FolderItem } from "@/core/types";
import { User, ChevronDown, ArrowRightToLine, Trash2, Folder as FolderIcon } from "lucide-react";

interface FolderSheetProps {
  open: boolean;
  onClose: () => void;
  folderForm: Partial<FolderItem>;
  setFolderForm: React.Dispatch<React.SetStateAction<Partial<FolderItem>>>;
  onSave: (folder: FolderItem) => void;
  onDelete?: (folderId: string) => void;
}

export function FolderSheet({
  open,
  onClose,
  folderForm,
  setFolderForm,
  onSave,
  onDelete,
}: FolderSheetProps) {
  if (!open) return null;

  const isEditing = Boolean(folderForm.id);

  const colors = [
    { name: "Indigo", hex: "#6366f1" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Purple", hex: "#a855f7" },
  ];

  const handleSave = () => {
    if (!folderForm.name?.trim()) return;
    const folder: FolderItem = {
      id: folderForm.id || `grp_${Date.now()}`,
      name: folderForm.name.trim(),
      icon: folderForm.icon || "📁",
      color: folderForm.color || "#6366f1",
      parentId: folderForm.parentId || null,
      updatedAt: Date.now(),
      createdAt: folderForm.createdAt || Date.now(),
    };
    onSave(folder);
  };

  return (
    <aside
      className="w-[390px] xl:w-[420px] flex-shrink-0 h-full bg-white dark:bg-[#151828] border-l border-slate-200 dark:border-[#242b43] text-slate-800 dark:text-white flex flex-col shadow-2xl z-20 font-sans select-none transition-colors duration-200"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#21273e] flex items-center justify-between bg-slate-50/70 dark:bg-transparent">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {isEditing ? folderForm.name || "Edit Group" : "New Group"}
        </h3>
        <div className="flex items-center gap-1.5">
          {isEditing && onDelete && (
            <button
              onClick={() => {
                if (folderForm.id) onDelete(folderForm.id);
              }}
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Delete Group"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#20263f] transition-colors cursor-pointer"
            title="Close panel"
          >
            <ArrowRightToLine size={16} />
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs">
        {/* Scope Selector */}
        <div>
          <div className="w-full bg-slate-100 hover:bg-slate-200/70 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-slate-800 dark:text-slate-200 cursor-pointer transition-colors shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <User size={12} />
              </div>
              <span className="font-semibold text-[13px]">Personal</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>

        {/* Group Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Group Name
          </label>
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#1c2237] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-[#1c233a] transition-all shadow-2xs">
            <FolderIcon size={16} className="text-indigo-500 flex-shrink-0" />
            <input
              type="text"
              value={folderForm.name || ""}
              onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Mis: MPP SERVER"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[13px] outline-none"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Color Accent
          </label>
          <div className="flex items-center gap-3">
            {colors.map((c) => (
              <div
                key={c.hex}
                onClick={() => setFolderForm((prev) => ({ ...prev, color: c.hex }))}
                style={{ backgroundColor: c.hex }}
                className={`h-7 w-7 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${
                  folderForm.color === c.hex ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-[#151828] scale-105" : ""
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Icon Preview */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#1c2237] border border-slate-200 dark:border-[#262f4c] rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="h-9 w-9 rounded-xl bg-[#004878] flex items-center justify-center p-2 flex-shrink-0 shadow-xs">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
              <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" fill="#ffffff" />
              <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="#ffffff" strokeWidth="1.8" fill="none" />
              <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" stroke="#ffffff" strokeWidth="1.8" fill="none" />
              <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-[13px]">
              {folderForm.name || "Group Preview"}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Termius Folder Grid Badge</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-[#21273e] bg-slate-50 dark:bg-[#151828] flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-[#1f253a] hover:bg-slate-300 dark:hover:bg-[#283050] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!folderForm.name?.trim()}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          {isEditing ? "Update Group" : "Create Group"}
        </button>
      </div>
    </aside>
  );
}
