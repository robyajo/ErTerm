import { type ReactNode, useEffect, useState } from "react";
import { getPlatform } from "@/actions/app";
import { closeWindow, maximizeWindow, minimizeWindow } from "@/actions/window";
import { Minus, Square, X, Terminal, Radio } from "lucide-react";

interface DragWindowRegionProps {
  title?: ReactNode;
}

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getPlatform()
      .then((value) => {
        if (!active) {
          return;
        }
        setPlatform(value);
      })
      .catch((error) => {
        console.error("Failed to detect platform", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const isMacOS = platform === "darwin";

  return (
    <header className="h-10 w-full flex items-center justify-between bg-[#0e1220] border-b border-[#1c243e] select-none text-slate-300 z-50 flex-shrink-0 draglayer">
      {/* Left: Brand / Title */}
      <div className={`flex items-center gap-2.5 px-3 h-full ${isMacOS ? "pl-20" : ""}`}>
        <div className="no-drag flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
            <Terminal size={13} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-bold text-white tracking-wide font-mono">
            Er<span className="text-indigo-400">Term</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60 hidden sm:inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            SSH & Terminal
          </span>
        </div>
      </div>

      {/* Center: Draggable region with subtle core active badge */}
      <div className="flex-1 h-full draglayer flex items-center justify-center">
        <div className="no-drag hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-[10px] font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Core Engine Active</span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400">:3980</span>
        </div>
      </div>

      {/* Right: Version Pill & Window Controls */}
      <div className="flex items-center h-full no-drag">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 mr-2 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] font-mono text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>v1.0.3</span>
        </div>

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
      >
        <Minus size={13} strokeWidth={2} />
      </button>
      <button
        className="w-11 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors"
        onClick={maximizeWindow}
        title="Maximize / Restore"
        type="button"
      >
        <Square size={11} strokeWidth={2} />
      </button>
      <button
        className="w-11 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 active:bg-rose-700 transition-colors"
        onClick={closeWindow}
        title="Close"
        type="button"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
