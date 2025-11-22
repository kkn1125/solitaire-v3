import { forwardRef } from "react";
import { useWindowSize } from "@/hook/useWindowSize";
import {
  Stack,
  type StackProps,
  type SxProps,
  type Theme,
} from "@mui/material";

interface CardWrapperProps extends StackProps {
  children?: React.ReactNode;
  cardColor?: string;
  sx?: SxProps<Theme>;
}
export const CardWrapper = forwardRef<HTMLDivElement, CardWrapperProps>(
  ({ children, sx, ...props }, ref) => {
    const CARD_RATIO = 23 / 33;
    const { cardWidth } = useWindowSize();

    return (
      <Stack
        ref={ref}
        px={0.5}
        py={0.8}
        sx={{
          borderRadius: 1,
          cursor: "pointer",
          userSelect: "none",
          minWidth: cardWidth,
          width: cardWidth,
          maxWidth: cardWidth,
          minHeight: "fit-content",
          height: "fit-content",
          maxHeight: "fit-content",
          aspectRatio: CARD_RATIO,
          ...sx,
        }}
        {...props}
      >
        {children}
      </Stack>
    );
  }
);
