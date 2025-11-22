import { useEffect, useMemo, useState } from "react";

export const useCard = (
  cardRef: React.RefObject<HTMLDivElement | null>,
  { baseFontSize = 16 }: { baseFontSize?: number } = {}
) => {
  const [baseSize, setBaseSize] = useState(0);
  const [fontSizeRate, setFontSizeRate] = useState(0);

  const fontSizeMemo = useMemo(() => {
    return baseFontSize + fontSizeRate;
  }, [baseFontSize, fontSizeRate]);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setBaseSize((prev) => (prev ? prev : entry.contentRect.width));
        setFontSizeRate(entry.contentRect.width - baseSize);
      }
    });
    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [baseSize, cardRef]);

  return {
    fontSize: fontSizeMemo,
  };
};
