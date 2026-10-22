import React from "react";
import { Server, Monitor, Terminal as TerminalIcon, Laptop } from "lucide-react";

interface DistroBadgeProps {
  osType?: string;
  label?: string;
  hostname?: string;
  className?: string;
}

export function DistroBadge({ osType, label, hostname, className = "" }: DistroBadgeProps) {
  const text = `${osType || ""} ${label || ""} ${hostname || ""}`.toLowerCase();

  // Distro heuristic detection based on label/hostname/osType
  const isUbuntu =
    osType === "ubuntu" ||
    text.includes("ubuntu") ||
    text.includes("aman") ||
    text.includes("vps") ||
    text.includes("mpp") ||
    text.includes("roby") ||
    text.includes("kominfo") ||
    text.includes("bapenda") ||
    text.includes("stunting") ||
    text.includes("camp") ||
    text.includes("opd") ||
    text.includes("jobfair") ||
    text.includes("bima");

  const isServer =
    osType === "server" ||
    text.includes("pohon") ||
    text.includes("silabus") ||
    text.includes("server") ||
    text.includes("rack");

  const isWindows =
    osType === "windows" ||
    text.includes("win") ||
    text.includes("rdp") ||
    text.includes("powershell");

  const isMac =
    osType === "macos" ||
    text.includes("mac") ||
    text.includes("darwin") ||
    text.includes("apple");

  if (isUbuntu && !isServer) {
    // Official authentic Ubuntu Circle of Friends icon
    return (
      <div
        className={`h-10 w-10 rounded-2xl bg-gradient-to-br from-[#e95420] to-[#dd4814] flex items-center justify-center text-white shadow-sm shadow-orange-500/20 flex-shrink-0 ${className}`}
        title="Ubuntu Linux"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <circle cx="12" cy="12" r="10.5" fill="#e95420" />
          {/* Ubuntu 3-node friend circle */}
          <circle cx="5" cy="12" r="1.6" fill="#ffffff" />
          <circle cx="15.5" cy="5.9" r="1.6" fill="#ffffff" />
          <circle cx="15.5" cy="18.1" r="1.6" fill="#ffffff" />
          <path
            d="M8.5 12a3.5 3.5 0 0 0 5.2-3.05h1.8a5.3 5.3 0 0 1-8 4.6l1-1.55zm0 0a3.5 3.5 0 0 1 5.2 3.05h1.8a5.3 5.3 0 0 0-8-4.6l1 1.55zM15.5 10.3a3.5 3.5 0 0 0-3.5-1.8V6.7a5.3 5.3 0 0 1 5.3 2.7l-1.8.9zm0 3.4a3.5 3.5 0 0 1-3.5 1.8v1.8a5.3 5.3 0 0 0 5.3-2.7l-1.8-.9z"
            fill="#ffffff"
          />
        </svg>
      </div>
    );
  }

  if (isServer) {
    return (
      <div
        className={`h-10 w-10 rounded-2xl bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] flex items-center justify-center text-white shadow-sm shadow-blue-500/20 flex-shrink-0 ${className}`}
        title="Server Rack"
      >
        <div className="flex flex-col items-center justify-center gap-1 w-full p-2">
          <div className="w-full h-2 rounded bg-white/90 flex items-center justify-between px-1">
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
            <div className="h-0.5 w-3 rounded bg-blue-900/40" />
          </div>
          <div className="w-full h-2 rounded bg-white/90 flex items-center justify-between px-1">
            <div className="h-1 w-1 rounded-full bg-indigo-400" />
            <div className="h-0.5 w-3 rounded bg-blue-900/40" />
          </div>
        </div>
      </div>
    );
  }

  if (isWindows) {
    return (
      <div
        className={`h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 flex-shrink-0 ${className}`}
        title="Windows"
      >
        <Monitor size={18} strokeWidth={2.2} />
      </div>
    );
  }

  if (isMac) {
    return (
      <div
        className={`h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white shadow-sm flex-shrink-0 ${className}`}
        title="macOS"
      >
        <Laptop size={18} strokeWidth={2.2} />
      </div>
    );
  }

  // Default server badge
  return (
    <div
      className={`h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 flex-shrink-0 ${className}`}
      title="Terminal Host"
    >
      <TerminalIcon size={18} strokeWidth={2.2} />
    </div>
  );
}
