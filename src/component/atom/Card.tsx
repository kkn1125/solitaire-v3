import { CardSignMap } from "@/config/enums";
import { useWindowSize } from "@/hook/useWindowSize";
import { CardBgMap } from "@/model/CardBgMap";
import { CardTypeMap } from "@/model/CardTypeMap";
import { useUiStore } from "@/store/ui.store";
import { Paper, Stack, SvgIcon, Typography } from "@mui/material";
import { motion, useAnimate, type Point } from "motion/react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

interface CardProps {
  trumpCard: TrumpCard;
}
const Card: React.FC<CardProps> = ({ trumpCard }) => {
  const ratio = 11 / 17;
  const gameBoard = useUiStore((state) => state.gameBoard);
  const { type, sign, location, row, column, zIndex } = trumpCard;
  const { fontSize, cardWidth } = useWindowSize();
  const [scope, animate] = useAnimate();
  const originalPositionRef = useRef({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
  });
  const cardColor =
    type === "heart" || type === "diamond" ? "error" : "inherit";
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });

  const dragConstraints = useMemo(() => {
    const current = originalPositionRef.current;

    if (!current || !gameBoard) {
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      };
    }

    // const clientRect = current.;
    const gameBoardRect = gameBoard.getBoundingClientRect();
    setPos({
      x: originalPositionRef.current.left,
      y: originalPositionRef.current.top,
    });

    return {
      top: gameBoardRect.top - originalPositionRef.current.top,
      bottom: gameBoardRect.bottom - originalPositionRef.current.bottom,
      left: gameBoardRect.left - originalPositionRef.current.left,
      right: gameBoardRect.right - originalPositionRef.current.right,
    };
  }, [gameBoard]);

  const returnToOriginalPosition = useEffectEvent(
    (_: MouseEvent | TouchEvent | PointerEvent) => {
      const posY = originalPositionRef.current.top - pos.y;
      const posX = originalPositionRef.current.left - pos.x;
      animate(
        scope.current,
        {
          x: posX,
          y: posY,
        },
        { duration: 0.15, ease: "easeInOut" }
      );
    }
  );

  function handleMovePos() {
    const rect = scope.current as HTMLDivElement;
    if (!rect) return;
    const info = rect.getBoundingClientRect();
    setPos({
      x: info.left,
      y: info.top,
    });
  }

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      // 드래그 후 미끄러지는 효과(관성)를 끄기 위해 transition prop 제거
      // dragSnapToOrigin
      dragElastic={0}
      dragMomentum={false}
      onDrag={handleMovePos}
      onDragEnd={returnToOriginalPosition}
    >
      <Stack
        ref={(ref) => {
          if (!ref) return;
          Object.assign(scope, { current: ref });
          if (!originalPositionRef.current.top)
            originalPositionRef.current.top = ref.getBoundingClientRect().top;
          if (!originalPositionRef.current.left)
            originalPositionRef.current.left = ref.getBoundingClientRect().left;
          if (!originalPositionRef.current.bottom)
            originalPositionRef.current.bottom =
              ref.getBoundingClientRect().bottom;
          if (!originalPositionRef.current.right)
            originalPositionRef.current.right =
              ref.getBoundingClientRect().right;
          if (!originalPositionRef.current.x)
            originalPositionRef.current.x = ref.getBoundingClientRect().x;
          if (!originalPositionRef.current.y)
            originalPositionRef.current.y = ref.getBoundingClientRect().y;
        }}
        position="relative"
        component={Paper}
        color={cardColor}
        px={0.5}
        py={0.8}
        sx={{
          cursor: "pointer",
          userSelect: "none",
          minWidth: "max-content",
          width: cardWidth,
          maxWidth: cardWidth,
          minHeight: "fit-content",
          height: "fit-content",
          maxHeight: "fit-content",
          aspectRatio: ratio,
          backgroundImage: CardBgMap[type][sign]
            ? `url(${CardBgMap[type][sign]})`
            : undefined,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "90%",
          transition: "all 0.1s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0px 0px 0px 5px rgb(71, 122, 224), 0px 0px 15px 5px rgba(71, 122, 224, 0.5)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
          "&:focus": {
            transform: "translateY(0px)",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          fontSize={fontSize * 1.3}
          color={cardColor}
        >
          <Typography
            component="div"
            fontSize="inherit"
            color="inherit"
            p={0}
            m={0}
            lineHeight={1}
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
          {sign < 10 && (
            <SvgIcon color={cardColor} sx={{ width: "100%", height: "auto" }}>
              {CardTypeMap[type]}
            </SvgIcon>
          )}
        </Stack>
      </Stack>
    </motion.div>
  );
};

export default Card;
