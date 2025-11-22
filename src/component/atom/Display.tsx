import { CARD_FONT_SIZE } from "@/config/variable";
import { Stack, Typography } from "@mui/material";

interface DisplayProps {
  title: string;
  value: number;
}
const Display: React.FC<DisplayProps> = ({ title, value }) => {
  const lineHeight = 1.2;

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      color="white"
      sx={{
        textShadow:
          "0 0 5px rgba(0, 0, 0, 0.3), 1px 0 5px rgba(0, 0, 0, 0.3), 0 1px 5px rgba(0, 0, 0, 0.3), -1px 0 5px rgba(0, 0, 0, 0.3), 0 -1px 5px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Typography
        component="div"
        fontWeight="bold"
        fontSize={`${CARD_FONT_SIZE * 0.3}rem`}
        lineHeight={lineHeight}
      >
        {title}
      </Typography>
      <Typography
        component="div"
        fontWeight="bold"
        fontSize={`${CARD_FONT_SIZE * 0.3}rem`}
        lineHeight={lineHeight}
      >
        {value.toLocaleString("ko")}
      </Typography>
    </Stack>
  );
};

export default Display;
