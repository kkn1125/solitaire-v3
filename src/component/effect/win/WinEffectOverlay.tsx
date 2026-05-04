import { useEffect, useMemo, useState } from "react";
import { interpolate } from "remotion";
import WinEffectClassicCascade from "./WinEffectClassicCascade";
import WinEffectConfettiBurst from "./WinEffectConfettiBurst";
import WinEffectFireworks from "./WinEffectFireworks";
import type { WinEffectType } from "./WinEffectType";

interface WinEffectOverlayProps {
  type: WinEffectType;
  onDone: () => void;
}

const FPS = 60;

function useTimelineFrame(durationInFrames: number, onDone: () => void) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let startTime = 0;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const elapsedMs = now - startTime;
      const nextFrame = Math.floor((elapsedMs / 1000) * FPS);
      setFrame(nextFrame);
      if (nextFrame >= durationInFrames) {
        onDone();
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [durationInFrames, onDone]);

  return Math.min(frame, durationInFrames);
}

const WinEffectOverlay: React.FC<WinEffectOverlayProps> = ({
  type,
  onDone,
}) => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const durationInFrames = useMemo(() => {
    switch (type) {
      case "classicCascade":
        return 220;
      case "confettiBurst":
        return 190;
      case "fireworks":
        return 210;
    }
  }, [type]);

  const frame = useTimelineFrame(durationInFrames, onDone);
  const overlayOpacity = interpolate(
    frame,
    [0, 8, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: overlayOpacity,
      }}
    >
      {type === "classicCascade" && (
        <WinEffectClassicCascade
          frame={frame}
          durationInFrames={durationInFrames}
          width={viewport.width}
          height={viewport.height}
        />
      )}
      {type === "confettiBurst" && (
        <WinEffectConfettiBurst
          frame={frame}
          durationInFrames={durationInFrames}
          width={viewport.width}
          height={viewport.height * 0.5}
        />
      )}
      {type === "fireworks" && (
        <WinEffectFireworks
          frame={frame}
          durationInFrames={durationInFrames}
          width={viewport.width}
          height={viewport.height}
        />
      )}
    </div>
  );
};

export default WinEffectOverlay;
