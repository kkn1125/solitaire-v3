import type { CardSign } from "@/config/enums";
import { CARD_FONT_SIZE } from "@/config/variable";
import { CardTypeMap } from "@/model/CardTypeMap";
import { Stack, Typography } from "@mui/material";

interface TrumpTypeProps {
  type: TrumpCardType;
  sign: CardSign;
}
const TrumpType: React.FC<TrumpTypeProps> = ({ type, sign }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      fontSize={`${CARD_FONT_SIZE * 0.37}rem`}
    >
      <Typography
        component="span"
        fontWeight="bold"
        fontSize={`${CARD_FONT_SIZE * 0.45}rem`}
        lineHeight={0.9}
      >
        {sign}
      </Typography>
      <Stack
        justifyContent="center"
        sx={{
          transform: "scale(0.9, 1)",
        }}
      >
        {CardTypeMap[type]}
      </Stack>
    </Stack>
  );
};

export default TrumpType;
