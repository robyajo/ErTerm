import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { useTabContext } from "@/context/tab-context";
import { DistroBadge } from "@/components/distro-badge";
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
  Folder,
  LayoutGrid,
  Tag,
  Calendar,
  List,
  Layers,
  Globe,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Sun,
  Moon,
} from "lucide-react";
import type {
  HostItem,
  FolderItem,
  TunnelItem,
  SshKeyItem,
  SnippetItem,
  SettingsData,
  LocalFileEntry,
} from "@/core/types";

interface ActiveTerminalTab {
  id: string;
  host: HostItem;
  ws?: WebSocket;
  term?: Terminal;
  fitAddon?: FitAddon;
}

// Default starter servers matching Termius screenshot
const SEED_FOLDERS: FolderItem[] = [
  { id: "grp_kominfo", name: "KOMINFO VPS", icon: "📁", color: "#3b82f6" },
  { id: "grp_mpp", name: "MPP SERVER", icon: "📁", color: "#6366f1" },
];

const SEED_HOSTS: HostItem[] = [
  { id: "h1", label: "FE SUPERAPP AMAN", type: "ssh", hostname: "10.10.1.20", port: 22, username: "kominfo2", folderId: "grp_kominfo", group: "KOMINFO VPS", osType: "ubuntu" },
  { id: "h2", label: "Bapenda Pajak MPP", type: "ssh", hostname: "10.10.2.14", port: 22, username: "p3kanbaru", folderId: "grp_mpp", group: "MPP SERVER", osType: "ubuntu" },
  { id: "h3", label: "AMAN SUPER APP |KOMINFO (MPP) P...", type: "ssh", hostname: "10.10.1.25", port: 22, username: "kominfo4", folderId: "grp_kominfo", group: "KOMINFO VPS", osType: "ubuntu" },
  { id: "h4", label: "VPS MITUNI", type: "ssh", hostname: "10.10.3.10", port: 22, username: "mituni", folderId: "grp_kominfo", group: "KOMINFO VPS", osType: "ubuntu" },
  { id: "h5", label: "VPS HOME ROBY", type: "ssh", hostname: "192.168.1.100", port: 22, username: "roby", folderId: null, group: "Default", osType: "ubuntu" },
  { id: "h6", label: "STUNTING SWEEPER", type: "ssh", hostname: "10.10.4.12", port: 22, username: "stunting", folderId: "grp_kominfo", group: "KOMINFO VPS", osType: "ubuntu" },
  { id: "h7", label: "ROBY DEV", type: "ssh", hostname: "192.168.1.101", port: 22, username: "roby", folderId: null, group: "Default", osType: "ubuntu" },
  { id: "h8", label: "Camp", type: "ssh", hostname: "10.10.5.15", port: 22, username: "camp", folderId: null, group: "Default", osType: "ubuntu" },
  { id: "h9", label: "OPD Pekanbaru", type: "ssh", hostname: "10.10.6.18", port: 22, username: "admin", folderId: "grp_kominfo", group: "KOMINFO VPS", osType: "ubuntu" },
  { id: "h10", label: "KOMINFO WEB OPD", type: "ssh", hostname: "10.10.6.20", port: 22, username: "admin", folderId: "grp_kominfo", group: "KOMINFO VPS", osType: "ubuntu" },
  { id: "h11", label: "Camp Server", type: "ssh", hostname: "10.10.5.16", port: 22, username: "camp", folderId: null, group: "Default", osType: "ubuntu" },
  { id: "h12", label: "Jobfair Pekanbaru Disnaker | KOMINFO", type: "ssh", hostname: "10.10.7.22", port: 22, username: "roby", folderId: "grp_kominfo", group: "KOMINFO VPS", osType: "ubuntu" },
  { id: "h13", label: "BIMA FE", type: "ssh", hostname: "10.10.8.30", port: 22, username: "bimafe", folderId: "grp_mpp", group: "MPP SERVER", osType: "ubuntu" },
  { id: "h14", label: "Jobfair No VPN", type: "ssh", hostname: "10.10.7.25", port: 22, username: "roby", folderId: null, group: "Default", osType: "ubuntu" },
  { id: "h15", label: "Pohon FE dan Silabus", type: "ssh", hostname: "10.10.9.40", port: 22, username: "roby", folderId: "grp_mpp", group: "MPP SERVER", osType: "server" },
  { id: "h16", label: "Silabus Dan Pohon", type: "ssh", hostname: "10.10.9.41", port: 22, username: "roby", folderId: "grp_mpp", group: "MPP SERVER", osType: "server" },
];

export function TerminalApp() {
  const {
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab: closeContextTab,
    activeNav,
    setActiveNav,
    theme,
    toggleTheme,
    setOnNewTabTrigger,
  } = useTabContext();

  const [hosts, setHosts] = useState<HostItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);
  const [tunnels, setTunnels] = useState<TunnelItem[]>([]);
  const [keys, setKeys] = useState<SshKeyItem[]>([]);
  const [settings, setSettings] = useState<SettingsData>({});
  const [appVersion, setAppVersion] = useState("1.0.4");

  const [searchHost, setSearchHost] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  // Terminal active tabs
  const [terminalTabs, setTerminalTabs] = useState<ActiveTerminalTab[]>([]);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const terminalRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // SFTP state
  const [sftpSessionId, setSftpSessionId] = useState<string | null>(null);
  const [sftpCurrentPath, setSftpCurrentPath] = useState("/");
  const [sftpSelectedHost, setSftpSelectedHost] = useState("");
  const [localDrives, setLocalDrives] = useState<string[]>([]);
  const [localPath, setLocalPath] = useState("");
  const [localFiles, setLocalFiles] = useState<LocalFileEntry[]>([]);
  const [remoteFiles, setRemoteFiles] = useState<
    Array<{ name: string; isDirectory: boolean; size: number; permissions?: string }>
  >([]);
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
    osType: "ubuntu",
    color: "#7b61ff",
  });

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderForm, setFolderForm] = useState<Partial<FolderItem>>({
    name: "",
    icon: "📁",
    color: "#3b82f6",
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
    enabled: false,
  });

  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyForm, setKeyForm] = useState<{ label: string; keyType: "ed25519" | "rsa" }>({
    label: "My SSH Key",
    keyType: "ed25519",
  });

  const [snippetVarModalOpen, setSnippetVarModalOpen] = useState(false);
  const [snippetTemplateCmd, setSnippetTemplateCmd] = useState("");
  const [snippetVariables, setSnippetVariables] = useState<string[]>([]);
  const [snippetVarValues, setSnippetVarValues] = useState<Record<string, string>>({});

  // Fetch initial data
  const loadAllData = async () => {
    try {
      const [hRes, fRes, sRes, tRes, kRes, setRes, sysRes] = await Promise.all([
        fetch("http://127.0.0.1:3980/api/hosts").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("http://127.0.0.1:3980/api/folders").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("http://127.0.0.1:3980/api/snippets").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("http://127.0.0.1:3980/api/tunnels").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("http://127.0.0.1:3980/api/keys").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("http://127.0.0.1:3980/api/settings").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("http://127.0.0.1:3980/api/system").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (hRes.success && hRes.hosts && hRes.hosts.length > 0) {
        setHosts(hRes.hosts);
      } else {
        setHosts(SEED_HOSTS);
      }

      if (fRes.success && fRes.folders && fRes.folders.length > 0) {
        setFolders(fRes.folders);
      } else {
        setFolders(SEED_FOLDERS);
      }

      if (sRes.success) setSnippets(sRes.snippets || []);
      if (tRes.success) setTunnels(tRes.tunnels || []);
      if (kRes.success) setKeys(kRes.keys || []);
      if (setRes.success) setSettings(setRes.settings || {});
      if (sysRes.success && sysRes.appVersion) setAppVersion(sysRes.appVersion);
    } catch (err) {
      console.warn("API load warning, falling back to local seed:", err);
      setHosts(SEED_HOSTS);
      setFolders(SEED_FOLDERS);
    }
  };

  useEffect(() => {
    loadAllData();
    loadLocalFiles();

    // Register top titlebar "+ New Tab" handler
    setOnNewTabTrigger(() => {
      const localHost: HostItem = {
        id: "local_" + Date.now(),
        label: "Local Shell",
        type: "local",
        shellType: "zsh",
        osType: "macos",
      };
      connectHost(localHost);
    });
  }, []);

  // Local filesystem explorer for SFTP
  const loadLocalFiles = async (dirPath?: string) => {
    try {
      const drivesRes = await fetch("http://127.0.0.1:3980/api/local/drives")
        .then((r) => r.json())
        .catch(() => ({ success: false }));
      if (drivesRes.success) setLocalDrives(drivesRes.drives || []);

      const listRes = await fetch("http://127.0.0.1:3980/api/local/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: dirPath }),
      })
        .then((r) => r.json())
        .catch(() => ({ success: false }));

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
    const newTab: ActiveTerminalTab = { id: tabId, host };

    setTerminalTabs((prev) => [...prev, newTab]);
    openTab({
      id: tabId,
      title: host.label,
      type: "terminal",
      host,
    });

    setTimeout(() => {
      initXterm(newTab);
    }, 150);
  };

  const initXterm = (tab: ActiveTerminalTab) => {
    const container = terminalRefs.current.get(tab.id);
    if (!container) return;

    container.innerHTML = "";

    const isDark = document.documentElement.classList.contains("dark");
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: settings.fontFamily || "Geist Mono, monospace",
      fontSize: settings.fontSize || 14,
      theme: {
        background: isDark ? "#0c0e14" : "#ffffff",
        foreground: isDark ? "#e2e8f0" : "#0f172a",
        cursor: "#6366f1",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(container);
    fitAddon.fit();

    const ws = new WebSocket("ws://127.0.0.1:3980");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "init",
          hostId: tab.host.id,
          host: tab.host,
          cols: term.cols,
          rows: term.rows,
        })
      );
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
        terminalTabs.forEach((t) => {
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

  const closeTerminalTab = (tabId: string) => {
    const tab = terminalTabs.find((t) => t.id === tabId);
    if (tab) {
      tab.ws?.close();
      tab.term?.dispose();
    }
    setTerminalTabs((prev) => prev.filter((t) => t.id !== tabId));
    closeContextTab(tabId);
  };

  const handleQuickConnect = (query: string) => {
    if (!query) return;
    // Check if query matches an existing host
    const match = hosts.find(
      (h) =>
        h.label.toLowerCase() === query.toLowerCase() ||
        h.hostname?.toLowerCase() === query.toLowerCase()
    );
    if (match) {
      connectHost(match);
      setSearchHost("");
      return;
    }

    // Otherwise connect as raw user@hostname or hostname
    let username = "root";
    let hostname = query;
    let port = 22;

    if (query.includes("@")) {
      const parts = query.split("@");
      username = parts[0];
      hostname = parts[1];
    }
    if (hostname.includes(":")) {
      const parts = hostname.split(":");
      hostname = parts[0];
      port = parseInt(parts[1], 10) || 22;
    }

    const tempHost: HostItem = {
      id: "quick_" + Date.now(),
      label: query,
      type: "ssh",
      hostname,
      username,
      port,
      authType: "password",
      osType: "ubuntu",
    };

    connectHost(tempHost);
    setSearchHost("");
  };

  // SFTP Functions
  const connectSftp = async (hostId: string) => {
    try {
      const res = await fetch("http://127.0.0.1:3980/api/sftp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId }),
      }).then((r) => r.json());

      if (res.success) {
        setSftpSessionId(res.sessionId);
        setSftpCurrentPath(res.initialPath || "/");
        loadRemoteFiles(res.sessionId, res.initialPath || "/");
      } else {
        alert("SFTP Gagal: " + (res.error || "Gagal menghubungi server"));
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
        body: JSON.stringify({ sessionId, path }),
      }).then((r) => r.json());

      if (res.success) {
        setSftpCurrentPath(res.path);
        setRemoteFiles(res.items || []);
      }
    } catch (e) {
      console.error("Remote files list error:", e);
    }
  };

  // Filtered hosts
  const filteredHosts = hosts.filter((h) => {
    const matchGroup =
      activeGroup === "All" ||
      h.group === activeGroup ||
      (folders.find((f) => f.name === activeGroup)?.id === h.folderId);
    const matchQuery =
      !searchHost ||
      h.label.toLowerCase().includes(searchHost.toLowerCase()) ||
      (h.hostname && h.hostname.toLowerCase().includes(searchHost.toLowerCase())) ||
      (h.username && h.username.toLowerCase().includes(searchHost.toLowerCase()));
    return matchGroup && matchQuery;
  });

  return (
    <div className="flex h-full w-full bg-[#f0f2f6] dark:bg-[#0a0d18] text-slate-800 dark:text-slate-100 overflow-hidden select-none font-sans transition-colors duration-200">
      {/* Sidebar Navigation - Termius Authentic Layout */}
      <aside className="w-48 bg-[#f4f5f8] dark:bg-[#101420] border-r border-slate-200 dark:border-[#1e2330] flex flex-col justify-between flex-shrink-0 transition-colors duration-200">
        <div className="p-2 space-y-1">
          {/* Hosts Item */}
          <button
            onClick={() => {
              setActiveTabId(null);
              setActiveNav("hosts");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeNav === "hosts" && activeTabId === null
                ? "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
            }`}
          >
            <Layers size={17} className={activeNav === "hosts" ? "text-indigo-600 dark:text-indigo-400" : ""} />
            <span>Hosts</span>
          </button>

          {/* Keychain Item */}
          <button
            onClick={() => {
              setActiveTabId(null);
              setActiveNav("keychain");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeNav === "keychain" && activeTabId === null
                ? "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
            }`}
          >
            <KeyRound size={17} className={activeNav === "keychain" ? "text-indigo-600 dark:text-indigo-400" : ""} />
            <span>Keychain</span>
          </button>

          {/* Port Forwarding Item */}
          <button
            onClick={() => {
              setActiveTabId(null);
              setActiveNav("tunnels");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeNav === "tunnels" && activeTabId === null
                ? "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
            }`}
          >
            <Network size={17} className={activeNav === "tunnels" ? "text-indigo-600 dark:text-indigo-400" : ""} />
            <span>Port Forwarding</span>
          </button>

          {/* Snippets Item */}
          <button
            onClick={() => {
              setActiveTabId(null);
              setActiveNav("snippets");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeNav === "snippets" && activeTabId === null
                ? "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
            }`}
          >
            <FileCode size={17} className={activeNav === "snippets" ? "text-indigo-600 dark:text-indigo-400" : ""} />
            <span>Snippets</span>
          </button>

          {/* Known Hosts Item */}
          <button
            onClick={() => {
              setActiveTabId(null);
              setActiveNav("known_hosts");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeNav === "known_hosts" && activeTabId === null
                ? "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
            }`}
          >
            <Globe size={17} className={activeNav === "known_hosts" ? "text-indigo-600 dark:text-indigo-400" : ""} />
            <span>Known Hosts</span>
          </button>

          {/* Logs Item */}
          <button
            onClick={() => {
              setActiveTabId(null);
              setActiveNav("logs");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeNav === "logs" && activeTabId === null
                ? "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
            }`}
          >
            <Clock size={17} className={activeNav === "logs" ? "text-indigo-600 dark:text-indigo-400" : ""} />
            <span>Logs</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1e2330] flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-sans">Core Active</span>
          </div>
          <span className="text-[10px] text-slate-400">:3980</span>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* If an active terminal or SFTP tab is selected, render it full screen */}
        {activeTabId === "sftp_tab" ? (
          <div className="h-full flex flex-col p-4 overflow-hidden bg-white dark:bg-[#0c0e14]">
            {/* SFTP View */}
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
                        className="p-1.5 flex items-center justify-between rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer"
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
        ) : activeTabId !== null ? (
          /* Terminal View */
          <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-[#0c0e14]">
            {/* Terminal Actions Bar */}
            <div className="h-9 bg-slate-100 dark:bg-[#121620] border-b border-slate-200 dark:border-[#1e2330] px-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <TerminalIcon size={13} className="text-indigo-500" />
                <span>Active Session:</span>
                <span className="text-slate-800 dark:text-white font-bold">
                  {terminalTabs.find((t) => t.id === activeTabId)?.host.label || "Terminal"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBroadcastEnabled(!broadcastEnabled)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    broadcastEnabled
                      ? "bg-rose-500/20 text-rose-500 border border-rose-500/40 font-bold animate-pulse"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white"
                  }`}
                >
                  <Radio size={12} />
                  <span>{broadcastEnabled ? "Broadcast ON" : "Broadcast OFF"}</span>
                </button>

                <button
                  onClick={() => {
                    const tab = terminalTabs.find((t) => t.id === activeTabId);
                    if (tab && tab.fitAddon) tab.fitAddon.fit();
                  }}
                  className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="Fit Terminal Size"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            {/* Terminal Containers */}
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#0c0e14]">
              {terminalTabs.map((tab) => (
                <div
                  key={tab.id}
                  ref={(el) => {
                    if (el) terminalRefs.current.set(tab.id, el);
                    else terminalRefs.current.delete(tab.id);
                  }}
                  className={`absolute inset-0 p-2.5 ${activeTabId === tab.id ? "block" : "hidden"}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Dashboard Main Overview (Hosts / Termius Layout) */
          <div className="h-full flex flex-col overflow-y-auto">
            {activeNav === "hosts" && (
              <>
                {/* Omni-Search & Sub-Action Bar matching the screenshot */}
                <div className="p-4 pb-2 space-y-3">
                  {/* Omni-Search Bar */}
                  <div className="relative flex items-center w-full bg-white dark:bg-[#131826] border border-slate-200/90 dark:border-[#21293f] rounded-xl shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all p-1">
                    <input
                      type="text"
                      value={searchHost}
                      onChange={(e) => setSearchHost(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchHost.trim()) {
                          handleQuickConnect(searchHost.trim());
                        }
                      }}
                      placeholder="Find a host or ssh user@hostname..."
                      className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                    />
                    <button
                      onClick={() => handleQuickConnect(searchHost.trim())}
                      disabled={!searchHost.trim()}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-indigo-600 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 transition-colors mr-1"
                    >
                      Connect
                    </button>
                  </div>

                  {/* Sub-Action Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Split Button: + New host ∨ */}
                      <div className="relative flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-medium border border-slate-300/60 dark:border-slate-700/60 shadow-2xs">
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
                              osType: "ubuntu",
                            });
                            setHostModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-colors rounded-l-xl"
                        >
                          <Plus size={14} />
                          <span>New host</span>
                        </button>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                        <button
                          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                          className="px-2 py-1.5 hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-colors rounded-r-xl"
                        >
                          <ChevronDown size={13} />
                        </button>

                        {/* Quick Menu Dropdown */}
                        {quickMenuOpen && (
                          <div className="absolute top-9 left-0 w-44 bg-white dark:bg-[#161a26] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1 z-50 text-xs font-sans">
                            <button
                              onClick={() => {
                                setQuickMenuOpen(false);
                                setFolderForm({ name: "", icon: "📁", color: "#3b82f6" });
                                setFolderModalOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-200"
                            >
                              <FolderPlus size={14} />
                              <span>+ New Group / Folder</span>
                            </button>
                            <button
                              onClick={() => {
                                setQuickMenuOpen(false);
                                setSshConfigModalOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-slate-700 dark:text-slate-200"
                            >
                              <Download size={14} />
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-transparent hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                      >
                        <TerminalIcon size={14} />
                        <span>Serial</span>
                      </button>
                    </div>

                    {/* Right View Toggles & User Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                        <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                          <LayoutGrid size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                          <Tag size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                          <Calendar size={15} />
                        </button>
                      </div>

                      {/* User Avatar Badge with + */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          RK
                        </div>
                        <div
                          onClick={() => {
                            setHostForm({ label: "", type: "ssh", hostname: "", port: 22, username: "", authType: "password", password: "", folderId: null, osType: "ubuntu" });
                            setHostModalOpen(true);
                          }}
                          className="h-5 w-5 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
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
                  <div className="px-4 mt-2 mb-4">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Groups
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {folders.map((folder) => {
                        const count = hosts.filter(
                          (h) => h.folderId === folder.id || h.group === folder.name
                        ).length;
                        const isFilterActive = activeGroup === folder.name;
                        return (
                          <div
                            key={folder.id}
                            onClick={() => setActiveGroup(isFilterActive ? "All" : folder.name)}
                            className={`flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#141926] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                              isFilterActive
                                ? "border-indigo-500 ring-2 ring-indigo-500/20"
                                : "border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            <div className="h-10 w-10 rounded-xl bg-[#14284b] dark:bg-[#1a2b4a] flex items-center justify-center text-sky-400 flex-shrink-0">
                              <Folder size={18} className="fill-sky-400/20 text-sky-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                {folder.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {count} Hosts
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section: Hosts (3-Column Grid) */}
                <div className="px-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Hosts {activeGroup !== "All" && `(${activeGroup})`}
                    </div>
                    {activeGroup !== "All" && (
                      <button
                        onClick={() => setActiveGroup("All")}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Show All ({hosts.length})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredHosts.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => connectHost(h)}
                        className="group relative flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400/80 dark:hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* OS Distro Badge (Ubuntu / Server) */}
                          <DistroBadge osType={h.osType} label={h.label} hostname={h.hostname} />

                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {h.label}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                              {h.type === "ssh"
                                ? `ssh, ${h.username || "root"}`
                                : `Local Shell (${h.shellType || "zsh"})`}
                            </div>
                          </div>
                        </div>

                        {/* Hover Action Buttons */}
                        <div
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {h.type === "ssh" && (
                            <button
                              onClick={() => {
                                setSftpSelectedHost(h.id);
                                connectSftp(h.id);
                                openTab({ id: "sftp_tab", title: "SFTP", type: "sftp" });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Open SFTP"
                            >
                              <FolderSync size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setHostForm(h);
                              setHostModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Host"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* View: Keychain */}
            {activeNav === "keychain" && (
              <div className="p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Keychain & SSH Keys</h2>
                    <p className="text-xs text-slate-500">Kelola kunci kriptografis Ed25519 dan RSA untuk otentikasi SSH tanpa password.</p>
                  </div>
                  <button
                    onClick={() => setKeyModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
                  >
                    <Plus size={14} />
                    <span>Generate Key</span>
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keys.map((k) => (
                    <div key={k.id} className="p-4 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{k.label}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">{k.keyType}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(k.publicKey || "");
                            alert("Kunci publik berhasil disalin ke clipboard!");
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          <Copy size={12} />
                          <span>Copy Public Key</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Tunnels */}
            {activeNav === "tunnels" && (
              <div className="p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Port Forwarding & SSH Tunnels</h2>
                    <p className="text-xs text-slate-500">Pengalihan port lokal, remote, dan dynamic SOCKS5 proxy.</p>
                  </div>
                  <button
                    onClick={() => setTunnelModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
                  >
                    <Plus size={14} />
                    <span>New Tunnel</span>
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {tunnels.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{t.label}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                          {t.tunnelType.toUpperCase()} : {t.localPort} ➔ {t.remoteHost}:{t.remotePort}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${t.enabled ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                        {t.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Snippets */}
            {activeNav === "snippets" && (
              <div className="p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Snippets Library</h2>
                    <p className="text-xs text-slate-500">Perintah cepat dengan template variabel otomatis.</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {snippets.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{s.title}</div>
                      <code className="text-xs font-mono text-indigo-500 block mt-1 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg">
                        {s.command}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Known Hosts */}
            {activeNav === "known_hosts" && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Known Hosts & Fingerprints</h2>
                <p className="text-xs text-slate-500 mb-4">Daftar kunci sidik jari server SSH yang telah diverifikasi.</p>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-white">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>Host Key Fingerprint Registry Verified</span>
                  </div>
                  <p className="text-slate-500">Seluruh sesi koneksi diverifikasi secara kriptografis melalui mesin SSH2.</p>
                </div>
              </div>
            )}

            {/* View: Logs */}
            {activeNav === "logs" && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Session Logs</h2>
                <p className="text-xs text-slate-500 mb-4">Riwayat log terminal dan aktivitas koneksi.</p>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500">
                  Belum ada log sesi yang tersimpan. Klik "Save Log" saat sesi terminal sedang aktif.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Host Modal */}
      {hostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#161c2a] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-800 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">
                {hostForm.id ? "Edit Host" : "Tambah Host Baru"}
              </h3>
              <button onClick={() => setHostModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Label / Nama Server</label>
                <input
                  type="text"
                  value={hostForm.label || ""}
                  onChange={(e) => setHostForm({ ...hostForm, label: e.target.value })}
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
                    onChange={(e) => setHostForm({ ...hostForm, hostname: e.target.value })}
                    placeholder="10.10.1.20"
                    className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Port</label>
                  <input
                    type="number"
                    value={hostForm.port || 22}
                    onChange={(e) => setHostForm({ ...hostForm, port: parseInt(e.target.value, 10) || 22 })}
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
                    onChange={(e) => setHostForm({ ...hostForm, username: e.target.value })}
                    placeholder="kominfo2"
                    className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Distro OS</label>
                  <select
                    value={hostForm.osType || "ubuntu"}
                    onChange={(e) => setHostForm({ ...hostForm, osType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="ubuntu">Ubuntu</option>
                    <option value="server">Server Rack</option>
                    <option value="windows">Windows</option>
                    <option value="macos">macOS</option>
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
                    setHostForm({
                      ...hostForm,
                      folderId: fid,
                      group: folder ? folder.name : "Default",
                    });
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
                  onChange={(e) => setHostForm({ ...hostForm, password: e.target.value })}
                  placeholder="Password SSH"
                  className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setHostModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={async () => {
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
                  };

                  try {
                    await fetch("http://127.0.0.1:3980/api/hosts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newHost),
                    });
                  } catch {}

                  setHosts((prev) => {
                    const exists = prev.some((h) => h.id === newHost.id);
                    if (exists) return prev.map((h) => (h.id === newHost.id ? newHost : h));
                    return [...prev, newHost];
                  });

                  setHostModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder / Group Modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#161c2a] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-slate-800 dark:text-white">
            <h3 className="font-bold text-base mb-3">Tambah Group Baru</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Nama Group</label>
                <input
                  type="text"
                  value={folderForm.name || ""}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  placeholder="Mis: KOMINFO VPS"
                  className="w-full bg-slate-50 dark:bg-[#111624] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setFolderModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (!folderForm.name) return;
                  const newFolder: FolderItem = {
                    id: "grp_" + Date.now(),
                    name: folderForm.name,
                    icon: "📁",
                    color: "#3b82f6",
                  };
                  try {
                    await fetch("http://127.0.0.1:3980/api/folders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newFolder),
                    });
                  } catch {}
                  setFolders((prev) => [...prev, newFolder]);
                  setFolderModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import SSH Config Modal */}
      {sshConfigModalOpen && (
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
                onClick={() => setSshConfigModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
              >
                Tutup
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("http://127.0.0.1:3980/api/hosts/import-ssh-config", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ customPath: sshConfigPath || undefined }),
                    }).then((r) => r.json());
                    if (res.success) {
                      setSshConfigResult(`Berhasil mengimpor ${res.count || 0} host.`);
                      loadAllData();
                    } else {
                      setSshConfigResult("Gagal: " + (res.error || "Gagal membaca berkas"));
                    }
                  } catch (e) {
                    setSshConfigResult("Error: " + e);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Mulai Impor
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
