import { X } from "lucide-react";
import type { HostItem, FolderItem } from "@/core/types";

interface HostModalProps {
  open: boolean;
  onClose: () => void;
  hostForm: Partial<HostItem>;
  setHostForm: React.Dispatch<React.SetStateAction<Partial<HostItem>>>;
  folders: FolderItem[];
  onSave: (newHost: HostItem) => void;
}

export function HostModal({
  open,
  onClose,
  hostForm,
  setHostForm,
  folders,
  onSave,
}: HostModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#161c2a] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-800 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base">
            {hostForm.id ? "Edit Host" : "Tambah Host Baru"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 mt-4 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Label / Nama Server</label>
            <input
              type="text"
              value={hostForm.label || ""}
              onChange={(e) => setHostForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Mis: FE SUPERAPP AMAN"
              className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Hostname / IP</label>
              <input
                type="text"
                value={hostForm.hostname || ""}
                onChange={(e) => setHostForm((prev) => ({ ...prev, hostname: e.target.value }))}
                placeholder="10.10.1.20"
                className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Port</label>
              <input
                type="number"
                value={hostForm.port || 22}
                onChange={(e) =>
                  setHostForm((prev) => ({
                    ...prev,
                    port: parseInt(e.target.value, 10) || 22,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 mb-1">Username</label>
              <input
                type="text"
                value={hostForm.username || ""}
                onChange={(e) => setHostForm((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="kominfo2"
                className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Distro OS</label>
              <select
                value={hostForm.osType || "ubuntu"}
                onChange={(e) =>
                  setHostForm((prev) => ({
                    ...prev,
                    osType: e.target.value,
                    icon: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="ubuntu">Ubuntu</option>
                <option value="debian">Debian</option>
                <option value="alma">AlmaLinux / RHEL</option>
                <option value="windows">Windows</option>
                <option value="default">Default Server</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Group / Folder</label>
            <select
              value={hostForm.folderId || ""}
              onChange={(e) => {
                const fid = e.target.value || null;
                const folder = folders.find((f) => f.id === fid);
                setHostForm((prev) => ({
                  ...prev,
                  folderId: fid,
                  group: folder ? folder.name : "Default",
                }));
              }}
              className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
            >
              <option value="">(Tanpa Group / Root)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={hostForm.password || ""}
              onChange={(e) => setHostForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Password SSH"
              className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (!hostForm.label || !hostForm.hostname) {
                alert("Label dan hostname wajib diisi");
                return;
              }
              const newHost: HostItem = {
                id: hostForm.id || "h_" + Date.now(),
                label: hostForm.label,
                type: "ssh",
                hostname: hostForm.hostname,
                port: hostForm.port || 22,
                username: hostForm.username || "root",
                password: hostForm.password,
                folderId: hostForm.folderId || null,
                group: hostForm.group || "Default",
                osType: hostForm.osType || "ubuntu",
                icon: hostForm.icon || hostForm.osType || "default",
              };
              onSave(newHost);
            }}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
