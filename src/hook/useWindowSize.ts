import { CARD_SIZE_RATIO } from "@/config/variable";
import { useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export const useWindowSize = () => {
  const theme = useTheme();
  const [size, setSize] = useState("md");

  const fontSize = useMemo(() => {
    switch (size) {
      case "xs":
        return 10;
      case "sm1":
        return 12;
      case "sm2":
        return 18;
      case "md":
        return 18;
      case "lg":
        return 18;
      case "xl":
        return 18;
      default:
        return 20;
    }
  }, [size]);

  const cardWidth = useMemo(() => {
    return fontSize / (CARD_SIZE_RATIO / 2.3);
  }, [fontSize]);

  useEffect(() => {
    const small1 = 412;
    const small2 = theme.breakpoints.values.sm;
    const medium = theme.breakpoints.values.md;
    const large = theme.breakpoints.values.lg;
    const extraLarge = theme.breakpoints.values.xl;
    const detectSize = (windowWidth: number) => {
      if (windowWidth < small1) return "xs";
      if (windowWidth < small2) return "sm1";
      if (windowWidth < medium) return "sm2";
      if (windowWidth < large) return "md";
      if (windowWidth < extraLarge) return "lg";
      return "xl";
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize(detectSize(entry.contentRect.width));
      }
    });

    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, [theme]);

  return {
    getSize: () => size,
    isMobile: size === "xs" || size === "sm",
    isTablet: size === "md" || size === "lg",
    isDesktop: size === "xl",
    isExtraLarge: size === "xl",
    fontSize,
    cardWidth,
  };
};
