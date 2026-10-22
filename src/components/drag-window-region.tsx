import { type ReactNode, useEffect, useState } from "react";
import { getPlatform } from "@/actions/app";
import { closeWindow, maximizeWindow, minimizeWindow } from "@/actions/window";
import { Minus, Square, X, Terminal } from "lucide-react";

interface DragWindowRegionProps {
  title?: ReactNode;
}

function detectIsMac(): boolean {
  if (typeof navigator !== "undefined") {
    const platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || navigator.userAgent;
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
  // Synchronous detection first to prevent flash of wrong layout / padding on macOS
  const [isMacOS, setIsMacOS] = useState<boolean>(() => detectIsMac());

  useEffect(() => {
    let active = true;

    getPlatform()
      .then((val) => {
        if (active && val) {
          setIsMacOS(val === "darwin");
        }
      })
      .catch(() => {
        // Fallback to synchronous detection already initialized
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header
      className={`h-10 w-full flex items-center justify-between select-none text-slate-300 z-50 flex-shrink-0 draglayer border-b transition-colors ${
        isMacOS
          ? "bg-[#0c0f1a] border-[#1a2136] pl-[76px] pr-3"
          : "bg-[#0e1220] border-[#1c243e] pl-3 pr-0"
      }`}
    >
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-2.5 h-full">
        <div className="no-drag flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
            <Terminal size={13} strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-wide font-mono">
              Er<span className="text-indigo-400">Term</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60 hidden sm:inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              SSH & Terminal
            </span>
          </div>
        </div>
      </div>

      {/* Center: Draggable region with subtle core active badge */}
      <div className="flex-1 h-full draglayer flex items-center justify-center px-4">
        {title ? (
          <div className="no-drag text-xs font-mono text-slate-300 truncate">
            {title}
          </div>
        ) : (
          <div className="no-drag hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900/70 border border-slate-800/80 text-[10px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Core Engine Active</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 font-semibold">:3980</span>
          </div>
        )}
      </div>

      {/* Right: Version Pill & Window Controls */}
      <div className="flex items-center h-full no-drag">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 mr-2 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>v1.0.3</span>
        </div>

        {/* Windows / Linux Window Controls (Min, Max, Close) */}
        {!isMacOS && <WindowButtons />}
      </div>
    </header>
  );
}

function WindowButtons() {
  return (
    <div className="flex items-stretch h-full no-drag">
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
