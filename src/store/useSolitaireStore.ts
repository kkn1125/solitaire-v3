import {
  CardColor,
  CardLocation,
  CardType,
  CardTypeValues,
  ReadyStatus,
  type CardSignKey,
} from "@/config/enums";
import { ANIMATE_TIME, OFFSET_TIME } from "@/config/variable";
import { enableMapSet } from "immer";
import { create } from "zustand";
import { combine, devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

enableMapSet();

const initialState = {
  rev: 0,
  score: 0,
  playCount: 0,
  status: ReadyStatus.INIT as ReadyStatus,
  actionLock: false,
  shake: false,
  elementLoadCount: 0,
  cards: [] as TrumpCard[],
  deck: {
    stack: [] as string[],
    waste: [] as string[],
    foundation: [] as string[][],
    ground: [] as string[][],
    temp: [] as string[],
  },
  selectedCard: [] as string[],
  cardDomRectMap: {
    board: null as DOMRect | null,
    stack: new Map<string, DOMRect | null>(),
    waste: new Map<string, DOMRect | null>(),
    temp: new Map<string, DOMRect | null>(),
    foundation: new Map<string, DOMRect | null>(),
    ground: new Map<string, DOMRect | null>(),
  },
};

function createId() {
  return Array.from({ length: 3 })
    .map(() => Math.random().toString(36).substring(2, 8))
    .join("-");
}

function generateCards() {
  return Array.from({ length: 52 }, (_, index): TrumpCard => {
    const cardType = CardTypeValues[Math.floor(index / 13)];

    let cardColor;
    switch (cardType) {
      case CardType.Club:
        cardColor = CardColor.Black;
        break;
      case CardType.Diamond:
        cardColor = CardColor.Red;
        break;
      case CardType.Heart:
        cardColor = CardColor.Red;
        break;
      case CardType.Spade:
        cardColor = CardColor.Black;
        break;
    }
    return {
      id: createId(),
      sign: ((index % 13) + 1) as CardSignKey,
      type: cardType,
      color: cardColor,
      location: CardLocation.Stack,
      row: 0,
      column: 0,
      isFlipped: false, // 뒤집혔는지 여부
      isMoving: false, // 이동 중인지 여부
      isShaking: false, // 흔들리는지 여부
    };
  });
}

function shuffle<T>(cards: T[]) {
  return [...cards].sort(() => Math.random() - 0.5);
}

export const useSolitaireStore = create(
  devtools(
    subscribeWithSelector(
      immer(
        combine({ ...initialState }, (set, get) => {
          function clearGame() {
            set((state) => {
              state = initialState;
            });
          }

          function updateCard(cardId: string, payload: Partial<TrumpCard>) {
            set((state) => {
              const card = state.cards.find((c) => c.id === cardId)!;
              if (!card) {
                return;
              }
              Object.assign(card, payload);
            });
          }

          function initializeGame() {
            const cards = generateCards();
            const idList = cards.map((card) => card.id);
            console.log("left card count:", idList.length);

            set((state) => {
              state.cards = cards;

              for (let i = 0; i < 7; i++) {
                const slicedCards = idList.splice(0, i + 1);

                slicedCards.forEach((id, index) => {
                  const card = cards.find((card) => card.id === id);
                  if (card) {
                    card.location = CardLocation.Ground as CardLocation;
                    card.row = index;
                    card.column = i;
                    card.isMoving = false;
                    card.isShaking = false;

                    if (index === slicedCards.length - 1) {
                      card.isFlipped = true;
                    }
                  }
                });

                state.deck.ground[i] = slicedCards;
              }

              console.log("left card count:", idList.length);

              state.deck.stack = idList;
            });
          }

          function addBoardDomRect(
            ref: React.RefObject<HTMLDivElement | null>
          ) {
            const board = ref.current;
            if (!board) {
              return;
            }
            set((state) => {
              state.cardDomRectMap.board =
                board.getBoundingClientRect() || null;
            });
          }

          function addDomRect(location: CardLocation, id: string) {
            const element = document.getElementById(id);
            if (!element) {
              return;
            }
            set((state) => {
              const idValue = id.split("-")[1];
              state.cardDomRectMap[location].set(
                idValue,
                element.getBoundingClientRect()
              );
            });
          }

          function getCardDomRect<T extends CardLocation, K extends string>(
            location: T,
            id: K
          ) {
            return get().cardDomRectMap[location].get(id) as DOMRect | null;
          }

          function getBoardDomRect() {
            return get().cardDomRectMap.board;
          }

          function isBottomStraight(location: CardLocation) {
            return location === CardLocation.Ground;
          }
          function isRightStraight(location: CardLocation) {
            return location === CardLocation.Waste;
          }
          function isNoStraight(location: CardLocation) {
            return (
              location === CardLocation.Foundation ||
              location === CardLocation.Temp ||
              location === CardLocation.Stack
            );
          }
          // function validate() {
          //   return {
          //     isBottomStraight: (location: CardLocation) => {
          //       return location === CardLocation.Ground;
          //     },
          //     isRightStraight: (location: CardLocation) => {
          //       return location === CardLocation.Waste;
          //     },
          //     isNoStraight: (location: CardLocation) => {
          //       return (
          //         location === CardLocation.Foundation ||
          //         location === CardLocation.Temp ||
          //         location === CardLocation.Stack
          //       );
          //     },
          //   };
          // }
          function setStatus(status: ReadyStatus) {
            set((state) => {
              state.status = status;
            });
          }

          function resetWaste() {
            set((state) => {
              const wastedCards = state.deck.waste.splice(0).reverse();
              wastedCards.forEach((id, index) => {
                const card = state.cards.find((c) => c.id === id)!;
                if (card) {
                  card.location = CardLocation.Stack;
                  card.row = state.deck.stack.length;
                  card.column = 0;
                  card.isMoving = true;
                  card.isShaking = false;
                  card.isFlipped = false;
                }
              });
              state.deck.stack.push(...wastedCards);
              setTimeout(() => {
                wastedCards.forEach((id) => {
                  updateCard(id, {
                    isMoving: false,
                  });
                });
              }, ANIMATE_TIME * OFFSET_TIME);
            });
          }

          function handleClickToCardMove(cardId: string) {
            const { cards, deck } = get();
            const card = cards.find((c) => c.id === cardId)!;

            /* 선택 카드 시작 장소가 무엇인지 판별 */
            switch (card.location) {
              case CardLocation.Stack: {
                if (!card.isFlipped) {
                  set((state) => {
                    const originalCard = state.cards.find(
                      (c) => c.id === cardId
                    )!;
                    originalCard.isFlipped = true;
                    originalCard.isMoving = true;
                    originalCard.location = CardLocation.Waste;
                    originalCard.column = 0;

                    const pickedCard: string[] = state.deck.stack.splice(
                      state.deck.stack.indexOf(originalCard.id),
                      1
                    );
                    state.deck.waste.push(...pickedCard);
                    originalCard.row = state.deck.waste.indexOf(
                      originalCard.id
                    );

                    setTimeout(() => {
                      updateCard(cardId, {
                        isMoving: false,
                      });
                    }, ANIMATE_TIME * OFFSET_TIME);
                  });
                }
                break;
              }
              case CardLocation.Waste: {
                break;
              }
              case CardLocation.Foundation: {
                break;
              }
              case CardLocation.Ground: {
                break;
              }
              case CardLocation.Temp: {
                break;
              }
            }

            // 판별
            console.log("🚀 ~ handleClickToCardMove ~ card:", card);
          }

          function timeoutUpdate(
            cardId: string,
            payload: Partial<TrumpCard>,
            ms: number
          ) {
            setTimeout(() => {
              updateCard(cardId, payload);
            }, ms);
          }

          return {
            clearGame,
            initializeGame,
            addBoardDomRect,
            addDomRect,
            getCardDomRect,
            getBoardDomRect,
            setStatus,
            validate: {
              isBottomStraight,
              isRightStraight,
              isNoStraight,
            },
            actions: {
              resetWaste,
              handleClickToCardMove,
            },
          };
        })
      )
    ),
    {
      name: "solitaire-store",
    }
  )
);
