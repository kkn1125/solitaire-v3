import { useSoundEffect } from "@/hook/useSoundEffect";
import type { ReactNode } from "react";
import { SoundEffectContext } from "./SoundEffectContext";

export function SoundEffectProvider({ children }: { children: ReactNode }) {
  const value = useSoundEffect();
  return (
    <SoundEffectContext.Provider value={value}>
      {children}
    </SoundEffectContext.Provider>
  );
}
