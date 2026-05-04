import {
  detectSize,
  SIZE_TOKENS,
  type SizeKey,
  type SizeTokens,
} from "@/config/responsive";
import { useEffect, useState } from "react";

export type WindowSizeState = SizeTokens & {
  size: SizeKey;
  getSize: () => SizeKey;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isExtraLarge: boolean;
};

function getInitialSize(): SizeKey {
  if (typeof window === "undefined") return "md";
  return detectSize(window.innerWidth);
}

export const useWindowSize = (): WindowSizeState => {
  const [size, setSize] = useState<SizeKey>(getInitialSize);

  useEffect(() => {
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
  }, []);

  const tokens = SIZE_TOKENS[size];

  const isMobile = size === "xs" || size === "sm1" || size === "sm2";
  const isTablet = size === "md";
  const isDesktop = size === "lg" || size === "xl";

  return {
    size,
    getSize: () => size,
    isMobile,
    isTablet,
    isDesktop,
    isExtraLarge: size === "xl",
    ...tokens,
  };
};
