import { useState } from "react";
import {
  Network,
  Fingerprint,
  Terminal as TerminalIcon,
  Loader2,
} from "lucide-react";
import type { HostItem, FingerprintPromptData } from "@/core/types";
import { DistroBadge } from "@/components/distro-badge";

interface ConnectionLoadingViewProps {
  host: HostItem;
  step: 1 | 2 | 3;
  promptData?: FingerprintPromptData | null;
  logs: string[];
  statusMessage?: string;
  onAcceptPrompt?: (action?: "replace" | "add") => void;
  onCancelPrompt?: () => void;
  onCancelConnection?: () => void;
}

export function ConnectionLoadingView({
  host,
  step = 1,
  promptData,
  logs = [],
  statusMessage,
  onAcceptPrompt,
  onCancelPrompt,
  onCancelConnection,
}: ConnectionLoadingViewProps) {
  const [showLogs, setShowLogs] = useState(false);

  const rawFingerprint =
    promptData?.fingerprint ||
    "2GMoJojIbsltVT6uFRqT22mFH/9jvg6ZenFNrSQYRKo";
  const isChanged = promptData?.reason === "changed";

  return (
    <div className="h-full w-full flex flex-col items-center justify-start pt-24 pb-12 px-4 bg-[#0a0d18] text-white select-none overflow-y-auto">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Top Header: Distro Icon + Host Title/Subtitle + Show Logs Button */}
        <div className="w-full flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <DistroBadge
              hostname={host.hostname}
              icon={host.icon}
              label={host.label}
              osType={host.osType}
              className="!h-9 !w-9 !rounded-xl flex-shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="text-white font-semibold text-xs tracking-normal uppercase">
                {host.label}
              </span>
              <span className="text-slate-400 font-mono text-[11px] mt-0.5">
                SSH {host.hostname || "127.0.0.1"}:{host.port || 22}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowLogs((prev) => !prev)}
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-[#1c2233] hover:bg-[#252e44] text-[#c3c8d4] hover:text-white border border-white/10 text-[11px] font-medium transition-colors cursor-pointer"
          >
            {showLogs ? "Hide logs" : "Show logs"}
          </button>
        </div>

        {/* 3-Node Stepper: Compact & Clean (Matches Termius Screenshot) */}
        <div className="w-full flex items-center justify-between mb-9 px-1">
          {/* Node 1: Network Socket */}
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
              step >= 1
                ? "bg-[#1d8cf8] text-white shadow-[0_0_10px_rgba(29,140,248,0.5)]"
                : "bg-[#222838] text-slate-500"
            }`}
          >
            <Network size={12} />
          </div>

          {/* Connector 1 -> 2 */}
          <div
            className={`h-[2px] flex-1 mx-2 transition-colors ${
              step >= 2 ? "bg-[#1d8cf8]" : "bg-[#283144]"
            }`}
          />

          {/* Node 2: Key Handshake & Fingerprint */}
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
              step === 2
                ? "bg-[#1d8cf8] text-white shadow-[0_0_12px_rgba(29,140,248,0.6)]"
                : step > 2
                ? "bg-[#1d8cf8] text-white"
                : "bg-[#222838] text-slate-500"
            }`}
          >
            <Fingerprint size={12} />
          </div>

          {/* Connector 2 -> 3 */}
          <div
            className={`h-[2px] flex-1 mx-2 transition-colors ${
              step >= 3 ? "bg-[#1d8cf8]" : "bg-[#283144]"
            }`}
          />

          {/* Node 3: Interactive Terminal */}
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
              step >= 3
                ? "bg-[#1d8cf8] text-white shadow-[0_0_10px_rgba(29,140,248,0.5)]"
                : "bg-[#222838] text-slate-500"
            }`}
          >
            <TerminalIcon size={11} />
          </div>
        </div>

        {/* Notice & Fingerprint Secret Section */}
        {step === 2 || promptData ? (
          <div className="w-full flex flex-col items-center text-center">
            {/* Headline */}
            {isChanged ? (
              <h3 className="text-[#f85149] font-semibold text-[13px] tracking-normal mb-5 text-center">
                The fingerprint for {host.hostname || "host"} has changed
              </h3>
            ) : (
              <h3 className="text-white font-semibold text-[13px] tracking-normal mb-5 text-center">
                The authenticity of host '{host.hostname || "127.0.0.1"}' can't be established
              </h3>
            )}

            {/* Subtitle description */}
            <p className="text-[#848d9f] text-[12px] leading-relaxed mb-4 text-center">
              {isChanged
                ? "Termius notices a potential security breach."
                : "ErTerm has not connected to this host before.\nAre you sure you want to continue connecting?"}
            </p>

            {/* Key Type Label */}
            <p className="text-[#848d9f] text-[12px] text-center mb-3">
              New {promptData?.keyType || "ECDSA"} fingerprint is SHA256:
            </p>

            {/* Monospace Fingerprint - Clean plain text (No clunky boxed container) */}
            <div className="text-white font-mono text-[12px] font-normal tracking-wide select-all text-center break-all mb-7 max-w-[400px]">
              {rawFingerprint}
            </div>

            {/* Action Buttons */}
            {isChanged ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => onAcceptPrompt?.("replace")}
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#1d8cf8] hover:bg-[#1579d8] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Replace
                </button>
                <button
                  onClick={() => onAcceptPrompt?.("add")}
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#222938] hover:bg-[#2c3548] text-white text-xs font-medium border border-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Add as new
                </button>
                <button
                  onClick={onCancelPrompt || onCancelConnection}
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#f85149] hover:bg-[#e04038] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => onAcceptPrompt?.("add")}
                  type="button"
                  className="px-5 py-2 rounded-lg bg-[#1d8cf8] hover:bg-[#1579d8] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Accept & Connect
                </button>
                <button
                  onClick={onCancelPrompt || onCancelConnection}
                  type="button"
                  className="px-5 py-2 rounded-lg bg-[#f85149] hover:bg-[#e04038] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Normal in-progress loading */
          <div className="w-full flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-medium mb-3">
              <Loader2 size={14} className="animate-spin text-[#1d8cf8]" />
              <span>
                {statusMessage ||
                  `Connecting to ${host.username ? host.username + "@" : ""}${host.hostname || "127.0.0.1"}:${host.port || 22}...`}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mb-6">
              Negotiating SSH encrypted channel...
            </p>
            <button
              onClick={onCancelConnection}
              type="button"
              className="px-4 py-1.5 rounded-lg bg-[#f85149]/90 hover:bg-[#f85149] text-white text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Live logs console drawer */}
        {showLogs && (
          <div className="w-full mt-7 bg-[#070910] border border-white/10 rounded-xl p-3 text-left shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[10px] font-mono text-slate-400">
              <span className="font-semibold text-slate-300">SSH Negotiation Logs</span>
              <span>{logs.length} events</span>
            </div>
            <div className="font-mono text-[11px] leading-relaxed max-h-44 overflow-y-auto space-y-1 select-text scrollbar-thin text-slate-300">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic py-1">
                  [SSH] Initiating connection pipeline...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#1d8cf8] flex-shrink-0">›</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
