import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  registerRoot,
  Composition,
  useVideoConfig,
  useCurrentFrame,
  staticFile,
  Sequence,
} from "remotion";

// ── 1. DESIGN TOKENS ────────────────────────────────────────
const DS = {
  colors: {
    bg: "#0B0F19",
    panel: "#0F172A",
    card: "#1E293B",
    border: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    cyan: "#38BDF8",
    purple: "#A78BFA",
    green: "#34D399",
    amber: "#FBBF24",
    rose: "#FB7185",
    indigo: "#818CF8",
  },
  easing: {
    enter: "power4.out",
    exit: "power4.in",
    smooth: "power2.inOut",
    cinematic: "expo.inOut",
    spring: "elastic.out(1, 0.6)",
    float: "sine.inOut",
    back: "back.out(1.7)",
  },
};

const CENTER = { x: 960, y: 540 };
const RADIUS = 280;

const getPos = (angleDeg) => ({
  x: CENTER.x + RADIUS * Math.cos((angleDeg * Math.PI) / 180),
  y: CENTER.y + RADIUS * Math.sin((angleDeg * Math.PI) / 180),
});

const SATELLITES = [
  {
    id: "portal",
    label: "Mendix Portal",
    url: "sprintr.home.mendix.com",
    angle: 180,
    color: DS.colors.cyan,
    caption: "Mendix Portal • Online Project Management & App Creation",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <rect
          x="15"
          y="20"
          width="70"
          height="60"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <line
          x1="15"
          y1="40"
          x2="85"
          y2="40"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    ),
  },
  {
    id: "studio",
    label: "Studio Pro",
    url: "mendix.com/studio-pro",
    angle: 220,
    color: DS.colors.cyan,
    caption: "Studio Pro • Powerful Desktop IDE for Building Apps",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <rect
          x="10"
          y="20"
          width="80"
          height="60"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <path
          d="M35,40 L20,50 L35,60 M65,40 L80,50 L65,60"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "marketplace",
    label: "Marketplace",
    url: "marketplace.mendix.com",
    angle: 260,
    color: DS.colors.amber,
    caption: "Marketplace • Download Studio Pro & ready-to-use modules",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <path
          d="M20,40 L80,40 L70,20 L30,20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <rect
          x="20"
          y="40"
          width="60"
          height="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <line
          x1="40"
          y1="40"
          x2="40"
          y2="80"
          stroke="currentColor"
          strokeWidth="6"
        />
        <line
          x1="60"
          y1="40"
          x2="60"
          y2="80"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    ),
  },
  {
    id: "atlas",
    label: "Atlas UI",
    url: "mendix.com/atlas",
    angle: 300,
    color: DS.colors.rose,
    caption: "Atlas UI • Style apps using pre-built design building blocks",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <path
          d="M70,25 C70,25 60,10 40,20 C20,30 30,50 30,50 L15,85 L35,90 L45,55 C45,55 70,60 80,45 C90,30 70,25 70,25 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <line
          x1="38"
          y1="65"
          x2="25"
          y2="75"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "catalog",
    label: "Catalog",
    url: "catalog.mendix.com",
    angle: 340,
    color: DS.colors.green,
    caption: "Catalog • Reuse and connect enterprise data across apps",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <ellipse
          cx="50"
          cy="30"
          rx="30"
          ry="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <path
          d="M20,30 L20,70 A30,12 0 0,0 80,70 L80,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <path
          d="M20,50 A30,12 0 0,0 80,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    ),
  },
  {
    id: "support",
    label: "Support",
    url: "support.mendix.com",
    angle: 20,
    color: DS.colors.rose,
    caption: "Support • Dedicated technical help when you need reliability",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <line
          x1="29"
          y1="29"
          x2="41"
          y2="41"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="71"
          y1="29"
          x2="59"
          y2="41"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="29"
          y1="71"
          x2="41"
          y2="59"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="71"
          y1="71"
          x2="59"
          y2="59"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "community",
    label: "Community",
    url: "community.mendix.com",
    angle: 60,
    color: DS.colors.indigo,
    caption: "Community • Ask questions, share knowledge & submit ideas",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <rect
          x="20"
          y="25"
          width="45"
          height="35"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <rect
          x="35"
          y="40"
          width="45"
          height="35"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    ),
  },
  {
    id: "docs",
    label: "Documentation",
    url: "docs.mendix.com",
    angle: 100,
    color: DS.colors.purple,
    caption: "Documentation • Detailed guides to master every platform feature",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <path
          d="M50,80 L20,90 L20,20 L50,10 L80,20 L80,90 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <line
          x1="50"
          y1="10"
          x2="50"
          y2="80"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    ),
  },
  {
    id: "academy",
    label: "Academy",
    url: "academy.mendix.com",
    angle: 140,
    color: DS.colors.amber,
    caption: "Academy • Follow structured learning paths and skill courses",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <polygon
          points="50,30 85,45 50,60 15,45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M25,50 L25,75 C25,75 50,90 75,75 L75,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <line
          x1="85"
          y1="45"
          x2="85"
          y2="70"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    ),
  },
].map((sat) => ({ ...sat, ...getPos(sat.angle) }));

// ── 2. COMPONENTS ───────────────────────────────────────────

const ConnectorLine = React.forwardRef(({ x1, y1, x2, y2, color }, ref) => {
  const frame = useCurrentFrame();
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  return (
    <div
      style={{
        position: "absolute",
        top: y1,
        left: x1,
        width: len,
        height: 3,
        transformOrigin: "0 50%",
        transform: `rotate(${ang}deg) translateY(-50%)`,
        zIndex: 10,
      }}
    >
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          background: `repeating-linear-gradient(90deg, ${color}, ${color} 6px, transparent 6px, transparent 12px)`,
          backgroundSize: "200% 100%",
          // Slowed down 4x for a much smoother drift
          backgroundPositionX: -(frame * 0.5),
          transformOrigin: "0 50%",
          transform: "scaleX(0)",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
});

const NodeCard = React.forwardRef(
  (
    {
      label,
      url,
      x,
      y,
      icon,
      color = DS.colors.cyan,
      isCenter = false,
      innerRef,
    },
    ref,
  ) => (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%) scale(0)",
        opacity: 0,
        zIndex: isCenter ? 30 : 20,
        willChange: "transform, opacity",
      }}
    >
      <div
        ref={innerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          willChange: "transform, box-shadow",
        }}
      >
        <div
          style={{
            width: isCenter ? 96 : 72,
            height: isCenter ? 96 : 72,
            borderRadius: isCenter ? 24 : 18,
            background: DS.colors.card,
            border: `2px solid ${color}`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 20px ${color}35`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: color,
            padding: isCenter ? 16 : 14,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              background: `${color}18`,
              border: `1px solid ${color}`,
              padding: "4px 14px",
              borderRadius: 9999,
              color: color,
              fontSize: isCenter ? 14 : 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
            }}
          >
            {label}
          </div>
          {url && (
            <div
              style={{
                fontSize: 11,
                color: DS.colors.textSecondary,
                fontFamily: "'JetBrains Mono', monospace",
                opacity: 0.9,
                letterSpacing: "0.02em",
                background: "rgba(11, 15, 25, 0.7)",
                padding: "2px 8px",
                borderRadius: 6,
                border: `1px solid ${DS.colors.border}`,
              }}
            >
              {url}
            </div>
          )}
        </div>
      </div>
    </div>
  ),
);

// ── 3. SCENE: ECOSYSTEM ─────────────────────────────────────
const EcosystemScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tlRef = useRef(null);

  const headerRef = useRef(null);
  const captionRef = useRef(null);
  const captionTextRef = useRef(null);
  const ringRef = useRef(null);

  const nodes = {
    hub: useRef(null),
    hubInner: useRef(null),
    satsOuter: useRef([]),
    satsInner: useRef([]),
  };

  const lines = useRef([]);
  const dots = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });

    gsap.set(headerRef.current, { opacity: 0, y: -20 });
    gsap.set(captionRef.current, { opacity: 0, y: 20 });
    gsap.set(ringRef.current, { scale: 0, opacity: 0 });
    gsap.set(dots.current, { opacity: 0, scale: 0 });

    const animateCaption = (text, timeLabel) => {
      tl.to(
        captionRef.current,
        { opacity: 0, y: 15, duration: 0.3, ease: DS.easing.exit },
        timeLabel,
      )
        .set(captionTextRef.current, { innerText: text }, `${timeLabel}+=0.3`)
        .to(
          captionRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: DS.easing.back },
          `${timeLabel}+=0.3`,
        );
    };

    // Slower Initial Hub Entrance
    tl.addLabel("hub", 0.5)
      .to(
        nodes.hub.current,
        { opacity: 1, scale: 1, duration: 1.8, ease: DS.easing.spring },
        "hub",
      )
      .to(
        headerRef.current,
        { opacity: 1, y: 0, duration: 1.5, ease: DS.easing.enter },
        "hub+=0.5",
      );

    animateCaption("Exploring the wider Mendix ecosystem.", "hub+=0.5");

    let currentPlayhead = 2.5;

    // Slower Satellite Pop-ins
    SATELLITES.forEach((sat, idx) => {
      // Allow 1.5 seconds between each node instead of 2.5 for a steady, relaxed rhythm
      currentPlayhead += idx === 0 ? 1.0 : 1.5;
      tl.addLabel(`sat_${idx}`, currentPlayhead);

      animateCaption(sat.caption, `sat_${idx}`);

      tl.to(
        nodes.satsOuter.current[idx],
        { opacity: 1, scale: 1, duration: 1.2, ease: DS.easing.back },
        `sat_${idx}`,
      ).to(
        lines.current[idx],
        { scaleX: 1, opacity: 0.7, duration: 1.5, ease: DS.easing.smooth },
        `sat_${idx}`,
      );
    });

    const finaleTime = currentPlayhead + 4.0;
    const finaleTargets = SATELLITES.map((s) => ({ x: s.x, y: s.y }));

    tl.addLabel("finale", finaleTime);
    animateCaption(
      "All of these together form the Mendix Ecosystem.",
      "finale",
    );

    // Slower Grand Finale Effects
    tl.to(
      ringRef.current,
      { opacity: 1, scale: 4.5, duration: 1.5, ease: "power2.out" },
      "finale",
    )
      .to(ringRef.current, { opacity: 0, duration: 0.6 }, "finale+=0.8")
      .to(dots.current, { opacity: 1, scale: 1, duration: 0.1 }, "finale")
      .to(
        dots.current,
        {
          x: (i) => finaleTargets[i].x,
          y: (i) => finaleTargets[i].y,
          duration: 1.5,
          ease: "expo.out",
        },
        "finale",
      )
      .to(dots.current, { opacity: 0, scale: 0, duration: 0.5 }, "finale+=1.2");

    const collapseTime = finaleTime + 4.5;
    tl.addLabel("collapse", collapseTime)
      .to(
        headerRef.current,
        { opacity: 0, y: -30, duration: 1.2, ease: DS.easing.exit },
        "collapse",
      )
      .to(
        captionRef.current,
        { opacity: 0, y: 30, duration: 1.2, ease: DS.easing.exit },
        "collapse",
      )
      .to(
        lines.current,
        {
          scaleX: 0,
          opacity: 0,
          duration: 1.0,
          ease: DS.easing.exit,
          stagger: 0.08,
        },
        "collapse",
      )
      .to(
        nodes.satsOuter.current,
        {
          x: CENTER.x,
          y: CENTER.y,
          scale: 0,
          opacity: 0,
          duration: 1.5,
          ease: "back.in(1.2)",
          stagger: 0.08,
        },
        "collapse+=0.3",
      )
      .to(
        nodes.hub.current,
        { scale: 1.9, duration: 2.0, ease: DS.easing.smooth },
        "collapse+=1.0",
      )
      .to(
        nodes.hubInner.current,
        {
          boxShadow: `0 0 100px ${DS.colors.cyan}, 0 0 30px #FFF`,
          borderColor: "#FFF",
          duration: 1.8,
          ease: "sine.inOut",
        },
        "collapse+=1.2",
      )
      .addLabel("end", "+=2.0");

    tlRef.current = tl;
    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.time(frame / fps);
    }
  }, [frame, fps]);

  return (
    <div style={{ position: "absolute", width: 1920, height: 1080 }}>
      <div
        ref={headerRef}
        style={{
          position: "absolute",
          top: 40,
          width: "100%",
          textAlign: "center",
          zIndex: 40,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 800,
            color: DS.colors.textPrimary,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          The Mendix Ecosystem
        </h2>
        <div
          style={{
            width: 100,
            height: 4,
            background: DS.colors.cyan,
            margin: "12px auto 0",
            borderRadius: 2,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          transformOrigin: "960px 540px",
        }}
      >
        {SATELLITES.map((sat, i) => (
          <ConnectorLine
            key={`line-${sat.id}`}
            ref={(el) => (lines.current[i] = el)}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={sat.x}
            y2={sat.y}
            color={sat.color}
          />
        ))}

        {SATELLITES.map((_, i) => (
          <div
            key={`dot-${i}`}
            ref={(el) => (dots.current[i] = el)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: DS.colors.cyan,
              boxShadow: `0 0 20px ${DS.colors.cyan}, 0 0 8px #FFF`,
              transform: `translate(-50%, -50%) translate(${CENTER.x}px, ${CENTER.y}px)`,
              zIndex: 15,
            }}
          />
        ))}

        <div
          ref={ringRef}
          style={{
            position: "absolute",
            top: CENTER.y - 50,
            left: CENTER.x - 50,
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: `3px solid ${DS.colors.cyan}`,
            zIndex: 12,
          }}
        />

        <NodeCard
          ref={nodes.hub}
          innerRef={nodes.hubInner}
          label="Mendix Platform"
          x={CENTER.x}
          y={CENTER.y}
          color={DS.colors.cyan}
          isCenter={true}
          icon={
            <img
              src={staticFile("mendix.png")}
              alt="Mendix"
              style={{ width: "85%", height: "85%", objectFit: "contain" }}
            />
          }
        />

        {SATELLITES.map((sat, i) => (
          <NodeCard
            key={sat.id}
            ref={(el) => (nodes.satsOuter.current[i] = el)}
            innerRef={(el) => (nodes.satsInner.current[i] = el)}
            label={sat.label}
            url={sat.url}
            x={sat.x}
            y={sat.y}
            color={sat.color}
            icon={sat.icon}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 40,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 50,
        }}
      >
        <div
          ref={captionRef}
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${DS.colors.border}`,
            borderLeft: `4px solid ${DS.colors.cyan}`,
            padding: "16px 44px",
            borderRadius: 12,
          }}
        >
          <span
            ref={captionTextRef}
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: DS.colors.textPrimary,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── 4. VIEWPORT SCALER ──────────────────────────────────────
const Stage = ({ children }) => {
  const { width = 3840, height = 2160 } = useVideoConfig() || {};
  const scale = Math.min(width / 1920, height / 1080);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        background: DS.colors.bg,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400&display=swap'); * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }`}</style>
      <div
        style={{
          width: 1920,
          height: 1080,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const MainScene = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Stage>
      <Sequence from={0} durationInFrames={durationInFrames}>
        <EcosystemScene />
      </Sequence>
    </Stage>
  );
};

export default MainScene;
