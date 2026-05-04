export const WIN_EFFECT_TYPES = [
  "classicCascade",
  "confettiBurst",
  "fireworks",
] as const;

export type WinEffectType = (typeof WIN_EFFECT_TYPES)[number];
