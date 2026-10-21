import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import {
  Server,
  Terminal as TerminalIcon,
  FolderSync,
  Network,
  KeyRound,
  FileCode,
  Settings as SettingsIcon,
  Plus,
  FolderPlus,
  Download,
  Upload,
  Play,
  RefreshCw,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Radio,
  FileText,
  X,
  ExternalLink,
  ShieldCheck,
  Monitor,
  Folder as FolderIcon
} from "lucide-react";
import type {
  HostItem,
  FolderItem,
  TunnelItem,
  SshKeyItem,
  SnippetItem,
  SettingsData,
  LocalFileEntry
} from "@/core/types";

interface ActiveTab {
  id: string;
  host: HostItem;
  ws?: WebSocket;
  term?: Terminal;
  fitAddon?: FitAddon;
}

export function TerminalApp() {
  const [activeNav, setActiveNav] = useState<
    "hosts" | "terminals" | "sftp" | "tunnels" | "keys" | "snippets" | "settings"
  >("hosts");

  const [hosts, setHosts] = useState<HostItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);
  const [tunnels, setTunnels] = useState<TunnelItem[]>([]);
  const [keys, setKeys] = useState<SshKeyItem[]>([]);
  const [settings, setSettings] = useState<SettingsData>({});
  const [appVersion, setAppVersion] = useState("1.0.3");

  const [searchHost, setSearchHost] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");

  // Terminal state
  const [tabs, setTabs] = useState<ActiveTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const terminalRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // SFTP state
  const [sftpSessionId, setSftpSessionId] = useState<string | null>(null);
  const [sftpCurrentPath, setSftpCurrentPath] = useState("/");
  const [sftpSelectedHost, setSftpSelectedHost] = useState("");
  const [localDrives, setLocalDrives] = useState<string[]>([]);
  const [localPath, setLocalPath] = useState("");
  const [localFiles, setLocalFiles] = useState<LocalFileEntry[]>([]);
  const [remoteFiles, setRemoteFiles] = useState<Array<{ name: string; isDirectory: boolean; size: number; permissions?: string }>>([]);
  const [selectedLocalFile, setSelectedLocalFile] = useState<string | null>(null);
  const [selectedRemoteFile, setSelectedRemoteFile] = useState<{ path: string; isDirectory: boolean } | null>(null);

  // In-app Editor Modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorFilePath, setEditorFilePath] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorStatus, setEditorStatus] = useState("");

  // Modals
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [hostForm, setHostForm] = useState<Partial<HostItem>>({
    label: "",
    type: "ssh",
    hostname: "",
    port: 22,
    username: "",
    authType: "password",
    password: "",
    privateKey: "",
    passphrase: "",
    keyId: "",
    folderId: null,
    group: "Default",
    color: "#7b61ff"
  });

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderForm, setFolderForm] = useState<Partial<FolderItem>>({
    name: "",
    icon: "📁",
    color: "#7b61ff"
  });

  const [sshConfigModalOpen, setSshConfigModalOpen] = useState(false);
  const [sshConfigPath, setSshConfigPath] = useState("");
  const [sshConfigResult, setSshConfigResult] = useState<string | null>(null);

  const [tunnelModalOpen, setTunnelModalOpen] = useState(false);
  const [tunnelForm, setTunnelForm] = useState<Partial<TunnelItem>>({
    label: "",
    hostId: "",
    tunnelType: "local",
    localPort: 8080,
    remoteHost: "127.0.0.1",
    remotePort: 80,
    enabled: false
  });

  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyForm, setKeyForm] = useState<{ label: string; keyType: "ed25519" | "rsa" }>({
    label: "My SSH Key",
    keyType: "ed25519"
  });

  const [snippetVarModalOpen, setSnippetVarModalOpen] = useState(false);
  const [snippetTemplateCmd, setSnippetTemplateCmd] = useState("");
  const [snippetVariables, setSnippetVariables] = useState<string[]>([]);
  const [snippetVarValues, setSnippetVarValues] = useState<Record<string, string>>({});

  const [draggedHostId, setDraggedHostId] = useState<string | null>(null);

  // Fetch initial data
  const loadAllData = async () => {
    try {
      const [hRes, fRes, sRes, tRes, kRes, setRes, sysRes] = await Promise.all([
        fetch("http://127.0.0.1:3980/api/hosts").then(r => r.json()),
        fetch("http://127.0.0.1:3980/api/folders").then(r => r.json()),
        fetch("http://127.0.0.1:3980/api/snippets").then(r => r.json()),
        fetch("http://127.0.0.1:3980/api/tunnels").then(r => r.json()),
        fetch("http://127.0.0.1:3980/api/keys").then(r => r.json()),
        fetch("http://127.0.0.1:3980/api/settings").then(r => r.json()),
        fetch("http://127.0.0.1:3980/api/system").then(r => r.json())
      ]);

      if (hRes.success) setHosts(hRes.hosts);
      if (fRes.success) setFolders(fRes.folders);
      if (sRes.success) setSnippets(sRes.snippets);
      if (tRes.success) setTunnels(tRes.tunnels);
      if (kRes.success) setKeys(kRes.keys);
      if (setRes.success) setSettings(setRes.settings);
      if (sysRes.success && sysRes.appVersion) setAppVersion(sysRes.appVersion);
    } catch (err) {
      console.warn("API load warning:", err);
    }
  };

  useEffect(() => {
    loadAllData();
    loadLocalFiles();
  }, []);

  // Local filesystem explorer for SFTP
  const loadLocalFiles = async (dirPath?: string) => {
    try {
      const drivesRes = await fetch("http://127.0.0.1:3980/api/local/drives").then(r => r.json());
      if (drivesRes.success) setLocalDrives(drivesRes.drives || []);

      const listRes = await fetch("http://127.0.0.1:3980/api/local/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: dirPath })
      }).then(r => r.json());

      if (listRes.success) {
        setLocalPath(listRes.path);
        setLocalFiles(listRes.items || []);
      }
    } catch (e) {
      console.warn("Local files load error:", e);
    }
  };

  // Connect to Host (Shell or SSH)
  const connectHost = (host: HostItem) => {
    const tabId = "tab_" + Date.now();
    const newTab: ActiveTab = { id: tabId, host };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(tabId);
    setActiveNav("terminals");

    setTimeout(() => {
      initXterm(newTab);
    }, 150);
  };

  const initXterm = (tab: ActiveTab) => {
    const container = terminalRefs.current.get(tab.id);
    if (!container) return;

    container.innerHTML = "";

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: settings.fontFamily || "Geist Mono, monospace",
      fontSize: settings.fontSize || 14,
      theme: {
        background: "#0c0e14",
        foreground: "#e2e8f0",
        cursor: "#7b61ff"
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(container);
    fitAddon.fit();

    const ws = new WebSocket("ws://127.0.0.1:3980");

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "init",
        hostId: tab.host.id,
        cols: term.cols,
        rows: term.rows
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "data") {
          term.write(msg.data);
        } else if (msg.type === "status") {
          term.writeln(`\r\n\x1b[32m[ErTerm] ${msg.message}\x1b[0m\r\n`);
        } else if (msg.type === "error") {
          term.writeln(`\r\n\x1b[31m[ErTerm Error] ${msg.message}\x1b[0m\r\n`);
        }
      } catch {
        term.write(event.data);
      }
    };

    term.onData((data) => {
      if (broadcastEnabled) {
        tabs.forEach(t => {
          if (t.ws && t.ws.readyState === WebSocket.OPEN) {
            t.ws.send(JSON.stringify({ type: "data", data }));
          }
        });
      } else {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "data", data }));
        }
      }
    });

    tab.ws = ws;
    tab.term = term;
    tab.fitAddon = fitAddon;
  };

  const closeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      tab.ws?.close();
      tab.term?.dispose();
    }
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const saveTerminalLog = () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || !activeTab.term) return alert("Pilih tab terminal yang aktif.");
    const buffer = activeTab.term.buffer.active;
    let text = "";
    for (let i = 0; i < buffer.length; i++) {
      const line = buffer.getLine(i);
      if (line) text += line.translateToString(true) + "\n";
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `erterm_${activeTab.host.label.replace(/\s+/g, "_")}_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeSnippet = (cmd: string) => {
    const matches = [...cmd.matchAll(/\{\{([^}]+)\}\}/g)];
    if (matches.length > 0) {
      const vars = [...new Set(matches.map(m => m[1].trim()))];
      setSnippetTemplateCmd(cmd);
      setSnippetVariables(vars);
      setSnippetVarValues({});
      setSnippetVarModalOpen(true);
      return;
    }

    sendCmdToActiveTerminal(cmd);
  };

  const sendCmdToActiveTerminal = (cmd: string) => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || !activeTab.ws || activeTab.ws.readyState !== WebSocket.OPEN) {
      return alert("Buka atau pilih tab terminal terlebih dahulu.");
    }
    activeTab.ws.send(JSON.stringify({ type: "data", data: cmd + "\n" }));
    setActiveNav("terminals");
  };

  // Drag and Drop
  const moveHostToFolder = async (hostId: string, folderId: string | null) => {
    try {
      const res = await fetch(`http://127.0.0.1:3980/api/hosts/${hostId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId })
      }).then(r => r.json());

      if (res.success) {
        setHosts(prev => prev.map(h => h.id === hostId ? { ...h, folderId } : h));
      }
    } catch (e) {
      console.error("Move error:", e);
    }
  };

  // SFTP Functions
  const connectSftp = async (hostId: string) => {
    try {
      const res = await fetch("http://127.0.0.1:3980/api/sftp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId })
      }).then(r => r.json());

      if (res.success) {
        setSftpSessionId(res.sessionId);
        setSftpCurrentPath(res.initialPath || "/");
        loadRemoteFiles(res.sessionId, res.initialPath || "/");
      } else {
        alert("SFTP Gagal: " + res.error);
      }
    } catch (e) {
      alert("SFTP Error: " + e);
    }
  };

  const loadRemoteFiles = async (sessionId: string, path: string) => {
    try {
      const res = await fetch("http://127.0.0.1:3980/api/sftp/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, path })
      }).then(r => r.json());

      if (res.success) {
        setSftpCurrentPath(res.path);
        setRemoteFiles(res.items || []);
      }
    } catch (e) {
      console.error("Remote files list error:", e);
    }
  };

  const openRemoteFileEditor = async (filePath: string) => {
    if (!sftpSessionId) return;
    setEditorFilePath(filePath);
    setEditorStatus("Memuat file...");
    setEditorContent("");
    setEditorOpen(true);

    try {
      const res = await fetch("http://127.0.0.1:3980/api/sftp/read-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sftpSessionId, filePath })
      }).then(r => r.json());

      if (res.success) {
        setEditorContent(res.content);
        setEditorStatus("Siap diedit (Ctrl+S untuk simpan)");
      } else {
        setEditorStatus("Gagal memuat: " + res.error);
      }
    } catch (e) {
      setEditorStatus("Error: " + e);
    }
  };

  const saveRemoteFileEditor = async () => {
    if (!sftpSessionId || !editorFilePath) return;
    setEditorStatus("Menyimpan ke server...");
    try {
      const res = await fetch("http://127.0.0.1:3980/api/sftp/write-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sftpSessionId, filePath: editorFilePath, content: editorContent })
      }).then(r => r.json());

      if (res.success) {
        setEditorStatus("✓ Tersimpan di server remote!");
      } else {
        setEditorStatus("✗ Gagal: " + res.error);
      }
    } catch (e) {
      setEditorStatus("✗ Error: " + e);
    }
  };

  // Filtered hosts
  const filteredHosts = hosts.filter(h => {
    const matchGroup = activeGroup === "All" || h.group === activeGroup;
    const matchQuery = !searchHost ||
      h.label.toLowerCase().includes(searchHost.toLowerCase()) ||
      (h.hostname && h.hostname.toLowerCase().includes(searchHost.toLowerCase()));
    return matchGroup && matchQuery;
  });

  return (
    <div className="flex h-full w-full bg-[#0a0c10] text-[#e2e8f0] overflow-hidden select-none font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-56 bg-[#10131a] border-r border-[#1e2330] flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="p-4 flex items-center gap-3 border-b border-[#1e2330]">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <TerminalIcon size={20} />
            </div>
            <div>
              <div className="font-bold font-mono tracking-tight text-white flex items-center gap-1.5 text-base">
                Er<span className="text-indigo-400">Term</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">v{appVersion} • Core</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            <button
              onClick={() => setActiveNav("hosts")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === "hosts"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Server size={17} />
              <span>Saved Hosts</span>
            </button>

            <button
              onClick={() => setActiveNav("terminals")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === "terminals"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <TerminalIcon size={17} />
                <span>Terminals</span>
              </div>
              {tabs.length > 0 && (
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-1.5 py-0.5 rounded-full">
                  {tabs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveNav("sftp")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === "sftp"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <FolderSync size={17} />
              <span>SFTP Manager</span>
            </button>

            <button
              onClick={() => setActiveNav("tunnels")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === "tunnels"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <Network size={17} />
              <span>Port Forwarding</span>
            </button>

            <button
              onClick={() => setActiveNav("keys")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === "keys"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <KeyRound size={17} />
              <span>SSH Key Vault</span>
            </button>

            <button
              onClick={() => setActiveNav("snippets")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === "snippets"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <FileCode size={17} />
              <span>Quick Snippets</span>
            </button>

            <button
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === "settings"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <SettingsIcon size={17} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1e2330] text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Core Active</span>
          </div>
          <span>:3980</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-10 bg-[#121620] border-b border-[#1e2330] px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white capitalize font-semibold">{activeNav}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-[11px] font-mono text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span>v{appVersion}</span>
            </div>

            <button
              onClick={() => {
                alert(`ErTerm v${appVersion} sudah merupakan versi terbaru dengan arsitektur registry akun terpadu.`);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-semibold hover:opacity-90 transition-opacity"
            >
              <span>🚀 Up to date</span>
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 overflow-hidden relative">
          {/* VIEW: HOSTS */}
          {activeNav === "hosts" && (
            <div className="h-full flex flex-col p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#1e2330]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Saved Hosts</h2>
                  <p className="text-xs text-slate-400">Kelola server SSH remote dan shell lokal dengan pengelompokan folder.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchHost}
                    onChange={(e) => setSearchHost(e.target.value)}
                    placeholder="Search hosts..."
                    className="bg-[#161a24] border border-[#272d3e] rounded-md px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-44"
                  />

                  <button
                    onClick={() => {
                      setSshConfigPath("");
                      setSshConfigResult(null);
                      setSshConfigModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161a24] hover:bg-[#202534] border border-[#272d3e] text-xs font-medium text-slate-300"
                  >
                    <Download size={14} />
                    <span>Import ~/.ssh/config</span>
                  </button>

                  <button
                    onClick={() => {
                      setFolderForm({ name: "", icon: "📁", color: "#7b61ff" });
                      setFolderModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161a24] hover:bg-[#202534] border border-[#272d3e] text-xs font-medium text-slate-300"
                  >
                    <FolderPlus size={14} />
                    <span>+ Folder</span>
                  </button>

                  <button
                    onClick={() => {
                      setHostForm({
                        label: "",
                        type: "ssh",
                        hostname: "",
                        port: 22,
                        username: "",
                        authType: "password",
                        password: "",
                        folderId: null,
                        color: "#7b61ff"
                      });
                      setHostModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-sm shadow-indigo-600/30"
                  >
                    <Plus size={14} />
                    <span>Add Host</span>
                  </button>
                </div>
              </div>

              {/* Root Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const hostId = e.dataTransfer.getData("text/plain") || draggedHostId;
                  if (hostId) moveHostToFolder(hostId, null);
                }}
                className="my-3 p-3 border border-dashed border-[#272d3e] rounded-lg text-center text-xs text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
              >
                📥 Drag host ke sini untuk mengeluarkan dari folder (Unassigned Root)
              </div>

              {/* Folders Shelf */}
              {folders.map(folder => {
                const folderHosts = filteredHosts.filter(h => h.folderId === folder.id);
                return (
                  <div
                    key={folder.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const hostId = e.dataTransfer.getData("text/plain") || draggedHostId;
                      if (hostId) moveHostToFolder(hostId, folder.id);
                    }}
                    className="mb-4 bg-[#121620] border border-[#1e2330] rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
                  >
                    {/* Folder Header */}
                    <div className="p-3 bg-[#151a26]/60 flex items-center justify-between border-b border-[#1e2330]">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{folder.icon || "📁"}</span>
                        <span className="font-bold text-sm text-white" style={{ color: folder.color || undefined }}>
                          {folder.name}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {folderHosts.length} hosts
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setFolderForm(folder);
                            setFolderModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Hapus folder ${folder.name}? Host di dalamnya akan dipindah ke root.`)) {
                              await fetch(`http://127.0.0.1:3980/api/folders/${folder.id}`, { method: "DELETE" });
                              loadAllData();
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Folder Content Cards */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[70px]">
                      {folderHosts.length === 0 ? (
                        <div className="col-span-full py-4 text-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-lg">
                          Drag host ke sini untuk mengelompokkan ke folder "{folder.name}"
                        </div>
                      ) : (
                        folderHosts.map(h => (
                          <div
                            key={h.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", h.id);
                              setDraggedHostId(h.id);
                            }}
                            className="bg-[#161a24] border border-[#23293a] rounded-lg p-3 flex flex-col justify-between hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: h.color || "#7b61ff" }} />
                            <div>
                              <div className="font-semibold text-sm text-white">{h.label}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">
                                {h.type === "ssh" ? `${h.username}@${h.hostname}:${h.port || 22}` : `Local Shell (${h.shellType || "powershell"})`}
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                              <button
                                onClick={() => connectHost(h)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-medium transition-colors"
                              >
                                <Play size={12} />
                                <span>Connect</span>
                              </button>
                              <div className="flex items-center gap-1">
                                {h.type === "ssh" && (
                                  <button
                                    onClick={() => {
                                      setSftpSelectedHost(h.id);
                                      connectSftp(h.id);
                                      setActiveNav("sftp");
                                    }}
                                    className="p-1 text-slate-400 hover:text-white"
                                    title="Open SFTP"
                                  >
                                    <FolderSync size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setHostForm(h);
                                    setHostModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white"
                                >
                                  <Edit3 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Root (Unassigned) Hosts */}
              <div className="mt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Root Servers ({filteredHosts.filter(h => !h.folderId || !folders.some(f => f.id === h.folderId)).length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredHosts
                    .filter(h => !h.folderId || !folders.some(f => f.id === h.folderId))
                    .map(h => (
                      <div
                        key={h.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", h.id);
                          setDraggedHostId(h.id);
                        }}
                        className="bg-[#121620] border border-[#1e2330] rounded-lg p-3 flex flex-col justify-between hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: h.color || "#7b61ff" }} />
                        <div>
                          <div className="font-semibold text-sm text-white">{h.label}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            {h.type === "ssh" ? `${h.username}@${h.hostname}:${h.port || 22}` : `Local Shell (${h.shellType || "powershell"})`}
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => connectHost(h)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-medium transition-colors"
                          >
                            <Play size={12} />
                            <span>Connect</span>
                          </button>
                          <div className="flex items-center gap-1">
                            {h.type === "ssh" && (
                              <button
                                onClick={() => {
                                  setSftpSelectedHost(h.id);
                                  connectSftp(h.id);
                                  setActiveNav("sftp");
                                }}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Open SFTP"
                              >
                                <FolderSync size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setHostForm(h);
                                setHostModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Hapus host ${h.label}?`)) {
                                  await fetch(`http://127.0.0.1:3980/api/hosts/${h.id}`, { method: "DELETE" });
                                  loadAllData();
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TERMINALS */}
          {activeNav === "terminals" && (
            <div className="h-full flex flex-col overflow-hidden bg-[#0c0e14]">
              {/* Tab Bar */}
              <div className="h-10 bg-[#121620] border-b border-[#1e2330] flex items-center justify-between px-2 flex-shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {tabs.map(tab => (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-mono cursor-pointer transition-colors border-b-2 ${
                        activeTabId === tab.id
                          ? "bg-[#0c0e14] text-white border-indigo-500 font-bold"
                          : "text-slate-400 hover:bg-slate-800/40 border-transparent"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tab.host.color || "#7b61ff" }} />
                      <span>{tab.host.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="text-slate-500 hover:text-white p-0.5 rounded"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBroadcastEnabled(!broadcastEnabled)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      broadcastEnabled
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold animate-pulse"
                        : "bg-slate-800/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Radio size={13} />
                    <span>{broadcastEnabled ? "Broadcast ON" : "Broadcast OFF"}</span>
                  </button>

                  <button
                    onClick={saveTerminalLog}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/60 text-slate-400 hover:text-white text-xs font-mono"
                    title="Download active terminal log"
                  >
                    <FileText size={13} />
                    <span>Save Log</span>
                  </button>
                </div>
              </div>

              {/* Terminal Viewports Container */}
              <div className="flex-1 relative overflow-hidden bg-[#0c0e14]">
                {tabs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                    <TerminalIcon size={40} className="text-slate-700" />
                    <p>Belum ada sesi terminal aktif. Buka host dari menu Saved Hosts.</p>
                  </div>
                ) : (
                  tabs.map(tab => (
                    <div
                      key={tab.id}
                      ref={el => {
                        if (el) terminalRefs.current.set(tab.id, el);
                        else terminalRefs.current.delete(tab.id);
                      }}
                      className={`absolute inset-0 p-2 ${activeTabId === tab.id ? "block" : "hidden"}`}
                    />
                  ))
                )}
              </div>

              {/* Bottom Quick Commands Bar */}
              <div className="h-9 bg-[#121620] border-t border-[#1e2330] px-3 flex items-center gap-2 overflow-x-auto flex-shrink-0">
                <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">Snippets:</span>
                {snippets.map(s => (
                  <button
                    key={s.id}
                    onClick={() => executeSnippet(s.command)}
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-[11px] font-mono text-slate-300 transition-colors whitespace-nowrap"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SFTP */}
          {activeNav === "sftp" && (
            <div className="h-full flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2330] flex-shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Dual-Pane SFTP Manager</h2>
                  <p className="text-xs text-slate-400">Transfer stream berkas lokal ⇄ remote dan in-app text editor.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sftpSelectedHost}
                    onChange={(e) => setSftpSelectedHost(e.target.value)}
                    className="bg-[#161a24] border border-[#272d3e] rounded-md px-2.5 py-1 text-xs text-white outline-none"
                  >
                    <option value="">Pilih Host Remote...</option>
                    {hosts.filter(h => h.type === "ssh").map(h => (
                      <option key={h.id} value={h.id}>{h.label} ({h.hostname})</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (sftpSelectedHost) connectSftp(sftpSelectedHost);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-500"
                  >
                    Hubungkan
                  </button>
                </div>
              </div>

              {/* Dual Panes */}
              <div className="flex-1 grid grid-cols-2 gap-3 mt-3 overflow-hidden">
                {/* Left: Local Pane */}
                <div className="flex flex-col bg-[#121620] border border-[#1e2330] rounded-xl overflow-hidden">
                  <div className="p-2 bg-[#161a26] border-b border-[#1e2330] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">💻 Lokal: {localPath}</span>
                    <button
                      onClick={() => {
                        const parent = localPath.split(/[\\/]/).slice(0, -1).join("/") || "/";
                        loadLocalFiles(parent);
                      }}
                      className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700"
                    >
                      ▲ Up
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/40 text-xs font-mono">
                    {localFiles.map(f => (
                      <div
                        key={f.name}
                        onClick={() => {
                          if (f.isDirectory) loadLocalFiles(f.fullPath);
                          else setSelectedLocalFile(f.fullPath);
                        }}
                        className={`p-1.5 flex items-center justify-between rounded cursor-pointer ${
                          selectedLocalFile === f.fullPath ? "bg-indigo-600/20 text-indigo-300" : "hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{f.isDirectory ? "📁" : "📄"}</span>
                          <span className="truncate">{f.name}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">{f.isDirectory ? "--" : `${Math.round(f.size / 1024)} KB`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Remote Pane */}
                <div className="flex flex-col bg-[#121620] border border-[#1e2330] rounded-xl overflow-hidden">
                  <div className="p-2 bg-[#161a26] border-b border-[#1e2330] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">🌐 Remote: {sftpCurrentPath}</span>
                    <button
                      onClick={() => {
                        if (!sftpSessionId) return;
                        const parent = sftpCurrentPath.split("/").slice(0, -1).join("/") || "/";
                        loadRemoteFiles(sftpSessionId, parent);
                      }}
                      className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700"
                    >
                      ▲ Up
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/40 text-xs font-mono">
                    {!sftpSessionId ? (
                      <div className="h-full flex items-center justify-center text-slate-500">
                        Pilih host dan klik Hubungkan untuk membuka server.
                      </div>
                    ) : (
                      remoteFiles.map(f => {
                        const fullPath = sftpCurrentPath.replace(/\/+$/, "") + "/" + f.name;
                        return (
                          <div
                            key={f.name}
                            onClick={() => {
                              if (f.isDirectory) loadRemoteFiles(sftpSessionId, fullPath);
                              else setSelectedRemoteFile({ path: fullPath, isDirectory: false });
                            }}
                            className={`p-1.5 flex items-center justify-between rounded cursor-pointer ${
                              selectedRemoteFile?.path === fullPath ? "bg-indigo-600/20 text-indigo-300" : "hover:bg-slate-800/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>{f.isDirectory ? "📁" : "📄"}</span>
                              <span className="truncate">{f.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!f.isDirectory && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openRemoteFileEditor(fullPath);
                                  }}
                                  className="px-2 py-0.5 bg-slate-800 hover:bg-indigo-600 rounded text-[10px]"
                                >
                                  Edit
                                </button>
                              )}
                              <span className="text-slate-500 text-[11px]">{f.isDirectory ? "--" : `${Math.round(f.size / 1024)} KB`}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TUNNELS */}
          {activeNav === "tunnels" && (
            <div className="h-full flex flex-col p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2330]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Port Forwarding & Tunnels</h2>
                  <p className="text-xs text-slate-400">Pengalihan port aktif lokal, remote, dan SOCKS5 proxy via SSH gateway.</p>
                </div>
                <button
                  onClick={() => setTunnelModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-500"
                >
                  <Plus size={14} />
                  <span>New Tunnel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {tunnels.map(t => (
                  <div key={t.id} className="p-3.5 bg-[#121620] border border-[#1e2330] rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm text-white">{t.label}</div>
                      <button
                        onClick={async () => {
                          const res = await fetch(`http://127.0.0.1:3980/api/tunnels/${t.id}/toggle`, { method: "POST" }).then(r => r.json());
                          if (res.success) loadAllData();
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-colors ${
                          t.enabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {t.enabled ? "● Active" : "○ Off"}
                      </button>
                    </div>

                    <div className="my-3 py-2 px-3 bg-[#161a26] rounded border border-slate-800/80 font-mono text-xs text-slate-300 flex items-center justify-between">
                      <span>:{t.localPort}</span>
                      <span className="text-indigo-400 font-bold">➔ {t.tunnelType.toUpperCase()} ➔</span>
                      <span>{t.remoteHost}:{t.remotePort}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                      <span>Status: {t.status === "active" ? "● Listening" : t.status === "error" ? "⚠️ Error" : "○ Inactive"}</span>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus tunnel ${t.label}?`)) {
                            await fetch(`http://127.0.0.1:3980/api/tunnels/${t.id}`, { method: "DELETE" });
                            loadAllData();
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: KEYS */}
          {activeNav === "keys" && (
            <div className="h-full flex flex-col p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2330]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Cryptographic SSH Key Vault</h2>
                  <p className="text-xs text-slate-400">Penyimpanan kunci kriptografi mandiri (Ed25519 & RSA) untuk autentikasi aman.</p>
                </div>
                <button
                  onClick={() => setKeyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-500"
                >
                  <Plus size={14} />
                  <span>Generate Key</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {keys.map(k => (
                  <div key={k.id} className="p-4 bg-[#121620] border border-[#1e2330] rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-white">{k.label}</div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 uppercase">
                          {k.keyType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-1 truncate">ID: {k.id}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(k.publicKey);
                          alert("Public key copied to clipboard!");
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                      >
                        <Copy size={13} />
                        <span>Copy Public Key</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SNIPPETS */}
          {activeNav === "snippets" && (
            <div className="h-full flex flex-col p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2330]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Command Snippets</h2>
                  <p className="text-xs text-slate-400">Perintah cepat dan template variabel untuk eksekusi ke sesi terminal aktif.</p>
                </div>
                <button
                  onClick={async () => {
                    const title = prompt("Nama Snippet:");
                    const command = prompt("Perintah (gunakan {{var}} untuk parameter):");
                    if (title && command) {
                      await fetch("http://127.0.0.1:3980/api/snippets", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title, command })
                      });
                      loadAllData();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-500"
                >
                  <Plus size={14} />
                  <span>New Snippet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {snippets.map(s => (
                  <div key={s.id} className="p-3.5 bg-[#121620] border border-[#1e2330] rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-sm text-white">{s.title}</div>
                      <code className="text-xs text-indigo-300 font-mono block mt-1 bg-[#161a26] p-2 rounded border border-slate-800 truncate">
                        {s.command}
                      </code>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => executeSnippet(s.command)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-medium"
                      >
                        <Play size={12} />
                        <span>Run</span>
                      </button>
                      <button
                        onClick={async () => {
                          await fetch(`http://127.0.0.1:3980/api/snippets/${s.id}`, { method: "DELETE" });
                          loadAllData();
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeNav === "settings" && (
            <div className="h-full flex flex-col p-4 max-w-3xl overflow-y-auto">
              <div className="pb-3 border-b border-[#1e2330]">
                <h2 className="text-lg font-bold text-white tracking-tight">ErTerm Settings</h2>
                <p className="text-xs text-slate-400">Konfigurasi tema, font terminal, dan sinkronisasi cloud.</p>
              </div>

              <div className="space-y-4 mt-4">
                <div className="p-4 bg-[#121620] border border-[#1e2330] rounded-xl">
                  <h3 className="font-semibold text-sm text-white mb-1">About ErTerm Desktop</h3>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                    <span>Versi Terpasang:</span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      v{appVersion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                    <span>Arsitektur Storage:</span>
                    <span className="text-slate-300">Unified Account Registry (registry-accountId.json)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                    <span>UI Framework:</span>
                    <span className="text-slate-300">React 19 + Vite + Tailwind CSS + shadcn/ui</span>
                  </div>
                </div>

                <div className="p-4 bg-[#121620] border border-[#1e2330] rounded-xl space-y-3">
                  <h3 className="font-semibold text-sm text-white">Cloud Sync (Neon PostgreSQL)</h3>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Cloud Backend API URL</label>
                    <input
                      type="text"
                      value={settings.cloudApiUrl || "https://www.luluax-service.duckdns.org"}
                      onChange={(e) => setSettings({ ...settings, cloudApiUrl: e.target.value })}
                      className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">User Sync Key / Token</label>
                    <input
                      type="text"
                      value={settings.cloudSyncKey || ""}
                      onChange={(e) => setSettings({ ...settings, cloudSyncKey: e.target.value })}
                      placeholder="robyfull.dev@gmail.com"
                      className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await fetch("http://127.0.0.1:3980/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(settings)
                        });
                        alert("Settings saved!");
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={async () => {
                        const res = await fetch("http://127.0.0.1:3980/api/cloud/push", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            cloudApiUrl: settings.cloudApiUrl || "https://www.luluax-service.duckdns.org",
                            syncKey: settings.cloudSyncKey || "robyfull.dev@gmail.com"
                          })
                        }).then(r => r.json());
                        alert(res.success ? "Sync Sukses!" : "Sync Gagal: " + res.error);
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded text-xs font-medium"
                    >
                      Push to Cloud
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: In-App SFTP Editor */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#10131a] border border-[#1e2330] rounded-xl flex flex-col h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-3 bg-[#161a26] border-b border-[#1e2330] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span>📝</span>
                <span className="font-bold text-white">{editorFilePath}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">{editorStatus}</span>
                <button onClick={() => setEditorOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </div>
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                  e.preventDefault();
                  saveRemoteFileEditor();
                }
              }}
              className="flex-1 bg-[#0c0e14] text-slate-200 p-4 font-mono text-xs outline-none resize-none leading-relaxed"
            />
            <div className="p-3 bg-[#121620] border-t border-[#1e2330] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Shortcut: Ctrl+S untuk menyimpan ke server</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditorOpen(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">
                  Tutup
                </button>
                <button onClick={saveRemoteFileEditor} className="px-3 py-1.5 rounded bg-indigo-600 text-white font-medium">
                  Simpan File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Host Form */}
      {hostModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121620] border border-[#1e2330] rounded-xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">{hostForm.id ? "Edit Host" : "Add Host"}</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Display Label *</label>
                <input
                  type="text"
                  value={hostForm.label || ""}
                  onChange={(e) => setHostForm({ ...hostForm, label: e.target.value })}
                  placeholder="Ubuntu Server"
                  className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Folder</label>
                  <select
                    value={hostForm.folderId || ""}
                    onChange={(e) => setHostForm({ ...hostForm, folderId: e.target.value || null })}
                    className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                  >
                    <option value="">-- Root (Tanpa Folder) --</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.icon || "📁"} {f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Color</label>
                  <input
                    type="color"
                    value={hostForm.color || "#7b61ff"}
                    onChange={(e) => setHostForm({ ...hostForm, color: e.target.value })}
                    className="h-8 w-full bg-transparent cursor-pointer rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Hostname / IP</label>
                  <input
                    type="text"
                    value={hostForm.hostname || ""}
                    onChange={(e) => setHostForm({ ...hostForm, hostname: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Port</label>
                  <input
                    type="number"
                    value={hostForm.port || 22}
                    onChange={(e) => setHostForm({ ...hostForm, port: parseInt(e.target.value, 10) || 22 })}
                    className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Username</label>
                <input
                  type="text"
                  value={hostForm.username || ""}
                  onChange={(e) => setHostForm({ ...hostForm, username: e.target.value })}
                  placeholder="root, ubuntu"
                  className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={hostForm.password || ""}
                  onChange={(e) => setHostForm({ ...hostForm, password: e.target.value })}
                  placeholder="Password"
                  className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ProxyJump / Bastion</label>
                <select
                  value={hostForm.proxyJumpHostId || ""}
                  onChange={(e) => setHostForm({ ...hostForm, proxyJumpHostId: e.target.value || undefined })}
                  className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                >
                  <option value="">Direct Connection (Tanpa Bastion)</option>
                  {hosts.filter(h => h.type === "ssh" && h.id !== hostForm.id).map(h => (
                    <option key={h.id} value={h.id}>{h.label} ({h.hostname})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button onClick={() => setHostModalOpen(false)} className="px-3 py-1.5 rounded bg-slate-800 text-xs text-slate-300">
                Batal
              </button>
              <button
                onClick={async () => {
                  const method = hostForm.id ? "PUT" : "POST";
                  const url = hostForm.id ? `http://127.0.0.1:3980/api/hosts/${hostForm.id}` : "http://127.0.0.1:3980/api/hosts";
                  await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(hostForm)
                  });
                  setHostModalOpen(false);
                  loadAllData();
                }}
                className="px-3 py-1.5 rounded bg-indigo-600 text-xs font-medium text-white"
              >
                Simpan Host
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Folder Form */}
      {folderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121620] border border-[#1e2330] rounded-xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">{folderForm.id ? "Edit Folder" : "Buat Folder Baru"}</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nama Folder *</label>
                <input
                  type="text"
                  value={folderForm.name || ""}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  placeholder="Production Cluster"
                  className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Ikon</label>
                  <select
                    value={folderForm.icon || "📁"}
                    onChange={(e) => setFolderForm({ ...folderForm, icon: e.target.value })}
                    className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                  >
                    <option value="📁">📁 Folder</option>
                    <option value="🚀">🚀 Production</option>
                    <option value="🧪">🧪 Staging</option>
                    <option value="💾">💾 Database</option>
                    <option value="☁️">☁️ Cloud</option>
                    <option value="🔒">🔒 Security</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Warna</label>
                  <input
                    type="color"
                    value={folderForm.color || "#7b61ff"}
                    onChange={(e) => setFolderForm({ ...folderForm, color: e.target.value })}
                    className="h-8 w-full bg-transparent cursor-pointer rounded"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button onClick={() => setFolderModalOpen(false)} className="px-3 py-1.5 rounded bg-slate-800 text-xs text-slate-300">
                Batal
              </button>
              <button
                onClick={async () => {
                  const method = folderForm.id ? "PUT" : "POST";
                  const url = folderForm.id ? `http://127.0.0.1:3980/api/folders/${folderForm.id}` : "http://127.0.0.1:3980/api/folders";
                  await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(folderForm)
                  });
                  setFolderModalOpen(false);
                  loadAllData();
                }}
                className="px-3 py-1.5 rounded bg-indigo-600 text-xs font-medium text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import ~/.ssh/config */}
      {sshConfigModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121620] border border-[#1e2330] rounded-xl p-5 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white mb-2">Import ~/.ssh/config</h3>
            <p className="text-slate-400 mb-3">
              ErTerm akan mem-parse file konfigurasi OpenSSH lokal di komputer Anda, mengimpor semua host, port, user, private key, dan aturan ProxyJump otomatis.
            </p>
            <div>
              <label className="text-slate-400 block mb-1">Path Konfigurasi (Opsional):</label>
              <input
                type="text"
                value={sshConfigPath}
                onChange={(e) => setSshConfigPath(e.target.value)}
                placeholder="Kosongkan untuk default ~/.ssh/config"
                className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
              />
            </div>
            {sshConfigResult && (
              <div className="mt-2 p-2 bg-slate-800 rounded font-mono text-[11px] text-indigo-300">
                {sshConfigResult}
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button onClick={() => setSshConfigModalOpen(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">
                Tutup
              </button>
              <button
                onClick={async () => {
                  setSshConfigResult("Membaca dan mengimpor...");
                  try {
                    const res = await fetch("http://127.0.0.1:3980/api/hosts/import-ssh-config", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ customPath: sshConfigPath || undefined })
                    }).then(r => r.json());

                    if (res.success) {
                      setSshConfigResult(`✓ Berhasil mengimpor ${res.importedCount} host baru (${res.skippedCount} dilewati).`);
                      loadAllData();
                    } else {
                      setSshConfigResult(`✗ Error: ${res.error}`);
                    }
                  } catch (e) {
                    setSshConfigResult("✗ Network error: " + e);
                  }
                }}
                className="px-3 py-1.5 rounded bg-indigo-600 text-white font-medium"
              >
                Mulai Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Snippet Variable Interpolator */}
      {snippetVarModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121620] border border-[#1e2330] rounded-xl p-5 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white mb-2">Isi Variabel Perintah</h3>
            <p className="text-slate-400 mb-3 font-mono text-[11px]">{snippetTemplateCmd}</p>
            <div className="space-y-2">
              {snippetVariables.map(v => (
                <div key={v}>
                  <label className="text-slate-400 block mb-1 font-mono text-[11px]">{v}</label>
                  <input
                    type="text"
                    value={snippetVarValues[v] || ""}
                    onChange={(e) => setSnippetVarValues({ ...snippetVarValues, [v]: e.target.value })}
                    placeholder={`Nilai untuk {{${v}}}`}
                    className="w-full bg-[#161a26] border border-[#272d3e] rounded p-2 text-white"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button onClick={() => setSnippetVarModalOpen(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">
                Batal
              </button>
              <button
                onClick={() => {
                  let finalCmd = snippetTemplateCmd;
                  Object.entries(snippetVarValues).forEach(([k, v]) => {
                    finalCmd = finalCmd.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), v);
                  });
                  setSnippetVarModalOpen(false);
                  sendCmdToActiveTerminal(finalCmd);
                }}
                className="px-3 py-1.5 rounded bg-indigo-600 text-white font-medium"
              >
                Eksekusi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: TerminalApp,
});
