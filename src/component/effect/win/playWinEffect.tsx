import { createRoot } from "react-dom/client";
import WinEffectOverlay from "./WinEffectOverlay";
import type { WinEffectType } from "./WinEffectType";

let activeCleanup: (() => void) | null = null;

export function playWinEffect(type: WinEffectType) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (activeCleanup) {
    activeCleanup();
  }

  const container = document.createElement("div");
  container.dataset.winEffect = "true";
  document.body.appendChild(container);

  const root = createRoot(container);

  const cleanup = () => {
    root.unmount();
    container.remove();
    if (activeCleanup === cleanup) {
      activeCleanup = null;
    }
  };

  activeCleanup = cleanup;

  root.render(<WinEffectOverlay type={type} onDone={cleanup} />);
}
