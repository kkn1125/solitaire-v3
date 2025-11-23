import {
  CardColor,
  CardLocation,
  CardType,
  CardTypeValues,
  type CardSignKey,
} from "@/config/enums";
import { ANIMATE_TIME, OFFSET_TIME } from "@/config/variable";
import { isDoubleArray } from "@/util/isArray";
import { isNil } from "@/util/isNil";
import { enableMapSet } from "immer";
import { create } from "zustand";
import { combine, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

enableMapSet();

const initialState = {
  rev: 0,
  isReady: false,
  isBaseBindReady: false,
  isBindReady: false,
  isCardReady: false,
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
  cardBase: {
    board: null as DOMRect | null,
    stack: new Map<string, DOMRect | null>(),
    waste: new Map<string, DOMRect | null>(),
    foundation: new Map<string, DOMRect | null>(),
    ground: new Map<string, DOMRect | null>(),
    temp: new Map<string, DOMRect | null>(),
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
  subscribeWithSelector(
    immer(
      combine({ ...initialState }, (set, get) => {
        function clearGame() {
          set((state) => {
            state = initialState;
          });
        }

        function setCards(cards: TrumpCard[]) {
          set((state) => {
            state.cards = cards;
          });
        }

        function setStacks(stacks: string[]) {
          set((state) => {
            for (const stack of stacks) {
              const card = state.cards.find((c) => c.id === stack);
              if (!card) continue;
              card.location = CardLocation.Stack;
              card.row = stacks.indexOf(stack);
              card.column = 0;
            }
            state.deck.stack = stacks;
          });
        }

        function setWastes(wastes: string[]) {
          set((state) => {
            state.deck.waste = wastes;
          });
        }

        function setFoundations(foundations: string[][]) {
          set((state) => {
            state.deck.foundation = foundations;
          });
        }

        function setGrounds(grounds: string[][]) {
          set((state) => {
            for (const ground of grounds) {
              for (const cardId of ground) {
                const card = state.cards.find((c) => c.id === cardId);
                if (!card) continue;
                card.row = ground.indexOf(cardId);
                card.column = grounds.indexOf(ground);
                card.location = CardLocation.Ground;
              }
              const lastCardId = ground[ground.length - 1]!;
              const lastCard = state.cards.find((c) => c.id === lastCardId)!;
              lastCard.isFlipped = true;
            }
            state.deck.ground = grounds;
          });
        }

        function setTemps(temps: string[]) {
          set((state) => {
            state.deck.temp = temps;
          });
        }

        function gameSetting() {
          const cards = generateCards();
          setCards(cards);
          const newSuffledCards = [...cards]; /* shuffle(cards) */

          const grounds: string[][] = [];
          for (let col = 0; col < 7; col++) {
            const ground = newSuffledCards.splice(0, col + 1).map((card) => {
              return card.id;
            });
            grounds.push(ground);
          }
          setGrounds(grounds);
          setStacks(newSuffledCards.map((card) => card.id));

          setFoundations([[], [], [], []]);
          setTemps([]);
          setWastes([]);

          setIsCardReady(true);
        }

        function setIsReady(isReady: boolean) {
          set((state) => {
            state.isReady = isReady;
          });
        }

        function setIsBaseBindReady(isBaseBindReady: boolean) {
          set((state) => {
            state.isBaseBindReady = isBaseBindReady;
          });
        }
        function setIsBindReady(isBindReady: boolean) {
          set((state) => {
            state.isBindReady = isBindReady;
          });
        }

        function setIsCardReady(isCardReady: boolean) {
          set((state) => {
            state.isCardReady = isCardReady;
          });
        }

        function setSelectedCards(selectedCards: string[]) {
          set((state) => {
            state.selectedCard = selectedCards;
          });
        }

        function addBoardBase(ref: HTMLDivElement | null) {
          if (!ref) return;
          const boundRect = ref.getBoundingClientRect();
          set((state) => {
            state.cardBase.board = boundRect;
          });
          setIsBaseBindReady(true);
        }

        function insertCardBase(location: CardLocation, id: string) {
          return (ref: HTMLDivElement | null) => {
            if (!ref) return;
            const boundRect = ref.getBoundingClientRect();
            set((state) => {
              state.elementLoadCount++;
              state.cardBase[location].set(id, boundRect);
            });
            if (get().elementLoadCount === 14) {
              setIsBindReady(true);
            }
          };
        }

        function shakeCard(cardId: string) {
          set((state) => {
            const card = state.cards.find((c) => c.id === cardId)!;
            card.isShaking = true;
            card.isMoving = false;
          });
        }

        function locked() {
          set((state) => {
            state.actionLock = true;
          });
        }
        function unLocked() {
          set((state) => {
            state.actionLock = false;
          });
        }

        function getBoardBase() {
          return get().cardBase.board;
        }

        function getCardBase<
          Location extends CardLocation,
          Id extends Location extends "stack"
            ? "1"
            : Location extends "waste"
            ? "1"
            : Location extends "foundation"
            ? "1" | "2" | "3" | "4"
            : Location extends "ground"
            ? "1" | "2" | "3" | "4" | "5" | "6" | "7"
            : Location extends "temp"
            ? "1"
            : never
        >(location: Location, id: Id) {
          return get().cardBase[location].get(id);
        }

        /* 1. 카드를 이동할 수 있는 위치를 찾는 함수 */
        // function getMovableLocation(card: TrumpCard): CardLocation | null {
        //   // fixed
        //   if (card.location === CardLocation.Stack) {
        //     return CardLocation.Waste;
        //   }

        //   // all ways
        //   if (card.location === CardLocation.Waste) {
        //     return CardLocation.Foundation;
        //   }

        //   // temp or ground
        //   if (card.location === CardLocation.Foundation) {
        //     return CardLocation.Ground;
        //   }

        //   // temp of foundation
        //   if (card.location === CardLocation.Ground) {
        //     return get().deck.foundation[card.column][card.row]
        //       ? CardLocation.Foundation
        //       : CardLocation.Temp;
        //   }

        //   // foundation or ground
        //   if (card.location === CardLocation.Temp) {
        //     return CardLocation.Stack;
        //   }

        //   return null;
        // }

        /* 2. 카드를 이동할 수 있는 위치를 찾는 함수 */
        /* [CardLocation, column, row] */
        function findMovableIndex(
          card: TrumpCard
        ): [CardLocation, number, number] | null {
          const deck = get().deck;
          const cards = get().cards;
          switch (card.location) {
            case CardLocation.Stack: {
              return [CardLocation.Waste, 0, deck.waste.length];
            }
            case CardLocation.Waste: {
              // const lastCardId = deck.waste[deck.waste.length - 1];
              // if (lastCardId === card.id) {
              //   return null;
              // }

              for (const column of deck.foundation) {
                const lastCardId = column[column.length - 1]!;
                const lastCard = cards.find((c) => c.id === lastCardId)!;
                if (!lastCard && card.sign === 1) {
                  return [
                    CardLocation.Foundation,
                    deck.foundation.indexOf(column),
                    0,
                  ];
                }

                if (!lastCard) continue;
                if (canFoundationMatchTo(card, lastCard)) {
                  return [
                    CardLocation.Foundation,
                    deck.foundation.indexOf(column),
                    column.indexOf(lastCardId) + 1,
                  ];
                }
              }
              for (const column of deck.ground) {
                const lastCardId = column[column.length - 1]!;
                const lastCard = cards.find((c) => c.id === lastCardId)!;
                if (!lastCard) {
                  if (card.sign === 13) {
                    return [
                      CardLocation.Ground,
                      deck.ground.indexOf(column),
                      0,
                    ];
                  }
                  continue;
                }
                if (canGroundAttachTo(card, lastCard)) {
                  return [
                    CardLocation.Ground,
                    deck.ground.indexOf(column),
                    column.indexOf(lastCardId) + 1,
                  ];
                }
              }
              if (canTempAttachTo()) {
                return [CardLocation.Temp, 0, 0];
              }
              return null;
            }
            case CardLocation.Foundation: {
              for (const column of deck.ground) {
                const lastCardId = column[column.length - 1]!;
                const lastCard = cards.find((c) => c.id === lastCardId)!;
                if (!lastCard) continue;
                if (canGroundAttachTo(card, lastCard)) {
                  return [
                    CardLocation.Ground,
                    deck.ground.indexOf(column),
                    column.indexOf(lastCardId) + 1,
                  ];
                }
              }
              if (canTempAttachTo()) {
                return [CardLocation.Temp, 0, 0];
              }
              return null;
            }
            case CardLocation.Ground: {
              const foundationColumn =
                deck.foundation[CardTypeValues.indexOf(card.type)];
              const lastCardId = foundationColumn[foundationColumn.length - 1]!;
              const lastCard = cards.find((c) => c.id === lastCardId)!;
              if (
                (foundationColumn.length === 0 && card.sign === 1) ||
                (lastCard && canFoundationMatchTo(card, lastCard))
              ) {
                return [
                  CardLocation.Foundation,
                  CardTypeValues.indexOf(card.type),
                  foundationColumn.indexOf(lastCardId) + 1,
                ];
              }
              for (const column of deck.foundation) {
                for (const cardId of column) {
                  const targetCard = cards.find((c) => c.id === cardId);
                  if (!targetCard) continue;
                  if (canFoundationMatchTo(card, targetCard)) {
                    return [
                      CardLocation.Foundation,
                      deck.foundation.indexOf(column),
                      column.indexOf(cardId) + 1,
                    ];
                  }
                }
              }
              for (const column of deck.ground) {
                if (column.length === 0) {
                  if (card.sign === 13) {
                    return [
                      CardLocation.Ground,
                      deck.ground.indexOf(column),
                      0,
                    ];
                  }
                }
                const lastCardId = column[column.length - 1]!;
                const lastCard = cards.find((c) => c.id === lastCardId)!;
                if (!lastCard) continue;
                if (canGroundAttachTo(card, lastCard)) {
                  return [
                    CardLocation.Ground,
                    deck.ground.indexOf(column),
                    column.indexOf(lastCardId) + 1,
                  ];
                }
              }
              if (canTempAttachTo()) {
                return [CardLocation.Temp, 0, 0];
              }
              return null;
            }
            case CardLocation.Temp: {
              for (const column of deck.foundation) {
                const lastCardId = column[column.length - 1]!;
                const lastCard = cards.find((c) => c.id === lastCardId)!;
                if (!lastCard) continue;
                if (canFoundationMatchTo(card, lastCard)) {
                  return [
                    CardLocation.Foundation,
                    deck.foundation.indexOf(column),
                    column.indexOf(lastCardId) + 1,
                  ];
                }
              }
              for (const column of deck.ground) {
                const lastCardId = column[column.length - 1]!;
                const lastCard = cards.find((c) => c.id === lastCardId)!;
                if (!lastCard) continue;
                if (canGroundAttachTo(card, lastCard)) {
                  return [
                    CardLocation.Ground,
                    deck.ground.indexOf(column),
                    column.indexOf(lastCardId) + 1,
                  ];
                }
              }
              if (canTempAttachTo()) {
                return [CardLocation.Temp, 0, 0];
              }

              return null;
            }
          }
        }

        /* 3. 카드를 이동할 수 있는 위치를 찾는 함수 */
        function canGroundAttachTo(card1: TrumpCard, card2: TrumpCard) {
          if (!card2?.isFlipped) return false;

          const isAllowLocation = card1.location !== CardLocation.Stack;
          const isCrossMatchType =
            card1.type !== card2.type && card1.color !== card2.color;
          const isStackable = card1.sign === card2.sign - 1;

          if (!isAllowLocation) return false;
          if (!isCrossMatchType) return false;
          if (!isStackable) return false;

          return true;
        }

        function canTempAttachTo() {
          const temp = get().deck.temp;
          if (temp.length === 0) return true;
          return false;
        }

        function canFoundationMatchTo(card1: TrumpCard, card2: TrumpCard) {
          if (!card2.isFlipped) return false;

          const isSameLocation =
            card1.location !== card2.location &&
            card2.location === CardLocation.Foundation;
          const isMatchType =
            card1.type === card2.type && card1.color === card2.color;
          const isStackable = card1.sign === card2.sign + 1;

          if (!isSameLocation) return false;
          if (!isMatchType) return false;
          if (!isStackable) return false;

          return true;
        }

        /* 4. 카드를 이동하는 함수 */
        function moveCardTo(card: TrumpCard) {
          let wrong = false;

          set((state) => {
            let slice: string[] = [];
            const targetCard = state.cards.find((c) => c.id === card.id)!;
            const originLocation = targetCard.location;
            const originColumn = targetCard.column;
            const originRow = targetCard.row;
            const originField = state.deck[targetCard.location];

            // if (targetCard.location === CardLocation.Stack) {
            //   // targetCard.isFlipped = true;
            //   targetCard.isFlipped = true;
            //   targetCard.isMoving = true;
            //   targetCard.location = CardLocation.Waste;
            //   targetCard.column = 0;
            //   targetCard.row = state.deck.waste.length;
            //   const sliceCard = state.deck.stack.splice(
            //     state.deck.stack.indexOf(targetCard.id),
            //     1
            //   );
            //   state.deck.waste.push(...sliceCard);
            //   return;
            // }

            if (
              !targetCard.isFlipped &&
              targetCard.location !== CardLocation.Stack
            ) {
              return;
            }

            const result = findMovableIndex(card);
            const location = result?.[0];
            const columnIndex = result?.[1];
            const rowIndex = result?.[2];
            const deck = state.deck[targetCard.location];

            if (isNil(location) || isNil(columnIndex) || isNil(rowIndex)) {
              wrong = true;
              return;
            }

            if (targetCard.location === CardLocation.Stack) {
              targetCard.isFlipped = true;
              targetCard.isMoving = true;
              targetCard.location = CardLocation.Waste;
              targetCard.column = columnIndex;
              targetCard.row = rowIndex;
              const sliceCard = state.deck.stack.splice(
                state.deck.stack.indexOf(targetCard.id),
                1
              );
              state.deck.waste.push(...sliceCard);
              return;
            }

            if (isDoubleArray(originField)) {
              slice = originField[targetCard.column].slice(targetCard.row);
            } else {
              slice = originField.slice(targetCard.row);
            }

            // if (isDoubleArray(deck)) {
            //   const behindCardId = deck[targetCard.column][targetCard.row - 1];
            //   const behindCard = state.cards.find((c) => c.id === behindCardId);
            //   if (behindCard) {
            //     if (!behindCard.isFlipped && slice.length >= 1) {
            //       behindCard.isFlipped = true;
            //     }
            //   }
            // } else {
            //   const behindCardId = deck[deck.length - 1];
            //   const behindCard = state.cards.find((c) => c.id === behindCardId);
            //   if (behindCard) {
            //     if (
            //       !behindCard.isFlipped &&
            //       (slice.length === 1 ||
            //         (slice.length > 1 &&
            //           behindCard.location === CardLocation.Ground))
            //     )
            //       behindCard.isFlipped = true;
            //   }
            // }

            const field = state.deck[location];

            if (isDoubleArray(originField)) {
              if (slice.length > 1) {
                if (
                  location !== CardLocation.Ground ||
                  (location === CardLocation.Ground &&
                    targetCard.location === CardLocation.Waste)
                ) {
                  wrong = true;
                  return;
                }
              }
              originField[targetCard.column].splice(
                targetCard.row,
                slice.length
              );
            } else {
              if (slice.length > 1) {
                if (
                  location !== CardLocation.Ground ||
                  (location === CardLocation.Ground &&
                    targetCard.location === CardLocation.Waste)
                ) {
                  wrong = true;
                  return;
                }
              }
              originField.splice(targetCard.row, slice.length);
            }
            if (isDoubleArray(field)) {
              field[columnIndex].push(...slice);
              let offset = 0;
              for (const cardId of slice) {
                const card = state.cards.find((c) => c.id === cardId);
                if (card) {
                  card.column = columnIndex;
                  card.row = rowIndex + offset;
                  offset++;
                }
              }
            } else {
              field.push(...slice);
              let offset = 0;
              for (const cardId of slice) {
                const card = state.cards.find((c) => c.id === cardId);
                if (card) {
                  card.column = columnIndex;
                  card.row = rowIndex + offset;
                  offset++;
                }
              }
            }
            targetCard.location = location;
            targetCard.isMoving = true;
            // if (!targetCard.isFlipped) targetCard.isFlipped = true;

            if (targetCard.isMoving) {
              const behindCardId = getBehindCard(
                originLocation,
                originColumn,
                originRow
              );
              const behindCard = state.cards.find(
                (c) => c.id === behindCardId
              )!;
              if (behindCard && !behindCard.isFlipped) {
                behindCard.isFlipped = true;
              }
            }
          });

          if (wrong) {
            shakeCard(card.id);
            wrong = false;
          }
        }

        function getBehindCard(
          location: CardLocation,
          column: number,
          row: number
        ) {
          const deck = get().deck[location];
          if (isDoubleArray(deck)) {
            return deck[column][row - 1];
          } else {
            return deck[row - 1];
          }
        }

        const isBottomStraight = (location: CardLocation) =>
          location === CardLocation.Ground;

        const isRightStraight = (location: CardLocation) =>
          location === CardLocation.Waste;

        const isNoStraight = (location: CardLocation) =>
          location === CardLocation.Foundation ||
          location === CardLocation.Stack ||
          location === CardLocation.Temp;

        function clickCard(cardId: string) {
          if (get().actionLock) return;
          locked();
          const card = get().cards.find((card) => card.id === cardId);

          if (!card) return;

          switch (card.location) {
            case CardLocation.Stack: {
              // flipCard(cardId);
              moveCardTo(card);
              break;
            }
            case CardLocation.Waste: {
              moveCardTo(card);
              break;
            }
            case CardLocation.Foundation: {
              moveCardTo(card);
              break;
            }
            case CardLocation.Ground: {
              moveCardTo(card);
              break;
            }
            case CardLocation.Temp: {
              moveCardTo(card);
              break;
            }
          }
          setTimeout(() => {
            set((state) => {
              const targetCard = state.cards.find((c) => c.id === cardId)!;
              targetCard.isMoving = false;
              targetCard.isShaking = false;
            });
            unLocked();
          }, ANIMATE_TIME * OFFSET_TIME);
        }

        function resetWaste() {
          set((state) => {
            const wastes = state.deck.waste;
            state.deck.waste = [];
            state.deck.stack = wastes.reverse();
            for (const waste of wastes) {
              const card = state.cards.find((c) => c.id === waste)!;
              card.location = CardLocation.Stack;
              card.row = wastes.indexOf(waste);
              card.column = 0;
              card.isFlipped = false;
              card.isMoving = true;
            }
          });
        }

        function reRender() {
          set((state) => {
            state.rev++;
          });
        }

        return {
          setCards,
          clearGame,
          gameSetting,
          setIsReady,
          addBoardBase,
          insertCardBase,
          getBoardBase,
          getCardBase,
          setSelectedCards,
          setStacks,
          setWastes,
          setFoundations,
          setGrounds,
          setTemps,
          validate: {
            isBottomStraight,
            isRightStraight,
            isNoStraight,
          },
          actions: { clickCard, resetWaste, reRender },
        };
      })
    )
  )
);
