import { Easing, interpolate, random } from "remotion";

interface WinEffectFireworksProps {
  frame: number;
  durationInFrames: number;
  width: number;
  height: number;
}

const burstCount = 7;
const sparksPerBurst = 28;
const colors = ["#fde047", "#60a5fa", "#f472b6", "#4ade80", "#f97316"];

const WinEffectFireworks: React.FC<WinEffectFireworksProps> = ({
  frame,
  durationInFrames,
  width,
  height,
}) => {
  return (
    <>
      {Array.from({ length: burstCount }).map((_, burstIndex) => {
        const delay = burstIndex * 20;
        const localFrame = Math.max(0, frame - delay);
        const cx = width * (0.15 + random(`fireworks-cx-${burstIndex}`) * 0.7);
        const cy = height * (0.15 + random(`fireworks-cy-${burstIndex}`) * 0.45);
        const flashOpacity = interpolate(localFrame, [0, 7, 18], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div key={`fireworks-burst-${burstIndex}`}>
            <div
              style={{
                position: "absolute",
                left: cx - 18,
                top: cy - 18,
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.9)",
                filter: "blur(6px)",
                opacity: flashOpacity,
              }}
            />
            {Array.from({ length: sparksPerBurst }).map((__, sparkIndex) => {
              const angle =
                (Math.PI * 2 * sparkIndex) / sparksPerBurst +
                random(`fireworks-angle-${burstIndex}-${sparkIndex}`) * 0.2;
              const radius = interpolate(
                localFrame,
                [0, 40],
                [0, 40 + random(`fireworks-radius-${burstIndex}-${sparkIndex}`) * 160],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                },
              );
              const x = cx + Math.cos(angle) * radius;
              const y =
                cy +
                Math.sin(angle) * radius +
                interpolate(localFrame, [0, 50], [0, 30], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
              const opacity = interpolate(localFrame, [0, 8, 40, 52], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={`spark-${burstIndex}-${sparkIndex}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: colors[(sparkIndex + burstIndex) % colors.length],
                    boxShadow: "0 0 10px currentColor",
                    opacity,
                  }}
                />
              );
            })}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.18), rgba(0,0,0,0.2))",
          opacity: interpolate(
            frame,
            [0, 18, durationInFrames - 35, durationInFrames],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      />
    </>
  );
};

export default WinEffectFireworks;
