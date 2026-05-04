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
  (name) => `${name}.${soundExtension}`,
);

/** BGM 파일 URL 목록(순서는 soundTrackNames와 동일) */
export const bgmTrackUrls = soundTracks.map(
  (name) => `/bgm/${name}`,
) as readonly string[];

/* effect sounds */
export const effectSoundExtension = "mp4";
export const effectSoundNames = {
  pick: "pick_sound",
  shuffle: "shuffle_sound",
  move: "pick_sound",
  fanfare: "fanfare-1",
  popper: "popper",
  click: "click",
} as const;
export type EffectSoundRole = keyof typeof effectSoundNames;

export const effectSoundUrls: Record<EffectSoundRole, string> = {
  pick: `/sounds/${effectSoundNames.pick}.${effectSoundExtension}`,
  shuffle: `/sounds/${effectSoundNames.shuffle}.${effectSoundExtension}`,
  move: `/sounds/${effectSoundNames.move}.${effectSoundExtension}`,
  fanfare: `/sounds/${effectSoundNames.fanfare}.${effectSoundExtension}`,
  popper: `/sounds/${effectSoundNames.popper}.${effectSoundExtension}`,
  click: `/sounds/${effectSoundNames.click}.${effectSoundExtension}`,
};

export const winSoundUrls = {
  fanfare: `/sounds/${effectSoundNames.fanfare}.${effectSoundExtension}`,
  popper: `/sounds/${effectSoundNames.popper}.${effectSoundExtension}`,
};

export const CARD_STACK_GAP = 12;

export const CARD_BORDER_WIDTH = 2;

/** 카드 z-index 스택 간격(행마다 더해짐). 화면 크기와 무관하게 고정. */
export const Z_STACK_STEP = 100;

/** 이동 중 카드를 일반 카드보다 위에 두기 위한 z-index 부스트 */
export const CARD_MOVING_GAP = 10e5;

export const ANIMATE_TIME = 300; // milliseconds;
export const OFFSET_TIME = 1.5;

export const POINT = {
  FOUNDATION: 25, // foundation 올릴 시
  CROSS_MATCH: 15, // waste에서 ground 매치 시
  TEMP: -5, // temp로 옮길 시
};
