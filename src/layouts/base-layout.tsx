import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <DragWindowRegion title="ErTerm — SSH & Terminal" />
      <main className="flex-1 flex flex-col h-[calc(100vh-32px)] overflow-hidden">{children}</main>
    </div>
  );
}
