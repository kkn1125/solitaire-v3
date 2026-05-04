import { SoundEffectContext } from "@/context/SoundEffectContext";
import type { SoundEffectContextValue } from "@/hook/useSoundEffect";
import {
  Button,
  Tooltip,
  type ButtonProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import { useContext, type Context } from "react";

interface GameButtonProps {
  title: string;
  placement?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
  shape?: "rounded" | "circle";
  color?: ButtonProps["color"];
  sx?: SxProps<Theme>;
  onClick?: () => void;
  disabled?: boolean;
}
const GameButton: React.FC<GameButtonProps> = ({
  title,
  color,
  shape = "rounded",
  placement = "top",
  children,
  sx,
  onClick,
  disabled = false,
}) => {
  const { actions } = useContext<SoundEffectContextValue>(
    SoundEffectContext as unknown as Context<SoundEffectContextValue>,
  );

  return (
    <Tooltip title={title} placement={placement}>
      <Button
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
          if (!disabled) actions.clickSound();
        }}
        color={color}
        variant="contained"
        sx={{
          ...sx,
          p: 2,
          minWidth: 0,
          fontSize: 24,
          borderRadius: shape === "circle" ? 999 : 3,
          background:
            "linear-gradient(to top, rgb(24, 101, 189) 0%, rgb(43, 130, 229) 20%, rgb(50, 204, 218) 90%,  rgb(50, 204, 218) 95%, rgb(50, 204, 218) 100%)",
          boxShadow:
            "inset 0px 0px 0px 2px rgb(89, 165, 252), 0px 5px 0px 0px rgb(30, 98, 176), 0px 5px 0px 3px rgb(255, 255, 255), 0px 0px 0px 3px rgb(255, 255, 255)",
          transform: "translateY(-5px)",
          transition: "all 0.1s ease-in-out",
          "&:hover": {
            background:
              "linear-gradient(to top, rgb(24, 101, 189) 0%, rgb(43, 130, 229) 20%, rgb(50, 204, 218) 90%,  rgb(50, 204, 218) 95%, rgb(50, 204, 218) 100%)",
            boxShadow:
              "inset 0px 0px 0px 2px rgb(89, 165, 252), 0px 5px 0px 0px rgb(30, 98, 176), 0px 5px 0px 3px rgb(255, 255, 255), 0px 0px 0px 3px rgb(255, 255, 255)",
          },
          "&:active": {
            transform: "translateY(0px)",
            boxShadow:
              "inset 0px 0px 0px 2px rgb(89, 165, 252), 0px 0px 0px 3px rgb(255, 255, 255), 0px 0px 0px 3px rgb(255, 255, 255)",
          },
          filter: disabled ? "grayscale(80%)" : undefined,
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

export default GameButton;
