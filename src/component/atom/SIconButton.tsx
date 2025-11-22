import {
  IconButton,
  Tooltip,
  type IconButtonProps,
  type TooltipProps,
} from "@mui/material";

interface SIconButtonProps {
  children: React.ReactNode;
  title: string;
  placement?: TooltipProps["placement"];
  color?: IconButtonProps["color"];
}
const SIconButton: React.FC<SIconButtonProps & IconButtonProps> = ({
  children,
  title,
  placement = "top",
  color = "primary",
  ...props
}) => {
  return (
    <Tooltip title={title} placement={placement} arrow>
      <IconButton
        color={color}
        sx={{
          color: "white",
          backgroundColor: "primary.main",
          backdropFilter: "blur(8px) saturate(180%)",
          background:
            "linear-gradient(135deg, rgba(49, 131, 255, 0.40) 0%, rgba(13, 36, 76, 0.30) 100%)",
          boxShadow:
            "0 4px 20px 0 rgba(49,131,255,0.18), 0 2px 6px rgba(0,0,0,0.09) inset",
          border: "1px solid rgba(255,255,255,0.25)",
          "&:hover, &:focus": {
            backgroundColor: "primary.dark",
            background:
              "linear-gradient(135deg, rgba(49, 131, 255, 0.55) 0%, rgba(13, 36, 76, 0.40) 100%)",
            boxShadow:
              "0 6px 32px 0 rgba(49,131,255,0.22), 0 2px 12px rgba(0,0,0,0.13) inset",
          },
        }}
        {...props}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};

export default SIconButton;
