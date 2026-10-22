import { type ReactNode, useEffect, useRef, useState } from "react";
import { getPlatform } from "@/actions/app";
import { closeWindow, maximizeWindow, minimizeWindow } from "@/actions/window";
import { useTabContext } from "@/context/tab-context";
import {
  Minus,
  Square,
  X,
  Shield,
  Cloud,
  ChevronDown,
  Folder,
  Plus,
  Bell,
  Sun,
  Moon,
  Terminal,
  Menu,
  Search,
  ArrowRight,
} from "lucide-react";
import { DistroBadge, TabDistroIcon } from "@/components/distro-badge";
import type { HostItem } from "@/core/types";

interface DragWindowRegionProps {
  title?: ReactNode;
}

function detectIsMac(): boolean {
  if (typeof navigator !== "undefined") {
    const platform =
      (navigator as unknown as { userAgentData?: { platform?: string } })
        .userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent;
    if (/Mac|iPhone|iPod|iPad/i.test(platform)) {
      return true;
    }
  }
  if (typeof process !== "undefined" && process.platform === "darwin") {
    return true;
  }
  return false;
}

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  const [isMacOS, setIsMacOS] = useState<boolean>(() => detectIsMac());
  const [newTabMenuOpen, setNewTabMenuOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [menuPos, setMenuPos] = useState({ top: 46, left: 140 });
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    tabs,
    activeTabId,
    setActiveTabId,
    closeTab,
    theme,
    toggleTheme,
    onNewTabTrigger,
    openTab,
    setActiveNav,
    hosts = [],
    onConnectHost,
    onOpenNewHostModal,
  } = useTabContext();

  useEffect(() => {
    let active = true;
    getPlatform()
      .then((val) => {
        if (active && val) {
          setIsMacOS(val === "darwin");
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleToggleMenu = () => {
    if (!newTabMenuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 340)),
      });
      setNewTabMenuOpen(true);
    } else {
      setNewTabMenuOpen(false);
    }
  };

  // Close menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setNewTabMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNewTabMenuOpen(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        handleToggleMenu();
      }
    };

    if (newTabMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [newTabMenuOpen]);

  const handleOpenSFTP = () => {
    setActiveNav("hosts");
    const sftpTab = tabs.find((t) => t.type === "sftp");
    if (sftpTab) {
      setActiveTabId(sftpTab.id);
    } else {
      openTab({
        id: "sftp_tab",
        title: "SFTP",
        type: "sftp",
      });
    }
  };

  const handleShowAllDashboard = () => {
    setNewTabMenuOpen(false);
    setActiveTabId(null);
    setActiveNav("hosts");
    if (onNewTabTrigger) {
      onNewTabTrigger();
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("erterm:show-all-hosts"));
    }
  };

  const handleMenuQuickConnect = (query: string) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    const match = hosts.find(
      (h) =>
        h.label.toLowerCase() === trimmed.toLowerCase() ||
        h.hostname?.toLowerCase() === trimmed.toLowerCase()
    );
    if (match) {
      setNewTabMenuOpen(false);
      if (onConnectHost) onConnectHost(match);
      return;
    }

    let username = "root";
    let hostname = trimmed;
    let port = 22;

    if (trimmed.includes("@")) {
      const parts = trimmed.split("@");
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
      label: trimmed,
      type: "ssh",
      hostname,
      username,
      port,
      authType: "password",
      osType: "ubuntu",
    };

    setNewTabMenuOpen(false);
    if (onConnectHost) onConnectHost(tempHost);
  };

  const filteredHosts = hosts.filter((h) => {
    if (!menuSearchQuery.trim()) return true;
    const q = menuSearchQuery.toLowerCase();
    return (
      h.label.toLowerCase().includes(q) ||
      (h.hostname && h.hostname.toLowerCase().includes(q)) ||
      (h.username && h.username.toLowerCase().includes(q))
    );
  });

  return (
    <header
      className={`h-[42px] w-full flex items-center justify-between select-none z-50 flex-shrink-0 draglayer border-b transition-colors bg-white dark:bg-[#0a0d18] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 ${
        isMacOS ? "pl-[76px] pr-2.5" : "pl-3 pr-0"
      }`}
    >
      {/* Left: Menu Toggle + Vaults Switcher + Dynamic Tab Bar */}
      <div className="flex items-center gap-2 h-full overflow-x-auto no-scrollbar">
        {/* Menu Hamburger Button */}
        <div className="no-drag flex items-center">
          <button
            onClick={() => {
              setActiveTabId(null);
              setActiveNav("hosts");
            }}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Dashboard / Menu"
            type="button"
          >
            <Menu size={14} />
          </button>
        </div>

        {/* Vaults Cloud Dropdown Button */}
        <div className="no-drag flex items-center">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-slate-200 transition-colors border dark:border-white/5 active:scale-95"
            title="Cloud Vaults Profile Switcher"
            type="button"
          >
            <Shield size={12} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-[11px] tracking-wide">Vaults</span>
            <Cloud size={11} className="text-slate-500 dark:text-slate-400" />
            <ChevronDown size={10} className="text-slate-400 opacity-80" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5 flex-shrink-0" />

        {/* SFTP Quick Tab */}
        <div className="no-drag flex items-center">
          <button
            onClick={handleOpenSFTP}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
              activeTabId === "sftp_tab"
                ? "bg-slate-200 dark:bg-white/[0.16] text-slate-900 dark:text-white font-medium shadow-xs border border-slate-300 dark:border-white/10"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            }`}
            type="button"
          >
            <Folder size={12} className="text-amber-500 dark:text-amber-400" />
            <span className="text-[11px]">SFTP</span>
          </button>
        </div>

        {/* Active Open Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[620px]">
          {tabs
            .filter((t) => t.type !== "sftp")
            .map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`no-drag group flex items-center gap-2 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all border ${
                    isActive
                      ? "border-emerald-500/70 bg-emerald-950/30 text-emerald-200 font-medium shadow-[0_0_10px_rgba(16,185,129,0.15)] dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.07] border-transparent"
                  }`}
                >
                  {/* 1. Leading Favicon / Distro Badge */}
                  {tab.host ? (
                    <TabDistroIcon
                      hostname={tab.host.hostname}
                      icon={tab.host.icon}
                      label={tab.host.label}
                      osType={tab.host.osType}
                    />
                  ) : (
                    <div className="h-4 w-4 rounded-[4px] bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Terminal size={11} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                    </div>
                  )}

                  {/* 2. Tab Title */}
                  <span className="text-[11px] font-mono truncate max-w-[150px] uppercase tracking-tight">
                    {tab.title}
                  </span>

                  {/* 3. Trailing Close Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className={`p-0.5 -mr-0.5 rounded transition-all text-slate-400 hover:text-slate-200 hover:bg-white/10 ${
                      isActive ? "opacity-75 hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    title="Close Tab"
                    type="button"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
        </div>

        {/* New Tab Plus Button + Termius-Style Popover Menu */}
        <div className="no-drag flex items-center flex-shrink-0 ml-1 relative">
          <button
            ref={btnRef}
            id="btn-new-tab"
            onClick={handleToggleMenu}
            className={`no-drag cursor-pointer flex items-center justify-center h-6 w-6 rounded-md transition-all active:scale-95 ${
              newTabMenuOpen
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.12]"
            }`}
            title="Tambah Tab (Pilih Host atau Tambah Baru)"
            type="button"
          >
            <Plus size={14} className={newTabMenuOpen ? "rotate-45 transition-transform" : "transition-transform"} />
          </button>

          {/* New Tab Popover Menu (Fixed positioning immune to parent overflow) */}
          {newTabMenuOpen && (
            <div
              ref={menuRef}
              className="fixed w-80 bg-white dark:bg-[#131724] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[9999] flex flex-col gap-1.5 text-slate-800 dark:text-slate-200 font-sans"
              style={{
                top: menuPos.top,
                left: menuPos.left,
                filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.55))",
              }}
            >
              {/* Search Bar in Popover */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/5 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors">
                <Search size={13} className="text-slate-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleMenuQuickConnect(menuSearchQuery);
                    }
                  }}
                  placeholder="Cari host atau user@hostname..."
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                />
              </div>

              {/* Action 1: + New Host (Tambah Baru) */}
              <button
                onClick={() => {
                  setNewTabMenuOpen(false);
                  setActiveTabId(null);
                  setActiveNav("hosts");
                  if (onOpenNewHostModal) {
                    onOpenNewHostModal();
                  }
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer group"
                type="button"
              >
                <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Plus size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-none">New Host</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-normal">Tambah konfigurasi host SSH baru</div>
                </div>
              </button>

              {/* Action 2: Local Shell */}
              <button
                onClick={() => {
                  setNewTabMenuOpen(false);
                  if (onConnectHost) {
                    onConnectHost({
                      id: "local_" + Date.now(),
                      label: "Serial / Local Shell",
                      type: "local",
                      shellType: "powershell",
                      osType: "windows",
                    });
                  }
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
                type="button"
              >
                <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Terminal size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-none">Local Shell</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Terminal lokal PowerShell</div>
                </div>
              </button>

              {/* Section Header: Existing Hosts */}
              <div className="flex items-center justify-between px-2.5 pt-1.5 pb-0.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/5">
                <span>Pilih Host yang Ada ({filteredHosts.length})</span>
                <button
                  onClick={handleShowAllDashboard}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline normal-case font-normal cursor-pointer"
                  type="button"
                >
                  Buka Katalog
                </button>
              </div>

              {/* Scrollable Host List */}
              <div className="max-h-56 overflow-y-auto no-scrollbar space-y-0.5 pr-0.5">
                {filteredHosts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    Tidak ada host yang cocok
                  </div>
                ) : (
                  filteredHosts.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setNewTabMenuOpen(false);
                        if (onConnectHost) {
                          onConnectHost(h);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer group"
                      type="button"
                    >
                      <TabDistroIcon
                        hostname={h.hostname}
                        icon={h.icon}
                        label={h.label}
                        osType={h.osType}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {h.label}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                          {h.type === "ssh"
                            ? `${h.username ? h.username + "@" : ""}${h.hostname}:${h.port || 22}`
                            : "Local Shell"}
                        </div>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all flex-shrink-0"
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Draggable Space */}
      <div className="flex-1 h-full draglayer min-w-[30px]" />

      {/* Right Controls: Theme Switcher, Notifications, Window Buttons */}
      <div className="flex items-center h-full no-drag gap-1">

        {/* Theme Toggle Button (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.10] transition-colors active:scale-95"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          type="button"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun size={14} className="text-amber-400" />
          ) : (
            <Moon size={14} className="text-indigo-600" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.10] transition-colors relative"
          title="Notifications & Updates"
          type="button"
        >
          <Bell size={14} />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Windows / Linux Controls */}
        {!isMacOS && <WindowButtons />}
      </div>
    </header>
  );
}

function WindowButtons() {
  return (
    <div className="flex items-stretch h-full no-drag ml-2">
      <button
        className="w-11 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] active:bg-slate-200 dark:active:bg-white/[0.12] transition-colors"
        onClick={minimizeWindow}
        title="Minimize"
        type="button"
        aria-label="Minimize"
      >
        <Minus size={13} strokeWidth={2} />
      </button>
      <button
        className="w-11 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] active:bg-slate-200 dark:active:bg-white/[0.12] transition-colors"
        onClick={maximizeWindow}
        title="Maximize / Restore"
        type="button"
        aria-label="Maximize or Restore"
      >
        <Square size={11} strokeWidth={2} />
      </button>
      <button
        className="w-11 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:bg-rose-600 active:bg-rose-700 transition-colors"
        onClick={closeWindow}
        title="Close"
        type="button"
        aria-label="Close"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
