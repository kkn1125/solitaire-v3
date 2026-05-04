import { interpolate, random, spring } from "remotion";

interface WinEffectClassicCascadeProps {
  frame: number;
  durationInFrames: number;
  width: number;
  height: number;
}

const suitMarks = ["♠", "♥", "♦", "♣"] as const;
const cardCount = 42;

const WinEffectClassicCascade: React.FC<WinEffectClassicCascadeProps> = ({
  frame,
  durationInFrames,
  width,
  height,
}) => {
  return (
    <>
      {Array.from({ length: cardCount }).map((_, index) => {
        const delay = Math.floor(random(`cascade-delay-${index}`) * 80);
        const localFrame = Math.max(0, frame - delay);
        const progress = spring({
          frame: localFrame,
          fps: 60,
          durationInFrames: 110,
          config: {
            damping: 14,
            stiffness: 70,
          },
        });

        const startX = random(`cascade-start-x-${index}`) * width;
        const drift = (random(`cascade-drift-${index}`) - 0.5) * 300;
        const x = interpolate(progress, [0, 1], [startX, startX + drift], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(progress, [0, 1], [-160, height + 220], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rotate = interpolate(
          progress,
          [0, 1],
          [0, (random(`cascade-rot-${index}`) - 0.5) * 1080],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        const opacity = interpolate(
          frame,
          [durationInFrames - 25, durationInFrames],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        const suit = suitMarks[index % suitMarks.length];
        const isRed = suit === "♥" || suit === "♦";

        return (
          <div
            key={`classic-cascade-${index}`}
            style={{
              position: "absolute",
              width: 56,
              height: 84,
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "2px solid rgba(0, 0, 0, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 26,
              color: isRed ? "#d61f4b" : "#101828",
              transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              opacity,
            }}
          >
            {suit}
          </div>
        );
      })}
    </>
  );
};

export default WinEffectClassicCascade;
