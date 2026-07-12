import {
  AbsoluteFill,
  Sequence,
  Html5Audio,
  staticFile,
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Composition,
  registerRoot,
  random,
} from "remotion";
import React from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESIGN SYSTEM TOKENS & STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BG_GRADIENTS = [
  "linear-gradient(135deg, #F8FAFC, #E2E8F0)",
  "linear-gradient(135deg, #EFF6FF, #F0F9FF)",
  "linear-gradient(135deg, #FFFBEB, #FEF3C7 40%, #FFF7ED)",
  "linear-gradient(135deg, #ECFDF5, #F0FDFA)",
  "linear-gradient(135deg, #FFF1F2, #FDF2F8)",
  "linear-gradient(135deg, #ECFEFF, #F0F9FF)",
];

const COLORS = {
  surface: "#FFFFFF",
  primary: "#2563EB",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  cyan: "#0891B2",
  purple: "#8B5CF6",
  rose: "#E11D48",
  chrome: "#F1F5F9",
  border: "#E2E8F0",
  muted: "#64748B",
  darkText: "#0F172A",
  bodyText: "#1E293B",
};

const FontInjection = () => (
  <style>{`
    @import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap");
    body {
      font-family: 'Quicksand', sans-serif;
    }
  `}</style>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUIRED ANIMATION HELPERS (PRIMITIVES)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function useEnter(delayFrames = 20, config = { damping: 14, stiffness: 100 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delayFrames, fps, config });
  return {
    value: enter,
    style: {
      opacity: Math.min(enter * 2, 1),
      transform: `translateY(${interpolate(enter, [0, 1], [120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px) scale(${interpolate(enter, [0, 1], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
    },
  };
}

const AnimatedLine = ({
  x1,
  y1,
  x2,
  y2,
  startFrame,
  color = "#2563EB",
  strokeWidth = 10,
  dashed = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 90 },
  });
  const clamped = Math.max(0, Math.min(1, progress));
  const length = Math.hypot(x2 - x1, y2 - y1);
  const dashOffset = interpolate(clamped, [0, 1], [length, 0]);
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashed ? "15,10" : undefined}
        strokeDashoffset={dashed ? dashOffset : undefined}
        opacity={clamped > 0 ? 1 : 0}
      />
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
    x: interpolate(t, [0, 1], [fromX, toX], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    y: interpolate(t, [0, 1], [fromY, toY], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
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
    ringScale: interpolate(t, [0, 1], [0.3, 2.4], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    ringOpacity: interpolate(t, [0, 0.15, 1], [0, 0.5, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    pressScale: interpolate(t, [0, 0.15, 0.3, 1], [1, 0.88, 1, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
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
      transform: `translateY(${interpolate(exit, [0, 1], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px) scale(${interpolate(exit, [0, 1], [1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
    },
  };
}

function useMoveAlongPath(waypoints, config = { damping: 18, stiffness: 80 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame <= waypoints[0].frame)
    return { x: waypoints[0].x, y: waypoints[0].y };
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
  };
}

function useAmbientFloat(amplitude = 12, periodFrames = 120, phase = 0) {
  const frame = useCurrentFrame();
  return Math.sin(((frame + phase) / periodFrames) * Math.PI * 2) * amplitude;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STANDARD STRUCTURAL COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
        color: COLORS.muted,
        ...enter.style,
      }}
    >
      {title}
    </div>
  );
};

const ScenePlaceholder = ({ label }) => {
  const enter = useEnter(10);
  return (
    <AbsoluteFill
      style={{
        background: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <div
        style={{
          ...enter.style,
          fontFamily: "Quicksand",
          fontSize: 60,
          fontWeight: 700,
          color: COLORS.muted,
          border: `4px dashed ${COLORS.border}`,
          borderRadius: 24,
          padding: "60px 100px",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

const AmbientBlob = ({ x, y, size, color, phase = 0 }) => {
  const drift = useAmbientFloat(20, 200, phase);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + drift,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity: 0.08,
        filter: "blur(60px)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

const PersonFigure = ({ x, y, label, color = "#2563EB", scale = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, textAlign: "center" }}>
    <svg width={140 * scale} height={160 * scale} viewBox="0 0 140 160">
      <circle
        cx="70"
        cy="45"
        r="38"
        fill="none"
        stroke={color}
        strokeWidth="10"
      />
      <path
        d="M16 152 Q16 96 70 96 Q124 96 124 152"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
    {label && (
      <div
        style={{
          fontFamily: "Quicksand",
          fontWeight: 700,
          fontSize: 36 * scale,
          color: COLORS.darkText,
          marginTop: 12,
        }}
      >
        {label}
      </div>
    )}
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #0 — WELCOME SCENE (FIXED SPECS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WelcomeScene = () => {
  const frame = useCurrentFrame();
  const enterPanel = useEnter(15, { damping: 12, stiffness: 90 });
  const exitScene = useExit(260);

  // Smooth camera push-in simulation
  const scaleProgress = spring({
    frame: frame - 180,
    fps: 60,
    config: { damping: 26, stiffness: 30 },
  });
  const cameraScale = interpolate(scaleProgress, [0, 1], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[1],
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        ...exitScene.style,
      }}
    >
      <AmbientBlob
        x={400}
        y={300}
        size={600}
        color={COLORS.primary}
        phase={0}
      />
      <AmbientBlob
        x={2800}
        y={1200}
        size={700}
        color={COLORS.cyan}
        phase={45}
      />

      <div
        style={{
          transform: `scale(${cameraScale})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            background: COLORS.surface,
            padding: "100px 140px",
            borderRadius: 32,
            border: `3px solid ${COLORS.primary}`,
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
            textAlign: "center",
            maxWidth: 2200,
            ...enterPanel.style,
          }}
        >
          <h1
            style={{
              fontSize: 150,
              fontWeight: 800,
              color: COLORS.darkText,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Usecase explanation
          </h1>
          <h2
            style={{
              fontSize: 70,
              fontWeight: 600,
              color: COLORS.muted,
              marginTop: 40,
              marginBottom: 0,
            }}
          >
            Course Architecture Setup
          </h2>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #1 — SCENE 1 (FULLY REALIZED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene1 = () => {
  const enterWelcome = useEnter(20);
  const enterQuestion = useEnter(80); // Fades in exactly 1 second (60 frames) after welcome
  const exitAll = useExit(330); // Clean screen exit padding for sequence edge

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[0],
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        ...exitAll.style,
      }}
    >
      <FontInjection />
      <SceneHeading title="Welcome" />

      <AmbientBlob
        x={800}
        y={400}
        size={800}
        color={COLORS.purple}
        phase={90}
      />

      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 60,
        }}
      >
        <div
          style={{
            fontSize: 160,
            fontWeight: 800,
            color: COLORS.darkText,
            letterSpacing: "-2px",
            ...enterWelcome.style,
          }}
        >
          Welcome!
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 600,
            color: COLORS.primary,
            ...enterQuestion.style,
          }}
        >
          Why are we here?
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #2 — Context & Team (Sara's Story)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene2 = () => {
  const frame = useCurrentFrame();

  // Staggered entrances
  const enterProblem = useEnter(20);
  const enterSolution = useEnter(160);
  const enterSaraInitial = useEnter(280);

  // Phase 2 transitions: Clearing the stage for Sara's focal point
  const exitProblemSolution = useExit(460);

  // Phase 3: Move Sara to center stage
  // Starts after Problem/Solution fade out
  const saraMove = useMoveBetween(2400, 1300, 1920, 1200, 520);

  // Phase 4: Shop and Tech systems reveal
  const lineShop = 660;
  const enterShop = useEnter(700);
  const enterIcons = useEnter(760);

  const lineTech = 800;
  const enterTechs = useEnter(840);

  // Final global scene exit breakdown
  const exitAll = useExit(960);

  // Coordinate adjustments for initial positioning
  const problemX = 1200;
  const problemY = 900;
  const solutionX = 2400;
  const solutionY = 900;

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[2],
        ...exitAll.style,
      }}
    >
      <SceneHeading title="Sara's Story" />

      <AmbientBlob
        x={300}
        y={1500}
        size={700}
        color={COLORS.warning}
        phase={120}
      />
      <AmbientBlob
        x={3200}
        y={200}
        size={900}
        color={COLORS.primary}
        phase={20}
      />

      {/* PHASE 1: Problem & Solution Architecture */}
      <div style={exitProblemSolution.style}>
        {/* Problem Node */}
        <div
          style={{
            position: "absolute",
            left: problemX,
            top: problemY,
            background: COLORS.surface,
            border: `4px solid ${COLORS.danger}`,
            borderRadius: 24,
            padding: "40px 60px",
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
            ...enterProblem.style,
          }}
        >
          <div style={{ fontSize: 65, fontWeight: 700, color: COLORS.danger }}>
            Problem
          </div>
        </div>

        {/* Dynamic Connector Arrow */}
        <AnimatedLine
          x1={problemX + 320}
          y1={problemY + 75}
          x2={solutionX - 60}
          y2={solutionY + 75}
          startFrame={100}
          color={COLORS.danger}
          strokeWidth={8}
          dashed={false}
        />

        {/* Solution Node */}
        <div
          style={{
            position: "absolute",
            left: solutionX,
            top: solutionY,
            background: COLORS.surface,
            border: `4px solid ${COLORS.success}`,
            borderRadius: 24,
            padding: "40px 60px",
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
            ...enterSolution.style,
          }}
        >
          <div style={{ fontSize: 65, fontWeight: 700, color: COLORS.success }}>
            Solution
          </div>
        </div>
      </div>

      {/* PHASE 2 & 3: Sara's Spatial Processing */}
      <div
        style={{
          position: "absolute",
          left: frame < 520 ? solutionX : saraMove.x,
          top: frame < 520 ? 1300 : saraMove.y,
          transform:
            frame < 520
              ? enterSaraInitial.style.transform
              : "translate(-50%, -50%)",
          opacity: enterSaraInitial.style.opacity,
          zIndex: 100,
        }}
      >
        <div
          style={{
            background: COLORS.surface,
            border: `4px solid ${COLORS.primary}`,
            borderRadius: 32,
            padding: "50px 80px",
            boxShadow: "0 40px 100px rgba(15,23,42,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 400,
          }}
        >
          <PersonFigure x={0} y={0} scale={1.3} color={COLORS.primary} />
          <div
            style={{
              fontSize: 55,
              fontWeight: 700,
              color: COLORS.darkText,
              marginTop: 180,
            }}
          >
            Sara
          </div>
        </div>
      </div>

      {/* PHASE 4: Core Enterprise Layout Reveal */}
      {frame >= 520 && (
        <>
          {/* Top Line to Shop Structure */}
          <AnimatedLine
            x1={1920}
            y1={1000}
            x2={1920}
            y2={600}
            startFrame={lineShop}
            color={COLORS.muted}
            strokeWidth={6}
          />

          <div
            style={{
              position: "absolute",
              left: 1920,
              top: 420,
              transform: "translateX(-50%)",
              background: COLORS.surface,
              borderRadius: 28,
              padding: "40px 70px",
              border: `2px solid ${COLORS.border}`,
              boxShadow: "0 30px 80px rgba(15,23,42,0.06)",
              textAlign: "center",
              ...enterShop.style,
            }}
          >
            <div
              style={{ fontSize: 50, fontWeight: 700, color: COLORS.bodyText }}
            >
              Repair Shop
            </div>

            {/* Embedded Native Vector Assets */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 40,
                marginTop: 25,
                ...enterIcons.style,
              }}
            >
              {/* Mobile Device Representation */}
              <svg width="60" height="90" viewBox="0 0 60 90">
                <rect
                  x="5"
                  y="5"
                  width="50"
                  height="80"
                  rx="8"
                  fill="none"
                  stroke={COLORS.muted}
                  strokeWidth="6"
                />
                <circle cx="30" cy="73" r="5" fill={COLORS.muted} />
              </svg>
              {/* Laptop Structural Representation */}
              <svg width="100" height="90" viewBox="0 0 100 90">
                <rect
                  x="15"
                  y="15"
                  width="70"
                  height="45"
                  rx="4"
                  fill="none"
                  stroke={COLORS.muted}
                  strokeWidth="6"
                />
                <line
                  x1="5"
                  y1="67"
                  x2="95"
                  y2="67"
                  stroke={COLORS.muted}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Right Line to Technicians */}
          <AnimatedLine
            x1={2150}
            y1={1200}
            x2={2750}
            y2={1200}
            startFrame={lineTech}
            color={COLORS.muted}
            strokeWidth={6}
          />

          <div
            style={{
              position: "absolute",
              left: 2800,
              top: 1040,
              display: "flex",
              gap: 80,
              background: COLORS.surface,
              borderRadius: 28,
              padding: "40px 60px",
              border: `2px solid ${COLORS.border}`,
              boxShadow: "0 30px 80px rgba(15,23,42,0.06)",
              ...enterTechs.style,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <PersonFigure x={0} y={0} scale={0.9} color={COLORS.muted} />
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: COLORS.muted,
                  marginTop: 150,
                }}
              >
                Technician 1
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <PersonFigure x={0} y={0} scale={0.9} color={COLORS.muted} />
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: COLORS.muted,
                  marginTop: 150,
                }}
              >
                Technician 2
              </div>
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #3 — Traditional Workflow (Sticky Notes System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene3 = () => {
  const frame = useCurrentFrame();

  // Entrances
  const enterCustomer = useEnter(20);
  const enterDeviceInitial = useEnter(40);
  const enterSara = useEnter(140);
  const enterSticky = useEnter(520);
  const enterShelf = useEnter(880);

  // Message overlays above Sara
  const enterChecking = useEnter(260);
  const enterDelivery = useEnter(380);

  // Structural Positions
  const customerX = 500;
  const customerY = 1100;
  const saraX = 1600;
  const saraY = 1100;
  const stickyX = 2700;
  const stickyY = 1000;

  // Device movement from Customer to Sara
  const deviceToSara = useMoveBetween(
    customerX + 160,
    customerY - 40,
    saraX + 60,
    saraY - 60,
    180,
  );

  // Device position tracking logic based on timeline anchors
  let deviceX = customerX + 160;
  let deviceY = customerY - 40;
  let deviceScale = 1;

  if (frame >= 180 && frame < 750) {
    deviceX = deviceToSara.x;
    deviceY = deviceToSara.y;
  }

  // Phase transition: Move device to sticky note area & update bounds
  const deviceToSticky = useMoveBetween(
    saraX + 60,
    saraY - 60,
    2100,
    1100,
    750,
  );
  const stickyScaleDown = spring({
    frame: frame - 750,
    fps: 60,
    config: { damping: 18, stiffness: 80 },
  });

  if (frame >= 750) {
    deviceX = deviceToSticky.x;
    deviceY = deviceToSticky.y;
    deviceScale = interpolate(deviceToSticky.progress, [0, 1], [1, 2.5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // Isolation Fade out of Customer, Sara & Connectors
  const isolationExit = spring({
    frame: frame - 960,
    fps: 60,
    config: { damping: 20, stiffness: 90 },
  });
  const dynamicOpacity = interpolate(isolationExit, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global scene teardown exit
  const exitAll = useExit(1260);

  // Clamped scales for elements changing hierarchy dimensions
  const noteScale = interpolate(stickyScaleDown, [0, 1], [1, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const noteX = interpolate(stickyScaleDown, [0, 1], [stickyX, deviceX + 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const noteY = interpolate(stickyScaleDown, [0, 1], [stickyY, deviceY - 140], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[3],
        ...exitAll.style,
      }}
    >
      <SceneHeading title="Managing Repairs" />

      <AmbientBlob x={200} y={200} size={900} color={COLORS.cyan} phase={180} />
      <AmbientBlob
        x={3000}
        y={1400}
        size={800}
        color={COLORS.purple}
        phase={220}
      />

      {/* Background Shelf Layer */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 2400,
          height: 1000,
          background: COLORS.surface,
          border: `6px double ${COLORS.border}`,
          borderRadius: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 60,
          opacity: enterShelf.style.opacity,
          zIndex: 5,
        }}
      >
        <div
          style={{
            borderBottom: `8px solid ${COLORS.border}`,
            width: "100%",
            height: 200,
          }}
        />
        <div
          style={{
            borderBottom: `8px solid ${COLORS.border}`,
            width: "100%",
            height: 200,
          }}
        />
        <div
          style={{
            borderBottom: `8px solid ${COLORS.border}`,
            width: "100%",
            height: 200,
          }}
        />
      </div>

      {/* Disappearing Actor Infrastructure */}
      <div style={{ opacity: dynamicOpacity }}>
        {/* Customer Silhouette Setup */}
        <div style={enterCustomer.style}>
          <PersonFigure
            x={customerX}
            y={customerY}
            label="Customer"
            color={COLORS.muted}
            scale={1.2}
          />
        </div>

        {/* Dynamic workflow linking lines */}
        <AnimatedLine
          x1={customerX + 220}
          y1={customerY + 80}
          x2={saraX - 40}
          y2={saraY + 80}
          startFrame={100}
          color={COLORS.muted}
          strokeWidth={6}
        />

        {/* Sara Operational Target Frame */}
        <div style={enterSara.style}>
          <PersonFigure
            x={saraX}
            y={saraY}
            label="Sara"
            color={COLORS.primary}
            scale={1.2}
          />
        </div>

        {/* Real-time Checking & Delivery Indicators */}
        {frame >= 260 && frame < 380 && (
          <div
            style={{
              position: "absolute",
              left: saraX + 80,
              top: saraY - 180,
              transform: "translateX(-50%)",
              background: COLORS.warning,
              color: COLORS.darkText,
              padding: "20px 40px",
              borderRadius: 16,
              fontSize: 36,
              fontWeight: 700,
              boxShadow: "0 15px 40px rgba(0,0,0,0.05)",
              ...enterChecking.style,
            }}
          >
            checking
          </div>
        )}

        {frame >= 380 && frame < 520 && (
          <div
            style={{
              position: "absolute",
              left: saraX + 80,
              top: saraY - 180,
              transform: "translateX(-50%)",
              background: COLORS.success,
              color: COLORS.surface,
              padding: "20px 40px",
              borderRadius: 16,
              fontSize: 36,
              fontWeight: 700,
              boxShadow: "0 15px 40px rgba(0,0,0,0.05)",
              ...enterDelivery.style,
            }}
          >
            delivery date
          </div>
        )}

        <AnimatedLine
          x1={saraX + 220}
          y1={saraY + 80}
          x2={stickyX - 60}
          y2={stickyY + 150}
          startFrame={500}
          color={COLORS.muted}
          strokeWidth={6}
        />
      </div>

      {/* SYSTEM DEVICE COMPONENT */}
      <div
        style={{
          position: "absolute",
          left: deviceX,
          top: deviceY,
          transform: `scale(${deviceScale}) translate(-50%, -50%)`,
          zIndex: 50,
          opacity: enterDeviceInitial.style.opacity,
        }}
      >
        <svg width="100" height="160" viewBox="0 0 100 160">
          <rect
            x="5"
            y="5"
            width="90"
            height="150"
            rx="16"
            fill={COLORS.surface}
            stroke={COLORS.primary}
            strokeWidth="8"
          />
          <rect
            x="15"
            y="15"
            width="70"
            height="105"
            rx="6"
            fill={COLORS.chrome}
          />
          <circle cx="50" cy="138" r="8" fill={COLORS.primary} />
        </svg>
      </div>

      {/* DIEGETIC STICKY NOTE WIDGET */}
      <div
        style={{
          position: "absolute",
          left: noteX,
          top: noteY,
          transform: `scale(${noteScale})`,
          zIndex: 60,
          opacity: enterSticky.style.opacity,
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            background: "#FEF08A", // Pure sticky amber surface palette
            border: "2px solid #FEF08A",
            boxShadow: "0 25px 60px rgba(0,0,0,0.1)",
            padding: "40px",
            width: 500,
            height: 480,
            fontFamily: "Quicksand",
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              marginBottom: 25,
              color: COLORS.darkText,
            }}
          >
            Repair Details
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 15,
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.bodyText,
            }}
          >
            <div>• Name: Customer</div>
            <div>• Phone: 555-0199</div>
            <div>• Device ID: M-9042</div>
            <div>• Issue: Broken Screen</div>
            <div>• Info: Urgent Pickup</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #4 — Hand-off Cycle (Technician Repair Flow)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene4 = () => {
  const frame = useCurrentFrame();

  // Entrances
  const enterShelfItems = useEnter(10);
  const enterTech = useEnter(40);
  const enterSara = useEnter(60);
  const enterCustomer = useEnter(650);

  // Structural Positions
  const shelfX = 1000;
  const shelfY = 800;
  const techX = 2800;
  const techY = 1100;
  const saraX = 1600;
  const saraY = 1100;
  const customerX = 400;
  const customerY = 1100;

  // Step 1: Device moves from shelf to technician
  const deviceToTech = useMoveBetween(
    shelfX,
    shelfY,
    techX - 100,
    techY - 50,
    100,
  );

  // Step 2: Device moves from technician to Sara
  const deviceToSara = useMoveBetween(
    techX - 100,
    techY - 50,
    saraX + 80,
    saraY - 50,
    480,
  );

  // Step 3: Device moves from Sara to Customer
  const deviceToCustomer = useMoveBetween(
    saraX + 80,
    saraY - 50,
    customerX + 100,
    customerY - 50,
    720,
  );

  // Track current coordinate state
  let devX = shelfX;
  let devY = shelfY;
  if (frame >= 100 && frame < 480) {
    devX = deviceToTech.x;
    devY = deviceToTech.y;
  } else if (frame >= 480 && frame < 720) {
    devX = deviceToSara.x;
    devY = deviceToSara.y;
  } else if (frame >= 720) {
    devX = deviceToCustomer.x;
    devY = deviceToCustomer.y;
  }

  // Work status overlay logic
  const workPulse = useClickPulse(260);
  const completePulse = useClickPulse(380);

  // Global scene teardown exit
  const exitAll = useExit(900);

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[4],
        ...exitAll.style,
      }}
    >
      <SceneHeading title="Repair Pipeline" />

      <AmbientBlob x={2500} y={300} size={800} color={COLORS.rose} phase={10} />
      <AmbientBlob
        x={600}
        y={1300}
        size={700}
        color={COLORS.primary}
        phase={85}
      />

      {/* Persistent Legacy Storage Grid Infrastructure */}
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 350,
          width: 800,
          height: 600,
          background: COLORS.surface,
          border: `4px solid ${COLORS.border}`,
          borderRadius: 24,
          padding: 40,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 30,
          opacity: 0.4,
        }}
      >
        {/* Static Background Devices representing inventory load */}
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            style={{
              width: 70,
              height: 110,
              background: COLORS.chrome,
              borderRadius: 8,
              border: `2px solid ${COLORS.muted}`,
            }}
          />
        ))}
      </div>

      {/* Core Actors Setup */}
      <div style={enterSara.style}>
        <PersonFigure
          x={saraX}
          y={saraY}
          label="Sara"
          color={COLORS.primary}
          scale={1.1}
        />
      </div>

      <div style={enterTech.style}>
        <PersonFigure
          x={techX}
          y={techY}
          label="Technician"
          color={COLORS.muted}
          scale={1.1}
        />
      </div>

      {frame >= 650 && (
        <div style={enterCustomer.style}>
          <PersonFigure
            x={customerX}
            y={customerY}
            label="Customer"
            color={COLORS.muted}
            scale={1.1}
          />
        </div>
      )}

      {/* Process Connectors Layout */}
      <AnimatedLine
        x1={shelfX}
        y1={shelfY + 100}
        x2={techX - 150}
        y2={techY + 50}
        startFrame={80}
        color={COLORS.muted}
        strokeWidth={5}
      />
      <AnimatedLine
        x1={techX - 50}
        y1={techY - 100}
        x2={saraX + 150}
        y2={saraY - 50}
        startFrame={460}
        color={COLORS.primary}
        strokeWidth={5}
      />
      <AnimatedLine
        x1={saraX - 50}
        y1={saraY + 50}
        x2={customerX + 150}
        y2={customerY + 50}
        startFrame={700}
        color={COLORS.success}
        strokeWidth={5}
      />

      {/* State Badge Feedbacks */}
      {frame >= 250 && frame < 380 && (
        <div
          style={{
            position: "absolute",
            left: techX - 250,
            top: techY - 120,
            background: COLORS.warning,
            color: COLORS.darkText,
            padding: "15px 35px",
            borderRadius: 12,
            fontSize: 32,
            fontWeight: 700,
            transform: `scale(${workPulse.pressScale})`,
            boxShadow: "0 15px 40px rgba(0,0,0,0.05)",
          }}
        >
          working...
        </div>
      )}

      {frame >= 380 && frame < 480 && (
        <div
          style={{
            position: "absolute",
            left: techX - 250,
            top: techY - 120,
            background: COLORS.success,
            color: COLORS.surface,
            padding: "15px 35px",
            borderRadius: 12,
            fontSize: 32,
            fontWeight: 700,
            transform: `scale(${completePulse.pressScale})`,
            boxShadow: "0 15px 40px rgba(0,0,0,0.05)",
          }}
        >
          completed
        </div>
      )}

      {/* Active Processing Asset & Floating Sticky Attachment */}
      <div
        style={{
          position: "absolute",
          left: devX,
          top: devY,
          zIndex: 200,
          opacity: enterShelfItems.style.opacity,
        }}
      >
        <svg width="80" height="130" viewBox="0 0 100 160">
          <rect
            x="5"
            y="5"
            width="90"
            height="150"
            rx="16"
            fill={COLORS.surface}
            stroke={COLORS.primary}
            strokeWidth="8"
          />
          <rect
            x="15"
            y="15"
            width="70"
            height="105"
            rx="6"
            fill={COLORS.chrome}
          />
          <circle cx="50" cy="138" r="8" fill={COLORS.primary} />
        </svg>

        {/* Sticky note hides explicitly when passing to customer */}
        {frame < 720 && (
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 50,
              height: 50,
              background: "#FEF08A",
              border: "1px solid #EAB308",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #5 — Mid-point Pivot (Everything is Smooth?)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene5 = () => {
  const enterQuestion = useEnter(20);
  const enterAnswer = useEnter(140);
  const exitAll = useExit(260);

  const driftX = useAmbientFloat(15, 150, 0);
  const driftY = useAmbientFloat(10, 120, 45);

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[5],
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        ...exitAll.style,
      }}
    >
      <SceneHeading title="Everything is smooth, right?" />

      <AmbientBlob x={1000} y={600} size={900} color={COLORS.cyan} phase={60} />
      <AmbientBlob
        x={2200}
        y={1000}
        size={800}
        color={COLORS.warning}
        phase={120}
      />

      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 50,
          transform: `translate(${driftX}px, ${driftY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            color: COLORS.darkText,
            letterSpacing: "-2px",
            ...enterQuestion.style,
          }}
        >
          Everything is smooth, right?
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: COLORS.danger,
            ...enterAnswer.style,
          }}
        >
          Yes, at first.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #6 — Scaling Failure (System Begins to Fail)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene6 = () => {
  const frame = useCurrentFrame();

  // Entrances
  const enterSara = useEnter(10);

  // Rapid staggered influx of overwhelming customers
  const enterCust1 = useEnter(40);
  const enterCust2 = useEnter(80);
  const enterCust3 = useEnter(120);
  const enterCust4 = useEnter(160);

  // Failure / Error state alerts trigger
  const enterFailureAlert = useEnter(240, { damping: 10, stiffness: 120 });
  const pulseError = useClickPulse(280);

  // Structural coordinate grid layout for 4K canvas scaling
  const centerX = 1920;
  const centerY = 1150;

  const c1X = 450;
  const c1Y = 750;
  const c2X = 550;
  const c2Y = 1500;
  const c3X = 3150;
  const c3Y = 750;
  const c4X = 3050;
  const c4Y = 1500;

  // Ambient chaos tracking
  const heavyDrift = useAmbientFloat(30, 80, 0);

  // Global exit sequence
  const exitAll = useExit(480);

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[0],
        ...exitAll.style,
      }}
    >
      <FontInjection />
      <SceneHeading title="System Begins to Fail" />

      {/* Chaotic background tracking elements */}
      <AmbientBlob
        x={800}
        y={400}
        size={1000}
        color={COLORS.danger}
        phase={10}
      />
      <AmbientBlob
        x={2600}
        y={1200}
        size={900}
        color={COLORS.warning}
        phase={50}
      />

      {/* Core Target Actor: Sara */}
      <div style={enterSara.style}>
        <div
          style={{
            position: "absolute",
            left: centerX,
            top: centerY,
            transform: "translate(-50%, -50%)",
            background: COLORS.surface,
            border: `4px solid ${COLORS.primary}`,
            borderRadius: 32,
            padding: "50px 80px",
            boxShadow: "0 40px 100px rgba(15,23,42,0.1)",
            zIndex: 10,
          }}
        >
          <PersonFigure x={0} y={0} scale={1.2} color={COLORS.primary} />
          <div
            style={{
              fontSize: 45,
              fontWeight: 700,
              color: COLORS.darkText,
              marginTop: 160,
              textAlign: "center",
            }}
          >
            Sara
          </div>
        </div>
      </div>

      {/* Overwhelming Customer Network Layout */}
      <div style={enterCust1.style}>
        <PersonFigure
          x={c1X}
          y={c1Y}
          label="Customer 1"
          color={COLORS.muted}
          scale={1.1}
        />
        <AnimatedLine
          x1={c1X + 150}
          y1={c1Y + 80}
          x2={centerX - 250}
          y2={centerY - 100}
          startFrame={50}
          color={COLORS.danger}
          strokeWidth={6}
        />
      </div>

      <div style={enterCust2.style}>
        <PersonFigure
          x={c2X}
          y={c2Y}
          label="Customer 2"
          color={COLORS.muted}
          scale={1.1}
        />
        <AnimatedLine
          x1={c2X + 150}
          y1={c2Y + 80}
          x2={centerX - 250}
          y2={centerY + 100}
          startFrame={90}
          color={COLORS.danger}
          strokeWidth={6}
        />
      </div>

      <div style={enterCust3.style}>
        <PersonFigure
          x={c3X}
          y={c3Y}
          label="Customer 3"
          color={COLORS.muted}
          scale={1.1}
        />
        <AnimatedLine
          x1={c3X - 50}
          y1={c3Y + 80}
          x2={centerX + 250}
          y2={centerY - 100}
          startFrame={130}
          color={COLORS.danger}
          strokeWidth={6}
        />
      </div>

      <div style={enterCust4.style}>
        <PersonFigure
          x={c4X}
          y={c4Y}
          label="Customer 4"
          color={COLORS.muted}
          scale={1.1}
        />
        <AnimatedLine
          x1={c4X - 50}
          y1={c4Y + 80}
          x2={centerX + 250}
          y2={centerY + 100}
          startFrame={170}
          color={COLORS.danger}
          strokeWidth={6}
        />
      </div>

      {/* Cascading Device Icons linked to Incoming Load */}
      {[
        { x: c1X + 220, y: c1Y - 40, f: 50 },
        { x: c2X + 220, y: c2Y - 40, f: 90 },
        { x: c3X - 100, y: c3Y - 40, f: 130 },
        { x: c4X - 100, y: c4Y - 40, f: 170 },
      ].map((dev, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: dev.x,
            top: dev.y + (frame > 240 ? heavyDrift * 0.5 : 0),
            opacity: frame >= dev.f ? 1 : 0,
            transition: "opacity 0.2s ease-in",
            zIndex: 15,
          }}
        >
          <svg width="70" height="110" viewBox="0 0 100 160">
            <rect
              x="5"
              y="5"
              width="90"
              height="150"
              rx="16"
              fill={COLORS.surface}
              stroke={COLORS.danger}
              strokeWidth="8"
            />
            <rect
              x="20"
              y="20"
              width="30"
              height="30"
              fill="#FEF08A"
              stroke="#EAB308"
              strokeWidth="2"
            />{" "}
            {/* Sticky note thumbnail */}
          </svg>
        </div>
      ))}

      {/* Global Failure Overlay Notification */}
      {frame >= 240 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "350px",
            transform: `translate(-50%, -50%) scale(${pulseError.pressScale})`,
            background: COLORS.danger,
            border: `6px solid ${COLORS.surface}`,
            borderRadius: 24,
            padding: "35px 80px",
            boxShadow: "0 40px 90px rgba(239,68,68,0.3)",
            zIndex: 100,
            ...enterFailureAlert.style,
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: COLORS.surface,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            System Failure
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #7 — Pain Points (Tracking Fails)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene7 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered component entrances
  const enterChaosGrid = useEnter(10);
  const enterProblem1 = useEnter(140);
  const enterProblem2 = useEnter(280);
  const enterProblem3 = useEnter(420);
  const enterChartWidget = useEnter(580);

  // Satisfaction drop chart animation progress
  const chartSpring = spring({
    frame: frame - 640,
    fps,
    config: { damping: 22, stiffness: 40 },
  });
  const chartProgress = interpolate(chartSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Chaos jitter simulation for unstable workflow representation
  const chaosJitter = useAmbientFloat(8, 30, 0);

  // Global scene teardown
  const exitAll = useExit(1050);

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[1],
        ...exitAll.style,
      }}
    >
      <FontInjection />
      <SceneHeading title="Tracking Progress" />

      <AmbientBlob
        x={400}
        y={1200}
        size={900}
        color={COLORS.danger}
        phase={30}
      />
      <AmbientBlob
        x={2800}
        y={400}
        size={800}
        color={COLORS.warning}
        phase={75}
      />

      {/* Overloaded Grid Structure Backdrop */}
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 400,
          width: 1400,
          height: 1400,
          background: COLORS.surface,
          border: `4px dashed ${COLORS.danger}`,
          borderRadius: 32,
          padding: 60,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 40,
          transform: `rotate(-2deg) translateY(${chaosJitter * 0.3}px)`,
          opacity: interpolate(enterChaosGrid.value, [0, 1], [0, 0.25]),
        }}
      >
        {[...Array(16)].map((_, idx) => (
          <div
            key={idx}
            style={{
              background: COLORS.danger,
              borderRadius: 16,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 30,
                height: 30,
                background: "#FEF08A",
              }}
            />
          </div>
        ))}
      </div>

      {/* Cascading Problem Statements Layout */}
      <div
        style={{
          position: "absolute",
          left: 1900,
          top: 400,
          display: "flex",
          flexDirection: "column",
          gap: 45,
          zIndex: 50,
        }}
      >
        <div
          style={{
            background: COLORS.surface,
            borderLeft: `12px solid ${COLORS.danger}`,
            padding: "35px 50px",
            borderRadius: "0 24px 24px 0",
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.darkText,
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
            ...enterProblem1.style,
          }}
        >
          Difficult to track
        </div>

        <div
          style={{
            background: COLORS.surface,
            borderLeft: `12px solid ${COLORS.danger}`,
            padding: "35px 50px",
            borderRadius: "0 24px 24px 0",
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.darkText,
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
            ...enterProblem2.style,
          }}
        >
          Results in errors
        </div>

        <div
          style={{
            background: COLORS.surface,
            borderLeft: `12px solid ${COLORS.danger}`,
            padding: "35px 50px",
            borderRadius: "0 24px 24px 0",
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.darkText,
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
            ...enterProblem3.style,
          }}
        >
          Lack of clear communication
        </div>
      </div>

      {/* Customer Satisfaction Drop Chart Widget */}
      <div
        style={{
          position: "absolute",
          left: 1900,
          top: 1050,
          width: 1500,
          height: 700,
          background: COLORS.surface,
          border: `2px solid ${COLORS.border}`,
          borderRadius: 32,
          padding: 60,
          boxShadow: "0 40px 100px rgba(0,0,0,0.05)",
          zIndex: 40,
          ...enterChartWidget.style,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.muted,
            marginBottom: 40,
          }}
        >
          Customer Satisfaction
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: 420,
            borderLeft: `4px solid ${COLORS.border}`,
            borderBottom: `4px solid ${COLORS.border}`,
          }}
        >
          <svg width="1380" height="420" style={{ overflow: "visible" }}>
            {/* Trendline dropping configuration */}
            <line
              x1="50"
              y1="60"
              x2={50 + 1200 * chartProgress}
              y2={60 + 300 * chartProgress}
              stroke={COLORS.danger}
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Initial starting metric node */}
            <circle cx="50" cy="60" r="16" fill={COLORS.success} />

            {/* Dynamic dropping termination node */}
            {frame >= 640 && (
              <circle
                cx={50 + 1200 * chartProgress}
                cy={60 + 300 * chartProgress}
                r="20"
                fill={COLORS.danger}
              />
            )}
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #8 — Paradigm Shift (Time to Change)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene8 = () => {
  const frame = useCurrentFrame();

  // Entrances
  const enterText = useEnter(20);
  const enterUIPreview = useEnter(100);

  // Core background UI mockup dimensions for 4K canvas scale
  const windowWidth = 1600;
  const windowHeight = 1000;

  // Gentle layout structural animation paths
  const uiFloatY = useAmbientFloat(15, 140, 0);

  // Global scene teardown exit
  const exitAll = useExit(230);

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[2],
        ...exitAll.style,
      }}
    >
      <FontInjection />
      <SceneHeading title="Time to Change" />

      {/* Ambient background accent fields */}
      <AmbientBlob
        x={500}
        y={400}
        size={900}
        color={COLORS.primary}
        phase={0}
      />
      <AmbientBlob
        x={2600}
        y={1200}
        size={800}
        color={COLORS.cyan}
        phase={60}
      />

      {/* Main Structural Center Column Layout */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 80,
          marginTop: 100,
        }}
      >
        {/* High-Contrast Paradigm Statement */}
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            color: COLORS.darkText,
            letterSpacing: "-2px",
            textAlign: "center",
            ...enterText.style,
          }}
        >
          Time to change
        </div>

        {/* Abstract App Shell Infrastructure Wireframe Layout */}
        <div
          style={{
            width: windowWidth,
            height: windowHeight,
            background: COLORS.surface,
            border: `4px solid ${COLORS.border}`,
            borderRadius: 32,
            boxShadow: "0 50px 120px rgba(15,23,42,0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transform: `translateY(${uiFloatY}px) ${enterUIPreview.style.transform.replace(/scale\([^)]+\)/, "")}`,
            opacity: enterUIPreview.style.opacity,
          }}
        >
          {/* Window Header Utility Bar */}
          <div
            style={{
              height: 100,
              background: COLORS.chrome,
              borderBottom: `3px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 40px",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: COLORS.danger,
              }}
            />
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: COLORS.warning,
              }}
            />
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: COLORS.success,
              }}
            />
          </div>

          {/* Wireframe Workspace Columns Split */}
          <div style={{ display: "flex", flex: 1, padding: 50, gap: 50 }}>
            {/* Sidebar Structural Node Preview */}
            <div
              style={{
                width: 380,
                background: COLORS.chrome,
                borderRadius: 20,
                padding: 30,
                display: "flex",
                flexDirection: "column",
                gap: 25,
              }}
            >
              <div
                style={{
                  height: 50,
                  background: COLORS.border,
                  borderRadius: 10,
                  width: "80%",
                }}
              />
              <div
                style={{
                  height: 40,
                  background: COLORS.border,
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  height: 40,
                  background: COLORS.border,
                  borderRadius: 8,
                }}
              />
              <div
                style={{
                  height: 40,
                  background: COLORS.border,
                  borderRadius: 8,
                }}
              />
            </div>

            {/* Main Content Dynamic Node Area Wireframe */}
            <div
              style={{
                flex: 1,
                border: `3px dashed ${COLORS.primary}`,
                borderRadius: 24,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Central Abstract Pulse Core Indicator Element */}
              <svg width="160" height="160" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke={COLORS.primary}
                  strokeWidth="6"
                  strokeDasharray="12 8"
                />
                <path
                  d="M35 50 L45 60 L65 40"
                  fill="none"
                  stroke={COLORS.primary}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #9 — The App Solution (Real-time Status Sync)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene9 = () => {
  const frame = useCurrentFrame();

  // Entrances
  const enterSara = useEnter(20);
  const enterDevice = useEnter(60);
  const enterTechs = useEnter(100);

  // Structural Positions
  const saraX = 400;
  const saraY = 1000;
  const deviceX = 1660; // Centered horizontal layout anchor point
  const deviceY = 580;
  const techX = 2800;
  const techY = 1000;

  // Real-Time Dynamic Data Packet Cross-Flow Animation
  const packet1 = useMoveBetween(
    saraX + 300,
    saraY + 100,
    deviceX + 50,
    deviceY + 400,
    250,
  );
  const packet2 = useMoveBetween(
    deviceX + 550,
    deviceY + 400,
    techX,
    techY + 100,
    500,
  );
  const packet3 = useMoveBetween(
    techX,
    techY + 100,
    deviceX + 550,
    deviceY + 500,
    720,
  );
  const packet4 = useMoveBetween(
    deviceX + 50,
    deviceY + 500,
    saraX + 300,
    saraY + 150,
    920,
  );

  // Dynamic UI Application Status Transitions
  let currentStatus = "Assigned";
  let statusColor = COLORS.warning;
  if (frame >= 580 && frame < 780) {
    currentStatus = "In Progress";
    statusColor = COLORS.primary;
  } else if (frame >= 780) {
    currentStatus = "Completed";
    statusColor = COLORS.success;
  }

  // Global scene teardown
  const exitAll = useExit(1080);

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[3],
        ...exitAll.style,
      }}
    >
      <FontInjection />
      <SceneHeading title="The App Solution" />

      <AmbientBlob
        x={300}
        y={400}
        size={900}
        color={COLORS.primary}
        phase={15}
      />
      <AmbientBlob
        x={3000}
        y={1300}
        size={800}
        color={COLORS.success}
        phase={90}
      />

      {/* Actor: Sara Node Card */}
      <div style={enterSara.style}>
        <div
          style={{
            position: "absolute",
            left: saraX,
            top: saraY,
            background: COLORS.surface,
            border: `4px solid ${COLORS.primary}`,
            borderRadius: 28,
            padding: "40px 60px",
            boxShadow: "0 30px 80px rgba(15,23,42,0.08)",
          }}
        >
          <PersonFigure x={0} y={0} scale={1.1} color={COLORS.primary} />
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: COLORS.darkText,
              marginTop: 150,
              textAlign: "center",
            }}
          >
            Sara
          </div>
        </div>
      </div>

      {/* Central Interactive Smartphone Device Mockup */}
      <div
        style={{
          position: "absolute",
          left: deviceX,
          top: deviceY,
          width: 600,
          height: 1040,
          background: COLORS.surface,
          border: `12px solid ${COLORS.darkText}`,
          borderRadius: 48,
          boxShadow: "0 60px 140px rgba(15,23,42,0.15)",
          padding: 40,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...enterDevice.style,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.darkText,
            marginBottom: 30,
            borderBottom: `3px solid ${COLORS.border}`,
            paddingBottom: 20,
          }}
        >
          Repair Log
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}
        >
          <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.muted }}>
            ID: M-9042
          </div>
          <div
            style={{ fontSize: 36, fontWeight: 700, color: COLORS.bodyText }}
          >
            Device: iPhone 13
          </div>

          <div
            style={{
              marginTop: 40,
              padding: "25px 40px",
              borderRadius: 16,
              background: statusColor,
              color:
                statusColor === COLORS.warning
                  ? COLORS.darkText
                  : COLORS.surface,
              fontSize: 38,
              fontWeight: 800,
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
          >
            {currentStatus}
          </div>
        </div>
      </div>

      {/* Actor: Technicians Cluster Card */}
      <div style={enterTechs.style}>
        <div
          style={{
            position: "absolute",
            left: techX,
            top: techY,
            display: "flex",
            gap: 50,
            background: COLORS.surface,
            borderRadius: 28,
            padding: "40px 50px",
            border: `2px solid ${COLORS.border}`,
            boxShadow: "0 30px 80px rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <PersonFigure x={0} y={0} scale={0.9} color={COLORS.muted} />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: COLORS.muted,
                marginTop: 130,
              }}
            >
              Tech 1
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <PersonFigure x={0} y={0} scale={0.9} color={COLORS.muted} />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: COLORS.muted,
                marginTop: 130,
              }}
            >
              Tech 2
            </div>
          </div>
        </div>
      </div>

      {/* Network Processing Flow Path Links */}
      <AnimatedLine
        x1={saraX + 380}
        y1={saraY + 150}
        x2={deviceX}
        y2={deviceY + 450}
        startFrame={200}
        color={COLORS.primary}
        strokeWidth={6}
      />
      <AnimatedLine
        x1={deviceX + 600}
        y1={deviceY + 450}
        x2={techX}
        y2={techY + 150}
        startFrame={450}
        color={COLORS.muted}
        strokeWidth={6}
      />

      {/* Dynamic Data Transmission Packets */}
      {frame >= 250 && frame < 350 && (
        <div
          style={{
            position: "absolute",
            left: packet1.x,
            top: packet1.y,
            width: 35,
            height: 35,
            background: COLORS.primary,
            borderRadius: "50%",
            zIndex: 100,
          }}
        />
      )}
      {frame >= 500 && frame < 600 && (
        <div
          style={{
            position: "absolute",
            left: packet2.x,
            top: packet2.y,
            width: 35,
            height: 35,
            background: COLORS.warning,
            borderRadius: "50%",
            zIndex: 100,
          }}
        />
      )}
      {frame >= 720 && frame < 820 && (
        <div
          style={{
            position: "absolute",
            left: packet3.x,
            top: packet3.y,
            width: 35,
            height: 35,
            background: COLORS.success,
            borderRadius: "50%",
            zIndex: 100,
          }}
        />
      )}
      {frame >= 920 && frame < 1020 && (
        <div
          style={{
            position: "absolute",
            left: packet4.x,
            top: packet4.y,
            width: 35,
            height: 35,
            background: COLORS.success,
            borderRadius: "50%",
            zIndex: 100,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAP #10 — Outro & Choices (Many Ways to Build)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Scene10 = () => {
  const frame = useCurrentFrame();

  // Entrances
  const enterIntroText = useEnter(20);
  const enterGraphics = useEnter(140);
  const enterQuestionText = useEnter(420);
  const enterNextVideoText = useEnter(680);

  // Structural positions for 4K canvas branches
  const centerX = 1920;
  const centerY = 1100;

  // Global scene teardown exit
  const exitAll = useExit(1360);

  return (
    <AbsoluteFill
      style={{
        background: BG_GRADIENTS[5],
        ...exitAll.style,
      }}
    >
      <FontInjection />
      <SceneHeading title="Choosing an Approach" />

      <AmbientBlob
        x={600}
        y={500}
        size={1000}
        color={COLORS.purple}
        phase={20}
      />
      <AmbientBlob
        x={2800}
        y={1300}
        size={900}
        color={COLORS.cyan}
        phase={80}
      />

      {/* Main Structural Layout Core Wrapper */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 120,
          marginTop: 120,
        }}
      >
        {/* Step 1: Broad Abstract Statement */}
        {frame < 420 && (
          <div
            style={{
              fontSize: 130,
              fontWeight: 800,
              color: COLORS.darkText,
              textAlign: "center",
              ...enterIntroText.style,
            }}
          >
            Many ways to build applications
          </div>
        )}

        {/* Step 2: High-contrast Branch Outro Query */}
        {frame >= 420 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 40,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 140,
                fontWeight: 800,
                color: COLORS.primary,
                ...enterQuestionText.style,
              }}
            >
              Which approach should we choose?
            </div>
            <div
              style={{
                fontSize: 75,
                fontWeight: 600,
                color: COLORS.muted,
                ...enterNextVideoText.style,
              }}
            >
              We will see in the next video...
            </div>
          </div>
        )}

        {/* Abstract Architectural Choice Framework Representation (No Text Jargon labels) */}
        <div
          style={{
            width: 1800,
            height: 600,
            position: "relative",
            ...enterGraphics.style,
          }}
        >
          {/* Branch Track 1 (Left Abstract UI Matrix Block) */}
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 150,
              width: 320,
              height: 320,
              background: COLORS.surface,
              border: `6px solid ${COLORS.primary}`,
              borderRadius: 24,
              boxShadow: "0 30px 70px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="140" height="140" viewBox="0 0 100 100">
              <rect
                x="15"
                y="15"
                width="30"
                height="30"
                rx="4"
                fill={COLORS.primary}
              />
              <rect
                x="55"
                y="15"
                width="30"
                height="30"
                rx="4"
                fill={COLORS.primary}
              />
              <rect
                x="15"
                y="55"
                width="30"
                height="30"
                rx="4"
                fill={COLORS.primary}
              />
              <rect
                x="55"
                y="55"
                width="30"
                height="30"
                rx="4"
                fill={COLORS.chrome}
              />
            </svg>
          </div>

          {/* Branch Track 2 (Center Abstract Engineering Framework Wire) */}
          <div
            style={{
              position: "absolute",
              left: 740,
              top: 150,
              width: 320,
              height: 320,
              background: COLORS.surface,
              border: `6px solid ${COLORS.purple}`,
              borderRadius: 24,
              boxShadow: "0 30px 70px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="140" height="140" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke={COLORS.purple}
                strokeWidth="8"
              />
              <line
                x1="20"
                y1="50"
                x2="80"
                y2="50"
                stroke={COLORS.purple}
                strokeWidth="8"
              />
              <line
                x1="50"
                y1="20"
                x2="50"
                y2="80"
                stroke={COLORS.purple}
                strokeWidth="8"
              />
            </svg>
          </div>

          {/* Branch Track 3 (Right Abstract Structural Flow Stack) */}
          <div
            style={{
              position: "absolute",
              left: 1280,
              top: 150,
              width: 320,
              height: 320,
              background: COLORS.surface,
              border: `6px solid ${COLORS.success}`,
              borderRadius: 24,
              boxShadow: "0 30px 70px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="140" height="140" viewBox="0 0 100 100">
              <path
                d="M20 30 L50 15 L80 30 L50 45 Z"
                fill="none"
                stroke={COLORS.success}
                strokeWidth="6"
              />
              <path
                d="M20 55 L50 40 L80 55 L50 70 Z"
                fill="none"
                stroke={COLORS.success}
                strokeWidth="6"
              />
              <path
                d="M20 80 L50 65 L80 80 L50 95 Z"
                fill="none"
                stroke={COLORS.success}
                strokeWidth="6"
              />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIMELINE MATRIX CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WELCOME_DUR = 300;
const S1_DUR = 372;
const S2_DUR = 1008;
const S3_DUR = 1320;
const S4_DUR = 960;
const S5_DUR = 300;
const S6_DUR = 540;
const S7_DUR = 1110;
const S8_DUR = 270;
const S9_DUR = 1152;
const S10_DUR = 1428;

const S1_START = WELCOME_DUR;
const S2_START = S1_START + S1_DUR;
const S3_START = S2_START + S2_DUR;
const S4_START = S3_START + S3_DUR;
const S5_START = S4_START + S4_DUR;
const S6_START = S5_START + S5_DUR;
const S7_START = S6_START + S6_DUR;
const S8_START = S7_START + S7_DUR;
const S9_START = S8_START + S8_DUR;
const S10_START = S9_START + S9_DUR;

const TOTAL_DURATION = S10_START + S10_DUR;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE MAIN VIDEO COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MainVideo = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.surface }}>
      <FontInjection />
      <Html5Audio src={staticFile("hi.wav")} />

      <Sequence from={0} durationInFrames={WELCOME_DUR}>
        <WelcomeScene />
      </Sequence>

      <Sequence from={S1_START} durationInFrames={S1_DUR}>
        <Scene1 />
      </Sequence>

      <Sequence from={S2_START} durationInFrames={S2_DUR}>
        <Scene2 label="MAP #2 — Context & Team (Sara's Shop Intro)" />
      </Sequence>

      <Sequence from={S3_START} durationInFrames={S3_DUR}>
        <Scene3 label="MAP #3 — Traditional Workflow (Sticky Notes System)" />
      </Sequence>

      <Sequence from={S4_START} durationInFrames={S4_DUR}>
        <Scene4 label="MAP #4 — Hand-off Cycle (Technician Repair Flow)" />
      </Sequence>

      <Sequence from={S5_START} durationInFrames={S5_DUR}>
        <Scene5 label="MAP #5 — Mid-point Pivot (Everything is Smooth?)" />
      </Sequence>

      <Sequence from={S6_START} durationInFrames={S6_DUR}>
        <Scene6 label="MAP #6 — Scaling Failure (Shop Becomes Successful)" />
      </Sequence>

      <Sequence from={S7_START} durationInFrames={S7_DUR}>
        <Scene7 label="MAP #7 — Pain Points (System Tracking Fails)" />
      </Sequence>

      <Sequence from={S8_START} durationInFrames={S8_DUR}>
        <Scene8 label="MAP #8 — Paradigm Shift (Time to Change)" />
      </Sequence>

      <Sequence from={S9_START} durationInFrames={S9_DUR}>
        <Scene9 label="MAP #9 — The App Solution (Real-time Status Sync)" />
      </Sequence>

      <Sequence from={S10_START} durationInFrames={S10_DUR}>
        <Scene10 label="MAP #10 — Outro & Approach Comparison Blueprint" />
      </Sequence>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPOSITION CONFIGURATION REGISTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RemotionRoot = () => (
  <Composition
    id="Main"
    component={MainVideo}
    durationInFrames={TOTAL_DURATION}
    fps={60}
    width={3840}
    height={2160}
  />
);

registerRoot(RemotionRoot);
