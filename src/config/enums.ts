export const CardSignMap = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
} as const;
export type CardSign = (typeof CardSignMap)[keyof typeof CardSignMap];
export type CardSignKey = keyof typeof CardSignMap;
export const CardSignValues = Object.values(CardSignMap);

export const CardType = {
  Club: "club",
  Diamond: "diamond",
  Heart: "heart",
  Spade: "spade",
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];
export type CardTypeKey = keyof typeof CardType;
export const CardTypeValues = Object.values(CardType);

export const CardColor = {
  Red: "error",
  Black: "inherit",
} as const;
export type CardColor = (typeof CardColor)[keyof typeof CardColor];
export type CardColorKey = keyof typeof CardColor;
export const CardColorValues = Object.values(CardColor);

export const CardLocation = {
  Stack: "stack",
  Waste: "waste",
  Foundation: "foundation",
  Ground: "ground",
  Temp: "temp",
} as const;
export type CardLocation = (typeof CardLocation)[keyof typeof CardLocation];
export type CardLocationKey = keyof typeof CardLocation;
export const CardLocationValues = Object.values(CardLocation);

/*
 * ---------------------------------------------------------------------------
 * [보존] 정책 변경 이전 ScoreType — 제거 대신 참고용으로 유지
 * ---------------------------------------------------------------------------
 * export const ScoreType = {
 *   // 기본 득점: 파운데이션에 카드를 올릴 때 (플러스 점수)
 *   GroundToFoundation: "groundToFoundation", // 그라운드 → 파운데이션 (+)
 *   WasteToFoundation: "wasteToFoundation", // 웨이스트 → 파운데이션 (+)
 *   StackToFoundation: "stackToFoundation", // 스택 → 파운데이션 (+)
 *
 *   // 기본 이동: 스택/웨이스트/파운데이션/임시 → 그라운드 (이동에는 점수 없음이 일반적)
 *   StackToGround: "stackToGround", // 스택 → 그라운드 (0)
 *   WasteToGround: "wasteToGround", // 웨이스트 → 그라운드 (0)
 *   TempToGround: "tempToGround", // 임시 → 그라운드 (0)
 *   TempToFoundation: "tempToFoundation", // 임시 → 파운데이션 (+)
 *
 *   // 벌점: 파운데이션에서 카드를 빼내 그라운드 또는 웨이스트로 이동할 때 (마이너스 점수)
 *   FoundationToGround: "foundationToGround", // 파운데이션 → 그라운드 (벌점)
 *   FoundationToWaste: "foundationToWaste", // 파운데이션 → 웨이스트 (벌점)
 *
 *   // 벌점: 웨이스트 → 스택(되돌리기), 임시 → 웨이스트 등 리셋류 (마이너스 점수)
 *   WasteToStack: "wasteToStack", // 웨이스트 → 스택 (벌점)
 *   // TempToWaste: "tempToWaste", // 임시 → 웨이스트 (벌점 혹은 처리)
 *
 *   // 기타: 필요에 따라 추가
 * } as const;
 * ---------------------------------------------------------------------------
 */

export const ScoreType = {
  /** waste | temp | ground → foundation (+30). stack→foundation은 규칙상 드물어 동일 보상 유지 */
  GroundToFoundation: "groundToFoundation",
  WasteToFoundation: "wasteToFoundation",
  StackToFoundation: "stackToFoundation",
  TempToFoundation: "tempToFoundation",

  /** waste | ground → temp 임시 주차 (−5) */
  WasteToTemp: "wasteToTemp",
  GroundToTemp: "groundToTemp",

  /** foundation → waste | temp | ground 후퇴 (−30, 목적지 동일 처리) */
  FoundationToGround: "foundationToGround",
  FoundationToWaste: "foundationToWaste",
  FoundationToTemp: "foundationToTemp",

  /** 작업 영역 이동 등 (0) — 정책 미부여 구간 */
  StackToGround: "stackToGround",
  WasteToGround: "wasteToGround",
  TempToGround: "tempToGround",
  TempToWaste: "tempToWaste",
  WasteToStack: "wasteToStack",
} as const;
export type ScoreType = (typeof ScoreType)[keyof typeof ScoreType];
export type ScoreTypeKey = keyof typeof ScoreType;
export const ScoreTypeValues = Object.values(ScoreType);

/*
 * ---------------------------------------------------------------------------
 * [보존] 정책 변경 이전 ScoreValue — 제거 대신 참고용으로 유지
 * ---------------------------------------------------------------------------
 * export const ScoreValue = {
 *   [ScoreType.GroundToFoundation]: 30,
 *   [ScoreType.WasteToFoundation]: 30,
 *   [ScoreType.StackToFoundation]: 30,
 *   [ScoreType.StackToGround]: 0,
 *   [ScoreType.WasteToGround]: 0,
 *   [ScoreType.TempToGround]: 0,
 *   [ScoreType.TempToFoundation]: 30,
 *   [ScoreType.FoundationToGround]: -30,
 *   [ScoreType.FoundationToWaste]: -30,
 *   [ScoreType.WasteToStack]: 0,
 *   // [ScoreType.TempToWaste]: -5,
 * } as const;
 * ---------------------------------------------------------------------------
 */

export const ScoreValue = {
  [ScoreType.GroundToFoundation]: 30,
  [ScoreType.WasteToFoundation]: 30,
  [ScoreType.StackToFoundation]: 30,
  [ScoreType.TempToFoundation]: 30,
  [ScoreType.WasteToTemp]: -5,
  [ScoreType.GroundToTemp]: -5,
  [ScoreType.FoundationToGround]: -30,
  [ScoreType.FoundationToWaste]: -30,
  [ScoreType.FoundationToTemp]: -30,
  [ScoreType.StackToGround]: 0,
  [ScoreType.WasteToGround]: 0,
  [ScoreType.TempToGround]: 0,
  [ScoreType.TempToWaste]: 0,
  [ScoreType.WasteToStack]: 0,
} as const;
export type ScoreValue = (typeof ScoreValue)[keyof typeof ScoreValue];
export type ScoreValueType = keyof typeof ScoreValue;
export const ScoreValueValues = Object.values(ScoreValue);
