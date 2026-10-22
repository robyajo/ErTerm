import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentTheme, setTheme as setIpcTheme } from "@/actions/theme";
import type { HostItem, SettingsData } from "@/core/types";

export interface TabItem {
  id: string;
  title: string;
  type: "terminal" | "sftp";
  host?: any;
  color?: string;
  icon?: string;
}

export type NavItem = "hosts" | "keychain" | "tunnels" | "snippets" | "known_hosts" | "logs";

interface TabContextType {
  tabs: TabItem[];
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  openTab: (tab: TabItem) => void;
  closeTab: (id: string) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNewTabTrigger?: () => void;
  setOnNewTabTrigger: (fn: () => void) => void;
  hosts: HostItem[];
  setHosts: React.Dispatch<React.SetStateAction<HostItem[]>>;
  onConnectHost?: (host: HostItem) => void;
  setOnConnectHost: (fn: (host: HostItem) => void) => void;
  onOpenNewHostModal?: () => void;
  setOnOpenNewHostModal: (fn: () => void) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData>>;
  onOpenFolderModal?: () => void;
  setOnOpenFolderModal: (fn: () => void) => void;
  onOpenSshConfigModal?: () => void;
  setOnOpenSshConfigModal: (fn: () => void) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>("hosts");
  const [searchQuery, setSearchQuery] = useState("");
  const [onNewTabTrigger, setOnNewTabTriggerState] = useState<(() => void) | undefined>(undefined);
  const [hosts, setHosts] = useState<HostItem[]>([]);
  const [onConnectHostState, setOnConnectHostState] = useState<((host: HostItem) => void) | undefined>(undefined);
  const [onOpenNewHostModalState, setOnOpenNewHostModalState] = useState<(() => void) | undefined>(undefined);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({});
  const [onOpenFolderModalState, setOnOpenFolderModalState] = useState<(() => void) | undefined>(undefined);
  const [onOpenSshConfigModalState, setOnOpenSshConfigModalState] = useState<(() => void) | undefined>(undefined);

  const syncThemeDOM = (isDark: boolean) => {
    if (typeof document === "undefined") return;
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body?.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body?.classList.remove("dark");
    }
  };

  const [theme, setThemeState] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "dark";
  });

  useEffect(() => {
    const isDark = theme === "dark";
    syncThemeDOM(isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load backend settings and theme on startup to ensure cross-device consistency
  useEffect(() => {
    fetch("http://127.0.0.1:3980/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (data.settings.theme === "dark" || data.settings.theme === "light") {
            setThemeState(data.settings.theme);
            syncThemeDOM(data.settings.theme === "dark");
            localStorage.setItem("theme", data.settings.theme);
          }
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      syncThemeDOM(next === "dark");
      localStorage.setItem("theme", next);
      try {
        setIpcTheme(next);
      } catch {
        // ignore IPC error if offline
      }
      // Immediately sync theme change to backend registry
      fetch("http://127.0.0.1:3980/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      }).catch((e) => console.warn("Failed to sync theme to backend:", e));
      return next;
    });
  };

  const openTab = (tab: TabItem) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === tab.id);
      if (exists) return prev;
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const nextTabs = prev.filter((t) => t.id !== id);
      if (activeTabId === id) {
        setActiveTabId(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null);
      }
      return nextTabs;
    });
  };

  const setOnNewTabTrigger = (fn: () => void) => {
    setOnNewTabTriggerState(() => fn);
  };

  const setOnConnectHost = (fn: (host: HostItem) => void) => {
    setOnConnectHostState(() => fn);
  };

  const setOnOpenNewHostModal = (fn: () => void) => {
    setOnOpenNewHostModalState(() => fn);
  };

  const setOnOpenFolderModal = (fn: () => void) => {
    setOnOpenFolderModalState(() => fn);
  };

  const setOnOpenSshConfigModal = (fn: () => void) => {
    setOnOpenSshConfigModalState(() => fn);
  };

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        setActiveTabId,
        openTab,
        closeTab,
        theme,
        toggleTheme,
        activeNav,
        setActiveNav,
        searchQuery,
        setSearchQuery,
        onNewTabTrigger,
        setOnNewTabTrigger,
        hosts,
        setHosts,
        onConnectHost: onConnectHostState,
        setOnConnectHost,
        onOpenNewHostModal: onOpenNewHostModalState,
        setOnOpenNewHostModal,
        settingsModalOpen,
        setSettingsModalOpen,
        settings,
        setSettings,
        onOpenFolderModal: onOpenFolderModalState,
        setOnOpenFolderModal,
        onOpenSshConfigModal: onOpenSshConfigModalState,
        setOnOpenSshConfigModal,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}

export function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabContext must be used within a TabProvider");
  }
  return context;
}
