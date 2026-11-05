import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { StrictMode } from "react";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { TabProvider, useTabContext } from "@/context/tab-context";
import DragWindowRegion from "@/components/drag-window-region";

// ---------------------------------------------------------------------------
// Mocks: modules that touch Electron IPC or binary assets at import time.
// ---------------------------------------------------------------------------
vi.mock("@/actions/app", () => ({
  getPlatform: vi.fn(() => Promise.resolve("linux")),
  getAppVersion: vi.fn(() => Promise.resolve("1.0.0")),
}));

vi.mock("@/actions/window", () => ({
  closeWindow: vi.fn(() => Promise.resolve()),
  minimizeWindow: vi.fn(() => Promise.resolve()),
  maximizeWindow: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/actions/theme", () => ({
  getCurrentTheme: vi.fn(() => Promise.resolve({ local: null, system: "dark" })),
  setTheme: vi.fn(() => Promise.resolve()),
  toggleTheme: vi.fn(() => Promise.resolve()),
  syncWithLocalTheme: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/ipc/manager", () => ({
  ipc: { client: {} },
}));

vi.mock("@/components/distro-badge", () => ({
  DistroBadge: () => null,
  TabDistroIcon: () => null,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function SplitProbe() {
  const { splitMode, splitTabId } = useTabContext();
  return (
    <div data-testid="split-mode" data-split-tab={splitTabId ?? ""}>
      {splitMode}
    </div>
  );
}

async function mountApp() {
  // await inside act flushes the async getPlatform()/fetch promises that
  // would otherwise resolve outside act and emit React warnings.
  await act(async () => {
    render(
      <StrictMode>
        <TabProvider>
          <SplitProbe />
          <DragWindowRegion />
        </TabProvider>
      </StrictMode>
    );
  });
}

function pressSplit(key: string) {
  fireEvent.keyDown(window, { key: key.toUpperCase(), ctrlKey: true, shiftKey: true });
}

function getSplitMode() {
  return screen.getByTestId("split-mode").textContent;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ success: false }) })
    )
  );
});

afterEach(() => {
  // Flush the menu's focus timeout inside act so it cannot fire into the
  // next test and produce "not wrapped in act" warnings.
  act(() => {
    vi.runOnlyPendingTimers();
  });
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// 1. Runtime: each split shortcut must fire exactly one handler.
//    A duplicated listener would call toggleSplit twice in the same event and
//    the functional state update would flip straight back to "none".
// ---------------------------------------------------------------------------
test("Ctrl+Shift+D activates vertical split exactly once", async () => {
  await mountApp();
  pressSplit("d");
  expect(getSplitMode()).toBe("vertical");
});

test("Ctrl+Shift+D toggles split off on second press", async () => {
  await mountApp();
  pressSplit("d");
  pressSplit("d");
  expect(getSplitMode()).toBe("none");
});

test("Ctrl+Shift+E activates horizontal split exactly once", async () => {
  await mountApp();
  pressSplit("e");
  expect(getSplitMode()).toBe("horizontal");
});

test("Ctrl+Shift+W closes an active split", async () => {
  await mountApp();
  pressSplit("e");
  expect(getSplitMode()).toBe("horizontal");
  pressSplit("w");
  expect(getSplitMode()).toBe("none");
});

test("Ctrl+Shift+D/E/W do not collide with other global shortcuts", async () => {
  await mountApp();
  // Ctrl+T opens the new-tab menu; it must not touch split state.
  fireEvent.keyDown(window, { key: "t", ctrlKey: true });
  expect(getSplitMode()).toBe("none");
  // Ctrl+, opens settings; it must not touch split state.
  fireEvent.keyDown(window, { key: ",", ctrlKey: true });
  expect(getSplitMode()).toBe("none");
  // Plain Ctrl+Shift with an unrelated key does nothing.
  fireEvent.keyDown(window, { key: "Q", ctrlKey: true, shiftKey: true });
  expect(getSplitMode()).toBe("none");
});

// ---------------------------------------------------------------------------
// 2. Listener lifecycle: exactly one live keydown listener while mounted,
//    zero after unmount (no leak, no duplicate registration under StrictMode).
// ---------------------------------------------------------------------------
test("exactly one window keydown listener is live while mounted", async () => {
  const addSpy = vi.spyOn(window, "addEventListener");
  const removeSpy = vi.spyOn(window, "removeEventListener");
  const isKeydown = (args: unknown[]) => args[0] === "keydown";

  const { unmount } = await mountApp();

  const added = addSpy.mock.calls.filter(isKeydown).length;
  const removed = removeSpy.mock.calls.filter(isKeydown).length;
  expect(added - removed).toBe(1);

  unmount();
  const removedAfter = removeSpy.mock.calls.filter(isKeydown).length;
  expect(added - removedAfter).toBe(0);

  addSpy.mockRestore();
  removeSpy.mockRestore();
});

test("shortcut is inert after unmount (no leaked listener)", async () => {
  const { unmount } = await mountApp();
  unmount();
  // A leaked listener would throw (act warnings) or leave state behind;
  // the event must simply be ignored.
  expect(() => pressSplit("d")).not.toThrow();
});

// ---------------------------------------------------------------------------
// 3. Toggle behaviour: Ctrl+T must close the menu it opened (stale-closure
//    guard — the handler lives in an effect whose deps exclude menu state).
// ---------------------------------------------------------------------------
function isNewTabMenuOpen() {
  // The toggle button switches to the "open" palette while the popover shows.
  const btn = document.getElementById("btn-new-tab");
  return !!btn?.className.includes("bg-indigo-600");
}

test("Ctrl+T closes the new-tab menu that it opened", async () => {
  await mountApp();

  act(() => {
    fireEvent.keyDown(window, { key: "t", ctrlKey: true });
  });
  expect(isNewTabMenuOpen()).toBe(true);

  act(() => {
    fireEvent.keyDown(window, { key: "t", ctrlKey: true });
  });
  expect(isNewTabMenuOpen()).toBe(false);
});

// ---------------------------------------------------------------------------
// 4. Static source audit: no duplicate keydown registrations, xterm guard in
//    place, split combo claimed by exactly one handler.
// ---------------------------------------------------------------------------
const SRC_ROOT = path.resolve(import.meta.dirname, "../..");

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const KEYDOWN_REG = /addEventListener\(\s*["']keydown["']/;
const files = collectFiles(SRC_ROOT).filter(
  (f) => !f.includes(`${path.sep}tests${path.sep}`)
);

test("only one module registers a window/document keydown listener for split shortcuts", () => {
  const registrants = files.filter((f) => KEYDOWN_REG.test(readFileSync(f, "utf8")));
  const rel = registrants.map((f) => path.relative(SRC_ROOT, f));

  // index.tsx used to duplicate Ctrl+T and Ctrl+, handlers; it must no longer
  // register its own keydown listener.
  expect(rel).not.toContain(path.join("routes", "index.tsx"));
  // Every remaining registrant must be accounted for.
  for (const file of rel) {
    expect([
      path.join("components", "drag-window-region.tsx"),
      path.join("components", "ui", "sidebar.tsx"),
    ]).toContain(file);
  }
});

test("split combo Ctrl+Shift+D/E/W is claimed by exactly one handler", () => {
  const claimants = files.filter((f) => {
    const src = readFileSync(f, "utf8");
    return (
      KEYDOWN_REG.test(src) &&
      /event\.shiftKey|shiftKey/.test(src) &&
      /toggleSplit|closeSplit/.test(src)
    );
  });
  expect(claimants.map((f) => path.relative(SRC_ROOT, f))).toEqual([
    path.join("components", "drag-window-region.tsx"),
  ]);
});

test("xterm lets the split shortcuts through to the app handler", () => {
  const src = readFileSync(path.join(SRC_ROOT, "routes", "index.tsx"), "utf8");
  expect(src).toContain("attachCustomKeyEventHandler");
  const handlerMatch = src.match(
    /attachCustomKeyEventHandler\(\s*\(event: KeyboardEvent\)\s*=>\s*\{([\s\S]*?)\}\);/
  );
  expect(handlerMatch).toBeTruthy();
  const body = handlerMatch?.[1] ?? "";
  // Returning false = xterm ignores the event, app window handler still runs.
  expect(body).toContain('key === "d" || key === "e" || key === "w"');
  expect(body).toMatch(/return false/);
});

test("sidebar shortcut (Ctrl+B) does not overlap the split combos", () => {
  const src = readFileSync(
    path.join(SRC_ROOT, "components", "ui", "sidebar.tsx"),
    "utf8"
  );
  const shortcut = src.match(/SIDEBAR_KEYBOARD_SHORTCUT\s*=\s*"(.+)"/);
  expect(shortcut).toBeTruthy();
  expect(["d", "e", "w"]).not.toContain(shortcut?.[1]);
});
