import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Sequence,
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ── 1. DESIGN TOKENS ────────────────────────────────────────
const DS = {
  colors: {
    bg: "#0B0F19",
    panel: "#0F172A",
    card: "#1E293B",
    cardElevated: "#243347",
    border: "#334155",
    borderBright: "#475569",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textTertiary: "#64748B",
    accent: {
      cyan: {
        base: "#38BDF8",
        glow: "rgba(56,189,248,0.15)",
        bright: "#7DD3FC",
      },
      amber: {
        base: "#FBBF24",
        glow: "rgba(251,191,36,0.15)",
        bright: "#FDE68A",
      },
      indigo: {
        base: "#818CF8",
        glow: "rgba(129,140,248,0.15)",
        bright: "#A5B4FC",
      },
      green: {
        base: "#34D399",
        glow: "rgba(52,211,153,0.15)",
        bright: "#6EE7B7",
      },
      rose: {
        base: "#FB7185",
        glow: "rgba(251,113,133,0.15)",
        bright: "#FCA5A5",
      },
    },
  },
  font: {
    family: "'Inter', sans-serif",
    display: {
      fontSize: 72,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      color: "#F8FAFC",
      margin: 0,
    },
    h1: {
      fontSize: 52,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#F8FAFC",
      margin: 0,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 40,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "#F8FAFC",
      margin: 0,
      lineHeight: 1.2,
    },
    bodyLg: {
      fontSize: 22,
      fontWeight: 400,
      color: "#94A3B8",
      lineHeight: 1.6,
      margin: 0,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.06em",
      color: "#64748B",
      textTransform: "uppercase",
      margin: 0,
    },
  },
  shadows: { card: "0 4px 24px rgba(0,0,0,0.4)" },
  easing: {
    enter: "power4.out",
    exit: "power4.in",
    smooth: "power2.inOut",
    spring: "elastic.out(1, 0.5)",
    float: "sine.inOut",
    back: "back.out(2)",
  },
};

// ── 2. GLOBAL STYLES ────────────────────────────────────────
const GlobalStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      html, body, #root { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: ${DS.colors.bg}; font-family: 'Inter', sans-serif; }
      * { box-sizing: border-box; }
    `,
    }}
  />
);

// ── 3. PRIMITIVES & ICONS ───────────────────────────────────
const Badge = React.forwardRef(
  ({ children, colorObj = DS.colors.accent.cyan, style }, ref) => (
    <div
      ref={ref}
      style={{
        background: colorObj.glow,
        border: "1px solid " + colorObj.base,
        borderRadius: 9999,
        padding: "4px 12px",
        color: colorObj.base,
        ...DS.font.label,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  ),
);

const FlowNode = React.forwardRef(
  ({ title, icon, style, glowColor, iconRef }, ref) => (
    <div
      ref={ref}
      style={{
        background: DS.colors.card,
        border: "2px solid " + (glowColor ? glowColor.base : DS.colors.border),
        borderRadius: 12,
        minWidth: 200,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: glowColor
          ? "0 0 32px " + glowColor.glow + ", 0 0 8px " + glowColor.glow
          : DS.shadows.card,
        ...style,
      }}
    >
      {icon && (
        <div
          ref={iconRef}
          style={{
            width: 24,
            height: 24,
            flexShrink: 0,
            fill: glowColor ? glowColor.base : DS.colors.textPrimary,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          ...DS.font.bodyLg,
          color: DS.colors.textPrimary,
          fontWeight: 600,
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {title}
      </div>
    </div>
  ),
);

const PuzzleIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path d="M20.5 11h-2V9a2 2 0 0 0-2-2h-2V5.5a2.5 2.5 0 0 0-5 0V7H7.5a2 2 0 0 0-2 2v2h-2a2.5 2.5 0 0 0 0 5h2v2a2 2 0 0 0 2 2h2v2.5a2.5 2.5 0 0 0 5 0V20h2a2 2 0 0 0 2-2v-2h2a2.5 2.5 0 0 0 0-5z" />
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const ShopIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="2"
      ry="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line
      x1="12"
      y1="18"
      x2="12.01"
      y2="18"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);
const LaptopIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <rect
      x="3"
      y="4"
      width="18"
      height="12"
      rx="1"
      ry="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M1 18h22v2H1z" fill="currentColor" />
  </svg>
);
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path
      d="M22.7 19.3L15 11.6c.3-1.2.1-2.5-.5-3.6-1.3-2.3-4.3-3-6.6-1.7-2.3 1.3-3 4.3-1.7 6.6.9 1.6 2.6 2.4 4.3 2.2l7.7 7.7c.4.4 1 .4 1.4 0l3.1-3.1c.4-.4.4-1 0-1.4zm-14-6.8c-1.1-.6-1.5-2.1-.9-3.2.6-1.1 2.1-1.5 3.2-.9 1.1.6 1.5 2.1.9 3.2-.6 1.1-2.1 1.5-3.2.9z"
      fill="currentColor"
    />
  </svg>
);
const WorkbenchIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path d="M2 7h20v4H2zM4 11h4v10H4zM16 11h4v10h-4z" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path
      d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
      fill="currentColor"
    />
  </svg>
);
const PhoneCallIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path
      d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
      fill="currentColor"
    />
  </svg>
);
const HappyIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-7.5c.83 0 1.5-.67 1.5-1.5S8.83 10 8 10s-1.5.67-1.5 1.5S7.17 12.5 8 12.5zm8 0c.83 0 1.5-.67 1.5-1.5S16.83 10 16 10s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-4 4.5c2.33 0 4.31-1.46 5.11-3.5H8.89c.8 2.04 2.78 3.5 5.11 3.5z"
      fill="currentColor"
    />
  </svg>
);
const CloudIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <path
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
      fill="currentColor"
    />
  </svg>
);
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// ── 4. SCENES ───────────────────────────────────────────────

const WelcomeScreen = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const refs = useRef({});
  const masterTl = useRef(null);
  const idleTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      const idle = gsap.timeline({ paused: true });
      const { glow, panel, welcomeText, title, subtitle, particles } =
        refs.current;

      gsap.set([panel, welcomeText, title, subtitle, particles], {
        opacity: 0,
      });
      gsap.set(panel, { scale: 0.9 });
      gsap.set(glow, { opacity: 0, scale: 0.5 });
      gsap.set([title, subtitle], { y: 20 });

      Array.from(particles.children).forEach((p, i) => {
        const seed1 = Math.sin(i + 1);
        const seed2 = Math.cos(i + 1);
        gsap.set(p, {
          x: 960 + seed1 * 800,
          y: 540 + seed2 * 600,
          scale: Math.abs(seed1) * 1.5 + 0.5,
          opacity: 0,
        });
        idle.to(
          p,
          {
            y: "-=" + (Math.abs(seed2) * 100 + 50),
            x: "+=" + seed1 * 50,
            duration: Math.abs(seed1) * 5 + 5,
            ease: "none",
            repeat: -1,
            yoyo: true,
            force3D: true,
          },
          0,
        );
      });
      idle.to(
        glow,
        {
          scale: 1.05,
          opacity: 0.6,
          duration: 4,
          ease: DS.easing.float,
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );

      // PERFECT FADES
      master.fromTo(
        stageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" },
        0,
      );

      master
        .addLabel("intro", "+=0.2")
        .to(
          glow,
          { opacity: 0.5, scale: 1, duration: 2.5, ease: "power2.out" },
          "intro",
        )
        .to(
          Array.from(particles.children),
          { opacity: 0.4, duration: 2, stagger: 0.1, ease: "power2.out" },
          "intro",
        )
        .to(
          panel,
          { opacity: 1, scale: 1, duration: 1.5, ease: DS.easing.spring },
          "intro+=0.5",
        )
        .to(
          welcomeText,
          { opacity: 1, duration: 0.8, ease: "power2.out" },
          "intro+=0.8",
        )
        .addLabel("swap", "+=1.5")
        .to(
          welcomeText,
          { opacity: 0, duration: 0.5, ease: "power2.inOut" },
          "swap",
        )
        .to(
          title,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "swap+=0.5",
        )
        .to(
          subtitle,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "swap+=0.8",
        )
        .to({}, { duration: 2 }) // Hold before fade
        .addLabel("exit")
        .to(
          cameraRef.current,
          { scale: 1.05, duration: 1.5, ease: "power2.inOut" },
          "exit",
        )
        .to(
          stageRef.current,
          { opacity: 0, duration: 1.5, ease: "power2.inOut" },
          "exit",
        ); // SMOOTH EXIT FADE

      masterTl.current = master;
      idleTl.current = idle;
    }, stageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const time = frame / fps;
    if (masterTl.current) masterTl.current.seek(time);
    if (idleTl.current) idleTl.current.seek(time);
  }, [frame, fps]);

  return (
    <div
      ref={stageRef}
      style={{ position: "absolute", width: 1920, height: 1080, opacity: 0 }}
    >
      <div
        ref={cameraRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          transformOrigin: "center center",
        }}
      >
        <div
          ref={(el) => (refs.current.glow = el)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 1200,
            height: 1200,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(11,15,25,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          ref={(el) => (refs.current.particles = el)}
          style={{ position: "absolute", inset: 0 }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: DS.colors.accent.cyan.bright,
              }}
            />
          ))}
        </div>
        <div
          ref={(el) => (refs.current.panel = el)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: DS.colors.panel,
            border: "1px solid " + DS.colors.border,
            borderRadius: 24,
            padding: "48px 64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            boxShadow: DS.shadows.card,
            backdropFilter: "blur(12px)",
            minWidth: 400,
          }}
        >
          <h1
            ref={(el) => (refs.current.welcomeText = el)}
            style={{
              ...DS.font.h1,
              textAlign: "center",
              position: "absolute",
              whiteSpace: "nowrap",
            }}
          >
            Welcome
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <h1
              ref={(el) => (refs.current.title = el)}
              style={{
                ...DS.font.h1,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              Why Are We Here?
            </h1>
            <div
              ref={(el) => (refs.current.subtitle = el)}
              style={{
                ...DS.font.bodyLg,
                color: DS.colors.accent.cyan.bright,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              Understanding the Problem
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Scene1_EveryProjectStartsWithAProblem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const refs = useRef({});
  const masterTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      const {
        problemWrapper,
        solutionWrapper,
        arrowBox,
        shopWrapper,
        shopLine,
        badge,
        caption,
      } = refs.current;

      gsap.set(
        [
          problemWrapper,
          solutionWrapper,
          shopWrapper,
          badge,
          caption,
          arrowBox,
          shopLine,
        ],
        { opacity: 0 },
      );
      gsap.set(problemWrapper, { x: 960, y: 440, scale: 0.95 });
      gsap.set(solutionWrapper, { x: 1220, y: 440 });
      gsap.set(arrowBox, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(shopLine, { clipPath: "inset(0 0 100% 0)" });
      gsap.set(shopWrapper, { x: 700, y: 620, scale: 0.9 });
      gsap.set(caption, { y: 20 });
      gsap.set(badge, { scale: 0.5, y: 10 });

      // PERFECT FADES
      master.fromTo(
        stageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" },
        0,
      );

      master
        .addLabel("start", "+=0.2")
        .to(
          problemWrapper,
          { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.enter },
          "start",
        )
        .addLabel("focus", "+=0.3")
        .to(
          cameraRef.current,
          { scale: 1.08, y: 20, duration: 1.5, ease: DS.easing.smooth },
          "focus",
        )
        .addLabel("split", "+=0.8")
        .to(
          problemWrapper,
          { x: 700, duration: 1.2, ease: DS.easing.smooth },
          "split",
        )
        .to(
          solutionWrapper,
          { opacity: 1, duration: 1.2, ease: DS.easing.smooth },
          "split",
        )
        .to(
          cameraRef.current,
          { scale: 1.6, y: -10, duration: 1.8, ease: DS.easing.smooth },
          "split+=0.2",
        )
        .addLabel("arrow", "-=0.4")
        .to(
          arrowBox,
          {
            opacity: 1,
            clipPath: "inset(0 0% 0 0)",
            duration: 1,
            ease: DS.easing.smooth,
          },
          "arrow",
        )
        .addLabel("shopReveal", "+=0.4")
        .to(
          shopLine,
          {
            opacity: 1,
            clipPath: "inset(0 0 0% 0)",
            duration: 0.6,
            ease: "power2.inOut",
          },
          "shopReveal",
        )
        .to(
          shopWrapper,
          { opacity: 1, scale: 1, duration: 0.8, ease: DS.easing.back },
          "shopReveal+=0.4",
        )
        .to(
          badge,
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: DS.easing.back },
          "shopReveal+=0.7",
        )
        .to(
          caption,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "shopReveal+=1.2",
        )
        .to({}, { duration: 2 }) // Hold before fade
        .addLabel("exit")
        .to(
          cameraRef.current,
          { scale: 1, y: 0, duration: 1.5, ease: DS.easing.exit },
          "exit",
        )
        .to(
          stageRef.current,
          { opacity: 0, duration: 1.5, ease: "power2.inOut" },
          "exit",
        ); // SMOOTH EXIT FADE

      masterTl.current = master;
    }, stageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const time = frame / fps;
    if (masterTl.current) masterTl.current.seek(time);
  }, [frame, fps]);

  return (
    <div
      ref={stageRef}
      style={{ position: "absolute", width: 1920, height: 1080, opacity: 0 }}
    >
      <div
        ref={cameraRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          transformOrigin: "center center",
        }}
      >
        <div
          ref={(el) => (refs.current.arrowBox = el)}
          style={{
            position: "absolute",
            left: 810,
            top: 430,
            width: 300,
            height: 20,
          }}
        >
          <svg width="300" height="20" style={{ overflow: "visible" }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill={DS.colors.accent.green.base}
                />
              </marker>
            </defs>
            <line
              x1="0"
              y1="10"
              x2="290"
              y2="10"
              stroke={DS.colors.accent.green.base}
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div
          ref={(el) => (refs.current.shopLine = el)}
          style={{
            position: "absolute",
            left: 698,
            top: 480,
            width: 4,
            height: 70,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: DS.colors.borderBright,
              borderRadius: 2,
            }}
          />
        </div>
        <div
          ref={(el) => (refs.current.problemWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            opacity: 0,
            transform: "translate3d(960px, 440px, 0) scale(0.95)",
            willChange: "transform, opacity",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -50,
              left: "50%",
              transform: "translateX(-50%)",
              ...DS.font.label,
              color: DS.colors.textSecondary,
            }}
          >
            PROBLEM
          </div>
          <FlowNode
            title="Missing Piece"
            icon={<PuzzleIcon />}
            glowColor={DS.colors.accent.rose}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              justifyContent: "center",
            }}
          />
        </div>
        <div
          ref={(el) => (refs.current.solutionWrapper = el)}
          style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              opacity: 0,
              transform: "translate3d(1220px, 440px, 0)",
              willChange: "transform, opacity",
            }}
          >
            SOLUTION
          </div>
          <FlowNode
            title="Software App"
            icon={<PuzzleIcon />}
            glowColor={DS.colors.accent.green}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              justifyContent: "center",
            }}
          />
        </div>
        <div
          ref={(el) => (refs.current.shopWrapper = el)}
          style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: DS.colors.cardElevated,
                borderRadius: 16,
                padding: 16,
                border: "1px solid " + DS.colors.border,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fill: DS.colors.textPrimary,
                boxShadow: DS.shadows.card,
              }}
            >
              <ShopIcon />
            </div>
            <Badge
              ref={(el) => (refs.current.badge = el)}
              colorObj={DS.colors.accent.amber}
            >
              Sara's Story
            </Badge>
          </div>
        </div>
      </div>
      <div
        ref={(el) => (refs.current.caption = el)}
        style={{
          position: "absolute",
          bottom: 60,
          width: "100%",
          textAlign: "center",
          ...DS.font.h2,
          fontSize: 64,
          color: DS.colors.textSecondary,
        }}
      >
        Every project begins here.
      </div>
    </div>
  );
};

const Scene2_MeetSaraAndHerRepairShop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const refs = useRef({});
  const fieldRefs = useRef([]);
  const masterTl = useRef(null);
  const idleTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      const idle = gsap.timeline({ paused: true });
      const validFields = fieldRefs.current.filter(Boolean);
      const {
        saraWrapper,
        saraFloat,
        shopWrapper,
        shopFloat,
        shopLine,
        techsWrapper,
        techsFloat,
        techLine,
        customerWrapper,
        customerFloat,
        customerLine,
        saraArrow,
        deviceRef,
        deviceFloat,
        checkingBadge,
        notingBadge,
        stickyRef,
        shelfWrapper,
      } = refs.current;

      gsap.set(
        [
          saraWrapper,
          shopWrapper,
          techsWrapper,
          customerWrapper,
          shelfWrapper,
          deviceRef,
          stickyRef,
          checkingBadge,
          notingBadge,
          shopLine,
          techLine,
          customerLine,
          saraArrow,
        ],
        { opacity: 0 },
      );

      // FIXED NATIVE COORDS NO TRANSLATE
      gsap.set(saraWrapper, { x: 600, y: 500 });
      gsap.set(shopWrapper, { x: 600, y: 200 });
      gsap.set(techsWrapper, { x: 1130, y: 480 });
      gsap.set(customerWrapper, { x: 300, y: 500 });
      gsap.set(deviceRef, { x: 450, y: 500, scale: 1 });
      gsap.set(stickyRef, { x: 1200, y: 220, scale: 0.8, rotation: 5 });
      gsap.set(validFields, { opacity: 0, x: -10 });
      gsap.set(shelfWrapper, { x: 1400, y: 500 });

      gsap.set(shopLine, { strokeDasharray: 170, strokeDashoffset: 170 });
      gsap.set(techLine, { strokeDasharray: 460, strokeDashoffset: 460 });
      gsap.set(customerLine, { strokeDasharray: 310, strokeDashoffset: 310 });
      gsap.set(saraArrow, { strokeDasharray: 300, strokeDashoffset: 300 });

      gsap.set(checkingBadge, { x: 660, y: 400, scale: 0.8 });
      gsap.set(notingBadge, { x: 1200, y: 460, scale: 0.8 }); // Lowered so it doesn't clip
      gsap.set(cameraRef.current, {
        scale: 1.27,
        x: 10,
        y: 120,
        transformOrigin: "51% 40%",
      });

      // FORCE 3D ON ALL FLOATS TO PREVENT SHAKING
      idle.to(
        saraFloat,
        {
          y: 6,
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );
      idle.to(
        shopFloat,
        {
          y: -6,
          duration: 4.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );
      idle.to(
        techsFloat,
        {
          y: 5,
          duration: 3.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );
      idle.to(
        customerFloat,
        {
          y: -5,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );
      idle.to(
        deviceFloat,
        {
          y: -4,
          duration: 2.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );

      // PERFECT FADES
      master.fromTo(
        stageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" },
        0,
      );

      master
        .addLabel("intro", "+=0.2")
        .to(
          saraWrapper,
          { opacity: 1, duration: 1.2, ease: "power2.inOut" },
          "intro",
        )
        .addLabel("shop", "+=0.5")
        .to(
          shopWrapper,
          { opacity: 1, duration: 1, ease: "power2.inOut" },
          "shop",
        )
        .to(
          shopLine,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          "shop+=0.2",
        )
        .addLabel("techs", "+=0.6")
        .to(
          techsWrapper,
          { opacity: 1, duration: 1, ease: "power2.inOut" },
          "techs",
        )
        .to(
          techLine,
          {
            opacity: 0.4,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "techs+=0.2",
        )
        .addLabel("clear_for_customer", "+=2")
        .to(
          [shopWrapper, techsWrapper, shopLine, techLine],
          { opacity: 0, duration: 0.8, ease: "power2.inOut" },
          "clear_for_customer",
        )
        .to(
          saraWrapper,
          { x: 1200, duration: 1.2, ease: "power3.inOut" },
          "clear_for_customer+=0.2",
        )
        .addLabel("customer_arrives", "+=0.4")
        .to(
          customerWrapper,
          { opacity: 1, duration: 1.2, ease: "power2.inOut" },
          "customer_arrives",
        )
        .to(
          deviceRef,
          { opacity: 1, duration: 1.2, ease: "power2.inOut" },
          "customer_arrives",
        )
        .addLabel("checking", "+=0.8")
        .to(
          deviceRef,
          { x: 750, duration: 1.2, ease: "power3.inOut" },
          "checking",
        )
        .to(
          customerLine,
          {
            opacity: 0.4,
            strokeDashoffset: 0,
            duration: 1.2,
            ease: "power3.inOut",
          },
          "checking",
        )
        .to(
          saraArrow,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power3.inOut",
          },
          "checking+=0.2",
        )
        .to(
          checkingBadge,
          { opacity: 1, y: 400, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "checking+=0.8",
        )
        .addLabel("noting", "+=1.5")
        .to(checkingBadge, { opacity: 0, y: 390, duration: 0.3 }, "noting")
        .to(
          notingBadge,
          { opacity: 1, y: 370, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "noting+=0.2",
        )
        .to(
          stickyRef,
          {
            opacity: 1,
            scale: 1,
            rotation: 2,
            duration: 0.6,
            ease: "back.out(1.5)",
          },
          "noting+=0.2",
        )
        .to(
          validFields,
          {
            opacity: 1,
            x: 0,
            stagger: 0.15,
            duration: 0.4,
            ease: "power2.out",
          },
          "noting+=0.6",
        )
        .addLabel("attach", "+=1.5")
        .to(
          notingBadge,
          { opacity: 1, y: 440, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "noting+=0.2",
        )
        .to([customerLine, saraArrow], { opacity: 0, duration: 0.5 }, "attach")

        // FIXED ALIGNMENT
        .to(
          stickyRef,
          {
            x: 720,
            y: 400,
            scale: 0.2,
            rotation: 8,
            duration: 0.8,
            ease: "power3.inOut",
          },
          "attach+=0.2",
        )
        .addLabel("shelf_time", "attach+=1.5")
        .to(
          [customerWrapper, saraWrapper],
          { opacity: 0, duration: 0.6 },
          "shelf_time",
        )

        // ADDED CAMERA PAN
        .to(
          cameraRef.current,
          { x: -450, duration: 1.5, ease: "power3.inOut" },
          "shelf_time",
        )
        .to(
          shelfWrapper,
          { opacity: 1, duration: 1, ease: "power2.inOut" },
          "shelf_time+=0.4",
        )
        .to(
          deviceRef,
          { x: 1370, y: 480, scale: 0.5, duration: 1.5, ease: "power3.inOut" },
          "shelf_time+=0.8",
        )
        .to(
          stickyRef,
          { x: 1310, y: 390, scale: 0.1, duration: 1.5, ease: "power3.inOut" },
          "shelf_time+=0.8",
        )
        .to({}, { duration: 2 }) // Hold before fade
        .addLabel("exit")
        .to(
          stageRef.current,
          { opacity: 0, duration: 1.5, ease: "power2.inOut" },
          "exit",
        ); // SMOOTH EXIT FADE

      masterTl.current = master;
      idleTl.current = idle;
    }, stageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const time = frame / fps;
    if (masterTl.current) masterTl.current.seek(time);
    if (idleTl.current) idleTl.current.seek(time);
  }, [frame, fps]);

  return (
    <div
      ref={stageRef}
      style={{
        position: "absolute",
        width: 1920,
        height: 1080,
        overflow: "hidden",
        opacity: 0,
      }}
    >
      <div
        ref={cameraRef}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: 1920,
            height: 1080,
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="saraArrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill={DS.colors.accent.amber.base}
              />
            </marker>
          </defs>
          <line
            ref={(el) => (refs.current.shopLine = el)}
            x1="600"
            y1="280"
            x2="600"
            y2="450"
            stroke={DS.colors.borderBright}
            strokeWidth="3"
            strokeDasharray="6 6"
            fill="none"
          />
          <line
            ref={(el) => (refs.current.techLine = el)}
            x1="680"
            y1="500"
            x2="1140"
            y2="500"
            stroke={DS.colors.borderBright}
            strokeWidth="3"
            strokeDasharray="8 8"
            fill="none"
          />
          <line
            ref={(el) => (refs.current.customerLine = el)}
            x1="390"
            y1="500"
            x2="700"
            y2="500"
            stroke={DS.colors.accent.amber.base}
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
          />
          <line
            ref={(el) => (refs.current.saraArrow = el)}
            x1="800"
            y1="500"
            x2="1100"
            y2="500"
            stroke={DS.colors.accent.amber.base}
            strokeWidth="2"
            strokeDasharray="6 6"
            markerEnd="url(#saraArrowhead)"
            fill="none"
          />
        </svg>

        <div
          ref={(el) => (refs.current.checkingBadge = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Badge colorObj={DS.colors.accent.amber}>Checking Device...</Badge>
        </div>
        <div
          ref={(el) => (refs.current.notingBadge = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Badge colorObj={DS.colors.accent.cyan}>Noting Details...</Badge>
        </div>

        <div
          ref={(el) => (refs.current.shopWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.shopFloat = el)}
            style={{
              willChange: "transform",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 120,
                height: 120,
                background: DS.colors.cardElevated,
                borderRadius: 20,
                border: `2px solid ${DS.colors.borderBright}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fill: DS.colors.textSecondary,
                boxShadow: `0 0 40px ${DS.colors.accent.cyan.glow}`,
              }}
            >
              <div style={{ width: 64, height: 64, opacity: 0.8 }}>
                <ShopIcon />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: -10,
                  width: 36,
                  height: 36,
                  background: DS.colors.panel,
                  borderRadius: 8,
                  border: `1px solid ${DS.colors.borderBright}`,
                  padding: 6,
                  color: DS.colors.accent.amber.base,
                  boxShadow: DS.shadows.card,
                }}
              >
                <PhoneIcon />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: -14,
                  width: 44,
                  height: 32,
                  background: DS.colors.panel,
                  borderRadius: 8,
                  border: `1px solid ${DS.colors.borderBright}`,
                  padding: 5,
                  color: DS.colors.accent.green.base,
                  boxShadow: DS.shadows.card,
                }}
              >
                <LaptopIcon />
              </div>
            </div>
            <Badge colorObj={DS.colors.accent.cyan}>Sara's Shop</Badge>
          </div>
        </div>

        <div
          ref={(el) => (refs.current.saraWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.saraFloat = el)}
            style={{ willChange: "transform" }}
          >
            <FlowNode
              title="Sara"
              icon={<PersonIcon />}
              glowColor={DS.colors.accent.cyan}
              style={{ minWidth: 160, justifyContent: "center" }}
            />
          </div>
        </div>

        <div
          ref={(el) => (refs.current.techsWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
          }}
        >
          <div style={{ transform: "translate(-50%, -50%)" }}>
            <div
              ref={(el) => (refs.current.techsFloat = el)}
              style={{
                willChange: "transform",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Badge colorObj={DS.colors.accent.indigo}>Technicians</Badge>
              <div style={{ display: "flex", gap: 20 }}>
                <FlowNode
                  title="Tech 1"
                  icon={<PersonIcon />}
                  style={{ minWidth: 150 }}
                />
                <FlowNode
                  title="Tech 2"
                  icon={<PersonIcon />}
                  style={{ minWidth: 150 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          ref={(el) => (refs.current.customerWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.customerFloat = el)}
            style={{ willChange: "transform" }}
          >
            <FlowNode
              title="Customer"
              icon={<PersonIcon />}
              glowColor={DS.colors.accent.amber}
              style={{ minWidth: 180, justifyContent: "center" }}
            />
          </div>
        </div>

        <div
          ref={(el) => (refs.current.deviceRef = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 20,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.deviceFloat = el)}
            style={{
              willChange: "transform",
              width: 80,
              height: 80,
              background: DS.colors.card,
              borderRadius: 16,
              border: `2px solid ${DS.colors.accent.amber.base}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fill: DS.colors.textPrimary,
              boxShadow: `0 0 24px ${DS.colors.accent.amber.glow}`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                color: DS.colors.accent.amber.base,
              }}
            >
              <PhoneIcon />
            </div>
          </div>
        </div>

        <div
          ref={(el) => (refs.current.stickyRef = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ transform: "translate(-50%, -50%)" }}>
            <div
              style={{
                width: 170,
                background: "#FEF3C7",
                border: `1px solid #F59E0B`,
                borderRadius: 4,
                padding: "16px 20px",
                boxShadow: `0 12px 32px rgba(0,0,0,0.6)`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#92400E",
                  borderBottom: `2px solid #FCD34D`,
                  paddingBottom: 6,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                TICKET #104
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  ref={(el) => (fieldRefs.current[0] = el)}
                  style={{
                    fontSize: 12,
                    color: "#B45309",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Name:</span>{" "}
                  <span style={{ color: "#78350F" }}>John</span>
                </div>
                <div
                  ref={(el) => (fieldRefs.current[1] = el)}
                  style={{
                    fontSize: 12,
                    color: "#B45309",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Phone:</span>{" "}
                  <span style={{ color: "#78350F" }}>555-0192</span>
                </div>
                <div
                  ref={(el) => (fieldRefs.current[2] = el)}
                  style={{
                    fontSize: 12,
                    color: "#B45309",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Device:</span>{" "}
                  <span style={{ color: "#78350F" }}>PX-92</span>
                </div>
                <div
                  ref={(el) => (fieldRefs.current[3] = el)}
                  style={{
                    fontSize: 12,
                    color: "#B45309",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Issue:</span>{" "}
                  <span style={{ color: "#78350F" }}>Screen</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={(el) => (refs.current.shelfWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: 220,
              height: 280,
              background: DS.colors.panel,
              borderRadius: 16,
              border: `2px solid ${DS.colors.borderBright}`,
              display: "flex",
              flexDirection: "column",
              padding: "32px 20px",
              gap: 50,
              boxShadow: DS.shadows.card,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 4,
                background: DS.colors.borderBright,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                width: "100%",
                height: 4,
                background: DS.colors.borderBright,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                width: "100%",
                height: 4,
                background: DS.colors.borderBright,
                borderRadius: 2,
              }}
            />
          </div>
          <Badge
            colorObj={DS.colors.accent.green}
            style={{
              position: "absolute",
              top: -50,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            Waiting Repairs
          </Badge>
        </div>
      </div>
    </div>
  );
};

const Scene3_TheWorkflowWorksSmoothly = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const refs = useRef({});
  const masterTl = useRef(null);
  const idleTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      const idle = gsap.timeline({ paused: true });
      const {
        shelfWrapper,
        shelfFloat,
        techWrapper,
        techFloat,
        workbenchRef,
        saraWrapper,
        saraFloat,
        customerWrapper,
        customerFloat,
        movingDevice,
        toolsWrapper,
        checkBadge,
        happyBadge,
        lineShelfTech,
        lineTechSara,
        lineSaraCustomer,
        badgeShelfTech,
        badgeTechSara,
        badgeSaraCustomer,
        notificationIcon,
        captionText,
        staticDevice1,
        staticDevice2,
      } = refs.current;

      gsap.set(
        [
          shelfWrapper,
          techWrapper,
          saraWrapper,
          customerWrapper,
          workbenchRef,
          movingDevice,
          toolsWrapper,
          checkBadge,
          happyBadge,
          notificationIcon,
          captionText,
          badgeShelfTech,
          badgeTechSara,
          badgeSaraCustomer,
          staticDevice1,
          staticDevice2,
        ],
        { opacity: 0 },
      );
      gsap.set(cameraRef.current, {
        scale: 1.26,
        x: 30,
        y: -20,
        transformOrigin: "center center",
      });

      gsap.set([lineShelfTech, lineTechSara, lineSaraCustomer], { opacity: 0 });
      gsap.set(lineShelfTech, { strokeDasharray: 300, strokeDashoffset: 300 });
      gsap.set(lineTechSara, { strokeDasharray: 1200, strokeDashoffset: 1200 });
      gsap.set(lineSaraCustomer, {
        strokeDasharray: 350,
        strokeDashoffset: 350,
      });

      gsap.set(shelfWrapper, { x: 960, y: 500 });
      gsap.set(techWrapper, { x: 1550, y: 500 });
      gsap.set(workbenchRef, { x: 1400, y: 640 });
      gsap.set(saraWrapper, { x: 400, y: 450 });
      gsap.set(customerWrapper, { x: 400, y: 750 });
      gsap.set(movingDevice, { x: 960, y: 500, scale: 0.6 });
      gsap.set(staticDevice1, { x: 960, y: 410, scale: 0.6 });
      gsap.set(staticDevice2, { x: 960, y: 590, scale: 0.6 });
      gsap.set(toolsWrapper, { x: 1400, y: 640, scale: 0 });
      gsap.set(checkBadge, { x: 1400, y: 560, scale: 0.5 });
      gsap.set(notificationIcon, { x: 400, y: 520, scale: 0.5 });
      gsap.set(happyBadge, { x: 540, y: 680, scale: 0.5 });
      gsap.set(captionText, { y: 20 });
      gsap.set(stageRef.current, { opacity: 1 });

      idle.to(
        shelfFloat,
        {
          y: "+=4",
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );
      idle.to(
        techFloat,
        {
          y: "-=5",
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );
      idle.to(
        saraFloat,
        {
          y: "+=6",
          duration: 3.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );
      idle.to(
        customerFloat,
        {
          y: "-=5",
          duration: 3.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );

      // PERFECT FADES
      master.fromTo(
        stageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" },
        0,
      );

      master
        .addLabel("start", "+=0.2")
        .to(
          [shelfWrapper, staticDevice1, staticDevice2, movingDevice],
          { opacity: 1, duration: 1.2, ease: "power2.inOut", stagger: 0.1 },
          "start",
        )
        .addLabel("tech", "start+=1.6") // FIXED RELATIVE TIMING
        .to(
          techWrapper,
          { opacity: 1, x: 1400, duration: 1.2, ease: "power3.out" },
          "tech",
        )
        .to(
          workbenchRef,
          { opacity: 1, duration: 1, ease: "power2.out" },
          "tech+=0.4",
        )
        .addLabel("arrow1", "tech+=1.4")
        .to(
          lineShelfTech,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "arrow1",
        )

        // FIXED MARCHING ANTS
        .set(lineShelfTech, { strokeDasharray: "8 8" }, "arrow1+=1")
        .to(
          lineShelfTech,
          { strokeDashoffset: -1000, duration: 50, ease: "none" },
          "arrow1+=1",
        ) // Long duration to prevent stopping

        .to(
          badgeShelfTech,
          { opacity: 1, y: -10, duration: 0.5, ease: "back.out(2)" },
          "arrow1+=0.5",
        )
        .addLabel("move1", "arrow1+=1.5") // FIXED
        .to(
          movingDevice,
          { x: 1400, y: 640, scale: 0.8, duration: 1.5, ease: "power3.inOut" },
          "move1",
        )
        .addLabel("repair", "move1+=1.5") // FIXED
        .to(
          toolsWrapper,
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" },
          "repair",
        )
        .to(
          toolsWrapper,
          { rotation: 360, duration: 1.5, ease: "power2.inOut" },
          "repair+=0.2",
        )
        .addLabel("done", "repair+=1.7") // FIXED
        .to(toolsWrapper, { opacity: 0, duration: 0.3 }, "done")
        .to(
          checkBadge,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "done+=0.2",
        )
        .addLabel("sara", "done+=0.8") // FIXED
        .to(
          saraWrapper,
          { opacity: 1, duration: 1, ease: "power2.inOut" },
          "sara",
        )
        .to(
          lineTechSara,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power2.inOut",
          },
          "sara+=0.4",
        )

        // FIXED MARCHING ANTS
        .set(lineTechSara, { strokeDasharray: "6 6" }, "sara+=1.9")
        .to(
          lineTechSara,
          { strokeDashoffset: -1000, duration: 50, ease: "none" },
          "sara+=1.9",
        )

        .to(
          badgeTechSara,
          { opacity: 1, y: 60, duration: 0.5, ease: "back.out(2)" },
          "sara+=1.2",
        )
        .addLabel("customer", "sara+=2.5") // FIXED
        .to(
          customerWrapper,
          { opacity: 1, duration: 1, ease: "power2.inOut" },
          "customer",
        )
        .to(
          lineSaraCustomer,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "customer+=0.4",
        )

        // FIXED MARCHING ANTS
        .set(lineSaraCustomer, { strokeDasharray: "6 6" }, "customer+=1.4")
        .to(
          lineSaraCustomer,
          { strokeDashoffset: -1000, duration: 50, ease: "none" },
          "customer+=1.4",
        )

        .to(
          badgeSaraCustomer,
          { opacity: 1, y: -10, duration: 0.5, ease: "back.out(2)" },
          "customer+=0.8",
        )
        .addLabel("notify", "customer+=2.0") // FIXED
        .to(notificationIcon, { opacity: 1, scale: 1, duration: 0.3 }, "notify")
        .to(
          notificationIcon,
          { y: 650, duration: 1.2, ease: "power2.inOut" },
          "notify+=0.3",
        )
        // Smoothly move the device to the customer instead of teleporting it
        .to(
          movingDevice,
          { x: 540, y: 750, duration: 1.2, ease: "power3.inOut" },
          "notify+=0.3",
        )
        .to(notificationIcon, { opacity: 0, duration: 0.2 }, "notify+=1.5")
        .to(
          happyBadge,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "notify+=1.6",
        )

        .addLabel("finale", "notify+=2.5") // FIXED
        .to(
          captionText,
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "finale",
        )
        .to(
          cameraRef.current,
          { scale: 1.15, y: -30, duration: 4, ease: "power2.inOut" },
          "finale",
        )
        .addLabel("exit", "finale+=4.0") // FIXED
        .to(
          stageRef.current,
          { opacity: 0, duration: 1.5, ease: "power2.inOut" },
          "exit",
        ); // SMOOTH EXIT FADE

      masterTl.current = master;
      idleTl.current = idle;
    }, stageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const time = frame / fps;
    if (masterTl.current) masterTl.current.seek(time);
    if (idleTl.current) idleTl.current.seek(time);
  }, [frame, fps]);

  return (
    <div
      ref={stageRef}
      style={{
        position: "absolute",
        width: 1920,
        height: 1080,
        overflow: "hidden",
        opacity: 0,
      }}
    >
      <div
        ref={cameraRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          transformOrigin: "center center",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: 1920,
            height: 1080,
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="arrowNext"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill={DS.colors.accent.amber.base}
              />
            </marker>
          </defs>
          <line
            ref={(el) => (refs.current.lineShelfTech = el)}
            x1="1090"
            y1="500"
            x2="1300"
            y2="500"
            stroke={DS.colors.accent.amber.base}
            strokeWidth="3"
            markerEnd="url(#arrowNext)"
            fill="none"
          />
          <path
            ref={(el) => (refs.current.lineTechSara = el)}
            d="M 1400 450 Q 900 150 400 450"
            stroke={DS.colors.accent.green.base}
            strokeWidth="3"
            fill="none"
          />
          <line
            ref={(el) => (refs.current.lineSaraCustomer = el)}
            x1="400"
            y1="500"
            x2="400"
            y2="700"
            stroke={DS.colors.accent.cyan.base}
            strokeWidth="3"
            fill="none"
          />
        </svg>

        <div
          ref={(el) => (refs.current.badgeShelfTech = el)}
          style={{
            position: "absolute",
            left: 1195,
            top: 460,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Badge colorObj={DS.colors.accent.amber}>Next Device</Badge>
        </div>
        <div
          ref={(el) => (refs.current.badgeTechSara = el)}
          style={{
            position: "absolute",
            left: 900,
            top: 150,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Badge colorObj={DS.colors.accent.green}>Repair Complete</Badge>
        </div>
        <div
          ref={(el) => (refs.current.badgeSaraCustomer = el)}
          style={{
            position: "absolute",
            left: 500,
            top: 600,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <Badge colorObj={DS.colors.accent.cyan}>Customer Notified</Badge>
        </div>

        {/* Separated Transforms for Stability */}
        <div
          ref={(el) => (refs.current.shelfWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.shelfFloat = el)}
            style={{
              willChange: "transform",
              width: 220,
              height: 280,
              background: DS.colors.panel,
              borderRadius: 16,
              border: `2px solid ${DS.colors.borderBright}`,
              display: "flex",
              flexDirection: "column",
              padding: "32px 20px",
              gap: 50,
              boxShadow: DS.shadows.card,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 4,
                background: DS.colors.borderBright,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                width: "100%",
                height: 4,
                background: DS.colors.borderBright,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                width: "100%",
                height: 4,
                background: DS.colors.borderBright,
                borderRadius: 2,
              }}
            />
            <Badge
              colorObj={DS.colors.accent.amber}
              style={{
                position: "absolute",
                top: -50,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              Repair Queue
            </Badge>
          </div>
        </div>

        <div
          ref={(el) => (refs.current.staticDevice1 = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 5,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div style={{ position: "relative", width: 60, height: 60 }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: DS.colors.card,
                borderRadius: 12,
                border: `1px solid ${DS.colors.borderBright}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: DS.colors.textSecondary,
              }}
            >
              <div style={{ width: 24, height: 24 }}>
                <PhoneIcon />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                width: 24,
                height: 24,
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                borderRadius: 4,
                zIndex: 2,
                transform: "rotate(10deg)",
              }}
            />
          </div>
        </div>

        <div
          ref={(el) => (refs.current.staticDevice2 = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 5,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div style={{ position: "relative", width: 60, height: 60 }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: DS.colors.card,
                borderRadius: 12,
                border: `1px solid ${DS.colors.borderBright}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: DS.colors.textSecondary,
              }}
            >
              <div style={{ width: 24, height: 24 }}>
                <PhoneIcon />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                width: 24,
                height: 24,
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                borderRadius: 4,
                zIndex: 2,
                transform: "rotate(-5deg)",
              }}
            />
          </div>
        </div>

        <div
          ref={(el) => (refs.current.techWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.techFloat = el)}
            style={{ willChange: "transform" }}
          >
            <FlowNode
              title="Technician"
              icon={<PersonIcon />}
              glowColor={DS.colors.accent.indigo}
              style={{ minWidth: 160 }}
            />
          </div>
        </div>
        <div
          ref={(el) => (refs.current.workbenchRef = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: 140,
              height: 90,
              background: DS.colors.cardElevated,
              borderRadius: 16,
              border: `1px solid ${DS.colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fill: DS.colors.textTertiary,
              boxShadow: DS.shadows.card,
            }}
          >
            <div style={{ width: 56, height: 56 }}>
              <WorkbenchIcon />
            </div>
          </div>
        </div>
        <div
          ref={(el) => (refs.current.saraWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.saraFloat = el)}
            style={{ willChange: "transform" }}
          >
            <FlowNode
              title="Sara"
              icon={<PersonIcon />}
              glowColor={DS.colors.accent.cyan}
              style={{ minWidth: 160 }}
            />
          </div>
        </div>
        <div
          ref={(el) => (refs.current.customerWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.customerFloat = el)}
            style={{ willChange: "transform" }}
          >
            <FlowNode
              title="Customer"
              icon={<PersonIcon />}
              style={{ minWidth: 160 }}
            />
          </div>
        </div>
        <div
          ref={(el) => (refs.current.movingDevice = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 20,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: DS.colors.card,
                borderRadius: 16,
                border: `2px solid ${DS.colors.accent.amber.base}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: DS.colors.accent.amber.base,
                boxShadow: `0 0 20px ${DS.colors.accent.amber.glow}`,
              }}
            >
              <div style={{ width: 40, height: 40 }}>
                <PhoneIcon />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: -12,
                right: -12,
                width: 32,
                height: 32,
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                borderRadius: 4,
                zIndex: 2,
                transform: "rotate(8deg)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
        <div
          ref={(el) => (refs.current.toolsWrapper = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 25,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div style={{ width: 120, height: 120 }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 32,
                height: 32,
                color: DS.colors.textSecondary,
                background: DS.colors.panel,
                borderRadius: 8,
                padding: 4,
                border: `1px solid ${DS.colors.borderBright}`,
              }}
            >
              <WrenchIcon />
            </div>
          </div>
        </div>
        <div
          ref={(el) => (refs.current.checkBadge = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 30,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: DS.colors.accent.green.base,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.colors.bg,
              boxShadow: `0 0 24px ${DS.colors.accent.green.glow}`,
            }}
          >
            <div style={{ width: 28, height: 28 }}>
              <CheckIcon />
            </div>
          </div>
        </div>
        <div
          ref={(el) => (refs.current.notificationIcon = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 30,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: DS.colors.panel,
              border: `2px solid ${DS.colors.accent.cyan.base}`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.colors.accent.cyan.base,
              boxShadow: `0 0 16px ${DS.colors.accent.cyan.glow}`,
            }}
          >
            <div style={{ width: 24, height: 24 }}>
              <PhoneCallIcon />
            </div>
          </div>
        </div>
        <div
          ref={(el) => (refs.current.happyBadge = el)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 30,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: DS.colors.bg,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.colors.accent.green.base,
            }}
          >
            <div style={{ width: 32, height: 32 }}>
              <HappyIcon />
            </div>
          </div>
        </div>
        <div
          ref={(el) => (refs.current.captionText = el)}
          style={{
            position: "absolute",
            bottom: 120,
            width: "100%",
            textAlign: "center",
            ...DS.font.h2,
            color: DS.colors.textSecondary,
          }}
        >
          Everything runs smoothly right?
        </div>
      </div>
    </div>
  );
};

const Scene4_SuccessCreatesPressure = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const refs = useRef({
    shelf: null,
    sara: null,
    saraFloat: null,
    caption: null,
    customers: [],
  });
  const masterTl = useRef(null);
  const idleTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      const idle = gsap.timeline({ paused: true });
      const validCustomers = refs.current.customers.filter(Boolean);

      gsap.set(refs.current.shelf, { opacity: 0, scale: 0.9 });
      gsap.set(refs.current.sara, {
        opacity: 0,
        filter: "drop-shadow(0 0 0px transparent)",
      });
      gsap.set(refs.current.caption, { opacity: 0, y: 20 });
      gsap.set(validCustomers, { opacity: 0, scale: 0 });
      gsap.set(cameraRef.current, {
        scale: 1.4,
        x: 230,
        y: -20,
        transformOrigin: "center center",
      });

      idle.to(
        refs.current.saraFloat,
        {
          y: 8,
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );

      // PERFECT FADES
      master.fromTo(
        stageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" },
        0,
      );

      master
        .addLabel("start", "+=0.2")
        .to(
          refs.current.shelf,
          { opacity: 1, scale: 1, duration: 1, ease: "power4.out" },
          "start",
        )
        .to(refs.current.sara, { opacity: 1, duration: 1 }, "start+=0.3")
        .addLabel("chaos", "+=0.8")
        .to(
          validCustomers,
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: "back.out(1.7)",
          },
          "chaos",
        )
        .to(
          refs.current.sara,
          {
            filter: `drop-shadow(0 0 20px ${DS.colors.accent.rose.base})`,
            duration: 1,
          },
          "chaos+=1",
        )
        .addLabel("caption", "+=0.5")
        .to(
          refs.current.caption,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "caption",
        )
        .to({}, { duration: 2 }) // Hold before fade
        .addLabel("exit")
        .to(
          stageRef.current,
          { opacity: 0, duration: 1.5, ease: "power2.inOut" },
          "exit",
        ); // SMOOTH EXIT FADE

      masterTl.current = master;
      idleTl.current = idle;
    }, stageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const time = frame / fps;
    if (masterTl.current) masterTl.current.seek(time);
    if (idleTl.current) idleTl.current.seek(time);
  }, [frame, fps]);

  return (
    <div
      ref={stageRef}
      style={{
        position: "absolute",
        width: 1920,
        height: 1080,
        overflow: "hidden",
        opacity: 0,
      }}
    >
      <div
        ref={cameraRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          transformOrigin: "center center",
        }}
      >
        <div
          ref={(el) => (refs.current.sara = el)}
          style={{
            position: "absolute",
            left: 300,
            top: 500,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            ref={(el) => (refs.current.saraFloat = el)}
            style={{ willChange: "transform" }}
          >
            <FlowNode
              title="Sara"
              icon={<PersonIcon />}
              glowColor={DS.colors.accent.cyan}
            />
          </div>
        </div>
        <div
          ref={(el) => (refs.current.shelf = el)}
          style={{
            position: "absolute",
            left: 760,
            top: 250,
            width: 400,
            height: 500,
            background: DS.colors.panel,
            border: `2px solid ${DS.colors.borderBright}`,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Badge
            colorObj={DS.colors.accent.rose}
            style={{ margin: "0 auto 20px", width: "max-content" }}
          >
            Overwhelmed Queue
          </Badge>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
            }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (refs.current.customers[i] = el)}
                style={{
                  width: 60,
                  height: 60,
                  background: DS.colors.cardElevated,
                  border: `1px solid ${DS.colors.accent.rose.base}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    color: DS.colors.accent.rose.base,
                  }}
                >
                  <PhoneIcon />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        ref={(el) => (refs.current.caption = el)}
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          textAlign: "center",
          ...DS.font.h2,
          fontSize: 64,
          color: DS.colors.textPrimary,
        }}
      >
        But success brings pressure. And the system...{" "}
        <span style={{ color: DS.colors.accent.rose.base }}>
          begins to fail.
        </span>
      </div>
    </div>
  );
};

const Scene5_TheStickyNoteSystemBreaksDown = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const saraRef = useRef(null);
  const cardRef = useRef(null);
  const realizationRef = useRef(null);
  const pointsRefs = useRef([]);
  const masterTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      const validPoints = pointsRefs.current.filter(Boolean);

      gsap.set(
        [
          saraRef.current,
          cardRef.current,
          ...validPoints,
          realizationRef.current,
        ],
        { opacity: 0 },
      );
      gsap.set([saraRef.current, cardRef.current], { y: 30 });
      gsap.set(realizationRef.current, { scale: 0.9, y: 20 });
      gsap.set(cameraRef.current, {
        scale: 1.35,
        transformOrigin: "center center",
      });

      // PERFECT FADES
      master.fromTo(
        stageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" },
        0,
      );

      master
        .addLabel("start", "+=0.2")
        .to(
          saraRef.current,
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
          "start",
        )
        .to(
          cardRef.current,
          { opacity: 1, y: 0, duration: 1, ease: "power4.out" },
          "start+=0.2",
        )
        .to(
          validPoints,
          { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" },
          "start+=0.5",
        )
        .addLabel("realization", "+=2")
        .to(
          realizationRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2)" },
          "realization",
        )
        .to({}, { duration: 2 }) // Hold before fade
        .addLabel("exit")
        .to(
          stageRef.current,
          { opacity: 0, duration: 1.5, ease: "power2.inOut" },
          "exit",
        ); // SMOOTH EXIT FADE

      masterTl.current = master;
    }, stageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const time = frame / fps;
    if (masterTl.current) masterTl.current.seek(time);
  }, [frame, fps]);

  return (
    <div
      ref={stageRef}
      style={{
        position: "absolute",
        width: 1920,
        height: 1080,
        overflow: "hidden",
        opacity: 0,
      }}
    >
      <div
        ref={cameraRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 100,
        }}
      >
        <div ref={saraRef}>
          <FlowNode
            title="Sara"
            icon={<PersonIcon />}
            glowColor={DS.colors.accent.rose}
          />
        </div>
        <div
          ref={cardRef}
          style={{
            background: DS.colors.panel,
            border: `2px solid ${DS.colors.borderBright}`,
            borderRadius: 24,
            padding: 48,
            width: 700,
            boxShadow: DS.shadows.card,
          }}
        >
          <h2
            style={{
              ...DS.font.h2,
              marginBottom: 32,
              color: DS.colors.accent.rose.base,
            }}
          >
            System Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              "Tracking the progress of repairs became impossible with so many devices.",
              "Sara can’t give clear updates when customers call.",
              "Sticky notes became difficult to track, resulting in errors.",
              "Customer satisfaction is dropping due to lack of clear communication.",
            ].map((text, i) => (
              <div
                key={i}
                ref={(el) => (pointsRefs.current[i] = el)}
                style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: DS.colors.accent.rose.base,
                    marginTop: 10,
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    ...DS.font.bodyLg,
                    margin: 0,
                    color: DS.colors.textPrimary,
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div
          ref={realizationRef}
          style={{
            position: "absolute",
            bottom: 150,
            textAlign: "center",
            background: DS.colors.accent.indigo.glow,
            border: `1px solid ${DS.colors.accent.indigo.base}`,
            padding: "24px 48px",
            borderRadius: 9999,
          }}
        ></div>
      </div>
    </div>
  );
};

const Scene6_TheTransformationAndConclusion = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stageRef = useRef(null);
  const cameraRef = useRef(null);
  const refs = useRef({});
  const masterTl = useRef(null);
  const idleTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true });
      const idle = gsap.timeline({ paused: true });
      const {
        p1Wrapper,
        p1Sara,
        p1SaraFloat,
        p1Cloud,
        p1Chaos,
        p1AppIcon,
        p1Badge,
        p1Caption,
        p2Wrapper,
        p2AppCard,
        p2AppFloat,
        p2AppStatusInProg,
        p2AppStatusDone,
        p2Sara,
        p2SaraFloat,
        p2Techs,
        p2TechsFloat,
        p2LineLog,
        p2LineLive,
        p2LineWork,
        p2LineUpdate,
        p2BadgeLog,
        p2BadgeLive,
        p2BadgeWork,
        p2BadgeUpdate,
        p2Caption,
        p2FlyLog,
        p2FlyWork,
        p2FlyUpdate,
        p2FlyLive,
        p3Wrapper,
        p3ProblemBox,
        p3ProblemFloat,
        p3SolutionBox,
        p3SolutionFloat,
        p3RoadmapPathTop,
        p3RoadmapPathMid,
        p3RoadmapPathBot,
        p3Target,
        p3TargetBadge,
        p3Caption,
      } = refs.current;

      gsap.set(
        [
          p1Wrapper,
          p2Wrapper,
          p3Wrapper,
          p1Sara,
          p1Cloud,
          p1AppIcon,
          p1Badge,
          p1Caption,
          p2AppCard,
          p2Sara,
          p2Techs,
          p2AppStatusDone,
          p2LineLog,
          p2LineLive,
          p2LineWork,
          p2LineUpdate,
          p2BadgeLog,
          p2BadgeLive,
          p2BadgeWork,
          p2BadgeUpdate,
          p2Caption,
          p2FlyLog,
          p2FlyWork,
          p2FlyUpdate,
          p2FlyLive,
          p3ProblemBox,
          p3SolutionBox,
          p3Target,
          p3TargetBadge,
          p3Caption,
        ],
        { opacity: 0 },
      );

      gsap.set(cameraRef.current, {
        scale: 1.35,
        y: 30,
        transformOrigin: "center center",
      });
      gsap.set(p1Sara, { x: 960, y: 650 });
      gsap.set(p1Cloud, { x: 960, y: 350, scale: 0.8 });
      gsap.set(p1AppIcon, { scale: 0 });
      gsap.set(p1Badge, { x: 960, y: 500, scale: 0.8 });
      gsap.set(p2AppCard, { x: 960, y: 500, scale: 0.9 });
      gsap.set(p2Sara, { x: 420, y: 500 });
      gsap.set(p2Techs, { x: 1500, y: 500 });

      // SVG lines fixed to card edges explicitly
      gsap.set(p2LineLog, { strokeDasharray: 400, strokeDashoffset: 400 });
      gsap.set(p2LineLive, { strokeDasharray: 400, strokeDashoffset: -400 });
      gsap.set(p2LineWork, { strokeDasharray: 400, strokeDashoffset: 400 });
      gsap.set(p2LineUpdate, { strokeDasharray: 400, strokeDashoffset: -400 });

      gsap.set(p2BadgeLog, {
        x: 620,
        y: 420,
        xPercent: -50,
        yPercent: -50,
        scale: 0.8,
      });
      gsap.set(p2BadgeLive, {
        x: 620,
        y: 580,
        xPercent: -50,
        yPercent: -50,
        scale: 0.8,
      });
      gsap.set(p2BadgeWork, {
        x: 1300,
        y: 420,
        xPercent: -50,
        yPercent: -50,
        scale: 0.8,
      });
      gsap.set(p2BadgeUpdate, {
        x: 1300,
        y: 580,
        xPercent: -50,
        yPercent: -50,
        scale: 0.8,
      });

      // Fly icons updated to originate exactly from Node Centers
      gsap.set(p2FlyLog, { x: 420, y: 480, scale: 0.5 });
      gsap.set(p2FlyWork, { x: 1100, y: 480, scale: 0.5 });
      gsap.set(p2FlyUpdate, { x: 1500, y: 520, scale: 0.5 });
      gsap.set(p2FlyLive, { x: 820, y: 520, scale: 0.5 });

      gsap.set(p3ProblemBox, { x: 420, y: 450, scale: 0.9 });
      gsap.set(p3SolutionBox, { x: 1500, y: 450, scale: 0.9 });
      gsap.set([p3RoadmapPathTop, p3RoadmapPathMid, p3RoadmapPathBot], {
        strokeDasharray: 1200,
        strokeDashoffset: 1200,
      });
      gsap.set(p3Target, { x: 1420, y: 450, scale: 0 });
      gsap.set(p3TargetBadge, {
        x: 960,
        y: 425,
        xPercent: -50,
        yPercent: -50,
        scale: 0.8,
      });
      gsap.set(p2LineLog, { strokeDasharray: 220, strokeDashoffset: 220 });
      gsap.set(p2LineLive, { strokeDasharray: 220, strokeDashoffset: -220 });
      gsap.set(p2LineWork, { strokeDasharray: 220, strokeDashoffset: 220 });
      gsap.set(p2LineUpdate, { strokeDasharray: 220, strokeDashoffset: -220 });
      // 1. Remove Phase 2 nodes from the staggered float array
      const floatNodes = [p1SaraFloat, p3ProblemFloat, p3SolutionFloat];

      floatNodes.forEach((ref, i) => {
        idle.to(
          ref,
          {
            y: "+=8",
            duration: 3.5 + Math.abs(Math.sin(i)),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            force3D: true,
          },
          0,
        );
      });

      // 2. Float the ENTIRE Phase 2 wrapper as a single locked unit.
      // This keeps the lines permanently attached to their exact targets!
      idle.to(
        p2Wrapper,
        {
          y: "+=8",
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          force3D: true,
        },
        0,
      );

      const chaosDots = p1Chaos.children;
      Array.from(chaosDots).forEach((dot, i) => {
        const s1 = Math.sin(i * 12.5);
        const s2 = Math.cos(i * 12.5);
        idle.to(
          dot,
          {
            x: s1 * 15,
            y: s2 * 15,
            rotation: s1 * 45,
            duration: 0.4 + Math.abs(s2) * 0.3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true,
          },
          0,
        );
      });

      // PERFECT FADES
      master.fromTo(
        stageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.inOut" },
        0,
      );

      master
        .addLabel("p1", "+=0.2")
        .to(p1Wrapper, { opacity: 1, duration: 0.1 }, "p1")
        .to(p1Sara, { opacity: 1, duration: 1.2, ease: "power3.out" }, "p1")
        .to(
          p1Cloud,
          { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" },
          "p1+=0.4",
        )
        .addLabel("p1_idea", "+=1.5")
        .to(
          p1Chaos,
          { opacity: 0, scale: 0.5, duration: 0.8, ease: "power2.inOut" },
          "p1_idea",
        )
        .to(
          p1AppIcon,
          { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.6)" },
          "p1_idea+=0.5",
        )
        .to(
          p1Cloud,
          {
            filter: `drop-shadow(0 0 30px ${DS.colors.accent.cyan.glow})`,
            duration: 1,
          },
          "p1_idea+=0.5",
        )
        // Note: The vertical line here was removed as requested
        .addLabel("p1_connect", "+=0.5")
        .to(
          p1Badge,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "p1_connect+=0.6",
        )
        .to(
          cameraRef.current,
          { scale: 1.4, duration: 3, ease: "power2.inOut" },
          "p1_connect",
        )
        .to(
          p1Caption,
          { opacity: 1, y: -20, duration: 0.8, ease: "power2.out" },
          "p1_connect+=1",
        )
        .addLabel("p1_exit", "+=2")
        .to(
          cameraRef.current,
          { scale: 1.35, duration: 1.2, ease: "power2.inOut" },
          "p1_exit",
        )
        .to(
          [p1Wrapper, p1Caption],
          { opacity: 0, duration: 1, ease: "power2.inOut" },
          "p1_exit",
        )
        .addLabel("p2", "+=0.2")
        .to(p2Wrapper, { opacity: 1, duration: 0.1 }, "p2")
        .to(
          p2AppCard,
          { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
          "p2",
        )
        .to(
          [p2Sara, p2Techs],
          { opacity: 1, duration: 1, ease: "power2.out", stagger: 0.2 },
          "p2+=0.4",
        )
        .addLabel("p2_log", "+=0.5")
        .to(
          p2LineLog,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "p2_log",
        )
        .to(
          p2BadgeLog,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "p2_log+=0.4",
        )
        .to(p2FlyLog, { opacity: 1, scale: 1, duration: 0.2 }, "p2_log+=0.4")
        .to(
          p2FlyLog,
          { x: 820, duration: 1, ease: "power2.inOut" },
          "p2_log+=0.6",
        )
        .to(p2FlyLog, { opacity: 0, scale: 0, duration: 0.3 }, "p2_log+=1.5")
        .addLabel("p2_assign", "+=0.2")
        .to(
          p2LineWork,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "p2_assign",
        )
        .to(
          p2BadgeWork,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "p2_assign+=0.4",
        )
        .to(
          p2FlyWork,
          { opacity: 1, scale: 1, duration: 0.2 },
          "p2_assign+=0.4",
        )
        .to(
          p2FlyWork,
          { x: 1500, duration: 1, ease: "power2.inOut" },
          "p2_assign+=0.6",
        )
        .to(
          p2FlyWork,
          { opacity: 0, scale: 0, duration: 0.3 },
          "p2_assign+=1.5",
        )
        .addLabel("p2_update", "+=0.6")
        .to(
          p2LineUpdate,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "p2_update",
        )
        .to(
          p2BadgeUpdate,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "p2_update+=0.4",
        )
        .to(
          p2FlyUpdate,
          { opacity: 1, scale: 1, duration: 0.2 },
          "p2_update+=0.4",
        )
        .to(
          p2FlyUpdate,
          { x: 1100, duration: 1, ease: "power2.inOut" },
          "p2_update+=0.6",
        )
        .to(
          p2FlyUpdate,
          { opacity: 0, scale: 0, duration: 0.3 },
          "p2_update+=1.5",
        )
        .addLabel("p2_status_change", "+=0")
        .to(
          p2AppStatusInProg,
          { opacity: 0, duration: 0.3 },
          "p2_status_change",
        )
        .to(
          p2AppStatusDone,
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          "p2_status_change+=0.2",
        )
        .to(
          p2AppCard,
          {
            boxShadow: `0 0 50px ${DS.colors.accent.green.glow}`,
            duration: 0.8,
          },
          "p2_status_change+=0.2",
        )
        .addLabel("p2_live", "+=0.5")
        .to(
          p2LineLive,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          "p2_live",
        )
        .to(
          p2BadgeLive,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "p2_live+=0.4",
        )
        .to(p2FlyLive, { opacity: 1, scale: 1, duration: 0.2 }, "p2_live+=0.4")
        .to(
          p2FlyLive,
          { x: 420, duration: 1, ease: "power2.inOut" },
          "p2_live+=0.6",
        )
        .to(p2FlyLive, { opacity: 0, scale: 0, duration: 0.3 }, "p2_live+=1.5")
        .addLabel("p2_hold", "+=0.5")
        .to(
          p2Caption,
          { opacity: 1, y: -20, duration: 0.8, ease: "power2.out" },
          "p2_hold",
        )
        .to(
          cameraRef.current,
          { scale: 1.3, duration: 3, ease: "power2.inOut" },
          "p2_hold",
        )
        .addLabel("p2_exit", "+=1.5")
        .to(
          cameraRef.current,
          { scale: 1.35, duration: 1.2, ease: "power2.inOut" },
          "p2_exit",
        )
        .to(
          [p2Wrapper, p2Caption],
          { opacity: 0, duration: 1, ease: "power2.inOut" },
          "p2_exit",
        )
        .addLabel("p3", "+=0.2")
        .to(p3Wrapper, { opacity: 1, duration: 0.1 }, "p3")
        .to(
          [p3ProblemBox, p3SolutionBox],
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.2,
          },
          "p3",
        )
        .addLabel("p3_paths", "+=0.8")
        .to(
          p3RoadmapPathTop,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 2.2,
            ease: "power2.inOut",
          },
          "p3_paths",
        )
        .to(
          p3RoadmapPathMid,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 2.2,
            ease: "power2.inOut",
          },
          "p3_paths+=0.2",
        )
        .to(
          p3RoadmapPathBot,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 2.2,
            ease: "power2.inOut",
          },
          "p3_paths+=0.4",
        )
        .addLabel("p3_target", "+=1.8")
        .to(
          p3Target,
          { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" },
          "p3_target",
        )
        .to(
          p3TargetBadge,
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
          "p3_target+=0.4",
        )
        .addLabel("p3_cap", "+=0.5")
        .to(
          p3Caption,
          { opacity: 1, y: -20, duration: 1, ease: "power2.out" },
          "p3_cap",
        )
        .to(
          cameraRef.current,
          { scale: 1.3, duration: 4, ease: "power2.inOut" },
          "p3_cap",
        )
        .to({}, { duration: 2 }) // Hold before fade
        .addLabel("exit")
        .to(
          stageRef.current,
          { opacity: 0, duration: 1.5, ease: "power2.inOut" },
          "exit",
        ); // SMOOTH EXIT FADE

      masterTl.current = master;
      idleTl.current = idle;
    }, stageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const time = frame / fps;
    if (masterTl.current) masterTl.current.seek(time);
    if (idleTl.current) idleTl.current.seek(time);
  }, [frame, fps]);

  return (
    <div
      ref={stageRef}
      style={{
        position: "absolute",
        width: 1920,
        height: 1080,
        overflow: "hidden",
        opacity: 0,
      }}
    >
      <div
        ref={cameraRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          transformOrigin: "center center",
        }}
      >
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <marker
              id="arrowCyanR"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill={DS.colors.accent.cyan.base}
              />
            </marker>
            <marker
              id="arrowGreenL"
              markerWidth="8"
              markerHeight="6"
              refX="1"
              refY="3"
              orient="auto-start-reverse"
            >
              <polygon
                points="8 0, 0 3, 8 6"
                fill={DS.colors.accent.green.base}
              />
            </marker>
            <marker
              id="arrowIndigoR"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill={DS.colors.accent.indigo.base}
              />
            </marker>
          </defs>
        </svg>

        {/* Phase 1 */}
        <div
          ref={(el) => (refs.current.p1Wrapper = el)}
          style={{ position: "absolute", inset: 0 }}
        >
          <div
            ref={(el) => (refs.current.p1Badge = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <Badge colorObj={DS.colors.accent.cyan}>Need A Better System</Badge>
          </div>
          <div
            ref={(el) => (refs.current.p1Sara = el)}
            style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
          >
            <div
              ref={(el) => (refs.current.p1SaraFloat = el)}
              style={{ willChange: "transform" }}
            >
              <FlowNode
                title="Sara"
                icon={<PersonIcon />}
                glowColor={DS.colors.accent.cyan}
              />
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p1Cloud = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 320,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                color: DS.colors.panel,
              }}
            >
              <CloudIcon />
            </div>
            <div
              ref={(el) => (refs.current.p1Chaos = el)}
              style={{
                position: "absolute",
                width: 140,
                height: 80,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 20,
                    height: 20,
                    background:
                      i % 4 === 0 ? DS.colors.accent.rose.base : "#FEF3C7",
                    borderRadius: 4,
                    border: `1px solid ${DS.colors.borderBright}`,
                  }}
                />
              ))}
            </div>
            <div
              ref={(el) => (refs.current.p1AppIcon = el)}
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                background: DS.colors.cardElevated,
                borderRadius: 20,
                border: `2px solid ${DS.colors.accent.green.base}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: DS.colors.accent.green.base,
                boxShadow: `0 0 30px ${DS.colors.accent.green.glow}`,
              }}
            >
              <div style={{ width: 40, height: 40 }}>
                <LaptopIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2 */}
        <div
          ref={(el) => (refs.current.p2Wrapper = el)}
          style={{ position: "absolute", inset: 0 }}
        >
          <div
            ref={(el) => (refs.current.p2BadgeLog = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <Badge colorObj={DS.colors.accent.cyan}>Log Repair</Badge>
          </div>
          <div
            ref={(el) => (refs.current.p2BadgeLive = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <Badge colorObj={DS.colors.accent.green}>Live Visibility</Badge>
          </div>
          <div
            ref={(el) => (refs.current.p2BadgeWork = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <Badge colorObj={DS.colors.accent.indigo}>Assigned Work</Badge>
          </div>
          <div
            ref={(el) => (refs.current.p2BadgeUpdate = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <Badge colorObj={DS.colors.accent.green}>Real-Time Updates</Badge>
          </div>

          <div
            ref={(el) => (refs.current.p2AppCard = el)}
            style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
          >
            <div
              ref={(el) => (refs.current.p2AppFloat = el)}
              style={{
                willChange: "transform",
                width: 280,
                height: 420,
                background: DS.colors.panel,
                borderRadius: 32,
                border: `2px solid ${DS.colors.accent.cyan.base}`,
                display: "flex",
                flexDirection: "column",
                padding: 24,
                gap: 24,
                boxShadow: `0 0 50px ${DS.colors.accent.cyan.glow}`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  ...DS.font.label,
                  color: DS.colors.accent.cyan.base,
                  letterSpacing: "0.1em",
                }}
              >
                REPAIR APP
              </div>
              <div
                style={{
                  flex: 1,
                  background: DS.colors.bg,
                  borderRadius: 16,
                  border: `1px solid ${DS.colors.border}`,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: "90%",
                    height: 16,
                    background: DS.colors.borderBright,
                    borderRadius: 8,
                  }}
                />
                <div
                  style={{
                    width: "60%",
                    height: 16,
                    background: DS.colors.borderBright,
                    borderRadius: 8,
                  }}
                />
                <div style={{ marginTop: "auto" }}>
                  <div style={{ position: "relative", height: 40 }}>
                    <div
                      ref={(el) => (refs.current.p2AppStatusInProg = el)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: DS.colors.accent.amber.base,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          color: DS.colors.textSecondary,
                        }}
                      >
                        In Progress
                      </div>
                    </div>
                    <div
                      ref={(el) => (refs.current.p2AppStatusDone = el)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: DS.colors.accent.green.base,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: DS.colors.bg,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p2Sara = el)}
            style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
          >
            <div
              ref={(el) => (refs.current.p2SaraFloat = el)}
              style={{ willChange: "transform" }}
            >
              <FlowNode
                title="Sara"
                icon={<PersonIcon />}
                glowColor={DS.colors.accent.cyan}
                style={{ minWidth: 160 }}
              />
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p2Techs = el)}
            style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
          >
            <div
              ref={(el) => (refs.current.p2TechsFloat = el)}
              style={{ willChange: "transform" }}
            >
              <FlowNode
                title="Technicians"
                icon={<PersonIcon />}
                glowColor={DS.colors.accent.indigo}
                style={{ minWidth: 160 }}
              />
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p2FlyLog = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              background: DS.colors.card,
              borderRadius: 10,
              border: `2px solid ${DS.colors.accent.cyan.base}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.colors.accent.cyan.base,
              zIndex: 20,
              boxShadow: `0 0 20px ${DS.colors.accent.cyan.glow}`,
            }}
          >
            <div style={{ width: 22, height: 22 }}>
              <LaptopIcon />
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p2FlyWork = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              background: DS.colors.card,
              borderRadius: 10,
              border: `2px solid ${DS.colors.accent.indigo.base}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.colors.accent.indigo.base,
              zIndex: 20,
              boxShadow: `0 0 20px ${DS.colors.accent.indigo.glow}`,
            }}
          >
            <div style={{ width: 22, height: 22 }}>
              <LaptopIcon />
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p2FlyUpdate = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 36,
              height: 36,
              background: DS.colors.accent.green.base,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.colors.bg,
              zIndex: 20,
              boxShadow: `0 0 20px ${DS.colors.accent.green.glow}`,
            }}
          >
            <div style={{ width: 18, height: 18 }}>
              <CheckIcon />
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p2FlyLive = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 36,
              height: 36,
              background: DS.colors.accent.green.base,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: DS.colors.bg,
              zIndex: 20,
              boxShadow: `0 0 20px ${DS.colors.accent.green.glow}`,
            }}
          >
            <div style={{ width: 18, height: 18 }}>
              <CheckIcon />
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div
          ref={(el) => (refs.current.p3Wrapper = el)}
          style={{ position: "absolute", inset: 0 }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: 1920,
              height: 1080,
              pointerEvents: "none",
            }}
          >
            <path
              ref={(el) => (refs.current.p3RoadmapPathTop = el)}
              d="M 500 450 Q 960 150 1420 450"
              stroke={DS.colors.accent.indigo.base}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              opacity="0"
            />
            <path
              ref={(el) => (refs.current.p3RoadmapPathMid = el)}
              d="M 500 450 L 1420 450"
              stroke={DS.colors.accent.green.base}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              opacity="0"
            />
            <path
              ref={(el) => (refs.current.p3RoadmapPathBot = el)}
              d="M 500 450 Q 960 750 1420 450"
              stroke={DS.colors.accent.amber.base}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              opacity="0"
            />
          </svg>
          <div
            ref={(el) => (refs.current.p3ProblemBox = el)}
            style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
          >
            <div
              ref={(el) => (refs.current.p3ProblemFloat = el)}
              style={{
                willChange: "transform",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  background: DS.colors.cardElevated,
                  borderRadius: 32,
                  border: `2px solid ${DS.colors.borderBright}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fill: DS.colors.textSecondary,
                }}
              >
                <div style={{ width: 80, height: 80, opacity: 0.7 }}>
                  <ShopIcon />
                </div>
              </div>
              <Badge
                colorObj={{
                  base: DS.colors.textSecondary,
                  glow: "transparent",
                }}
                style={{
                  letterSpacing: "0.1em",
                  border: `1px solid ${DS.colors.textTertiary}`,
                }}
              >
                CURRENT PROBLEM
              </Badge>
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p3SolutionBox = el)}
            style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
          >
            <div
              ref={(el) => (refs.current.p3SolutionFloat = el)}
              style={{
                willChange: "transform",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  background: DS.colors.cardElevated,
                  borderRadius: 32,
                  border: `2px solid ${DS.colors.accent.cyan.base}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: DS.colors.accent.cyan.base,
                  boxShadow: `0 0 60px ${DS.colors.accent.cyan.glow}`,
                }}
              >
                <div style={{ width: 72, height: 72 }}>
                  <LaptopIcon />
                </div>
              </div>
              <Badge
                colorObj={DS.colors.accent.cyan}
                style={{ letterSpacing: "0.1em" }}
              >
                IDEAL SOLUTION
              </Badge>
            </div>
          </div>
          <div
            ref={(el) => (refs.current.p3Target = el)}
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: 64,
              height: 64,
              color: DS.colors.textPrimary,
            }}
          >
            <TargetIcon />
          </div>
          <div
            ref={(el) => (refs.current.p3TargetBadge = el)}
            style={{ position: "absolute", transform: "translate(-50%, -50%)" }}
          >
            <Badge
              colorObj={DS.colors.accent.green}
              style={{ background: DS.colors.panel }}
            >
              BEST FIT
            </Badge>
          </div>
        </div>
      </div>

      <div
        ref={(el) => (refs.current.p1Caption = el)}
        style={{
          position: "absolute",
          bottom: 80,
          width: "100%",
          textAlign: "center",
          ...DS.font.h1,
          fontSize: 64,
          color: DS.colors.textPrimary,
        }}
      >
        Time for change.
      </div>
      <div
        ref={(el) => (refs.current.p2Caption = el)}
        style={{
          position: "absolute",
          bottom: 80,
          width: "100%",
          textAlign: "center",
          ...DS.font.h1,
          fontSize: 64,
          color: DS.colors.accent.cyan.bright,
        }}
      >
        One source of truth.
      </div>
      <div
        ref={(el) => (refs.current.p3Caption = el)}
        style={{
          position: "absolute",
          bottom: 80,
          width: "100%",
          textAlign: "center",
          ...DS.font.display,
          fontSize: 64,
          color: DS.colors.textPrimary,
        }}
      >
        Lets choose the right path.
      </div>
    </div>
  );
};

// ── 5. MAIN ORCHESTRATOR ────────────────────────────────────
const MainScene = () => {
  const { width } = useVideoConfig();
  const scale = width / 1920;

  // Accurately matched with GSAP timelines to guarantee completion
  const dur = {
    welcome: 780, // 13s
    scene1: 900, // 15s
    scene2: 1800, // 20s
    scene3: 1800, // 30s (Extended to prevent cuts)
    scene4: 720, // 12s
    scene5: 720, // 12s
    scene6: 3000, // 35s (Extended to prevent cuts)
  };

  const start1 = dur.welcome;
  const start2 = start1 + dur.scene1;
  const start3 = start2 + dur.scene2;
  const start4 = start3 + dur.scene3;
  const start5 = start4 + dur.scene4;
  const start6 = start5 + dur.scene5;

  return (
    <AbsoluteFill style={{ backgroundColor: DS.colors.bg, overflow: "hidden" }}>
      <GlobalStyles />
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
        }}
      >
        <Sequence from={0} durationInFrames={dur.welcome}>
          <WelcomeScreen />
        </Sequence>
        <Sequence from={start1} durationInFrames={dur.scene1}>
          <Scene1_EveryProjectStartsWithAProblem />
        </Sequence>
        <Sequence from={start2} durationInFrames={dur.scene2}>
          <Scene2_MeetSaraAndHerRepairShop />
        </Sequence>
        <Sequence from={start3} durationInFrames={dur.scene3}>
          <Scene3_TheWorkflowWorksSmoothly />
        </Sequence>
        <Sequence from={start4} durationInFrames={dur.scene4}>
          <Scene4_SuccessCreatesPressure />
        </Sequence>
        <Sequence from={start5} durationInFrames={dur.scene5}>
          <Scene5_TheStickyNoteSystemBreaksDown />
        </Sequence>
        <Sequence from={start6} durationInFrames={dur.scene6}>
          <Scene6_TheTransformationAndConclusion />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

export default MainScene;
