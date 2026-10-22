import type { SnippetItem } from "@/core/types";

interface SnippetsViewProps {
  snippets: SnippetItem[];
}

export function SnippetsView({ snippets }: SnippetsViewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Snippets Library</h2>
          <p className="text-xs text-slate-500">Perintah cepat dengan template variabel otomatis.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {snippets.map((s) => (
          <div
            key={s.id}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="font-bold text-sm text-slate-900 dark:text-white">{s.title}</div>
            <code className="text-xs font-mono text-indigo-500 block mt-1 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg">
              {s.command}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
