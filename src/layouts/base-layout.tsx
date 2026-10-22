import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";
import { TabProvider } from "@/context/tab-context";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f0f2f6] dark:bg-[#0a0d18] text-slate-800 dark:text-slate-100 select-none transition-colors duration-200">
        <DragWindowRegion />
        <main className="flex-1 flex flex-col h-[calc(100vh-42px)] min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
    </TabProvider>
  );
}
