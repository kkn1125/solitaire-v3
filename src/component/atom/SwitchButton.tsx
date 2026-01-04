import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";

interface SwitchButtonProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  checked: initialChecked,
  onChange,
}) => {
  const [checked, setChecked] = useState(initialChecked);

  const handleClick = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onChange?.(newChecked);
  };

  return (
    <Stack
      direction="row"
      position="relative"
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        position: "relative",
        width: 120,
        height: 35,
        borderRadius: 2,
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.08)",
          borderColor: "rgba(0, 0, 0, 0.15)",
          // transform: "scale(1.02)",
        },
        // "&:active": {
        //   transform: "scale(0.98)",
        // },
      }}
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "켜짐" : "꺼짐"}
    >
      {/* 슬라이딩 배경 */}
      <Box
        position="absolute"
        top={0}
        left={checked ? 0 : "50%"}
        bottom={0}
        width="50%"
        borderRadius={1.5}
        zIndex={1}
        sx={{
          backgroundColor: checked
            ? "linear-gradient(135deg,rgb(102, 234, 166) 0%,rgb(75, 162, 105) 100%)"
            : "linear-gradient(135deg,rgb(240, 147, 251) 0%,rgb(245, 87, 108) 100%)",
          background: checked
            ? "linear-gradient(135deg,rgb(102, 234, 166) 0%,rgb(75, 162, 105) 100%)"
            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: checked
            ? "0 4px 12px rgba(102, 126, 234, 0.4)"
            : "0 4px 12px rgba(245, 87, 108, 0.4)",
        }}
      />
      {/* ON 텍스트 */}
      <Typography
        zIndex={2}
        align="center"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: "0.875rem",
          color: checked ? "white" : "rgba(0, 0, 0, 0.5)",
          transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          userSelect: "none",
        }}
      >
        ON
      </Typography>
      {/* OFF 텍스트 */}
      <Typography
        zIndex={2}
        align="center"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: "0.875rem",
          color: !checked ? "white" : "rgba(0, 0, 0, 0.5)",
          transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          userSelect: "none",
        }}
      >
        OFF
      </Typography>
    </Stack>
  );
};

export default SwitchButton;
