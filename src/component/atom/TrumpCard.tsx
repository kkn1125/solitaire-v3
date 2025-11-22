import { CardSignMap, type CardSignKey } from "@/config/enums";
import {
  CARD_BORDER_WIDTH,
  CARD_FONT_SIZE,
  CARD_SIZE_RATIO,
} from "@/config/variable";
import { CardBgMap } from "@/model/CardBgMap";
import { CardTypeMap } from "@/model/CardTypeMap";
import { Paper, Stack, Typography } from "@mui/material";
import { motion } from "motion/react";
import TrumpType from "./TrumpType";

interface TrumpCardProps {
  isEmpty?: boolean;
  width?: number;
  ratio?: number;
  type: TrumpCardType;
  sign: CardSignKey;
  isFlipped?: boolean;
  backImage?: string;
  onFlip?: () => void;
  isActive?: boolean;
}
const TrumpCard: React.FC<TrumpCardProps> = ({
  isEmpty = false,
  width = 46.5,
  ratio = CARD_SIZE_RATIO,
  type,
  sign,
  isFlipped = false,
  backImage = "/images/cards/back_0.png",
  onFlip,
  isActive = false,
}) => {
  const color = type === "heart" || type === "diamond" ? "error" : "black";

  const cardStyle = {
    width: `calc(3.9vh + 2.5vw)`,
    maxWidth: `calc(3.9vh + 2.0vw)`,
    maxHeight: `calc(3.9vh + ${Math.floor((width * 1) / ratio)}px)`,
    aspectRatio: ratio,
    borderRadius: `${CARD_FONT_SIZE * 0.5}px`,
  };

  const cardBg = CardBgMap[type][sign]
    ? `url(${CardBgMap[type][sign]}), linear-gradient(145deg, #ffffff 0%,#ebebeb 100%)`
    : "linear-gradient(145deg, #ffffff 0%,#ebebeb 100%)";

  const frontFace = (
    <Stack
      component={Paper}
      variant="outlined"
      justifyContent="space-between"
      color={color === "error" ? `${color}.main` : "grey.900"}
      p={CARD_FONT_SIZE * 0.1}
      sx={{
        ...cardStyle,
        background: cardBg,
        backgroundSize: "100%",
        backgroundPosition: "100% 100%",
        backgroundRepeat: "no-repeat",
        boxShadow: `0 0 0 ${CARD_BORDER_WIDTH}px #fff, 0 2px 8px 0 rgba(44, 44, 44, 0.17), 0 0 12px 2px #dddddd inset`,
        backfaceVisibility: "hidden",
        borderRadius: CARD_FONT_SIZE * 0.5,
      }}
    >
      <TrumpType type={type} sign={CardSignMap[sign]} />
      {sign === 11 || sign === 12 || sign === 13 ? null : (
        <Stack
          flex={1}
          fontSize={`calc(4.1vh + 1.7vw)`}
          justifyContent="center"
          alignItems="center"
          sx={{
            transform: "scale(0.85, 1)",
          }}
        >
          {CardTypeMap[type]}
        </Stack>
      )}
    </Stack>
  );

  const backFace = (
    <Stack
      component={Paper}
      borderRadius={CARD_FONT_SIZE * 0.5}
      variant="outlined"
      sx={{
        ...cardStyle,
        backgroundImage: `url(${backImage})`,
        backgroundSize: "130%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxShadow: `
          0 0 0 ${CARD_BORDER_WIDTH}px #fff, 0 2px 8px 0 rgba(44, 44, 44, 0.17), 0 0 12px 2px #dddddd inset
        `,
        backfaceVisibility: "hidden",
      }}
    />
  );

  const emptyFace = (
    <Stack
      position="absolute"
      top={0}
      left={0}
      component={Paper}
      borderRadius={CARD_FONT_SIZE * 0.5}
      variant="outlined"
      sx={{
        ...cardStyle,
        backgroundColor: "#55555556",
        boxShadow: `0 0 0 ${CARD_BORDER_WIDTH}px #fff, 0 2px 8px 0 rgba(44, 44, 44, 0.17)`,
        backfaceVisibility: "hidden",
      }}
    >
      <Stack
        flex={1}
        justifyContent="center"
        alignItems="center"
        color="#ffffff76"
      >
        <Typography
          fontSize={`${CARD_FONT_SIZE * 1}rem`}
          fontWeight="bold"
          lineHeight={1}
          sx={{ transform: "scale(0.85, 1)" }}
        >
          A
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <div
      style={{
        ...cardStyle,
        position: "relative",
        perspective: "1000px",
        cursor: isEmpty ? "default" : "pointer",
      }}
      onClick={(e) => {
        if (isEmpty) {
          e.stopPropagation();
          return;
        }
        if (!isFlipped) {
          // 앞면이 보이는 카드는 뒤집기
          e.stopPropagation();
          onFlip?.();
        }
        // 뒤집힌 카드는 이벤트를 전파하여 CardDeck의 클릭 핸들러가 실행되도록 함
      }}
    >
      {emptyFace}
      {isEmpty ? null : (
        <motion.div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: !isFlipped ? 180 : 0,
          }}
          transition={{
            duration: 0.15,
            ease: "easeInOut",
          }}
          whileHover={isActive && isFlipped ? { scale: 1.05 } : {}}
          onClick={(e) => {
            e.stopPropagation();
            if (!isFlipped) {
              onFlip?.();
            }
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {frontFace}
          </div>
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {backFace}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrumpCard;
