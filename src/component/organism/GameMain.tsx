import { Stack } from "@mui/material";
import EmptyCard from "../atom/EmptyCard";
import CardList from "../molecular/CardList";

interface GameMainProps {}
const GameMain: React.FC<GameMainProps> = () => {
  // Foundation 순서: club, diamond, heart, spade

  return (
    <Stack id="game-board" gap={5} flex={1} position="relative">
      <CardList />

      <Stack direction="row" gap={2} justifyContent="space-between">
        {/* Stack */}
        <Stack direction="row" gap={1}>
          <EmptyCard id="stack-1" />
          <EmptyCard id="waste-1" />
        </Stack>

        {/* Waste */}
        <Stack>
          <EmptyCard id="temp-1" />
        </Stack>
        {/* Foundation */}
        <Stack direction="row" gap={1}>
          <EmptyCard id="foundation-1" />
          <EmptyCard id="foundation-2" />
          <EmptyCard id="foundation-3" />
          <EmptyCard id="foundation-4" />
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="center" gap={1}>
        {/* Ground */}
        <EmptyCard id="ground-1" />
        <EmptyCard id="ground-2" />
        <EmptyCard id="ground-3" />
        <EmptyCard id="ground-4" />
        <EmptyCard id="ground-5" />
        <EmptyCard id="ground-6" />
        <EmptyCard id="ground-7" />
      </Stack>
    </Stack>
  );
};

export default GameMain;
