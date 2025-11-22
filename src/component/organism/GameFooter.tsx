import { Divider, Paper, Stack } from "@mui/material";
import { FaLightbulb, FaPause, FaReply, FaShuffle } from "react-icons/fa6";
import GameButton from "../atom/GameButton";

interface GameFooterProps {}
const GameFooter: React.FC<GameFooterProps> = () => {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 5, p: 3, backgroundColor: "grey.800" }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <GameButton title="게임 중지" placement="top">
          <FaPause />
        </GameButton>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: "grey.700" }}
        />
        <GameButton title="힌트" placement="top">
          <FaLightbulb />
        </GameButton>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: "grey.700" }}
        />
        <GameButton title="새로하기" placement="top">
          <FaReply />
        </GameButton>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: "grey.700" }}
        />
        <GameButton title="카드 섞기" placement="top">
          <FaShuffle />
        </GameButton>
      </Stack>
    </Paper>
  );
};

export default GameFooter;
