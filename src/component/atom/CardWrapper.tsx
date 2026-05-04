import { useWindowSize } from "@/hook/useWindowSize";
import {
  Stack,
  type StackProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import { forwardRef } from "react";

interface CardWrapperProps extends StackProps {
  children?: React.ReactNode;
  cardColor?: string;
  ["data-temp"]?: string;
  sx?: SxProps<Theme>;
}
export const CardWrapper = forwardRef<HTMLDivElement, CardWrapperProps>(
  ({ children, sx, ...props }, ref) => {
    const CARD_RATIO = 23 / 33;
    const { cardWidth, cardPadX, cardPadY } = useWindowSize();

    return (
      <Stack
        ref={ref}
        px={cardPadX}
        py={cardPadY}
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
          ...(props["data-temp"] === "false"
            ? {
                opacity: 0.3,
                borderStyle: "dashed",
              }
            : {}),
          ...sx,
        }}
        {...props}
      >
        {children}
      </Stack>
    );
  },
);
