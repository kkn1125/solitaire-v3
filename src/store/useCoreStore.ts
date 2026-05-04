import { VERSION } from "@/config/variable";
import { del, get, set } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { create } from "zustand";
import {
  combine,
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
  type StateStorage,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Custom storage object
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const GameStatus = {
  Idle: "idle",
  Loading: "loading",
  Success: "success",
  Error: "error",
} as const;
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

// export interface GameHistory {
//   playTime: number;
//   score: number;
// }

export interface BackgroundMusic {
  volume: number; // 0.0 ~ 1.0
  playing: boolean; // 재생 여부
  track: string; // 현재 재생 중인 트랙
}

export interface GameInfo {
  version: string;
  level: number;
  status: GameStatus;
  playTime: number;
  date: number;
  score: number;
  moved: number;
  // history: GameHistory[];
}

export interface Settings {
  backgroundMusic: BackgroundMusic;
  effectSound: boolean;
  effects: {
    background: BackgroundType;
    animation: boolean;
    theme: "light" | "dark";
  };
}

export interface AllState {
  gameInfo: GameInfo;
  settings: Settings;
}

const initialGameInfo = {
  version: VERSION,
  status: "idle" as GameStatus,
  playTime: 0,
  date: 0,
  level: 0,
  moved: 0,
  score: 0,
  // history: [] as GameHistory[],
} as GameInfo;

const initialSettings = {
  backgroundMusic: {
    volume: 0.5,
    playing: false,
    track: "",
  } as BackgroundMusic,
  effectSound: true as boolean,
  effects: {
    background: "default",
    animation: false,
    theme: "dark" as "light" | "dark",
  },
} as Settings;

const initialState = {
  gameInfo: initialGameInfo,
  settings: initialSettings,
};

let playTimeout = null as ReturnType<typeof setInterval> | null;

export const useCoreStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer(
          combine({ ...initialState }, (set, _get) => {
            function changeEffectSound(effectSound: boolean) {
              set((state) => {
                state.settings.effectSound = effectSound;
              });
            }

            function changeBackgroundMusic(backgroundMusic: boolean) {
              set((state) => {
                state.settings.backgroundMusic.playing = backgroundMusic;
              });
            }

            function setCurrentTrack(track: string) {
              set((state) => {
                state.settings.backgroundMusic.track = track;
              });
            }

            function setBackgroundMusicVolume(volume: number) {
              set((state) => {
                state.settings.backgroundMusic.volume = volume;
              });
            }

            function gameEnd() {
              if (playTimeout) {
                clearInterval(playTimeout);
                playTimeout = null;
              }
              set((state) => {
                state.gameInfo.status = "success";
                state.gameInfo.date = 0;
                state.gameInfo.playTime = 0;
              });
            }

            function gamePause() {
              if (playTimeout) {
                clearInterval(playTimeout);
                playTimeout = null;
              }
              set((state) => {
                state.gameInfo.status = "idle";
              });
            }

            function gameResume() {
              if (playTimeout) {
                clearInterval(playTimeout);
                playTimeout = null;
              }
              set((state) => {
                state.gameInfo.status = "success";
              });
              queueMicrotask(() => {
                playTimeout = setInterval(() => {
                  set((state) => {
                    state.gameInfo.playTime += 1;
                  });
                }, 1000);
              });
            }

            function gameStart() {
              if (playTimeout) {
                clearInterval(playTimeout);
                playTimeout = null;
              }

              set((state) => {
                state.gameInfo.status = "success";
                state.gameInfo.date = Date.now();
                state.gameInfo.playTime = 0;
              });

              queueMicrotask(() => {
                playTimeout = setInterval(() => {
                  set((state) => {
                    state.gameInfo.playTime += 1;
                  });
                }, 1000);
              });
            }

            function setGameInfo(
              callback: (state: GameInfo, allState: AllState) => void,
            ) {
              set((state) => {
                callback(state.gameInfo, state);
              });
            }

            function setSettings(
              callback: (state: Settings, allState: AllState) => void,
            ) {
              set((state) => {
                callback(state.settings, state);
              });
            }

            function addScore(score: number) {
              set((state) => {
                state.gameInfo.score += score;
              });
            }

            function clearGameState() {
              set((state) => {
                state.gameInfo = initialGameInfo;
              });
            }

            function updateMoved() {
              set((state) => {
                state.gameInfo.moved++;
              });
            }

            function changeDarkMode(theme: "light" | "dark") {
              set((state) => {
                state.settings.effects.theme = theme;
              });
            }

            function changeAnimationEffect(animation: boolean) {
              set((state) => {
                state.settings.effects.animation = animation;
              });
            }

            function changeBackground(background: BackgroundType) {
              set((state) => {
                state.settings.effects.background = background;
              });
            }

            function setIsPlaying(isPlaying: boolean) {
              set((state) => {
                state.settings.backgroundMusic.playing = isPlaying;
              });
            }

            return {
              actions: {
                addScore,
                clearGameState,
                updateMoved,
                setGameInfo,
                setSettings,
                gameStart,
                gameEnd,
                gamePause,
                gameResume,
                changeDarkMode,
                changeAnimationEffect,
                changeBackground,
                changeEffectSound,
                changeBackgroundMusic,
                setBackgroundMusicVolume,
                setCurrentTrack,
                setIsPlaying,
              },
            };
          }),
        ),
      ),
      {
        name: "solitaire-store",
        partialize: (state) => ({
          // persist할 필드만 선택
          gameInfo: state.gameInfo,
          settings: state.settings,

          // solitaire와 gameState는 제외됨
        }),
        storage: createJSONStorage(() => storage),
      },
    ),
    {
      name: "core",
      enabled: import.meta.env.DEV,
    },
  ),
);
