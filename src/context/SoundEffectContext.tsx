import { type SoundEffectContextValue } from "@/hook/useSoundEffect";
import { createContext } from "react";

export const SoundEffectContext = createContext<SoundEffectContextValue | null>(
  null,
);
