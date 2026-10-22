import { Plus } from "lucide-react";
import type { TunnelItem } from "@/core/types";

interface TunnelsViewProps {
  tunnels: TunnelItem[];
  onNewTunnel: () => void;
}

export function TunnelsView({ tunnels, onNewTunnel }: TunnelsViewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Port Forwarding & SSH Tunnels</h2>
          <p className="text-xs text-slate-500">Pengalihan port lokal, remote, dan dynamic SOCKS5 proxy.</p>
        </div>
        <button
          onClick={onNewTunnel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
        >
          <Plus size={14} />
          <span>New Tunnel</span>
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {tunnels.map((t) => (
          <div
            key={t.id}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
          >
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{t.label}</div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                {t.tunnelType.toUpperCase()} : {t.localPort} ➔ {t.remoteHost}:{t.remotePort}
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                t.enabled
                  ? "bg-emerald-500/20 text-emerald-500"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {t.enabled ? "Active" : "Disabled"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
