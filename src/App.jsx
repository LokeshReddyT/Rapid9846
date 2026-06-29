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
  bg: "#080C14",
  cardBg: "#111827",
  cardBorder: "#1F2D45",
  textPrimary: "#F2F6FF",
  textSecondary: "#A0AEC0",
  accentBlue: "#00E5FF",
  accentGreen: "#00E676",
  accentAmber: "#FFB300",
};

const FPS = 60;
const CANVAS_WIDTH = 3840;
const CANVAS_HEIGHT = 2160;

// ── 2. SHARED COMPONENTS ────────────────────────────────────────────────────
const period = (frame, seconds) => (frame / FPS) * ((2 * Math.PI) / seconds);

const Badge = ({ label, color, style }) => (
  <div
    style={{
      backgroundColor: `${color}22`,
      border: `2px solid ${color}`,
      color: color,
      padding: "16px 40px",
      borderRadius: 9999,
      fontSize: 40,
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {label}
  </div>
);

const Gear = ({ size, color, rotation = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <path
      fill={color}
      d="M85.4,56.7c0.2-2.2,0.3-4.4,0.3-6.7c0-2.3-0.1-4.5-0.3-6.7l11.4-8.9c1-0.8,1.3-2.3,0.6-3.5l-10.8-18.7 c-0.6-1.1-2-1.6-3.2-1.1l-13.4,5.4c-2.8-2.1-5.8-4-9-5.3L58.9,3.5C58.7,2.2,57.6,1.2,56.3,1.2H34.6c-1.3,0-2.4,1-2.6,2.3L30,17.2 c-3.2,1.4-6.2,3.2-9,5.3l-13.4-5.4c-1.2-0.5-2.6-0.1-3.2,1.1L3.5,36.9c-0.6,1.2-0.4,2.7,0.6,3.5l11.4,8.9C15.3,51.5,15.2,53.7,15.2,56 c0,2.3,0.1,4.5,0.3,6.7l-11.4,8.9c-1,0.8-1.3,2.3-0.6,3.5l10.8,18.7c0.6,1.1,2,1.6,3.2,1.1l13.4-5.4c2.8,2.1,5.8,4,9,5.3l2.1,13.7 c0.2,1.3,1.3,2.3,2.6,2.3h21.7c1.3,0,2.4-1,2.6-2.3l2.1-13.7c3.2-1.4,6.2-3.2,9-5.3l13.4,5.4c1.2,0.5,2.6,0.1,3.2-1.1l10.8-18.7 c0.6-1.2,0.4-2.7-0.6-3.5L85.4,56.7z M45.4,67.8c-12,0-21.8-9.8-21.8-21.8c0-12,9.8-21.8,21.8-21.8c12,0,21.8,9.8,21.8,21.8 C67.2,58,57.4,67.8,45.4,67.8z"
    />
  </svg>
);

const PuzzlePiece = ({ color, style }) => (
  <svg width="240" height="240" viewBox="0 0 240 240" style={style}>
    <path
      fill={color}
      d="M190,70 h-30 c0,-22.1 -17.9,-40 -40,-40 c-22.1,0 -40,17.9 -40,40 h-30 c-11,0 -20,9 -20,20 v30 c-22.1,0 -40,17.9 -40,40 c0,22.1 17.9,40 40,40 v30 c0,11 9,20 20,20 h30 c0,22.1 17.9,40 40,40 c22.1,0 40,-17.9 40,-40 h30 c11,0 20,-9 20,-20 v-30 c22.1,0 40,-17.9 40,-40 c0,-22.1 -17.9,-40 -40,-40 v-30 C210,79 201,70 190,70 z"
    />
  </svg>
);

const BoxTray = ({ style }) => (
  <div
    style={{
      width: 600,
      height: 400,
      border: `8px solid ${COLORS.textSecondary}`,
      borderTop: "none",
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      position: "relative",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        bottom: -100,
        width: "100%",
        textAlign: "center",
        fontSize: 56,
        fontWeight: 800,
        color: COLORS.textPrimary,
        letterSpacing: "0.1em",
      }}
    >
      BOX
    </div>
  </div>
);

// ── 3. SCENE COMPONENTS ─────────────────────────────────────────────────────

const Scene1 = () => {
  const frame = useCurrentFrame();

  const WARMUP = 30;
  const TITLE_MOVE = WARMUP + 90;
  const DEF_IN = TITLE_MOVE + 30;
  const BULLET_1 = DEF_IN + 90;
  const BULLET_2 = BULLET_1 + 120;
  const BULLET_3 = BULLET_2 + 120;
  const EXIT = 900;

  const titleSpring = spring({
    frame: frame - WARMUP,
    fps: FPS,
    config: { damping: 14, stiffness: 80 },
  });
  const titleY = interpolate(
    frame,
    [TITLE_MOVE, TITLE_MOVE + 45],
    [1080, 400],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const titleScale = interpolate(
    frame,
    [TITLE_MOVE, TITLE_MOVE + 45],
    [1, 0.7],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  const defSpring = spring({
    frame: frame - DEF_IN,
    fps: FPS,
    config: { damping: 16, stiffness: 60 },
  });

  const bullets = [
    {
      text: "Divide project into small, manageable tasks",
      time: BULLET_1,
      color: COLORS.accentAmber,
    },
    {
      text: "Complete step-by-step through short Sprints",
      time: BULLET_2,
      color: COLORS.accentBlue,
    },
    {
      text: "Collaborate, adapt, and deliver frequently",
      time: BULLET_3,
      color: COLORS.accentGreen,
    },
  ];

  const exitFade = interpolate(frame, [EXIT, EXIT + 30], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitFade, alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: titleY,
          opacity: titleSpring,
          transform: `translateY(-50%) scale(${titleScale})`,
          fontSize: 160,
          fontWeight: 900,
          color: COLORS.accentBlue,
          letterSpacing: "-0.02em",
          textShadow: `0 0 80px ${COLORS.accentBlue}66`,
        }}
      >
        What is Scrum?
      </div>

      <div
        style={{
          position: "absolute",
          top: 600,
          width: 2400,
          textAlign: "center",
          opacity: defSpring,
          transform: `translateY(${interpolate(defSpring, [0, 1], [40, 0])}px)`,
          fontSize: 64,
          fontWeight: 600,
          lineHeight: 1.5,
          color: COLORS.textPrimary,
        }}
      >
        Scrum is one of the most popular Agile frameworks used to manage and
        organize software development work in a structured way.
      </div>

      <div
        style={{
          position: "absolute",
          top: 900,
          display: "flex",
          flexDirection: "column",
          gap: 60,
          width: 2000,
        }}
      >
        {bullets.map((b, i) => {
          const bSpring = spring({
            frame: frame - b.time,
            fps: FPS,
            config: { damping: 14, stiffness: 80 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 40,
                opacity: bSpring,
                transform: `translateX(${interpolate(bSpring, [0, 1], [-80, 0])}px)`,
                backgroundColor: COLORS.cardBg,
                padding: "40px 60px",
                borderRadius: 30,
                borderLeft: `12px solid ${b.color}`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: b.color,
                }}
              />
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                }}
              >
                {b.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene2 = () => {
  const frame = useCurrentFrame();

  const WARMUP = 30;
  const APP_IN = WARMUP;
  const CONNECTORS_IN = APP_IN + 60;
  const FEATURES_IN = CONNECTORS_IN + 45;
  const TASKS_SPAWN = FEATURES_IN + 90;
  const TASKS_DROP = TASKS_SPAWN + 60;
  const TRAY_IN = TASKS_DROP - 30;

  // Staggered highlight sequence
  const HL_STORY_1 = TASKS_DROP + 120;
  const HL_FEAT_1 = HL_STORY_1 + 90;
  const HL_ALL_FEAT = HL_FEAT_1 + 90;
  const HL_APP = HL_ALL_FEAT + 90;

  const EXIT = 960;

  const appSpring = spring({
    frame: frame - APP_IN,
    fps: FPS,
    config: { damping: 16, stiffness: 80 },
  });

  const featureStarts = [FEATURES_IN + 15, FEATURES_IN, FEATURES_IN + 15];
  const featureSprings = featureStarts.map((start) =>
    spring({
      frame: frame - start,
      fps: FPS,
      config: { damping: 14, stiffness: 100 },
    }),
  );

  const featureX = [1040, 1920, 2800];
  const traySpring = spring({
    frame: frame - TRAY_IN,
    fps: FPS,
    config: { damping: 14, stiffness: 80 },
  });

  const exitProgress = interpolate(frame, [EXIT, EXIT + 45], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const exitAlpha = 1 - exitProgress;

  const getTrayTarget = (featureIdx, taskIdx) => {
    const cols = [1720, 1920, 2120];
    const rows = [1520, 1620, 1720, 1820];
    return { x: cols[featureIdx], y: rows[taskIdx] };
  };

  // Glow states derived from sequence
  const story1Glow =
    frame > HL_STORY_1 && frame < HL_FEAT_1
      ? Math.sin(period(frame, 1.5)) * 40
      : 0;
  const feat1Glow =
    frame > HL_FEAT_1 && frame < HL_ALL_FEAT
      ? Math.sin(period(frame, 1.5)) * 40
      : 0;
  const allFeatGlow =
    frame > HL_ALL_FEAT && frame < HL_APP
      ? Math.sin(period(frame, 1.5)) * 40
      : 0;
  const appGlow =
    frame > HL_APP && frame < EXIT ? Math.sin(period(frame, 1.5)) * 40 : 0;

  return (
    <AbsoluteFill style={{ opacity: exitAlpha }}>
      {/* Title - Clean text with breathing space */}
      <div
        style={{
          position: "absolute",
          top: 160,
          width: 3840,
          textAlign: "center",
          opacity: appSpring,
          fontSize: 72,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: COLORS.textSecondary,
        }}
      ></div>

      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3840,
          height: 2160,
        }}
      >
        {featureX.map((x, i) => {
          const draw = interpolate(
            frame,
            [CONNECTORS_IN, CONNECTORS_IN + 40],
            [0, 1000],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
          );
          return (
            <path
              key={i}
              d={`M 1920 650 C 1920 850 ${x} 800 ${x} 1050`}
              fill="none"
              stroke={COLORS.textSecondary}
              strokeWidth="8"
              strokeDasharray="1000"
              strokeDashoffset={1000 - draw}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* The Application */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 1920 - 300,
          width: 600,
          height: 400,
          opacity: appSpring,
          transform: `scale(${appSpring + (appGlow > 0 ? 0.05 : 0)}) translateY(${exitProgress * -100}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          filter:
            appGlow > 0
              ? `drop-shadow(0 0 ${appGlow}px ${COLORS.accentBlue})`
              : "none",
        }}
      >
        <svg width="600" height="400" viewBox="0 0 600 400">
          <rect
            x="20"
            y="20"
            width="560"
            height="320"
            rx="20"
            fill={COLORS.cardBg}
            stroke={COLORS.accentBlue}
            strokeWidth="12"
          />
          <rect
            x="60"
            y="60"
            width="480"
            height="240"
            rx="10"
            fill={COLORS.cardBorder}
          />
          <path
            d="M 200 340 L 400 340 L 350 380 L 250 380 Z"
            fill={COLORS.accentBlue}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            top: -80,
            fontSize: 56,
            fontWeight: 800,
            color: COLORS.textPrimary,
          }}
        >
          The Application
        </span>
      </div>

      {/* Features */}
      {featureX.map((x, i) => {
        // Feature 1 gets isolated glow, all get allFeat glow
        const currentFeatGlow =
          i === 0 && feat1Glow > 0
            ? feat1Glow
            : allFeatGlow > 0
              ? allFeatGlow
              : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 1000,
              left: x - 120,
              opacity: featureSprings[i],
              transform: `scale(${featureSprings[i] + (currentFeatGlow > 0 ? 0.05 : 0)})`,
              filter:
                currentFeatGlow > 0
                  ? `drop-shadow(0 0 ${currentFeatGlow}px ${COLORS.accentGreen})`
                  : "none",
            }}
          >
            <PuzzlePiece
              color={COLORS.accentGreen}
              style={{
                filter: `drop-shadow(0 10px 30px ${COLORS.accentGreen}66)`,
              }}
            />
            <span
              style={{
                position: "absolute",
                top: 260,
                left: -60,
                width: 360,
                textAlign: "center",
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.textPrimary,
              }}
            >
              Feature {i + 1}
            </span>
          </div>
        );
      })}

      {/* BOX Tray */}
      <div
        style={{
          position: "absolute",
          top: 1500,
          left: 1920 - 300,
          opacity: traySpring,
          transform: `translateY(${interpolate(traySpring, [0, 1], [200, 0]) + exitProgress * 500}px)`,
        }}
      >
        <BoxTray />
        <span
          style={{
            position: "absolute",
            top: -80,
            width: "100%",
            textAlign: "center",
            fontSize: 40,
            fontWeight: 700,
            color: COLORS.accentAmber,
          }}
        >
          Small Parts
        </span>
      </div>

      {/* Gears (Tasks) */}
      {[0, 1, 2].map((featureIdx) => {
        return [0, 1, 2, 3].map((taskIdx) => {
          const spawnTime = TASKS_SPAWN + featureIdx * 5 + taskIdx * 5;
          const dropTime = TASKS_DROP + featureIdx * 10 + taskIdx * 10;

          const taskSpring = spring({
            frame: frame - spawnTime,
            fps: FPS,
            config: { damping: 12, stiffness: 120 },
          });
          const dropProgress = spring({
            frame: frame - dropTime,
            fps: FPS,
            config: { damping: 14, stiffness: 60 },
          });

          const startX = featureX[featureIdx];
          const startY = 1100;

          const spreadX = startX + (taskIdx - 1.5) * 80;
          const spreadY = 1350;

          const target = getTrayTarget(featureIdx, taskIdx);

          let currentX = interpolate(taskSpring, [0, 1], [startX, spreadX]);
          let currentY = interpolate(taskSpring, [0, 1], [startY, spreadY]);

          if (frame >= dropTime) {
            currentX = interpolate(dropProgress, [0, 1], [spreadX, target.x]);
            currentY = interpolate(dropProgress, [0, 1], [spreadY, target.y]);
          }

          const isDropped = dropProgress > 0.9;
          const currentTaskGlow =
            featureIdx === 0 && story1Glow > 0 && isDropped ? story1Glow : 0;

          return (
            <div
              key={`${featureIdx}-${taskIdx}`}
              style={{
                position: "absolute",
                top: currentY + (isDropped ? exitProgress * 500 : 0),
                left: currentX,
                opacity: taskSpring,
                transform: `translate(-50%, -50%) scale(${taskSpring + (currentTaskGlow > 0 ? 0.2 : 0)})`,
                filter:
                  currentTaskGlow > 0
                    ? `drop-shadow(0 0 ${currentTaskGlow}px ${COLORS.accentAmber})`
                    : "none",
              }}
            >
              <Gear size={70} color={COLORS.accentAmber} rotation={frame * 2} />
            </div>
          );
        });
      })}
    </AbsoluteFill>
  );
};

const Scene3 = () => {
  const frame = useCurrentFrame();

  // ── TIMING SEQUENCER ────────────────────────────────────────────────────────
  const PB_IN = 30;
  const SPRINT_IN = 90;

  // Sprint 1
  const PULL_START = 160; // Gears move PB -> SB
  const EXEC_START = 250; // Gears move SB -> Complete
  const EXEC_DUR = 140; // Time to cross the board
  const ARRIVE_LAST = EXEC_START + 50 + EXEC_DUR; // ~440
  const MORPH_START = ARRIVE_LAST + 10; // 450 (Morph to Tick)

  // Delivery & Feedback
  const CLIENT_IN = 490;
  const DELIVER_START = 540;
  const FEEDBACK_START = 610;
  const FEEDBACK_END = 710;
  const INSIGHTS_IN = 710; // Stays permanently

  // Sprint 2 Transition
  const SPAWN_NEW = 740;
  const SPRINT2_LABEL = 820;
  const SPRINT2_PULL = 860;
  const SPRINT2_EXEC = 940;

  const CAPTION_IN = 1060;
  const EXIT = 1200;

  // ── CANVAS ANCHORS (4K ALIGNMENT) ─────────────────────────────────────────
  const PATH_Y = 1250; // Lowered to make room for Insights at the top
  const PB_X = 400; // Product Backlog Center
  const SB_X = 1050; // Sprint Backlog Center
  const DESIGN_X = 1550;
  const DEVELOP_X = 2050;
  const TEST_X = 2550;
  const PKG_X = 3050; // "Complete" Area
  const CLIENT_X = 3550;

  const nodes = [
    { label: "Design", x: DESIGN_X, color: COLORS.accentAmber },
    { label: "Develop", x: DEVELOP_X, color: COLORS.accentBlue },
    { label: "Test", x: TEST_X, color: COLORS.accentGreen },
  ];

  // ── ENTRANCE SPRINGS ──────────────────────────────────────────────────────
  const pbSpring = spring({
    frame: frame - PB_IN,
    fps: FPS,
    config: { damping: 14, stiffness: 80 },
  });
  const sprintSpring = spring({
    frame: frame - SPRINT_IN,
    fps: FPS,
    config: { damping: 14, stiffness: 80 },
  });
  const clientSpring = spring({
    frame: frame - CLIENT_IN,
    fps: FPS,
    config: { damping: 14, stiffness: 80 },
  });
  const insightSpring = spring({
    frame: frame - INSIGHTS_IN,
    fps: FPS,
    config: { damping: 16, stiffness: 70 },
  });
  const captionSpring = spring({
    frame: frame - CAPTION_IN,
    fps: FPS,
    config: { damping: 14, stiffness: 60 },
  });

  const exitProgress = interpolate(frame, [EXIT, EXIT + 45], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const exitScale = 1 - exitProgress;

  // ── LINE REVEALS ──────────────────────────────────────────────────────────
  const line1Reveal = interpolate(
    frame,
    [EXEC_START - 20, EXEC_START + 20],
    [100, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const line2Reveal = interpolate(
    frame,
    [DELIVER_START - 20, DELIVER_START + 10],
    [100, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const arcReveal = interpolate(
    frame,
    [FEEDBACK_START, FEEDBACK_END],
    [100, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  // ── FEEDBACK ARC MATH ─────────────────────────────────────────────────────
  const fbT = interpolate(frame, [FEEDBACK_START, FEEDBACK_END], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const arcStartX = CLIENT_X;
  const arcStartY = PATH_Y - 150;
  const arcCtrlX = 1900;
  const arcCtrlY = -100; // Increased radius / elevated curve
  const arcEndX = PB_X;
  const arcEndY = PATH_Y - 250;

  const fbX =
    Math.pow(1 - fbT, 2) * arcStartX +
    2 * (1 - fbT) * fbT * arcCtrlX +
    Math.pow(fbT, 2) * arcEndX;
  const fbY =
    Math.pow(1 - fbT, 2) * arcStartY +
    2 * (1 - fbT) * fbT * arcCtrlY +
    Math.pow(fbT, 2) * arcEndY;

  const fbScaleIn = spring({
    frame: frame - FEEDBACK_START,
    fps: FPS,
    config: { damping: 14, stiffness: 100 },
  });
  const fbScaleOut = interpolate(
    frame,
    [FEEDBACK_END - 15, FEEDBACK_END],
    [1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );
  const fbScale = fbT === 1 ? 0 : Math.min(fbScaleIn, fbScaleOut);

  // ── GEAR LIFECYCLE CONTROLLER ─────────────────────────────────────────────
  // Initial PB positions (Centered and spaced out)
  const pbPos = (index) => ({
    x: PB_X - 150 + (index % 3) * 150,
    y: PATH_Y + 120 - Math.floor(index / 3) * 110,
  });
  // SB positions
  const sbPos = (index) => ({
    x: SB_X - 70 + (index % 3) * 70,
    y: PATH_Y + 40,
  });

  const gears = [
    // Sprint 1 Gears
    {
      id: "s1-1",
      pb: pbPos(6),
      sb: sbPos(0),
      pull: PULL_START,
      exec: EXEC_START,
      hide: MORPH_START,
      isS2: false,
    },
    {
      id: "s1-2",
      pb: pbPos(7),
      sb: sbPos(1),
      pull: PULL_START + 15,
      exec: EXEC_START + 25,
      hide: MORPH_START,
      isS2: false,
    },
    {
      id: "s1-3",
      pb: pbPos(8),
      sb: sbPos(2),
      pull: PULL_START + 30,
      exec: EXEC_START + 50,
      hide: MORPH_START,
      isS2: false,
    },
    // Sprint 2 Gears (Spawned later)
    {
      id: "s2-1",
      pb: pbPos(6),
      sb: sbPos(0),
      pull: SPRINT2_PULL,
      exec: SPRINT2_EXEC,
      hide: 9999,
      isS2: true,
    },
    {
      id: "s2-2",
      pb: pbPos(7),
      sb: sbPos(1),
      pull: SPRINT2_PULL + 20,
      exec: SPRINT2_EXEC + 30,
      hide: 9999,
      isS2: true,
    },
  ];

  const getGearState = (gear) => {
    // 0. Pre-spawn for Sprint 2
    if (gear.isS2 && frame < SPAWN_NEW) return { opacity: 0 };

    // 1. Resting in PB
    if (frame < gear.pull) {
      const spawnIn = gear.isS2
        ? spring({
            frame: frame - SPAWN_NEW,
            fps: FPS,
            config: { damping: 12, stiffness: 100 },
          })
        : 1;
      return {
        x: gear.pb.x,
        y: gear.pb.y,
        scale: spawnIn,
        color: COLORS.accentAmber,
        opacity: 1,
      };
    }

    // 2. Pulling PB -> SB
    const pullP = spring({
      frame: frame - gear.pull,
      fps: FPS,
      config: { damping: 14, stiffness: 80 },
    });
    if (frame < gear.exec) {
      return {
        x: interpolate(pullP, [0, 1], [gear.pb.x, gear.sb.x]),
        y: interpolate(pullP, [0, 1], [gear.pb.y, gear.sb.y]),
        scale: 1,
        color: COLORS.accentAmber,
        opacity: 1,
      };
    }

    // 3. Executing SB -> Complete
    const endExec = gear.exec + EXEC_DUR;
    if (frame < endExec) {
      const execP = interpolate(frame, [gear.exec, endExec], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      });
      const currentX = interpolate(execP, [0, 1], [gear.sb.x, PKG_X]);

      let color = COLORS.accentAmber;
      if (currentX > DESIGN_X + 100) color = COLORS.accentBlue;
      if (currentX > DEVELOP_X + 100) color = COLORS.accentGreen;

      const floatY = Math.sin((frame - gear.exec) / 4) * 15;
      return { x: currentX, y: PATH_Y + floatY, scale: 1, color, opacity: 1 };
    }

    // 4. Resting at Complete (Waiting to Morph)
    if (frame < gear.hide) {
      return {
        x: PKG_X,
        y: PATH_Y,
        scale: 1,
        color: COLORS.accentGreen,
        opacity: 1,
      };
    }

    // 5. Morphed / Hidden
    return { opacity: 0 };
  };

  // ── PACKAGE & CLIENT LOGIC ────────────────────────────────────────────────
  const isMorphed = frame >= MORPH_START;
  const morphP = spring({
    frame: frame - MORPH_START,
    fps: FPS,
    config: { damping: 12, stiffness: 120 },
  });

  const deliverP = spring({
    frame: frame - DELIVER_START,
    fps: FPS,
    config: { damping: 16, stiffness: 70 },
  });
  const pkgX = interpolate(deliverP, [0, 1], [PKG_X, CLIENT_X]);
  const pkgOpacity = interpolate(
    frame,
    [DELIVER_START + 35, DELIVER_START + 50],
    [1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  const clientPulse =
    frame > DELIVER_START + 30 && frame < DELIVER_START + 60
      ? Math.sin(period(frame, 0.4)) * 0.08
      : 0;

  return (
    <AbsoluteFill style={{ opacity: exitScale, backgroundColor: COLORS.bg }}>
      {/* ── BACKGROUND DOTTED LINES ── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3840,
          height: 2160,
          zIndex: 1,
        }}
      >
        {/* Sprint Execution Line (SB -> Complete) */}
        <path
          d={`M ${SB_X + 150} ${PATH_Y} L ${PKG_X - 120} ${PATH_Y}`}
          fill="none"
          stroke={COLORS.textSecondary}
          strokeWidth="8"
          strokeDasharray="20 20"
          strokeDashoffset={-frame * 4}
          strokeLinecap="round"
          style={{ clipPath: `inset(0 ${line1Reveal}% 0 0)` }}
        />
        {/* Delivery Line (Complete -> Client) */}
        <path
          d={`M ${PKG_X + 120} ${PATH_Y} L ${CLIENT_X - 150} ${PATH_Y}`}
          fill="none"
          stroke={COLORS.accentGreen}
          strokeWidth="8"
          strokeDasharray="20 20"
          strokeDashoffset={-frame * 4}
          strokeLinecap="round"
          style={{ clipPath: `inset(0 ${line2Reveal}% 0 0)` }}
        />
        {/* Overhead Feedback Return Arc */}
        <path
          d={`M ${arcStartX} ${arcStartY} Q ${arcCtrlX} ${arcCtrlY} ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke={COLORS.accentAmber}
          strokeWidth="8"
          strokeDasharray="20 20"
          strokeDashoffset={frame * 6}
          strokeLinecap="round"
          style={{ clipPath: `inset(0 0 0 ${arcReveal}%)` }}
        />
      </svg>

      {/* ── INSIGHTS TEXT BOX (TOP CENTER) ── */}
      <div
        style={{
          position: "absolute",
          top: 250, // Moved up from 250
          left: 1920 - 400,
          width: 800,
          opacity: insightSpring,
          transform: `scale(${insightSpring})`,
          backgroundColor: COLORS.cardBg,
          padding: "50px 60px",
          borderRadius: 40,
          border: `4px solid ${COLORS.accentAmber}`,
          boxShadow: `0 20px 80px ${COLORS.accentAmber}33`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            color: COLORS.accentAmber,
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          Feedback Updates:
        </div>
        <div
          style={{
            color: COLORS.textPrimary,
            fontSize: 40,
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          • Improve existing parts
        </div>
        <div
          style={{
            color: COLORS.textPrimary,
            fontSize: 40,
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          • Make changes to features
        </div>
        <div
          style={{ color: COLORS.textPrimary, fontSize: 40, lineHeight: 1.5 }}
        >
          • Create new parts
        </div>
      </div>

      {/* ── 1. PRODUCT BACKLOG (BIG BOX) ── */}
      <div
        style={{
          position: "absolute",
          top: PATH_Y - 250,
          left: PB_X - 250,
          opacity: pbSpring,
          transform: `translateY(${interpolate(pbSpring, [0, 1], [120, 0])}px)`,
          zIndex: 4,
        }}
      >
        <div
          style={{
            width: 500,
            height: 500,
            border: `8px solid ${COLORS.textSecondary}`,
            borderTop: "none",
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -80,
              width: "100%",
              textAlign: "center",
              fontSize: 44,
              fontWeight: 800,
              color: COLORS.textPrimary,
            }}
          >
            Box
          </div>
        </div>

        {/* Static background gears (Row 1 and 2) */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const pos = pbPos(i);
          return (
            <div
              key={`static-${i}`}
              style={{
                position: "absolute",
                top: pos.y - (PATH_Y - 250),
                left: pos.x - (PB_X - 250),
                transform: "translate(-50%, -50%)", // Centers gear correctly over pos.x/y
              }}
            >
              <Gear size={80} color={COLORS.textSecondary} />
            </div>
          );
        })}
      </div>

      {/* ── 2. THE SPRINT ZONE ── */}
      <div
        style={{
          position: "absolute",
          top: PATH_Y - 300,
          left: SB_X - 200,
          width: PKG_X - SB_X + 400,
          height: 600,
          border: `5px dashed ${COLORS.accentBlue}55`,
          borderRadius: 60,
          backgroundColor: `${COLORS.accentBlue}08`,
          opacity: sprintSpring,
          transform: `scale(${sprintSpring})`,
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -90,
            width: "100%",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.accentBlue,
              letterSpacing: "0.06em",
            }}
          >
            {frame < SPRINT2_LABEL ? "THE SPRINT" : "SPRINT 2"}
          </span>
          <Badge
            label="1 - 2 Weeks"
            color={COLORS.accentBlue}
            style={{
              display: "inline-block",
              marginLeft: 24,
              fontSize: 36,
              padding: "8px 28px",
            }}
          />
        </div>
      </div>

      {/* ── SPRINT BACKLOG (SMALL BOX) ── */}
      <div
        style={{
          position: "absolute",
          top: PATH_Y - 100,
          left: SB_X - 150,
          opacity: sprintSpring,
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: 300,
            height: 200,
            border: `6px solid ${COLORS.accentBlue}`,
            borderTop: "none",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -60,
              width: "100%",
              textAlign: "center",
              fontSize: 36,
              fontWeight: 700,
              color: COLORS.accentBlue,
            }}
          >
            Box 2
          </div>
        </div>
      </div>

      {/* ── SPRINT NODES ── */}
      {nodes.map((node, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: PATH_Y,
            left: node.x,
            opacity: sprintSpring,
            transform: `translate(-50%, -50%) scale(${sprintSpring})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: COLORS.cardBg,
              border: `8px solid ${node.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 35px ${node.color}55`,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: node.color,
              }}
            />
          </div>
          <span
            style={{
              position: "absolute",
              top: 160,
              fontSize: 44,
              fontWeight: 700,
              color: node.color,
            }}
          >
            {node.label}
          </span>
        </div>
      ))}

      {/* ── COMPLETE NODE (DASHED UNTIL PACKAGE) ── */}
      <div
        style={{
          position: "absolute",
          top: PATH_Y,
          left: PKG_X,
          opacity: sprintSpring,
          transform: `translate(-50%, -50%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 40,
            border: `6px dashed ${COLORS.accentGreen}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 160,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.accentGreen,
          }}
        >
          Complete
        </span>
      </div>

      {/* ── 3. THE CLIENT ── */}
      <div
        style={{
          position: "absolute",
          top: PATH_Y,
          left: CLIENT_X,
          opacity: clientSpring,
          transform: `translate(-50%, -50%) scale(${clientSpring + clientPulse})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 4,
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            backgroundColor: COLORS.cardBg,
            border: `8px solid ${COLORS.accentAmber}`,
            borderRadius: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${COLORS.accentAmber}44`,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.textPrimary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span
          style={{
            marginTop: 32,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.textPrimary,
          }}
        >
          Client
        </span>
      </div>

      {/* ── ACTIVE GEARS ── */}
      {gears.map((gear) => {
        const state = getGearState(gear);
        if (state.opacity <= 0) return null;

        return (
          <div
            key={gear.id}
            style={{
              position: "absolute",
              top: state.y,
              left: state.x,
              opacity: state.opacity,
              transform: `translate(-50%, -50%) scale(${state.scale})`,
              zIndex: 10,
            }}
          >
            <Gear size={90} color={state.color} rotation={frame * 8} />
          </div>
        );
      })}

      {/* ── THE TICK PACKAGE (MORPHED) ── */}
      {isMorphed && (
        <div
          style={{
            position: "absolute",
            top: PATH_Y,
            left: pkgX,
            opacity: pkgOpacity,
            transform: `translate(-50%, -50%) scale(${morphP})`,
            zIndex: 11,
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              backgroundColor: COLORS.accentGreen,
              borderRadius: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 20px 60px ${COLORS.accentGreen}66`,
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.bg}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      )}

      {/* ── FEEDBACK LIGHTBULB ── */}
      {frame >= FEEDBACK_START && frame < FEEDBACK_END + 15 && (
        <div
          style={{
            position: "absolute",
            top: fbY,
            left: fbX,
            transform: `translate(-50%, -50%) scale(${fbScale})`,
            zIndex: 20,
          }}
        >
          <div
            style={{
              padding: "24px 48px",
              backgroundColor: COLORS.accentAmber,
              borderRadius: 60,
              display: "flex",
              gap: 24,
              alignItems: "center",
              boxShadow: `0 20px 80px ${COLORS.accentAmber}66`,
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.bg}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
            </svg>
            <span style={{ fontSize: 48, fontWeight: 800, color: COLORS.bg }}>
              Feedback
            </span>
          </div>
        </div>
      )}

      {/* ── BOTTOM CAPTION ── */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          textAlign: "center",
          opacity: captionSpring,
        }}
      >
        <span
          style={{
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: "0.04em",
            color: COLORS.textPrimary,
          }}
        >
          Build. Review. Adapt.{" "}
          <span style={{ color: COLORS.accentBlue }}>Repeat.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
const Scene5 = () => {
  const frame = useCurrentFrame();

  const WARMUP = 30;
  const FREEZE = WARMUP + 60;
  const DIM = FREEZE + 20;
  const QMARKS_IN = DIM + 45;
  const FLIP = QMARKS_IN + 90;
  const TITLE_IN = FLIP + 60;

  const dimOpacity = interpolate(frame, [DIM, DIM + 60], [0, 0.85], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const questions = [
    { x: 1920 - 800, y: 1080 - 100, label: "Who Divides the Work?", delay: 0 },
    { x: 1920, y: 1080 - 400, label: "Who Manages the Tasks?", delay: 20 },
    {
      x: 1920 + 800,
      y: 1080 - 100,
      label: "Who Protects the Process?",
      delay: 40,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Background Gray Machine */}
      <div
        style={{
          position: "absolute",
          top: 1080 - 300,
          left: 1920 - 800,
          width: 1600,
          height: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          filter: "grayscale(100%) opacity(0.3)",
        }}
      >
        <BoxTray
          style={{ transform: "scale(0.8)", transformOrigin: "left center" }}
        />
        <div
          style={{
            width: 500,
            height: 500,
            borderRadius: 250,
            border: `20px dashed ${COLORS.textSecondary}`,
          }}
        />
      </div>

      <AbsoluteFill
        style={{ backgroundColor: COLORS.bg, opacity: dimOpacity }}
      />

      {/* Static Flipping Avatars */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        {questions.map((q, i) => {
          const pop = spring({
            frame: frame - QMARKS_IN - q.delay,
            fps: FPS,
            config: { damping: 12, stiffness: 100 },
          });
          const flipProg = spring({
            frame: frame - FLIP - q.delay,
            fps: FPS,
            config: { damping: 14, stiffness: 80 },
          });
          const rotateY = interpolate(flipProg, [0, 1], [0, 180]);
          const isFlipped = rotateY > 90;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: q.y,
                left: q.x,
                transform: `translate(-50%, -50%) scale(${pop}) rotateY(${rotateY}deg)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {isFlipped ? (
                <div
                  style={{
                    transform: "rotateY(180deg)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 280,
                      height: 280,
                      backgroundColor: COLORS.cardBg,
                      border: `8px solid ${COLORS.accentAmber}`,
                      borderRadius: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 80px ${COLORS.accentAmber}44`,
                    }}
                  >
                    <svg
                      width="140"
                      height="140"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={COLORS.accentAmber}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <Badge
                    label={q.label}
                    color={COLORS.accentAmber}
                    style={{
                      marginTop: 40,
                      backgroundColor: COLORS.bg,
                      boxShadow: `0 10px 40px rgba(0,0,0,0.8)`,
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 320,
                    fontWeight: 900,
                    color: COLORS.accentAmber,
                    textShadow: `0 0 80px ${COLORS.accentAmber}88`,
                  }}
                >
                  ?
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 240,
          width: "100%",
          textAlign: "center",
          opacity: spring({
            frame: frame - TITLE_IN,
            fps: FPS,
            config: { damping: 20, stiffness: 60 },
          }),
          transform: `scale(${interpolate(frame, [TITLE_IN, TITLE_IN + 300], [0.95, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })})`,
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: COLORS.textPrimary,
            letterSpacing: "-0.02em",
            textShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          Who Manages{" "}
          <span style={{ color: COLORS.accentAmber }}>All these things?</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── 4. TIMELINE CONSTANTS ───────────────────────────────────────────────────

const S1_START = 0;
const S1_DUR = 900; // 15s

const GAP_1 = 120; // 2s

const S2_START = S1_START + S1_DUR + GAP_1;
const S2_DUR = 960; // 16s

const GAP_2 = 120;

const S3_START = S2_START + S2_DUR + GAP_2;
const S3_DUR = 1140; // 19s

const GAP_3 = 120;

const S5_START = S3_START + S3_DUR + GAP_3;
const S5_DUR = 780; // 13s

const TRAILING_GAP = 120;

const TOTAL_FRAMES = S5_START + S5_DUR + TRAILING_GAP;

// ── 5. ROOT COMPOSITION ─────────────────────────────────────────────────────

export const CourseAnimation = () => {
  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bg, fontFamily: "Inter, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <Sequence from={S1_START} durationInFrames={S1_DUR}>
        <Scene1 />
      </Sequence>

      <Sequence from={S2_START} durationInFrames={S2_DUR}>
        <Scene2 />
      </Sequence>

      <Sequence from={S3_START} durationInFrames={S3_DUR}>
        <Scene3 />
      </Sequence>

      <Sequence from={S5_START} durationInFrames={S5_DUR + TRAILING_GAP}>
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── 6. REGISTRATION ─────────────────────────────────────────────────────────

export const RemotionRoot = () => (
  <>
    <Composition
      id="CourseAnimation"
      component={CourseAnimation}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      defaultProps={{}}
    />
  </>
);

registerRoot(RemotionRoot);
