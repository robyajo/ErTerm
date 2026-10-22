import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentTheme, setTheme as setIpcTheme } from "@/actions/theme";

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
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>("hosts");
  const [searchQuery, setSearchQuery] = useState("");
  const [onNewTabTrigger, setOnNewTabTriggerState] = useState<(() => void) | undefined>(undefined);

  const [theme, setThemeState] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return document.documentElement.classList.contains("dark") ? "dark" : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    // Initial sync
    const isDark = theme === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", next);
      try {
        setIpcTheme(next);
      } catch {
        // ignore IPC error if offline
      }
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
