import {
  SiUbuntu,
  SiDebian,
  SiAlmalinux,
  SiCentos,
} from "@icons-pack/react-simple-icons";
import windowsIcon from "@assets/icon/windows.png";

interface DistroBadgeProps {
  className?: string;
  hostname?: string;
  icon?: string;
  label?: string;
  osType?: string;
}

export function DistroBadge({
  className = "",
  hostname,
  icon,
  label,
  osType,
}: DistroBadgeProps) {
  const normIcon = (icon || "").toLowerCase();
  const normOs = (osType || "").toLowerCase();
  const normLabel = (label || "").toLowerCase();
  const normHost = (hostname || "").toLowerCase();

  // 1. Blue Server Rack Badge (Termius 2-Chassis Server Rack as shown on "VPS KODE LOAKAL")
  const isServer =
    normIcon === "server" ||
    normIcon === "rack" ||
    normIcon === "default" ||
    normOs === "server" ||
    normLabel.includes("loakal") ||
    normLabel.includes("rack") ||
    (normIcon === "" && normOs === "" && normLabel.includes("kode"));

  if (isServer) {
    return (
      <div
        className={`h-9 w-9 rounded-xl bg-[#004878] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
        title="Server Rack"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          className="pointer-events-none select-none"
        >
          {/* Top server chassis blade */}
          <rect x="2.5" y="3.5" width="19" height="7.5" rx="1.5" fill="#ffffff" />
          <rect x="5.5" y="5.5" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <rect x="8.5" y="5.5" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <rect x="11.5" y="5.5" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <circle cx="17" cy="7.25" r="1.2" fill="#004878" />

          {/* Bottom server chassis blade */}
          <rect x="2.5" y="13" width="19" height="7.5" rx="1.5" fill="#ffffff" />
          <rect x="5.5" y="15" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <rect x="8.5" y="15" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <rect x="11.5" y="15" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <circle cx="17" cy="16.75" r="1.2" fill="#004878" />
        </svg>
      </div>
    );
  }

  // 2. Debian Pink / Red Swirl Badge
  const isDebian =
    normIcon === "debian" ||
    normOs === "debian" ||
    normLabel.includes("debian") ||
    normHost.includes("debian");

  if (isDebian) {
    return (
      <div
        className={`h-9 w-9 rounded-xl bg-[#d70a53] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
        title="Debian Linux"
      >
        <SiDebian size={20} color="#ffffff" className="pointer-events-none select-none" />
      </div>
    );
  }

  // 3. AlmaLinux / RHEL / CentOS Badge
  const isAlma =
    normIcon === "alma" ||
    normIcon === "centos" ||
    normIcon === "rhel" ||
    normOs === "alma" ||
    normOs === "centos" ||
    normOs === "rhel" ||
    normLabel.includes("alma") ||
    normLabel.includes("centos") ||
    normLabel.includes("rhel") ||
    normLabel.includes("rocky");

  if (isAlma) {
    return (
      <div
        className={`h-9 w-9 rounded-xl bg-[#002f6c] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
        title="AlmaLinux / RHEL"
      >
        {normIcon === "centos" || normLabel.includes("centos") ? (
          <SiCentos size={20} color="#ffffff" className="pointer-events-none select-none" />
        ) : (
          <SiAlmalinux size={20} color="#ffffff" className="pointer-events-none select-none" />
        )}
      </div>
    );
  }

  // 4. Windows 4-Square Blue Badge
  const isWindows =
    normIcon === "windows" ||
    normOs === "windows" ||
    normLabel.includes("win") ||
    normLabel.includes("rdp") ||
    normHost.includes("win");

  if (isWindows) {
    return (
      <div
        className={`h-9 w-9 rounded-xl bg-[#0078d4] flex items-center justify-center p-2 text-white flex-shrink-0 shadow-xs ${className}`}
        title="Windows"
      >
        <img
          src={windowsIcon}
          alt="Windows"
          className="h-5 w-5 object-contain pointer-events-none select-none brightness-125"
        />
      </div>
    );
  }

  // 5. Authentic Ubuntu Vibrant Orange Squircle with white circle-of-friends logo (matches screenshot 100%)
  return (
    <div
      className={`h-9 w-9 rounded-xl bg-[#e95420] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
      title="Ubuntu Linux"
    >
      <SiUbuntu size={21} color="#ffffff" className="pointer-events-none select-none" />
    </div>
  );
}

export function TabDistroIcon({
  hostname,
  icon,
  label,
  osType,
  className = "",
}: DistroBadgeProps) {
  const normIcon = (icon || "").toLowerCase();
  const normOs = (osType || "").toLowerCase();
  const normLabel = (label || "").toLowerCase();
  const normHost = (hostname || "").toLowerCase();

  // 1. Blue Server Rack (compact 16px)
  const isServer =
    normIcon === "server" ||
    normIcon === "rack" ||
    normIcon === "default" ||
    normOs === "server" ||
    normLabel.includes("loakal") ||
    normLabel.includes("rack") ||
    (normIcon === "" && normOs === "" && normLabel.includes("kode"));

  if (isServer) {
    return (
      <div
        className={`h-4 w-4 rounded-[4px] bg-[#004878] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
        title="Server Rack"
      >
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" className="pointer-events-none select-none">
          <rect x="2.5" y="3.5" width="19" height="7.5" rx="1.5" fill="#ffffff" />
          <rect x="5.5" y="5.5" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <circle cx="17" cy="7.25" r="1.2" fill="#004878" />
          <rect x="2.5" y="13" width="19" height="7.5" rx="1.5" fill="#ffffff" />
          <rect x="5.5" y="15" width="1.5" height="3.5" rx="0.5" fill="#004878" />
          <circle cx="17" cy="16.75" r="1.2" fill="#004878" />
        </svg>
      </div>
    );
  }

  // 2. Debian Pink / Red
  const isDebian =
    normIcon === "debian" ||
    normOs === "debian" ||
    normLabel.includes("debian") ||
    normHost.includes("debian");

  if (isDebian) {
    return (
      <div
        className={`h-4 w-4 rounded-[4px] bg-[#d70a53] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
        title="Debian"
      >
        <SiDebian size={10} color="#ffffff" className="pointer-events-none select-none" />
      </div>
    );
  }

  // 3. AlmaLinux / CentOS
  const isAlma =
    normIcon === "alma" ||
    normIcon === "centos" ||
    normIcon === "rhel" ||
    normOs === "alma" ||
    normOs === "centos" ||
    normOs === "rhel" ||
    normLabel.includes("alma") ||
    normLabel.includes("centos") ||
    normLabel.includes("rhel") ||
    normLabel.includes("rocky");

  if (isAlma) {
    return (
      <div
        className={`h-4 w-4 rounded-[4px] bg-[#002f6c] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
        title="AlmaLinux"
      >
        {normIcon === "centos" || normLabel.includes("centos") ? (
          <SiCentos size={10} color="#ffffff" className="pointer-events-none select-none" />
        ) : (
          <SiAlmalinux size={10} color="#ffffff" className="pointer-events-none select-none" />
        )}
      </div>
    );
  }

  // 4. Windows
  const isWindows =
    normIcon === "windows" ||
    normOs === "windows" ||
    normLabel.includes("win") ||
    normLabel.includes("rdp") ||
    normHost.includes("win");

  if (isWindows) {
    return (
      <div
        className={`h-4 w-4 rounded-[4px] bg-[#0078d4] flex items-center justify-center p-0.5 text-white flex-shrink-0 shadow-xs ${className}`}
        title="Windows"
      >
        <img src={windowsIcon} alt="Windows" className="h-2.5 w-2.5 object-contain brightness-125 pointer-events-none select-none" />
      </div>
    );
  }

  // 5. Authentic Ubuntu Vibrant Orange Squircle
  return (
    <div
      className={`h-4 w-4 rounded-[4px] bg-[#e95420] flex items-center justify-center text-white flex-shrink-0 shadow-xs ${className}`}
      title="Ubuntu Linux"
    >
      <SiUbuntu size={10} color="#ffffff" className="pointer-events-none select-none" />
    </div>
  );
}


