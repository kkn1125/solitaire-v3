import { Container, Stack, type StackProps } from "@mui/material";

interface GameBoardProps extends StackProps {
  children: React.ReactNode;
}
const GameBoard: React.FC<GameBoardProps> = ({ children, ...props }) => {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      height="100vh"
      py={2}
      bgcolor="grey.900"
      {...props}
    >
      <Container
        maxWidth="sm"
        sx={{
          py: 2,
          height: "100%",
          aspectRatio: 412 / 915,
          background: `url(/images/background/background1.jpg) no-repeat center center`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderRadius: 5,
        }}
      >
        {children}
      </Container>
    </Stack>
  );
};

export default GameBoard;
