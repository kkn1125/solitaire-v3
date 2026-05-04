/**
 * 화면 폭 구간(MUI 기본 breakpoint와 동일한 숫자) + 초소형 구간 412.
 * `useWindowSize`의 분기와 동일해야 한다.
 */
export const BREAKPOINTS = {
  /** xs 상한: 이 미만이면 SizeKey.xs */
  xs: 412,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export type SizeKey = "xs" | "sm1" | "sm2" | "md" | "lg" | "xl";

export function detectSize(windowWidth: number): SizeKey {
  if (windowWidth < BREAKPOINTS.xs) return "xs";
  if (windowWidth < BREAKPOINTS.sm) return "sm1";
  if (windowWidth < BREAKPOINTS.md) return "sm2";
  if (windowWidth < BREAKPOINTS.lg) return "md";
  if (windowWidth < BREAKPOINTS.xl) return "lg";
  return "xl";
}

/** 사이즈별 UI 토큰 — 여기 수치만 조정하면 카드·간격·패딩·컨테이너가 함께 바뀐다. */
export interface SizeTokens {
  cardWidth: number;
  fontSize: number;
  cardPadX: number;
  cardPadY: number;
  cardStackGap: number;
  boardSectionGap: number;
  boardRowGap: number;
  groundColumnGap: number;
  boardPadX: number;
  layoutGap: number;
  headerGroupGap: number;
  containerMaxWidth: number;
  containerAspectRatio: string;
}

export const SIZE_TOKENS: Record<SizeKey, SizeTokens> = {
  xs: {
    cardWidth: 47,
    fontSize: 10,
    cardPadX: 0.35,
    cardPadY: 0.55,
    cardStackGap: 12,
    boardSectionGap: 3,
    boardRowGap: 1.25,
    groundColumnGap: 0.25,
    boardPadX: 0,
    layoutGap: 6,
    headerGroupGap: 2,
    containerMaxWidth: 412,
    containerAspectRatio: "412 / 915",
  },
  sm1: {
    cardWidth: 56,
    fontSize: 12,
    cardPadX: 0.4,
    cardPadY: 0.65,
    cardStackGap: 14,
    boardSectionGap: 3.5,
    boardRowGap: 1.5,
    groundColumnGap: 0.45,
    boardPadX: 0,
    layoutGap: 7,
    headerGroupGap: 2.5,
    containerMaxWidth: 480,
    containerAspectRatio: "412 / 915",
  },
  sm2: {
    cardWidth: 58,
    fontSize: 14,
    cardPadX: 0.45,
    cardPadY: 0.7,
    cardStackGap: 16,
    boardSectionGap: 4,
    boardRowGap: 1.75,
    groundColumnGap: 0.5,
    boardPadX: 0,
    layoutGap: 8,
    headerGroupGap: 3,
    containerMaxWidth: 520,
    containerAspectRatio: "412 / 915",
  },
  md: {
    cardWidth: 66,
    fontSize: 15,
    cardPadX: 0.5,
    cardPadY: 0.75,
    cardStackGap: 18,
    boardSectionGap: 4.5,
    boardRowGap: 2,
    groundColumnGap: 0.5,
    boardPadX: 0,
    layoutGap: 9,
    headerGroupGap: 3.5,
    containerMaxWidth: 580,
    containerAspectRatio: "412 / 915",
  },
  lg: {
    cardWidth: 74,
    fontSize: 16,
    cardPadX: 0.5,
    cardPadY: 0.8,
    cardStackGap: 21,
    boardSectionGap: 5,
    boardRowGap: 2,
    groundColumnGap: 0.5,
    boardPadX: 0,
    layoutGap: 9.5,
    headerGroupGap: 4,
    containerMaxWidth: 640,
    containerAspectRatio: "412 / 915",
  },
  xl: {
    cardWidth: 84,
    fontSize: 17,
    cardPadX: 0.5,
    cardPadY: 0.8,
    cardStackGap: 22,
    boardSectionGap: 5,
    boardRowGap: 2,
    groundColumnGap: 0.5,
    boardPadX: 0,
    layoutGap: 10,
    headerGroupGap: 5,
    containerMaxWidth: 720,
    containerAspectRatio: "412 / 915",
  },
};
