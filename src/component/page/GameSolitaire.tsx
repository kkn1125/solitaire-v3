import { useSolitaireStore } from "@/store/useSolitaireStore";
import {
  Backdrop,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import GameFooter from "../organism/GameFooter";
import GameHeader from "../organism/GameHeader";
import GameMain from "../organism/GameMain";
import GameBoard from "../template/GameBoard";

interface GameSolitaireProps {}
const GameSolitaire: React.FC<GameSolitaireProps> = () => {
  const gameSetting = useSolitaireStore((state) => state.gameSetting);
  const clearGame = useSolitaireStore((state) => state.clearGame);
  const isReady = useSolitaireStore((state) => state.isReady);
  const clickCard = useSolitaireStore((state) => state.actions.clickCard);

  useEffect(() => {
    gameSetting();

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!("cardId" in (target.dataset ?? {}))) return;
      const cardId = target.dataset.cardId;
      if (!cardId) return;
      clickCard(cardId);
    }
    window.addEventListener("click", handleClick);
    return () => {
      clearGame();
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <GameBoard>
      {!isReady && (
        <Backdrop
          open={!isReady}
          component={Box}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            zIndex: 100,
            color: "white",
          }}
        >
          <Stack gap={2} alignItems="center">
            <CircularProgress color="inherit" size={100} />
            <Typography variant="h6" color="inherit">
              Loading...
            </Typography>
          </Stack>
        </Backdrop>
      )}

      <Stack height="100%" gap={10}>
        {/* Header */}
        <GameHeader />

        {/* Body */}
        <GameMain />

        {/* Footer */}
        <GameFooter />
      </Stack>
    </GameBoard>
  );
};

export default GameSolitaire;
