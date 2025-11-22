import { Stack, Typography, useTheme } from "@mui/material";

interface StateProps {
  title: string;
  value: string | number;
}
const State: React.FC<StateProps> = ({ title, value }) => {
  const theme = useTheme();
  const offset = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [-1, 1],
    [1, -1],
  ];
  const surround = offset.map(
    ([x, y]) =>
      `${x}px ${y}px 1px ${theme.palette.mode === "dark" ? "white" : "black"}`
  );
  const textShadow = surround.join(", ");
  return (
    <Stack gap={1} color="white" alignItems="center">
      <Typography variant="body1" sx={{ textShadow }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ textShadow }}>
        {value.toLocaleString("ko")}
      </Typography>
    </Stack>
  );
};

export default State;
