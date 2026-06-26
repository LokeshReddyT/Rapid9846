import React, { useEffect, useRef } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { gsap } from "gsap";

// ── 1. DESIGN TOKENS ─────────────
const DS = {
  colors: {
    bg: "#0B0F19",
    panel: "#0F172A",
    card: "#1E293B",
    borderBright: "#475569",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    cyan: "#38BDF8",
    amber: "#FBBF24",
  },
  font: {
    h1: {
      fontSize: 104,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#F8FAFC",
      margin: 0,
    },
    h2: {
      fontSize: 80,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#F8FAFC",
      margin: 0,
    },
    bodyLg: {
      fontSize: 44,
      fontWeight: 400,
      color: "#94A3B8",
      lineHeight: 1.6,
      margin: 0,
    },
    label: {
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: "0.06em",
      color: "#64748B",
      textTransform: "uppercase",
      margin: 0,
    },
  },
  shadows: {
    card: "0 8px 48px rgba(0,0,0,0.4)",
    glowCyan: "0 0 64px rgba(56,189,248,0.3), 0 0 16px rgba(56,189,248,0.5)",
    glowAmber: "0 0 64px rgba(251,191,36,0.3), 0 0 16px rgba(251,191,36,0.5)",
  },
};

// ── 2. HOOKS ────────────────────────────────────────────────
const useGSAPSync = (masterRef, durationInSeconds) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useEffect(() => {
    if (masterRef.current) {
      const totalFrames = durationInSeconds * fps;
      const progress = Math.min(Math.max(frame / totalFrames, 0), 1);
      masterRef.current.progress(progress);
    }
  }, [frame, fps, durationInSeconds, masterRef]);
};

// ── 3. ICONS ───────────────────────────────────────────
const CaptureIcon = ({ color }) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    stroke={color}
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M30,40 C30,25 40,15 50,15 C60,15 70,25 70,40 C70,50 60,60 60,70 L40,70 C40,60 30,50 30,40 Z" />
    <line x1="40" y1="80" x2="60" y2="80" />
    <line x1="45" y1="90" x2="55" y2="90" />
    <line x1="50" y1="5" x2="50" y2="10" />
    <line x1="20" y1="20" x2="25" y2="25" />
    <line x1="80" y1="20" x2="75" y2="25" />
  </svg>
);

const DevelopIcon = ({ color }) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    stroke={color}
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="15" y="25" width="70" height="50" rx="6" />
    <polyline points="35,45 25,50 35,55" />
    <polyline points="65,45 75,50 65,55" />
    <line x1="55" y1="40" x2="45" y2="60" />
  </svg>
);

const DeployIcon = ({ color }) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    stroke={color}
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M50,15 C50,15 25,35 25,65 L75,65 C75,35 50,15 50,15 Z" />
    <path d="M25,65 L15,80 L35,75" />
    <path d="M75,65 L85,80 L65,75" />
    <line x1="50" y1="65" x2="50" y2="85" />
    <path d="M40,85 C40,85 45,95 50,95 C55,95 60,85 60,85" stroke="#FBBF24" />
  </svg>
);

const IterateIcon = ({ color }) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    stroke={color}
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M25,50 A25,25 0 1,1 32,68" />
    <polyline points="32,55 32,68 19,68" />
    <path d="M75,50 A25,25 0 1,1 68,32" />
    <polyline points="68,45 68,32 81,32" />
  </svg>
);

const PhaseNode = ({
  angle,
  r,
  label,
  icon: Icon,
  bullets,
  toolLabel,
  nodeRef,
  bulletsRefArray,
  toolRef,
}) => {
  const centerX = 1920;
  const centerY = 1080;

  const left = centerX + Math.cos(((angle - 90) * Math.PI) / 180) * r;
  const top = centerY + Math.sin(((angle - 90) * Math.PI) / 180) * r;

  return (
    <div
      ref={nodeRef}
      style={{
        position: "absolute",
        left,
        top,
        transform: "translate(-50%, -50%)",
        opacity: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 400,
      }}
    >
      <div
        style={{
          background: DS.colors.card,
          border: `5px solid ${DS.colors.borderBright}`,
          borderRadius: 36,
          width: 240,
          height: 240,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: DS.shadows.card,
          zIndex: 2,
        }}
      >
        <div style={{ transform: "scale(1.2)" }}>
          <Icon color={DS.colors.cyan} />
        </div>
      </div>

      <h3
        style={{
          ...DS.font.h2,
          fontSize: 48,
          marginTop: 20,
          marginBottom: 16,
          textAlign: "center",
          color: DS.colors.textPrimary,
          textShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        {label}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {bullets.map((txt, i) => (
          <div
            key={i}
            ref={(el) => {
              if (bulletsRefArray) bulletsRefArray[i] = el;
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: 1,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: DS.colors.amber,
                boxShadow: DS.shadows.glowAmber,
                flexShrink: 0,
              }}
            />
            <p
              style={{
                ...DS.font.bodyLg,
                fontSize: 32,
                color: DS.colors.textSecondary,
                margin: 0,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {txt}
            </p>
          </div>
        ))}
      </div>

      <div
        ref={toolRef}
        style={{
          marginTop: 24,
          padding: "12px 32px",
          background: `rgba(56,189,248, 0.1)`,
          border: `2px solid ${DS.colors.cyan}`,
          borderRadius: 999,
          opacity: 0,
          boxShadow: DS.shadows.glowCyan,
        }}
      >
        <p
          style={{
            ...DS.font.label,
            fontSize: 24,
            color: DS.colors.cyan,
            margin: 0,
          }}
        >
          {toolLabel}
        </p>
      </div>
    </div>
  );
};

// ── 4. ALM CYCLE ANIMATION ────────────────────────────────────
const ALMCycle = () => {
  const refs = useRef({
    bulletsCap: [],
    bulletsDev: [],
    bulletsDep: [],
    bulletsIter: [],
  });
  const masterRef = useRef(null);

  const RADIUS = 650;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const DURATION_IN_SECONDS = 16;

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    masterRef.current = tl;
    const r = refs.current;

    // Initial setups for elements that fade in later
    gsap.set(r.outroWrap, { opacity: 0, scale: 0.9, y: 50 });
    gsap.set([r.toolCap, r.toolDev, r.toolDep, r.toolIter], {
      opacity: 0,
      y: 20,
    });
    gsap.set(r.flowRing, { opacity: 0, strokeDashoffset: 0 });

    // 1. Continuous Flow & Logo Pulse (Runs perfectly for the full 16s duration)
    tl.to(r.flowRing, { opacity: 0.6, duration: 0.5 }, 0)
      .to(
        r.flowRing,
        { strokeDashoffset: -1600, duration: 16, ease: "none" },
        0,
      )
      .to(
        r.mLogo,
        { scale: 1.05, duration: 2, yoyo: true, repeat: 7, ease: "sine.inOut" },
        0,
      );

    // 2. Sequential Tool Pop-ups
    tl.to(
      r.toolCap,
      { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
      1.5,
    )
      .to(
        r.toolDev,
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
        3.5,
      )
      .to(
        r.toolDep,
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
        5.5,
      )
      .to(
        r.toolIter,
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
        7.5,
      );

    // 3. Transition to Outro
    tl.to(
      r.mainDiagram,
      { opacity: 0, scale: 0.9, duration: 1.0, ease: "power3.inOut" },
      11.0,
    );

    // 4. Outro
    tl.to(
      r.outroWrap,
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "back.out(1.2)" },
      12.0,
    );

    return () => tl.kill();
  }, []);

  useGSAPSync(masterRef, DURATION_IN_SECONDS);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Main ALM Diagram */}
      <div
        ref={(el) => (refs.current.mainDiagram = el)}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      >
        <svg
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 3840,
            height: 2160,
            pointerEvents: "none",
          }}
        >
          {/* Static solid ring visible by default */}
          <circle
            cx="1920"
            cy="1080"
            r={RADIUS}
            fill="none"
            stroke={DS.colors.borderBright}
            strokeWidth="8"
            transform="rotate(-90 1920 1080)"
          />
          {/* Rotating flow ring */}
          <circle
            ref={(el) => (refs.current.flowRing = el)}
            cx="1920"
            cy="1080"
            r={RADIUS}
            fill="none"
            stroke={DS.colors.cyan}
            strokeWidth="8"
            strokeDasharray="15 120"
            transform="rotate(-90 1920 1080)"
            style={{ filter: "drop-shadow(0 0 20px rgba(56,189,248,0.8))" }}
          />
        </svg>

        <div
          ref={(el) => (refs.current.mLogo = el)}
          style={{
            position: "absolute",
            left: 1920 - 140,
            top: 1080 - 140,
            width: 280,
            height: 280,
            zIndex: 10,
            opacity: 1,
          }}
        >
          <img
            src={staticFile("mendix.png")}
            alt="Mendix Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 0 60px rgba(56,189,248,0.4))",
            }}
          />
        </div>

        <PhaseNode
          nodeRef={(el) => (refs.current.nodeCap = el)}
          bulletsRefArray={refs.current.bulletsCap}
          toolRef={(el) => (refs.current.toolCap = el)}
          angle={0}
          r={RADIUS}
          label="Capture"
          icon={CaptureIcon}
          bullets={["Gather requirements", "Discuss ideas", "Align with team"]}
          toolLabel="Project Management"
        />
        <PhaseNode
          nodeRef={(el) => (refs.current.nodeDev = el)}
          bulletsRefArray={refs.current.bulletsDev}
          toolRef={(el) => (refs.current.toolDev = el)}
          angle={90}
          r={RADIUS}
          label="Develop"
          icon={DevelopIcon}
          bullets={["Start building", "Logic & UI"]}
          toolLabel="Mendix Studio Pro"
        />
        <PhaseNode
          nodeRef={(el) => (refs.current.nodeDep = el)}
          bulletsRefArray={refs.current.bulletsDep}
          toolRef={(el) => (refs.current.toolDep = el)}
          angle={180}
          r={RADIUS}
          label="Deploy"
          icon={DeployIcon}
          bullets={["Testing environment", "Release to users"]}
          toolLabel="Deployment"
        />
        <PhaseNode
          nodeRef={(el) => (refs.current.nodeIter = el)}
          bulletsRefArray={refs.current.bulletsIter}
          toolRef={(el) => (refs.current.toolIter = el)}
          angle={270}
          r={RADIUS}
          label="Iterate"
          icon={IterateIcon}
          bullets={["Collect feedback", "Fix issues", "Plan new features"]}
          toolLabel="App Insights"
        />
      </div>

      {/* Outro Text Block */}
      <div
        ref={(el) => (refs.current.outroWrap = el)}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p
          style={{
            ...DS.font.label,
            fontSize: 48,
            color: DS.colors.amber,
            marginBottom: 24,
          }}
        >
          UP NEXT
        </p>
        <h1
          style={{
            ...DS.font.h1,
            fontSize: 144,
            textShadow: DS.shadows.glowCyan,
          }}
        >
          Project Management
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. MAIN SCENE COMPONENT ───────────────────────────────────
export const MainScene = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: DS.colors.bg, overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={960}>
        <ALMCycle />
      </Sequence>
    </AbsoluteFill>
  );
};

export default MainScene;
