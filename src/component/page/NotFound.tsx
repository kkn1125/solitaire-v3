import SearchOff from "@mui/icons-material/SearchOff";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { FaHouse } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import GameButton from "../atom/GameButton";
import GameBoard from "../template/GameBoard";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GameBoard>
      <Stack
        height="100%"
        justifyContent="center"
        alignItems="center"
        px={2}
      >
        <Paper
          variant="outlined"
          sx={(theme) => ({
            borderRadius: 5,
            p: { xs: 3, sm: 5 },
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            backgroundColor:
              theme.palette.mode === "dark" ? "grey.800" : "grey.100",
            borderColor:
              theme.palette.mode === "dark" ? "grey.700" : "grey.300",
          })}
        >
          <Stack gap={3} alignItems="center">
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 6, fontSize: "0.95rem" }}
            >
              404
            </Typography>
            <Box
              sx={(theme) => ({
                width: 88,
                height: 88,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid",
                bgcolor:
                  theme.palette.mode === "dark" ? "grey.900" : "grey.200",
                borderColor:
                  theme.palette.mode === "dark" ? "grey.600" : "grey.400",
              })}
            >
              <SearchOff
                sx={(theme) => ({
                  fontSize: 48,
                  color:
                    theme.palette.mode === "dark"
                      ? "grey.400"
                      : "grey.600",
                })}
              />
            </Box>
            <Stack gap={1}>
              <Typography variant="h5" color="text.primary" fontWeight={700}>
                찾을 수 없는 페이지예요
              </Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                주소가 바뀌었거나 잘못 입력된 것 같아요. 홈에서 다시
                시작해 보세요.
              </Typography>
            </Stack>
            <GameButton
              title="게임 홈으로"
              placement="top"
              onClick={() => navigate("/")}
            >
              <FaHouse />
            </GameButton>
          </Stack>
        </Paper>
      </Stack>
    </GameBoard>
  );
};

export default NotFound;
