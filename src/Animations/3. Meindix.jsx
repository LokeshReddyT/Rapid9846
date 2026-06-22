import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Sequence,
  AbsoluteFill,
  useVideoConfig,
  useCurrentFrame,
  Img,
  staticFile,
} from "remotion";

// 1. FIX: Enabled force3D. This offloads the 4K animation rendering to the GPU, entirely fixing the lag.
gsap.config({ force3D: true });

// 2. Disable GSAP's internal ticker so it doesn't fight Remotion's frame engine
gsap.ticker.sleep();
gsap.ticker.lagSmoothing(0);

const DS = {
  colors: {
    bg: "#0B0F19",
    panel: "#0F172A",
    cardBase: "#1E293B",
    cardElevated: "#243347",
    borderDefault: "#334155",
    borderBright: "#475569",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    cyan: { base: "#38BDF8", glow: "rgba(56,189,248,0.15)", bright: "#7DD3FC" },
    purple: {
      base: "#A78BFA",
      glow: "rgba(167,139,250,0.15)",
      bright: "#C4B5FD",
    },
    green: {
      base: "#34D399",
      glow: "rgba(52,211,153,0.15)",
      bright: "#6EE7B7",
    },
    amber: {
      base: "#FBBF24",
      glow: "rgba(251,191,36,0.15)",
      bright: "#FDE68A",
    },
    rose: {
      base: "#FB7185",
      glow: "rgba(251,113,133,0.15)",
      bright: "#FCA5A5",
    },
    mendix: {
      base: "#285192",
      glow: "rgba(74,128,212,0.3)",
      bright: "#4A80D4",
    },
  },
};

// ── PRIMITIVE COMPONENTS ────────────────────────────────────
const Stage = ({ children }) => {
  const { width } = useVideoConfig();
  const scale = width / 1920;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DS.colors.bg,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: 1920,
          height: 1080,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const Card = ({ children, className = "", style }) => (
  <div
    className={className}
    style={{
      background: DS.colors.cardBase,
      border: `1px solid ${DS.colors.borderDefault}`,
      borderRadius: 16,
      padding: 32,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      position: "absolute",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ label, color = DS.colors.cyan, className = "", style }) => (
  <div
    className={className}
    style={{
      background: color.glow,
      border: `1px solid ${color.base}`,
      borderRadius: 9999,
      padding: "8px 20px",
      fontSize: 18,
      fontWeight: 600,
      color: color.base,
      position: "absolute",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {label}
  </div>
);

// ── ICONS ───────────────────────────────────────────────────
const IconGlobe = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#38BDF8"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);
const IconBuilding = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#A78BFA"
    strokeWidth="1.5"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" />
  </svg>
);
const IconUsers = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#34D399"
    strokeWidth="1.5"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconDevices = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FBBF24"
    strokeWidth="1.5"
  >
    <rect x="2" y="4" width="14" height="12" rx="2" />
    <path d="M0 20h18M16 8h6v12h-6z" />
  </svg>
);
const IconLightning = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.amber.base}
    strokeWidth="2"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const IconStairs = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.green.base}
    strokeWidth="2"
  >
    <path d="M2 22h6v-6h6v-6h6V4" />
  </svg>
);
const IconHand = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.purple.base}
    strokeWidth="2"
  >
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0a2 2 0 0 0-2 2v0a2 2 0 0 0-2 2v-5a2 2 0 0 0-4 0v12a7 7 0 0 0 14 0z" />
  </svg>
);
const IconDevicesCyan = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.cyan.base}
    strokeWidth="2"
  >
    <rect x="2" y="4" width="14" height="12" rx="2" />
    <path d="M0 20h18M16 8h6v12h-6z" />
  </svg>
);
const IconGear = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.rose.base}
    strokeWidth="2"
  >
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconCode = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.mendix.bright}
    strokeWidth="2"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconLaptop = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.textPrimary}
    strokeWidth="1.5"
  >
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M2 20h20" />
    <path d="M5 8h14M5 12h10" stroke={DS.colors.cyan.base} strokeWidth="2" />
  </svg>
);
const IconPhone = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.textPrimary}
    strokeWidth="1.5"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M9 6h6M9 10h4" stroke={DS.colors.cyan.base} strokeWidth="2" />
  </svg>
);
const IconLightbulb = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.amber.bright}
    strokeWidth="2"
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6M10 22h4" />
  </svg>
);
const IconRocket = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke={DS.colors.cyan.bright}
    strokeWidth="2"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// ── SCENE 0: WELCOME BACK ───────────────────────────────────
const Scene0_WelcomeBack = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef(null);
  const master = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        ".s0-target",
        { opacity: 0, scale: 0.93, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "expo.out" },
        0.2,
      ).to(
        ".s0-target",
        { opacity: 0, y: -30, duration: 0.6, ease: "power2.in" },
        3.2,
      );
      master.current = tl;
    }, ref);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (master.current) master.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <Stage>
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          className="s0-target"
          style={{
            opacity: 0,
            fontSize: 96,
            fontWeight: 800,
            color: DS.colors.textPrimary,
            margin: 0,
          }}
        >
          Welcome back!
        </h1>
      </div>
    </Stage>
  );
};

// ── SCENE 1: WHAT IS MENDIX ─────────────────────────────────
// ── SCENE 1: WHAT IS MENDIX ─────────────────────────────────
const Scene1_WhatIsMendix = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef(null);
  const master = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // 1. Title group animation
      tl.fromTo(
        ".s1-title-group",
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "expo.out" },
        0.5,
      )
        // 2. Main paragraph body animation
        .fromTo(
          ".s1-paragraph",
          { opacity: 0, scale: 0.97 },
          { opacity: 0.8, scale: 1, duration: 1.5, ease: "power2.out" },
          1.2,
        )
        // 3. Card 0: 4,000+ Orgs lands
        .fromTo(
          ".s1-card-0",
          { opacity: 0, y: 60, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.2)" },
          2.4,
        )
        // 4. Card 1: 100+ Countries lands
        .fromTo(
          ".s1-card-1",
          { opacity: 0, y: 60, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.2)" },
          3.6,
        )
        // 5. INTERSTITIAL: Global Enterprise Logos reveal smoothly right below the cards
        .fromTo(
          ".s1-logos-container",
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power4.out" },
          4.7,
        )
        // 6. Card 2: 300k+ Devs lands after a perfect sync gap
        .fromTo(
          ".s1-card-2",
          { opacity: 0, y: 60, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.2)" },
          6.4,
        )
        // 7. Card 3: ~1M Apps lands
        .fromTo(
          ".s1-card-3",
          { opacity: 0, y: 60, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "back.out(1.2)" },
          7.6,
        )
        // 8. Dynamic full scene exit animation (Extended slightly to accommodate new content)
        .to(
          [
            ".s1-title-group",
            ".s1-paragraph",
            "[class^='s1-card-']",
            ".s1-logos-container",
          ],
          {
            opacity: 0,
            y: -40,
            duration: 0.8,
            stagger: 0.04,
            ease: "power3.inOut",
          },
          13.2,
        );

      master.current = tl;
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (master.current) master.current.seek(frame / fps);
  }, [frame, fps]);

  const stats = [
    {
      label: "4,000+ Orgs",
      Icon: IconBuilding,
      color: "#A78BFA",
      bg: "rgba(167,139,250,0.07)",
    },
    {
      label: "100+ Countries",
      Icon: IconGlobe,
      color: "#38BDF8",
      bg: "rgba(56,189,248,0.07)",
    },
    {
      label: "300k+ Devs",
      Icon: IconUsers,
      color: "#34D399",
      bg: "rgba(52,211,153,0.07)",
    },
    {
      label: "~1M Apps",
      Icon: IconDevices,
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.07)",
    },
  ];

  return (
    <Stage>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
        }}
      >
        {/* TITLE SECTION */}
        <div
          className="s1-title-group"
          style={{ opacity: 0, display: "flex", alignItems: "center", gap: 32 }}
        >
          <Img
            src={staticFile("mendix.png")}
            style={{ width: 120, height: 120, objectFit: "contain" }}
          />
          <h1
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#F8FAFC",
              margin: 0,
            }}
          >
            What is Mendix?
          </h1>
        </div>

        {/* PARAGRAPH COMPONENT */}
        <p
          className="s1-paragraph"
          style={{
            opacity: 0,
            fontSize: 34,
            color: "#CBD5E1",
            textAlign: "center",
            maxWidth: 1380,
            lineHeight: 1.7,
            margin: 0,
            fontWeight: 400,
          }}
        >
          Mendix is a low-code platform developed by Siemens that lets you to
          build enterprise-grade applications using simple drag-and-drop tools
          without heavy coding. It helps business and IT teams work together to
          build web and mobile apps much faster.
        </p>

        {/* METRICS & LOGOS WRAPPER GRID */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 36,
          }}
        >
          {/* STATS CARDS ROW */}
          <div style={{ display: "flex", gap: 40 }}>
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`s1-card-${i}`}
                style={{
                  opacity: 0,
                  background: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: 24,
                  padding: "48px 24px",
                  width: 330,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 28,
                }}
              >
                <div
                  style={{
                    background: stat.bg,
                    borderRadius: "50%",
                    padding: 26,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <stat.Icon />
                </div>
                <h3
                  style={{
                    fontSize: 24,
                    color: "#F8FAFC",
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </h3>
              </div>
            ))}
          </div>

          {/* DYNAMIC COMPANY LOGOS CONTAINER */}
          <div
            className="s1-logos-container"
            style={{
              opacity: 0,
              display: "flex",
              alignItems: "center",
              gap: 24,
              background: "rgba(30, 41, 59, 0.6)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              borderRadius: 20,
              padding: "16px 32px",
              marginTop: "50px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                color: "#94A3B8",
                fontSize: 16,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginRight: 8,
              }}
            >
              Trusted By Global Giants:
            </span>

            {/* Ford Logo Badge */}
            <div
              style={{
                background: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                height: 80,
              }}
            >
              <Img
                src={staticFile("Ford.png")}
                style={{
                  maxHeight: "90%",
                  maxWidth: "90%",
                  objectFit: "scale-down",
                }}
              />
            </div>

            {/* Toyota Logo Badge */}
            <div
              style={{
                background: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                height: 80,
              }}
            >
              <Img
                src={staticFile("Toyato.png")}
                style={{
                  maxHeight: "90%",
                  maxWidth: "90%",
                  objectFit: "scale-down",
                }}
              />
            </div>

            {/* Zurich Insurance Logo Badge */}
            <div
              style={{
                background: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                height: 80,
              }}
            >
              <Img
                src={staticFile("z.png")}
                style={{
                  maxHeight: "90%",
                  maxWidth: "90%",
                  objectFit: "scale-down",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};
// ── SCENE 2: CAPABILITIES ───────────────────────────────────
const Scene2_Capabilities = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef(null);
  const master = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        ".s2-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0,
      )
        .fromTo(
          ".s2-card",
          { opacity: 0, scale: 0.8, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2, // This handles the one-after-another animation
            ease: "back.out(1.2)",
          },
          0.5, // Starts slightly after title animation begins
        )
        .to(
          [".s2-card", ".s2-title"],
          {
            opacity: 0,
            y: -20,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.in",
          },
          10.5,
        );
      master.current = tl;
    }, ref);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (master.current) master.current.seek(frame / fps);
  }, [frame, fps]);

  const cards = [
    { title: "10× Faster Speed", Icon: IconLightning, color: DS.colors.amber },
    {
      title: "Start Simple, Scale Up",
      Icon: IconStairs,
      color: DS.colors.green,
    },
    { title: "Drag & Drop (0 Code)", Icon: IconHand, color: DS.colors.purple },
    {
      title: "Web + Mobile Ready",
      Icon: IconDevicesCyan,
      color: DS.colors.cyan,
    },
    { title: "Zero Complex Setup", Icon: IconGear, color: DS.colors.rose },
    {
      title: "Extend with Custom Code",
      Icon: IconCode,
      color: DS.colors.mendix,
    },
  ];

  return (
    <Stage>
      <div ref={ref} style={{ width: "100%", height: "100%" }}>
        <h2
          className="s2-title"
          style={{
            opacity: 0,
            position: "absolute",
            top: 120,
            width: "100%",
            textAlign: "center",
            fontSize: 64,
            fontWeight: 800,
            color: DS.colors.textPrimary,
          }}
        >
          Why build with Mendix?
        </h2>
        <div
          style={{
            position: "absolute",
            top: 320,
            left: "50%",
            transform: "translateX(-50%)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "40px",
            width: 1600,
          }}
        >
          {cards.map((c, i) => (
            <Card
              key={i}
              className="s2-card"
              style={{
                position: "relative", // FIX: Overrides the absolute positioning from the base Card component
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px 24px",
              }}
            >
              <div
                style={{
                  background: DS.colors.cardElevated,
                  padding: 24,
                  borderRadius: "50%",
                  border: `1px solid ${c.color.base}`,
                  marginBottom: 24,
                }}
              >
                <c.Icon />
              </div>
              <h3
                style={{
                  margin: 0,
                  color: DS.colors.textPrimary,
                  fontSize: 22,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {c.title}
              </h3>
            </Card>
          ))}
        </div>
      </div>
    </Stage>
  );
};
// ── SCENE 3: COURSE SCOPE ───────────────────────────────────
// ── SCENE 3: COURSE SCOPE ───────────────────────────────────
const Scene3_CourseScope = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef(null);
  const master = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // 1. Header falls into place smoothly
      tl.fromTo(
        ".s3-head",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" },
        0.2,
      )
        // 2. Left Card scales and slides up
        .fromTo(
          ".s3-box-l",
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power4.out" },
          0.6,
        )
        // 3. Left Badge pops up with a clean bounce
        .fromTo(
          ".s3-badge-l",
          { opacity: 0, scale: 0.5, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" },
          1.0,
        )
        // 4. Line draws perfectly from left to right *after* the left card is ready
        .fromTo(
          ".s3-line-path",
          { strokeDashoffset: 580, strokeDasharray: 580 },
          { strokeDashoffset: 0, duration: 1.4, ease: "power3.inOut" },
          1.3,
        )
        // 5. Right Card appears exactly as the connecting line reaches it
        .fromTo(
          ".s3-box-r",
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power4.out" },
          2.1,
        )
        // 6. Right Badge pops up cleanly
        .fromTo(
          ".s3-badge-r",
          { opacity: 0, scale: 0.5, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" },
          2.5,
        )
        // 7. Footer text reveals gracefully at the bottom
        .fromTo(
          ".s3-cap",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          2.9,
        )
        // 8. Elegant exit animation
        .to(
          ".s3-all",
          {
            opacity: 0,
            y: -40,
            duration: 0.6,
            stagger: 0.04,
            ease: "expo.in",
          },
          8.5,
        );

      master.current = tl;
    }, ref);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (master.current) master.current.seek(frame / fps);
  }, [frame, fps]);

  return (
    <Stage>
      <div ref={ref} style={{ width: "100%", height: "100%" }}>
        {/* HEADER SECTION */}
        <div
          className="s3-head s3-all"
          style={{
            opacity: 0,
            position: "absolute",
            top: 140,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Badge
            label="Important Note"
            color={DS.colors.amber}
            style={{
              position: "relative",
              marginBottom: 28,
              padding: "10px 24px",
            }}
          />
          <h2
            style={{
              fontSize: 64,
              color: DS.colors.textPrimary,
              margin: 0,
              fontWeight: 800,
              letterSpacing: -0.5,
            }}
          >
            Course Scope: Web Version
          </h2>
        </div>

        {/* DIAGRAM SECTION */}
        <div
          className="s3-all"
          style={{
            position: "absolute",
            top: "56%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 1100,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* CONNECTING LINE */}
          <svg
            style={{
              position: "absolute",
              top: "50%",
              left: 260,
              width: 580,
              height: 10,
              transform: "translateY(-50%)",
              overflow: "visible",
            }}
          >
            <path
              className="s3-line-path"
              d="M 0 5 L 580 5"
              fill="none"
              stroke={DS.colors.borderBright}
              strokeWidth="4"
              strokeDasharray="12 12"
            />
          </svg>

          {/* LEFT NODE: WEB APPLICATION */}
          <div
            className="s3-box-l"
            style={{
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 260,
                height: 260,
                background: DS.colors.cardBase,
                border: `2px solid ${DS.colors.cyan.base}`,
                borderRadius: 32,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                boxShadow: `0 12px 60px ${DS.colors.cyan.glow}`,
              }}
            >
              <IconLaptop />

              {/* Floating Badge with clear vertical gap */}
              <div
                className="s3-badge-l"
                style={{
                  position: "absolute",
                  top: -60,
                  background: DS.colors.cyan.base,
                  color: DS.colors.bg,
                  padding: "10px 26px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 15,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                }}
              >
                We Are Building This
              </div>
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 32,
                fontWeight: 700,
                color: DS.colors.textPrimary,
              }}
            >
              Web Application
            </div>
          </div>

          {/* RIGHT NODE: MOBILE BROWSER */}
          <div
            className="s3-box-r"
            style={{
              opacity: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 260,
                height: 260,
                background: DS.colors.cardBase,
                border: `2px solid ${DS.colors.borderBright}`,
                borderRadius: 32,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
              }}
            >
              <IconPhone />

              {/* Floating Badge with clear vertical gap */}
              <div
                className="s3-badge-r"
                style={{
                  position: "absolute",
                  top: -60,
                  background: DS.colors.cardElevated,
                  border: `1px solid ${DS.colors.borderBright}`,
                  color: DS.colors.textPrimary,
                  padding: "10px 26px",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 15,
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                }}
              >
                Still Accessible Here
              </div>
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 32,
                fontWeight: 700,
                color: DS.colors.textSecondary,
              }}
            >
              Mobile Browser
            </div>
          </div>
        </div>

        {/* FOOTER TIMELINE */}
        <div
          className="s3-cap s3-all"
          style={{
            opacity: 0,
            position: "absolute",
            bottom: 120,
            width: "100%",
            textAlign: "center",
            fontSize: 36,
            fontWeight: 500,
            color: DS.colors.textSecondary,
            letterSpacing: -0.2,
          }}
        >
          Build once. Access everywhere.
        </div>
      </div>
    </Stage>
  );
};
// ── SCENE 4: WHAT'S NEXT ────────────────────────────────────
const Scene4_WhatsNext = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef(null);
  const master = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        ".s4-head",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "expo.out" },
        0.2,
      )
        .fromTo(".s4-svg", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.6)
        .fromTo(
          ".s4-path",
          { strokeDashoffset: 800, strokeDasharray: 800 },
          { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" },
          0.6,
        )
        .fromTo(
          ".s4-n1",
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
          0.8,
        )
        .fromTo(
          ".s4-n2",
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
          2.0,
        )
        .to(
          ".s4-all",
          {
            opacity: 0,
            y: -30,
            duration: 0.5,
            stagger: 0.04,
            ease: "power2.in",
          },
          6.5,
        );
      master.current = tl;
    }, ref);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (master.current) master.current.seek(frame / fps);
  }, [frame, fps]);

  const nodes = [
    {
      cls: "s4-n1",
      label: "Idea",
      Icon: IconLightbulb,
      x: 560,
      color: DS.colors.amber,
    },
    {
      cls: "s4-n2",
      label: "Final App",
      Icon: IconRocket,
      x: 1360,
      color: DS.colors.cyan,
    },
  ];

  return (
    <Stage>
      <div ref={ref} style={{ width: "100%", height: "100%" }}>
        <div
          className="s4-head s4-all"
          style={{
            opacity: 0,
            position: "absolute",
            top: 220,
            width: "100%",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 72,
              color: DS.colors.textPrimary,
              margin: 0,
              fontWeight: 800,
            }}
          >
            Next Video: App Lifecycle
          </h2>
          <p
            style={{
              fontSize: 32,
              color: DS.colors.textSecondary,
              marginTop: 24,
              margin: 0,
            }}
          ></p>
        </div>

        {/* SVG line remains at Y=500 exactly */}
        <svg
          className="s4-svg s4-all"
          style={{
            opacity: 0,
            position: "absolute",
            top: 500,
            left: 560,
            width: 800,
            height: 10,
            transform: "translateY(-50%)",
            overflow: "visible",
          }}
        >
          <path
            className="s4-path"
            d="M0 5 L800 5"
            fill="none"
            stroke={DS.colors.cyan.bright}
            strokeWidth="6"
          />
        </svg>

        {nodes.map((n, i) => (
          // FIX: Decoupled the Badge from the flex column. The geometric center of this node is now exactly the 160x160 circle.
          <div
            key={i}
            className={`${n.cls} s4-all`}
            style={{
              opacity: 0,
              position: "absolute",
              left: n.x,
              top: 500,
              transform: "translate(-50%, -50%)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: DS.colors.cardBase,
                border: `2px solid ${n.color.base}`,
                borderRadius: "50%",
                width: 160,
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <n.Icon />
            </div>
            <Badge
              label={n.label}
              color={n.color}
              style={{
                position: "absolute",
                top: "100%",
                marginTop: 32,
                fontSize: 24,
                padding: "12px 32px",
              }}
            />
          </div>
        ))}
      </div>
    </Stage>
  );
};

// ── MAIN COMPONENT (SEAMLESS MATH) ──────────────────────────
const MainScene = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F19" }}>
      {/* 4 Seconds */}
      <Sequence from={0} durationInFrames={240}>
        <Scene0_WelcomeBack />
      </Sequence>
      {/* FIX: 13 Seconds (Reduced from 20s to fit the new tighter timeline) */}
      <Sequence from={240} durationInFrames={780}>
        <Scene1_WhatIsMendix />
      </Sequence>
      {/* 12 Seconds */}
      <Sequence from={1020} durationInFrames={720}>
        <Scene2_Capabilities />
      </Sequence>
      {/* 10 Seconds */}
      <Sequence from={1740} durationInFrames={600}>
        <Scene3_CourseScope />
      </Sequence>
      {/* 8 Seconds */}
      <Sequence from={2340} durationInFrames={480}>
        <Scene4_WhatsNext />
      </Sequence>
    </AbsoluteFill>
  );
};

export default MainScene;
