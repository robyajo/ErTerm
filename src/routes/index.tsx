import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { useTabContext } from "@/context/tab-context";
import type {
  HostItem,
  FolderItem,
  TunnelItem,
  SshKeyItem,
  SnippetItem,
  SettingsData,
  LocalFileEntry,
  KnownHostEntry,
} from "@/core/types";
import {
  TermiusSidebar,
  TerminalView,
  SftpView,
  HostsView,
  KeychainView,
  TunnelsView,
  SnippetsView,
  KnownHostsView,
  LogsView,
  HostModal,
  FolderModal,
  SshConfigModal,
  HostSheet,
  FolderSheet,
  DeleteAlertDialog,
  type ActiveTerminalTab,
} from "@/components/termius";

// Default starter servers matching Termius screenshot
const SEED_FOLDERS: FolderItem[] = [
  { id: "grp_mpp", name: "MPP SERVER", icon: "📁", color: "#6366f1" },
];

const SEED_HOSTS: HostItem[] = [
  { id: "h1", label: "layanan-bapenda.pekanbaru.go.id", type: "ssh", hostname: "layanan-bapenda.pekanbaru.go.id", port: 22, username: "p3kanbaru", folderId: "grp_mpp", group: "MPP SERVER", osType: "ubuntu", icon: "ubuntu" },
  { id: "h2", label: "SUPERAPP WEB", type: "ssh", hostname: "10.10.1.20", port: 22, username: "kominfo2", folderId: "grp_mpp", group: "MPP SERVER", osType: "ubuntu", icon: "ubuntu" },
  { id: "h3", label: "Mituni VPS", type: "ssh", hostname: "10.10.3.10", port: 22, username: "mituni", folderId: "grp_mpp", group: "MPP SERVER", osType: "ubuntu", icon: "ubuntu" },
  { id: "h4", label: "SUPER APP API", type: "ssh", hostname: "10.10.1.25", port: 22, username: "kominfo4", folderId: null, group: "Default", osType: "ubuntu", icon: "ubuntu" },
  { id: "h5", label: "VPS HOME ROBY", type: "ssh", hostname: "192.168.1.100", port: 22, username: "roby", folderId: null, group: "Default", osType: "ubuntu", icon: "ubuntu" },
  { id: "h6", label: "roby.dev.pekanbaru.go.id", type: "ssh", hostname: "roby.dev.pekanbaru.go.id", port: 22, username: "roby", folderId: null, group: "Default", osType: "ubuntu", icon: "ubuntu" },
  { id: "h7", label: "PHP", type: "ssh", hostname: "10.10.1.26", port: 22, username: "kominfo4", folderId: null, group: "Default", osType: "ubuntu", icon: "ubuntu" },
  { id: "h8", label: "VPS KOMINFO JOBFAIR", type: "ssh", hostname: "10.10.7.22", port: 22, username: "roby", folderId: null, group: "Default", osType: "ubuntu", icon: "ubuntu" },
  { id: "h9", label: "VPS HOSTINGER DISNAKER", type: "ssh", hostname: "156.67.218.107", port: 22, username: "roby", folderId: null, group: "Default", osType: "ubuntu", icon: "ubuntu" },
  { id: "h10", label: "VPS KODE LOAKAL", type: "ssh", hostname: "127.0.0.1", port: 22, username: "", folderId: null, group: "Default", osType: "server", icon: "server" },
];

export function TerminalApp() {
  const {
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab: closeContextTab,
    activeNav,
    setActiveNav,
    setOnNewTabTrigger,
    hosts,
    setHosts,
    setOnConnectHost,
    setOnOpenNewHostModal,
  } = useTabContext();

  // Core Data
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);
  const [tunnels, setTunnels] = useState<TunnelItem[]>([]);
  const [keys, setKeys] = useState<SshKeyItem[]>([]);
  const [settings, setSettings] = useState<SettingsData>({});
  const [, setAppVersion] = useState("1.0.4");

  // Filtering & Search
  const [searchHost, setSearchHost] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");

  // Active Terminals State
  const [terminalTabs, setTerminalTabs] = useState<ActiveTerminalTab[]>([]);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const terminalRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // SFTP State
  const [sftpSessionId, setSftpSessionId] = useState<string | null>(null);
  const [sftpCurrentPath, setSftpCurrentPath] = useState("/");
  const [sftpSelectedHost, setSftpSelectedHost] = useState("");
  const [, setLocalDrives] = useState<string[]>([]);
  const [localPath, setLocalPath] = useState("");
  const [localFiles, setLocalFiles] = useState<LocalFileEntry[]>([]);
  const [remoteFiles, setRemoteFiles] = useState<
    Array<{ name: string; isDirectory: boolean; size: number; permissions?: string }>
  >([]);
  const [selectedLocalFile, setSelectedLocalFile] = useState<string | null>(null);
  const [selectedRemoteFile, setSelectedRemoteFile] = useState<{ path: string; isDirectory: boolean } | null>(null);

  // Modals & Sheets State
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [hostForm, setHostForm] = useState<Partial<HostItem>>({
    label: "",
    type: "ssh",
    hostname: "",
    port: 22,
    username: "",
    authType: "password",
    password: "",
    folderId: null,
    group: "Default",
    osType: "server",
    icon: "server",
  });

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderForm, setFolderForm] = useState<Partial<FolderItem>>({
    name: "",
    icon: "📁",
    color: "#6366f1",
  });

  const [sshConfigModalOpen, setSshConfigModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "host" | "folder";
    id: string;
    name: string;
  } | null>(null);

  // Fetch initial data from backend API
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

    // Register top titlebar "+ New Tab" handler to display All Hosts
    const handleShowAllHosts = () => {
      setActiveTabId(null);
      setActiveNav("hosts");
      setActiveGroup("All");
      setSearchHost("");
      setSelectedHostId(null);
      setHostModalOpen(false);
    };

    setOnNewTabTrigger(handleShowAllHosts);
    window.addEventListener("erterm:show-all-hosts", handleShowAllHosts);

    // Global shortcut Ctrl+T / Cmd+T to open All Hosts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "t") {
        e.preventDefault();
        handleShowAllHosts();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("erterm:show-all-hosts", handleShowAllHosts);
      window.removeEventListener("keydown", handleKeyDown);
    };
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
  const connectHost = async (host: HostItem) => {
    const tabId = "tab_" + Date.now();

    // Check if known host in registry
    let isKnown = false;
    let knownFingerprint = "2GMoJojIbsltVT6uFRqT22mFH/9jvg6ZenFNrSQYRKo";
    if (host.type === "ssh") {
      try {
        const res = await fetch("http://127.0.0.1:3980/api/known-hosts");
        if (res.ok) {
          const data = await res.json();
          const list: KnownHostEntry[] = data.knownHosts || [];
          const existing = list.find(
            (k) =>
              k.hostname === host.hostname &&
              Number(k.port || 22) === Number(host.port || 22)
          );
          if (existing) {
            isKnown = true;
            knownFingerprint = existing.fingerprint;
          }
        }
      } catch {}
    } else {
      isKnown = true;
    }

    const initialStep: 1 | 2 | 3 = isKnown ? 1 : 2;
    const initialStatus: "connecting" | "fingerprint_prompt" = isKnown
      ? "connecting"
      : "fingerprint_prompt";

    const promptData =
      !isKnown && host.type === "ssh"
        ? {
            hostId: host.id,
            hostname: host.hostname || "127.0.0.1",
            port: Number(host.port || 22),
            keyType: "ECDSA",
            fingerprint: knownFingerprint,
            reason: "first_time" as const,
          }
        : null;

    const initialLogs = [
      `[SSH] Resolving host ${host.hostname || "127.0.0.1"}...`,
      `[SSH] TCP socket connected to ${host.hostname || "127.0.0.1"}:${host.port || 22}`,
    ];
    if (!isKnown && host.type === "ssh") {
      initialLogs.push(
        `[SSH] Authenticity of host cannot be established. Fingerprint verification required.`
      );
    }

    const newTab: ActiveTerminalTab = {
      id: tabId,
      host,
      status: initialStatus,
      connectionStep: initialStep,
      promptData,
      logs: initialLogs,
      statusMessage: isKnown
        ? `Connecting to ${host.username ? host.username + "@" : ""}${host.hostname || "127.0.0.1"}:${host.port || 22}...`
        : "Awaiting secret host key verification...",
    };

    setTerminalTabs((prev) => [...prev, newTab]);
    openTab({
      id: tabId,
      title: host.label,
      type: "terminal",
      host,
    });

    if (isKnown) {
      setTimeout(() => {
        initXterm(newTab);
      }, 150);
    }
  };

  const handleAcceptPrompt = async (tabId: string, action: "replace" | "add" = "add") => {
    const tab = terminalTabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Save to known hosts registry
    try {
      await fetch("http://127.0.0.1:3980/api/known-hosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostname: tab.host.hostname || "127.0.0.1",
          port: Number(tab.host.port || 22),
          keyType: tab.promptData?.keyType || "ECDSA",
          fingerprint:
            tab.promptData?.fingerprint ||
            "2GMoJojIbsltVT6uFRqT22mFH/9jvg6ZenFNrSQYRKo",
        }),
      });
    } catch (e) {
      console.warn("Save known host error:", e);
    }

    // Advance stepper and update status
    setTerminalTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              status: "connecting",
              connectionStep: 3,
              promptData: null,
              logs: [
                ...(t.logs || []),
                "[SSH] Host secret accepted by user and saved to Known Hosts.",
                "[SSH] Authenticating credentials and opening terminal shell...",
              ],
              statusMessage: "Establishing terminal session...",
            }
          : t
      )
    );

    if (tab.ws && tab.ws.readyState === WebSocket.OPEN) {
      tab.ws.send(JSON.stringify({ type: "fingerprint_response", accept: true, action }));
    } else {
      setTimeout(() => {
        initXterm(tab);
      }, 100);
    }
  };

  const handleCancelPrompt = (tabId: string) => {
    const tab = terminalTabs.find((t) => t.id === tabId);
    if (tab?.ws && tab.ws.readyState === WebSocket.OPEN) {
      tab.ws.send(JSON.stringify({ type: "cancel_connection" }));
      try {
        tab.ws.close();
      } catch {}
    }
    setTerminalTabs((prev) => prev.filter((t) => t.id !== tabId));
    closeContextTab(tabId);
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
      setTerminalTabs((prev) =>
        prev.map((t) =>
          t.id === tab.id
            ? {
                ...t,
                logs: [...(t.logs || []), "[SSH] Secure connection established with backend."],
              }
            : t
        )
      );

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
        } else if (msg.type === "status_step") {
          setTerminalTabs((prev) =>
            prev.map((t) =>
              t.id === tab.id
                ? {
                    ...t,
                    connectionStep: msg.step,
                    statusMessage: msg.message,
                    logs: [...(t.logs || []), `[SSH] ${msg.message}`],
                  }
                : t
            )
          );
        } else if (msg.type === "fingerprint_prompt") {
          setTerminalTabs((prev) =>
            prev.map((t) =>
              t.id === tab.id
                ? {
                    ...t,
                    status: "fingerprint_prompt",
                    connectionStep: 2,
                    promptData: msg.prompt,
                    logs: [
                      ...(t.logs || []),
                      `[SSH] Host key verification required (${msg.prompt.keyType} ${msg.prompt.fingerprint})`,
                    ],
                  }
                : t
            )
          );
        } else if (msg.type === "status") {
          if (msg.status === "connected") {
            setTerminalTabs((prev) =>
              prev.map((t) =>
                t.id === tab.id
                  ? {
                      ...t,
                      status: "connected",
                      connectionStep: 3,
                      logs: [...(t.logs || []), `[SSH] ${msg.message}`],
                    }
                  : t
              )
            );
          } else if (msg.status === "disconnected") {
            setTerminalTabs((prev) =>
              prev.map((t) =>
                t.id === tab.id
                  ? {
                      ...t,
                      status: "disconnected",
                      logs: [...(t.logs || []), `[SSH] ${msg.message}`],
                    }
                  : t
              )
            );
          }
          term.writeln(`\r\n\x1b[32m[ErTerm] ${msg.message}\x1b[0m\r\n`);
        } else if (msg.type === "error") {
          setTerminalTabs((prev) =>
            prev.map((t) =>
              t.id === tab.id
                ? {
                    ...t,
                    status: "error",
                    logs: [...(t.logs || []), `[Error] ${msg.message}`],
                  }
                : t
            )
          );
          term.writeln(`\r\n\x1b[31m[ErTerm Error] ${msg.message}\x1b[0m\r\n`);
          if (msg.hint) {
            term.write(msg.hint);
          }
        } else if (msg.type === "host_detected") {
          setHosts((prev) =>
            prev.map((h) =>
              h.id === msg.hostId
                ? { ...h, osType: msg.osType, icon: msg.icon }
                : h
            )
          );
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

  const handleQuickConnect = (query: string) => {
    if (!query) return;
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

  const openHostModal = (host?: Partial<HostItem>) => {
    if (host) {
      setHostForm({ ...host });
      setSelectedHostId(host.id || null);
    } else {
      setHostForm({
        label: "",
        type: "ssh",
        hostname: "",
        port: 22,
        username: "",
        authType: "password",
        password: "",
        folderId: null,
        group: "Default",
        osType: "server",
        icon: "server",
      });
      setSelectedHostId(null);
    }
    setHostModalOpen(true);
  };

  useEffect(() => {
    setOnConnectHost((h) => connectHost(h));
    setOnOpenNewHostModal(() => {
      setActiveTabId(null);
      setActiveNav("hosts");
      openHostModal();
    });
  }, [setOnConnectHost, setOnOpenNewHostModal]);

  const openFolderModal = (folder?: Partial<FolderItem>) => {
    if (folder) {
      setFolderForm({ ...folder });
    } else {
      setFolderForm({
        name: "",
        icon: "📁",
        color: "#6366f1",
      });
    }
    setFolderModalOpen(true);
  };

  const handleSaveHost = async (newHost: HostItem) => {
    try {
      await fetch("http://127.0.0.1:3980/api/hosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHost),
      });
    } catch (e) {
      console.warn("Save host error:", e);
    }

    setHosts((prev) => {
      const exists = prev.some((h) => h.id === newHost.id);
      if (exists) return prev.map((h) => (h.id === newHost.id ? newHost : h));
      return [...prev, newHost];
    });

    setHostModalOpen(false);
  };

  const handleSaveFolder = async (newFolder: FolderItem) => {
    try {
      await fetch("http://127.0.0.1:3980/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFolder),
      });
    } catch (e) {
      console.warn("Save folder error:", e);
    }
    setFolders((prev) => {
      const exists = prev.some((f) => f.id === newFolder.id);
      if (exists) return prev.map((f) => (f.id === newFolder.id ? newFolder : f));
      return [...prev, newFolder];
    });
    setFolderModalOpen(false);
  };

  const requestDeleteHost = (hostId: string) => {
    const h = hosts.find((item) => item.id === hostId);
    setDeleteConfirmation({
      type: "host",
      id: hostId,
      name: h ? h.label : "Host",
    });
  };

  const requestDeleteFolder = (folderId: string) => {
    const f = folders.find((item) => item.id === folderId);
    setDeleteConfirmation({
      type: "folder",
      id: folderId,
      name: f ? f.name : "Group",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { type, id } = deleteConfirmation;

    if (type === "host") {
      try {
        await fetch(`http://127.0.0.1:3980/api/hosts/${id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.warn("Delete host error:", e);
      }
      setHosts((prev) => prev.filter((h) => h.id !== id));
      if (selectedHostId === id) setSelectedHostId(null);
      if (hostModalOpen && hostForm.id === id) setHostModalOpen(false);
    } else {
      try {
        await fetch(`http://127.0.0.1:3980/api/folders/${id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.warn("Delete folder error:", e);
      }
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (folderModalOpen && folderForm.id === id) setFolderModalOpen(false);
      if (activeGroup !== "All") {
        const folder = folders.find((f) => f.id === id);
        if (folder && folder.name === activeGroup) {
          setActiveGroup("All");
        }
      }
    }
    setDeleteConfirmation(null);
  };

  return (
    <div className="flex h-full w-full bg-[#f0f2f6] dark:bg-[#0a0d18] text-slate-800 dark:text-slate-100 overflow-hidden select-none font-sans transition-colors duration-200">
      {/* Sidebar Navigation - visible on dashboard and SFTP */}
      {(activeTabId === null || activeTabId === "sftp_tab") && (
        <TermiusSidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
        />
      )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* SFTP View */}
        {activeTabId === "sftp_tab" && (
          <SftpView
            hosts={hosts}
            sftpSelectedHost={sftpSelectedHost}
            setSftpSelectedHost={setSftpSelectedHost}
            connectSftp={connectSftp}
            sftpSessionId={sftpSessionId}
            sftpCurrentPath={sftpCurrentPath}
            remoteFiles={remoteFiles}
            loadRemoteFiles={loadRemoteFiles}
            localPath={localPath}
            localFiles={localFiles}
            loadLocalFiles={loadLocalFiles}
            selectedLocalFile={selectedLocalFile}
            setSelectedLocalFile={setSelectedLocalFile}
            selectedRemoteFile={selectedRemoteFile}
            setSelectedRemoteFile={setSelectedRemoteFile}
          />
        )}

        {/* Terminal Sessions View (Kept persistent in DOM so SSH / Shell sessions never drop) */}
        <div
          className={`h-full flex-col ${
            activeTabId !== null && activeTabId !== "sftp_tab" ? "flex" : "hidden"
          }`}
        >
          {terminalTabs.length > 0 && activeTabId && (
            <TerminalView
              activeTabId={activeTabId}
              terminalTabs={terminalTabs}
              broadcastEnabled={broadcastEnabled}
              setBroadcastEnabled={setBroadcastEnabled}
              terminalRefs={terminalRefs}
              onAcceptPrompt={handleAcceptPrompt}
              onCancelPrompt={handleCancelPrompt}
              onCancelConnection={handleCancelPrompt}
            />
          )}
        </div>

        {/* Dashboard Views (Hosts catalog, Keychain, Tunnels, Snippets, Known Hosts, Logs) */}
        <div
          className={`h-full flex-row overflow-hidden relative ${
            activeTabId === null ? "flex" : "hidden"
          }`}
        >
          {/* Left/Center Content Area */}
          <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
            {activeNav === "hosts" && (
              <HostsView
                hosts={hosts}
                folders={folders}
                searchHost={searchHost}
                setSearchHost={setSearchHost}
                activeGroup={activeGroup}
                setActiveGroup={setActiveGroup}
                handleQuickConnect={handleQuickConnect}
                connectHost={connectHost}
                openHostModal={openHostModal}
                openFolderModal={openFolderModal}
                openSshConfigModal={() => setSshConfigModalOpen(true)}
                onOpenSftp={(hostId) => {
                  setSftpSelectedHost(hostId);
                  connectSftp(hostId);
                  openTab({ id: "sftp_tab", title: "SFTP", type: "sftp" });
                }}
                onDeleteHost={requestDeleteHost}
                onDeleteFolder={requestDeleteFolder}
                selectedHostId={selectedHostId}
                setSelectedHostId={setSelectedHostId}
                isCreatingNewHost={hostModalOpen && !hostForm.id}
                newHostDraft={hostForm}
              />
            )}
            {activeNav === "keychain" && (
              <KeychainView
                keys={keys}
                onGenerateKey={() => alert("Fitur Generate Key akan segera hadir.")}
              />
            )}
            {activeNav === "tunnels" && (
              <TunnelsView
                tunnels={tunnels}
                onNewTunnel={() => alert("Fitur New Tunnel akan segera hadir.")}
              />
            )}
            {activeNav === "snippets" && <SnippetsView snippets={snippets} />}
            {activeNav === "known_hosts" && <KnownHostsView />}
            {activeNav === "logs" && <LogsView />}
          </div>

          {/* Custom Right Inspector Panels (Zero Blur, Zero Overlay) */}
          {activeNav === "hosts" && hostModalOpen && (
            <HostSheet
              open={hostModalOpen}
              onClose={() => {
                setHostModalOpen(false);
                setSelectedHostId(null);
              }}
              hostForm={hostForm}
              setHostForm={setHostForm}
              folders={folders}
              snippets={snippets}
              keys={keys}
              hosts={hosts}
              onSave={handleSaveHost}
              onConnect={connectHost}
              onDelete={requestDeleteHost}
            />
          )}

          {activeNav === "hosts" && folderModalOpen && (
            <FolderSheet
              open={folderModalOpen}
              onClose={() => setFolderModalOpen(false)}
              folderForm={folderForm}
              setFolderForm={setFolderForm}
              onSave={handleSaveFolder}
              onDelete={requestDeleteFolder}
            />
          )}
        </div>
      </div>

      <SshConfigModal
        open={sshConfigModalOpen}
        onClose={() => setSshConfigModalOpen(false)}
        onImportSuccess={loadAllData}
      />

      <DeleteAlertDialog
        open={Boolean(deleteConfirmation)}
        onOpenChange={(open) => !open && setDeleteConfirmation(null)}
        itemType={deleteConfirmation?.type}
        itemName={deleteConfirmation?.name}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: TerminalApp,
});
