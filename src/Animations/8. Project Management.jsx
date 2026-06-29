import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  registerRoot,
  Composition,
} from "remotion";
import React from "react";

// ── 1. VISUAL CONSTANTS ──────────────────────────────────────────────────────
const COLORS = {
  bg: "#0B1121",
  card: "#151F32",
  cardBorder: "#2A3B5C",
  primary: "#F8FAFC",
  secondary: "#94A3B8",
  accentBlue: "#3B82F6",
  accentPurple: "#8B5CF6",
  accentTeal: "#14B8A6",
  accentAmber: "#F59E0B",
  accentRed: "#EF4444",
  accentGreen: "#10B981",
  water: "#0EA5E9",
};

const FONTS = {
  sans: "Inter, sans-serif",
};

// ── 2. TIMELINE CONSTANTS ───────────────────────────────────────────────────
const FPS = 60;

const S1_START = 0;
const S1_DUR = 1200; // 20s

const S2_START = S1_START + S1_DUR + 60;
const S2_DUR = 600; // 10s

const S3_START = S2_START + S2_DUR + 60;
const S3_DUR = 1500; // 25s

const S4_START = S3_START + S3_DUR + 60;
const S4_DUR = 900; // 15s

const S5_START = S4_START + S4_DUR + 60;
const S5_DUR = 2100; // 35s

const S6_START = S5_START + S5_DUR + 60;
const S6_DUR = 420; // 7s

const TOTAL_FRAMES = S6_START + S6_DUR + 120;

// ── 3. SHARED COMPONENTS & ICONS ────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
  `}</style>
);

const IconWrapper = ({ children, size = 120, color = COLORS.primary }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const ICONS = {
  Gear: (p) => (
    <IconWrapper {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconWrapper>
  ),
  Brain: (p) => (
    <IconWrapper {...p}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </IconWrapper>
  ),
  Wrench: (p) => (
    <IconWrapper {...p}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </IconWrapper>
  ),
  Toolbox: (p) => (
    <IconWrapper {...p}>
      <path d="M4 8h16v12H4z" />
      <path d="M8 8V4h8v4" />
    </IconWrapper>
  ),
  Blueprint: (p) => (
    <IconWrapper {...p}>
      <path d="M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-6-6H5a2 2 0 0 0-2 2z" />
      <path d="M14 2v6h6" />
      <path d="M8 12h8" />
      <path d="M8 16h8" />
    </IconWrapper>
  ),
  Clipboard: (p) => (
    <IconWrapper {...p}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
    </IconWrapper>
  ),
  Calendar: (p) => (
    <IconWrapper {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </IconWrapper>
  ),
  Code: (p) => (
    <IconWrapper {...p}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </IconWrapper>
  ),
  Glass: (p) => (
    <IconWrapper {...p}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconWrapper>
  ),
  Rocket: (p) => (
    <IconWrapper {...p}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </IconWrapper>
  ),
  Cross: (p) => (
    <IconWrapper {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconWrapper>
  ),
  Person: (p) => (
    <IconWrapper {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconWrapper>
  ),
  Bulb: (p) => (
    <IconWrapper {...p}>
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </IconWrapper>
  ),
  Hammer: (p) => (
    <IconWrapper {...p}>
      <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H11.2C10.5 2.96 9.5 3 9.5 3s.5 1.5.5 2.2V6c0 .85-.33 1.65-.93 2.25L7.82 9.5" />
      <path d="m9.26 14.74 4.54-4.54" />
    </IconWrapper>
  ),
  Box: (p) => (
    <IconWrapper {...p}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </IconWrapper>
  ),
  Speech: (p) => (
    <IconWrapper {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconWrapper>
  ),
  Check: (p) => (
    <IconWrapper {...p}>
      <polyline points="20 6 9 17 4 12" />
    </IconWrapper>
  ),
  ArrowCycle: (p) => (
    <IconWrapper {...p}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </IconWrapper>
  ),
};

const Title = ({ text, frame, delay = 0, y = 160 }) => {
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  return (
    <h1
      style={{
        position: "absolute",
        top: y,
        width: "100%",
        textAlign: "center",
        margin: 0,
        fontSize: 140,
        fontWeight: 800,
        color: COLORS.primary,
        fontFamily: FONTS.sans,
        letterSpacing: "-0.02em",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
      }}
    >
      {text}
    </h1>
  );
};

const NodeCard = ({
  icon: Icon,
  label,
  size = 200,
  accent = COLORS.accentBlue,
}) => (
  <div
    style={{
      width: size,
      height: size,
      background: COLORS.card,
      border: `4px solid ${COLORS.cardBorder}`,
      borderRadius: 32,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 16px 60px rgba(0,0,0,0.5)`,
      zIndex: 10,
    }}
  >
    <Icon size={size * 0.4} color={accent} />
    {label && (
      <span
        style={{
          marginTop: 20,
          fontSize: size * 0.15,
          fontWeight: 700,
          color: COLORS.primary,
          fontFamily: FONTS.sans,
          letterSpacing: "-0.01em",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        {label}
      </span>
    )}
  </div>
);

// ── 4. SCENE COMPONENTS ─────────────────────────────────────────────────────

const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const T_TITLE = 30;
  const T_DEF = 90;
  const T_GEAR = 240;
  const T_NODES = 360;
  const T_EXIT = S1_DUR - 30;

  const titleIn = spring({
    frame: frame - T_TITLE,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const defIn = spring({
    frame: frame - T_DEF,
    fps,
    config: { damping: 14, stiffness: 70 },
  });
  const gearIn = spring({
    frame: frame - T_GEAR,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const nodeSprings = [0, 1, 2, 3].map((i) =>
    spring({
      frame: frame - (T_NODES + i * 30),
      fps,
      config: { damping: 14, stiffness: 80 },
    }),
  );

  const exitProg = interpolate(frame, [T_EXIT, T_EXIT + 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const cx = 1920;
  const cy = 1350;
  const r = 550;

  const nodes = [
    {
      label: "Knowledge",
      Icon: ICONS.Brain,
      color: COLORS.accentBlue,
      a: -135,
    },
    { label: "Skills", Icon: ICONS.Wrench, color: COLORS.accentPurple, a: -45 },
    { label: "Tools", Icon: ICONS.Toolbox, color: COLORS.accentAmber, a: 135 },
    {
      label: "Techniques",
      Icon: ICONS.Blueprint,
      color: COLORS.accentTeal,
      a: 45,
    },
  ];

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProg }}>
      <Title text="What is Project Management?" frame={frame} delay={T_TITLE} />

      {/* Definition Text */}
      <div
        style={{
          position: "absolute",
          top: 400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: defIn,
          transform: `translateY(${interpolate(defIn, [0, 1], [40, 0])}px)`,
          zIndex: 4,
        }}
      >
        <p
          style={{
            width: 2600,
            textAlign: "center",
            fontSize: 64,
            fontWeight: 400,
            color: COLORS.secondary,
            fontFamily: FONTS.sans,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Project Management is the application of{" "}
          <strong style={{ color: COLORS.accentBlue }}>knowledge</strong>,{" "}
          <strong style={{ color: COLORS.accentPurple }}>skills</strong>,{" "}
          <strong style={{ color: COLORS.accentAmber }}>tools</strong>, and{" "}
          <strong style={{ color: COLORS.accentTeal }}>techniques</strong> to
          project activities to meet project requirements.
        </p>
      </div>

      {/* Connecting Lines */}
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        {nodes.map((n, i) => {
          const rad = (n.a * Math.PI) / 180;
          const x = cx + Math.cos(rad) * r;
          const y = cy + Math.sin(rad) * r;
          const lineStart = T_NODES + i * 30 + 15;
          const draw = interpolate(frame, [lineStart, lineStart + 45], [0, r], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });

          return (
            <line
              key={`line-${i}`}
              x1={x}
              y1={y}
              x2={cx}
              y2={cy}
              stroke={n.color}
              strokeWidth={8}
              strokeDasharray={r}
              strokeDashoffset={r - draw}
              opacity={0.5}
            />
          );
        })}
      </svg>

      {/* Orbiting Nodes - Locked in place */}
      {nodes.map((n, i) => {
        const rad = (n.a * Math.PI) / 180;

        return (
          <div
            key={`node-${i}`}
            style={{
              position: "absolute",
              left: cx + Math.cos(rad) * r - 140,
              top: cy + Math.sin(rad) * r - 140,
              transform: `scale(${nodeSprings[i]})`,
              opacity: nodeSprings[i],
              zIndex: 3,
            }}
          >
            <NodeCard
              icon={n.Icon}
              label={n.label}
              size={280}
              accent={n.color}
            />
          </div>
        );
      })}

      {/* Center Gear */}
      <div
        style={{
          position: "absolute",
          left: cx - 220,
          top: cy - 220,
          width: 440,
          height: 440,
          background: COLORS.card,
          borderRadius: "50%",
          border: `6px solid ${COLORS.accentBlue}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${gearIn})`,
          opacity: gearIn,
          boxShadow: `0 0 80px rgba(59,130,246,0.2)`,
          zIndex: 2,
        }}
      >
        <div style={{ transform: `rotate(${(frame / fps) * 20}deg)` }}>
          <ICONS.Gear size={180} color={COLORS.accentBlue} />
        </div>
        <span
          style={{
            marginTop: 24,
            fontSize: 40,
            fontWeight: 700,
            color: COLORS.primary,
            fontFamily: FONTS.sans,
          }}
        >
          Management
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const T_TITLE = 20;
  const T_SUB = 80;
  const T_CARD_1 = 210;
  const T_CARD_2 = 290;
  const T_EXIT = S2_DUR - 30;

  const titleIn = spring({
    frame: frame - T_TITLE,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const subIn = spring({
    frame: frame - T_SUB,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const c1In = spring({
    frame: frame - T_CARD_1,
    fps,
    config: { damping: 13, stiffness: 90 },
  });
  const c2In = spring({
    frame: frame - T_CARD_2,
    fps,
    config: { damping: 13, stiffness: 90 },
  });

  const exitProg = interpolate(frame, [T_EXIT, T_EXIT + 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exitProg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 80, // Optical center lift for 4K screens
      }}
    >
      {/* Header Block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [40, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: COLORS.accentBlue,
            fontFamily: FONTS.sans,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Managing Projects Effectively
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 130,
            fontWeight: 800,
            color: COLORS.primary,
            fontFamily: FONTS.sans,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Project Management Methodologies
        </h1>
      </div>

      <p
        style={{
          margin: "40px 0 0 0",
          fontSize: 64,
          color: COLORS.secondary,
          fontFamily: FONTS.sans,
          opacity: subIn,
          transform: `translateY(${interpolate(subIn, [0, 1], [30, 0])}px)`,
        }}
      >
        Two of the most commonly used approaches
      </p>

      {/* Cards Container */}
      <div
        style={{
          display: "flex",
          gap: 240,
          marginTop: 160,
        }}
      >
        {/* Waterfall Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${c1In})`,
            opacity: c1In,
          }}
        >
          <div
            style={{
              width: 660,
              height: 660,
              background: COLORS.card,
              border: `5px solid ${COLORS.cardBorder}`,
              borderRadius: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              padding: "0 40px",
            }}
          >
            <ICONS.Clipboard size={220} color={COLORS.accentBlue} />
            <span
              style={{
                marginTop: 48,
                fontSize: 64,
                fontWeight: 700,
                color: COLORS.primary,
                fontFamily: FONTS.sans,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Waterfall Model
            </span>
          </div>
          <span
            style={{
              marginTop: 36,
              fontSize: 44,
              fontWeight: 600,
              color: COLORS.secondary,
              fontFamily: FONTS.sans,
            }}
          >
            Sequential & Linear
          </span>
        </div>

        {/* Agile Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${c2In})`,
            opacity: c2In,
          }}
        >
          <div
            style={{
              width: 660,
              height: 660,
              background: COLORS.card,
              border: `5px solid ${COLORS.cardBorder}`,
              borderRadius: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              padding: "0 40px",
            }}
          >
            <ICONS.ArrowCycle size={220} color={COLORS.accentGreen} />
            <span
              style={{
                marginTop: 48,
                fontSize: 58, // Tuned to safely fit "Development" on one line
                fontWeight: 700,
                color: COLORS.primary,
                fontFamily: FONTS.sans,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Agile Software Development
            </span>
          </div>
          <span
            style={{
              marginTop: 36,
              fontSize: 44,
              fontWeight: 600,
              color: COLORS.secondary,
              fontFamily: FONTS.sans,
            }}
          >
            Iterative & Flexible
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── TIMELINE SYNCED TO AUDIO SCRIPT (1500 Frames / 25s @ 60fps) ──
  const T_TITLE = 20;
  const T_DEF = 60;
  const T_NODES = 110;
  const T_ERROR = 440;
  const T_WATER_ANALOGY = 840;
  const T_WF_BLOCK = 930; // 1.5s after waterfall appears
  const T_WF_TEXT = 1020; // 1.5s after red block appears
  const T_CLEAR_REQ = 1200;
  const T_EXIT = S3_DUR - 30;

  const defIn = spring({
    frame: frame - T_DEF,
    fps,
    config: { damping: 14, stiffness: 70 },
  });

  const nodes = [
    { label: "Requirements", Icon: ICONS.Clipboard },
    { label: "Planning", Icon: ICONS.Calendar },
    { label: "Development", Icon: ICONS.Code },
    { label: "Testing", Icon: ICONS.Glass },
    { label: "Deployment", Icon: ICONS.Rocket },
  ];

  const nodeSprings = nodes.map((_, i) =>
    spring({
      frame: frame - (T_NODES + i * 35),
      fps,
      config: { damping: 14, stiffness: 80 },
    }),
  );

  // 3. LEFT SIDE CARDS - INCREASED GAP (Breathing Space)
  const startX = 260; // Adjusted start slightly left
  const startY = 400; // Adjusted start slightly up
  const stepX = 280; // Increased from 240
  const stepY = 260; // Increased from 220
  const getPos = (i) => ({ x: startX + i * stepX, y: startY + i * stepY });

  const getConnectorDraw = (i) => {
    const start = T_NODES + i * 35 + 20;
    // Total line distance is (stepX - 120) + (stepY - 120) = 160 + 140 = 300
    return interpolate(frame, [start, start + 25], [0, 320], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });
  };

  const errOpacity = interpolate(frame, [T_ERROR, T_ERROR + 20], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // 1. RED LINE ANIMATION SPEED REDUCED
  const errMarchOffset = -(frame * 2.5); // Slowed down from 6

  const pTest = getPos(3); // Testing (index 3)
  const pDev = getPos(2); // Development (index 2)
  const rightRouteX = pTest.x + 320;
  const reversePath = `M ${pTest.x + 120} ${pTest.y} L ${rightRouteX} ${pTest.y} L ${rightRouteX} ${pDev.y} L ${pDev.x + 120} ${pDev.y}`;

  // Right Side Waterfall Analogy Springs
  const wfOpacity = spring({
    frame: frame - T_WATER_ANALOGY,
    fps,
    config: { damping: 16, stiffness: 70 },
  });

  const wfBlockOpacity = spring({
    frame: frame - T_WF_BLOCK,
    fps,
    config: { damping: 16, stiffness: 70 },
  });

  const wfTextOpacity = spring({
    frame: frame - T_WF_TEXT,
    fps,
    config: { damping: 16, stiffness: 70 },
  });

  // 2. WATER ANIMATION SPEED REDUCED
  const waterFlowOffset = -(frame * 5); // Slowed down from 14

  const reqOpacity = spring({
    frame: frame - T_CLEAR_REQ,
    fps,
    config: { damping: 14, stiffness: 70 },
  });

  const exitProg = interpolate(frame, [T_EXIT, T_EXIT + 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProg }}>
      <Title text="The Waterfall Model" frame={frame} delay={T_TITLE} y={80} />

      <div
        style={{
          position: "absolute",
          top: 280,
          width: "100%",
          textAlign: "center",
          opacity: defIn,
          transform: `translateY(${interpolate(defIn, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 60,
            color: COLORS.secondary,
            fontFamily: FONTS.sans,
          }}
        >
          Work is completed step by step in a fixed sequence.
        </span>
      </div>

      {/* ── LEFT SIDE: THE STAIRCASE MODEL ── */}
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        {/* Standard Downward Steps */}
        {nodes.slice(1).map((_, i) => {
          const p1 = getPos(i);
          const p2 = getPos(i + 1);
          return (
            <path
              key={`conn-${i}`}
              d={`M ${p1.x} ${p1.y + 120} L ${p1.x} ${p2.y} L ${p2.x - 120} ${p2.y}`}
              stroke={COLORS.cardBorder}
              strokeWidth={8}
              fill="none"
              strokeDasharray={320}
              strokeDashoffset={320 - getConnectorDraw(i)}
              opacity={0.6}
            />
          );
        })}

        {/* CONTINUOUSLY MOVING RED RETURN PATH */}
        <path
          d={reversePath}
          stroke={COLORS.accentRed}
          strokeWidth={10}
          strokeDasharray="24 16"
          strokeDashoffset={errMarchOffset}
          fill="none"
          strokeLinejoin="round"
          opacity={errOpacity}
        />

        {/* Arrowhead entering Development card from right */}
        <polygon
          points={`${pDev.x + 120},${pDev.y} ${pDev.x + 144},${pDev.y - 14} ${pDev.x + 144},${pDev.y + 14}`}
          fill={COLORS.accentRed}
          opacity={errOpacity}
        />
      </svg>

      {/* Staircase Cards */}
      {nodes.map((n, i) => {
        const p = getPos(i);
        return (
          <div
            key={`node-${i}`}
            style={{
              position: "absolute",
              left: p.x - 120,
              top: p.y - 120,
              transform: `scale(${nodeSprings[i]})`,
              opacity: nodeSprings[i],
              zIndex: 2,
            }}
          >
            <NodeCard
              icon={n.Icon}
              label={n.label}
              size={240}
              accent={COLORS.primary}
            />
          </div>
        );
      })}

      {/* "Costly to Reverse" Label */}
      <div
        style={{
          position: "absolute",
          left: rightRouteX + 32,
          top: (pDev.y + pTest.y) / 2 - 36,
          opacity: errOpacity,
          display: "flex",
          alignItems: "center",
          gap: 20,
          zIndex: 3,
        }}
      >
        <div
          style={{
            background: COLORS.accentRed,
            borderRadius: "50%",
            padding: 10,
            display: "flex",
          }}
        >
          <ICONS.Cross size={36} color={COLORS.primary} />
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.accentRed,
            fontFamily: FONTS.sans,
          }}
        >
          Costly to Reverse
        </div>
      </div>

      {/* ── RIGHT SIDE: STRAIGHT WATERFALL & BLOCKED UPWARD FLOW ── */}
      <div
        style={{
          position: "absolute",
          left: 2150,
          top: 400,
          width: 1400,
          height: 1100,
          opacity: wfOpacity,
          transform: `translateY(${interpolate(wfOpacity, [0, 1], [40, 0])}px)`,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1200 900">
          {/* STRAIGHT CLIFF GEOMETRY */}
          <path
            d="M 40 240 L 520 240 L 520 700 L 1150 700"
            stroke={COLORS.cardBorder}
            strokeWidth={28}
            fill="none"
            strokeLinejoin="round"
          />

          {/* Glowing Static Water Base */}
          <path
            d="M 40 200 L 480 200 L 480 660 L 1150 660"
            stroke={COLORS.water}
            strokeWidth={36}
            fill="none"
            strokeLinejoin="round"
            opacity={0.25}
            style={{ filter: "drop-shadow(0 0 24px #0EA5E9)" }}
          />

          {/* Rushing Straight Water Current */}
          <path
            d="M 40 200 L 480 200 L 480 660 L 1150 660"
            stroke={COLORS.water}
            strokeWidth={36}
            fill="none"
            strokeLinejoin="round"
            strokeDasharray="180 100"
            strokeDashoffset={waterFlowOffset}
          />

          {/* 2. SEQUENCED VISUAL REPRESENTATION: Water cannot flow back up */}
          <g
            style={{
              opacity: wfBlockOpacity,
              transform: `scale(${interpolate(wfBlockOpacity, [0, 1], [0.8, 1])})`,
              transformOrigin: "340px 465px",
            }}
          >
            {/* Upward ghost arrow */}
            <path
              d="M 340 600 L 340 330"
              stroke={COLORS.accentRed}
              strokeWidth={8}
              strokeDasharray="16 16"
              fill="none"
            />
            <polyline
              points="320,355 340,330 360,355"
              fill="none"
              stroke={COLORS.accentRed}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Big Red Cross / Block Badge superimposed on upward path */}
            <circle
              cx="340"
              cy="465"
              r="44"
              fill={COLORS.bg}
              stroke={COLORS.accentRed}
              strokeWidth="6"
            />
            <line
              x1="320"
              y1="445"
              x2="360"
              y2="485"
              stroke={COLORS.accentRed}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="360"
              y1="445"
              x2="320"
              y2="485"
              stroke={COLORS.accentRed}
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* 2. SEQUENCED TEXT: Appears after the red block */}
        <div
          style={{
            position: "absolute",
            top: 1000,
            width: "100%",
            textAlign: "center",
            opacity: wfTextOpacity,
            transform: `translateY(${interpolate(wfTextOpacity, [0, 1], [20, 0])}px)`,
          }}
        >
          <span
            style={{
              fontSize: 56,
              color: COLORS.secondary,
              fontFamily: FONTS.sans,
              fontWeight: 600,
            }}
          >
            "Water flows down, not up"
          </span>
        </div>
      </div>

      {/* Bottom Takeaway Banner */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: reqOpacity,
          transform: `translateY(${interpolate(reqOpacity, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.accentGreen,
            fontFamily: FONTS.sans,
            background: "rgba(16, 185, 129, 0.12)",
            padding: "24px 64px",
            borderRadius: 100,
            border: `2px solid ${COLORS.accentGreen}`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}
        >
          Works well when requirements are clear and unlikely to change
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline mapped to script pacing (Total 900 frames / 15s)
  const T_TITLE = 20;
  const T_SARA = 60;
  const T_SARA_BULB = 140;
  const T_WF = 200;
  const T_NEW_IDEAS = 300;
  const T_CONNECT = 460;
  const T_EXIT = S4_DUR - 30;

  const saraIn = spring({
    frame: frame - T_SARA,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const saraBulbIn = spring({
    frame: frame - T_SARA_BULB,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const wfIn = spring({
    frame: frame - T_WF,
    fps,
    config: { damping: 16, stiffness: 70 },
  });

  const ideas = [
    {
      label: "New Feature",
      Icon: ICONS.Box,
      color: COLORS.accentPurple,
      dy: -260,
      targetNode: 1,
    },
    {
      label: "Changes",
      Icon: ICONS.Wrench,
      color: COLORS.accentAmber,
      dy: 0,
      targetNode: 2,
    },
    {
      label: "Feedback",
      Icon: ICONS.Speech,
      color: COLORS.accentGreen,
      dy: 260,
      targetNode: 3,
    },
  ];

  const ideaSprings = ideas.map((_, i) =>
    spring({
      frame: frame - (T_NEW_IDEAS + i * 30),
      fps,
      config: { damping: 14, stiffness: 90 },
    }),
  );

  // 1. FIXED: Continuous marching offset for the dashed lines
  const continuousOffset = -(frame * 5); // Smoothly moves the dashes every frame

  // Sequential fade-in for each line
  const lineOpacities = ideas.map((_, i) => {
    const start = T_CONNECT + i * 30;
    return interpolate(frame, [start, start + 20], [0, 0.8], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });
  });

  const exitProg = interpolate(frame, [T_EXIT, T_EXIT + 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const isStrained = frame > T_CONNECT + 100;

  // Layout Constants for precise line connection
  const ideaX = 900;
  const ideaCenterY = 1040;

  const wfStartX = 1900;
  const wfStartY = 350;
  const wfStep = 220;

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProg }}>
      <Title
        text="But Requirements Often Change..."
        frame={frame}
        delay={T_TITLE}
        y={120}
      />

      {/* SARA & BULB BADGE */}
      <div
        style={{
          position: "absolute",
          left: 400,
          top: ideaCenterY - 140,
          transform: `scale(${saraIn})`,
          opacity: saraIn,
        }}
      >
        <NodeCard
          icon={ICONS.Person}
          label="Sara"
          size={280}
          accent={COLORS.primary}
        />

        {/* Floating Bulb on Sara */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            transform: `scale(${saraBulbIn})`,
            opacity: saraBulbIn,
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: COLORS.card,
              borderRadius: "50%",
              padding: 16,
              border: `6px solid ${COLORS.accentAmber}`,
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
            }}
          >
            <ICONS.Bulb size={64} color={COLORS.accentAmber} />
          </div>
        </div>
      </div>

      {/* IDEA CARDS */}
      {ideas.map((n, i) => (
        <div
          key={`idea-${i}`}
          style={{
            position: "absolute",
            left: ideaX,
            top: ideaCenterY - 100 + n.dy,
            transform: `scale(${ideaSprings[i]})`,
            opacity: ideaSprings[i],
          }}
        >
          <NodeCard icon={n.Icon} label={n.label} size={200} accent={n.color} />
        </div>
      ))}

      {/* ALIGNED AND CONTINUOUSLY ANIMATING CONNECTING LINES */}
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        {ideas.map((n, i) => {
          const startX = ideaX + 200;
          const startY = ideaCenterY + n.dy;

          const endX = wfStartX + n.targetNode * wfStep;
          const endY = wfStartY + n.targetNode * wfStep + 80;

          const path = `M ${startX} ${startY} C ${startX + 300} ${startY} ${endX - 300} ${endY} ${endX} ${endY}`;

          return (
            <path
              key={`path-${i}`}
              d={path}
              stroke={COLORS.accentRed}
              strokeWidth={8}
              strokeDasharray="24 16"
              fill="none"
              strokeDashoffset={continuousOffset}
              opacity={lineOpacities[i]}
            />
          );
        })}
      </svg>

      {/* Waterfall Structure */}
      <div
        style={{
          position: "absolute",
          left: wfStartX,
          top: wfStartY,
          transform: `scale(${wfIn})`,
          opacity: wfIn,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const getsHit = ideas.some((idea) => idea.targetNode === i);
          const strainColor =
            isStrained && getsHit ? COLORS.accentRed : COLORS.cardBorder;

          return (
            <div
              key={`wf-${i}`}
              style={{
                position: "absolute",
                left: i * wfStep,
                top: i * wfStep,
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  background: COLORS.card,
                  border: `6px solid ${strainColor}`,
                  borderRadius: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.3s ease",
                }}
              >
                <ICONS.Clipboard size={80} color={strainColor} />
              </div>

              {i < 4 && (
                <svg
                  style={{
                    position: "absolute",
                    left: 80,
                    top: 80,
                    zIndex: -1,
                  }}
                  width={wfStep}
                  height={wfStep}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2={wfStep}
                    y2={wfStep}
                    stroke={COLORS.cardBorder}
                    strokeWidth={8}
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Impact Crosses on Waterfall Nodes */}
      {ideas.map((n, i) => {
        const hitIn = spring({
          frame: frame - (T_CONNECT + i * 30 + 30),
          fps,
          config: { damping: 10, stiffness: 120 },
        });

        const targetX = wfStartX + n.targetNode * wfStep;
        const targetY = wfStartY + n.targetNode * wfStep + 80;

        return (
          <div
            key={`hit-${i}`}
            style={{
              position: "absolute",
              left: targetX - 40,
              top: targetY - 40,
              transform: `scale(${hitIn})`,
              opacity: hitIn,
              zIndex: 10,
            }}
          >
            <div style={{ background: COLORS.bg, borderRadius: "50%" }}>
              <ICONS.Cross size={80} color={COLORS.accentRed} />
            </div>
          </div>
        );
      })}

      {/* Conclusion Text */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          bottom: 180,
          textAlign: "center",
          fontSize: 72,
          fontWeight: 800,
          color: COLORS.accentRed,
          fontFamily: FONTS.sans,
          opacity: interpolate(
            frame,
            [T_CONNECT + 120, T_CONNECT + 150],
            [0, 1],
            { extrapolateRight: "clamp" },
          ),
        }}
      >
        Waterfall breaks under frequent changes
      </div>
    </AbsoluteFill>
  );
};

const Scene5 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── TIMELINE SYNCED TO AUDIO SCRIPT (2100 Frames / 35s @ 60fps) ──
  const T_TITLE = 30;
  const T_PROJ = 100;
  const T_SPLIT = 200;
  const T_SPRINTS = 280;
  const T_FADE_PHASE_1 = 440;
  const T_FLOW_START = 460;
  const T_FEEDBACK = 865; // Updated to match 540 loop timing
  const T_BENEFIT_1 = 1140;
  const T_BENEFIT_2 = 1320;
  const T_BENEFIT_3 = 1500;
  const T_EXIT = S5_DUR - 30;

  const titleIn = spring({
    frame: frame - T_TITLE,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const projIn = spring({
    frame: frame - T_PROJ,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Splitting Project into 3 Sprints
  const splitProg = spring({
    frame: frame - T_SPLIT,
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const sprintBoxIn = spring({
    frame: frame - T_SPRINTS,
    fps,
    config: { damping: 14, stiffness: 70 },
  });

  // Phase transition (Crossfade from Phase 1 to Phase 2)
  const fadePhase1 = interpolate(
    frame,
    [T_FADE_PHASE_1, T_FADE_PHASE_1 + 30],
    [1, 0],
    { extrapolateRight: "clamp" },
  );

  const flowIn = spring({
    frame: frame - T_FLOW_START,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const nodeSprings = [0, 1, 2, 3].map((i) =>
    spring({
      frame: frame - (T_FLOW_START + i * 30),
      fps,
      config: { damping: 14, stiffness: 80 },
    }),
  );

  const flowConnectorDraw = interpolate(
    frame,
    [T_FLOW_START + 120, T_FLOW_START + 180],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  const feedbackOpacity = interpolate(
    frame,
    [T_FEEDBACK, T_FEEDBACK + 30],
    [0, 0.8],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  const feedbackText = interpolate(
    frame,
    [T_FEEDBACK + 30, T_FEEDBACK + 60],
    [0, 1],
    { extrapolateRight: "clamp" },
  );

  const continuousOffset = -(frame * 6); // Marching dashes

  // Benefits
  const b1 = spring({
    frame: frame - T_BENEFIT_1,
    fps,
    config: { damping: 16, stiffness: 80 },
  });
  const b2 = spring({
    frame: frame - T_BENEFIT_2,
    fps,
    config: { damping: 16, stiffness: 80 },
  });
  const b3 = spring({
    frame: frame - T_BENEFIT_3,
    fps,
    config: { damping: 16, stiffness: 80 },
  });

  const exitProg = interpolate(frame, [T_EXIT, T_EXIT + 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Layout Constants
  const cx = 1920;

  // Phase 1 Coordinates
  const blockX = [
    interpolate(splitProg, [0, 1], [cx, cx - 640]),
    cx,
    interpolate(splitProg, [0, 1], [cx, cx + 640]),
  ];

  // Phase 2 Pipeline Coordinates
  const flowNodes = [
    {
      label: "Sprint",
      Icon: ICONS.Clipboard,
      color: COLORS.accentBlue,
      x: cx - 900,
      y: 1000,
    },
    {
      label: "Build",
      Icon: ICONS.Hammer,
      color: COLORS.accentPurple,
      x: cx - 300,
      y: 1000,
    },
    {
      label: "Test",
      Icon: ICONS.Glass,
      color: COLORS.accentAmber,
      x: cx + 300,
      y: 1000,
    },
    {
      label: "Deliver",
      Icon: ICONS.Box,
      color: COLORS.accentGreen,
      x: cx + 900,
      y: 1000,
    },
  ];

  // ── DYNAMIC PAYLOAD ANIMATION (~33% Slower Traverse Speed) ──
  let payloadX = cx - 900;
  let payloadY = 1000;
  let payloadOpacity = 0;
  let cycleCount = 1;

  if (frame >= T_FLOW_START) {
    payloadOpacity = interpolate(
      frame,
      [T_FLOW_START, T_FLOW_START + 30],
      [0, 1],
      { extrapolateRight: "clamp" },
    );

    // One full pipeline cycle slowed down to 540 frames (9 seconds)
    const loopFrame = (frame - T_FLOW_START) % 540;
    const tLoop = loopFrame / 540;

    // Increment the work label number each full cycle
    cycleCount = Math.floor((frame - T_FLOW_START) / 540) + 1;

    if (tLoop < 0.2) {
      // 1. Moving Sprint -> Build
      payloadX = interpolate(tLoop, [0, 0.2], [cx - 900, cx - 300]);
    } else if (tLoop < 0.25) {
      // Pause inside Build
      payloadX = cx - 300;
    } else if (tLoop < 0.45) {
      // 2. Moving Build -> Test
      payloadX = interpolate(tLoop, [0.25, 0.45], [cx - 300, cx + 300]);
    } else if (tLoop < 0.5) {
      // Pause inside Test
      payloadX = cx + 300;
    } else if (tLoop < 0.7) {
      // 3. Moving Test -> Deliver
      payloadX = interpolate(tLoop, [0.5, 0.7], [cx + 300, cx + 900]);
    } else if (tLoop < 0.75) {
      // Pause inside Deliver
      payloadX = cx + 900;
    } else if (tLoop < 0.95) {
      // 4. Feedback Curve (Bezier from Deliver back to Sprint)
      const prog = (tLoop - 0.75) / 0.2;
      const p0 = { x: cx + 900, y: 1000 };
      const p1 = { x: cx + 900, y: 1500 };
      const p2 = { x: cx - 900, y: 1500 };
      const p3 = { x: cx - 900, y: 1000 };

      const u = 1 - prog;
      payloadX =
        u * u * u * p0.x +
        3 * u * u * prog * p1.x +
        3 * u * prog * prog * p2.x +
        prog * prog * prog * p3.x;
      payloadY =
        u * u * u * p0.y +
        3 * u * u * prog * p1.y +
        3 * u * prog * prog * p2.y +
        prog * prog * prog * p3.y;
    } else {
      // Pause inside Sprint
      payloadX = cx - 900;
    }
  }

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProg }}>
      <Title
        text="Agile Software Development"
        frame={frame}
        delay={T_TITLE}
        y={80}
      />

      {/* ── PHASE 1: SPLITTING THE PROJECT ── */}
      <div
        style={{
          opacity: fadePhase1,
          display: frame > T_FADE_PHASE_1 + 30 ? "none" : "block",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 320,
            width: "100%",
            textAlign: "center",
            opacity: Math.min(projIn * 2, 1),
          }}
        >
          <span
            style={{
              fontSize: 60,
              color: COLORS.secondary,
              fontFamily: FONTS.sans,
            }}
          >
            Work is divided into smaller{" "}
            <strong style={{ color: COLORS.accentBlue }}>iterations</strong> or{" "}
            <strong style={{ color: COLORS.accentBlue }}>sprints</strong>.
          </span>
        </div>

        {/* 3 Smaller Blocks emerging from Center */}
        {[0, 1, 2].map((i) => (
          <div
            key={`part-${i}`}
            style={{
              position: "absolute",
              left: blockX[i] - 160,
              top: 1000 - 160,
              width: 320,
              height: 320,
              background: COLORS.accentBlue,
              borderRadius: 24,
              border: "6px solid #FFF",
              opacity: splitProg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 40px rgba(59,130,246,0.4)",
            }}
          >
            <ICONS.Code size={140} color="#FFF" />
          </div>
        ))}

        {/* Single Giant Project Block (Fades out as it splits) */}
        <div
          style={{
            position: "absolute",
            left: cx - 260,
            top: 1000 - 260,
            width: 520,
            height: 520,
            background: COLORS.card,
            border: `8px solid ${COLORS.accentBlue}`,
            borderRadius: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${projIn})`,
            opacity: projIn * (1 - splitProg),
            boxShadow: "0 16px 60px rgba(0,0,0,0.5)",
            zIndex: 10,
          }}
        >
          <span
            style={{ fontSize: 72, fontWeight: 800, color: COLORS.primary }}
          >
            Entire Project
          </span>
        </div>

        {/* Sprint Containers */}
        {[0, 1, 2].map((i) => (
          <div
            key={`sprintbox-${i}`}
            style={{
              position: "absolute",
              left: blockX[i] - 220,
              top: 1000 - 220,
              width: 440,
              height: 440,
              border: `4px dashed ${COLORS.cardBorder}`,
              borderRadius: 32,
              display: "flex",
              justifyContent: "center",
              opacity: sprintBoxIn,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -90,
                width: "100%",
                textAlign: "center",
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.secondary,
                fontFamily: FONTS.sans,
              }}
            >
              Sprint {i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* ── PHASE 2: CONTINUOUS PROCESS PIPELINE ── */}
      <div
        style={{
          opacity: flowIn,
          display: frame < T_FADE_PHASE_1 ? "none" : "block",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 320,
            width: "100%",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 60,
              color: COLORS.secondary,
              fontFamily: FONTS.sans,
            }}
          >
            Inside each sprint, the team works continuously:
          </span>
        </div>

        {/* 1. Underlying Connectors (z-index 0) */}
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          {/* Straight Process Lines */}
          <line
            x1={cx - 900}
            y1={1000}
            x2={cx - 300}
            y2={1000}
            stroke={COLORS.cardBorder}
            strokeWidth={10}
            strokeDasharray="24 16"
            strokeDashoffset={continuousOffset}
            opacity={flowConnectorDraw}
          />
          <line
            x1={cx - 300}
            y1={1000}
            x2={cx + 300}
            y2={1000}
            stroke={COLORS.cardBorder}
            strokeWidth={10}
            strokeDasharray="24 16"
            strokeDashoffset={continuousOffset}
            opacity={flowConnectorDraw}
          />
          <line
            x1={cx + 300}
            y1={1000}
            x2={cx + 900}
            y2={1000}
            stroke={COLORS.cardBorder}
            strokeWidth={10}
            strokeDasharray="24 16"
            strokeDashoffset={continuousOffset}
            opacity={flowConnectorDraw}
          />

          {/* Feedback Loop Curved Arrow */}
          <path
            d={`M ${cx + 900} 1000 C ${cx + 900} 1500, ${cx - 900} 1500, ${cx - 900} 1000`}
            stroke={COLORS.accentAmber}
            strokeWidth={12}
            fill="none"
            strokeDasharray="30 20"
            strokeDashoffset={continuousOffset}
            opacity={feedbackOpacity}
          />

          {/* Arrowheads properly placed at the left edges of target cards (radius 130) */}
          {flowConnectorDraw > 0 && (
            <>
              <polygon
                points={`${cx - 430},1000 ${cx - 455},980 ${cx - 455},1020`}
                fill={COLORS.cardBorder}
              />
              <polygon
                points={`${cx + 170},1000 ${cx + 145},980 ${cx + 145},1020`}
                fill={COLORS.cardBorder}
              />
              <polygon
                points={`${cx + 770},1000 ${cx + 745},980 ${cx + 745},1020`}
                fill={COLORS.cardBorder}
              />
            </>
          )}

          {/* Arrowhead for the feedback loop (Placed at the bottom center of the arc pointing left) */}
          {feedbackOpacity > 0 && (
            <polygon
              points={`${cx - 20},1375 ${cx + 10},1355 ${cx + 10},1395`}
              fill={COLORS.accentAmber}
            />
          )}
        </svg>

        {/* 2. Animated Process Payload (z-index 1: slides perfectly under the cards to simulate processing) */}
        <div
          style={{
            position: "absolute",
            left: payloadX - 90,
            top: payloadY - 35,
            width: 180,
            height: 70,
            background: COLORS.accentBlue,
            borderRadius: 35,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 30px ${COLORS.accentBlue}`,
            opacity: payloadOpacity,
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: "#FFF",
              fontWeight: 800,
              fontSize: 32,
              fontFamily: FONTS.sans,
            }}
          >
            Work {cycleCount}
          </span>
        </div>

        {/* 3. Pipeline Nodes (z-index 2) */}
        {flowNodes.map((n, i) => (
          <div
            key={`flownode-${i}`}
            style={{
              position: "absolute",
              left: n.x - 130, // 260px size
              top: n.y - 130,
              transform: `scale(${nodeSprings[i]})`,
              opacity: nodeSprings[i],
              zIndex: 2,
            }}
          >
            <NodeCard
              icon={n.Icon}
              label={n.label}
              size={260}
              accent={n.color}
            />
          </div>
        ))}

        {/* Feedback Label */}
        <div
          style={{
            position: "absolute",
            left: cx - 300,
            top: 1440,
            width: 600,
            textAlign: "center",
            fontSize: 52,
            fontWeight: 800,
            color: COLORS.accentAmber,
            fontFamily: FONTS.sans,
            opacity: feedbackText,
            transform: `translateY(${interpolate(feedbackText, [0, 1], [20, 0])}px)`,
          }}
        >
          Stakeholder Feedback
        </div>

        {/* ── PHASE 3: BENEFITS (Bottom Area) ── */}
        <div
          style={{
            position: "absolute",
            top: 1580,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div
            style={{
              opacity: b1,
              transform: `translateY(${interpolate(b1, [0, 1], [20, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <ICONS.Check size={64} color={COLORS.accentGreen} />
            <span
              style={{
                fontSize: 64,
                color: COLORS.primary,
                fontFamily: FONTS.sans,
              }}
            >
              Easier to handle changing requirements
            </span>
          </div>
          <div
            style={{
              opacity: b2,
              transform: `translateY(${interpolate(b2, [0, 1], [20, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <ICONS.Check size={64} color={COLORS.accentGreen} />
            <span
              style={{
                fontSize: 64,
                color: COLORS.primary,
                fontFamily: FONTS.sans,
              }}
            >
              Adapt to new ideas quickly
            </span>
          </div>
          <div
            style={{
              opacity: b3,
              transform: `translateY(${interpolate(b3, [0, 1], [20, 0])}px)`,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <ICONS.Check size={64} color={COLORS.accentGreen} />
            <span
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: COLORS.accentBlue,
                fontFamily: FONTS.sans,
              }}
            >
              Build, learn, and improve continuously
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene6 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const T_TITLE = 30;
  const T_EXIT = S6_DUR - 30;

  const titleIn = spring({
    frame: frame - T_TITLE,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const exitProg = interpolate(frame, [T_EXIT, T_EXIT + 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exitProg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "60px 120px",
          background: COLORS.card,
          border: `6px solid ${COLORS.accentBlue}`,
          borderRadius: 160,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          opacity: titleIn,
          transform: `scale(${interpolate(titleIn, [0, 1], [0.9, 1])})`,
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: COLORS.primary,
            fontFamily: FONTS.sans,
          }}
        >
          Up Next:{" "}
          <span style={{ color: COLORS.accentBlue }}>Scrum Framework</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. ROOT COMPOSITION ─────────────────────────────────────────────────────

export const CourseAnimation = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <GlobalStyles />

      <Sequence from={S1_START} durationInFrames={S1_DUR}>
        <Scene1 />
      </Sequence>

      <Sequence from={S2_START} durationInFrames={S2_DUR}>
        <Scene2 />
      </Sequence>

      <Sequence from={S3_START} durationInFrames={S3_DUR}>
        <Scene3 />
      </Sequence>

      <Sequence from={S4_START} durationInFrames={S4_DUR}>
        <Scene4 />
      </Sequence>

      <Sequence from={S5_START} durationInFrames={S5_DUR}>
        <Scene5 />
      </Sequence>

      <Sequence from={S6_START} durationInFrames={S6_DUR}>
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── 6. REGISTRATION ─────────────────────────────────────────────────────────
export const RemotionRoot = () => (
  <Composition
    id="CourseAnimation"
    component={CourseAnimation}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={3840}
    height={2160}
    defaultProps={{}}
  />
);

registerRoot(RemotionRoot);
