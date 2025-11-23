import { CardLocation, CardSignMap } from "@/config/enums";
import { ANIMATE_TIME, CARD_GAP } from "@/config/variable";
import { useWindowSize } from "@/hook/useWindowSize";
import { CardBgMap } from "@/model/CardBgMap";
import { CardTypeMap } from "@/model/CardTypeMap";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import {
  keyframes,
  Stack,
  SvgIcon,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import { useMemo } from "react";
import { CardWrapper } from "./CardWrapper";

interface CardProps {
  card: TrumpCard;
}
const Card: React.FC<CardProps> = ({ card }) => {
  const { type, sign, row, column, location, isShaking, isMoving } = card;
  const { fontSize } = useWindowSize();
  const getCardBase = useSolitaireStore((state) => state.getCardBase);
  const getBoardBase = useSolitaireStore((state) => state.getBoardBase);
  const wasteSize = useSolitaireStore((state) => state.deck.waste.length);
  const validate = useSolitaireStore((state) => state.validate);
  const boardBase = getBoardBase()!;
  const base = getCardBase<
    CardLocation,
    "1" | "2" | "3" | "4" | "5" | "6" | "7"
  >(location, String(column + 1) as "1" | "2" | "3" | "4" | "5" | "6" | "7")!;
  // 잘못된 행동(틀린 이동 등)일 때 카드를 좌우로 흔들어주는 애니메이션
  const shakeAnimate = keyframes`
    0% { transform: translateX(0); }
    10% { transform: translateX(-7px); }
    20% { transform: translateX(7px); }
    30% { transform: translateX(-5px); }
    40% { transform: translateX(5px); }
    50% { transform: translateX(-3px); }
    60% { transform: translateX(3px); }
    70% { transform: translateX(-2px); }
    80% { transform: translateX(2px); }
    90% { transform: translateX(-1px); }
    100% { transform: translateX(0); }
  `;
  const top = useMemo(() => {
    return (
      (base.top ?? 0) -
      (boardBase.top ?? 0) +
      (validate.isBottomStraight(location) ? row * (CARD_GAP * 2) : 0)
    );
  }, [base.top, boardBase.top, validate, location, row]);
  const left = useMemo(() => {
    let addLeft = 0;
    if (validate.isBottomStraight(location)) {
      addLeft = 0;
    } else {
      if (validate.isRightStraight(location)) {
        const baseRow = wasteSize - 3 > 0 ? wasteSize - 3 : 0;
        if (baseRow < row) {
          addLeft = (row - baseRow) * CARD_GAP * 1.2;
        } else {
          addLeft = 0;
        }
      } else {
        addLeft = 0;
      }
    }
    return (base.left ?? 0) - (boardBase.left ?? 0) + addLeft;
  }, [validate, location, base.left, boardBase.left, wasteSize, row]);

  const zIndex = useMemo(() => {
    if (validate.isNoStraight(location)) {
      return 0;
    }
    if (isMoving) {
      return 1000 + row * CARD_GAP;
    } else {
      return (row + 1) * CARD_GAP;
    }
  }, [isMoving, row, validate, location]);

  const containerSx: SxProps<Theme> = {
    position: "fixed",
    transformStyle: "preserve-3d",
    transformOrigin: "center center",
    transition: `top ${ANIMATE_TIME}ms ease-in-out, left ${ANIMATE_TIME}ms ease-in-out, transform ${ANIMATE_TIME}ms ease-in-out`,
    transform: !card.isFlipped ? "rotateY(-180deg)" : "rotateY(0deg)",
    zIndex: zIndex,
    top: top,
    left: left,
    color: (theme) =>
      card.color === "error" ? theme.palette.error.main : "inherit",
    ...(isShaking && {
      animation: `${shakeAnimate} 0.5s ease-in-out`,
    }),
  };

  const cardFaceSx: SxProps<Theme> = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: 1,
    boxShadow: "inset 0 0 0 0.5px #888, 0 0 0 0.5px #888",
    px: 0.2,
    py: 0.4,
    pointerEvents: "none",
  };

  const frontFaceSx: SxProps<Theme> = {
    ...cardFaceSx,
    ...(sign > 10 && {
      backgroundImage: `url(${CardBgMap[type][sign]})`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "130% 100%",
    }),
    backgroundColor: "white",
    transform: "rotateY(0deg)",
    ...(!card.isFlipped && {
      "&:hover": {
        boxShadow:
          "0px 0px 0px 3px rgb(71, 122, 224), 0px 0px 15px 3px rgba(71, 122, 224, 0.5)",
      },
    }),
  };

  const backFaceSx: SxProps<Theme> = {
    ...cardFaceSx,
    backgroundColor: "transparent",
    backgroundImage: `url(${import.meta.resolve("/images/cards/back_0.png")})`,
    backgroundSize: "cover",
    transform: "rotateY(180deg)",
  };

  return (
    <CardWrapper
      data-card-id={card.id}
      data-location={location}
      data-column={column}
      data-row={row}
      sx={containerSx}
    >
      {/* 뒷면 */}
      <Stack sx={backFaceSx} />

      {/* 앞면 */}
      <Stack sx={frontFaceSx}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          fontSize={fontSize * 1.3}
          color="inherit"
        >
          <Typography
            component="div"
            fontSize="inherit"
            color="inherit"
            p={0}
            m={0}
            lineHeight={1}
            sx={{
              // INSERT_YOUR_CODE
              // 잡아늘린 효과: letterSpacing과 fontStretch 적용
              letterSpacing: "-0.1em",
              fontStretch: "expanded",
              transform: "scale(0.7, 1)",
              transformOrigin: "left top",
              fontSize: fontSize * 1.5,
            }}
          >
            {CardSignMap[sign]}
          </Typography>
          <Typography
            component="div"
            fontSize="inherit"
            color="inherit"
            p={0}
            m={0}
            lineHeight={1}
          >
            {CardTypeMap[type]}
          </Typography>
        </Stack>

        <Stack flex={1} justifyContent="center" alignItems="center">
          {sign < 11 && (
            <SvgIcon
              color="inherit"
              sx={{ width: "100%", height: "auto", transform: "scale(1.1, 1)" }}
            >
              {CardTypeMap[type]}
            </SvgIcon>
          )}
        </Stack>
      </Stack>
    </CardWrapper>
  );
};

export default Card;
