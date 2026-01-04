import { CardLocation } from "@/config/enums";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { useEffect, useRef } from "react";
import { CardWrapper } from "./CardWrapper";

interface EmptyCardProps extends React.HTMLAttributes<HTMLDivElement> {}
const EmptyCard: React.FC<EmptyCardProps> = ({ ...props }) => {
  const ref = useRef(null);
  const rev = useSolitaireStore((state) => state.rev);
  const resetWaste = useSolitaireStore((state) => state.actions.resetWaste);
  const emptySx = {
    backgroundColor: "#fefefe56",
    boxShadow: "inset 0 0 0 0.5px #eee, 0 0 0 0.5px #888",
  };
  const [location, id] = props.id!.split("-") as [CardLocation, string];

  function handleResetWaste() {
    resetWaste();
  }

  return (
    <CardWrapper ref={ref} sx={emptySx} {...props} onClick={handleResetWaste} />
  );
};

export default EmptyCard;
