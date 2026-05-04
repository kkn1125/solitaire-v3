import {
  CardColor,
  CardLocation,
  CardType,
  CardTypeValues,
  ScoreType,
  type CardSignKey,
} from "@/config/enums";
import { ANIMATE_TIME, OFFSET_TIME } from "@/config/variable";
import { isDoubleArray } from "@/util/isArray";
import { isNil } from "@/util/isNil";
import { enableMapSet } from "immer";
import { create } from "zustand";
import { combine, devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

enableMapSet();

/** `clickCard`가 성공했을 때만 `kind`가 붙습니다. */
export type CardClickResult =
  | { ok: false }
  | { ok: true; kind: "draw" | "move" };

const animationLockArray = [] as ReturnType<typeof setTimeout>[];

const initialState = {
  rev: 0,
  isReady: false,
  isWaiting: false,
  isBaseBindReady: false,
  isBindReady: false,
  isCardReady: false,
  actionLock: false,
  shake: false,
  elementLoadCount: 0,
  scoreHistory: [] as [ScoreType, boolean][],
  moveChainIds: [] as string[],
  cards: [] as TrumpCard[],
  useTempSlot: false,
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

// 총 두 장이고, (index / 4)로 나눠서 type 계산하도록 수정!
// function generateMockCards() {
//   // 2장씩 26쌍 = 52장
//   return Array.from({ length: 2 }, (_, index): TrumpCard => {
//     // type은 index/4로 나누면 0~12까지, 각 type 4장씩 13쌍씩 쌍
//     const type = CardTypeValues[Math.floor(index / 4)];
//     // color 결정
//     let color;
//     switch (type) {
//       case CardType.Club:
//       case CardType.Spade:
//         color = CardColor.Black;
//         break;
//       case CardType.Diamond:
//       case CardType.Heart:
//         color = CardColor.Red;
//         break;
//       default:
//         color = CardColor.Black;
//     }
//     // sign은 1~13 두 번씩
//     const sign = ((index % 13) + 1) as CardSignKey;
//     return {
//       id: createId(),
//       sign,
//       type,
//       color,
//       location: CardLocation.Stack,
//       row: 0,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     };
//   });
// }

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

export const useSolitaireStore = create(
  devtools(
    subscribeWithSelector(
      immer(
        combine({ ...initialState }, (set, get) => {
          type CardBaseSlot = {
            location: CardLocation;
            id: string;
            rect: DOMRect;
          };
          const pendingCardBaseSlots: CardBaseSlot[] = [];
          let pendingCardBaseFlushScheduled = false;
          function flushPendingCardBaseSlots() {
            pendingCardBaseFlushScheduled = false;
            if (pendingCardBaseSlots.length === 0) return;
            const batch = pendingCardBaseSlots.splice(
              0,
              pendingCardBaseSlots.length,
            );
            set((state) => {
              for (const { location, id, rect } of batch) {
                state.cardBase[location].set(id, rect);
              }
            });
          }

          function setMoveChainIds(moveChainIds: string[]) {
            set((state) => {
              state.moveChainIds = moveChainIds;
            });
          }

          function clearGame() {
            pendingCardBaseSlots.length = 0;
            pendingCardBaseFlushScheduled = false;
            set((draft) => {
              Object.assign(draft, {
                ...initialState,
                cards: [] as TrumpCard[],
                scoreHistory: [] as [ScoreType, boolean][],
                moveChainIds: [] as string[],
                selectedCard: [] as string[],
                deck: {
                  stack: [] as string[],
                  waste: [] as string[],
                  foundation: [[], [], [], []] as string[][],
                  ground: [] as string[][],
                  temp: [] as string[],
                },
              });
              draft.cardBase.board = null;
              draft.cardBase.stack.clear();
              draft.cardBase.waste.clear();
              draft.cardBase.foundation.clear();
              draft.cardBase.ground.clear();
              draft.cardBase.temp.clear();
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

          function shuffle<T>(cards: T[]) {
            return [...cards].sort(() => Math.random() - 0.5);
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
                if (lastCard) {
                  lastCard.isFlipped = true;
                }
              }
              state.deck.ground = grounds;
            });
          }

          function setTemps(temps: string[]) {
            set((state) => {
              state.deck.temp = temps;
            });
          }

          function setUseTempSlot(useTempSlot: boolean) {
            set((state) => {
              state.useTempSlot = useTempSlot;
            });
          }

          function setActionLock(actionLock: boolean) {
            set((state) => {
              state.actionLock = actionLock;
            });
          }

          function gameSetting() {
            const cards = generateCards();
            // const cards = generateMockCards();
            setCards(cards);
            const newSuffledCards = /* [...cards]; */ shuffle(cards);

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
            setUseTempSlot(false);
            setMoveChainIds([]);

            setIsCardReady(true);
            setActionLock(false);
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
              if (get().isBindReady) {
                pendingCardBaseSlots.push({
                  location,
                  id,
                  rect: boundRect,
                });
                if (!pendingCardBaseFlushScheduled) {
                  pendingCardBaseFlushScheduled = true;
                  queueMicrotask(flushPendingCardBaseSlots);
                }
                return;
              }
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
            animationLockArray.forEach((candidate) => {
              clearTimeout(candidate);
            });
            animationLockArray.splice(0, animationLockArray.length);
            setActionLock(true);
          }
          function unLocked() {
            setActionLock(false);
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
                      : never,
          >(location: Location, id: Id) {
            return get().cardBase[location].get(id);
          }

          /* 1. 카드를 이동할 수 있는 위치를 찾는 함수 */
          /* [CardLocation, column, row] */
          function findMovableIndex(
            card: TrumpCard,
          ): [CardLocation, number, number] | null {
            const deck = get().deck;
            const cards = get().cards;
            switch (card.location) {
              case CardLocation.Stack: {
                return [CardLocation.Waste, 0, deck.waste.length];
              }
              case CardLocation.Waste: {
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
                const lastCardId =
                  foundationColumn[foundationColumn.length - 1]!;
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

          /* 2. 카드를 이동할 수 있는 위치를 찾는 함수 */
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
            if (temp.length === 0 && get().useTempSlot) return true;
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
            const fromTo: [CardLocation, CardLocation, boolean] = [
              card.location,
              card.location,
              false,
            ];

            set((state) => {
              let slice: string[] = [];
              const targetCard = state.cards.find((c) => c.id === card.id)!;
              const originLocation = targetCard.location;
              const originColumn = targetCard.column;
              const originRow = targetCard.row;
              const originField = state.deck[originLocation];

              if (
                !targetCard.isFlipped &&
                originLocation !== CardLocation.Stack
              ) {
                return;
              }

              const result = findMovableIndex(card);
              /**
               * 목적지 위치
               */
              const location = result?.[0];
              const columnIndex = result?.[1];
              const rowIndex = result?.[2];
              // const deck = state.deck[targetCard.location];

              if (isNil(location) || isNil(columnIndex) || isNil(rowIndex)) {
                wrong = true;
                return;
              }

              if (originLocation === CardLocation.Stack) {
                targetCard.isFlipped = true;
                targetCard.isMoving = true;
                targetCard.location = CardLocation.Waste;
                targetCard.column = columnIndex;
                targetCard.row = rowIndex;
                const sliceCard = state.deck.stack.splice(
                  state.deck.stack.indexOf(targetCard.id),
                  1,
                );
                state.deck.waste.push(...sliceCard);

                fromTo[0] = CardLocation.Stack;
                fromTo[1] = CardLocation.Waste;
                fromTo[2] = true;
                return;
              }

              if (isDoubleArray(originField)) {
                slice = originField[targetCard.column].slice(targetCard.row);
              } else {
                slice = originField.slice(targetCard.row);
              }

              const field = state.deck[location];

              /* ground, foundation 일 때 */
              if (isDoubleArray(originField)) {
                if (slice.length > 1) {
                  if (
                    location !== CardLocation.Ground ||
                    (location === CardLocation.Ground &&
                      originLocation === CardLocation.Waste)
                  ) {
                    wrong = true;
                    return;
                  }
                }
                originField[targetCard.column].splice(
                  targetCard.row,
                  slice.length,
                );
              } else {
                /* temp, waste, stack 일 때 */
                if (slice.length > 1) {
                  if (
                    location !== CardLocation.Ground ||
                    (location === CardLocation.Ground &&
                      originLocation === CardLocation.Waste)
                  ) {
                    wrong = true;
                    return;
                  }
                }
                originField.splice(targetCard.row, slice.length);
              }

              /* ground, foundation 일 때 */
              if (isDoubleArray(field)) {
                field[columnIndex].push(...slice);
                let offset = 0;
                for (const cardId of slice) {
                  const card = state.cards.find((c) => c.id === cardId);
                  if (card) {
                    card.column = columnIndex;
                    card.row = rowIndex + offset;
                    card.isMoving = true;
                    card.isShaking = false;
                    card.location = location;

                    state.moveChainIds.push(cardId);
                    offset++;
                  }
                }
              } else {
                /* temp, waste, stack 일 때 */
                field.push(...slice);
                let offset = 0;
                for (const cardId of slice) {
                  const card = state.cards.find((c) => c.id === cardId);
                  if (card) {
                    card.column = columnIndex;
                    card.row = rowIndex + offset;
                    card.isMoving = true;
                    card.isShaking = false;
                    card.location = location;

                    state.moveChainIds.push(cardId);
                    offset++;
                  }
                }
              }

              targetCard.location = location;
              targetCard.isMoving = true;
              // if (!targetCard.isFlipped) targetCard.isFlipped = true;

              fromTo[0] = originLocation;
              fromTo[1] = location;
              fromTo[2] = true;

              if (targetCard.isMoving) {
                const behindCardId = getBehindCard(
                  originLocation,
                  originColumn,
                  originRow,
                );
                const behindCard = state.cards.find(
                  (c) => c.id === behindCardId,
                )!;
                if (behindCard && !behindCard.isFlipped) {
                  behindCard.isFlipped = true;
                }
              }
            });

            if (wrong) {
              shakeCard(card.id);
              fromTo[2] = false;
            }

            return fromTo;
          }

          function getBehindCard(
            location: CardLocation,
            column: number,
            row: number,
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

          function clickCard(cardId: string): CardClickResult {
            if (get().actionLock) return { ok: false };
            locked();

            const card = get().cards.find((card) => card.id === cardId);

            if (!card) {
              unLocked();
              return { ok: false };
            }

            const [from, to, isSuccess] = moveCardTo(card);
            let candidate: ReturnType<typeof setTimeout> | null = null;

            function postClickCard() {
              set((state) => {
                const targetCard = state.cards.find((c) => c.id === cardId)!;
                targetCard.isMoving = false;
                targetCard.isShaking = false;

                for (const chainId of state.moveChainIds) {
                  const card = state.cards.find((c) => c.id === chainId)!;
                  card.isMoving = false;
                  card.isShaking = false;
                }

                state.moveChainIds.splice(0, state.moveChainIds.length);
              });
              candidate = null;
              unLocked();
            }

            if (!isSuccess) {
              candidate = setTimeout(postClickCard, ANIMATE_TIME * OFFSET_TIME);
              return { ok: false };
            }

            const interactionKind: "draw" | "move" =
              from === CardLocation.Stack && to === CardLocation.Waste
                ? "draw"
                : "move";

            set((state) => {
              // 정책(ScoreType) 개수에 맞춰 매핑을 명시적으로 구성
              const moveScoreMap: { [key: string]: ScoreType } = {
                [`${CardLocation.Ground}_${CardLocation.Foundation}`]:
                  ScoreType.GroundToFoundation,
                [`${CardLocation.Waste}_${CardLocation.Foundation}`]:
                  ScoreType.WasteToFoundation,
                [`${CardLocation.Stack}_${CardLocation.Foundation}`]:
                  ScoreType.StackToFoundation,
                [`${CardLocation.Stack}_${CardLocation.Ground}`]:
                  ScoreType.StackToGround,
                [`${CardLocation.Waste}_${CardLocation.Ground}`]:
                  ScoreType.WasteToGround,
                [`${CardLocation.Temp}_${CardLocation.Ground}`]:
                  ScoreType.TempToGround,
                [`${CardLocation.Temp}_${CardLocation.Foundation}`]:
                  ScoreType.TempToFoundation,
                [`${CardLocation.Foundation}_${CardLocation.Ground}`]:
                  ScoreType.FoundationToGround,
                [`${CardLocation.Foundation}_${CardLocation.Waste}`]:
                  ScoreType.FoundationToWaste,
                [`${CardLocation.Waste}_${CardLocation.Stack}`]:
                  ScoreType.WasteToStack,
                [`${CardLocation.Temp}_${CardLocation.Waste}`]:
                  ScoreType.TempToWaste,
                [`${CardLocation.Foundation}_${CardLocation.Temp}`]:
                  ScoreType.FoundationToTemp, // 추가된 정책
                [`${CardLocation.Ground}_${CardLocation.Temp}`]:
                  ScoreType.GroundToTemp, // 추가된 정책
                [`${CardLocation.Waste}_${CardLocation.Temp}`]:
                  ScoreType.WasteToTemp, // 추가된 정책
              };

              const moveKey = `${from}_${to}`;
              if (moveScoreMap[moveKey] !== undefined) {
                state.scoreHistory.push([moveScoreMap[moveKey], isSuccess]);
              }
            });

            candidate = setTimeout(postClickCard, ANIMATE_TIME * OFFSET_TIME);
            animationLockArray.push(candidate);

            return { ok: true, kind: interactionKind };
          }

          function resetWaste() {
            locked();

            set((state) => {
              const wastes = state.deck.waste.splice(
                0,
                state.deck.waste.length,
              );
              const stackSize = state.deck.stack.length;

              wastes.reverse();

              state.deck.stack = state.deck.stack.concat(wastes);

              for (const waste of wastes) {
                const idx = wastes.indexOf(waste) + stackSize;
                const card = state.cards.find((c) => c.id === waste)!;
                card.location = CardLocation.Stack;
                card.row = idx;
                card.column = 0;
                card.isFlipped = false;
                card.isMoving = true;
                state.moveChainIds.push(waste);
              }
            });

            setTimeout(() => {
              set((state) => {
                for (const chainId of state.moveChainIds) {
                  const card = state.cards.find((c) => c.id === chainId)!;
                  card.isMoving = false;
                  card.isShaking = false;
                }

                state.moveChainIds.splice(0, state.moveChainIds.length);
              });
              unLocked();
            }, ANIMATE_TIME * OFFSET_TIME);
          }

          function reRender() {
            set((state) => {
              state.rev++;
            });
          }

          function waiting() {
            set((state) => {
              state.isWaiting = true;
            });
          }

          function unWaiting() {
            set((state) => {
              state.isWaiting = false;
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
            setUseTempSlot,
            validate: {
              isBottomStraight,
              isRightStraight,
              isNoStraight,
            },
            actions: {
              clickCard,
              resetWaste,
              reRender,
              waiting,
              unWaiting,
              locked,
              unLocked,
            },
          };
        }),
      ),
    ),
    {
      name: "solitaire",
      enabled: import.meta.env.DEV,
    },
  ),
);
