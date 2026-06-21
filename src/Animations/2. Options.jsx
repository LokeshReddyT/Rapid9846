import React, { useLayoutEffect, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { staticFile } from "remotion";
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  AbsoluteFill,
  ScaledStages,
} from "remotion";

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────
const DS = {
  colors: {
    bg: "#0B0F19",
    panel: "#0F172A",
    card: "#1E293B",
    border: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    cyan: "#38BDF8",
    cyanGlow: "rgba(56,189,248,0.2)",
    purple: "#A78BFA",
    purpleGlow: "rgba(167,139,250,0.2)",
    green: "#34D399",
    greenGlow: "rgba(52,211,153,0.2)",
    amber: "#FBBF24",
    rose: "#FB7185",
  },
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  easing: {
    enter: "power3.out",
    exit: "power3.in",
    smooth: "power2.inOut",
    spring: "elastic.out(1, 0.8)",
    slowFlow: "none",
  },
};

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────
const ScaledStage = ({ children }) => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: DS.colors.bg,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DS.font.family,
      }}
    >
      <div
        style={{
          width: 1920,
          height: 1080,
          position: "relative",
          transform: `scale(${scale})`,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ─── ENHANCED ICONS FOR VISUALIZATION ─────────────────────────────────────
const IconWebUI = ({ color }) => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="12" width="56" height="40" rx="4" />
    <path d="M4 22h56" />
    <circle cx="12" cy="17" r="1.5" fill={color} />
    <circle cx="18" cy="17" r="1.5" fill={color} />
    <rect
      x="10"
      y="28"
      width="16"
      height="16"
      rx="2"
      fill={color}
      fillOpacity="0.2"
      stroke="none"
    />
    <rect x="32" y="28" width="22" height="4" rx="2" />
    <rect x="32" y="36" width="14" height="4" rx="2" />
    <rect x="32" y="44" width="18" height="4" rx="2" />
  </svg>
);

const IconMobileUI = ({ color }) => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="18" y="6" width="28" height="52" rx="6" />
    <path d="M28 12h8" />
    <circle
      cx="32"
      cy="24"
      r="6"
      fill={color}
      fillOpacity="0.2"
      stroke="none"
    />
    <rect x="24" y="36" width="16" height="3" rx="1.5" />
    <rect x="24" y="42" width="12" height="3" rx="1.5" />
    <rect x="26" y="52" width="12" height="2" rx="1" fill={color} />
  </svg>
);

const IconUnifiedUI = ({ color }) => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Web Frame */}
    <rect x="4" y="14" width="40" height="30" rx="3" />
    <path d="M4 22h40" />
    <rect
      x="10"
      y="28"
      width="12"
      height="10"
      rx="2"
      fill={color}
      fillOpacity="0.2"
      stroke="none"
    />
    <rect x="26" y="28" width="14" height="3" rx="1.5" />
    <rect x="26" y="34" width="10" height="3" rx="1.5" />
    {/* Mobile Frame Overlap */}
    <rect
      x="36"
      y="24"
      width="22"
      height="34"
      rx="4"
      fill={DS.colors.card}
      strokeWidth="2"
    />
    <circle
      cx="47"
      cy="34"
      r="4"
      fill={color}
      fillOpacity="0.2"
      stroke="none"
    />
    <rect x="42" y="42" width="10" height="2" rx="1" />
    <rect x="42" y="47" width="7" height="2" rx="1" />
  </svg>
);

const IconLogicFlow = ({ color }) => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="24" width="16" height="16" rx="4" />
    <rect x="40" y="10" width="16" height="16" rx="4" />
    <rect x="40" y="38" width="16" height="16" rx="4" />
    <path d="M24 32h8v-14h8" />
    <path d="M24 32h8v14h8" />
    <circle cx="32" cy="32" r="3" fill={color} stroke="none" />
  </svg>
);

const IconDBStack = ({ color }) => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="32" cy="18" rx="16" ry="6" />
    <path d="M48 18v14c0 3.3-7.2 6-16 6s-16-2.7-16-6V18" />
    <path d="M48 32v14c0 3.3-7.2 6-16 6s-16-2.7-16-6V32" />
    <line
      x1="32"
      y1="24"
      x2="32"
      y2="24.1"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="38"
      x2="32"
      y2="38.1"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const Box = ({ icon, label, color, glow }) => (
  <div
    style={{
      width: 200,
      height: 200,
      background: DS.colors.card,
      border: `2px solid ${color}`,
      borderRadius: 32,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: glow
        ? `0 0 32px ${glow}, 0 12px 32px rgba(0,0,0,0.5)`
        : `0 12px 32px rgba(0,0,0,0.5)`,
      zIndex: 10,
    }}
  >
    {icon}
    <div
      style={{
        marginTop: 24,
        fontSize: 18,
        fontWeight: 700,
        color: DS.colors.textPrimary,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </div>
  </div>
);

// ─── UPDATED BADGELIST (With Inline Flicker Prevention) ───────────────────
const BadgeList = ({ forwardRef, items }) => (
  <div
    ref={forwardRef}
    style={{ display: "flex", flexDirection: "column", gap: 24 }}
  >
    {items.map((item, i) => (
      <div
        key={i}
        style={{
          opacity: 0, // Prevent Flicker
          transform: "translateX(-40px)", // Prevent Flicker
          padding: "18px 32px",
          background: DS.colors.card,
          borderLeft: `6px solid ${item.color}`,
          fontSize: 24,
          fontWeight: 600,
          color: DS.colors.textPrimary,
          borderRadius: "0 16px 16px 0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {item.label}
      </div>
    ))}
  </div>
);
// ─── SCENE 1: WELCOME BACK ────────────────────────────────────────────────
const Scene1_WelcomeBack = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const masterRef = useRef(null);
  const text1Ref = useRef(null),
    text2Ref = useRef(null);
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      masterRef.current = master;

      // Safe GSAP Initialization (Replaces inline CSS transforms)
      master.set([text1Ref.current, text2Ref.current], {
        opacity: 0,
        y: 40,
        scale: 0.95,
      });
      master.set(containerRef.current, { scale: 1 });

      master
        // Cinematic ambient zoom on the entire container

        // Sequence in elements
        .to(
          text1Ref.current,
          { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: DS.easing.enter },
          0.5,
        )
        .to(
          text2Ref.current,
          { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: DS.easing.enter },
          1.5,
        )

        // Clean outro
        .addLabel("outro", 4.5)
        .to(
          [text1Ref.current, text2Ref.current],
          {
            opacity: 0,
            y: -40,
            duration: 1.5,
            ease: DS.easing.exit,
            stagger: 0.2,
          },
          "outro",
        );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <ScaledStage>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          ref={text1Ref}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: DS.colors.textPrimary,
            margin: 0,
            letterSpacing: "-0.02em",
            textShadow: `0 12px 48px rgba(0,0,0,0.6)`, // Added depth
          }}
        >
          Welcome back!
        </h1>
        <h2
          ref={text2Ref}
          style={{
            fontSize: 44,
            fontWeight: 400,
            color: DS.colors.textSecondary,
            margin: "32px 0 0 0",
          }}
        >
          Let’s look at the different ways we have to build an app.
        </h2>
      </div>
    </ScaledStage>
  );
};

// ─── SCENE 2: ON A HIGH LEVEL ─────────────────────────────────────────────
const Scene2_HighLevel = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const masterRef = useRef(null);
  const badgeRef = useRef(null),
    textRef = useRef(null),
    glowRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      masterRef.current = master;

      // Safe GSAP Initialization
      master.set(badgeRef.current, { opacity: 0, scale: 0.8, y: 30 });
      master.set(textRef.current, { opacity: 0, scale: 0.95, y: 30 });
      master.set(glowRef.current, { opacity: 0, scale: 0.5 });

      master
        // Reveal a subtle ambient backlight for the badge
        .to(
          glowRef.current,
          { opacity: 0.4, scale: 1, duration: 2, ease: DS.easing.smooth },
          0.2,
        )

        // Snap elements in
        .to(
          badgeRef.current,
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: DS.easing.spring },
          0.5,
        )
        .to(
          textRef.current,
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: DS.easing.enter },
          1.2,
        )

        // Clean outro
        .addLabel("outro", 4)
        .to(
          [badgeRef.current, textRef.current, glowRef.current],
          {
            opacity: 0,
            y: -30,
            scale: 0.95,
            duration: 1,
            ease: DS.easing.exit,
            stagger: 0.1,
          },
          "outro",
        );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <ScaledStage>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Cinematic ambient backlight behind badge */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            width: 400,
            opacity: 0,
            height: 160,
            background: DS.colors.cyan,
            filter: "blur(80px)",
            transform: "translateY(-40px) scale(0.5)",
            zIndex: 0,
            borderRadius: "50%",
          }}
        />

        <div
          ref={badgeRef}
          style={{
            zIndex: 10,
            padding: "16px 40px",
            background: DS.colors.panel,
            border: `2px solid ${DS.colors.cyan}`,
            borderRadius: 9999,
            color: DS.colors.cyan,
            fontSize: 24,
            fontWeight: 800,
            textTransform: "uppercase",
            opacity: 0, // <-- ADD THIS
            transform: "scale(0.8) translateY(30px)", // <-- ADD THIS
            letterSpacing: "0.1em",
            boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 32px ${DS.colors.cyanGlow}, inset 0 0 16px ${DS.colors.cyanGlow}`,
          }}
        >
          On a high level
        </div>

        <h3
          ref={textRef}
          style={{
            zIndex: 10,
            fontSize: 56,
            fontWeight: 700,
            color: DS.colors.textPrimary,
            margin: "40px 0 0 0",
            textShadow: `0 12px 48px rgba(0,0,0,0.6)`,
            opacity: 0, // <-- ADD THIS
            transform: "scale(0.95) translateY(30px)", // <-- ADD THIS
          }}
        >
          There are three main ways
        </h3>
      </div>
    </ScaledStage>
  );
};

// ─── SCENE 3: TRADITIONAL ─────────────────────────────────────────────────
const Scene3_Traditional = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const masterRef = useRef(null);

  const titleRef = useRef(null);
  const staticLinesAppLogicRef = useRef(null),
    flowLinesAppLogicRef = useRef(null);
  const staticLinesLogicDBRef = useRef(null),
    flowLinesLogicDBRef = useRef(null);
  const badges1Ref = useRef(null),
    badges2Ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      masterRef.current = master;

      master
        // 1. Bring in the title
        .to(
          titleRef.current,
          { opacity: 1, y: 0, duration: 1.5, ease: DS.easing.enter },
          0.5,
        )

        // 2. Show Frontend Apps (Web & Mobile)
        .to(
          [".node-web", ".node-mobile"],
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: DS.easing.spring,
          },
          1.5,
        )

        // 3. Draw lines to Logic, then pop Logic in
        .to(
          staticLinesAppLogicRef.current,
          { strokeDashoffset: 0, duration: 1.0, ease: DS.easing.smooth },
          2.5,
        )
        .to(
          ".node-logic",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          3.0,
        )
        .to(flowLinesAppLogicRef.current, { opacity: 1, duration: 0.5 }, 3.5)
        .to(
          flowLinesAppLogicRef.current,
          { strokeDashoffset: -1000, duration: 20, ease: DS.easing.slowFlow },
          3.5,
        )

        // 4. Draw lines to Database, then pop Database in
        .to(
          staticLinesLogicDBRef.current,
          { strokeDashoffset: 0, duration: 1.0, ease: DS.easing.smooth },
          4.5,
        )
        .to(
          ".node-db",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          5.0,
        )
        .to(flowLinesLogicDBRef.current, { opacity: 1, duration: 0.5 }, 5.5)
        .to(
          flowLinesLogicDBRef.current,
          { strokeDashoffset: -1000, duration: 20, ease: DS.easing.slowFlow },
          5.5,
        )

        // 5. Fly in the left-side badges sequentially
        .to(
          badges1Ref.current.children,
          {
            opacity: 1,
            x: 0,
            duration: 1.0,
            stagger: 0.2,
            ease: DS.easing.enter,
          },
          7.0,
        )
        .to(
          badges2Ref.current.children,
          {
            opacity: 1,
            x: 0,
            duration: 1.0,
            stagger: 0.2,
            ease: DS.easing.enter,
          },
          8.5,
        )

        // 6. Clean Outro
        .addLabel("outro", 18)
        .to(
          masterRef.current.getChildren(),
          { opacity: 0, y: -20, duration: 1.5, ease: DS.easing.exit },
          "outro",
        );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <ScaledStage>
      {/* ─── TITLE ─── */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          ref={titleRef}
          style={{ opacity: 0, transform: "translateY(-20px)" }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: DS.colors.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            1. Traditional Approach
          </div>
          <div
            style={{
              width: 120,
              height: 6,
              background: DS.colors.cyan,
              marginTop: 24,
              borderRadius: 3,
              margin: "24px auto 0 auto",
            }}
          ></div>
        </div>
      </div>

      {/* ─── LINES: APP -> LOGIC ─── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 0,
        }}
      >
        <g
          ref={staticLinesAppLogicRef}
          stroke={DS.colors.border}
          strokeWidth="6"
          fill="none"
          strokeDasharray="500"
          strokeDashoffset="500"
        >
          <path d="M 760 360 L 1000 520" /> {/* Web to Logic */}
          <path d="M 760 680 L 1000 520" /> {/* Mobile to Logic */}
        </g>
      </svg>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
        }}
      >
        <g
          ref={flowLinesAppLogicRef}
          stroke={DS.colors.cyan}
          strokeWidth="6"
          fill="none"
          strokeDasharray="16 32"
          opacity="0"
          style={{ filter: `drop-shadow(0 0 12px ${DS.colors.cyanGlow})` }}
        >
          <path d="M 760 360 L 1000 520" />
          <path d="M 760 680 L 1000 520" />
        </g>
      </svg>

      {/* ─── LINES: LOGIC -> DB ─── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 0,
        }}
      >
        <g
          ref={staticLinesLogicDBRef}
          stroke={DS.colors.border}
          strokeWidth="6"
          fill="none"
          strokeDasharray="500"
          strokeDashoffset="500"
        >
          <path d="M 1200 520 L 1440 520" /> {/* Logic to DB */}
        </g>
      </svg>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
        }}
      >
        <g
          ref={flowLinesLogicDBRef}
          stroke={DS.colors.cyan}
          strokeWidth="6"
          fill="none"
          strokeDasharray="16 32"
          opacity="0"
          style={{ filter: `drop-shadow(0 0 12px ${DS.colors.cyanGlow})` }}
        >
          <path d="M 1200 520 L 1440 520" />
        </g>
      </svg>

      {/* ─── NODES (Structure separates positioning from GSAP scaling) ─── */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      >
        {/* Frontend Layer */}
        <div
          style={{
            position: "absolute",
            top: 360,
            left: 660,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="node-web"
            style={{ opacity: 0, transform: "scale(0.8)" }}
          >
            <Box
              icon={<IconWebUI color={DS.colors.cyan} />}
              label="Web App"
              color={DS.colors.cyan}
              glow={DS.colors.cyanGlow}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 680,
            left: 660,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="node-mobile"
            style={{ opacity: 0, transform: "scale(0.8)" }}
          >
            <Box
              icon={<IconMobileUI color={DS.colors.cyan} />}
              label="Mobile App"
              color={DS.colors.cyan}
              glow={DS.colors.cyanGlow}
            />
          </div>
        </div>

        {/* Logic Layer */}
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 1100,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="node-logic"
            style={{ opacity: 0, transform: "scale(0.8)" }}
          >
            <Box
              icon={<IconLogicFlow color={DS.colors.textSecondary} />}
              label="Logic"
              color={DS.colors.border}
            />
          </div>
        </div>

        {/* Database Layer */}
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 1540,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="node-db"
            style={{ opacity: 0, transform: "scale(0.8)" }}
          >
            <Box
              icon={<IconDBStack color={DS.colors.textSecondary} />}
              label="Database"
              color={DS.colors.border}
            />
          </div>
        </div>
      </div>

      {/* ─── BADGES ─── */}
      <div style={{ position: "absolute", top: 320, left: 100 }}>
        <BadgeList
          forwardRef={badges1Ref}
          items={[
            { label: "High Flexibility", color: DS.colors.green },
            { label: "Strong Performance", color: DS.colors.green },
          ]}
        />
      </div>

      <div style={{ position: "absolute", top: 580, left: 100 }}>
        <BadgeList
          forwardRef={badges2Ref}
          items={[
            { label: "Heavy Coding", color: DS.colors.amber },
            { label: "More Configuration", color: DS.colors.amber },
            { label: "High Maintenance", color: DS.colors.amber },
          ]}
        />
      </div>
    </ScaledStage>
  );
};
// ─── SCENE 4: CROSS PLATFORM ──────────────────────────────────────────────
const Scene4_CrossPlatform = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const masterRef = useRef(null);

  const titleRef = useRef(null);
  const staticLinesAppLogicRef = useRef(null),
    flowLinesAppLogicRef = useRef(null);
  const staticLinesLogicDBRef = useRef(null),
    flowLinesLogicDBRef = useRef(null);
  const badges1Ref = useRef(null),
    badges2Ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      masterRef.current = master;

      // 1. Safe Initialization using GSAP (No inline transforms on animated elements)
      master.set(titleRef.current, { opacity: 0, y: -20 });
      master.set(".node-unified, .node-logic, .node-db", {
        opacity: 0,
        scale: 0.8,
      });

      master.set(staticLinesAppLogicRef.current, {
        strokeDasharray: 500,
        strokeDashoffset: 500,
      });
      master.set(flowLinesAppLogicRef.current, { opacity: 0 });

      master.set(staticLinesLogicDBRef.current, {
        strokeDasharray: 500,
        strokeDashoffset: 500,
      });
      master.set(flowLinesLogicDBRef.current, { opacity: 0 });

      master.set([badges1Ref.current.children, badges2Ref.current.children], {
        opacity: 0,
        x: -40,
      });

      // 2. Orchestration
      master
        .to(
          titleRef.current,
          { opacity: 1, y: 0, duration: 1.5, ease: DS.easing.enter },
          0.5,
        )

        // Show Unified Frontend App
        .to(
          ".node-unified",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          1.5,
        )

        // Show Logic & Connect App to Logic
        .to(
          ".node-logic",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          3.0,
        )
        .to(
          staticLinesAppLogicRef.current,
          { strokeDashoffset: 0, duration: 1.5, ease: DS.easing.smooth },
          3.5,
        )
        .to(flowLinesAppLogicRef.current, { opacity: 1, duration: 0.5 }, 4.5)
        .to(
          flowLinesAppLogicRef.current,
          { strokeDashoffset: -1000, duration: 20, ease: DS.easing.slowFlow },
          4.5,
        )

        // Show Database & Connect Logic to Database
        .to(
          ".node-db",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          5.5,
        )
        .to(
          staticLinesLogicDBRef.current,
          { strokeDashoffset: 0, duration: 1.5, ease: DS.easing.smooth },
          6.0,
        )
        .to(flowLinesLogicDBRef.current, { opacity: 1, duration: 0.5 }, 7.0)
        .to(
          flowLinesLogicDBRef.current,
          { strokeDashoffset: -1000, duration: 20, ease: DS.easing.slowFlow },
          7.0,
        )

        // Fly in badges smoothly
        .to(
          badges1Ref.current.children,
          {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.2,
            ease: DS.easing.enter,
          },
          8.5,
        )
        .to(
          badges2Ref.current.children,
          {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.2,
            ease: DS.easing.enter,
          },
          10.0,
        )

        // Clean Outro
        .addLabel("outro", 18)
        .to(
          masterRef.current.getChildren(),
          { opacity: 0, y: -20, duration: 1.5, ease: DS.easing.exit },
          "outro",
        );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <ScaledStage>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div ref={titleRef}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: DS.colors.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            2. Cross-Platform Approach
          </div>
          <div
            style={{
              width: 120,
              height: 6,
              background: DS.colors.purple,
              marginTop: 24,
              borderRadius: 3,
              margin: "24px auto 0 auto",
            }}
          ></div>
        </div>
      </div>

      {/* ─── LINES: APP -> LOGIC ─── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 0,
        }}
      >
        <g
          ref={staticLinesAppLogicRef}
          stroke={DS.colors.border}
          strokeWidth="6"
          fill="none"
        >
          <path d="M 760 520 L 1000 520" /> {/* Unified App to Logic */}
        </g>
      </svg>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
        }}
      >
        <g
          ref={flowLinesAppLogicRef}
          stroke={DS.colors.purple}
          strokeWidth="6"
          fill="none"
          strokeDasharray="16 32"
          style={{ filter: `drop-shadow(0 0 12px ${DS.colors.purpleGlow})` }}
        >
          <path d="M 760 520 L 1000 520" />
        </g>
      </svg>

      {/* ─── LINES: LOGIC -> DB ─── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 0,
        }}
      >
        <g
          ref={staticLinesLogicDBRef}
          stroke={DS.colors.border}
          strokeWidth="6"
          fill="none"
        >
          <path d="M 1200 520 L 1440 520" /> {/* Logic to DB */}
        </g>
      </svg>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 1,
        }}
      >
        <g
          ref={flowLinesLogicDBRef}
          stroke={DS.colors.purple}
          strokeWidth="6"
          fill="none"
          strokeDasharray="16 32"
          style={{ filter: `drop-shadow(0 0 12px ${DS.colors.purpleGlow})` }}
        >
          <path d="M 1200 520 L 1440 520" />
        </g>
      </svg>

      {/* ─── NODES (Safely wrapped for perfect centering) ─── */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      >
        {/* Unified Frontend Layer */}
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 660,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="node-unified">
            <Box
              icon={<IconUnifiedUI color={DS.colors.purple} />}
              label="Web & Mobile"
              color={DS.colors.purple}
              glow={DS.colors.purpleGlow}
            />
          </div>
        </div>

        {/* Logic Layer */}
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 1100,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="node-logic">
            <Box
              icon={<IconLogicFlow color={DS.colors.textSecondary} />}
              label="Logic"
              color={DS.colors.border}
            />
          </div>
        </div>

        {/* Database Layer */}
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 1540,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="node-db">
            <Box
              icon={<IconDBStack color={DS.colors.textSecondary} />}
              label="Database"
              color={DS.colors.border}
            />
          </div>
        </div>
      </div>

      {/* ─── BADGES ─── */}
      {/* Notice we pass forwardRef DIRECTLY to the component, eliminating the wrapper div */}
      <div style={{ position: "absolute", top: 320, left: 100 }}>
        <BadgeList
          forwardRef={badges1Ref}
          items={[
            { label: "Faster Development", color: DS.colors.green },
            { label: "Good Flexibility", color: DS.colors.green },
            { label: "Strong Performance", color: DS.colors.green },
          ]}
        />
      </div>

      <div style={{ position: "absolute", top: 620, left: 100 }}>
        <BadgeList
          forwardRef={badges2Ref}
          items={[
            { label: "Still Needs Coding", color: DS.colors.amber },
            { label: "Setup & Maintenance", color: DS.colors.amber },
          ]}
        />
      </div>
    </ScaledStage>
  );
};

// ─── SCENE 5: LOW CODE ────────────────────────────────────────────────────
const Scene5_LowCode = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const masterRef = useRef(null);

  const titleRef = useRef(null),
    panelRef = useRef(null),
    innerElsRef = useRef(null);

  const orbitGroupRef = useRef(null),
    flowLinesPagesLogicRef = useRef(null),
    staticLinesPagesLogicRef = useRef(null),
    flowLinesLogicStorageRef = useRef(null),
    staticLinesLogicStorageRef = useRef(null),
    badgesRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      masterRef.current = master;

      // 1. Safe GSAP Initialization
      master.set(titleRef.current, { opacity: 0, y: -20 });
      master.set(panelRef.current, { opacity: 0, scale: 0.9 });

      master.set(".node-pages, .node-logic, .node-storage", {
        opacity: 0,
        scale: 0.8,
      });

      master.set(staticLinesPagesLogicRef.current, {
        strokeDasharray: 500,
        strokeDashoffset: 500,
      });
      master.set(flowLinesPagesLogicRef.current, { opacity: 0 });

      master.set(staticLinesLogicStorageRef.current, {
        strokeDasharray: 500,
        strokeDashoffset: 500,
      });
      master.set(flowLinesLogicStorageRef.current, { opacity: 0 });

      master.set(".orbit-badge", { opacity: 0, scale: 0 });

      // We initialize the badge items explicitly to catch them
      master.set(badgesRef.current.children, { opacity: 0, x: -40 });

      // 2. Orchestration
      master
        .to(
          titleRef.current,
          { opacity: 1, y: 0, duration: 1.5, ease: DS.easing.enter },
          0.5,
        )
        .to(
          panelRef.current,
          { opacity: 1, scale: 1, duration: 1.5, ease: DS.easing.smooth },
          1.5,
        )

        // Show Pages
        .to(
          ".node-pages",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          2.5,
        )

        // Connect & Show Logic
        .to(
          staticLinesPagesLogicRef.current,
          { strokeDashoffset: 0, duration: 1.0, ease: DS.easing.smooth },
          3.5,
        )
        .to(flowLinesPagesLogicRef.current, { opacity: 1, duration: 0.5 }, 4.0)
        .to(
          flowLinesPagesLogicRef.current,
          { strokeDashoffset: -1000, duration: 20, ease: DS.easing.slowFlow },
          4.0,
        )
        .to(
          ".node-logic",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          4.5,
        )

        // Connect & Show Storage
        .to(
          staticLinesLogicStorageRef.current,
          { strokeDashoffset: 0, duration: 1.0, ease: DS.easing.smooth },
          5.5,
        )
        .to(
          flowLinesLogicStorageRef.current,
          { opacity: 1, duration: 0.5 },
          6.0,
        )
        .to(
          flowLinesLogicStorageRef.current,
          { strokeDashoffset: -1000, duration: 20, ease: DS.easing.slowFlow },
          6.0,
        )
        .to(
          ".node-storage",
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          6.5,
        )

        // Pop in the platform orbit badges
        .to(
          ".orbit-badge",
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: DS.easing.spring,
          },
          8.5,
        )

        // Feature Badges on the left
        .to(
          badgesRef.current.children,
          {
            opacity: 1,
            x: 0,
            duration: 1.0,
            stagger: 0.2,
            ease: DS.easing.enter,
          },
          10.0,
        )

        // Clean Outro
        .addLabel("outro", 18)
        .to(
          masterRef.current.getChildren(),
          { opacity: 0, y: -20, duration: 1.5, ease: DS.easing.exit },
          "outro",
        );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <ScaledStage>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          ref={titleRef}
          style={{ opacity: 0, transform: "translateY(-20px)" }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: DS.colors.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            3. Low-Code Platforms
          </div>
          <div
            style={{
              width: 120,
              height: 6,
              background: DS.colors.green,
              marginTop: 24,
              borderRadius: 3,
              margin: "24px auto 0 auto",
            }}
          ></div>
        </div>
      </div>

      {/* Main Platform Container (Centered safely) */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 1100,
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      >
        <div
          ref={panelRef}
          style={{
            opacity: 0,
            transform: "scale(0.9)",
            width: 1000,
            height: 440,
            background: DS.colors.panel,
            border: `4px solid ${DS.colors.green}`,
            borderRadius: 64,
            boxShadow: `0 0 80px ${DS.colors.greenGlow}, inset 0 0 48px ${DS.colors.greenGlow}`,
            position: "relative",
          }}
        >
          {/* ─── LINES: PAGES -> LOGIC ─── */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
            }}
          >
            <g
              ref={staticLinesPagesLogicRef}
              stroke={DS.colors.green}
              strokeWidth="6"
              fill="none"
              opacity="0.4"
              strokeDasharray="500"
              strokeDashoffset="500"
            >
              <path d="M 290 220 L 410 220" />
            </g>
          </svg>
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <g
              ref={flowLinesPagesLogicRef}
              stroke={DS.colors.green}
              strokeWidth="6"
              fill="none"
              strokeDasharray="16 32"
              opacity="0"
              style={{ filter: `drop-shadow(0 0 12px ${DS.colors.greenGlow})` }}
            >
              <path d="M 290 220 L 410 220" />
            </g>
          </svg>

          {/* ─── LINES: LOGIC -> STORAGE ─── */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
            }}
          >
            <g
              ref={staticLinesLogicStorageRef}
              stroke={DS.colors.green}
              strokeWidth="6"
              fill="none"
              opacity="0.4"
              strokeDasharray="500"
              strokeDashoffset="500"
            >
              <path d="M 590 220 L 710 220" />
            </g>
          </svg>
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <g
              ref={flowLinesLogicStorageRef}
              stroke={DS.colors.green}
              strokeWidth="6"
              fill="none"
              strokeDasharray="16 32"
              opacity="0"
              style={{ filter: `drop-shadow(0 0 12px ${DS.colors.greenGlow})` }}
            >
              <path d="M 590 220 L 710 220" />
            </g>
          </svg>

          {/* ─── INNER NODES (Safely wrapped for perfect centering) ─── */}
          <div
            ref={innerElsRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 220,
                left: 200,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="node-pages"
                style={{ opacity: 0, transform: "scale(0.8)" }}
              >
                <Box
                  icon={<IconUnifiedUI color={DS.colors.green} />}
                  label="Pages"
                  color={DS.colors.green}
                  glow={DS.colors.greenGlow}
                />
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 220,
                left: 500,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="node-logic"
                style={{ opacity: 0, transform: "scale(0.8)" }}
              >
                <Box
                  icon={<IconLogicFlow color={DS.colors.green} />}
                  label="Logic"
                  color={DS.colors.green}
                  glow={DS.colors.greenGlow}
                />
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 220,
                left: 800,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="node-storage"
                style={{ opacity: 0, transform: "scale(0.8)" }}
              >
                <Box
                  icon={<IconDBStack color={DS.colors.green} />}
                  label="Storage"
                  color={DS.colors.green}
                  glow={DS.colors.greenGlow}
                />
              </div>
            </div>
          </div>

          {/* ─── ORBIT BADGES (Perfectly aligned to borders) ─── */}
          <div
            ref={orbitGroupRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            {/* Top Center */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="orbit-badge"
                style={{
                  opacity: 0,
                  transform: "scale(0)",
                  padding: "16px 36px",
                  background: DS.colors.bg,
                  border: `4px solid ${DS.colors.border}`,
                  borderRadius: 9999,
                  color: DS.colors.textPrimary,
                  fontSize: 24,
                  fontWeight: 800,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
                  whiteSpace: "nowrap",
                }}
              >
                Power Apps
              </div>
            </div>

            {/* Bottom Left */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 250,
                transform: "translate(-50%, 50%)",
              }}
            >
              <div
                className="orbit-badge"
                style={{
                  opacity: 0,
                  transform: "scale(0)",
                  padding: "16px 36px",
                  background: DS.colors.bg,
                  border: `4px solid ${DS.colors.border}`,
                  borderRadius: 9999,
                  color: DS.colors.textPrimary,
                  fontSize: 24,
                  fontWeight: 800,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
                  whiteSpace: "nowrap",
                }}
              >
                OutSystems
              </div>
            </div>

            {/* Bottom Right (Mendix Highlighted) */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 750,
                transform: "translate(-50%, 50%)",
              }}
            >
              <div
                className="orbit-badge"
                style={{
                  opacity: 0,
                  transform: "scale(0)",
                  padding: "16px 36px",
                  background: DS.colors.bg,
                  border: `4px solid ${DS.colors.cyan}`,
                  borderRadius: 9999,
                  color: DS.colors.cyan,
                  fontSize: 24,
                  fontWeight: 800,
                  boxShadow: `0 0 48px ${DS.colors.cyanGlow}`,
                  whiteSpace: "nowrap",
                }}
              >
                Mendix
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── LEFT SIDEBAR BADGES ─── */}
      <div style={{ position: "absolute", top: 380, left: 100 }}>
        {/* Pass forwardRef directly to BadgeList! */}
        <BadgeList
          forwardRef={badgesRef}
          items={[
            { label: "Fastest Development", color: DS.colors.green },
            { label: "No/Low Coding", color: DS.colors.green },
            { label: "Good Performance", color: DS.colors.cyan },
            {
              label: "Everything is Handled by Platform",
              color: DS.colors.green,
            },
          ]}
        />
      </div>
    </ScaledStage>
  );
};
// ─── SCENE 6: SARA & MENDIX ───────────────────────────────────────────────
// ─── SCENE 6: SARA & MENDIX ───────────────────────────────────────────────
const Scene6_SaraMendix = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const masterRef = useRef(null);

  const saraRef = useRef(null),
    connectorRef = useRef(null),
    flowPathRef = useRef(null);
  const feature1Ref = useRef(null),
    feature2Ref = useRef(null);

  // Morph refs
  const platformContainerRef = useRef(null),
    platformBoxRef = useRef(null);
  const platformIconsRef = useRef(null),
    mendixImageRef = useRef(null);
  const mendixTextRef = useRef(null),
    nextTextRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      masterRef.current = master;

      // 1. Safe GSAP Initialization (No inline transforms on animated elements)
      master.set(saraRef.current, { opacity: 0, x: -100 });
      master.set(platformContainerRef.current, { opacity: 0, x: 100 });
      master.set(connectorRef.current, {
        strokeDasharray: 850,
        strokeDashoffset: 850,
      });
      master.set(flowPathRef.current, { opacity: 0 });
      master.set(feature1Ref.current, { opacity: 0, scale: 0.8, y: 20 });
      master.set(feature2Ref.current, { opacity: 0, scale: 0.8, y: -20 });
      master.set(mendixImageRef.current, { opacity: 0, scale: 0.5 });
      master.set(mendixTextRef.current, { opacity: 0, y: 30 });
      master.set(nextTextRef.current, { opacity: 0, y: 20 });

      // 2. Orchestration
      master
        .to(
          saraRef.current,
          { opacity: 1, x: 0, duration: 1.5, ease: DS.easing.spring },
          0.5,
        )
        .to(
          platformContainerRef.current,
          { opacity: 1, x: 0, duration: 1.5, ease: DS.easing.spring },
          1.5,
        )

        // Draw connector exactly 850px (edge of Sara to edge of Platform)
        .to(
          connectorRef.current,
          { strokeDashoffset: 0, duration: 1.5, ease: DS.easing.smooth },
          3,
        )

        // Flow data
        .to(flowPathRef.current, { opacity: 1, duration: 0.5 }, 4.5)
        .to(
          flowPathRef.current,
          { strokeDashoffset: -1000, duration: 20, ease: DS.easing.slowFlow },
          4.5,
        )

        // Feature cards pop out above and below the line
        .to(
          feature1Ref.current,
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: DS.easing.spring },
          5.5,
        )
        .to(
          feature2Ref.current,
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: DS.easing.spring },
          6.5,
        )

        // ─── THE MORPH TRANSITION ───
        .addLabel("morph", 11)

        // 1. Fade out left elements
        .to(
          [
            saraRef.current,
            feature1Ref.current,
            feature2Ref.current,
            connectorRef.current,
            flowPathRef.current,
          ],
          { opacity: 0, duration: 1, ease: DS.easing.smooth },
          "morph",
        )

        // 2. Glide the container to the exact screen center (-560px from 1520 = 960)
        .to(
          platformContainerRef.current,
          { x: -560, duration: 1.5, ease: DS.easing.smooth },
          "morph",
        )

        // 3. Smoothly transform the box into the Mendix logo container
        .to(
          platformBoxRef.current,
          {
            borderColor: DS.colors.cyan,
            boxShadow: `0 0 160px ${DS.colors.cyanGlow}, inset 0 0 64px ${DS.colors.cyanGlow}`,
            borderRadius: 80,
            backgroundColor: DS.colors.panel,
            duration: 1.5,
            ease: DS.easing.smooth,
          },
          "morph",
        )

        // 4. Cross-fade the icons for the actual Mendix image
        .to(
          platformIconsRef.current,
          { opacity: 0, scale: 0.8, duration: 0.8, ease: DS.easing.smooth },
          "morph",
        )
        .to(
          mendixImageRef.current,
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.spring },
          "morph+=0.5",
        )

        // 5. Fade in the bold text below the box
        .to(
          mendixTextRef.current,
          { opacity: 1, y: 0, duration: 1.2, ease: DS.easing.enter },
          "morph+=1",
        )
        .to(
          nextTextRef.current,
          { opacity: 1, y: 0, duration: 1.5, ease: DS.easing.enter },
          "morph+=1.5",
        )

        // Clean outro
        .addLabel("outro", 18.5)
        .to(
          masterRef.current.getChildren(),
          { opacity: 0, duration: 1.5, ease: DS.easing.exit },
          "outro",
        );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <ScaledStage>
      {/* 1. Static & Flowing Connector Lines (Aligned exactly at y=540) */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          zIndex: 0,
        }}
      >
        <path
          ref={connectorRef}
          d="M 490 540 L 1340 540"
          stroke={DS.colors.green}
          strokeWidth="8"
          fill="none"
        />
        <path
          ref={flowPathRef}
          d="M 490 540 L 1340 540"
          stroke="#FFFFFF"
          strokeWidth="8"
          fill="none"
          strokeDasharray="16 48"
          style={{ filter: `drop-shadow(0 0 16px #FFFFFF)` }}
        />
      </svg>

      {/* 2. SARA NODE (Strict absolute geometry. Center of circle is mathematically locked to 540) */}
      <div style={{ position: "absolute", top: 540, left: 400, zIndex: 10 }}>
        <div ref={saraRef}>
          {/* Sara Circle */}
          <div
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 180,
              height: 180,
              background: DS.colors.card,
              border: `6px solid ${DS.colors.border}`,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 12px 32px rgba(0,0,0,0.6)`,
            }}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="none"
              stroke={DS.colors.textPrimary}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          {/* Sara Label (Positioned safely below the exact center) */}
          <div
            style={{
              position: "absolute",
              top: 120,
              transform: "translateX(-50%)",
              padding: "16px 40px",
              background: DS.colors.panel,
              border: `2px solid ${DS.colors.border}`,
              borderRadius: 9999,
              color: DS.colors.textPrimary,
              fontSize: 26,
              fontWeight: 700,
              boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
              whiteSpace: "nowrap",
            }}
          >
            Sara / Shop Owner
          </div>
        </div>
      </div>

      {/* 3. FLOATING FEATURES */}
      <div style={{ position: "absolute", top: 440, left: 915, zIndex: 5 }}>
        <div
          ref={feature1Ref}
          style={{
            position: "absolute",
            transform: "translate(-50%, -50%)",
            padding: "16px 32px",
            background: DS.colors.bg,
            border: `2px solid ${DS.colors.green}`,
            borderRadius: 16,
            color: DS.colors.green,
            fontSize: 28,
            fontWeight: 800,
            textTransform: "uppercase",
            boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 24px ${DS.colors.greenGlow}`,
            whiteSpace: "nowrap",
          }}
        >
          Faster Building
        </div>
      </div>

      <div style={{ position: "absolute", top: 640, left: 915, zIndex: 5 }}>
        <div
          ref={feature2Ref}
          style={{
            position: "absolute",
            transform: "translate(-50%, -50%)",
            padding: "16px 32px",
            background: DS.colors.bg,
            border: `2px solid ${DS.colors.cyan}`,
            borderRadius: 16,
            color: DS.colors.cyan,
            fontSize: 28,
            fontWeight: 800,
            textTransform: "uppercase",
            boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 24px ${DS.colors.cyanGlow}`,
            whiteSpace: "nowrap",
          }}
        >
          Simpler Setup
        </div>
      </div>

      {/* 4. PLATFORM & MENDIX MORPH CONTAINER */}
      <div style={{ position: "absolute", top: 540, left: 1520, zIndex: 20 }}>
        <div ref={platformContainerRef}>
          {/* The Morphing Box (Center strictly locked) */}
          <div
            ref={platformBoxRef}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 360,
              height: 360,
              background: DS.colors.card,
              border: `6px solid ${DS.colors.green}`,
              borderRadius: 64,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 64px ${DS.colors.greenGlow}`,
            }}
          >
            {/* Outgoing Icons */}
            <div
              ref={platformIconsRef}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <IconUnifiedUI color={DS.colors.green} />
              <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
                <IconLogicFlow color={DS.colors.green} />
                <IconDBStack color={DS.colors.green} />
              </div>
            </div>

            {/* Incoming Mendix Image */}
            <div ref={mendixImageRef} style={{ position: "absolute" }}>
              <img
                src={staticFile("mendix.png")}
                alt="Mendix Logo"
                style={{ width: 300, height: 300, objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Morphing text below box (220px below center places it 40px below the box edge) */}
          <div
            ref={mendixTextRef}
            style={{
              position: "absolute",
              top: 220,
              transform: "translateX(-50%)",
              fontSize: 80,
              fontWeight: 900,
              color: DS.colors.textPrimary,
              letterSpacing: "-0.02em",
              textShadow: `0 0 24px ${DS.colors.cyanGlow}`,
            }}
          >
            MENDIX
          </div>
        </div>
      </div>

      {/* 5. NEXT CAPTION */}
      <div style={{ position: "absolute", bottom: 120, left: 960, zIndex: 20 }}>
        <div
          ref={nextTextRef}
          style={{
            position: "absolute",
            transform: "translate(-50%, 0)",
            fontSize: 40,
            fontWeight: 700,
            color: DS.colors.textSecondary,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Next: Discover Mendix
        </div>
      </div>
    </ScaledStage>
  );
};
// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────────────
export default function MainScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: DS.colors.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <Sequence from={0} durationInFrames={360}>
        <Scene1_WelcomeBack />
      </Sequence>
      <Sequence from={360} durationInFrames={300}>
        <Scene2_HighLevel />
      </Sequence>
      <Sequence from={660} durationInFrames={1170}>
        <Scene3_Traditional />
      </Sequence>
      <Sequence from={1830} durationInFrames={1170}>
        <Scene4_CrossPlatform />
      </Sequence>
      <Sequence from={3000} durationInFrames={1170}>
        <Scene5_LowCode />
      </Sequence>
      <Sequence from={4170} durationInFrames={1200}>
        <Scene6_SaraMendix />
      </Sequence>
    </AbsoluteFill>
  );
}
