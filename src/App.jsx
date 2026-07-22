import {
  AbsoluteFill,
  Sequence,
  staticFile,
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Composition,
  registerRoot,
  random,
} from "remotion";
import { Audio } from "@remotion/media";

// ==========================================
// TOKENS & STYLES
// ==========================================
const COLORS = {
  Surface: "#FFFFFF",
  Primary: "#2563EB",
  Success: "#10B981",
  Warning: "#F59E0B",
  Danger: "#EF4444",
  Cyan: "#0891B2",
  Purple: "#8B5CF6",
  Rose: "#E11D48",
  Chrome: "#F1F5F9",
  Border: "#E2E8F0",
  Muted: "#64748B",
  TextTitle: "#0F172A",
  TextBody: "#1E293B",
};

const BG_GRADIENTS = [
  "linear-gradient(135deg,#DBEAFE,#E0F2FE)", // 0 - Blue
  "linear-gradient(135deg,#FEF3C7,#FDE68A 40%,#FFEDD5)", // 1 - Amber
  "linear-gradient(135deg,#D1FAE5,#CCFBF1)", // 2 - Green
  "linear-gradient(135deg,#FFE4E6,#FCE7F3)", // 3 - Rose
  "linear-gradient(135deg,#CFFAFE,#E0F2FE)", // 4 - Cyan
];

// ==========================================
// ANIMATION HELPERS (SECTION 8)
// ==========================================
function useEnter(delayFrames = 20, config = { damping: 14, stiffness: 100 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delayFrames, fps, config });
  return {
    value: enter,
    style: {
      opacity: Math.min(enter * 2, 1),
      transform: `translateY(${interpolate(enter, [0, 1], [120, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })}px) scale(${interpolate(enter, [0, 1], [0.85, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })})`,
    },
  };
}

const Connector = ({
  x1,
  y1,
  x2,
  y2,
  startFrame,
  color = "#2563EB",
  strokeWidth = 10,
  dashed = false,
  arrow = false,
  flowSpeed = 1.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 90 },
  });
  const clamped = Math.max(0, Math.min(1, progress));
  const length = Math.hypot(x2 - x1, y2 - y1);
  const unit = 35;
  const effFlowSpeed = Math.max(Math.abs(flowSpeed), 0.4);
  const drawOffset = interpolate(clamped, [0, 1], [length, 0], clampBoth);
  const flowOffset = ((frame - startFrame) * effFlowSpeed) % unit;
  const settled = clamped > 0.995;
  const dashArray = settled
    ? dashed
      ? "20,15"
      : "none"
    : `${length},${length}`;
  const dashOffset = settled ? (dashed ? -flowOffset : 0) : drawOffset;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const arrowLen = Math.max(strokeWidth * 3, 30);
  const arrowHalf = Math.max(strokeWidth * 1.9, 19);
  const arrowScale = interpolate(
    clamped,
    [0.85, 0.95, 1],
    [0, 1.15, 1],
    clampBoth,
  );
  const arrowOpacity = interpolate(clamped, [0.82, 0.95], [0, 1], clampBoth);
  const linecap = arrow ? "butt" : "round";
  const needsTail = settled && dashed && arrow;
  const tailLen = Math.min(arrowLen * 1.5, length * 0.3);
  const ux = length > 0 ? (x2 - x1) / length : 0;
  const uy = length > 0 ? (y2 - y1) / length : 0;
  const tailX = x2 - ux * tailLen;
  const tailY = y2 - uy * tailLen;
  const margin = Math.max(strokeWidth * 2, arrowHalf + 30);
  const minX = Math.min(x1, x2) - margin;
  const minY = Math.min(y1, y2) - margin;
  const boxW = Math.abs(x2 - x1) + margin * 2;
  const boxH = Math.abs(y2 - y1) + margin * 2;
  return (
    <svg
      style={{
        position: "absolute",
        left: minX,
        top: minY,
        width: boxW,
        height: boxH,
        overflow: "visible",
        pointerEvents: "none",
      }}
      viewBox={`${minX} ${minY} ${boxW} ${boxH}`}
    >
      <line
        x1={x1}
        y1={y1}
        x2={needsTail ? tailX : x2}
        y2={needsTail ? tailY : y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={linecap}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        opacity={clamped > 0 ? 1 : 0}
      />
      {needsTail && (
        <line
          x1={tailX}
          y1={tailY}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap={linecap}
        />
      )}
      {arrow && (
        <polygon
          points={`${arrowLen * 0.4},0 ${-arrowLen * 0.6},${-arrowHalf} ${-arrowLen * 0.6},${arrowHalf}`}
          fill={color}
          opacity={arrowOpacity}
          transform={`translate(${x2}, ${y2}) rotate(${angle}) scale(${arrowScale})`}
        />
      )}
    </svg>
  );
};

function useMoveBetween(
  fromX,
  fromY,
  toX,
  toY,
  startFrame,
  config = { damping: 18, stiffness: 80 },
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(
    0,
    Math.min(1, spring({ frame: frame - startFrame, fps, config })),
  );
  return {
    x: interpolate(t, [0, 1], [fromX, toX]),
    y: interpolate(t, [0, 1], [fromY, toY]),
    progress: t,
  };
}

function useTypewriter(text, startFrame, charsPerSecond = 20) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.floor((elapsed / fps) * charsPerSecond);
  return text.slice(0, charsToShow);
}

function useClickPulse(clickFrame) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - clickFrame,
        fps,
        config: { damping: 15, stiffness: 200 },
      }),
    ),
  );
  return {
    ringScale: interpolate(t, [0, 1], [0.3, 2.4]),
    ringOpacity: interpolate(t, [0, 0.15, 1], [0, 0.5, 0]),
    pressScale: interpolate(t, [0, 0.15, 0.3, 1], [1, 0.88, 1, 1]),
  };
}

function useExit(exitStartFrame, config = { damping: 16, stiffness: 100 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = spring({ frame: frame - exitStartFrame, fps, config });
  return {
    value: exit,
    style: {
      opacity: interpolate(exit, [0, 1], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      transform: `translateY(${interpolate(exit, [0, 1], [0, -60], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })}px) scale(${interpolate(exit, [0, 1], [1, 0.9], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })})`,
    },
  };
}

function useMoveAlongPath(waypoints, config = { damping: 18, stiffness: 80 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame <= waypoints[0].frame)
    return { x: waypoints[0].x, y: waypoints[0].y, progress: 0 };
  let i = 0;
  while (i < waypoints.length - 2 && frame >= waypoints[i + 1].frame) i++;
  const from = waypoints[i];
  const to = waypoints[i + 1];
  const t = Math.max(
    0,
    Math.min(1, spring({ frame: frame - from.frame, fps, config })),
  );
  return {
    x: interpolate(t, [0, 1], [from.x, to.x], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    y: interpolate(t, [0, 1], [from.y, to.y], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    progress: t,
  };
}

function useAmbientFloat(amplitude = 12, periodFrames = 120, phase = 0) {
  const frame = useCurrentFrame();
  return Math.sin(((frame + phase) / periodFrames) * Math.PI * 2) * amplitude;
}

const SceneHeading = ({ title }) => {
  const enter = useEnter(10);
  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 100,
        zIndex: 50,
        fontFamily: "Quicksand",
        fontSize: 90,
        fontWeight: 700,
        color: COLORS.Muted,
        ...enter.style,
      }}
    >
      {title}
    </div>
  );
};

const PersonFigure = ({
  x,
  y,
  label,
  color = "#2563EB",
  scale = 1,
  tone = "soft",
  delayFrames = 0,
}) => {
  const enter = useEnter(delayFrames, { damping: 15, stiffness: 110 });
  const bg = tone === "solid" ? color : `${color}1F`;
  const iconColor = tone === "solid" ? "#FFFFFF" : color;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        textAlign: "center",
        ...enter.style,
      }}
    >
      <div
        style={{
          width: 180 * scale,
          height: 180 * scale,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <svg width={100 * scale} height={110 * scale} viewBox="0 0 100 110">
          <circle cx="50" cy="30" r="26" fill={iconColor} />
          <path d="M10 106 Q10 64 50 64 Q90 64 90 106" fill={iconColor} />
        </svg>
      </div>
      {label && (
        <div
          style={{
            fontFamily: "Quicksand",
            fontWeight: 700,
            fontSize: 36 * scale,
            color: COLORS.TextBody,
            marginTop: 14,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

const IconBadge = ({
  x,
  y,
  size = 220,
  color = "#2563EB",
  tone = "soft",
  shape = "circle",
  icon,
  delayFrames = 0,
}) => {
  const enter = useEnter(delayFrames, { damping: 15, stiffness: 110 });
  const bg = tone === "solid" ? color : `${color}1F`;
  const iconColor = tone === "solid" ? "#FFFFFF" : color;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "50%" : size * 0.22,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 20px 50px rgba(15,23,42,0.10)",
        ...enter.style,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
        {icon(iconColor)}
      </svg>
    </div>
  );
};

const GLOW_CORNERS = {
  topLeft: { x: -500, y: -400 },
  topRight: { x: 2940, y: -400 },
  bottomLeft: { x: -500, y: 1510 },
  bottomRight: { x: 2940, y: 1510 },
};

const AmbientGlow = ({
  corner = "topRight",
  size = 1400,
  color,
  sceneDuration,
  phase = 0,
}) => {
  const enter = useEnter(45, { damping: 22, stiffness: 60 });
  const exit = useExit(Math.max(46, sceneDuration - 55), {
    damping: 22,
    stiffness: 60,
  });
  const breathe = useAmbientFloat(0.03, 280, phase);
  const presence = enter.style.opacity * exit.style.opacity;
  const { x, y } = GLOW_CORNERS[corner];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.75,
        borderRadius: "50%",
        opacity: Math.max(0, (0.16 + breathe) * presence),
        pointerEvents: "none",
        filter: "blur(50px)",
        background: `radial-gradient(ellipse at center, ${color} 0%, ${color}00 72%)`,
      }}
    />
  );
};

const SceneBackground = ({ gradient, sceneDuration }) => {
  const enter = useEnter(0, { damping: 20, stiffness: 90 });
  const exit = useExit(sceneDuration - 25, { damping: 20, stiffness: 90 });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: gradient,
        opacity: enter.style.opacity * exit.style.opacity,
      }}
    />
  );
};

// ==========================================
// SCENE 1 — Welcome & Intro
// ==========================================
const S1_DUR = 360;

const Scene1 = () => {
  const mainEnter = useEnter(20);
  const subEnter = useEnter(120);

  // Both elements fade out together before the scene ends
  const exitAll = useExit(S1_DUR - 60);

  return (
    <AbsoluteFill>
      <SceneBackground gradient={BG_GRADIENTS[0]} sceneDuration={S1_DUR} />

      {/* Decorative Atmosphere */}
      <AmbientGlow
        corner="topRight"
        color={COLORS.Primary}
        sceneDuration={S1_DUR}
      />
      <AmbientGlow
        corner="bottomLeft"
        color={COLORS.Cyan}
        sceneDuration={S1_DUR}
        phase={80}
      />

      {/* Note: omitted <SceneHeading> as per Director's notes specifically for this scene */}

      {/* Centered Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          fontFamily: "Quicksand",
          ...exitAll.style, // Apply the exit fade out here for everything inside
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 800,
            color: COLORS.TextTitle,
            ...mainEnter.style,
          }}
        >
          Welcome!
        </div>

        <div
          style={{
            fontSize: 90,
            fontWeight: 600,
            color: "#2563EB",
            ...subEnter.style,
          }}
        >
          Why are we here?
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 2 — Sara's Story Setup

// 1. New Mockup Components needed for this scene
const ConceptCard = ({ x, y, title, color = "#1E293B", delayFrames }) => {
  const enter = useEnter(delayFrames);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div style={enter.style}>
        <div
          style={{
            padding: "30px 60px",
            background: "#FFFFFF",
            borderRadius: 20,
            fontSize: 60,
            fontWeight: 700,
            fontFamily: "Quicksand",
            color: color,
            boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
            border: `4px solid ${color}20`,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};

const LaptopDevice = ({ delayFrames, x, y }) => {
  const enter = useEnter(delayFrames, { damping: 14, stiffness: 120 });
  return (
    <div style={{ position: "absolute", left: x, top: y, ...enter.style }}>
      <svg width={90} height={90} viewBox="0 0 24 24">
        <rect x="2" y="16" width="20" height="2" rx="0.5" fill={COLORS.Muted} />
        <rect x="4" y="6" width="16" height="9" rx="1" fill={COLORS.TextBody} />
      </svg>
    </div>
  );
};

const MobileDevice = ({ delayFrames, x, y }) => {
  const enter = useEnter(delayFrames, { damping: 14, stiffness: 120 });
  return (
    <div style={{ position: "absolute", left: x, top: y, ...enter.style }}>
      <svg width={50} height={70} viewBox="0 0 24 36">
        <rect
          x="2"
          y="2"
          width="20"
          height="32"
          rx="3"
          fill={COLORS.TextBody}
        />
        <circle cx="12" cy="30" r="1.5" fill={COLORS.Surface} />
      </svg>
    </div>
  );
};

// 2. Scene Component
const S2_DUR = 950;

export const Scene2 = () => {
  // We use full-screen absolute wrappers for grouped exits so they scale cinematically toward the true center
  const earlyExit = useExit(280);
  const finalExit = useExit(S2_DUR - 60);

  // Sara's fluid movement up the frame
  const saraMove = useMoveBetween(1830, 1400, 1830, 990, 340);

  return (
    <AbsoluteFill>
      <SceneBackground gradient={BG_GRADIENTS[1]} sceneDuration={S2_DUR} />
      <AmbientGlow
        corner="topLeft"
        color={COLORS.Warning}
        sceneDuration={S2_DUR}
      />
      <AmbientGlow
        corner="bottomRight"
        color={COLORS.Primary}
        sceneDuration={S2_DUR}
        phase={60}
      />

      {/* Layer 1: Elements that exit entirely before the scene ends */}
      <div style={{ ...finalExit.style, position: "absolute", inset: 0 }}>
        <SceneHeading title="Sara's Story" />

        {/* The Initial Problem -> Solution sequence */}
        <div style={{ ...earlyExit.style, position: "absolute", inset: 0 }}>
          <ConceptCard
            x={1300}
            y={800}
            title="Problem"
            color={COLORS.Danger}
            delayFrames={40}
          />

          <Connector
            x1={1487}
            y1={800}
            x2={2340}
            y2={800}
            startFrame={90}
            dashed={false}
            arrow={true}
            color={COLORS.Muted}
          />

          <ConceptCard
            x={2540}
            y={800}
            title="Solution"
            color={COLORS.Success}
            delayFrames={140}
          />
        </div>

        {/* The expanded Shop sequence (enters mid-scene, exits at very end) */}
        <Connector
          x1={1920}
          y1={980}
          x2={1920}
          y2={720}
          startFrame={420}
          dashed={false}
          arrow={true}
          color={COLORS.Muted}
        />

        <IconBadge
          x={1810}
          y={480}
          color={COLORS.Purple}
          delayFrames={480}
          icon={(c) => (
            <g fill={c}>
              <path d="M2,9 L22,9 L20,4 L4,4 Z" />
              <rect x="2" y="10" width="20" height="11" rx="1" />
              <rect
                x="6"
                y="13"
                width="4"
                height="5"
                fill="#FFFFFF"
                opacity="0.9"
                rx="0.5"
              />
              <rect
                x="14"
                y="13"
                width="4"
                height="5"
                fill="#FFFFFF"
                opacity="0.9"
                rx="0.5"
              />
            </g>
          )}
        />

        <LaptopDevice delayFrames={540} x={1680} y={600} />
        <MobileDevice delayFrames={570} x={2080} y={605} />

        {/* The Technicians sequence */}
        <Connector
          x1={2020}
          y1={1080}
          x2={2340}
          y2={1080}
          startFrame={620}
          dashed={false}
          arrow={false} // A plain line per notes and rigid structural rules
          color={COLORS.Muted}
        />

        <PersonFigure
          x={2400}
          y={800}
          label="Technician 1"
          color={COLORS.Cyan}
          delayFrames={670}
        />
        <PersonFigure
          x={2400}
          y={1150}
          label="Technician 2"
          color={COLORS.Cyan}
          delayFrames={720}
        />
      </div>

      {/* Layer 2: Sara (The sole survivor — intentionally OUTSIDE the finalExit wrapper) */}
      <div style={{ position: "absolute", left: saraMove.x, top: saraMove.y }}>
        <PersonFigure
          label="Sara"
          color={COLORS.Rose}
          tone="solid"
          delayFrames={220}
        />
      </div>
    </AbsoluteFill>
  );
};

const PlainPersonFigure = ({
  x,
  y,
  label,
  color = "#2563EB",
  scale = 1,
  tone = "soft",
  opacity = 1,
}) => {
  const bg = tone === "solid" ? color : `${color}1F`;
  const iconColor = tone === "solid" ? "#FFFFFF" : color;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        textAlign: "center",
        opacity,
        transform: "translateX(-50%)",
      }}
    >
      <div
        style={{
          width: 180 * scale,
          height: 180 * scale,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <svg width={100 * scale} height={110 * scale} viewBox="0 0 100 110">
          <circle cx="50" cy="30" r="26" fill={iconColor} />
          <path d="M10 106 Q10 64 50 64 Q90 64 90 106" fill={iconColor} />
        </svg>
      </div>
      {label && (
        <div
          style={{
            fontFamily: "Quicksand",
            fontWeight: 700,
            fontSize: 36 * scale,
            color: COLORS.TextBody,
            marginTop: 14,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

const DeviceShape = ({ x, y, type = "mobile", scale = 1, opacity = 1 }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      {type === "mobile" && (
        <svg width={60} height={100} viewBox="0 0 60 100">
          <rect
            x="0"
            y="0"
            width="60"
            height="100"
            rx="8"
            fill={COLORS.TextBody}
          />
          <rect
            x="4"
            y="4"
            width="52"
            height="80"
            rx="4"
            fill={COLORS.Surface}
          />
          <circle cx="30" cy="92" r="4" fill={COLORS.Surface} />
        </svg>
      )}
      {type === "laptop" && (
        <svg width={120} height={80} viewBox="0 0 120 80">
          <rect
            x="20"
            y="0"
            width="80"
            height="60"
            rx="4"
            fill={COLORS.TextBody}
          />
          <rect x="24" y="4" width="72" height="52" fill={COLORS.Surface} />
          <path d="M0 64 L120 64 L110 80 L10 80 Z" fill={COLORS.Muted} />
        </svg>
      )}
      {type === "pc" && (
        <svg width={50} height={100} viewBox="0 0 50 100">
          <rect
            x="0"
            y="0"
            width="50"
            height="100"
            rx="2"
            fill={COLORS.TextBody}
          />
          <rect
            x="15"
            y="10"
            width="20"
            height="4"
            fill={COLORS.Surface}
            opacity={0.5}
          />
          <circle cx="25" cy="30" r="8" fill={COLORS.Surface} opacity={0.8} />
          <circle cx="25" cy="80" r="4" fill={COLORS.Surface} opacity={0.5} />
        </svg>
      )}
    </div>
  );
};

const StickyNoteS3 = ({ x, y, text, scale = 1, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 240,
      height: 240,
      background: "#FDE047",
      padding: "24px 28px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      transform: `translate(-50%, -50%) scale(${scale}) rotate(-3deg)`,
      fontFamily: "JetBrains Mono",
      fontSize: 22,
      color: "#0F172A",
      fontWeight: 600,
      whiteSpace: "pre-wrap",
      lineHeight: 1.4,
      opacity,
    }}
  >
    {text}
  </div>
);

const MessageBubble = ({ x, y, text, startFrame, endFrame }) => {
  const enter = useEnter(startFrame);
  const exit = useExit(endFrame);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -100%)",
        opacity: enter.style.opacity * exit.style.opacity,
      }}
    >
      <div
        style={{
          ...enter.style,
          background: COLORS.Surface,
          padding: "20px 40px",
          borderRadius: 24,
          boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
          border: `3px solid ${COLORS.Border}`,
          fontFamily: "Quicksand",
          fontWeight: 700,
          fontSize: 32,
          color: COLORS.Primary,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// 2. Scene Component
const S3_DUR = 1150;

export const Scene3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

  // ====================
  // BASE COORDINATES
  // ====================
  const Y_BASE = 990;
  const CUST_X_TARGET = 600;
  const SARA_X = 1920;
  const RIGHT_X = 2600;

  // Shelf Structure
  const SHELF_X = 3200;
  const SHELF_TOP = 750;
  const ROW1_Y = SHELF_TOP + 200; // 950
  const ROW2_Y = SHELF_TOP + 400; // 1150
  const ROW3_Y = SHELF_TOP + 600; // 1350

  // ====================
  // GLOBAL TIMERS
  // ====================
  const sCustSlide = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 10,
        fps,
        config: { damping: 20, stiffness: 90 },
      }),
    ),
  );
  const sDev2Sara = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 110,
        fps,
        config: { damping: 22, stiffness: 90 },
      }),
    ),
  );
  const sStickyUp = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 560,
        fps,
        config: { damping: 18, stiffness: 90 },
      }),
    ),
  );
  const sDev2Right = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 640,
        fps,
        config: { damping: 22, stiffness: 80 },
      }),
    ),
  );
  const sSticky2Corner = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 720,
        fps,
        config: { damping: 20, stiffness: 90 },
      }),
    ),
  );
  const sCombo2Shelf = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 820,
        fps,
        config: { damping: 20, stiffness: 80 },
      }),
    ),
  );

  // End Sequence variables
  const shelfFade = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 820, fps })),
  );
  const sShelfShift = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 1000,
        fps,
        config: { damping: 20, stiffness: 80 },
      }),
    ),
  );
  const actorsExit = useExit(980);

  const stickyText = useTypewriter(
    "Client: Jane\nDevice: Mob\n\nIssue:\nCracked",
    400,
    25,
  );

  // ====================
  // POSITIONAL MATH
  // ====================
  // Shift strictly applies to the items that persist past character fadeouts
  const globalShiftX = interpolate(sShelfShift, [0, 1], [0, -2300], clampBoth);

  // Customer slide-in X
  const custX = interpolate(
    sCustSlide,
    [0, 1],
    [-400, CUST_X_TARGET],
    clampBoth,
  );

  // 1. Mobile (Active Device) tracking
  let devX = interpolate(sCustSlide, [0, 1], [-400, CUST_X_TARGET], clampBoth);
  devX = interpolate(sDev2Sara, [0, 1], [devX, SARA_X], clampBoth);
  devX = interpolate(sDev2Right, [0, 1], [devX, RIGHT_X], clampBoth);
  devX = interpolate(sCombo2Shelf, [0, 1], [devX, SHELF_X], clampBoth);
  devX += globalShiftX;

  let devY = Y_BASE - 80; // Default small corner badge height
  devY = interpolate(sDev2Right, [0, 1], [devY, Y_BASE + 100], clampBoth); // Move precisely to alignment of line & sticky
  devY = interpolate(sCombo2Shelf, [0, 1], [devY, ROW2_Y - 45], clampBoth);

  let devScale = 1; // Start small as Corner Badge
  devScale = interpolate(sDev2Right, [0, 1], [devScale, 2.0], clampBoth); // Pop to large hero size
  devScale = interpolate(sCombo2Shelf, [0, 1], [devScale, 0.7], clampBoth); // Match shelf clones

  // 2. Sticky tracking
  const stickyEnterOpacity = Math.min(1, Math.max(0, (frame - 380) / 15));
  let stX = RIGHT_X;
  stX = interpolate(sStickyUp, [0, 1], [stX, RIGHT_X], clampBoth);
  stX = interpolate(sSticky2Corner, [0, 1], [stX, RIGHT_X + 75], clampBoth); // Shift cleanly to Top Right corner of the bigger device
  stX = interpolate(sCombo2Shelf, [0, 1], [stX, SHELF_X + 45], clampBoth); // Shift safely into matched Clone offsets
  stX += globalShiftX;

  let stY = Y_BASE + 100; // Perfect alignment with dotted line
  stY = interpolate(sStickyUp, [0, 1], [stY, Y_BASE - 180], clampBoth); // Move Up
  stY = interpolate(sSticky2Corner, [0, 1], [stY, Y_BASE - 5], clampBoth); // Bind to top corner of increased device
  stY = interpolate(sCombo2Shelf, [0, 1], [stY, ROW2_Y - 80], clampBoth); // Shift safely into matched Clone offsets

  let stScale = 1.0;
  stScale = interpolate(sStickyUp, [0, 1], [stScale, 0.7], clampBoth);
  stScale = interpolate(sSticky2Corner, [0, 1], [stScale, 0.35], clampBoth);
  stScale = interpolate(sCombo2Shelf, [0, 1], [stScale, 0.25], clampBoth);

  // 3. Line Extend calculation
  // Extends from baseline towards center shelf gracefully (leaving gap right before it)
  const line2X2 = interpolate(
    sCombo2Shelf,
    [0, 1],
    [RIGHT_X - 150, SHELF_X - 250],
    clampBoth,
  );

  // 4. Clone Timers
  const clone1Fade = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 880, fps })),
  );
  const clone2Fade = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 910, fps })),
  );

  return (
    <AbsoluteFill>
      <SceneBackground gradient={BG_GRADIENTS[2]} sceneDuration={S3_DUR} />
      <AmbientGlow
        corner="bottomRight"
        color={COLORS.Success}
        sceneDuration={S3_DUR}
      />
      <AmbientGlow
        corner="topLeft"
        color={COLORS.Warning}
        sceneDuration={S3_DUR}
        phase={50}
      />

      <SceneHeading title="Managing Repairs" />

      {/* =========================================
          LAYER 1: Shelf & Duplicates
          ========================================= */}
      <div
        style={{
          position: "absolute",
          left: SHELF_X + globalShiftX,
          top: SHELF_TOP,
          opacity: shelfFade,
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            width: 360,
            height: 600,
            border: `8px solid ${COLORS.Muted}`,
            borderRadius: 16,
            background: `${COLORS.Chrome}88`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 196,
            left: 0,
            width: 360,
            height: 8,
            background: COLORS.Muted,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 396,
            left: 0,
            width: 360,
            height: 8,
            background: COLORS.Muted,
          }}
        />
      </div>

      <div style={{ opacity: clone1Fade }}>
        <DeviceShape
          type="laptop"
          scale={0.8}
          x={SHELF_X + globalShiftX}
          y={ROW1_Y - 35}
        />
        <StickyNoteS3
          text="Client: John&#10;Fix: OS"
          scale={0.25}
          x={SHELF_X + globalShiftX + 50}
          y={ROW1_Y - 70}
          opacity={1}
        />
      </div>

      <div style={{ opacity: clone2Fade }}>
        <DeviceShape
          type="pc"
          scale={0.7}
          x={SHELF_X + globalShiftX}
          y={ROW3_Y - 45}
        />
        <StickyNoteS3
          text="Client: Ali&#10;Replace MB"
          scale={0.25}
          x={SHELF_X + globalShiftX + 40}
          y={ROW3_Y - 80}
          opacity={1}
        />
      </div>

      {/* =========================================
          LAYER 2: Actors and Connectors
          ========================================= */}
      <div style={actorsExit.style}>
        <PlainPersonFigure
          x={custX}
          y={Y_BASE}
          label="Customer"
          color={COLORS.Purple}
          tone="soft"
          opacity={1}
        />
        <PlainPersonFigure
          x={SARA_X}
          y={Y_BASE}
          label="Sara"
          color={COLORS.Rose}
          tone="solid"
          opacity={1}
        />

        <Connector
          x1={CUST_X_TARGET + 150}
          y1={Y_BASE + 100}
          x2={SARA_X - 150}
          y2={Y_BASE + 100}
          startFrame={80}
          dashed={true}
          arrow={false}
          color={COLORS.Muted}
        />

        <Connector
          x1={SARA_X + 150}
          y1={Y_BASE + 100}
          x2={line2X2}
          y2={Y_BASE + 100}
          startFrame={360}
          dashed={true}
          arrow={false}
          color={COLORS.Muted}
        />

        <MessageBubble
          x={SARA_X}
          y={Y_BASE - 200}
          text="Confirming Delivery Date"
          startFrame={180}
          endFrame={350}
        />
      </div>

      {/* =========================================
          LAYER 3: The Active Travelling Mobile & Sticky Note
          ========================================= */}
      <DeviceShape
        type="mobile"
        scale={devScale}
        opacity={1}
        x={devX}
        y={devY}
      />
      <StickyNoteS3
        text={stickyText}
        scale={stScale}
        opacity={stickyEnterOpacity}
        x={stX}
        y={stY}
      />
    </AbsoluteFill>
  );
};
// SCENE 4 — The Loop & Handover

const DeviceShape4 = ({ type = "mobile" }) => {
  return (
    <div>
      {type === "mobile" && (
        <svg width={60} height={100} viewBox="0 0 60 100">
          <rect
            x="0"
            y="0"
            width="60"
            height="100"
            rx="8"
            fill={COLORS.TextBody}
          />
          <rect
            x="4"
            y="4"
            width="52"
            height="80"
            rx="4"
            fill={COLORS.Surface}
          />
          <circle cx="30" cy="92" r="4" fill={COLORS.Surface} />
        </svg>
      )}
      {type === "laptop" && (
        <svg width={120} height={80} viewBox="0 0 120 80">
          <rect
            x="20"
            y="0"
            width="80"
            height="60"
            rx="4"
            fill={COLORS.TextBody}
          />
          <rect x="24" y="4" width="72" height="52" fill={COLORS.Surface} />
          <path d="M0 64 L120 64 L110 80 L10 80 Z" fill={COLORS.Muted} />
        </svg>
      )}
      {type === "pc" && (
        <svg width={50} height={100} viewBox="0 0 50 100">
          <rect
            x="0"
            y="0"
            width="50"
            height="100"
            rx="2"
            fill={COLORS.TextBody}
          />
          <rect
            x="15"
            y="10"
            width="20"
            height="4"
            fill={COLORS.Surface}
            opacity={0.5}
          />
          <circle cx="25" cy="30" r="8" fill={COLORS.Surface} opacity={0.8} />
          <circle cx="25" cy="80" r="4" fill={COLORS.Surface} opacity={0.5} />
        </svg>
      )}
    </div>
  );
};

const StickyNoteS4 = ({ text, opacity = 1 }) => (
  <div
    style={{
      width: 240,
      height: 240,
      background: "#FDE047",
      padding: "24px 28px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      transform: `rotate(-3deg)`,
      fontFamily: "JetBrains Mono",
      fontSize: 22,
      color: "#0F172A",
      fontWeight: 600,
      whiteSpace: "pre-wrap",
      lineHeight: 1.4,
      opacity,
      textAlign: "left",
    }}
  >
    {text}
  </div>
);

const MessageBubbleS4 = ({ text, startFrame, endFrame }) => {
  const enter = useEnter(startFrame);
  const exit = useExit(endFrame);
  return (
    <div
      style={{
        transform: "translate(-50%, -100%)",
        opacity: enter.style.opacity * exit.style.opacity,
      }}
    >
      <div
        style={{
          ...enter.style,
          background: COLORS.Surface,
          padding: "16px 32px",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(15,23,42,0.15)",
          border: `3px solid ${COLORS.Border}`,
          fontFamily: "Quicksand",
          fontWeight: 700,
          fontSize: 28,
          color: COLORS.TextBody,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const MoneyIcon = ({ x, y, startFrame, endFrame, targetY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useEnter(startFrame);
  const exit = useExit(endFrame);

  const flight = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const currentY = interpolate(flight, [0, 1], [y, targetY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: currentY,
        transform: "translate(-50%, -50%)",
        opacity: enter.style.opacity * exit.style.opacity,
      }}
    >
      <div style={enter.style}>
        <svg width={100} height={60} viewBox="0 0 100 60">
          <rect
            x="4"
            y="4"
            width="92"
            height="52"
            rx="6"
            fill={COLORS.Success}
          />
          <rect
            x="10"
            y="10"
            width="80"
            height="40"
            rx="4"
            fill="#FFFFFF"
            opacity="0.3"
          />
          <circle cx="50" cy="30" r="12" fill={COLORS.Surface} opacity="0.9" />
          <path d="M47,23 L53,23 L53,37 L47,37 Z" fill={COLORS.Success} />
          <path d="M43,30 L57,30" stroke={COLORS.Success} strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// 2. Scene Engine
// ==========================================
const S4_DUR = 1050;

export const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

  // ====================
  // BASE COORDINATES (MATHEMATICALLY LOCKED)
  // ====================
  const SHELF_X = 900;
  const SHELF_TOP = 750;

  const ROW1_Y = SHELF_TOP + 200; // 950
  const ROW2_Y = SHELF_TOP + 400; // 1150 (True horizon line across Shelf, Tech, and Sara)
  const ROW3_Y = SHELF_TOP + 600; // 1350

  const TECH_X = 1750;
  const SARA_X = 2600;

  const Y_CUST = ROW2_Y + 500; // 1650 (Cleanly below Sara)

  // ====================
  // GLOBAL TIMERS
  // ====================
  const pDev2Tech = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 130,
        fps,
        config: { damping: 18, stiffness: 85 },
      }),
    ),
  );
  const pDev2Sara = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 460,
        fps,
        config: { damping: 18, stiffness: 85 },
      }),
    ),
  );
  const pDev2Cust = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 730,
        fps,
        config: { damping: 18, stiffness: 85 },
      }),
    ),
  );
  const pDevRight = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 830,
        fps,
        config: { damping: 20, stiffness: 70 },
      }),
    ),
  );

  const pStickyFade = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 690, fps, config: { damping: 16 } })),
  );
  const pCallingFly = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 640,
        fps,
        config: { damping: 22, stiffness: 80 },
      }),
    ),
  );

  // Springs for Smooth Floating Status Icons (Over Technician)
  const setOn = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 230, fps, config: { damping: 14 } })),
  );
  const setOff = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 310, fps, config: { damping: 14 } })),
  );
  const setScale = setOn - setOff;

  const tickOn = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 320, fps, config: { damping: 14 } })),
  );
  const tickOff = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 400, fps, config: { damping: 14 } })),
  );
  const tickScale = tickOn - tickOff;

  const sceneExit = useExit(990);

  // ====================
  // MOBILE + STICKY OVERHEAD TRACKER
  // ====================
  // Traces precisely overhead forming "Top Middle" positioning
  let devX = SHELF_X;
  devX = interpolate(pDev2Tech, [0, 1], [devX, TECH_X], clampBoth);
  devX = interpolate(pDev2Sara, [0, 1], [devX, SARA_X], clampBoth);
  devX = interpolate(pDevRight, [0, 1], [devX, SARA_X + 350], clampBoth); // Move to the right of cust later

  let devY = ROW2_Y - 45; // Base shelf height
  devY = interpolate(pDev2Tech, [0, 1], [devY, ROW2_Y - 170], clampBoth); // Flies up to hover over Tech exactly
  devY = interpolate(pDev2Cust, [0, 1], [devY, Y_CUST - 170], clampBoth); // Arcs down to hover over Cust exactly
  devY = interpolate(pDevRight, [0, 1], [devY, Y_CUST - 40], clampBoth); // Settles softly downwards

  let devScale = 0.7; // Constant through travel matching clones
  devScale = interpolate(pDevRight, [0, 1], [devScale, 1.2], clampBoth); // Enlarges when presented at end

  const dynamicStickyOpacity = interpolate(
    pStickyFade,
    [0, 1],
    [1, 0],
    clampBoth,
  );

  return (
    <AbsoluteFill>
      <SceneBackground gradient={BG_GRADIENTS[3]} sceneDuration={S4_DUR} />
      <AmbientGlow
        corner="topRight"
        color={COLORS.Success}
        sceneDuration={S4_DUR}
      />
      <AmbientGlow
        corner="bottomLeft"
        color={COLORS.Cyan}
        sceneDuration={S4_DUR}
        phase={80}
      />

      <SceneHeading title="Managing Repairs" />

      {/* =========================================
          LAYER 1: Static Shelf & Clones
          ========================================= */}
      <div
        style={{
          ...sceneExit.style,
          position: "absolute",
          left: SHELF_X,
          top: SHELF_TOP,
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            width: 360,
            height: 600,
            border: `8px solid ${COLORS.Muted}`,
            borderRadius: 16,
            background: `${COLORS.Chrome}88`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 196,
            left: 0,
            width: 360,
            height: 8,
            background: COLORS.Muted,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 396,
            left: 0,
            width: 360,
            height: 8,
            background: COLORS.Muted,
          }}
        />
      </div>

      <div style={sceneExit.style}>
        {/* Row 1 Clone */}
        <div
          style={{
            position: "absolute",
            left: SHELF_X,
            top: ROW1_Y - 45,
            transform: "translate(-50%, -50%) scale(0.8)",
          }}
        >
          <DeviceShape4 type="laptop" />
        </div>
        <div
          style={{
            position: "absolute",
            left: SHELF_X + 45,
            top: ROW1_Y - 70,
            transform: "translate(-50%, -50%) scale(0.22)",
          }}
        >
          <StickyNoteS4
            text="Client: John&#10;Fix: OS"
          />
        </div>

        {/* Row 3 Clone */}
        <div
          style={{
            position: "absolute",
            left: SHELF_X,
            top: ROW3_Y - 45,
            transform: "translate(-50%, -50%) scale(0.7)",
          }}
        >
          <DeviceShape4 type="pc" />
        </div>
        <div
          style={{
            position: "absolute",
            left: SHELF_X + 25,
            top: ROW3_Y - 70,
            transform: "translate(-50%, -50%) scale(0.22)",
          }}
        >
          <StickyNoteS4
            text="Client: Ali&#10;Replace MB"
          />
        </div>
      </div>

      {/* =========================================
          LAYER 2: Structural Lines (Mathematical Dead Center)
          ========================================= */}
      <div style={sceneExit.style}>
        {/* Horizontal span connecting directly on ROW2_Y */}
        <Connector
          x1={SHELF_X + 220}
          y1={ROW2_Y}
          x2={TECH_X - 150}
          y2={ROW2_Y}
          startFrame={40}
          dashed={true}
          color={COLORS.Muted}
        />
        <Connector
          x1={TECH_X + 150}
          y1={ROW2_Y}
          x2={SARA_X - 150}
          y2={ROW2_Y}
          startFrame={380}
          dashed={true}
          color={COLORS.Muted}
        />

        {/* Vertical Drop. (+0.1 on x2 forces SVG bounding box width to prevent native geometric collapsing display bugs on 0-width vertical SVGs) */}
        <Connector
          x1={SARA_X}
          y1={ROW2_Y + 150}
          x2={SARA_X + 0.1}
          y2={Y_CUST - 150}
          startFrame={560}
          dashed={true}
          color={COLORS.Muted}
        />

        <div
          style={{
            position: "absolute",
            left: SARA_X - 400,
            top: ROW2_Y - 280,
          }}
        >
          <MessageBubbleS4 text={"Informing"} startFrame={500} endFrame={580} />
        </div>

        {/* Calling phone icon traveling line manually */}
        {frame >= 640 && frame <= 710 && (
          <div
            style={{
              position: "absolute",
              left: SARA_X,
              top: interpolate(
                pCallingFly,
                [0, 1],
                [ROW2_Y + 150, Y_CUST - 150],
                clampBoth,
              ),
              transform: "translate(-50%, -50%) scale(0.8)",
              opacity: 1 - Math.max(0, (frame - 695) / 15),
            }}
          >
            <IconBadge
              size={140}
              color={COLORS.Warning}
              tone="solid"
              delayFrames={0}
              icon={(c) => (
                <path
                  d="M6.62,10.79 C8.06,13.62 10.38,15.94 13.21,17.38 L15.41,15.18 C15.69,14.9 16.08,14.82 16.43,14.93 C17.55,15.3 18.75,15.5 20,15.5 C20.55,15.5 21,15.95 21,16.5 L21,20 C21,20.55 20.55,21 20,21 C10.06,21 2,12.94 2,3 C2,2.45 2.45,2 3,2 L6.5,2 C7.05,2 7.5,2.45 7.5,3 C7.5,4.25 7.7,5.45 8.07,6.57 C8.18,6.92 8.1,7.31 7.82,7.59 L6.62,10.79 Z"
                  fill={c}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* =========================================
          LAYER 3: Actors
           ========================================= */}
      <div style={sceneExit.style}>
        <PersonFigure
          x={TECH_X - 90}
          y={ROW2_Y - 90}
          label="Technician"
          color={COLORS.Cyan}
          delayFrames={80}
        />
        <PersonFigure
          x={SARA_X - 90}
          y={ROW2_Y - 90}
          label="Sara"
          color={COLORS.Rose}
          tone="solid"
          delayFrames={420}
        />
        <PersonFigure
          x={SARA_X - 90}
          y={Y_CUST - 90}
          label="Customer"
          color={COLORS.Purple}
          tone="soft"
          delayFrames={600}
        />

        {/* Floating Icons Over Tech (Smooth Spring Scaling) */}
        {setScale > 0 && (
          <div
            style={{
              position: "absolute",
              left: TECH_X + 90,
              top: ROW2_Y - 140,
              transform: `translate(-50%, -50%) scale(${setScale * 0.55})`,
              opacity: Math.min(1, setScale * 1.5),
            }}
          >
            <IconBadge
              color={COLORS.Primary}
              tone="solid"
              delayFrames={0}
              icon={(c) => (
                <path
                  d="M19.14,12.94 c0.04-0.3,0.06-0.61,0.06-0.94 c0-0.32-0.02-0.64-0.06-0.94 l2.03-1.58 c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32 c-0.12-0.22-0.37-0.29-0.59-0.22 l-2.39,0.96 c-0.5-0.38-1.03-0.7-1.62-0.94 L14.4,2.81 c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84 c-0.24,0-0.43,0.17-0.47,0.41 L9.25,5.35 C8.66,5.59,8.12,5.92,7.63,6.29 L5.24,5.33 c-0.22-0.08-0.47,0-0.59,0.22 L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48 l2.03,1.58 C4.84,11.36,4.8,11.69,4.8,12 s0.02,0.64,0.06,0.94 l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61 l1.92,3.32 c0.12,0.22,0.37,0.29,0.59,0.22 l2.39-0.96 c0.5,0.38,1.03,0.7,1.62,0.94 l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41 h3.84 c0.24,0,0.43-0.17,0.47-0.41 l0.36-2.54 c0.59-0.24,1.13-0.56,1.62-0.94 l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22 l1.92-3.32 c0.12-0.22,0.07-0.49-0.12-0.61 L19.14,12.94 z M12,15.6 c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6 s3.6,1.62,3.6,3.6 S13.98,15.6,12,15.6 z"
                  fill={c}
                />
              )}
            />
          </div>
        )}

        {tickScale > 0 && (
          <div
            style={{
              position: "absolute",
              left: TECH_X + 90,
              top: ROW2_Y - 140,
              transform: `translate(-50%, -50%) scale(${tickScale * 0.55})`,
              opacity: Math.min(1, tickScale * 1.5),
            }}
          >
            <IconBadge
              color={COLORS.Success}
              tone="solid"
              delayFrames={0}
              icon={(c) => (
                <path
                  d="M9,16.17 L4.83,12 L3.41,13.41 L9,19 L21,7 L19.59,5.59 L9,16.17 Z"
                  fill={c}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* =========================================
          LAYER 4: Traveling Nested Device/Sticky Asset
          ========================================= */}
      <div
        style={{
          position: "absolute",
          left: devX,
          top: devY,
          transform: `translate(-50%, -50%) scale(${devScale})`,
          ...sceneExit.style,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <DeviceShape4 type="mobile" />
        </div>

        <div
          style={{
            position: "absolute",
            left: 45,
            top: -15,
            transform: "translate(-50%, -50%) scale(0.22)",
          }}
        >
          <StickyNoteS4
            text="Client: Jane&#10;Device: Mob&#10;&#10;Issue:&#10;Cracked"
            opacity={dynamicStickyOpacity}
          />
        </div>
      </div>

      {/* =========================================
          LAYER 5: Money Transfer
          ========================================= */}
      <div style={sceneExit.style}>
        {frame > 730 && frame < 850 && (
          <MoneyIcon
            x={SARA_X + 220} // Bumped further from the settling phone
            y={Y_CUST}
            targetY={ROW2_Y + 70}
            startFrame={730}
            endFrame={820}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

// SCENE 5 — The Pivot

const S5_DUR = 300;

export const Scene5 = () => {
  // Drives the exit of everything on screen before the scene hard-cuts
  const exitAll = useExit(S5_DUR - 60);

  // Staggered entrances for the two text beats
  const text1Enter = useEnter(30);
  const text2Enter = useEnter(140);

  return (
    <AbsoluteFill>
      {/* Background Layer: Advancing to Cyan (index 4) for a neutral pivot tone */}
      <SceneBackground gradient={BG_GRADIENTS[4]} sceneDuration={S5_DUR} />

      {/* Subtle background atmosphere so it doesn't look like a raw flat plate */}
      <AmbientGlow
        corner="topLeft"
        color={COLORS.Cyan}
        sceneDuration={S5_DUR}
      />
      <AmbientGlow
        corner="bottomRight"
        color={COLORS.Rose}
        sceneDuration={S5_DUR}
        phase={30}
      />

      {/* Deliberately omitted <SceneHeading /> per notes */}

      <div
        style={{
          ...exitAll.style,
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          fontFamily: "Quicksand",
        }}
      >
        <div
          style={{
            ...text1Enter.style,
            fontSize: 140,
            fontWeight: 800,
            color: COLORS.TextTitle,
          }}
        >
          Everything is smooth, right?
        </div>

        <div
          style={{
            ...text2Enter.style,
            fontSize: 80,
            fontWeight: 600,
            // Styling this in Rose/Danger to subtly foreshadow the upcoming problems
            color: COLORS.Rose,
          }}
        >
          Yes… at first.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 6 — The System Fails (Simultaneous Panorama Layout)

// 1. Scene-Specific Components
const PlainPersonFigureS6 = ({
  x,
  y,
  label,
  color = "#2563EB",
  scale = 1,
  tone = "soft",
  opacity = 1,
}) => {
  const bg = tone === "solid" ? color : `${color}1F`;
  const iconColor = tone === "solid" ? "#FFFFFF" : color;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        textAlign: "center",
        opacity,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        style={{
          width: 180 * scale,
          height: 180 * scale,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={100 * scale} height={110 * scale} viewBox="0 0 100 110">
          <circle cx="50" cy="30" r="26" fill={iconColor} />
          <path d="M10 106 Q10 64 50 64 Q90 64 90 106" fill={iconColor} />
        </svg>
      </div>
      {label && (
        <div
          style={{
            fontFamily: "Quicksand",
            fontWeight: 700,
            fontSize: 36 * scale,
            color: COLORS.TextBody,
            marginTop: 14,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

const FloatingPoint = ({ x, y, num, text, startFrame }) => {
  const enter = useEnter(startFrame);
  return (
    <div
      style={{
        ...enter.style,
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) ${enter.style.transform}`,
      }}
    >
      <div
        style={{
          background: COLORS.Surface,
          padding: "24px 40px",
          borderRadius: 24,
          boxShadow: "0 20px 50px rgba(15,23,42,0.10)",
          border: `3px solid ${COLORS.Border}`,
          fontFamily: "Quicksand",
          fontWeight: 700,
          fontSize: 36,
          color: COLORS.TextBody,
          display: "flex",
          alignItems: "center",
          gap: 24,
          width: 780, // Fixed width so the center column looks structured
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: COLORS.Primary,
            color: COLORS.Surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          }}
        >
          {num}
        </div>
        <div>{text}</div>
      </div>
    </div>
  );
};

const ModernChartSmall = ({ x, y, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useEnter(startFrame);

  // Spring to draw the chart line
  const drawProgress = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - (startFrame + 30),
        fps,
        config: { damping: 24, stiffness: 60 },
      }),
    ),
  );
  const dashOffset = interpolate(drawProgress, [0, 1], [900, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        ...enter.style,
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) ${enter.style.transform}`,
      }}
    >
      <div
        style={{
          width: 700,
          height: 380,
          background: COLORS.Surface,
          borderRadius: 24,
          boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
          border: `4px solid ${COLORS.Border}`,
          padding: 30,
          position: "relative",
        }}
      >
        {/* Title explicitly baked into the diagram corner */}
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 30,
            fontFamily: "Quicksand",
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.Danger,
            background: `${COLORS.Danger}1F`,
            padding: "8px 20px",
            borderRadius: 999,
          }}
        >
          Satisfaction Drop
        </div>

        {/* Grid Lines */}
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 100,
            right: 40,
            height: 2,
            background: COLORS.Border,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 210,
            right: 40,
            height: 2,
            background: COLORS.Border,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 320,
            right: 40,
            height: 2,
            background: COLORS.Border,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 40,
            bottom: 60,
            width: 2,
            background: COLORS.Border,
          }}
        />

        <svg
          width={560}
          height={280}
          style={{
            position: "absolute",
            left: 80,
            top: 40,
            overflow: "visible",
          }}
        >
          <path
            d="M 20 60 C 180 60, 260 260, 560 280"
            fill="none"
            stroke={COLORS.Danger}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="900"
            strokeDashoffset={dashOffset}
          />
          {/* Trailing Dot */}
          {drawProgress > 0 && drawProgress < 0.99 && (
            <circle
              r="10"
              fill={COLORS.Danger}
              style={{
                offsetPath: "path('M 20 60 C 180 60, 260 260, 560 280')",
                offsetDistance: `${drawProgress * 100}%`,
              }}
            />
          )}
        </svg>
      </div>
    </div>
  );
};

const S6_DUR = 1250;

export const Scene6 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

  // ==============================
  // COORDINATES GRID
  // ==============================
  const SARA_X = 600;
  const SARA_Y = 1080;

  const COL_CENTER_X = 1650; // Text column
  const COL_RIGHT_X = 3000; // Visuals column

  const Y_TOP = 450;
  const Y_MID = 1150;
  const Y_BOT = 1750;

  // ==============================
  // TIMERS & MATH
  // ==============================
  const fullSceneExit = useExit(1180);

  // Sara's Entry Slide (From Left)
  const pSaraSlide = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 20,
        fps,
        config: { damping: 20, stiffness: 80 },
      }),
    ),
  );
  const currentSaraX = interpolate(
    pSaraSlide,
    [0, 1],
    [-400, SARA_X],
    clampBoth,
  );
  const crownEnter = useEnter(100);

  // Top Right Customers Group (Wait until Sara lands)
  const custT1 = useEnter(80);
  const custT2 = useEnter(100);
  const custT3 = useEnter(120);

  // Devices Flying from Customers -> Shelf Middle
  const pFly = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 400,
        fps,
        config: { damping: 20, stiffness: 80 },
      }),
    ),
  );

  // Starting Points above customers
  const startDev1X = COL_RIGHT_X - 400;
  const startDev2X = COL_RIGHT_X;
  const startDev3X = COL_RIGHT_X + 400;
  const startDevY = Y_TOP - 160;

  // Ending Points on the Shelf (Y_MID = 1150 is the center of the shelf)
  // Shelf is ~ 500px tall. Rows roughly at Y_MID - 120, Y_MID, Y_MID + 120
  const R1 = Y_MID - 150;
  const R2 = Y_MID + 10;
  const R3 = Y_MID + 170;

  const dev1X = interpolate(
    pFly,
    [0, 1],
    [startDev1X, COL_RIGHT_X - 100],
    clampBoth,
  );
  const dev1Y = interpolate(pFly, [0, 1], [startDevY, R1], clampBoth);

  const dev2X = interpolate(
    pFly,
    [0, 1],
    [startDev2X, COL_RIGHT_X + 20],
    clampBoth,
  );
  const dev2Y = interpolate(pFly, [0, 1], [startDevY, R2], clampBoth);

  const dev3X = interpolate(
    pFly,
    [0, 1],
    [startDev3X, COL_RIGHT_X + 110],
    clampBoth,
  );
  const dev3Y = interpolate(pFly, [0, 1], [startDevY, R3], clampBoth);

  // Phone Call helper pop-ins
  const getCallPulse = (start) =>
    interpolate(
      Math.max(0, Math.min(1, spring({ frame: frame - start, fps }))),
      [0, 1],
      [0, 1],
      clampBoth,
    );

  return (
    <AbsoluteFill>
      <SceneBackground gradient={BG_GRADIENTS[3]} sceneDuration={S6_DUR} />
      <AmbientGlow
        corner="bottomRight"
        color={COLORS.Danger}
        sceneDuration={S6_DUR}
      />
      <AmbientGlow
        corner="topLeft"
        color={COLORS.Rose}
        sceneDuration={S6_DUR}
        phase={120}
      />
      <SceneHeading title="The Problems" />
      <div style={fullSceneExit.style}>
        {/* ==============================
            LEFT: SARA
            ============================== */}
        <PlainPersonFigureS6
          x={currentSaraX}
          y={SARA_Y}
          label="Sara"
          color={COLORS.Rose}
          tone="solid"
        />

        {/* Crown follows Sara's X exactly */}
        <div
          style={{
            ...crownEnter.style,
            position: "absolute",
            left: currentSaraX,
            top: SARA_Y - 150,
            transform: `translate(-50%, -50%) scale(1.2)`,
          }}
        >
          <svg width={80} height={60} viewBox="0 0 80 60">
            <path
              d="M 10 50 L 15 10 L 30 30 L 40 5 L 50 30 L 65 10 L 70 50 Z"
              fill={COLORS.Warning}
            />
            <circle cx="15" cy="5" r="5" fill={COLORS.Warning} />
            <circle cx="40" cy="0" r="5" fill={COLORS.Warning} />
            <circle cx="65" cy="5" r="5" fill={COLORS.Warning} />
          </svg>
        </div>

        {/* Ringing / Receiving Icon over Sara (Beat 3) */}
        {frame > 680 && (
          <div
            style={{
              position: "absolute",
              left: currentSaraX,
              top: SARA_Y - 220,
              transform: `translate(-50%, -50%) scale(${getCallPulse(680)})`,
            }}
          >
            <IconBadge
              size={160}
              color={COLORS.Warning}
              tone="solid"
              icon={(c) => (
                <path
                  d="M19,15.5 C17.75,15.5 16.55,15.3 15.43,14.93 C15.08,14.82 14.69,14.9 14.41,15.18 L12.21,17.38 C9.38,15.94 7.06,13.62 5.62,10.79 L7.82,8.59 C8.1,8.31 8.18,7.92 8.07,7.57 C7.7,6.45 7.5,5.25 7.5,4 C7.5,3.45 7.05,3 6.5,3 L3,3 C2.45,3 2,3.45 2,4 C2,13.94 10.06,22 20,22 C20.55,22 21,21.55 21,21 L21,17.5 C21,16.95 20.55,16.5 20,16.5 L19,15.5 Z"
                  fill={c}
                />
              )}
            />
          </div>
        )}

        {/* ==============================
            CENTER: NARRATIVE POINTS
            ============================== */}
        <FloatingPoint
          x={COL_CENTER_X}
          y={Y_TOP}
          num="1"
          text="Sticky notes system begins to fail"
          startFrame={250}
        />
        <FloatingPoint
          x={COL_CENTER_X}
          y={Y_MID}
          num="2"
          text="Tracking progress becomes difficult"
          startFrame={500}
        />
        <FloatingPoint
          x={COL_CENTER_X}
          y={Y_BOT}
          num="3"
          text="Customer communication breaks down"
          startFrame={780}
        />

        {/* ==============================
            RIGHT TOP: CUSTOMERS
            ============================== */}
        <div
          style={{
            ...custT1.style,
            position: "absolute",
            left: COL_RIGHT_X - 400,
            top: Y_TOP,
            transform: "translate(-50%, -50%)",
          }}
        >
          <PlainPersonFigureS6
            x={0}
            y={0}
            color={COLORS.Purple}
            tone="soft"
            label="Cust. 1"
          />
        </div>
        <div
          style={{
            ...custT2.style,
            position: "absolute",
            left: COL_RIGHT_X,
            top: Y_TOP,
            transform: "translate(-50%, -50%)",
          }}
        >
          <PlainPersonFigureS6
            x={0}
            y={0}
            color={COLORS.Cyan}
            tone="soft"
            label="Cust. 2"
          />
        </div>
        <div
          style={{
            ...custT3.style,
            position: "absolute",
            left: COL_RIGHT_X + 400,
            top: Y_TOP,
            transform: "translate(-50%, -50%)",
          }}
        >
          <PlainPersonFigureS6
            x={0}
            y={0}
            color={COLORS.Success}
            tone="soft"
            label="Cust. 3"
          />
        </div>

        {/* Active Calling Icons over Customers (Beat 3) - Filling the void left by devices */}
        {frame > 650 && (
          <div
            style={{
              position: "absolute",
              left: COL_RIGHT_X - 400,
              top: Y_TOP - 160,
              transform: `translate(-50%, -50%) scale(${getCallPulse(650)})`,
            }}
          >
            <IconBadge
              size={130}
              color={COLORS.Danger}
              tone="solid"
              icon={(c) => (
                <path
                  d="M6.62,10.79 C8.06,13.62 10.38,15.94 13.21,17.38 L15.41,15.18 C15.69,14.9 16.08,14.82 16.43,14.93 C17.55,15.3 18.75,15.5 20,15.5 C20.55,15.5 21,15.95 21,16.5 L21,20 C21,20.55 20.55,21 20,21 C10.06,21 2,12.94 2,3 C2,2.45 2.45,2 3,2 L6.5,2 C7.05,2 7.5,2.45 7.5,3 C7.5,4.25 7.7,5.45 8.07,6.57 C8.18,6.92 8.1,7.31 7.82,7.59 L6.62,10.79 Z"
                  fill={c}
                />
              )}
            />
          </div>
        )}
        {frame > 660 && (
          <div
            style={{
              position: "absolute",
              left: COL_RIGHT_X,
              top: Y_TOP - 160,
              transform: `translate(-50%, -50%) scale(${getCallPulse(660)})`,
            }}
          >
            <IconBadge
              size={130}
              color={COLORS.Danger}
              tone="solid"
              icon={(c) => (
                <path
                  d="M6.62,10.79 C8.06,13.62 10.38,15.94 13.21,17.38 L15.41,15.18 C15.69,14.9 16.08,14.82 16.43,14.93 C17.55,15.3 18.75,15.5 20,15.5 C20.55,15.5 21,15.95 21,16.5 L21,20 C21,20.55 20.55,21 20,21 C10.06,21 2,12.94 2,3 C2,2.45 2.45,2 3,2 L6.5,2 C7.05,2 7.5,2.45 7.5,3 C7.5,4.25 7.7,5.45 8.07,6.57 C8.18,6.92 8.1,7.31 7.82,7.59 L6.62,10.79 Z"
                  fill={c}
                />
              )}
            />
          </div>
        )}
        {frame > 670 && (
          <div
            style={{
              position: "absolute",
              left: COL_RIGHT_X + 400,
              top: Y_TOP - 160,
              transform: `translate(-50%, -50%) scale(${getCallPulse(670)})`,
            }}
          >
            <IconBadge
              size={130}
              color={COLORS.Danger}
              tone="solid"
              icon={(c) => (
                <path
                  d="M6.62,10.79 C8.06,13.62 10.38,15.94 13.21,17.38 L15.41,15.18 C15.69,14.9 16.08,14.82 16.43,14.93 C17.55,15.3 18.75,15.5 20,15.5 C20.55,15.5 21,15.95 21,16.5 L21,20 C21,20.55 20.55,21 20,21 C10.06,21 2,12.94 2,3 C2,2.45 2.45,2 3,2 L6.5,2 C7.05,2 7.5,2.45 7.5,3 C7.5,4.25 7.7,5.45 8.07,6.57 C8.18,6.92 8.1,7.31 7.82,7.59 L6.62,10.79 Z"
                  fill={c}
                />
              )}
            />
          </div>
        )}

        {/* ==============================
            RIGHT MIDDLE: SHELF
            ============================== */}
        <div
          style={{
            position: "absolute",
            left: COL_RIGHT_X,
            top: Y_MID,
            transform: "translate(-50%, -50%)",
            opacity: interpolate(
              Math.max(0, Math.min(1, spring({ frame: frame - 320, fps }))),
              [0, 1],
              [0, 1],
              clampBoth,
            ),
          }}
        >
          <div
            style={{
              width: 440,
              height: 500,
              border: `8px solid ${COLORS.Muted}`,
              borderRadius: 16,
              background: `${COLORS.Chrome}88`,
            }}
          />
          {/* Inner Shelves */}
          <div
            style={{
              position: "absolute",
              top: 160,
              left: 0,
              width: 440,
              height: 8,
              background: COLORS.Muted,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 320,
              left: 0,
              width: 440,
              height: 8,
              background: COLORS.Muted,
            }}
          />
        </div>

        {/* Dummy Devices magically fading onto shelf to represent backlog chaos */}
        <div
          style={{
            position: "absolute",
            left: COL_RIGHT_X + 110,
            top: R1,
            opacity: interpolate(
              Math.max(0, Math.min(1, spring({ frame: frame - 460, fps }))),
              [0, 1],
              [0, 1],
              clampBoth,
            ),
            transform: "translate(-50%, -50%) scale(0.7)",
          }}
        >
          <DeviceShape type="laptop" />
        </div>
        <div
          style={{
            position: "absolute",
            left: COL_RIGHT_X - 120,
            top: R2,
            opacity: interpolate(
              Math.max(0, Math.min(1, spring({ frame: frame - 490, fps }))),
              [0, 1],
              [0, 1],
              clampBoth,
            ),
            transform: "translate(-50%, -50%) scale(0.8)",
          }}
        >
          <DeviceShape type="mobile" />
        </div>
        <div
          style={{
            position: "absolute",
            left: COL_RIGHT_X - 100,
            top: R3,
            opacity: interpolate(
              Math.max(0, Math.min(1, spring({ frame: frame - 520, fps }))),
              [0, 1],
              [0, 1],
              clampBoth,
            ),
            transform: "translate(-50%, -50%) scale(0.8)",
          }}
        >
          <DeviceShape type="laptop" />
        </div>

        {/* The 3 Active Devices (Animate from top Customers down to the Shelf) */}
        {frame > 100 && ( // Initially hidden until customer is mostly popped in
          <>
            <div
              style={{
                position: "absolute",
                left: dev1X,
                top: dev1Y,
                transform: "translate(-50%, -50%) scale(0.8)",
              }}
            >
              <DeviceShape type="mobile" />
            </div>
            <div
              style={{
                position: "absolute",
                left: dev2X,
                top: dev2Y,
                transform: "translate(-50%, -50%) scale(0.7)",
              }}
            >
              <DeviceShape type="laptop" />
            </div>
            <div
              style={{
                position: "absolute",
                left: dev3X,
                top: dev3Y,
                transform: "translate(-50%, -50%) scale(0.7)",
              }}
            >
              <DeviceShape type="pc" />
            </div>
          </>
        )}

        {/* ==============================
            RIGHT BOTTOM: DIAGRAM
            ============================== */}
        {frame > 850 && (
          <ModernChartSmall x={COL_RIGHT_X} y={Y_BOT} startFrame={850} />
        )}
      </div>
    </AbsoluteFill>
  );
};

// SCENE 7 — The Realization

// 1. Scene-Specific Components
const MiniSticky = ({ x, y, rotation, startFrame }) => {
  const enter = useEnter(startFrame, { damping: 14, stiffness: 120 });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 140,
        height: 140,
        background: "#FDE047",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        transform: `translate(-50%, -50%) rotate(${rotation}deg) ${enter.style.transform}`,
        opacity: enter.style.opacity,
      }}
    >
      {/* Fake UI lines representing chaotic scribbles */}
      <div
        style={{
          width: 90,
          height: 10,
          background: "rgba(0,0,0,0.15)",
          marginTop: 24,
          marginLeft: 24,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          width: 70,
          height: 10,
          background: "rgba(0,0,0,0.15)",
          marginTop: 14,
          marginLeft: 24,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          width: 80,
          height: 10,
          background: "rgba(0,0,0,0.15)",
          marginTop: 14,
          marginLeft: 24,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

const BigLaptop = ({ startFrame }) => {
  const enter = useEnter(startFrame, { damping: 16, stiffness: 100 });
  return (
    <div
      style={{
        position: "absolute",
        left: 500,
        top: 320, // Centered precisely in the thought cloud
        transform: `translate(-50%, -50%) scale(2) ${enter.style.transform}`,
        opacity: enter.style.opacity,
      }}
    >
      <svg width={240} height={160} viewBox="0 0 120 80">
        {/* Back chassis */}
        <rect
          x="20"
          y="0"
          width="80"
          height="60"
          rx="4"
          fill={COLORS.TextBody}
        />
        {/* Screen */}
        <rect x="24" y="4" width="72" height="52" fill={COLORS.Surface} />
        {/* Base */}
        <path d="M 0 64 L 120 64 L 110 80 L 10 80 Z" fill={COLORS.Muted} />
        {/* Subtle premium UI accent on screen to make it read as an App solution */}
        <rect
          x="34"
          y="14"
          width="52"
          height="32"
          rx="2"
          fill={`${COLORS.Primary}1A`}
        />
        <circle cx="60" cy="30" r="8" fill={COLORS.Primary} />
      </svg>
    </div>
  );
};

const ThoughtCloud = ({ startFrame, children }) => {
  const enter = useEnter(startFrame, { damping: 18, stiffness: 90 });
  return (
    <div
      style={{
        position: "absolute",
        left: 1920,
        top: 1000,
        width: 1000,
        height: 700,
        transform: `translate(-50%, -100%) ${enter.style.transform}`, // Anchored by the bottom tail
        opacity: enter.style.opacity,
      }}
    >
      {/* Cloud SVG path with heavy shadow filter acting on the unified shape */}
      <svg
        width={1000}
        height={700}
        viewBox="0 0 1000 700"
        style={{ filter: "drop-shadow(0 20px 60px rgba(15,23,42,0.15))" }}
      >
        {/* Main cloud bubbles */}
        <circle cx="350" cy="350" r="180" fill={COLORS.Surface} />
        <circle cx="550" cy="280" r="220" fill={COLORS.Surface} />
        <circle cx="750" cy="360" r="160" fill={COLORS.Surface} />
        <circle cx="650" cy="460" r="140" fill={COLORS.Surface} />
        <circle cx="380" cy="470" r="140" fill={COLORS.Surface} />
        {/* Core fill to bridge gaps */}
        <rect x="300" y="250" width="450" height="250" fill={COLORS.Surface} />

        {/* Downward thought-bubbles tracing directly to Sara */}
        <circle cx="500" cy="600" r="40" fill={COLORS.Surface} />
        <circle cx="500" cy="680" r="20" fill={COLORS.Surface} />
      </svg>
      {/* Content wrapper layered perfectly over the cloud */}
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};

const S7_DUR = 460;

export const Scene7 = () => {
  const fullSceneExit = useExit(S7_DUR - 70);

  // Stickies disappear mid-scene to make way for the Laptop
  const stickiesExit = useExit(230, { damping: 16, stiffness: 120 });

  return (
    <AbsoluteFill>
      {/* Switching to flat neutral Chrome (index 0) to highlight the crisp realization */}
      <SceneBackground gradient={BG_GRADIENTS[0]} sceneDuration={S7_DUR} />
      <AmbientGlow
        corner="topRight"
        color={COLORS.Primary}
        sceneDuration={S7_DUR}
      />
      <AmbientGlow
        corner="bottomLeft"
        color={COLORS.Purple}
        sceneDuration={S7_DUR}
        phase={60}
      />

      <div style={fullSceneExit.style}>
        <SceneHeading title="Time for a Change" />

        <PersonFigure
          x={1760}
          y={1050}
          label="Sara"
          color={COLORS.Rose}
          tone="solid"
          delayFrames={20}
        />

        <ThoughtCloud startFrame={70}>
          {/* Phase 1: The Problem (Sticky Notes Chaos) */}
          <div style={stickiesExit.style}>
            <MiniSticky x={320} y={420} rotation={-12} startFrame={90} />
            <MiniSticky x={500} y={260} rotation={6} startFrame={110} />
            <MiniSticky x={680} y={300} rotation={-18} startFrame={130} />
            <MiniSticky x={400} y={320} rotation={15} startFrame={150} />
            <MiniSticky x={720} y={460} rotation={-5} startFrame={170} />
            <MiniSticky x={560} y={440} rotation={22} startFrame={190} />
          </div>

          {/* Phase 2: The Solution (Target App) */}
          <BigLaptop startFrame={270} />
        </ThoughtCloud>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 8 — The Digital Solution (Repair Desk App)

// 1. Specific UI Components
const ModernLaptopMockup = ({ startFrame, children, highlightScale }) => {
  const enter = useEnter(startFrame, { damping: 16, stiffness: 90 });
  return (
    <div
      style={{
        position: "absolute",
        left: 1920,
        top: 900,
        width: 1040,
        height: 680,
        transform: `translate(-50%, -50%) scale(${highlightScale}) ${enter.style.transform}`,
        opacity: enter.style.opacity,
        zIndex: 10,
      }}
    >
      {/* Screen Frame */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COLORS.TextTitle,
          borderRadius: "32px 32px 0 0",
          border: `4px solid ${COLORS.Muted}`,
          boxShadow: "0 40px 80px rgba(15,23,42,0.2)",
        }}
      >
        {/* Inner Screen Panel */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 24,
            right: 24,
            bottom: 40,
            background: COLORS.Surface,
            borderRadius: 8,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
        {/* Base lip */}
        <div
          style={{
            position: "absolute",
            left: -60,
            bottom: -30,
            right: -60,
            height: 30,
            background: COLORS.Muted,
            borderRadius: "0 0 16px 16px",
          }}
        >
          {/* Trackpad indent line */}
          <div
            style={{
              position: "absolute",
              left: 470,
              top: 0,
              width: 220,
              height: 10,
              background: "rgba(0,0,0,0.2)",
              borderRadius: "0 0 8px 8px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const DataPacket = ({ startX, startY, endX, endY, startFrame }) => {
  const move = useMoveBetween(startX, startY, endX, endY, startFrame, {
    damping: 20,
    stiffness: 80,
  });
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const pop = interpolate(
    move.progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
    clampBoth,
  );

  if (move.progress === 0 || move.progress === 1) return null; // Only mount while active

  return (
    <div
      style={{
        position: "absolute",
        left: move.x,
        top: move.y,
        transform: `translate(-50%, -50%) scale(${pop})`,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: COLORS.Primary,
        boxShadow: `0 0 30px ${COLORS.Primary}`,
        border: `4px solid ${COLORS.Surface}`,
      }}
    />
  );
};

const MessageBubbleS8 = ({ text, startFrame, endFrame }) => {
  const enter = useEnter(startFrame);
  const exit = useExit(endFrame);
  return (
    <div
      style={{
        transform: "translate(-50%, -100%)",
        opacity: enter.style.opacity * exit.style.opacity,
        zIndex: 50,
      }}
    >
      <div
        style={{
          ...enter.style,
          background: COLORS.Surface,
          padding: "16px 32px",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(15,23,42,0.15)",
          border: `3px solid ${COLORS.Border}`,
          fontFamily: "Quicksand",
          fontWeight: 700,
          fontSize: 32,
          color: COLORS.Primary,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const S8_DUR = 1450;

export const Scene8 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

  // ====================
  // TIMERS & MATH
  // ====================
  const sceneExit = useExit(S8_DUR - 60);

  // Highlighting logic
  const pSaraHigh =
    Math.max(0, Math.min(1, spring({ frame: frame - 820, fps }))) -
    Math.max(0, Math.min(1, spring({ frame: frame - 980, fps })));
  const pTechHigh =
    Math.max(0, Math.min(1, spring({ frame: frame - 900, fps }))) -
    Math.max(0, Math.min(1, spring({ frame: frame - 980, fps })));
  const pLaptopHigh = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 1020,
        fps,
        config: { damping: 18, stiffness: 80 },
      }),
    ),
  );

  const saraScale = interpolate(pSaraHigh, [0, 1], [1, 1.15], clampBoth);
  const techScale = interpolate(pTechHigh, [0, 1], [1, 1.15], clampBoth);
  const laptopScale = interpolate(pLaptopHigh, [0, 1], [1, 1.3], clampBoth);

  const ambientFadeOut = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 980, fps })),
  );
  const baseDimming = interpolate(ambientFadeOut, [0, 1], [1, 0.4], clampBoth);

  // App UI State Logic
  const uiAppear = useEnter(80);
  const logCardAppear = useEnter(280);

  const statusAssigned = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 350, fps })),
  );
  const statusComplete = Math.max(
    0,
    Math.min(1, spring({ frame: frame - 720, fps })),
  );

  const textConclusionEnter = useEnter(1120, { damping: 24, stiffness: 70 });

  return (
    <AbsoluteFill>
      <SceneBackground gradient={BG_GRADIENTS[4]} sceneDuration={S8_DUR} />
      <AmbientGlow
        corner="topLeft"
        color={COLORS.Primary}
        sceneDuration={S8_DUR}
      />
      <SceneHeading title="Updated Setup" />
      <AmbientGlow
        corner="bottomRight"
        color={COLORS.Cyan}
        sceneDuration={S8_DUR}
        phase={80}
      />

      <div style={{ position: "relative", zIndex: 10 }}>
        {/* ==============================
            CENTRAL APP
            ============================== */}
        <ModernLaptopMockup startFrame={20} highlightScale={laptopScale}>
          {/* App Header */}
          <div
            style={{
              ...uiAppear.style,
              background: COLORS.Chrome,
              borderBottom: `2px solid ${COLORS.Border}`,
              padding: "20px 40px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: COLORS.Primary,
              }}
            />
            <div
              style={{
                fontFamily: "Quicksand",
                fontSize: 32,
                fontWeight: 800,
                color: COLORS.TextTitle,
              }}
            >
              Repair Desk
            </div>
          </div>

          {/* App Body */}
          <div style={{ flex: 1, background: COLORS.Surface, padding: 40 }}>
            <div
              style={{
                ...logCardAppear.style,
                background: COLORS.Surface,
                border: `2px solid ${COLORS.Border}`,
                borderRadius: 16,
                padding: "24px 32px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontFamily: "Quicksand",
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.Muted,
                  marginBottom: 8,
                }}
              >
                Repair Log
              </div>
              <div
                style={{
                  fontFamily: "Quicksand",
                  fontSize: 36,
                  fontWeight: 800,
                  color: COLORS.TextTitle,
                  marginBottom: 24,
                }}
              >
                Device: Mobile — Screen Issue
              </div>

              {/* Dynamic Status Pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    fontFamily: "Quicksand",
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.Muted,
                  }}
                >
                  Status:
                </div>
                <div style={{ position: "relative", width: 200, height: 50 }}>
                  {/* Pending (Default) */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 1 - statusAssigned,
                      background: COLORS.Border,
                      borderRadius: 99,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Quicksand",
                      fontWeight: 700,
                      fontSize: 22,
                      color: COLORS.TextBody,
                    }}
                  >
                    Pending
                  </div>
                  {/* Assigned */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: statusAssigned * (1 - statusComplete),
                      background: `${COLORS.Warning}22`,
                      color: COLORS.Warning,
                      borderRadius: 99,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Quicksand",
                      fontWeight: 700,
                      fontSize: 22,
                    }}
                  >
                    Assigned
                  </div>
                  {/* Complete */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: statusComplete,
                      background: `${COLORS.Success}22`,
                      color: COLORS.Success,
                      borderRadius: 99,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Quicksand",
                      fontWeight: 700,
                      fontSize: 22,
                    }}
                  >
                    Complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModernLaptopMockup>

        {/* ==============================
            ACTORS & ENVIRONMENT (Dim layer)
            ============================== */}
        <div style={{ opacity: baseDimming }}>
          {/* -- Sara (Left) -- */}
          <div
            style={{
              position: "absolute",
              left: 600,
              top: 900,
              transform: `scale(${saraScale})`,
            }}
          >
            <PersonFigure
              x={-50}
              y={-100}
              label="Sara"
              color={COLORS.Rose}
              tone="solid"
              delayFrames={140}
            />
            <div style={{ position: "absolute", left: 27, top: -126 }}>
              <MessageBubbleS8
                text="Live visibility"
                startFrame={820}
                endFrame={980}
              />
            </div>
          </div>

          {/* -- Technician (Right) -- */}
          <div
            style={{
              position: "absolute",
              left: 3124,
              top: 907,
              transform: `scale(${techScale})`,
            }}
          >
            <PersonFigure
              x={0}
              y={-100}
              label="Technician"
              color={COLORS.Cyan}
              delayFrames={380}
            />
            <div style={{ position: "absolute", left: 90, top: -131 }}>
              <MessageBubbleS8
                text="Focus on work"
                startFrame={900}
                endFrame={980}
              />
            </div>

            {/* Working Gear Indicator */}
            {frame > 480 && frame < 700 && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: -300,
                  transform: "translate(-50%, -50%) scale(0.6)",
                }}
              >
                <IconBadge
                  color={COLORS.Primary}
                  tone="solid"
                  delayFrames={0}
                  icon={(c) => (
                    <path
                      d="M19.14,12.94 c0.04-0.3,0.06-0.61,0.06-0.94 c0-0.32-0.02-0.64-0.06-0.94 l2.03-1.58 c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32 c-0.12-0.22-0.37-0.29-0.59-0.22 l-2.39,0.96 c-0.5-0.38-1.03-0.7-1.62-0.94 L14.4,2.81 c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84 c-0.24,0-0.43,0.17-0.47,0.41 L9.25,5.35 C8.66,5.59,8.12,5.92,7.63,6.29 L5.24,5.33 c-0.22-0.08-0.47,0-0.59,0.22 L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48 l2.03,1.58 C4.84,11.36,4.8,11.69,4.8,12 s0.02,0.64,0.06,0.94 l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61 l1.92,3.32 c0.12,0.22,0.37,0.29,0.59,0.22 l2.39-0.96 c0.5,0.38,1.03,0.7,1.62,0.94 l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41 h3.84 c0.24,0,0.43-0.17,0.47-0.41 l0.36-2.54 c0.59-0.24,1.13-0.56,1.62-0.94 l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22 l1.92-3.32 c0.12-0.22,0.07-0.49-0.12-0.61 L19.14,12.94 z M12,15.6 c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6 s3.6,1.62,3.6,3.6 S13.98,15.6,12,15.6 z"
                      fill={c}
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* ==============================
              LINES & PACKETS
              ============================== */}
          {/* Line 1: Sara to App */}
          <Connector
            x1={760}
            y1={900}
            x2={1380}
            y2={900}
            startFrame={180}
            dashed={true}
            arrow={true}
            color={COLORS.Muted}
          />
          <DataPacket
            startX={760}
            startY={900}
            endX={1380}
            endY={900}
            startFrame={220}
          />

          {/* Line 2: App to Tech (Assigned output) */}
          <Connector
            x1={2460}
            y1={820}
            x2={3080}
            y2={820}
            startFrame={400}
            dashed={true}
            arrow={true}
            color={COLORS.Muted}
          />
          <DataPacket
            startX={2460}
            startY={820}
            endX={3080}
            endY={820}
            startFrame={440}
          />

          {/* Line 3: Tech to App (Completion loop) */}
          <Connector
            x1={3080}
            y1={980}
            x2={2460}
            y2={980}
            startFrame={620}
            dashed={true}
            arrow={true}
            color={COLORS.Muted}
          />
          <DataPacket
            startX={3080}
            startY={980}
            endX={2460}
            endY={980}
            startFrame={650}
          />
        </div>

        {/* ==============================
            FINAL CONCLUSION TEXT
            ============================== */}
        <div
          style={{
            ...textConclusionEnter.style,
            position: "absolute",
            bottom: 250,
            left: 1920,
            transform: `translateX(-50%) ${textConclusionEnter.style.transform}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            fontFamily: "Quicksand",
          }}
        >
          <div style={{ fontSize: 70, fontWeight: 700, color: COLORS.Muted }}>
            Why are we here?
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              color: COLORS.TextTitle,
              whiteSpace: "nowrap",
            }}
          >
            We’re here to solve Sara’s problem by building an app.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// SCENE 9 — The Path Forward (Conclusion)

// 1. Scene-Specific UI Components

const PathBadge = ({
  x,
  y,
  text,
  startFrame,
  color = COLORS.Muted,
  opacity = 1,
  scaleMult = 1,
}) => {
  const enter = useEnter(startFrame, { damping: 14, stiffness: 100 });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scaleMult}) ${enter.style.transform}`,
        opacity: enter.style.opacity * opacity,
        zIndex: 5,
      }}
    >
      <div
        style={{
          background: COLORS.Surface,
          padding: "16px 32px",
          borderRadius: 99,
          border: `4px solid ${color}`,
          boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
          fontFamily: "Quicksand",
          fontWeight: 700,
          fontSize: 32,
          color: color,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const CustomArrowHead = ({ x, y, angle, clampedProgress, color }) => {
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const scale = interpolate(
    clampedProgress,
    [0.85, 0.95, 1],
    [0, 1.15, 1],
    clampBoth,
  );
  const opacity = interpolate(clampedProgress, [0.82, 0.95], [0, 1], clampBoth);
  const arrowLen = 30;
  const arrowHalf = 19;
  return (
    <polygon
      points={`${arrowLen * 0.4},0 ${-arrowLen * 0.6},${-arrowHalf} ${-arrowLen * 0.6},${arrowHalf}`}
      fill={color}
      opacity={opacity}
      transform={`translate(${x}, ${y}) rotate(${angle}) scale(${scale})`}
    />
  );
};

const S9_DUR = 850;

export const Scene9 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

  // ====================
  // GEOMETRY & MATH
  // ====================
  const START_X = 800; // Problem Card Center
  const END_X = 3040; // Solution Card Center
  const BASE_Y = 1080;

  const DX = END_X - START_X; // 2240

  // Bezier Control points for the 3 paths
  const C1_Y = 400; // Top Arc
  const C2_Y = 1080; // Middle Straight
  const C3_Y = 1760; // Bottom Arc
  const CX = 1920; // Midpoint of canvas

  // Exact Midpoints of the Quadratic Bezier Curves (at t=0.5) to reliably pin the labels
  // Formula: Pos = 0.25*P0 + 0.5*P1 + 0.25*P2
  const M_X = 0.25 * START_X + 0.5 * CX + 0.25 * END_X; // Exactly 1920
  const M1_Y = 0.25 * BASE_Y + 0.5 * C1_Y + 0.25 * BASE_Y; // 740
  const M2_Y = BASE_Y; // 1080
  const M3_Y = 0.25 * BASE_Y + 0.5 * C3_Y + 0.25 * BASE_Y; // 1420

  // Slope / Angles at endpoint (t=1) to rotate arrowheads precisely to fit the converging arcs
  // Formula for Derivative at t=1: dPos = 2 * (P2 - P1)
  const DY_1 = 2 * (BASE_Y - C1_Y); // 1360
  const DY_3 = 2 * (BASE_Y - C3_Y); // -1360

  const ANGLE_1 = Math.atan2(DY_1, DX) * (180 / Math.PI); // ~ 31.2 deg
  const ANGLE_2 = 0;
  const ANGLE_3 = Math.atan2(DY_3, DX) * (180 / Math.PI); // ~ -31.2 deg

  // ====================
  // TIMERS & CHOREOGRAPHY
  // ====================
  // 1. Draw Paths in sequence
  const draw1 = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 120,
        fps,
        config: { damping: 24, stiffness: 80 },
      }),
    ),
  );
  const draw2 = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 160,
        fps,
        config: { damping: 24, stiffness: 80 },
      }),
    ),
  );
  const draw3 = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 200,
        fps,
        config: { damping: 24, stiffness: 80 },
      }),
    ),
  );

  // SVG dashed offset bounds are cleanly bounded 100 -> 0 using pathLength="100"
  const offset1 = interpolate(draw1, [0, 1], [100, 0], clampBoth);
  const offset2 = interpolate(draw2, [0, 1], [100, 0], clampBoth);
  const offset3 = interpolate(draw3, [0, 1], [100, 0], clampBoth);

  // 2. The Focus / Dimming phase (Beat 3)
  const pFocus = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 480,
        fps,
        config: { damping: 20, stiffness: 70 },
      }),
    ),
  );
  const dimOpacity = interpolate(pFocus, [0, 1], [1, 0.25], clampBoth);

  const pHighlightFill = Math.max(
    0,
    Math.min(
      1,
      spring({
        frame: frame - 520,
        fps,
        config: { damping: 18, stiffness: 90 },
      }),
    ),
  );

  // 3. Final Master Clean Out
  const sceneExit = useExit(S9_DUR - 75);
  const upNextEnter = useEnter(640);

  return (
    <AbsoluteFill>
      <SceneBackground gradient={BG_GRADIENTS[1]} sceneDuration={S9_DUR} />
      <AmbientGlow
        corner="topLeft"
        color={COLORS.Warning}
        sceneDuration={S9_DUR}
      />
      <AmbientGlow
        corner="bottomRight"
        color={COLORS.Success}
        sceneDuration={S9_DUR}
        phase={50}
      />

      <div style={sceneExit.style}>
        {/* Adhering strictly to section 8 rule: Must be first component */}
        <SceneHeading title="Choosing the Approach" />

        {/* ==============================
            THE NODES (Problem & Solution)
            ============================== */}
        <ConceptCard
          x={START_X - 195}
          y={BASE_Y}
          title="Problem"
          color={COLORS.Danger}
          delayFrames={40}
        />
        <ConceptCard
          x={END_X + 195}
          y={BASE_Y}
          title="Solution"
          color={COLORS.Success}
          delayFrames={240}
        />

        {/* ==============================
            THE DRAWN PATHS & ARROWS
            ============================== */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          {/* Path 1 (Top) */}
          <path
            d={`M ${START_X} ${BASE_Y} Q ${CX} ${C1_Y} ${END_X} ${BASE_Y}`}
            fill="none"
            stroke={COLORS.Muted}
            strokeWidth="10"
            strokeLinecap="butt"
            pathLength="100"
            strokeDasharray="100 100"
            strokeDashoffset={offset1}
            opacity={draw1 > 0 ? dimOpacity : 0}
          />
          <CustomArrowHead
            x={END_X}
            y={BASE_Y}
            angle={ANGLE_1}
            clampedProgress={draw1}
            color={COLORS.Muted}
          />

          {/* Path 3 (Bottom) */}
          <path
            d={`M ${START_X} ${BASE_Y} Q ${CX} ${C3_Y} ${END_X} ${BASE_Y}`}
            fill="none"
            stroke={COLORS.Muted}
            strokeWidth="10"
            strokeLinecap="butt"
            pathLength="100"
            strokeDasharray="100 100"
            strokeDashoffset={offset3}
            opacity={draw3 > 0 ? dimOpacity : 0}
          />
          <CustomArrowHead
            x={END_X}
            y={BASE_Y}
            angle={ANGLE_3}
            clampedProgress={draw3}
            color={COLORS.Muted}
          />

          {/* Path 2 (Middle - Straight Baseline) */}
          <path
            d={`M ${START_X} ${BASE_Y} Q ${CX} ${BASE_Y} ${END_X} ${BASE_Y}`}
            fill="none"
            stroke={COLORS.Muted}
            strokeWidth="10"
            strokeLinecap="butt"
            pathLength="100"
            strokeDasharray="100 100"
            strokeDashoffset={offset2}
            opacity={draw2 > 0 ? 1 : 0}
          />
          <CustomArrowHead
            x={END_X}
            y={BASE_Y}
            angle={ANGLE_2}
            clampedProgress={draw2}
            color={COLORS.Muted}
          />

          {/* Path 2 (Highlighted Overlay - Fades exactly over the gray baseline when winning) */}
          <g opacity={pHighlightFill}>
            <path
              d={`M ${START_X} ${BASE_Y} Q ${CX} ${BASE_Y} ${END_X} ${BASE_Y}`}
              fill="none"
              stroke={COLORS.Success}
              strokeWidth="16"
              strokeLinecap="round" // extra thickness for glow
            />
            <CustomArrowHead
              x={END_X}
              y={BASE_Y}
              angle={ANGLE_2}
              clampedProgress={1}
              color={COLORS.Success}
            />
          </g>
        </svg>

        {/* ==============================
            PATH LABELS
            ============================== */}
        <PathBadge
          x={M_X}
          y={M1_Y}
          text="Solution 1"
          startFrame={160}
          opacity={dimOpacity}
        />
        <PathBadge
          x={M_X}
          y={M3_Y}
          text="Solution 3"
          startFrame={240}
          opacity={dimOpacity}
        />

        {/* Center label seamlessly swapped with "Best Fit" highlight */}
        <div style={{ opacity: 1 - pHighlightFill }}>
          <PathBadge x={M_X} y={M2_Y} text="Solution 2" startFrame={200} />
        </div>

        {frame > 500 && (
          <PathBadge
            x={M_X}
            y={M2_Y}
            text="⭐️ Best Fit"
            startFrame={500}
            color={COLORS.Success}
            scaleMult={1.1}
          />
        )}

        {/* ==============================
            THE "UP NEXT" BANNER
            ============================== */}
        <div
          style={{
            ...upNextEnter.style,
            position: "absolute",
            left: CX,
            top: 1800,
            transform: `translate(-50%, -50%) ${upNextEnter.style.transform}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: "Quicksand",
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.Muted,
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            Up Next
          </div>
          <div
            style={{
              fontFamily: "Quicksand",
              fontSize: 90,
              fontWeight: 800,
              color: COLORS.TextTitle,
              whiteSpace: "nowrap",
            }}
          >
            Different Options to Build Apps
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
// ==========================================
// TIMELINE & MAIN VIDEO
// ==========================================
const S1_START = 0;
const TOTAL_DURATION = S1_DUR;

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.Chrome }}>
      {/* Font imports */}
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap");
        `}
      </style>
      {/* Persistent Audio Track */}
      <Audio src={staticFile("hi.wav")} />
      {/* Scenes */}
      <Sequence from={S1_START} durationInFrames={S1_DUR}>
        <Scene1 />
      </Sequence>
      <Sequence from={360} durationInFrames={950}>
        <Scene2 />
      </Sequence>
      <Sequence from={1310} durationInFrames={1150}>
        <Scene3 />
      </Sequence>
      <Sequence from={2460} durationInFrames={1050}>
        <Scene4 />
      </Sequence>
      <Sequence from={3510} durationInFrames={300}>
        <Scene5 />
      </Sequence>
      <Sequence from={3810} durationInFrames={1250}>
        <Scene6 />
      </Sequence>
      <Sequence from={5060} durationInFrames={460}>
        <Scene7 />
      </Sequence>
      <Sequence from={5520} durationInFrames={1450}>
        <Scene8 />
      </Sequence>
      <Sequence from={6970} durationInFrames={850}>
        <Scene9 />
      </Sequence>
    </AbsoluteFill>
  );
};

// ==========================================
// REMOTION ROOT
// ==========================================
export const RemotionRoot = () => {
  return (
    <Composition
      id="Main"
      component={MainVideo}
      durationInFrames={7820}
      fps={60}
      width={3840}
      height={2160}
    />
  );
};

registerRoot(RemotionRoot);
