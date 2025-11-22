import { VERSION } from "@/config/variable";
import Solitaire from "@/model/Solitaire";
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

export interface GameState {
  // 카드 상태
  stack: TrumpCard[]; // 덱에서 뽑을 카드들
  waste: TrumpCard[]; // 버려진 카드들 (최대 3장)
  foundation: TrumpCard[][]; // [club, diamond, heart, spade]
  ground: TrumpCard[][]; // 7개의 덱 열
  temp: TrumpCard[]; // 임시 보관소 (드래그용)

  // 선택된 카드
  selectedCard: {
    card: TrumpCard;
    sourceLocation: CardLocation;
    sourceIndex: number;
    groundIndex?: number; // ground일 경우
  } | null;
}

export interface GameInfo {
  version: string;
  status: GameStatus;
  score: number;
  history: GameHistory[];
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
  gameState: GameState;
  solitaire: Solitaire;
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
              score: 0,
              history: [] as GameHistory[],
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

            // 게임 상태 (persist하지 않음)
            gameState: {
              stack: [] as TrumpCard[],
              waste: [] as TrumpCard[],
              foundation: [[], [], [], []] as TrumpCard[][],
              ground: Array.from({ length: 7 }, () => []) as TrumpCard[][],
              temp: [] as TrumpCard[],
              selectedCard: null as GameState["selectedCard"],
            } as GameState,

            // persist하지 않을 상태 (클래스 인스턴스)
            solitaire: new Solitaire(),
          },
          (set, get) => {
            function setGameInfo(
              callback: (state: GameInfo, allState: AllState) => void
            ) {
              set((state) => {
                callback(state.gameInfo, state);
              });
            }

            function setGameState(
              callback: (state: GameState, allState: AllState) => void
            ) {
              set((state) => {
                callback(state.gameState, state);
              });
            }

            function setSettings(
              callback: (state: Settings, allState: AllState) => void
            ) {
              set((state) => {
                callback(state.settings, state);
              });
            }

            return {
              setGameInfo,
              setGameState,
              setSettings,
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
