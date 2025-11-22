import { useCoreStore } from "@/store/core.store";
import { useUiStore } from "@/store/ui.store";
import { Divider, Paper, Stack } from "@mui/material";
import {
  FaLightbulb,
  FaPalette,
  FaPause,
  FaReply,
  FaShuffle,
} from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import Card from "../atom/Card";
import GameButton from "../atom/GameButton";
import State from "../atom/StateText";
import GameBoard from "../template/GameBoard";

interface SolitaireProps {}
const Solitaire: React.FC<SolitaireProps> = () => {
  const gameState = useCoreStore((state) => state.gameState);
  const setGameBoard = useUiStore((state) => state.setGameBoard);
  // Foundation 순서: club, diamond, heart, spade
  // const foundationOrder: TrumpCardType[] = [
  //   "club",
  //   "diamond",
  //   "heart",
  //   "spade",
  // ];

  return (
    <GameBoard>
      <Stack height="100%" gap={10}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <GameButton title="테마 변경" placement="top">
            <FaPalette />
          </GameButton>
          <Stack direction="row" gap={5}>
            <State title="점수" value={1300} />
            <State title="남은 카드" value={gameState.stack.length} />
            <State title="횟수" value={2} />
          </Stack>
          <GameButton title="설정" placement="top">
            <GiHamburgerMenu />
          </GameButton>
        </Stack>

        {/* Body */}
        <Stack
          id="game-board"
          gap={5}
          flex={1}
          ref={(ref) => {
            setGameBoard(ref);
          }}
          position="relative"
        >
          <Stack direction="row" gap={2} justifyContent="space-between">
            {/* Stack */}
            <Stack direction="row" gap={1}>
              <Card
                trumpCard={{
                  type: "heart",
                  sign: 13,
                  location: "stack",
                  row: 0,
                  column: 0,
                  zIndex: 0,
                }}
              />
              <Card
                trumpCard={{
                  type: "heart",
                  sign: 13,
                  location: "stack",
                  row: 0,
                  column: 0,
                  zIndex: 0,
                }}
              />
            </Stack>

            {/* Waste */}
            <Stack>
              <Card
                trumpCard={{
                  type: "heart",
                  sign: 13,
                  location: "stack",
                  row: 0,
                  column: 0,
                  zIndex: 0,
                }}
              />
            </Stack>
            {/* Foundation */}
            <Stack direction="row" gap={1}>
              <Card
                trumpCard={{
                  type: "heart",
                  sign: 13,
                  location: "stack",
                  row: 0,
                  column: 0,
                  zIndex: 0,
                }}
              />
              <Card
                trumpCard={{
                  type: "heart",
                  sign: 13,
                  location: "stack",
                  row: 0,
                  column: 0,
                  zIndex: 0,
                }}
              />
              <Card
                trumpCard={{
                  type: "heart",
                  sign: 13,
                  location: "stack",
                  row: 0,
                  column: 0,
                  zIndex: 0,
                }}
              />
              <Card
                trumpCard={{
                  type: "heart",
                  sign: 13,
                  location: "stack",
                  row: 0,
                  column: 0,
                  zIndex: 0,
                }}
              />
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="center" gap={1}>
            {/* Ground */}
            <Card
              trumpCard={{
                type: "heart",
                sign: 13,
                location: "stack",
                row: 0,
                column: 0,
                zIndex: 0,
              }}
            />
            <Card
              trumpCard={{
                type: "heart",
                sign: 13,
                location: "stack",
                row: 0,
                column: 0,
                zIndex: 0,
              }}
            />
            <Card
              trumpCard={{
                type: "heart",
                sign: 13,
                location: "stack",
                row: 0,
                column: 0,
                zIndex: 0,
              }}
            />
            <Card
              trumpCard={{
                type: "heart",
                sign: 13,
                location: "stack",
                row: 0,
                column: 0,
                zIndex: 0,
              }}
            />
            <Card
              trumpCard={{
                type: "heart",
                sign: 13,
                location: "stack",
                row: 0,
                column: 0,
                zIndex: 0,
              }}
            />
            <Card
              trumpCard={{
                type: "heart",
                sign: 13,
                location: "stack",
                row: 0,
                column: 0,
                zIndex: 0,
              }}
            />
            <Card
              trumpCard={{
                type: "heart",
                sign: 13,
                location: "stack",
                row: 0,
                column: 0,
                zIndex: 0,
              }}
            />
          </Stack>
        </Stack>

        {/* Footer */}
        <Paper
          variant="outlined"
          sx={{ borderRadius: 5, p: 3, backgroundColor: "grey.800" }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
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
      </Stack>
    </GameBoard>
  );
};

export default Solitaire;
