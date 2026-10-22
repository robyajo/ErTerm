import type { HostItem, LocalFileEntry } from "@/core/types";

interface SftpViewProps {
  hosts: HostItem[];
  sftpSelectedHost: string;
  setSftpSelectedHost: (id: string) => void;
  connectSftp: (hostId: string) => void;
  sftpSessionId: string | null;
  sftpCurrentPath: string;
  remoteFiles: Array<{ name: string; isDirectory: boolean; size: number; permissions?: string }>;
  loadRemoteFiles: (sessionId: string, path: string) => void;
  localPath: string;
  localFiles: LocalFileEntry[];
  loadLocalFiles: (dirPath?: string) => void;
  selectedLocalFile: string | null;
  setSelectedLocalFile: (path: string | null) => void;
  selectedRemoteFile: { path: string; isDirectory: boolean } | null;
  setSelectedRemoteFile: (file: { path: string; isDirectory: boolean } | null) => void;
}

export function SftpView({
  hosts,
  sftpSelectedHost,
  setSftpSelectedHost,
  connectSftp,
  sftpSessionId,
  sftpCurrentPath,
  remoteFiles,
  loadRemoteFiles,
  localPath,
  localFiles,
  loadLocalFiles,
  selectedLocalFile,
  setSelectedLocalFile,
  selectedRemoteFile,
  setSelectedRemoteFile,
}: SftpViewProps) {
  return (
    <div className="h-full flex flex-col p-4 overflow-hidden bg-white dark:bg-[#0c0e14]">
      {/* SFTP View Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e2330] flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Dual-Pane SFTP Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transfer stream berkas lokal ⇄ remote dan in-app text editor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sftpSelectedHost}
            onChange={(e) => setSftpSelectedHost(e.target.value)}
            className="bg-slate-100 dark:bg-[#161a24] border border-slate-300 dark:border-[#272d3e] rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white outline-none"
          >
            <option value="">Pilih Host Remote...</option>
            {hosts
              .filter((h) => h.type === "ssh")
              .map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label} ({h.hostname})
                </option>
              ))}
          </select>

          <button
            onClick={() => {
              if (sftpSelectedHost) connectSftp(sftpSelectedHost);
            }}
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-500"
          >
            Hubungkan
          </button>
        </div>
      </div>

      {/* Dual Panes */}
      <div className="flex-1 grid grid-cols-2 gap-3 mt-3 overflow-hidden">
        {/* Left: Local */}
        <div className="flex flex-col bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-[#1e2330] rounded-xl overflow-hidden">
          <div className="p-2 bg-slate-100 dark:bg-[#161a26] border-b border-slate-200 dark:border-[#1e2330] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-bold truncate">
              💻 Lokal: {localPath || "/"}
            </span>
            <button
              onClick={() => {
                const parent = localPath.split(/[\\/]/).slice(0, -1).join("/") || "/";
                loadLocalFiles(parent);
              }}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              ▲ Up
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-200 dark:divide-slate-800/40 text-xs font-mono">
            {localFiles.map((file) => (
              <div
                key={file.name}
                onClick={() => {
                  if (file.isDirectory) loadLocalFiles(localPath + "/" + file.name);
                  else setSelectedLocalFile(localPath + "/" + file.name);
                }}
                className={`p-1.5 flex items-center justify-between rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer ${
                  selectedLocalFile === localPath + "/" + file.name
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{file.isDirectory ? "📁" : "📄"}</span>
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {file.isDirectory ? "DIR" : `${Math.round(file.size / 1024)} KB`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Remote */}
        <div className="flex flex-col bg-slate-50 dark:bg-[#121620] border border-slate-200 dark:border-[#1e2330] rounded-xl overflow-hidden">
          <div className="p-2 bg-slate-100 dark:bg-[#161a26] border-b border-slate-200 dark:border-[#1e2330] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-bold truncate">
              🌐 Remote: {sftpCurrentPath}
            </span>
            <button
              onClick={() => {
                if (!sftpSessionId) return;
                const parent = sftpCurrentPath.split("/").slice(0, -1).join("/") || "/";
                loadRemoteFiles(sftpSessionId, parent);
              }}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              ▲ Up
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-200 dark:divide-slate-800/40 text-xs font-mono">
            {remoteFiles.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {sftpSessionId ? "Folder kosong atau sedang memuat..." : "Pilih host dan klik Hubungkan"}
              </div>
            ) : (
              remoteFiles.map((file) => (
                <div
                  key={file.name}
                  onClick={() => {
                    if (file.isDirectory && sftpSessionId) {
                      loadRemoteFiles(sftpSessionId, sftpCurrentPath.replace(/\/$/, "") + "/" + file.name);
                    } else {
                      setSelectedRemoteFile({
                        path: sftpCurrentPath.replace(/\/$/, "") + "/" + file.name,
                        isDirectory: file.isDirectory,
                      });
                    }
                  }}
                  className={`p-1.5 flex items-center justify-between rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer ${
                    selectedRemoteFile?.path === sftpCurrentPath.replace(/\/$/, "") + "/" + file.name
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{file.isDirectory ? "📁" : "📄"}</span>
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {file.isDirectory ? "DIR" : `${Math.round(file.size / 1024)} KB`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
