import { useState } from "react";
import { Plus, Copy, Trash2, Terminal, Check, Tag } from "lucide-react";
import type { SnippetItem } from "@/core/types";

interface SnippetsViewProps {
  snippets: SnippetItem[];
  onNewSnippet: (snippet: Partial<SnippetItem>) => void;
  onDeleteSnippet?: (id: string) => void;
}

export function SnippetsView({ snippets, onNewSnippet, onDeleteSnippet }: SnippetsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [command, setCommand] = useState("");
  const [category, setCategory] = useState("System");
  const [description, setDescription] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !command.trim()) return;
    onNewSnippet({
      title: title.trim(),
      command: command.trim(),
      category: category.trim() || "General",
      description: description.trim() || undefined,
      tags: [category.trim().toLowerCase()],
    });
    setTitle("");
    setCommand("");
    setDescription("");
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Snippets Library</h2>
          <p className="text-xs text-slate-500">
            Perintah cepat & skrip otomatis yang tersinkronisasi ke master registry backend.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors cursor-pointer shadow-xs"
          type="button"
        >
          <Plus size={14} />
          <span>New Snippet</span>
        </button>
      </div>

      {snippets.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Terminal size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada snippet perintah.</p>
          <p className="text-xs mt-1 text-slate-500">Klik "New Snippet" untuk menyimpan perintah favorit Anda.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {snippets.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-indigo-500/50 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{s.title}</h3>
                    {s.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.category && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Tag size={10} />
                        {s.category}
                      </span>
                    )}
                    {onDeleteSnippet && (
                      <button
                        onClick={() => onDeleteSnippet(s.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete snippet"
                        type="button"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative mt-2.5">
                  <pre className="text-xs font-mono text-indigo-400 bg-slate-100 dark:bg-slate-900/80 p-2.5 pr-9 rounded-xl overflow-x-auto border border-slate-200 dark:border-slate-800/80">
                    {s.command}
                  </pre>
                  <button
                    onClick={() => handleCopy(s.id, s.command)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Copy command"
                    type="button"
                  >
                    {copiedId === s.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Snippet Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal size={16} className="text-indigo-500" />
                Tambah Snippet Baru
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-md"
                type="button"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Judul Snippet
                </label>
                <input
                  type="text"
                  placeholder="e.g., Update & Upgrade Docker System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder="e.g., Docker, DevOps, Database, System"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Membersihkan container yang berhenti dan prune volume tak terpakai"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Perintah CLI (Command)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., docker system prune -af --volumes"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-indigo-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-xs"
                >
                  Simpan Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
