import WifiOff from "@mui/icons-material/WifiOff";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { FaHouse } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import GameButton from "../atom/GameButton";
import GameBoard from "../template/GameBoard";

const Offline: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      navigate("/", { replace: true });
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [navigate]);

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
              <WifiOff
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
                오프라인 상태예요
              </Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                인터넷 연결을 확인해 주세요. 연결이 복구되면 이 화면에서
                자동으로 게임으로 돌아가요.
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

export default Offline;
