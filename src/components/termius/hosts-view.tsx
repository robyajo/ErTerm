import { useState } from "react";
import { DistroBadge } from "@/components/distro-badge";
import windowsIcon from "@assets/icon/windows.png";
import {
  Terminal as TerminalIcon,
  FolderSync,
  Plus,
  FolderPlus,
  Download,
  Edit3,
  Trash2,
  ChevronDown,
  LayoutGrid,
  Tag,
  Calendar,
} from "lucide-react";
import type { HostItem, FolderItem } from "@/core/types";

interface HostsViewProps {
  hosts: HostItem[];
  folders: FolderItem[];
  searchHost: string;
  setSearchHost: (query: string) => void;
  activeGroup: string;
  setActiveGroup: (group: string) => void;
  handleQuickConnect: (query: string) => void;
  connectHost: (host: HostItem) => void;
  openHostModal: (host?: Partial<HostItem>) => void;
  openFolderModal: (folder?: Partial<FolderItem>) => void;
  openSshConfigModal: () => void;
  onOpenSftp: (hostId: string) => void;
  onDeleteHost?: (hostId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  selectedHostId?: string | null;
  setSelectedHostId?: (id: string | null) => void;
  isCreatingNewHost?: boolean;
  newHostDraft?: Partial<HostItem>;
}

export function HostsView({
  hosts,
  folders,
  searchHost,
  setSearchHost,
  activeGroup,
  setActiveGroup,
  handleQuickConnect,
  connectHost,
  openHostModal,
  openFolderModal,
  openSshConfigModal,
  onOpenSftp,
  onDeleteHost,
  onDeleteFolder,
  selectedHostId: propSelectedHostId,
  setSelectedHostId: propSetSelectedHostId,
  isCreatingNewHost = false,
  newHostDraft,
}: HostsViewProps) {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [internalSelectedHostId, setInternalSelectedHostId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const selectedHostId = propSelectedHostId !== undefined ? propSelectedHostId : internalSelectedHostId;
  const setSelectedHostId = (id: string | null) => {
    if (propSetSelectedHostId) propSetSelectedHostId(id);
    else setInternalSelectedHostId(id);
  };

  // Filtered hosts based on active group and search query
  const filteredHosts = hosts.filter((h) => {
    const matchGroup =
      activeGroup === "All" ||
      h.group === activeGroup ||
      folders.find((f) => f.name === activeGroup)?.id === h.folderId;
    const matchQuery =
      !searchHost ||
      h.label.toLowerCase().includes(searchHost.toLowerCase()) ||
      (h.hostname && h.hostname.toLowerCase().includes(searchHost.toLowerCase())) ||
      (h.username && h.username.toLowerCase().includes(searchHost.toLowerCase()));
    return matchGroup && matchQuery;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Omni-Search & Sub-Action Bar */}
      <div className="space-y-3">
        {/* Omni-Search Bar */}
        <div className="relative flex items-center w-full bg-white dark:bg-[#1a1f33] border border-slate-300 dark:border-[#232a45] rounded-xl shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-1">
          <input
            type="text"
            value={searchHost}
            onChange={(e) => setSearchHost(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchHost.trim()) {
                handleQuickConnect(searchHost.trim());
              }
            }}
            autoComplete="off"
            spellCheck={false}
            placeholder="Find a host or ssh user@hostname..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none font-sans"
          />
          <button
            onClick={() => handleQuickConnect(searchHost.trim())}
            disabled={!searchHost.trim()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
          >
            Connect
          </button>
        </div>

        {/* Sub-Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Split Button: + New host ∨ */}
            <div className="relative flex items-center rounded-xl bg-white dark:bg-[#1a1f33] text-slate-800 dark:text-white text-xs font-medium border border-slate-300 dark:border-[#232a45] shadow-2xs">
              <button
                onClick={() => openHostModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#252b44] transition-colors rounded-l-xl cursor-pointer"
              >
                <Plus size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>New host</span>
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-[#2b3353]" />
              <button
                onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-[#252b44] transition-colors rounded-r-xl cursor-pointer"
              >
                <ChevronDown size={13} />
              </button>

              {/* Quick Menu Dropdown */}
              {quickMenuOpen && (
                <div className="absolute top-9 left-0 w-48 bg-white dark:bg-[#161a28] border border-slate-200 dark:border-[#262e4c] rounded-xl shadow-lg p-1 z-50 text-xs font-sans">
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      openFolderModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <FolderPlus size={14} className="text-indigo-500" />
                    <span>+ New Group / Folder</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      openSshConfigModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <Download size={14} className="text-emerald-500" />
                    <span>Import ~/.ssh/config</span>
                  </button>
                </div>
              )}
            </div>

            {/* Serial / Local Terminal Button */}
            <button
              onClick={() => {
                connectHost({
                  id: "local_" + Date.now(),
                  label: "Serial / Local Shell",
                  type: "local",
                  shellType: "zsh",
                  osType: "macos",
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1f33] hover:bg-slate-100 dark:hover:bg-[#252b44] border border-slate-300 dark:border-[#232a45] text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <TerminalIcon size={14} />
              <span>Serial</span>
            </button>
          </div>

          {/* Right View Toggles & User Avatar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <LayoutGrid size={15} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <Tag size={15} />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <Calendar size={15} />
              </button>
            </div>

            {/* User Avatar Badge with + */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-[#232a45]">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                RK
              </div>
              <div
                onClick={() => openHostModal()}
                className="h-5 w-5 rounded-md bg-white dark:bg-[#1a1f33] border border-slate-300 dark:border-[#232a45] flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Add Host"
              >
                <Plus size={11} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Groups */}
      {folders.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Groups</span>
            <span className="text-[11px] text-slate-500 font-normal">Double-click untuk buka</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3">
            {folders.map((folder) => {
              const count = hosts.filter(
                (h) => h.folderId === folder.id || h.group === folder.name
              ).length;
              const isFilterActive = activeGroup === folder.name;
              const isSelected = selectedFolderId === folder.id;
              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  onDoubleClick={() => setActiveGroup(isFilterActive ? "All" : folder.name)}
                  className={`group relative flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1a1f33] border transition-all cursor-pointer shadow-xs hover:bg-slate-50 dark:hover:bg-[#20263f] ${
                    isFilterActive || isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-500/30"
                      : "border-slate-200/90 dark:border-[#232a45] hover:border-slate-300 dark:hover:border-[#2d3759]"
                  }`}
                  title="Double klik untuk filter grup ini"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Authentic Termius Group Squircle with 2-filled & 2-outlined quadrant grid */}
                    <div className="h-9 w-9 rounded-xl bg-[#004878] flex items-center justify-center p-2 flex-shrink-0 shadow-xs">
                      <svg
                        viewBox="0 0 24 24"
                        width="19"
                        height="19"
                        fill="none"
                        className="pointer-events-none select-none"
                      >
                        {/* Top-left: Solid filled white */}
                        <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" fill="#ffffff" />
                        {/* Top-right: Outlined white */}
                        <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                        {/* Bottom-left: Outlined white */}
                        <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                        {/* Bottom-right: Solid filled white */}
                        <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" fill="#ffffff" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[13px] text-slate-900 dark:text-white truncate">
                        {folder.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#7d8c9e] font-normal">
                        {count} Hosts
                      </div>
                    </div>
                  </div>

                  {/* Folder Actions on Hover */}
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFolderModal(folder);
                      }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Group"
                    >
                      <Edit3 size={13} />
                    </button>
                    {onDeleteFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                        onDoubleClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Hapus Group"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section: Hosts (5-Column Grid matching Screenshot) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Hosts {activeGroup !== "All" && `(${activeGroup})`}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-normal">Double-click untuk connect</span>
            {activeGroup !== "All" && (
              <button
                onClick={() => setActiveGroup("All")}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Show All ({hosts.length})
              </button>
            )}
          </div>
        </div>

        {/* 5-Column Grid matching user's screenshot layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3">
          {/* Draft Host Card Preview when creating a new host */}
          {isCreatingNewHost && (
            <div
              className="group relative flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1a1f33] border border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <DistroBadge
                  osType={newHostDraft?.osType || "server"}
                  icon={newHostDraft?.icon || "server"}
                  label={newHostDraft?.label}
                  hostname={newHostDraft?.hostname}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[13px] text-slate-900 dark:text-white truncate leading-tight tracking-tight">
                    {newHostDraft?.label || newHostDraft?.hostname || "Enter IP or Hostname..."}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#7d8c9e] font-normal truncate mt-0.5">
                    {newHostDraft?.username ? `ssh, ${newHostDraft.username}` : "ssh"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredHosts.map((h) => {
            const isSelected = selectedHostId === h.id;
            return (
              <div
                key={h.id}
                onClick={() => {
                  setSelectedHostId(h.id);
                  openHostModal(h);
                }}
                onDoubleClick={() => connectHost(h)}
                className={`group relative flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1a1f33] border transition-all cursor-pointer shadow-xs hover:bg-slate-50 dark:hover:bg-[#20263f] ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10"
                    : "border-slate-200/90 dark:border-[#232a45] hover:border-slate-300 dark:hover:border-[#2d3759]"
                }`}
                title="Double klik untuk koneksi SSH"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Distro Squircle Badge: Orange Ubuntu / Blue Server Rack */}
                  <DistroBadge osType={h.osType} icon={h.icon} label={h.label} hostname={h.hostname} />

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[13px] text-slate-900 dark:text-white truncate leading-tight tracking-tight">
                      {h.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#7d8c9e] font-normal truncate mt-0.5">
                      {h.type === "ssh"
                        ? h.username
                          ? `ssh, ${h.username}`
                          : "ssh"
                        : `Local Shell (${h.shellType || "zsh"})`}
                    </div>
                  </div>
                </div>

                {/* Hover & Selection Action Buttons: Edit Pencil & SFTP/Delete */}
                <div
                  className={`flex items-center gap-1 transition-opacity flex-shrink-0 ml-1 ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openHostModal(h);
                    }}
                    onDoubleClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    title="Edit Host"
                  >
                    <Edit3 size={13} />
                  </button>
                  {h.type === "ssh" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSftp(h.id);
                      }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors hidden group-hover:block"
                      title="Open SFTP"
                    >
                      <FolderSync size={13} />
                    </button>
                  )}
                  {onDeleteHost && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHost(h.id);
                      }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-colors hidden group-hover:block"
                      title="Hapus Host"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
