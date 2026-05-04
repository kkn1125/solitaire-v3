import { CardLocation } from "@/config/enums";
import { SoundEffectContext } from "@/context/SoundEffectContext";
import type { SoundEffectContextValue } from "@/hook/useSoundEffect";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { useTheme } from "@mui/material";
import { useContext, useEffect, useRef, type Context } from "react";
import { CardWrapper } from "./CardWrapper";

interface EmptyCardProps extends React.HTMLAttributes<HTMLDivElement> {}
const EmptyCard: React.FC<EmptyCardProps> = ({ ...props }) => {
  const theme = useTheme();
  const ref = useRef(null);
  const rev = useSolitaireStore((state) => state.rev);
  const insertCardBase = useSolitaireStore((state) => state.insertCardBase);
  const resetWaste = useSolitaireStore((state) => state.actions.resetWaste);
  const { actions: soundActions } = useContext<SoundEffectContextValue>(
    SoundEffectContext as unknown as Context<SoundEffectContextValue>,
  );
  const emptySx =
    theme.palette.mode === "dark"
      ? {
          backgroundColor: "#fefefe56",
          boxShadow: "inset 0 0 0 0.5px #eee, 0 0 0 0.5px #888",
        }
      : {
          backgroundColor: "#fefefe56",
          boxShadow: "inset 0 0 0 0.5px #eee, 0 0 0 0.5px #888",
        };
  const [location, id] = props.id!.split("-") as [CardLocation, string];

  function handleResetWaste() {
    resetWaste();
    soundActions.playShuffleSound();
  }

  useEffect(() => {
    const unsubscribe = useSolitaireStore.subscribe(
      (state) => state.rev,
      (newRev) => {
        if (rev !== newRev) {
          if (ref.current) {
            insertCardBase(location, id)(ref.current);
          }
        }
      },
    );
    return () => unsubscribe();
  }, [insertCardBase, location, id, rev]);

  useEffect(() => {
    if (ref.current) {
      insertCardBase(location, id)(ref.current);
    }
  }, [insertCardBase, location, id, ref]);

  return (
    <CardWrapper ref={ref} sx={emptySx} {...props} onClick={handleResetWaste} />
  );
};

export default EmptyCard;
