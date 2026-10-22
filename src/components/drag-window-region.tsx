import { type ReactNode, useEffect, useState } from "react";
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
} from "lucide-react";

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

  const handleNewTab = () => {
    if (onNewTabTrigger) {
      onNewTabTrigger();
    } else {
      openTab({
        id: "tab_" + Date.now(),
        title: "New Tab",
        type: "terminal",
      });
    }
  };

  return (
    <header
      className={`h-[42px] w-full flex items-center justify-between select-none z-50 flex-shrink-0 draglayer border-b transition-colors bg-[#1d2436] border-[#131927] text-slate-300 ${
        isMacOS ? "pl-[76px] pr-2.5" : "pl-3 pr-0"
      }`}
    >
      {/* Left: Vaults Switcher & Dynamic Tab Bar */}
      <div className="flex items-center gap-2 h-full overflow-x-auto no-scrollbar">
        {/* Vaults Cloud Dropdown Button */}
        <div className="no-drag flex items-center">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-xs text-slate-200 transition-colors border border-white/5 active:scale-95"
            title="Cloud Vaults Profile Switcher"
            type="button"
          >
            <Shield size={12} className="text-indigo-400" />
            <span className="font-medium text-[11px] tracking-wide">Vaults</span>
            <Cloud size={11} className="text-slate-400" />
            <ChevronDown size={10} className="text-slate-400 opacity-80" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10 mx-0.5 flex-shrink-0" />

        {/* SFTP Quick Tab */}
        <div className="no-drag flex items-center">
          <button
            onClick={handleOpenSFTP}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
              activeTabId === "sftp_tab"
                ? "bg-white/[0.16] text-white font-medium shadow-xs border border-white/10"
                : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
            }`}
            type="button"
          >
            <Folder size={12} className="text-amber-400" />
            <span className="text-[11px]">SFTP</span>
          </button>
        </div>

        {/* Active Open Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[480px]">
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
                      ? "bg-white/[0.18] text-white font-medium shadow-xs border-white/15"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] border-transparent"
                  }`}
                >
                  <Terminal size={11} className={isActive ? "text-indigo-400" : "text-slate-400"} />
                  <span className="text-[11px] font-mono truncate max-w-[120px]">
                    {tab.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/20 text-slate-400 hover:text-white transition-opacity"
                    title="Close Tab"
                    type="button"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}

          {/* New Tab Button */}
          <div className="no-drag flex items-center">
            <button
              onClick={handleNewTab}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                activeTabId === null && tabs.length === 0
                  ? "bg-white/[0.14] text-white font-medium border border-white/10"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
              }`}
              type="button"
            >
              <Plus size={11} />
              <span className="text-[11px]">New Tab</span>
            </button>
          </div>

          {/* Icon-only + Button */}
          <div className="no-drag flex items-center">
            <button
              onClick={handleNewTab}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Add New Terminal Tab"
              type="button"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Center Draggable Space */}
      <div className="flex-1 h-full draglayer min-w-[30px]" />

      {/* Right Controls: Theme Switcher, Notifications, Window Buttons */}
      <div className="flex items-center h-full no-drag gap-1">
        {/* Return to Dashboard Home Icon if inside a tab */}
        {activeTabId !== null && (
          <button
            onClick={() => setActiveTabId(null)}
            className="px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors mr-1"
            title="Return to Hosts Dashboard"
            type="button"
          >
            Dashboard
          </button>
        )}

        {/* Theme Toggle Button (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.10] transition-colors active:scale-95"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          type="button"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun size={14} className="text-amber-400" />
          ) : (
            <Moon size={14} className="text-indigo-300" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.10] transition-colors relative"
          title="Notifications & Updates"
          type="button"
        >
          <Bell size={14} />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
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
        className="w-11 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors"
        onClick={minimizeWindow}
        title="Minimize"
        type="button"
        aria-label="Minimize"
      >
        <Minus size={13} strokeWidth={2} />
      </button>
      <button
        className="w-11 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors"
        onClick={maximizeWindow}
        title="Maximize / Restore"
        type="button"
        aria-label="Maximize or Restore"
      >
        <Square size={11} strokeWidth={2} />
      </button>
      <button
        className="w-11 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 active:bg-rose-700 transition-colors"
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
