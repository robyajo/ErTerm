import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0a0d18] text-foreground select-none">
      <DragWindowRegion />
      <main className="flex-1 flex flex-col h-[calc(100vh-40px)] min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
