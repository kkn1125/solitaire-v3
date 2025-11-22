import type { CardLocation } from "@/config/enums";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { CardWrapper } from "./CardWrapper";

interface EmptyCardProps extends React.HTMLAttributes<HTMLDivElement> {}
const EmptyCard: React.FC<EmptyCardProps> = ({ ...props }) => {
  const insertCardBase = useSolitaireStore((state) => state.insertCardBase);
  const emptySx = {
    backgroundColor: "#fefefe56",
    boxShadow: "inset 0 0 0 0.5px #eee, 0 0 0 0.5px #888",
  };
  const [location, id] = props.id!.split("-") as [CardLocation, string];

  return (
    <CardWrapper ref={insertCardBase(location, id)} sx={emptySx} {...props} />
  );
};

export default EmptyCard;
