import React from "react";
import { Terminal as TerminalIcon, Radio, RefreshCw } from "lucide-react";
import type { Terminal } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";
import type { HostItem, FingerprintPromptData } from "@/core/types";
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
  const currentTab = terminalTabs.find((t) => t.id === activeTabId);
  const isLoadingOrPrompt =
    currentTab &&
    (currentTab.status === "connecting" || currentTab.status === "fingerprint_prompt");

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
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBroadcastEnabled((prev) => !prev)}
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
                  if (currentTab?.fitAddon) currentTab.fitAddon.fit();
                }}
                className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Fit Terminal Size"
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
  );
}
