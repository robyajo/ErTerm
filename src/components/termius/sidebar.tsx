import {
  Layers,
  KeyRound,
  Network,
  FileCode,
  Globe,
  Clock,
} from "lucide-react";
import type { NavItem } from "@/context/tab-context";

interface TermiusSidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
}

export function TermiusSidebar({
  activeNav,
  setActiveNav,
  activeTabId,
  setActiveTabId,
}: TermiusSidebarProps) {
  const navItems: Array<{ id: NavItem; label: string; icon: typeof Layers }> = [
    { id: "hosts", label: "Hosts", icon: Layers },
    { id: "keychain", label: "Keychain", icon: KeyRound },
    { id: "tunnels", label: "Port Forwarding", icon: Network },
    { id: "snippets", label: "Snippets", icon: FileCode },
    { id: "known_hosts", label: "Known Hosts", icon: Globe },
    { id: "logs", label: "Logs", icon: Clock },
  ];

  return (
    <aside className="w-48 bg-[#f4f5f8] dark:bg-[#101420] border-r border-slate-200 dark:border-[#1e2330] flex flex-col justify-between flex-shrink-0 transition-colors duration-200">
      <div className="p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id && activeTabId === null;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTabId(null);
                setActiveNav(item.id);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/50"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Icon
                size={17}
                className={isActive ? "text-indigo-600 dark:text-indigo-400" : ""}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
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
  );
}
