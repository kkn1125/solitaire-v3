import { Stack, Typography } from "@mui/material";

interface StateProps {
  title: string;
  value: string | number;
}
const State: React.FC<StateProps> = ({ title, value }) => {
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
  const surround = offset.map(([x, y]) => `${x}px ${y}px 1px white`);
  const textShadow = surround.join(", ");
  return (
    <Stack gap={1} color="white" alignItems="center">
      <Typography variant="body1" sx={{ textShadow, color: "black" }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ textShadow, color: "black" }}>
        {value.toLocaleString("ko")}
      </Typography>
    </Stack>
  );
};

export default State;
