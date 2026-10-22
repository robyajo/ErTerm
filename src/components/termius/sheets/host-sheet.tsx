import { useState } from "react";
import { DistroBadge } from "@/components/distro-badge";
import type { HostItem, FolderItem, SnippetItem, SshKeyItem } from "@/core/types";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Folder as FolderIcon,
  Tag as TagIcon,
  Delete as DeleteKeyIcon,
  Users,
  Shield,
  Code as CodeIcon,
  Network,
  ArrowLeftRight,
  Terminal as TerminalIcon,
  Globe,
  Zap,
  PlusCircle,
  MoreHorizontal,
  ArrowRightToLine,
  Trash2,
  Copy,
  ChevronDown,
  KeyRound,
  Check,
} from "lucide-react";

interface HostSheetProps {
  open: boolean;
  onClose: () => void;
  hostForm: Partial<HostItem>;
  setHostForm: React.Dispatch<React.SetStateAction<Partial<HostItem>>>;
  folders: FolderItem[];
  snippets?: SnippetItem[];
  keys?: SshKeyItem[];
  hosts?: HostItem[];
  onSave: (newHost: HostItem) => void;
  onConnect: (host: HostItem) => void;
  onDelete?: (hostId: string) => void;
}

export function HostSheet({
  open,
  onClose,
  hostForm,
  setHostForm,
  folders,
  snippets = [],
  keys = [],
  hosts = [],
  onSave,
  onConnect,
  onDelete,
}: HostSheetProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showKeyPicker, setShowKeyPicker] = useState(false);
  const [showSnippetPicker, setShowSnippetPicker] = useState(false);
  const [showProxyPicker, setShowProxyPicker] = useState(false);
  const [showEnvEditor, setShowEnvEditor] = useState(false);
  const [showEncodingPicker, setShowEncodingPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showChainPicker, setShowChainPicker] = useState(false);

  if (!open) return null;

  const isEditing = Boolean(hostForm.id);

  const getFormAsHost = (): HostItem => {
    return {
      id: hostForm.id || `h_${Date.now()}`,
      label: hostForm.label?.trim() || hostForm.hostname?.trim() || "New Server",
      type: hostForm.type || "ssh",
      hostname: hostForm.hostname?.trim() || "",
      port: hostForm.port || 22,
      username: hostForm.username?.trim() || "",
      authType: hostForm.authType || (hostForm.keyId ? "key" : "password"),
      password: hostForm.password || "",
      privateKey: hostForm.privateKey || "",
      keyId: hostForm.keyId,
      folderId: hostForm.folderId || null,
      group: hostForm.group || "Default",
      osType: hostForm.osType || "ubuntu",
      icon: hostForm.icon || "ubuntu",
      tags: hostForm.tags || [],
      backspace: hostForm.backspace || "Default",
      agentForwarding: hostForm.agentForwarding || false,
      startupSnippetId: hostForm.startupSnippetId,
      hostChaining: hostForm.hostChaining,
      proxyConfig: hostForm.proxyConfig,
      envVariables: hostForm.envVariables,
      encoding: hostForm.encoding || "UTF-8",
      moshEnabled: hostForm.moshEnabled || false,
      terminalTheme: hostForm.terminalTheme || "Termius Dark",
      createdAt: hostForm.createdAt || Date.now(),
    };
  };

  const handleSaveOnly = () => {
    if (!hostForm.hostname?.trim() && !hostForm.label?.trim()) return;
    onSave(getFormAsHost());
  };

  const handleConnect = () => {
    if (!hostForm.hostname?.trim() && !hostForm.label?.trim()) return;
    const finalHost = getFormAsHost();
    onSave(finalHost);
    onConnect(finalHost);
  };

  return (
    <aside
      className="w-[390px] xl:w-[420px] flex-shrink-0 h-full bg-white dark:bg-[#131726] border-l border-slate-200 dark:border-[#1f2740] text-slate-800 dark:text-slate-100 flex flex-col shadow-2xl z-20 font-sans select-none transition-colors duration-200"
    >
      {/* Panel Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#1f2740] flex items-center justify-between bg-slate-50/70 dark:bg-[#161a2b]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? hostForm.label || hostForm.hostname || "Edit Host" : "New Host"}
          </h3>
          <span className="text-[10px] font-semibold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
            SSH
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Options Menu (Duplicate / Delete) */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#20263f] transition-colors cursor-pointer"
              title="More actions"
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#1a1f33] border border-slate-200 dark:border-[#2b3554] rounded-xl shadow-xl p-1 z-50 text-xs font-sans">
                {isEditing && onDelete && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (hostForm.id) onDelete(hostForm.id);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Host</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const copy = { ...hostForm, id: undefined, label: `${hostForm.label || "Host"} (Copy)` };
                    setHostForm(copy);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252c48] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Duplicate</span>
                </button>
              </div>
            )}
          </div>

          {/* Close Panel Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#20263f] transition-colors cursor-pointer"
            title="Close panel"
          >
            <ArrowRightToLine size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
        {/* Scope Selector: Personal ▾ */}
        <div>
          <div className="w-full bg-slate-100 hover:bg-slate-200/70 dark:bg-[#1a2135] dark:hover:bg-[#202942] border border-slate-200 dark:border-[#27324f] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-slate-800 dark:text-slate-200 cursor-pointer transition-colors shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <User size={13} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">Personal Vault</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Local & sync profile</span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>

        {/* Section: Address & Port */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Address & Port
            </label>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              DEFAULT: 22
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Hostname Input */}
            <div className="flex-1 flex items-center gap-2.5 bg-slate-50 dark:bg-[#1a2135] border border-slate-200 dark:border-[#27324f] rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-[#1c233a] transition-all shadow-2xs">
              <div className="flex-shrink-0">
                <DistroBadge
                  hostname={hostForm.hostname}
                  label={hostForm.label}
                  osType={hostForm.osType}
                  icon={hostForm.icon}
                  className="!h-7 !w-7 !rounded-lg"
                />
              </div>
              <input
                type="text"
                value={hostForm.hostname || ""}
                onChange={(e) =>
                  setHostForm((prev) => ({
                    ...prev,
                    hostname: e.target.value,
                    label: prev.label ? prev.label : e.target.value,
                  }))
                }
                autoComplete="off"
                spellCheck={false}
                placeholder="IP or Hostname (e.g. 192.168.1.1)"
                className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[13px] font-mono outline-none"
              />
            </div>

            {/* Port Input */}
            <div className="w-24 flex items-center gap-1.5 bg-slate-50 dark:bg-[#1a2135] border border-slate-200 dark:border-[#27324f] rounded-xl px-2.5 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-[#1c233a] transition-all shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Port</span>
              <input
                type="number"
                value={hostForm.port || 22}
                onChange={(e) =>
                  setHostForm((prev) => ({
                    ...prev,
                    port: parseInt(e.target.value, 10) || 22,
                  }))
                }
                className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-mono text-right outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section: General */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            General
          </label>

          {/* Label Input */}
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#1a2135] border border-slate-200 dark:border-[#27324f] rounded-xl px-3.5 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-[#1c233a] transition-all shadow-2xs">
            <TagIcon size={14} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={hostForm.label || ""}
              onChange={(e) => setHostForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Label / Display Name"
              autoComplete="off"
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[13px] outline-none"
            />
          </div>

          {/* Parent Group Select */}
          <div className="bg-slate-50 dark:bg-[#1a2135] border border-slate-200 dark:border-[#27324f] rounded-xl px-3.5 py-2 flex items-center justify-between text-slate-700 dark:text-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-2xs">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <FolderIcon size={14} className="text-amber-500 flex-shrink-0" />
              <select
                value={hostForm.folderId || ""}
                onChange={(e) => {
                  const fid = e.target.value;
                  const folder = folders.find((f) => f.id === fid);
                  setHostForm((prev) => ({
                    ...prev,
                    folderId: fid || null,
                    group: folder ? folder.name : "Default",
                  }));
                }}
                className="bg-transparent text-slate-900 dark:text-white outline-none w-full text-xs cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-[#1a2135] text-slate-900 dark:text-white">
                  Parent Group (None / Default)
                </option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id} className="bg-white dark:bg-[#1a2135] text-slate-900 dark:text-white">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown size={13} className="text-slate-400 pointer-events-none" />
          </div>

          {/* Tags Input */}
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#1a2135] border border-slate-200 dark:border-[#27324f] rounded-xl px-3.5 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-[#1c233a] transition-all shadow-2xs">
            <TagIcon size={14} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={hostForm.tags ? hostForm.tags.join(", ") : ""}
              onChange={(e) => {
                const val = e.target.value;
                const tagsArr = val.split(",").map((t) => t.trim()).filter(Boolean);
                setHostForm((prev) => ({ ...prev, tags: tagsArr }));
              }}
              placeholder="Tags (separated by comma)"
              autoComplete="off"
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs outline-none"
            />
          </div>

          {/* Backspace Selector */}
          <div className="bg-slate-50 dark:bg-[#1a2135] border border-slate-200 dark:border-[#27324f] rounded-xl px-3.5 py-2 flex items-center justify-between text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <DeleteKeyIcon size={14} className="text-slate-400" />
              <span>Backspace Key</span>
            </div>
            <select
              value={hostForm.backspace || "Default"}
              onChange={(e) => setHostForm((prev) => ({ ...prev, backspace: e.target.value }))}
              className="bg-transparent text-slate-800 dark:text-slate-300 outline-none text-xs cursor-pointer text-right"
            >
              <option value="Default" className="bg-white dark:bg-[#1a2135] text-slate-900 dark:text-white">Default</option>
              <option value="Control-H" className="bg-white dark:bg-[#1a2135] text-slate-900 dark:text-white">Control-H (^H)</option>
              <option value="ASCII 127" className="bg-white dark:bg-[#1a2135] text-slate-900 dark:text-white">ASCII 127 (^?)</option>
            </select>
          </div>
        </div>

        {/* Section: Credentials */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Credentials
            </label>
            <span className="text-[10px] text-slate-500">Auto-saved to Vault</span>
          </div>

          {/* Credentials Card Container */}
          <div className="bg-slate-50 dark:bg-[#1a2135] border border-slate-200 dark:border-[#27324f] rounded-2xl p-2.5 space-y-2 shadow-2xs">
            {/* Username Input */}
            <div className="flex items-center gap-2.5 bg-white dark:bg-[#14192a] border border-slate-200 dark:border-[#242e47] rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <div className="h-6 w-6 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <User size={13} />
              </div>
              <input
                type="text"
                value={hostForm.username || ""}
                onChange={(e) => setHostForm((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Username (e.g. root, ubuntu)"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-medium outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#14192a] border border-slate-200 dark:border-[#242e47] rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="h-6 w-6 rounded-md bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Lock size={13} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={hostForm.password || ""}
                  onChange={(e) => setHostForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Password"
                  autoComplete="new-password"
                  spellCheck={false}
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-mono outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* + SSH ID, Key, Certificate, FIDO2 */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowKeyPicker(!showKeyPicker)}
                className="w-full text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer py-1 px-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#20273f]"
              >
                <div className="flex items-center gap-2">
                  <KeyRound size={13} className="text-indigo-500" />
                  <span>SSH Key / Certificate</span>
                </div>
                <div className="flex items-center gap-1">
                  {hostForm.keyId && (
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                  <ChevronDown size={13} className={`transform transition-transform ${showKeyPicker ? "rotate-180" : ""}`} />
                </div>
              </button>

              {showKeyPicker && (
                <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#242c47] space-y-2 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Pilih SSH Key</div>
                  {keys.length === 0 ? (
                    <div className="text-[11px] text-slate-500 py-1">Belum ada SSH Key di Keychain.</div>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {keys.map((k) => (
                        <div
                          key={k.id}
                          onClick={() => {
                            setHostForm((prev) => ({
                              ...prev,
                              keyId: k.id,
                              authType: "key",
                              privateKey: k.privateKey,
                            }));
                          }}
                          className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between transition-colors ${
                            hostForm.keyId === k.id
                              ? "bg-indigo-50 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/50"
                              : "bg-slate-50 dark:bg-[#1c2237] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252c48]"
                          }`}
                        >
                          <span className="truncate font-medium">{k.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">{k.keyType}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share this host button */}
        <div>
          <button
            type="button"
            onClick={() => {
              const text = `ssh ${hostForm.username ? `${hostForm.username}@` : ""}${hostForm.hostname || "hostname"} -p ${hostForm.port || 22}`;
              navigator.clipboard.writeText(text);
              alert("SSH command copied to clipboard!");
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1f253a] dark:hover:bg-[#262e48] border border-slate-200 dark:border-[#293250] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Share SSH Command</span>
            <Users size={13} className="text-slate-400" />
          </button>
        </div>

        {/* Continuation Menu / Lanjutan Menu */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#21273e]">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Advanced Settings
          </label>

          {/* Agent Forwarding */}
          <div
            onClick={() =>
              setHostForm((prev) => ({ ...prev, agentForwarding: !prev.agentForwarding }))
            }
            className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Shield size={14} className="text-slate-400" />
              <span className="font-medium">Agent Forwarding</span>
            </div>
            <span
              className={`font-semibold text-xs ${
                hostForm.agentForwarding ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
              }`}
            >
              {hostForm.agentForwarding ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* Startup snippet */}
          <div>
            <div
              onClick={() => setShowSnippetPicker(!showSnippetPicker)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <CodeIcon size={14} className="text-slate-400" />
                <span className="font-medium">Startup snippet</span>
              </div>
              <span className="text-slate-500">
                {snippets.find((s) => s.id === hostForm.startupSnippetId)?.title || "None"}
              </span>
            </div>

            {showSnippetPicker && (
              <div className="mt-1.5 p-2 bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#242c47] rounded-xl space-y-1">
                <div
                  onClick={() => {
                    setHostForm((prev) => ({ ...prev, startupSnippetId: undefined }));
                    setShowSnippetPicker(false);
                  }}
                  className="p-1.5 rounded-lg text-xs cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1f253a]"
                >
                  None
                </div>
                {snippets.map((snip) => (
                  <div
                    key={snip.id}
                    onClick={() => {
                      setHostForm((prev) => ({ ...prev, startupSnippetId: snip.id }));
                      setShowSnippetPicker(false);
                    }}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer flex justify-between ${
                      hostForm.startupSnippetId === snip.id
                        ? "bg-indigo-50 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f253a]"
                    }`}
                  >
                    <span>{snip.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proxy */}
          <div>
            <div
              onClick={() => setShowProxyPicker(!showProxyPicker)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Network size={14} className="text-slate-400" />
                <span className="font-medium">Proxy</span>
              </div>
              <span className="text-slate-500 truncate max-w-[150px]">
                {hostForm.proxyConfig || "None"}
              </span>
            </div>

            {showProxyPicker && (
              <div className="mt-1.5 p-2.5 bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#242c47] rounded-xl space-y-2">
                <input
                  type="text"
                  placeholder="e.g. socks5://127.0.0.1:1080 or http://proxy:8080"
                  value={hostForm.proxyConfig || ""}
                  onChange={(e) => setHostForm((prev) => ({ ...prev, proxyConfig: e.target.value || undefined }))}
                  className="w-full bg-slate-50 dark:bg-[#1c2237] border border-slate-200 dark:border-[#2b3554] rounded-lg p-2 text-xs text-slate-900 dark:text-white outline-none"
                />
                <div className="flex gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setHostForm((prev) => ({ ...prev, proxyConfig: "socks5://127.0.0.1:1080" }));
                    }}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-[#1c2237] hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                  >
                    SOCKS5 Local
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHostForm((prev) => ({ ...prev, proxyConfig: undefined }));
                    }}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-[#1c2237] hover:bg-slate-200 text-rose-500"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Host Chaining (Jump Host) */}
          <div>
            <div
              onClick={() => setShowChainPicker(!showChainPicker)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <ArrowLeftRight size={14} className="text-slate-400" />
                <span className="font-medium">Host chaining (Jump Host)</span>
              </div>
              <span className="text-slate-500">
                {hostForm.hostChaining
                  ? hosts.find((h) => h.id === hostForm.hostChaining)?.label || "Configured"
                  : "None"}
              </span>
            </div>

            {showChainPicker && (
              <div className="mt-1.5 p-2 bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#242c47] rounded-xl space-y-1">
                <div
                  onClick={() => {
                    setHostForm((prev) => ({ ...prev, hostChaining: undefined }));
                    setShowChainPicker(false);
                  }}
                  className="p-1.5 rounded-lg text-xs cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1f253a]"
                >
                  Direct Connection (No Jump Host)
                </div>
                {hosts
                  .filter((h) => h.id !== hostForm.id)
                  .map((jh) => (
                    <div
                      key={jh.id}
                      onClick={() => {
                        setHostForm((prev) => ({
                          ...prev,
                          hostChaining: jh.id,
                        }));
                        setShowChainPicker(false);
                      }}
                      className={`p-1.5 rounded-lg text-xs cursor-pointer flex justify-between ${
                        hostForm.hostChaining === jh.id
                          ? "bg-indigo-50 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 font-medium"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f253a]"
                      }`}
                    >
                      <span>{jh.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{jh.hostname}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Environment Variable */}
          <div>
            <div
              onClick={() => setShowEnvEditor(!showEnvEditor)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <TerminalIcon size={14} className="text-slate-400" />
                <span className="font-medium">Environment Variable</span>
              </div>
              <span className="text-slate-500">{hostForm.envVariables ? "Custom" : "Default"}</span>
            </div>

            {showEnvEditor && (
              <div className="mt-1.5 p-2.5 bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#242c47] rounded-xl space-y-2">
                <textarea
                  value={hostForm.envVariables || ""}
                  onChange={(e) => setHostForm((prev) => ({ ...prev, envVariables: e.target.value }))}
                  placeholder="TERM=xterm-256color&#10;LANG=en_US.UTF-8"
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-[#1c2237] border border-slate-200 dark:border-[#2b3554] rounded-lg p-2 text-xs text-slate-900 dark:text-white font-mono outline-none resize-none"
                />
              </div>
            )}
          </div>

          {/* UTF-8 / Encoding */}
          <div>
            <div
              onClick={() => setShowEncodingPicker(!showEncodingPicker)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Globe size={14} className="text-slate-400" />
                <span className="font-medium">Encoding</span>
              </div>
              <span className="text-slate-600 dark:text-slate-400 font-mono">{hostForm.encoding || "UTF-8"}</span>
            </div>

            {showEncodingPicker && (
              <div className="mt-1.5 p-2 bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#242c47] rounded-xl space-y-1">
                {["UTF-8", "ISO-8859-1", "Windows-1252", "ASCII", "GBK"].map((enc) => (
                  <div
                    key={enc}
                    onClick={() => {
                      setHostForm((prev) => ({ ...prev, encoding: enc }));
                      setShowEncodingPicker(false);
                    }}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer flex justify-between ${
                      (hostForm.encoding || "UTF-8") === enc
                        ? "bg-indigo-50 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f253a]"
                    }`}
                  >
                    <span>{enc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mosh */}
          <div
            onClick={() => setHostForm((prev) => ({ ...prev, moshEnabled: !prev.moshEnabled }))}
            className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Zap size={14} className="text-slate-400" />
              <span className="font-medium">Mosh Protocol</span>
            </div>
            <span
              className={`font-semibold text-xs ${
                hostForm.moshEnabled ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
              }`}
            >
              {hostForm.moshEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* Terminal Theme Card */}
          <div>
            <div
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1c2237] dark:hover:bg-[#222942] border border-slate-200 dark:border-[#262f4c] rounded-xl p-3 flex items-center gap-3.5 cursor-pointer transition-colors shadow-2xs"
            >
              {/* Green CRT Terminal Graphic Preview */}
              <div className="h-9 w-12 rounded-lg bg-[#0e1718] border border-emerald-500/30 flex flex-col justify-center px-1.5 gap-1 shadow-inner flex-shrink-0">
                <div className="h-1 w-full rounded-full bg-emerald-400/90" />
                <div className="h-1 w-3/4 rounded-full bg-emerald-400/70" />
                <div className="h-1 w-1/2 rounded-full bg-emerald-400/50" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 dark:text-white text-[13px]">
                  {hostForm.terminalTheme || "Termius Dark"}
                </div>
                <div className="text-[11px] text-slate-500">Terminal color theme</div>
              </div>
              <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
            </div>

            {showThemePicker && (
              <div className="mt-1.5 p-2 bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#242c47] rounded-xl space-y-1">
                {["Termius Dark", "Dracula", "Nord", "Monokai", "Solarized Dark", "One Dark"].map((th) => (
                  <div
                    key={th}
                    onClick={() => {
                      setHostForm((prev) => ({ ...prev, terminalTheme: th }));
                      setShowThemePicker(false);
                    }}
                    className={`p-1.5 rounded-lg text-xs cursor-pointer flex justify-between ${
                      (hostForm.terminalTheme || "Termius Dark") === th
                        ? "bg-indigo-50 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f253a]"
                    }`}
                  >
                    <span>{th}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* + Add Telnet Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                const isTelnet = hostForm.type === "ssh";
                setHostForm((prev) => ({
                  ...prev,
                  type: isTelnet ? "ssh" : "ssh",
                  port: isTelnet ? 23 : 22,
                }));
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1f253a] dark:hover:bg-[#262e48] border border-slate-200 dark:border-[#293250] text-slate-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Add Telnet Connection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Section */}
      <div className="p-4 border-t border-slate-200 dark:border-[#21273e] bg-slate-50 dark:bg-[#151828] space-y-2">
        {/* Main Blue Connect Button */}
        <button
          onClick={handleConnect}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-[0.99] cursor-pointer"
        >
          Connect
        </button>

        {/* Secondary Save Button */}
        <button
          onClick={handleSaveOnly}
          className="w-full py-2 rounded-xl bg-slate-200 dark:bg-[#1f253a] hover:bg-slate-300 dark:hover:bg-[#283050] text-slate-800 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          Save Host
        </button>
      </div>
    </aside>
  );
}
