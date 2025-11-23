import pkg from "../../package.json";

export const VERSION = (pkg.version as string) || "0.1.0";

/* bgm tracks */
export const soundExtension = "mp4";
export const soundTrackNames = [
  "daehanghaesidae_bar",
  "daehanghaesidae_eastern_mediterranean_sea",
  "daehanghaesidae_japan",
  "daehanghaesidae_marseille",
];
export const soundTracks = soundTrackNames.map(
  (name) => `${name}.${soundExtension}`
);
export const audioTracks = soundTracks.map((name) => new Audio(`/bgm/${name}`));

/* effect sounds */
export const effectSoundExtension = "mp4";
export const effectSoundNames = {
  pick: "pick_sound",
  shuffle: "shuffle_sound",
} as const;
export type EffectSoundName =
  (typeof effectSoundNames)[keyof typeof effectSoundNames];
export const effectSounds = {
  [effectSoundNames.pick]: new Audio(
    `/sounds/${effectSoundNames.pick}.${effectSoundExtension}`
  ),
  [effectSoundNames.shuffle]: new Audio(
    `/sounds/${effectSoundNames.shuffle}.${effectSoundExtension}`
  ),
} as Record<EffectSoundName, HTMLAudioElement>;

export const CARD_FONT_SIZE = 3;

export const CARD_SIZE_RATIO = 11 / 18;

export const CARD_STACK_GAP = 12;

export const CARD_BORDER_WIDTH = 2;

export const ANIMATE_TIME = 300; // milliseconds;
export const OFFSET_TIME = 1.5;

export const POINT = {
  FOUNDATION: 25, // foundation 올릴 시
  CROSS_MATCH: 15, // waste에서 ground 매치 시
  TEMP: -5, // temp로 옮길 시
};
