import { useSolitaireStore } from "@/store/useSolitaireStore";
import { Stack } from "@mui/material";
import { FaPalette } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import GameButton from "../atom/GameButton";
import State from "../atom/StateText";
import { CardLocation } from "@/config/enums";
import GameMenu from "../atom/GameMenu";

interface GameHeaderProps {}
const GameHeader: React.FC<GameHeaderProps> = () => {
  const stackSize = useSolitaireStore(
    (state) =>
      state.cards.filter((card) => card.location !== CardLocation.Foundation)
        .length
  );

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <GameButton title="테마 변경" placement="top">
        <FaPalette />
      </GameButton>
      <Stack direction="row" gap={5}>
        <State title="점수" value={1300} />
        <State title="남은 카드" value={stackSize} />
        <State title="횟수" value={2} />
      </Stack>
      <GameMenu />
    </Stack>
  );
};

export default GameHeader;
