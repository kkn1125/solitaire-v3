import {
  Button,
  Tooltip,
  type ButtonProps,
  type SxProps,
  type Theme,
} from "@mui/material";

interface GameButtonProps {
  title: string;
  placement?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
  shape?: "rounded" | "circle";
  color?: ButtonProps["color"];
  sx?: SxProps<Theme>;
}
const GameButton: React.FC<GameButtonProps> = ({
  title,
  color,
  shape = "rounded",
  placement = "top",
  children,
  sx,
}) => {
  return (
    <Tooltip title={title} placement={placement}>
      <Button
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
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

export default GameButton;
