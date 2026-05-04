import { Easing, interpolate, random } from "remotion";

interface WinEffectConfettiBurstProps {
  frame: number;
  durationInFrames: number;
  width: number;
  height: number;
}

const particleCount = 120;
const palette = ["#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6", "#ef4444"];

const WinEffectConfettiBurst: React.FC<WinEffectConfettiBurstProps> = ({
  frame,
  durationInFrames,
  width,
  height,
}) => {
  const centerX = width / 2;
  const centerY = height * 0.55;

  return (
    <>
      {Array.from({ length: particleCount }).map((_, index) => {
        const angle = random(`confetti-angle-${index}`) * Math.PI * 2;
        const speed = 240 + random(`confetti-speed-${index}`) * 420;
        const gravity = 320 + random(`confetti-gravity-${index}`) * 200;
        const life = 140 + Math.floor(random(`confetti-life-${index}`) * 35);
        const t = frame / 60;
        const x = centerX + Math.cos(angle) * speed * t;
        const y = centerY + Math.sin(angle) * speed * t + gravity * t * t;
        const rotate = interpolate(frame, [0, life], [0, 1080], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.linear,
        });
        const opacity = interpolate(
          frame,
          [0, 12, life - 18, life],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        const color = palette[index % palette.length];
        const size = 6 + random(`confetti-size-${index}`) * 8;

        return (
          <div
            key={`confetti-${index}`}
            style={{
              position: "absolute",
              width: size,
              height: size * 1.8,
              left: x,
              top: y,
              backgroundColor: color,
              borderRadius: 2,
              opacity,
              transform: `rotate(${rotate}deg)`,
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.45)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.14), rgba(255,255,255,0))",
          opacity: interpolate(
            frame,
            [0, 20, durationInFrames - 35, durationInFrames],
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

export default WinEffectConfettiBurst;
