import { VERSION } from "@/config/variable";
import { del, get, set } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { create } from "zustand";
import {
  combine,
  createJSONStorage,
  persist,
  subscribeWithSelector,
  type StateStorage,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Custom storage object
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log(name, "has been retrieved");
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // console.log(name, "with value", value, "has been saved");
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    // console.log(name, "has been deleted");
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

export interface GameHistory {
  date: string;
  playTime: number;
  score: number;
  level: number;
  moved: number;
}

export interface SoundTrack {
  volume: number; // 0.0 ~ 1.0
  mute: boolean; // 음소거 여부
  playing: boolean; // 재생 여부
  track: string; // 현재 재생 중인 트랙
  list: string[]; // 트랙 리스트
  shuffle: boolean; // 셔플 여부
  loop: boolean; // 반복 여부
  random: boolean; // 랜덤 여부
}

export interface GameInfo {
  version: string;
  status: GameStatus;
  history: GameHistory[];
  score: number;
  playCount: number;
  stackSize: number;
}

export interface Settings {
  sound: SoundTrack;
  effects: {
    background: "default" | "dark" | "light";
    animation: boolean;
    theme: "light" | "dark";
  };
}

export interface AllState {
  gameInfo: GameInfo;
  settings: Settings;
}

export const useCoreStore = create(
  persist(
    subscribeWithSelector(
      immer(
        combine(
          {
            // persist할 상태들
            gameInfo: {
              version: VERSION,
              status: "idle" as GameStatus,
              history: [] as GameHistory[],
              score: 0,
              playCount: 0,
              stackSize: 0,
            } as GameInfo,
            settings: {
              sound: {
                volume: 0.5,
                mute: false,
                playing: false,
                track: "",
                list: [],
                shuffle: false,
                loop: false,
                random: false,
              } as SoundTrack,
              effects: {
                background: "default",
                animation: false,
                theme: "dark" as "light" | "dark",
              },
            } as Settings,
          },
          (set, get) => {
            function setStackSize(stackSize: number) {
              set((state) => {
                state.gameInfo.stackSize = stackSize;
              });
            }

            function setPlayCount(playCount: number) {
              set((state) => {
                state.gameInfo.playCount = playCount;
              });
            }

            function setScore(score: number) {
              set((state) => {
                state.gameInfo.score = score;
              });
            }

            function setGameInfo(
              callback: (state: GameInfo, allState: AllState) => void
            ) {
              set((state) => {
                callback(state.gameInfo, state);
              });
            }

            function setSettings(
              callback: (state: Settings, allState: AllState) => void
            ) {
              set((state) => {
                callback(state.settings, state);
              });
            }

            function setTogglePlaying() {
              set((state) => {
                state.settings.sound.playing = !state.settings.sound.playing;
              });
            }

            function setToggleAnimation(checked: boolean) {
              set((state) => {
                state.settings.effects.animation = checked;
              });
            }

            function setBackground(background: string) {
              set((state) => {
                state.settings.effects.background = background as
                  | "default"
                  | "dark"
                  | "light";
              });
            }

            return {
              setStackSize,
              setPlayCount,
              setScore,
              setGameInfo,
              setSettings,
              setTogglePlaying,
              setToggleAnimation,
              setBackground,
            };
          }
        )
      )
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
    }
  )
);
