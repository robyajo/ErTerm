import React, { useEffect } from "react";
import { Terminal as TerminalIcon, Radio, RefreshCw, Columns, Rows, X } from "lucide-react";
import type { Terminal } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";
import type { HostItem, FingerprintPromptData } from "@/core/types";
import { useTabContext } from "@/context/tab-context";
import { ConnectionLoadingView } from "./connection-loading-view";

export interface ActiveTerminalTab {
  id: string;
  host: HostItem;
  ws?: WebSocket;
  term?: Terminal;
  fitAddon?: FitAddon;
  status?: "connecting" | "fingerprint_prompt" | "connected" | "error" | "disconnected";
  connectionStep?: 1 | 2 | 3;
  promptData?: FingerprintPromptData | null;
  logs?: string[];
  statusMessage?: string;
}

interface TerminalViewProps {
  activeTabId: string;
  terminalTabs: ActiveTerminalTab[];
  broadcastEnabled: boolean;
  setBroadcastEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  terminalRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  onAcceptPrompt?: (tabId: string, action?: "replace" | "add") => void;
  onCancelPrompt?: (tabId: string) => void;
  onCancelConnection?: (tabId: string) => void;
}

export function TerminalView({
  activeTabId,
  terminalTabs,
  broadcastEnabled,
  setBroadcastEnabled,
  terminalRefs,
  onAcceptPrompt,
  onCancelPrompt,
  onCancelConnection,
}: TerminalViewProps) {
  const { splitMode, splitTabId, toggleSplit, closeSplit, setActiveTabId } = useTabContext();
  const currentTab = terminalTabs.find((t) => t.id === activeTabId);
  const isLoadingOrPrompt =
    currentTab &&
    (currentTab.status === "connecting" || currentTab.status === "fingerprint_prompt");

  // Re-fit xterm terminals whenever split mode or active/split tabs change
  useEffect(() => {
    const timer = setTimeout(() => {
      terminalTabs.forEach((tab) => {
        try {
          tab.fitAddon?.fit();
        } catch {}
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [splitMode, activeTabId, splitTabId, terminalTabs]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-[#0c0e14]">
      {/* If current tab is loading or awaiting fingerprint prompt */}
      {isLoadingOrPrompt ? (
        <ConnectionLoadingView
          host={currentTab.host}
          step={currentTab.connectionStep || 1}
          promptData={currentTab.promptData}
          logs={currentTab.logs || []}
          statusMessage={currentTab.statusMessage}
          onAcceptPrompt={(action) => onAcceptPrompt?.(currentTab.id, action)}
          onCancelPrompt={() => onCancelPrompt?.(currentTab.id)}
          onCancelConnection={() => onCancelConnection?.(currentTab.id)}
        />
      ) : (
        <>
          {/* Terminal Actions Bar */}
          <div className="h-9 bg-slate-100 dark:bg-[#121620] border-b border-slate-200 dark:border-[#1e2330] px-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <TerminalIcon size={13} className="text-indigo-500" />
              <span>Active Session:</span>
              <span className="text-slate-800 dark:text-white font-bold">
                {currentTab?.host.label || "Terminal"}
              </span>
              {splitMode !== "none" && splitTabId && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                  Split {splitMode === "vertical" ? "Vertical" : "Horizontal"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Split Terminal Controls */}
              <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-200 dark:border-[#1e2330]">
                <button
                  onClick={() => toggleSplit("vertical")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors ${
                    splitMode === "vertical"
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white"
                  }`}
                  title="Split Vertically (Ctrl+Shift+D)"
                  type="button"
                >
                  <Columns size={12} />
                  <span>Split V</span>
                </button>
                <button
                  onClick={() => toggleSplit("horizontal")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors ${
                    splitMode === "horizontal"
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white"
                  }`}
                  title="Split Horizontally (Ctrl+Shift+E)"
                  type="button"
                >
                  <Rows size={12} />
                  <span>Split H</span>
                </button>
                {splitMode !== "none" && (
                  <button
                    onClick={closeSplit}
                    className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                    title="Close Split Pane (Ctrl+Shift+W)"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setBroadcastEnabled((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  broadcastEnabled
                    ? "bg-rose-500/20 text-rose-500 border border-rose-500/40 font-bold animate-pulse"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white"
                }`}
                type="button"
              >
                <Radio size={12} />
                <span>{broadcastEnabled ? "Broadcast ON" : "Broadcast OFF"}</span>
              </button>

              <button
                onClick={() => {
                  terminalTabs.forEach((tab) => {
                    try {
                      tab.fitAddon?.fit();
                    } catch {}
                  });
                }}
                className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Fit Terminal Size"
                type="button"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Terminal Containers - Kept mounted in DOM */}
      <div
        className={`flex-1 relative overflow-hidden bg-white dark:bg-[#0c0e14] ${
          isLoadingOrPrompt ? "hidden" : "block"
        }`}
      >
        {splitMode === "none" || !splitTabId ? (
          // Single Terminal Pane Mode
          terminalTabs.map((tab) => (
            <div
              key={tab.id}
              ref={(el) => {
                if (el) terminalRefs.current.set(tab.id, el);
                else terminalRefs.current.delete(tab.id);
              }}
              className={`absolute inset-0 p-2.5 ${activeTabId === tab.id ? "block" : "hidden"}`}
            />
          ))
        ) : (
          // Dual Split Pane Mode
          terminalTabs.map((tab) => {
            const isPrimary = activeTabId === tab.id;
            const isSecondary = splitTabId === tab.id;

            if (!isPrimary && !isSecondary) {
              return (
                <div
                  key={tab.id}
                  ref={(el) => {
                    if (el) terminalRefs.current.set(tab.id, el);
                    else terminalRefs.current.delete(tab.id);
                  }}
                  className="hidden"
                />
              );
            }

            const isFirst = isPrimary;
            const splitClass =
              splitMode === "vertical"
                ? isFirst
                  ? "left-0 top-0 bottom-0 w-1/2 border-r border-slate-200 dark:border-[#1e2330]"
                  : "left-1/2 top-0 bottom-0 w-1/2"
                : isFirst
                ? "top-0 left-0 right-0 h-1/2 border-b border-slate-200 dark:border-[#1e2330]"
                : "top-1/2 left-0 right-0 h-1/2";

            return (
              <div
                key={tab.id}
                ref={(el) => {
                  if (el) terminalRefs.current.set(tab.id, el);
                  else terminalRefs.current.delete(tab.id);
                }}
                onClick={() => setActiveTabId(tab.id)}
                className={`absolute p-2.5 overflow-hidden cursor-text ${splitClass} ${
                  activeTabId === tab.id
                    ? "ring-1 ring-indigo-500/40 bg-white/5"
                    : "opacity-85 hover:opacity-100"
                }`}
              >
                <div className="absolute top-1.5 right-2 z-10 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 select-none pointer-events-none">
                  {tab.host.label}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
