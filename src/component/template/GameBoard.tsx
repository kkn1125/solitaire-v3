import { useWindowSize } from "@/hook/useWindowSize";
import { useCoreStore } from "@/store/useCoreStore";
import { Container, Stack, type StackProps } from "@mui/material";
import { useMemo } from "react";

interface GameBoardProps extends StackProps {
  children: React.ReactNode;
}
const GameBoard: React.FC<GameBoardProps> = ({ children, sx, ...props }) => {
  const { containerMaxWidth, containerAspectRatio } = useWindowSize();
  const background = useCoreStore((state) => state.settings.effects.background);
  const backgroundImage = useMemo(() => {
    switch (background) {
      case "default":
        return "url(/images/background/background1.jpg) no-repeat center center";
      case "wood":
        return "url(/images/background/background2.jpg) no-repeat center center";
      case "grid":
        return "url(/images/background/background3.jpg) no-repeat center center";
      case "grid-green":
        return "url(/images/background/background4.jpg) no-repeat center center";
      case "grid-blue":
        return "url(/images/background/background5.jpg) no-repeat center center";
      case "dark-clover":
        return "url(/images/background/background6.jpg) no-repeat center center";
      case "clover":
        return "url(/images/background/background7.jpg) no-repeat center center";
      default:
        return "url(/images/background/background1.jpg) no-repeat center center";
    }
  }, [background]);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      width="100dvw"
      height="100dvh"
      {...props}
      sx={[
        (theme) => ({
          bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.900",
        }),
        ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
    >
      <Container
        maxWidth={false}
        sx={{
          py: 2,
          height: "100%",
          maxWidth: containerMaxWidth,
          width: "100%",
          aspectRatio: containerAspectRatio,
          background: backgroundImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          // borderRadius: 5,
        }}
      >
        {children}
      </Container>
    </Stack>
  );
};

export default GameBoard;
