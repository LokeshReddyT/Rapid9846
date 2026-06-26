import React, { useEffect, useRef } from "react";
import {
  Composition,
  Sequence,
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";
import { gsap } from "gsap";

// ── 1. DESIGN TOKENS (Scaled for 4K / 3840x2160) ─────────────
const DS = {
  colors: {
    bg: "#0B0F19",
    panel: "#0F172A",
    card: "#1E293B",
    cardElevated: "#243347",
    borderSubtle: "#1E293B",
    borderDefault: "#334155",
    borderBright: "#475569",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textTertiary: "#64748B",
    cyan: "#38BDF8",
    purple: "#A78BFA",
    green: "#34D399",
    amber: "#FBBF24",
    rose: "#FB7185",
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
    bodyMd: {
      fontSize: 36,
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
  spacing: { md: 48, lg: 64, xl: 96 },
  radius: { md: 24, lg: 32, xl: 48, pill: 9999 },
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

// ── 3. PRIMITIVES ───────────────────────────────────────────
const IdleFloat = ({ children, delay = 0, speed = 25, amount = 15 }) => {
  const frame = useCurrentFrame();
  const y = Math.sin((frame + delay) / speed) * amount;
  return (
    <div
      style={{
        transform: `translateY(${y}px)`,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};

const Card = React.forwardRef(({ children, style, glow }, ref) => (
  <div
    ref={ref}
    style={{
      background: DS.colors.card,
      border: `4px solid ${glow ? DS.colors.cyan : DS.colors.borderDefault}`,
      borderRadius: DS.radius.lg,
      padding: DS.spacing.lg,
      boxShadow: glow ? DS.shadows.glowCyan : DS.shadows.card,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
));

const Badge = React.forwardRef(({ text, color, style }, ref) => (
  <div
    ref={ref}
    style={{
      background: `rgba(${color === "cyan" ? "56,189,248" : "251,191,36"}, 0.15)`,
      border: `2px solid ${color === "cyan" ? DS.colors.cyan : DS.colors.amber}`,
      borderRadius: DS.radius.pill,
      padding: "8px 24px",
      color: color === "cyan" ? DS.colors.cyan : DS.colors.amber,
      ...DS.font.label,
      ...style,
    }}
  >
    {text}
  </div>
));

// ── 4. SCENES ───────────────────────────────────────────────

const WelcomeScene = () => {
  const stageRef = useRef(null);
  const textRef = useRef(null);
  const masterRef = useRef(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    masterRef.current = tl;

    gsap.set(textRef.current, { opacity: 0, scale: 0.9 });

    tl.to(
      textRef.current,
      { scale: 1, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.5)" },
      0.5,
    ).to(
      textRef.current,
      { opacity: 0, duration: 1, ease: "power2.inOut" },
      4.5,
    );

    return () => tl.kill();
  }, []);

  useGSAPSync(masterRef, 6);

  const bgPulse = 0.5 + Math.sin(frame / 30) * 0.2;

  return (
    <AbsoluteFill
      ref={stageRef}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div
        style={{
          position: "absolute",
          width: 2000,
          height: 2000,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(56,189,248,${bgPulse * 0.1}) 0%, transparent 70%)`,
        }}
      />
      <h1
        ref={textRef}
        style={{
          fontSize: "240px",
          fontWeight: 800,
          color: DS.colors.textPrimary,
          margin: 0,
        }}
      >
        Welcome Back
      </h1>
    </AbsoluteFill>
  );
};

const Scene1 = () => {
  const refs = useRef({});
  const masterRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    masterRef.current = tl;
    const {
      phoneGroup,
      phoneGlow,
      user1,
      bug,
      user2,
      bubble,
      caption1,
      badgeV1,
      badgeV2,
      caption2,
      stage,
    } = refs.current;

    // Initialize all states
    gsap.set(
      [phoneGroup, user1, bug, user2, bubble, caption1, badgeV2, caption2],
      { opacity: 0 },
    );
    gsap.set(phoneGlow, { opacity: 0 });

    // Setup initial slide offsets
    gsap.set(phoneGroup, { y: 150 });
    gsap.set(user1, { x: 300 });
    gsap.set(user2, { x: -300 });
    gsap.set(bug, { y: 200, x: 50 });
    gsap.set(bubble, { y: 50, scale: 0.5 });
    gsap.set(badgeV1, { opacity: 1 });
    gsap.set([caption1, caption2], { y: 40 });

    // Scene Sequence
    tl.to(
      phoneGroup,
      { y: 0, opacity: 1, duration: 1.2, ease: "back.out(1.2)" },
      1,
    )
      .to(user1, { x: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 2)

      // Bug attacks
      .to(bug, { y: -40, opacity: 1, duration: 1, ease: "back.out(1.5)" }, 3.5)
      .to(
        phoneGroup,
        { x: 15, yoyo: true, repeat: 5, duration: 0.08, ease: "none" },
        4,
      )
      .to(
        phoneGlow,
        {
          opacity: 1,
          borderColor: "#FB7185",
          boxShadow: "0 0 64px rgba(251,113,133,0.4)",
          duration: 0.3,
        },
        4,
      )

      // Feature request enters
      .to(user2, { x: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 5.5)
      .to(
        bubble,
        { y: -120, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" },
        6.5,
      )

      // Request sent to phone
      .to(bubble, { x: 550, y: -20, duration: 1.2, ease: "power2.inOut" }, 7.5)
      .to(
        phoneGroup,
        { x: -15, yoyo: true, repeat: 5, duration: 0.08, ease: "none" },
        8.7,
      )
      .to(
        phoneGlow,
        { borderColor: "#FBBF24", boxShadow: "0 0 64px rgba(251,191,36,0.4)" },
        8.7,
      )

      // First Caption
      .to(caption1, { opacity: 1, y: 0, duration: 1 }, 9.5)

      // Resolution & Upgrade (Bug fixed, separated opacity/scale so V2 stays visible)
      .to(
        [bug, bubble],
        { opacity: 0, y: "+=50", duration: 0.6, ease: "power2.in" },
        11.5,
      )
      .to(
        phoneGlow,
        {
          borderColor: "#38BDF8",
          boxShadow: "0 0 64px rgba(56,189,248,0.4)",
          duration: 0.5,
        },
        11.7,
      )
      .to(badgeV1, { opacity: 0, scale: 0.8, duration: 0.4 }, 11.7)
      .to(badgeV2, { opacity: 1, scale: 1.3, duration: 0.3 }, 11.7)
      .to(badgeV2, { scale: 1, duration: 0.3 }, 12.0)

      // Second Caption
      .to(caption1, { opacity: 0, y: -20, duration: 0.5 }, 12)
      .to(caption2, { opacity: 1, y: 0, duration: 1 }, 12.5)

      // Cleanup
      .to(stage, { opacity: 0, duration: 1 }, 14.5);

    return () => tl.kill();
  }, []);

  useGSAPSync(masterRef, 15.5);

  return (
    <AbsoluteFill
      ref={(el) => (refs.current.stage = el)}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      {/* Central Anchor Point (0x0) */}
      <div style={{ position: "relative", width: 0, height: 0 }}>
        {/* User 2 (Left) - Scaled up and spaced wider */}
        <div
          ref={(el) => (refs.current.user2 = el)}
          style={{
            position: "absolute",
            left: -1100,
            top: -150,
            transform: "scale(1.5)",
          }}
        >
          <UserIcon color={DS.colors.textSecondary} label="User Request" />
          <div
            ref={(el) => (refs.current.bubble = el)}
            style={{ position: "absolute", top: -50, left: 80 }}
          >
            <BubbleIcon />
          </div>
        </div>

        {/* Phone (Center) - Increased dimensions */}
        <div
          ref={(el) => (refs.current.phoneGroup = el)}
          style={{ position: "absolute", left: -250, top: -400 }}
        >
          <Card
            style={{
              width: 500,
              height: 800,
              position: "relative",
              padding: 0,
            }}
          >
            <div
              ref={(el) => (refs.current.phoneGlow = el)}
              style={{
                position: "absolute",
                inset: 0,
                border: `6px solid transparent`,
                borderRadius: DS.radius.lg,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 32,
                border: `4px solid ${DS.colors.borderBright}`,
                borderRadius: DS.radius.md,
              }}
            />

            {/* Badges centered at bottom */}
            <div
              style={{
                position: "absolute",
                bottom: -30,
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                ref={(el) => (refs.current.badgeV1 = el)}
                style={{ position: "absolute" }}
              >
                <Badge
                  text="v 1.0"
                  color="cyan"
                  style={{ fontSize: 24, padding: "12px 32px" }}
                />
              </div>
              <div
                ref={(el) => (refs.current.badgeV2 = el)}
                style={{ position: "absolute" }}
              >
                <Badge
                  text="v 2.0"
                  color="amber"
                  style={{
                    background: DS.colors.card,
                    fontSize: 24,
                    padding: "12px 32px",
                  }}
                />
              </div>
            </div>
          </Card>

          <div
            ref={(el) => (refs.current.bug = el)}
            style={{
              position: "absolute",
              bottom: 150,
              right: -60,
              zIndex: 10,
              transform: "scale(1.3)",
            }}
          >
            <BugIcon />
          </div>
        </div>

        {/* User 1 (Right) - Scaled up and spaced wider */}
        <div
          ref={(el) => (refs.current.user1 = el)}
          style={{
            position: "absolute",
            left: 800,
            top: -150,
            transform: "scale(1.5)",
          }}
        >
          <UserIcon color={DS.colors.textPrimary} label="Users" />
        </div>
      </div>

      {/* Captions */}
      <div
        style={{
          position: "absolute",
          bottom: 250,
          width: "100%",
          height: 100,
        }}
      >
        <h2
          ref={(el) => (refs.current.caption1 = el)}
          style={{
            ...DS.font.h2,
            color: DS.colors.cyan,
            position: "absolute",
            width: "100%",
            textAlign: "center",
          }}
        >
          An app is never truly done.
        </h2>
        <h2
          ref={(el) => (refs.current.caption2 = el)}
          style={{
            ...DS.font.h2,
            color: DS.colors.amber,
            position: "absolute",
            width: "100%",
            textAlign: "center",
          }}
        >
          It grows. It evolves.
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// ── ENHANCED ICONS (Larger, Thicker, Clearer) ────────────────

const EggIcon = ({ color }) => (
  <svg width="200" height="200" viewBox="0 0 100 100">
    <path
      d="M20,70 Q50,90 80,70 Q50,60 20,70 Z"
      fill="none"
      stroke={DS.colors.green}
      strokeWidth="5"
    />
    <ellipse
      cx="50"
      cy="50"
      rx="16"
      ry="24"
      fill="none"
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const CaterpillarIcon = ({ color }) => (
  <svg width="200" height="200" viewBox="0 0 100 100">
    <circle cx="25" cy="65" r="12" fill="none" stroke={color} strokeWidth="5" />
    <circle cx="50" cy="55" r="14" fill="none" stroke={color} strokeWidth="5" />
    <circle cx="75" cy="45" r="16" fill="none" stroke={color} strokeWidth="5" />
    <path
      d="M75,29 L60,10 M75,29 L90,10"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const ChrysalisIcon = ({ color }) => (
  <svg width="200" height="200" viewBox="0 0 100 100">
    <line
      x1="20"
      y1="20"
      x2="80"
      y2="20"
      stroke={DS.colors.borderBright}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path d="M50,20 L50,30" stroke={color} strokeWidth="4" />
    <path
      d="M50,30 Q75,45 60,80 Q50,95 40,80 Q25,45 50,30 Z"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
  </svg>
);

const ButterflyIcon = ({ color }) => (
  <svg width="200" height="200" viewBox="0 0 100 100">
    <path
      d="M50,20 L50,80"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M50,30 Q5,5 20,50 Q30,65 50,50"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M50,30 Q95,5 80,50 Q70,65 50,50"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M50,50 Q15,65 25,85 Q40,85 50,70"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M50,50 Q85,65 75,85 Q60,85 50,70"
      fill="none"
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M50,20 L35,5 M50,20 L65,5"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

// ── REBUILT CLOCK NODE ───────────────────────────────────────── SCENE 2 COMPONENT ─────────────────────────────────────────

const CycleIcon = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    stroke={DS.colors.amber}
    strokeWidth="6"
    fill="none"
  >
    <path d="M50,20 A30,30 0 1,1 20,50" />
    <path d="M50,80 A30,30 0 1,1 80,50" />
    <path d="M50,20 L55,30 M50,20 L40,25" />
    <path d="M80,50 L75,40 M80,50 L70,45" />
  </svg>
);

const Scene2 = () => {
  const refs = useRef({ nodes: [], secLabels: [], icons: [] });
  const masterRef = useRef(null);

  const radius = 550;
  const centerX = 1920;
  const centerY = 1080;

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    masterRef.current = tl;

    gsap.set(refs.current.nodes, { opacity: 0, scale: 0.8 });
    gsap.set(refs.current.secLabels, { opacity: 0, y: 10 });
    gsap.set(refs.current.ring, { strokeDashoffset: 4398 });
    gsap.set(refs.current.centerIcon, { opacity: 0, scale: 0.5 });
    gsap.set(refs.current.cap, { opacity: 0, y: 20 });

    tl.to(
      refs.current.ring,
      { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" },
      0,
    )
      .to(
        refs.current.nodes,
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.2,
          ease: "back.out(1.7)",
        },
        0.5,
      )
      .to(
        refs.current.secLabels,
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.2 },
        1.2,
      )
      .to(
        refs.current.centerIcon,
        { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" },
        1.5,
      )
      .to(refs.current.cap, { opacity: 1, y: 0, duration: 1 }, 2);

    return () => tl.kill();
  }, []);

  // Sync with Remotion frame
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useEffect(() => {
    if (masterRef.current) {
      const progress = Math.min(Math.max(frame / (10 * fps), 0), 1);
      masterRef.current.progress(progress);
    }
  }, [frame, fps]);

  const nodeData = [
    {
      id: "egg",
      label: "Egg",
      desc: "The idea is born",
      angle: 0,
      icon: <EggIcon color={DS.colors.textPrimary} />,
    },
    {
      id: "cat",
      label: "Caterpillar",
      desc: "It grows in capability",
      angle: 90,
      icon: <CaterpillarIcon color={DS.colors.textPrimary} />,
    },
    {
      id: "chrys",
      label: "Chrysalis",
      desc: "It is built and refined",
      angle: 180,
      icon: <ChrysalisIcon color={DS.colors.textPrimary} />,
    },
    {
      id: "fly",
      label: "Butterfly",
      desc: "It evolves and improves",
      angle: 270,
      icon: <ButterflyIcon color={DS.colors.amber} />,
    },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <svg style={{ position: "absolute", width: "100%", height: "100%" }}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={DS.colors.borderBright}
          strokeWidth="8"
          strokeDasharray="4398"
          ref={(el) => (refs.current.ring = el)}
          transform="rotate(-90 1920 1080)"
        />
      </svg>

      {nodeData.map((d, i) => (
        <div
          key={d.id}
          ref={(el) => (refs.current.nodes[i] = el)}
          style={{
            position: "absolute",
            left:
              centerX +
              Math.cos(((d.angle - 90) * Math.PI) / 180) * radius -
              140,
            top:
              centerY +
              Math.sin(((d.angle - 90) * Math.PI) / 180) * radius -
              140,
          }}
        >
          <Card style={{ width: 280, height: 280, padding: 0 }}>{d.icon}</Card>
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              color: DS.colors.textPrimary,
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            {d.label}
          </div>
          <div
            ref={(el) => (refs.current.secLabels[i] = el)}
            style={{
              textAlign: "center",
              marginTop: 12,
              color: DS.colors.textSecondary,
              fontSize: 24,
              fontStyle: "italic",
              width: 280,
            }}
          >
            {d.desc}
          </div>
        </div>
      ))}

      <div
        ref={(el) => (refs.current.centerIcon = el)}
        style={{
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CycleIcon />
      </div>

      <div
        style={{ position: "absolute", bottom: 120 }}
        ref={(el) => (refs.current.cap = el)}
      >
        <h2 style={{ ...DS.font.h2, color: DS.colors.cyan }}>
          Life cycles. So does your app.
        </h2>
      </div>
    </AbsoluteFill>
  );
};

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

// ── 2. SCENE 3 PHASE NODE ─────────────────────────────────────

const PhaseNode = ({
  angle,
  r,
  label,
  icon: Icon,
  bullets,
  nodeRef,
  bulletsRefArray,
}) => {
  const centerX = 1920;
  const centerY = 1080;

  const left = centerX + Math.cos(((angle - 90) * Math.PI) / 180) * r - 120;
  const top = centerY + Math.sin(((angle - 90) * Math.PI) / 180) * r - 120;

  return (
    <div
      ref={nodeRef}
      style={{
        position: "absolute",
        left,
        top,
        opacity: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
              opacity: 0,
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
    </div>
  );
};

// ── 3. SCENE 3 MAIN COMPONENT ─────────────────────────────────

export const Scene3 = () => {
  const refs = useRef({
    bulletsCap: [],
    bulletsDev: [],
    bulletsDep: [],
    bulletsIter: [],
  });
  const masterRef = useRef(null);

  const RADIUS = 600;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    masterRef.current = tl;
    const r = refs.current;

    gsap.set([r.title, r.sub, r.defBlock, r.mLogo], { opacity: 0 });
    gsap.set([r.nodeCap, r.nodeDev, r.nodeDep, r.nodeIter], {
      opacity: 0,
      scale: 0.8,
    });
    gsap.set([r.title, r.sub, r.defBlock], { y: 40 });
    gsap.set(r.ring, { strokeDashoffset: CIRCUMFERENCE });
    gsap.set(r.flowRing, { opacity: 0, strokeDashoffset: 0 });
    gsap.set(
      [...r.bulletsCap, ...r.bulletsDev, ...r.bulletsDep, ...r.bulletsIter],
      { opacity: 0, y: 20 },
    );

    // 1. ALM Intro
    tl.to(
      [r.title, r.sub],
      { opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.2 },
      0.5,
    )
      .to(
        r.defBlock,
        { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" },
        1.4,
      )
      .to(
        [r.title, r.sub, r.defBlock],
        {
          opacity: 0,
          y: -30,
          duration: 1.2,
          ease: "power2.inOut",
          stagger: 0.1,
        },
        4.5,
      );

    // 2. Node 1: Capture
    tl.to(
      r.nodeCap,
      { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.7)" },
      5.5,
    ).to(
      r.bulletsCap,
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      6.0,
    );

    // Draw Line to Develop
    tl.to(
      r.ring,
      {
        strokeDashoffset: CIRCUMFERENCE * 0.75,
        duration: 1.2,
        ease: "power2.inOut",
      },
      6.8,
    );

    // 3. Node 2: Develop
    tl.to(
      r.nodeDev,
      { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.7)" },
      7.8,
    ).to(
      r.bulletsDev,
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      8.3,
    );

    // Draw Line to Deploy
    tl.to(
      r.ring,
      {
        strokeDashoffset: CIRCUMFERENCE * 0.5,
        duration: 1.2,
        ease: "power2.inOut",
      },
      9.1,
    );

    // 4. Node 3: Deploy
    tl.to(
      r.nodeDep,
      { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.7)" },
      10.1,
    ).to(
      r.bulletsDep,
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      10.6,
    );

    // Draw Line to Iterate
    tl.to(
      r.ring,
      {
        strokeDashoffset: CIRCUMFERENCE * 0.25,
        duration: 1.2,
        ease: "power2.inOut",
      },
      11.4,
    );

    // 5. Node 4: Iterate
    tl.to(
      r.nodeIter,
      { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.7)" },
      12.4,
    ).to(
      r.bulletsIter,
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      12.9,
    );

    // Draw Line to close the loop
    tl.to(
      r.ring,
      { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
      13.7,
    );

    // 6. Logo Reveal & Continuous Flow
    tl.to(
      r.mLogo,
      { opacity: 1, scale: 1, duration: 1.4, ease: "back.out(1.5)" },
      15.0,
    ).to(
      r.mLogo,
      { scale: 1.05, duration: 3, yoyo: true, repeat: 4, ease: "sine.inOut" },
      16.4,
    );

    tl.to(r.flowRing, { opacity: 0.6, duration: 1.5 }, 15.5).to(
      r.flowRing,
      { strokeDashoffset: -400, duration: 4, ease: "none", repeat: 2 },
      15.5,
    );

    // 7. Outro
    tl.to(r.stage, { opacity: 0, duration: 1.5 }, 22.5);

    return () => tl.kill();
  }, [CIRCUMFERENCE]);

  useGSAPSync(masterRef, 24);

  return (
    <AbsoluteFill
      ref={(el) => (refs.current.stage = el)}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      {/* HEADER */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          transform: "translateY(-50%)",
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <h1
          ref={(el) => (refs.current.title = el)}
          style={{ ...DS.font.h1, fontSize: 300, margin: 0, opacity: 0 }}
        >
          ALM
        </h1>
        <p
          ref={(el) => (refs.current.sub = el)}
          style={{
            ...DS.font.bodyLg,
            fontSize: 72,
            fontWeight: 600,
            margin: 0,
            color: DS.colors.cyan,
            marginTop: 16,
            opacity: 0,
          }}
        >
          Application Lifecycle Management
        </p>
        <div
          ref={(el) => (refs.current.defBlock = el)}
          style={{ maxWidth: 2000, margin: "64px auto 0", opacity: 0 }}
        >
          <p
            style={{
              ...DS.font.bodyLg,
              fontSize: 52,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            ALM is the process of managing an application’s entire life—from
            idea to final product—using the right people, processes, and tools.
          </p>
        </div>
      </div>

      {/* RINGS */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <circle
          ref={(el) => (refs.current.ring = el)}
          cx="1920"
          cy="1080"
          r={RADIUS}
          fill="none"
          stroke={DS.colors.borderBright}
          strokeWidth="8"
          strokeDasharray={CIRCUMFERENCE}
          transform="rotate(-90 1920 1080)"
        />
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

      {/* CENTER LOGO */}
      <div
        ref={(el) => (refs.current.mLogo = el)}
        style={{ position: "absolute", zIndex: 10, opacity: 0, scale: 0.6 }}
      >
        <img
          src={staticFile("mendix.png")}
          alt="Mendix Logo"
          style={{
            width: 280,
            height: 280,
            objectFit: "contain",
            filter: "drop-shadow(0 0 60px rgba(56,189,248,0.4))",
          }}
        />
      </div>

      {/* NODES */}
      <PhaseNode
        nodeRef={(el) => (refs.current.nodeCap = el)}
        bulletsRefArray={refs.current.bulletsCap}
        angle={0}
        r={RADIUS}
        label="Capture"
        icon={CaptureIcon}
        bullets={["Gather requirements", "Discuss ideas", "Align with team"]}
      />
      <PhaseNode
        nodeRef={(el) => (refs.current.nodeDev = el)}
        bulletsRefArray={refs.current.bulletsDev}
        angle={90}
        r={RADIUS}
        label="Develop"
        icon={DevelopIcon}
        bullets={["Start building", "Logic & UI"]}
      />
      <PhaseNode
        nodeRef={(el) => (refs.current.nodeDep = el)}
        bulletsRefArray={refs.current.bulletsDep}
        angle={180}
        r={RADIUS}
        label="Deploy"
        icon={DeployIcon}
        bullets={["Testing environment", "Release to users"]}
      />
      <PhaseNode
        nodeRef={(el) => (refs.current.nodeIter = el)}
        bulletsRefArray={refs.current.bulletsIter}
        angle={270}
        r={RADIUS}
        label="Iterate"
        icon={IterateIcon}
        bullets={["Collect feedback", "Fix issues", "Plan new features"]}
      />
    </AbsoluteFill>
  );
};

// ── 5. HELPER COMPONENTS ────────────────────────────────────

const UserIcon = ({ color, label }) => (
  <div
    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
  >
    <svg width="200" height="200" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="30"
        r="20"
        stroke={color}
        fill="none"
        strokeWidth="8"
      />
      <path
        d="M10,100 Q50,50 90,100"
        stroke={color}
        fill="none"
        strokeWidth="8"
      />
    </svg>
    <Badge text={label} color="cyan" style={{ marginTop: DS.spacing.md }} />
  </div>
);

const BugIcon = () => (
  <svg width="150" height="150" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="30" fill={DS.colors.rose} />
    <circle cx="35" cy="35" r="5" fill="#fff" />
    <circle cx="65" cy="35" r="5" fill="#fff" />
    <path
      d="M20,50 L5,50 M80,50 L95,50 M30,70 L15,85 M70,70 L85,85"
      stroke={DS.colors.rose}
      strokeWidth="8"
      strokeLinecap="round"
    />
  </svg>
);

const BubbleIcon = () => (
  <svg width="200" height="200" viewBox="0 0 100 100">
    <path
      d="M10,20 Q10,10 20,10 L80,10 Q90,10 90,20 L90,60 Q90,70 80,70 L50,70 L20,95 L20,70 L20,70 Q10,70 10,60 Z"
      stroke={DS.colors.amber}
      fill={DS.colors.card}
      strokeWidth="6"
    />
    <path
      d="M50,25 L55,40 L70,40 L58,50 L62,65 L50,55 L38,65 L42,50 L30,40 L45,40 Z"
      fill={DS.colors.amber}
    />
  </svg>
);

// ── 4. FINAL SCENE (MERGED SCENE 4 & 5) ───────────────────────

export const Scene4 = () => {
  const refs = useRef({});
  const masterRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    masterRef.current = tl;
    const r = refs.current;

    // 1. Initial Setup
    gsap.set(
      [r.accCard, r.portalCard, r.arrow, r.cap1, r.cap2, r.mLogo, r.orbitGroup],
      { opacity: 0 },
    );

    gsap.set(r.accCard, { x: -300, y: 50 });
    gsap.set(r.portalCard, { x: 300, y: 50 });
    gsap.set([r.cap1, r.cap2], { y: 30 });
    gsap.set(r.mLogo, { scale: 0.5 });
    gsap.set(r.orbitGroup, { scale: 0.5 });

    // 2. Part 1: Account & Portal
    tl.to(
      r.accCard,
      { opacity: 1, x: -450, y: 0, duration: 1.5, ease: "power3.out" },
      0.5,
    )
      .to(
        r.portalCard,
        { opacity: 1, x: 450, y: 0, duration: 1.5, ease: "power3.out" },
        0.5,
      )
      .to(r.arrow, { opacity: 1, duration: 1 }, 1.5)
      .to(r.cap1, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 1.0)

      .to(
        [r.accCard, r.portalCard, r.arrow, r.cap1],
        { opacity: 0, y: -50, duration: 1.2, ease: "power2.inOut" },
        5.5,
      );

    // 3. Part 2: Mendix Logo & ALM Orbit (Holds until the end)
    tl.to(r.cap2, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, 6.7)
      .to(
        r.mLogo,
        { opacity: 1, scale: 1, duration: 1.5, ease: "back.out(1.5)" },
        7.0,
      )
      .to(
        r.orbitGroup,
        { opacity: 1, scale: 1, duration: 1.5, ease: "back.out(1.2)" },
        7.2,
      )
      .to(
        r.orbitGroup,
        { rotation: 90, duration: 6.5, ease: "power1.inOut" },
        7.0,
      )
      .to(
        r.mLogo,
        {
          scale: 1.08,
          filter: "drop-shadow(0 0 90px rgba(56,189,248,0.8))",
          duration: 4,
          ease: "sine.inOut",
        },
        9.5,
      )

      .to(r.stage, { opacity: 0, duration: 1.5 }, 13.5);

    return () => tl.kill();
  }, []);

  useGSAPSync(masterRef, 15);

  return (
    <AbsoluteFill
      ref={(el) => (refs.current.stage = el)}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      {/* ── PART 1: CARDS ── */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Account Card */}
        <div
          ref={(el) => (refs.current.accCard = el)}
          style={{ position: "absolute", textAlign: "center" }}
        >
          <Card
            style={{
              width: 480,
              height: 480,
              justifyContent: "center",
              gap: 32,
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: DS.colors.borderBright,
              }}
            />
            <div
              style={{
                width: 240,
                height: 24,
                borderRadius: 12,
                background: DS.colors.borderBright,
              }}
            />
            <div
              style={{
                width: 160,
                height: 24,
                borderRadius: 12,
                background: DS.colors.borderBright,
              }}
            />
            <div
              style={{
                width: 320,
                height: 64,
                borderRadius: 16,
                background: DS.colors.cyan,
                marginTop: 16,
              }}
            />
          </Card>
          <p style={{ ...DS.font.h2, fontSize: 56, marginTop: 48 }}>
            Mendix Account
          </p>
        </div>

        <div
          ref={(el) => (refs.current.arrow = el)}
          style={{
            position: "absolute",
            ...DS.font.h1,
            fontSize: 120,
            color: DS.colors.cyan,
          }}
        >
          →
        </div>

        {/* Portal Card with embedded ALM mini-dashboard */}
        <div
          ref={(el) => (refs.current.portalCard = el)}
          style={{ position: "absolute", textAlign: "center" }}
        >
          <Card
            glow
            style={{
              width: 480,
              height: 480,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              padding: 40,
            }}
          >
            <div
              style={{
                background: DS.colors.cardElevated,
                borderRadius: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ transform: "scale(0.65)" }}>
                <CaptureIcon color={DS.colors.cyan} />
              </div>
            </div>
            <div
              style={{
                background: DS.colors.cardElevated,
                borderRadius: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ transform: "scale(0.65)" }}>
                <DevelopIcon color={DS.colors.cyan} />
              </div>
            </div>
            <div
              style={{
                background: DS.colors.cardElevated,
                borderRadius: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ transform: "scale(0.65)" }}>
                <DeployIcon color={DS.colors.amber} />
              </div>
            </div>
            <div
              style={{
                background: DS.colors.cardElevated,
                borderRadius: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ transform: "scale(0.65)" }}>
                <IterateIcon color={DS.colors.green} />
              </div>
            </div>
          </Card>
          <p style={{ ...DS.font.h2, fontSize: 56, marginTop: 48 }}>
            Mendix Portal
          </p>
        </div>
      </div>

      {/* ── PART 2: LOGO & ORBIT ── */}
      <div
        ref={(el) => (refs.current.mLogo = el)}
        style={{ position: "absolute", zIndex: 10 }}
      >
        <img
          src={staticFile("mendix.png")}
          alt="Mendix Logo"
          style={{
            width: 240,
            height: 240,
            objectFit: "contain",
            filter: "drop-shadow(0 0 50px rgba(56,189,248,0.4))",
          }}
        />
      </div>

      <div
        ref={(el) => (refs.current.orbitGroup = el)}
        style={{ position: "absolute", width: 1200, height: 1200 }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <circle
            cx="600"
            cy="600"
            r="500"
            fill="none"
            stroke={DS.colors.borderBright}
            strokeWidth="6"
            strokeDasharray="20 40"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 600,
            transform: "translate(-50%, -50%) scale(1.2)",
          }}
        >
          <CaptureIcon color={DS.colors.cyan} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 600,
            right: 100,
            transform: "translate(50%, -50%) scale(1.2)",
          }}
        >
          <DevelopIcon color={DS.colors.cyan} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 600,
            transform: "translate(-50%, 50%) scale(1.2)",
          }}
        >
          <DeployIcon color={DS.colors.cyan} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 600,
            left: 100,
            transform: "translate(-50%, -50%) scale(1.2)",
          }}
        >
          <IterateIcon color={DS.colors.cyan} />
        </div>
      </div>

      {/* ── CAPTIONS ── */}
      <div
        style={{
          position: "absolute",
          top: 200,
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2
          ref={(el) => (refs.current.cap1 = el)}
          style={{
            ...DS.font.h1,
            fontSize: 104,
            position: "absolute",
            width: "100%",
            textShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          In the next video, we’ll create a Mendix account
          <br />
          and explore the Mendix Portal...
        </h2>
        <h2
          ref={(el) => (refs.current.cap2 = el)}
          style={{
            ...DS.font.h1,
            fontSize: 104,
            position: "absolute",
            width: "100%",
            textShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          ...and see how Mendix supports
          <br />
          all these ALM phases.
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. MAIN COMPOSITION ─────────────────────────────────────

export const MainScene = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: DS.colors.bg, overflow: "hidden" }}>
      {/* 6 Seconds */}
      <Sequence from={0} durationInFrames={360}>
        <WelcomeScene />
      </Sequence>
      {/* 15.5 Seconds */}
      <Sequence from={360} durationInFrames={930}>
        <Scene1 />
      </Sequence>
      {/* 10 Seconds */}
      <Sequence from={1290} durationInFrames={600}>
        <Scene2 />
      </Sequence>
      {/* 24 Seconds (Updated from our previous fix) */}
      <Sequence from={1890} durationInFrames={1115}>
        <Scene3 />
      </Sequence>
      {/* 15 Seconds (New Final Merged Scene) */}
      <Sequence from={3038} durationInFrames={900}>
        <Scene4 />
      </Sequence>
    </AbsoluteFill>
  );
};

export default MainScene;
