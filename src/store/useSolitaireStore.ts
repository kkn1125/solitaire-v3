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
import { sleep } from "@/util/sleep";
import { enableMapSet } from "immer";
import { create } from "zustand";
import { combine, devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

enableMapSet();

/** `clickCard`가 성공했을 때만 `kind`가 붙습니다. */
export type CardClickResult =
  | { ok: false }
  | { ok: true; kind: "draw" | "move" };

/** `checkAutoClearable` 시뮬레이션 한 수(파운데이션으로만 이동). */
export type AutoClearHistoryEntry = {
  cardId: string;
  fromLocation: CardLocation;
  /** 항상 파운데이션으로만 이동 */
  toLocation: typeof CardLocation.Foundation;
  /** 파운데이션 해당 컬럼에서의 인덱스(쌓인 뒤의 row) */
  row: number;
  /** 파운데이션 컬럼 0~3 */
  column: number;
};

const animationLockArray = [] as ReturnType<typeof setTimeout>[];

const initialState = {
  rev: 0,
  isReady: false,
  isWaiting: false,
  isAutoClearable: false,
  clearHistory: [] as AutoClearHistoryEntry[],
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

// function generateIssueCards() {
//   const issueCards = [
//     {
//       id: "cjiv5v-yratit-4qj3yz",
//       sign: 1,
//       type: "club",
//       color: "inherit",
//       location: "foundation",
//       row: 0,
//       column: 3,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "ukbmc5-epd5fc-hnodkb",
//       sign: 2,
//       type: "club",
//       color: "inherit",
//       location: "foundation",
//       row: 1,
//       column: 3,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "yskghp-uzbck7-k0kfow",
//       sign: 3,
//       type: "club",
//       color: "inherit",
//       location: "foundation",
//       row: 2,
//       column: 3,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "44zanj-g4pg1u-9jrhao",
//       sign: 4,
//       type: "club",
//       color: "inherit",
//       location: "foundation",
//       row: 3,
//       column: 3,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "e87lmn-fyybxx-ecc0gh",
//       sign: 5,
//       type: "club",
//       color: "inherit",
//       location: "stack",
//       row: 3,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "ri7we3-izd2g5-ugi9kw",
//       sign: 6,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 7,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "dwico7-u5bes2-aj6sbc",
//       sign: 7,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 6,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "qptafg-lz6l5y-j0olxl",
//       sign: 8,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 5,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "ml1ohk-hzkznq-0bg1i3",
//       sign: 9,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 4,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "j1nnnc-ohym6i-pamoes",
//       sign: 10,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 3,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "njzmuz-wc0gn7-24bqsz",
//       sign: 11,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 2,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "3umbt3-big8da-vg8qdg",
//       sign: 12,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 1,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "ebu5e8-bxu1nx-erw6za",
//       sign: 13,
//       type: "club",
//       color: "inherit",
//       location: "ground",
//       row: 0,
//       column: 4,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "ghjsc0-kbvpoc-yffhw1",
//       sign: 1,
//       type: "diamond",
//       color: "error",
//       location: "foundation",
//       row: 0,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "nyezyx-gf48eh-aod2by",
//       sign: 2,
//       type: "diamond",
//       color: "error",
//       location: "foundation",
//       row: 1,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "dq495w-tjwlf4-136slp",
//       sign: 3,
//       type: "diamond",
//       color: "error",
//       location: "stack",
//       row: 2,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "sof9f3-lwlc93-e47bkj",
//       sign: 4,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 0,
//       column: 5,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "urted7-iqp5v2-qrvq54",
//       sign: 5,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 8,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "4yjlzx-w633i9-2j6qff",
//       sign: 6,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 7,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "me602v-94163q-d844ao",
//       sign: 7,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 6,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "3henpq-p6jmbc-fkj1qs",
//       sign: 8,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 1,
//       column: 5,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "od18kj-3limup-bspqzy",
//       sign: 9,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 4,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "z45n7b-ly5uw8-8rkq7h",
//       sign: 10,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 3,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "ygoxx5-35qmbw-rcpxpt",
//       sign: 11,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 2,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "dx6k4v-4i5zxz-ogfjri",
//       sign: 12,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 1,
//       column: 4,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "f01b5o-z14046-1gt3hc",
//       sign: 13,
//       type: "diamond",
//       color: "error",
//       location: "ground",
//       row: 0,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "jr2z4p-1djkbp-peubf4",
//       sign: 1,
//       type: "heart",
//       color: "error",
//       location: "foundation",
//       row: 0,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "vm9l4m-0hql7i-j0t6px",
//       sign: 2,
//       type: "heart",
//       color: "error",
//       location: "foundation",
//       row: 1,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "a1ntwc-nqguxk-a16q51",
//       sign: 3,
//       type: "heart",
//       color: "error",
//       location: "foundation",
//       row: 2,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "p5ogg4-l3snl2-3xru5w",
//       sign: 4,
//       type: "heart",
//       color: "error",
//       location: "foundation",
//       row: 3,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "1039ur-06bru0-ju2k2b",
//       sign: 5,
//       type: "heart",
//       color: "error",
//       location: "foundation",
//       row: 4,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "lyj7ra-69wbme-74abqx",
//       sign: 6,
//       type: "heart",
//       color: "error",
//       location: "foundation",
//       row: 5,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "jvljbt-1c2ljz-p4ue7s",
//       sign: 7,
//       type: "heart",
//       color: "error",
//       location: "stack",
//       row: 5,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "mv1q2j-6osr4r-g1askr",
//       sign: 8,
//       type: "heart",
//       color: "error",
//       location: "ground",
//       row: 5,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "sbsicp-o4p4qh-2p62w9",
//       sign: 9,
//       type: "heart",
//       color: "error",
//       location: "ground",
//       row: 4,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "xakmhn-m4cuws-3k6qoj",
//       sign: 10,
//       type: "heart",
//       color: "error",
//       location: "stack",
//       row: 0,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "uj8f5b-vl9613-h3axj6",
//       sign: 11,
//       type: "heart",
//       color: "error",
//       location: "ground",
//       row: 2,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "ifj9q9-8zrhef-u53oi6",
//       sign: 12,
//       type: "heart",
//       color: "error",
//       location: "ground",
//       row: 1,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "lfwxxi-bagzu9-eizvf0",
//       sign: 13,
//       type: "heart",
//       color: "error",
//       location: "ground",
//       row: 0,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "1n3p1v-641qra-bw20v7",
//       sign: 1,
//       type: "spade",
//       color: "inherit",
//       location: "foundation",
//       row: 0,
//       column: 1,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "08wrzc-h0khg8-v5wesl",
//       sign: 2,
//       type: "spade",
//       color: "inherit",
//       location: "foundation",
//       row: 1,
//       column: 1,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "xeukxk-ll32ry-la79d2",
//       sign: 3,
//       type: "spade",
//       color: "inherit",
//       location: "foundation",
//       row: 2,
//       column: 1,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "34qbsu-ll0wf7-emmuhb",
//       sign: 4,
//       type: "spade",
//       color: "inherit",
//       location: "foundation",
//       row: 3,
//       column: 1,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "jpny38-kdkplx-6ryo74",
//       sign: 5,
//       type: "spade",
//       color: "inherit",
//       location: "ground",
//       row: 8,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "fhpja6-nht70m-357qkg",
//       sign: 6,
//       type: "spade",
//       color: "inherit",
//       location: "stack",
//       row: 4,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "gluypr-adeg1k-48tkn2",
//       sign: 7,
//       type: "spade",
//       color: "inherit",
//       location: "ground",
//       row: 2,
//       column: 5,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "qm70up-ezcyk1-4wnrhr",
//       sign: 8,
//       type: "spade",
//       color: "inherit",
//       location: "ground",
//       row: 5,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "757ktx-ty72kp-yo7nt2",
//       sign: 9,
//       type: "spade",
//       color: "inherit",
//       location: "stack",
//       row: 1,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "qfrp57-4dhx6x-l0p0oy",
//       sign: 10,
//       type: "spade",
//       color: "inherit",
//       location: "ground",
//       row: 3,
//       column: 6,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "43fh16-1p5tjr-hzbtja",
//       sign: 11,
//       type: "spade",
//       color: "inherit",
//       location: "stack",
//       row: 6,
//       column: 0,
//       isFlipped: false,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "2i9hm8-540qup-pxunuw",
//       sign: 12,
//       type: "spade",
//       color: "inherit",
//       location: "ground",
//       row: 1,
//       column: 0,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//     {
//       id: "hjq0qj-ergoxl-nfy7do",
//       sign: 13,
//       type: "spade",
//       color: "inherit",
//       location: "ground",
//       row: 0,
//       column: 2,
//       isFlipped: true,
//       isMoving: false,
//       isShaking: false,
//     },
//   ] as TrumpCard[];

//   return issueCards;
// }

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
                clearHistory: [] as AutoClearHistoryEntry[],
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

          function shuffle<T>(cards: T[]): T[] {
            // To avoid mutating the original array (which may be frozen/readonly),
            // make a shallow copy before shuffling and return the new array.
            const arr = [...cards];
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
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
            // const cards = generateIssueCards();

            // // 카드 정보로부터 위치별로 아이디 배열을 만듭니다.
            // const foundations: string[][] = [[], [], [], []];
            // const grounds: string[][] = [[], [], [], [], [], [], []];
            // const temps: string[] = [];
            // const stacks: string[] = [];
            // const wastes: string[] = [];

            // cards.forEach((card) => {
            //   switch (card.location) {
            //     case "foundation":
            //       // 컬럼 정보 기반, 없으면 0번
            //       // foundations[card.column ?? 0].push(card.id);
            //       foundations[card.column ?? 0][card.row] = card.id;
            //       break;
            //     case "ground":
            //       // grounds[card.column ?? 0].push(card.id);
            //       grounds[card.column ?? 0][card.row] = card.id;
            //       break;
            //     case "temp":
            //       temps[card.row] = card.id;
            //       break;
            //     case "stack":
            //       stacks[card.row] = card.id;
            //       break;
            //     case "waste":
            //       wastes[card.row] = card.id;
            //       break;
            //   }
            // });

            // setCards(cards);
            // setFoundations(foundations);
            // setGrounds(grounds);
            // setTemps(temps);
            // setStacks(stacks);
            // setWastes(wastes);
            // setUseTempSlot(false);
            // setMoveChainIds([]);
            // setIsCardReady(true);
            // setActionLock(false);

            const cards = generateCards();
            // const cards = generateMockCards();
            setCards(cards);
            const newShuffledCards = shuffle(cards);
            // const newShuffledCards = [...cards];

            const grounds: string[][] = [];
            for (let col = 0; col < 7; col++) {
              const ground = newShuffledCards.splice(0, col + 1).map((card) => {
                return card.id;
              });
              grounds.push(ground);
            }
            setGrounds(grounds);
            setStacks(newShuffledCards.map((card) => card.id));

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

          function isAttachableToFoundation(
            card: TrumpCard,
          ): [number, string[]] | [-1, []] {
            const deck = get().deck;
            const cards = get().cards;
            // let stackableFoundationColumnIndex: number = -1;
            const isSelectedCardLast =
              card.row === (deck.ground[card.column ?? 0]?.length ?? 0) - 1;

            if (!isSelectedCardLast) return [-1, []];

            for (const column of deck.foundation) {
              const index = deck.foundation.indexOf(column);
              const lastCardId = column[column.length - 1]!;
              const lastCard = cards.find((c) => c.id === lastCardId)!;
              const isAceFirstCard = column.length === 0 && card.sign === 1;
              const isStackableToLastCard =
                lastCard &&
                card.sign === lastCard.sign + 1 &&
                card.type === lastCard.type;

              if (isAceFirstCard || isStackableToLastCard) {
                // stackableFoundationColumnIndex = index;
                // break;
                return [index, column];
              }
            }

            return [-1, []];
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
                const [index, column] = isAttachableToFoundation(card);
                if (index !== -1) {
                  return [CardLocation.Foundation, index, column.length];
                }

                for (const column of deck.ground) {
                  const isKingFirstCard =
                    card.sign === 13 && column.length === 0;
                  if (isKingFirstCard) {
                    return [
                      CardLocation.Ground,
                      deck.ground.indexOf(column),
                      0,
                    ];
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
            const column = get().deck[card1.location][card1.column ?? 0];
            const isLast = column.indexOf(card1.id) === column.length - 1;

            if (card1.location === CardLocation.Ground && !isLast) return false;

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
          /**
           * checkAutoClearable
           *
           * 1. 그라운드의 모든 카드가 공개(isFlipped)되어 있어야 함.
           * 2. 파운데이션 규칙(빈 칸 = A만, 이후 같은 타입 +1)으로 ground·temp의
           *    카드를 한 장씩 시뮬레이션해 모두 올릴 수 있으면 성공.
           * 3. 시뮬 순서는 파운데이션 컬럼 0→3, 소스는 그라운드 0→n-1 → temp (에이스는 빈 칸에만).
           * 4. 성공 시 이동 순서를 `clearHistory`에 저장. 실패 시 빈 배열.
           * @returns 자동 완성(파운데이션만으로) 가능 여부
           */
          function checkAutoClearable(): boolean {
            set((state) => {
              state.clearHistory = [];
              state.isAutoClearable = false;
            });

            const { cards, deck, useTempSlot } = get();

            const cardMap = cards.reduce(
              (acc, card) => {
                acc[card.id] = card;
                return acc;
              },
              {} as Record<string, TrumpCard>,
            );

            for (const column of deck.ground) {
              for (const cardId of column) {
                const card = cardMap[cardId];
                if (!card?.isFlipped) {
                  return false;
                }
              }
            }

            let simTemp: string | null = null;
            if (useTempSlot && deck.temp.length > 0) {
              simTemp = deck.temp[0]!;
              const t = cardMap[simTemp];
              if (!t?.isFlipped) {
                return false;
              }
            }

            function canPlaceOnFoundationColumn(
              card: TrumpCard,
              foundationColumn: string[],
            ): boolean {
              if (foundationColumn.length === 0) {
                return card.sign === 1;
              }
              const lastId = foundationColumn[foundationColumn.length - 1]!;
              const last = cardMap[lastId];
              return (
                !!last && last.type === card.type && last.sign + 1 === card.sign
              );
            }

            type Pick = {
              cardId: string;
              fromLocation: CardLocation;
              toFoundationCol: number;
              toFoundationRow: number;
            };

            function pickNextMove(
              foundation: string[][],
              ground: string[][],
              tempId: string | null,
            ): Pick | null {
              for (let f = 0; f < foundation.length; f++) {
                const fcol = foundation[f];
                for (let g = 0; g < ground.length; g++) {
                  const gcol = ground[g];
                  if (gcol.length === 0) continue;
                  const topId = gcol[gcol.length - 1]!;
                  const card = cardMap[topId];
                  if (!card || !canPlaceOnFoundationColumn(card, fcol)) {
                    continue;
                  }
                  return {
                    cardId: topId,
                    fromLocation: CardLocation.Ground,
                    toFoundationCol: f,
                    toFoundationRow: fcol.length,
                  };
                }
                if (tempId) {
                  const card = cardMap[tempId];
                  if (card && canPlaceOnFoundationColumn(card, fcol)) {
                    return {
                      cardId: tempId,
                      fromLocation: CardLocation.Temp,
                      toFoundationCol: f,
                      toFoundationRow: fcol.length,
                    };
                  }
                }
              }
              return null;
            }

            const foundation = deck.foundation.map((col) => [...col]);
            const ground = deck.ground.map((col) => [...col]);
            const history: AutoClearHistoryEntry[] = [];

            while (true) {
              const move = pickNextMove(foundation, ground, simTemp);
              if (!move) break;

              history.push({
                cardId: move.cardId,
                fromLocation: move.fromLocation,
                toLocation: CardLocation.Foundation,
                row: move.toFoundationRow,
                column: move.toFoundationCol,
              });

              foundation[move.toFoundationCol].push(move.cardId);
              if (move.fromLocation === CardLocation.Ground) {
                for (let g = 0; g < ground.length; g++) {
                  const gcol = ground[g];
                  if (
                    gcol.length > 0 &&
                    gcol[gcol.length - 1] === move.cardId
                  ) {
                    gcol.pop();
                    break;
                  }
                }
              } else {
                simTemp = null;
              }
            }

            const allGroundCleared = ground.every((col) => col.length === 0);
            const success = allGroundCleared && simTemp === null;

            set((state) => {
              state.clearHistory = success ? history : [];
              state.isAutoClearable = success;
            });

            return success;
          }

          async function autoClear() {
            if (!checkAutoClearable()) return;
            set((state) => {
              state.isAutoClearable = false;
            });

            locked();

            const clearHistory = [...get().clearHistory];
            const cards = [...get().cards];

            while (clearHistory.length > 0) {
              const entry = clearHistory.shift()!;
              const card = cards.find((c) => c.id === entry.cardId)!;
              queueMicrotask(() => {
                moveCardTo(card);
                set((state) => {
                  state.scoreHistory.push([ScoreType.GroundToFoundation, true]);
                });
              });
              await sleep(100);
            }

            unLocked();
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
              checkAutoClearable,
              autoClear,
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
