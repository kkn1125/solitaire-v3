import { ReadyStatus } from "@/config/enums";
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
  const initializeGame = useSolitaireStore((state) => state.initializeGame);
  const clearGame = useSolitaireStore((state) => state.clearGame);
  const status = useSolitaireStore((state) => state.status);

  useEffect(() => {
    clearGame();

    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameBoard>
      {status !== ReadyStatus.READY && (
        <Backdrop
          open={true}
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
        {/* <Button onClick={() => reRender()}>rerender</Button> */}
        {/* Footer */}
        <GameFooter />
      </Stack>
    </GameBoard>
  );
};

export default GameSolitaire;
