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

export interface GameInfo {
  version: string;
  gameInfo: GameInfo;
  sound: SoundTrack;
}

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

interface GameState {
  // 카드 상태
  stack: TrumpCard[]; // 덱에서 뽑을 카드들
  waste: TrumpCard[]; // 버려진 카드들 (최대 3장)
  foundation: TrumpCard[][]; // [club, diamond, heart, spade]
  deck: TrumpCard[][]; // 7개의 덱 열
  temp: TrumpCard[]; // 임시 보관소 (드래그용)

  // 선택된 카드
  selectedCard: {
    card: TrumpCard;
    sourceLocation: "stack" | "waste" | "foundation" | "deck" | "temp";
    sourceIndex: number;
    deckIndex?: number; // deck일 경우
  } | null;
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
            },
            settings: {
              sound: {
                volume: 0.5,
                mute: false,
                playing: false,
                track: "",
                list: [] as string[],
                shuffle: false,
                loop: false,
                random: false,
              } as SoundTrack,
              effects: {
                background: "default",
                animation: false,
                theme: "dark" as "light" | "dark",
              },
            },

            // 게임 상태 (persist하지 않음)
            gameState: {
              stack: [] as TrumpCard[],
              waste: [] as TrumpCard[],
              foundation: [[], [], [], []] as TrumpCard[][],
              deck: Array.from({ length: 7 }, () => []) as TrumpCard[][],
              temp: [] as TrumpCard[],
              selectedCard: null as GameState["selectedCard"],
            } as GameState,

            // persist하지 않을 상태 (클래스 인스턴스)
            solitaire: new Solitaire(),
          },
          (set, get) => {
            function setSolitaire(solitaire: Solitaire) {
              set({ solitaire });
            }

            // Stack에서 Waste로 카드 이동 (3장까지)
            function moveStackToWaste() {
              set((state) => {
                const { stack, waste } = state.gameState;
                if (stack.length === 0) return;

                // Waste에 3장 이상이면 맨 앞 카드 제거
                if (waste.length >= 3) {
                  waste.shift();
                }

                // Stack에서 카드 가져오기
                const card = stack.pop();
                if (card) {
                  card.isFlipped = true;
                  waste.push(card);
                }
              });
            }

            // Waste에서 카드 선택 (자동 이동)
            function selectWasteCard(index: number) {
              set((state) => {
                const { waste } = state.gameState;
                if (index < 0 || index >= waste.length) return;

                const card = waste[index];
                if (!card.isFlipped) return;

                // Waste의 마지막 카드만 클릭 가능 (가장 위에 있는 카드)
                const lastIndex = waste.length - 1;
                if (index !== lastIndex) return;

                // 자동 이동 로직
                const solitaire = get().solitaire;
                const target = solitaire.findAutoMoveTarget(
                  card,
                  state.gameState.foundation,
                  state.gameState.deck
                );

                if (target.location === "foundation") {
                  // Foundation으로 이동
                  const selected = {
                    card,
                    sourceLocation: "waste" as const,
                    sourceIndex: index,
                  };
                  moveCardToFoundation(selected, target.index);
                } else if (target.location === "deck") {
                  // Deck으로 이동
                  const selected = {
                    card,
                    sourceLocation: "waste" as const,
                    sourceIndex: index,
                  };
                  moveCardToDeck(selected, target.index);
                } else {
                  // 이동할 수 없으면 선택만
                  state.gameState.selectedCard = {
                    card,
                    sourceLocation: "waste",
                    sourceIndex: index,
                  };
                }
              });
            }

            // 카드를 Foundation으로 이동
            function moveCardToFoundation(
              selected: GameState["selectedCard"],
              foundationIndex: number
            ) {
              if (!selected) return;

              set((state) => {
                const solitaire = get().solitaire;
                const { foundation } = state.gameState;

                if (
                  !solitaire.canPlaceOnFoundation(
                    selected.card,
                    foundation[foundationIndex]
                  )
                ) {
                  return;
                }

                // 소스에서 카드 제거
                removeCardFromSource(selected);

                // Foundation에 추가
                foundation[foundationIndex].push(selected.card);
                state.gameState.selectedCard = null;
              });
            }

            // 카드를 Deck으로 이동
            function moveCardToDeck(
              selected: GameState["selectedCard"],
              deckIndex: number
            ) {
              if (!selected) return;

              set((state) => {
                const solitaire = get().solitaire;
                const { deck } = state.gameState;

                if (
                  !solitaire.canPlaceOnDeck(selected.card, deck[deckIndex])
                ) {
                  return;
                }

                // 소스에서 카드 제거
                removeCardFromSource(selected);

                // Deck에 추가
                deck[deckIndex].push(selected.card);
                state.gameState.selectedCard = null;
              });
            }

            // 소스에서 카드 제거
            function removeCardFromSource(
              selected: GameState["selectedCard"]
            ) {
              if (!selected) return;

              set((state) => {
                const { gameState } = state;

                switch (selected.sourceLocation) {
                  case "stack":
                    gameState.stack.splice(selected.sourceIndex, 1);
                    break;
                  case "waste":
                    gameState.waste.splice(selected.sourceIndex, 1);
                    break;
                  case "foundation":
                    gameState.foundation[selected.sourceIndex].pop();
                    break;
                  case "deck":
                    if (selected.deckIndex !== undefined) {
                      gameState.deck[selected.deckIndex].pop();
                    }
                    break;
                  case "temp":
                    gameState.temp.splice(selected.sourceIndex, 1);
                    break;
                }
              });
            }

            // Temp에 카드 추가 (드래그용)
            function addCardToTemp(card: TrumpCard) {
              set((state) => {
                state.gameState.temp.push(card);
              });
            }

            // Temp에서 카드 제거
            function removeCardFromTemp(index: number) {
              set((state) => {
                state.gameState.temp.splice(index, 1);
              });
            }

            // 선택 해제
            function clearSelection() {
              set((state) => {
                state.gameState.selectedCard = null;
              });
            }

            return {
              setSolitaire,
              moveStackToWaste,
              selectWasteCard,
              moveCardToFoundation,
              moveCardToDeck,
              addCardToTemp,
              removeCardFromTemp,
              clearSelection,
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
