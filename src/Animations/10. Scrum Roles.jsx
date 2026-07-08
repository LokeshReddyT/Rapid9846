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

// ── 2. VISUAL CONSTANTS ──────────────────────────────────────────────────────
const COLORS = {
  bg: "#080C14",
  surface: "#111827",
  border: "#1F2D45",
  textPrimary: "#F2F6FF",
  textSecondary: "#94A3B8",
  accentBlue: "#3B82F6",
  accentGreen: "#10B981",
  accentRed: "#EF4444",
  accentPurple: "#8B5CF6",
  accentYellow: "#F59E0B",
};

const FONTS = {
  heading: "120px",
  subHeading: "80px",
  body: "48px",
  caption: "36px",
  small: "32px",
};

// ── 3. SHARED COMPONENTS ────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; }
  `}</style>
);

const Text = ({
  children,
  size = FONTS.body,
  weight = 400,
  color = COLORS.textPrimary,
  style = {},
}) => (
  <span
    style={{
      fontFamily: "Inter, sans-serif",
      fontSize: size,
      fontWeight: weight,
      color,
      ...style,
    }}
  >
    {children}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: COLORS.surface,
      border: `3px solid ${COLORS.border}`,
      borderRadius: 40,
      padding: 64,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 16px 80px rgba(0,0,0,0.6)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ text, color = COLORS.accentBlue, style = {} }) => (
  <div
    style={{
      background: `${color}20`,
      border: `2px solid ${color}`,
      borderRadius: 9999,
      padding: "16px 40px",
      boxShadow: `0 0 40px ${color}40`,
      textAlign: "center",
      ...style,
    }}
  >
    <Text size={FONTS.caption} weight={700} color={color}>
      {text}
    </Text>
  </div>
);

const IconListItem = ({ icon, text, color, delay, frame, fps }) => {
  const itemProg = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 60 },
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity: itemProg,
        transform: `translateX(${interpolate(itemProg, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, { size: 40, color })}
      </div>
      <Text size={FONTS.caption} weight={600} color={COLORS.textPrimary}>
        {text}
      </Text>
    </div>
  );
};

const SvgIcon = ({ path, color, size = 200, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ filter: `drop-shadow(0 0 20px ${color}60)`, ...style }}
  >
    {path}
  </svg>
);

const ArrowMarkers = () => (
  <defs>
    <marker
      id="arrow-blue"
      markerWidth="8"
      markerHeight="8"
      refX="7"
      refY="4"
      orient="auto"
    >
      <path d="M0,0 L8,4 L0,8" fill={COLORS.accentBlue} />
    </marker>
    <marker
      id="arrow-purple"
      markerWidth="8"
      markerHeight="8"
      refX="7"
      refY="4"
      orient="auto"
    >
      <path d="M0,0 L8,4 L0,8" fill={COLORS.accentPurple} />
    </marker>
    <marker
      id="arrow-green"
      markerWidth="8"
      markerHeight="8"
      refX="7"
      refY="4"
      orient="auto"
    >
      <path d="M0,0 L8,4 L0,8" fill={COLORS.accentGreen} />
    </marker>
    <marker
      id="arrow-yellow"
      markerWidth="8"
      markerHeight="8"
      refX="7"
      refY="4"
      orient="auto"
    >
      <path d="M0,0 L8,4 L0,8" fill={COLORS.accentYellow} />
    </marker>
  </defs>
);

// Icon Paths
const ICON_PERSON = (
  <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);
const ICON_USERS = (
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);
const ICON_GEAR = (
  <>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="4" />
  </>
);
const ICON_CODE = (
  <>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </>
);
const ICON_BUG = (
  <>
    <path d="M14 20v-4M10 20v-4M12 16v-6M8 10h8M6 14h12M12 4a4 4 0 0 0-4 4v2h8V8a4 4 0 0 0-4-4z" />
  </>
);
const ICON_PALETTE = (
  <>
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </>
);
const ICON_COMPASS = (
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </>
);
const ICON_SHIELD = (
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </>
);
const ICON_PUZZLE = (
  <>
    <path d="M19.439 7.85c-.049.322-.059.648-.029.975.112 1.234 1.149 2.15 2.385 2.15.545 0 1.058-.22 1.436-.606A1.996 1.996 0 0 0 24 8.95c0-1.077-.852-1.956-1.92-2-1.08-.045-2.033.72-2.22 1.777-.03.17-.044.342-.04.516M19.439 7.85A2.001 2.001 0 0 0 16 7.848v-.895c0-1.104-.896-2-2-2h-.895a2.001 2.001 0 0 0-.001-3.438M19.439 7.85A1.999 1.999 0 0 1 21.05 11c-.544 0-1.058-.22-1.436-.605a1.994 1.994 0 0 1-.58-1.282c-.03-.327-.02-.653.028-.975M4.561 7.85c.049.322.059.648.029.975-.112 1.234-1.149 2.15-2.385 2.15C1.66 10.975 1.147 10.755.77 10.37A1.996 1.996 0 0 1 0 8.95c0-1.077.852-1.956 1.92-2 1.08-.045 2.033.72 2.22 1.777.03.17.044.342.04.516M4.561 7.85A2.001 2.001 0 0 1 8 7.848v-.895c0-1.104.896-2 2-2h.895a2.001 2.001 0 0 1 .001-3.438M4.561 7.85A1.999 1.999 0 0 0 2.95 11c.544 0 1.058-.22 1.436-.605.289-.289.493-.659.58-1.282.03-.327.02-.653-.028-.975M4.56 16.15c.05-.322.06-.648.03-.975-.112-1.234-1.15-2.15-2.386-2.15-.545 0-1.058.22-1.436.606A1.996 1.996 0 0 0 0 15.05c0 1.077.852 1.956 1.92 2 1.08.045 2.033-.72 2.22-1.777.03-.17.044-.342.04-.516M4.56 16.15a2.001 2.001 0 0 0 3.44.002v.895c0 1.104.896 2 2 2h.895a2.001 2.001 0 0 0 .001 3.438M4.56 16.15A1.999 1.999 0 0 1 2.95 13c.544 0 1.058.22 1.436.605.289.289.493.659.58 1.282.03.327.02.653-.028.975M19.44 16.15c-.05-.322-.06-.648-.03-.975.112-1.234 1.15-2.15 2.386-2.15.545 0 1.058.22 1.436.606A1.996 1.996 0 0 1 24 15.05c0 1.077-.852 1.956-1.92 2-1.08.045-2.033-.72-2.22-1.777-.03-.17-.044-.342-.04-.516M19.44 16.15a2.001 2.001 0 0 1-3.44.002v.895c0 1.104-.896 2-2 2h-.895a2.001 2.001 0 0 1-.001 3.438M19.44 16.15a1.999 1.999 0 0 0 1.61-3.15c-.544 0-1.058.22-1.436.605-.289.289-.493.659-.58 1.282-.03.327-.02.653.028.975" />
  </>
);
const ICON_LIGHTBULB = (
  <>
    <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5h6.18z" />
  </>
);
const ICON_ROCK = (
  <>
    <path d="M12 2l8 16H4L12 2zM12 14v2M12 8v4" />
  </>
);
const ICON_MONEY = (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 10h8M8 14h8" />
  </>
);
const ICON_TARGET = (
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </>
);
const ICON_CHAT = (
  <>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </>
);
const ICON_LIST = (
  <>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </>
);
const ICON_WRENCH = (
  <>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </>
);
const ICON_COACH = (
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);
const ICON_BRAIN = (
  <>
    <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.5A2.5 2.5 0 0 0 4.5 7.5v1.5a2.5 2.5 0 0 0 2 2.45v2.1a2.5 2.5 0 0 0-2 2.45v1.5A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-1.5a2.5 2.5 0 0 0-2-2.45v-2.1a2.5 2.5 0 0 0 2-2.45V7.5A2.5 2.5 0 0 0 17 5v-.5A2.5 2.5 0 0 0 14.5 2h-5Z" />
  </>
);
const ICON_IDEA = (
  <>
    <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5h6.18z" />
  </>
);
const ICON_MAP = (
  <>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </>
);
const ICON_HEART = (
  <>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </>
);

// ── 4. SCENE COMPONENTS ─────────────────────────────────────────────────────

const Scene1_DirectionSetters = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spaced out sequence orders to sync smoothly
  const IN_BO = 40;
  const IN_BO_LIST = 120;
  const IN_PO = 220;
  const IN_ST_CARD = 320;
  const IN_ST_LINE = 400;
  const IN_PO_LIST = 500;
  const IN_ST_LIST = 680; // Strictly AFTER the PO list finishes animating

  const sp = (delay) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, stiffness: 60 },
    });
  const fadeOut = interpolate(frame, [1740, 1800], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineProg = interpolate(frame, [IN_ST_LINE, IN_ST_LINE + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pathLen = 1000;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ArrowMarkers />

      {/* SVG Background Layer */}
      <svg
        style={{
          position: "absolute",
          top: 400,
          left: 50,
          width: "100%",
          height: "100%",
        }}
      >
        <path
          d="M 2850 550 L 2160 550"
          stroke={COLORS.accentPurple}
          strokeWidth={8}
          fill="none"
          strokeDasharray={pathLen}
          strokeDashoffset={pathLen - lineProg * pathLen}
          opacity={lineProg > 0 ? 1 : 0}
          markerEnd="url(#arrow-purple)"
        />
      </svg>

      {/* Business Owner (Left) */}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 750,
          opacity: sp(IN_BO),
          transform: `scale(${sp(IN_BO)})`,
        }}
      >
        <Card style={{ width: 580, height: 400 }}>
          <SvgIcon path={ICON_PERSON} color={COLORS.accentBlue} />
          <Text weight={700} style={{ marginTop: 40, textAlign: "center" }}>
            Business Owner
          </Text>
        </Card>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: 40,
            marginLeft: 50,
          }}
        >
          <IconListItem
            icon={<SvgIcon path={ICON_TARGET} />}
            text="Set Goals"
            color={COLORS.accentBlue}
            delay={IN_BO_LIST}
            frame={frame}
            fps={fps}
          />
          <IconListItem
            icon={<SvgIcon path={ICON_MONEY} />}
            text="Provides Funding"
            color={COLORS.accentBlue}
            delay={IN_BO_LIST + 40}
            frame={frame}
            fps={fps}
          />
        </div>
      </div>

      {/* Product Owner (Center) */}
      <div
        style={{
          position: "absolute",
          left: 1680,
          top: 750,
          opacity: sp(IN_PO),
          transform: `scale(${sp(IN_PO)})`,
        }}
      >
        <Card
          style={{ width: 580, height: 400, borderColor: COLORS.accentPurple }}
        >
          <SvgIcon path={ICON_COMPASS} color={COLORS.accentPurple} />
          <Text weight={700} style={{ marginTop: 40, textAlign: "center" }}>
            Product Owner
          </Text>
        </Card>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: 40,
            marginLeft: 50,
          }}
        >
          <IconListItem
            icon={<SvgIcon path={ICON_CHAT} />}
            text="Understand Requirements"
            color={COLORS.accentPurple}
            delay={IN_PO_LIST}
            frame={frame}
            fps={fps}
          />
          <IconListItem
            icon={<SvgIcon path={ICON_IDEA} />}
            text="Collect Ideas"
            color={COLORS.accentPurple}
            delay={IN_PO_LIST + 40}
            frame={frame}
            fps={fps}
          />
          <IconListItem
            icon={<SvgIcon path={ICON_LIST} />}
            text="Decide Priorities"
            color={COLORS.accentPurple}
            delay={IN_PO_LIST + 80}
            frame={frame}
            fps={fps}
          />
          <IconListItem
            icon={<SvgIcon path={ICON_MAP} />}
            text="Direction of the Product"
            color={COLORS.accentPurple}
            delay={IN_PO_LIST + 120}
            frame={frame}
            fps={fps}
          />
        </div>
      </div>

      {/* Stakeholders (Right) */}
      <div
        style={{
          position: "absolute",
          left: 2900,
          top: 750,
          opacity: sp(IN_ST_CARD),
          transform: `scale(${sp(IN_ST_CARD)})`,
        }}
      >
        <Card
          style={{ width: 580, height: 400, borderColor: COLORS.accentGreen }}
        >
          <SvgIcon path={ICON_USERS} color={COLORS.accentGreen} size={150} />
          <Text weight={700} style={{ marginTop: 40, textAlign: "center" }}>
            Stakeholders
          </Text>
        </Card>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            marginTop: 40,
            marginLeft: 50,
          }}
        >
          <IconListItem
            icon={<SvgIcon path={ICON_HEART} />}
            text="Interested or Affected"
            color={COLORS.accentGreen}
            delay={IN_ST_LIST}
            frame={frame}
            fps={fps}
          />
          <IconListItem
            icon={<SvgIcon path={ICON_PERSON} />}
            text="Includes End Users"
            color={COLORS.accentGreen}
            delay={IN_ST_LIST + 40}
            frame={frame}
            fps={fps}
          />
          <IconListItem
            icon={<SvgIcon path={ICON_CHAT} />}
            text="Provide Feedback"
            color={COLORS.accentGreen}
            delay={IN_ST_LIST + 80}
            frame={frame}
            fps={fps}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: interpolate(frame, [30, 60], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Text size={FONTS.subHeading} weight={800}>
          Setting the Direction
        </Text>
      </div>
    </AbsoluteFill>
  );
};

const Scene2_TheBuilders = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const IN_DEV = 40;
  const IN_BUILD = 140;
  const IN_ANYONE = 240;
  const IN_SUB = 360;

  const sp = (delay) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, stiffness: 60 },
    });
  const fadeOut = interpolate(frame, [1440, 1500], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subRoles = [
    { label: "Programmers", icon: ICON_CODE, x: 500 },
    { label: "Testers", icon: ICON_BUG, x: 1250 },
    { label: "UI Designers", icon: ICON_PALETTE, x: 2000 },
    { label: "Architects", icon: ICON_COMPASS, x: 2750 },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ArrowMarkers />

      {/* SVG Background Layer */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {subRoles.map((role, i) => {
          const lineDelay = IN_SUB + i * 120;
          const lineProg = interpolate(
            frame,
            [lineDelay, lineDelay + 45],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          const pathLen = 2000;
          return (
            <path
              key={i}
              d={`M 1920 580 C 1920 850 ${role.x + 240} 850 ${role.x + 240} 1150`}
              stroke={COLORS.accentYellow}
              strokeWidth={6}
              fill="none"
              strokeDasharray={pathLen}
              strokeDashoffset={pathLen - lineProg * pathLen}
              opacity={lineProg > 0 ? 1 : 0}
              markerEnd="url(#arrow-yellow)"
            />
          );
        })}
      </svg>

      {/* Main Developer */}
      <div
        style={{
          position: "absolute",
          left: 1520,
          top: 100,
          opacity: sp(IN_DEV),
          transform: `scale(${sp(IN_DEV)})`,
        }}
      >
        <Card
          style={{ width: 800, height: 480, borderColor: COLORS.accentYellow }}
        >
          <SvgIcon path={ICON_GEAR} color={COLORS.accentYellow} size={180} />
          <Text weight={700} style={{ marginTop: 20, textAlign: "center" }}>
            Developers
          </Text>
          <Text
            size={FONTS.caption}
            color={COLORS.textSecondary}
            style={{ marginTop: 10 }}
          >
            (Business Engineers)
          </Text>
        </Card>
      </div>

      {/* Explanatory Icons Next to Main Card */}
      <div
        style={{
          position: "absolute",
          left: 2400,
          top: 180,
          display: "flex",
          flexDirection: "column",
          gap: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            opacity: sp(IN_BUILD),
            transform: `translateX(${interpolate(sp(IN_BUILD), [0, 1], [-40, 0])}px)`,
          }}
        >
          <Card
            style={{
              width: 140,
              height: 140,
              padding: 0,
              borderRadius: 20,
              borderColor: COLORS.accentYellow,
            }}
          >
            <SvgIcon path={ICON_WRENCH} color={COLORS.accentYellow} size={70} />
          </Card>
          <Text size={FONTS.body} weight={700}>
            Build the application
          </Text>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            opacity: sp(IN_ANYONE),
            transform: `translateX(${interpolate(sp(IN_ANYONE), [0, 1], [-40, 0])}px)`,
          }}
        >
          <Card
            style={{
              width: 140,
              height: 140,
              padding: 0,
              borderRadius: 20,
              borderColor: COLORS.textSecondary,
            }}
          >
            <SvgIcon path={ICON_USERS} color={COLORS.textPrimary} size={70} />
          </Card>
          <Text size={FONTS.caption} color={COLORS.textSecondary}>
            Anyone who helps in
            <br />
            creating the app
          </Text>
        </div>
      </div>

      {/* Sequential Connections and Sub Roles */}
      {subRoles.map((role, i) => {
        const lineDelay = IN_SUB + i * 120;
        const cardDelay = lineDelay + 40;
        const cardProg = spring({
          frame: frame - cardDelay,
          fps,
          config: { damping: 16, stiffness: 60 },
        });

        return (
          <div
            key={`card-${i}`}
            style={{
              position: "absolute",
              left: role.x,
              top: 1200,
              opacity: cardProg,
              transform: `translateY(${interpolate(cardProg, [0, 1], [60, 0])}px)`,
            }}
          >
            <Card style={{ width: 480, height: 350, padding: 40 }}>
              <SvgIcon path={role.icon} color={COLORS.textPrimary} size={120} />
              <Text
                weight={600}
                size={40}
                style={{ marginTop: 30, textAlign: "center" }}
              >
                {role.label}
              </Text>
            </Card>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: interpolate(frame, [30, 60], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Text size={FONTS.subHeading} weight={800}>
          One Team, Many Skills
        </Text>
      </div>
    </AbsoluteFill>
  );
};

const Scene3_ProcessCoach = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const IN_SM = 40;
  const IN_LINES = 140;
  const IN_PO = 220;
  const IN_TEAM = 220;
  const IN_ROCKS = 320;
  const IN_PULSE = 420;
  const ROCKS_OUT = 480;
  const IN_COACH = 560; // Strictly after rocks are gone

  const sp = (delay) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, stiffness: 60 },
    });
  const fadeOut = interpolate(frame, [1440, 1500], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulseProg = spring({
    frame: frame - IN_PULSE,
    fps,
    config: { damping: 20, stiffness: 40 },
  });
  const rocksExit = spring({
    frame: frame - ROCKS_OUT,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const lineProg = interpolate(frame, [IN_LINES, IN_LINES + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathLen = 2500;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ArrowMarkers />

      {/* SVG Background Layer */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <path
          d="M 1000 775 C 1600 775 1800 525 2350 525"
          stroke={COLORS.accentBlue}
          strokeWidth={6}
          fill="none"
          strokeDasharray={pathLen}
          strokeDashoffset={pathLen - lineProg * pathLen}
          opacity={lineProg > 0 ? 1 : 0}
          markerEnd="url(#arrow-blue)"
        />
        <path
          d="M 1000 775 C 1600 775 1800 1025 2350 1025"
          stroke={COLORS.accentBlue}
          strokeWidth={6}
          fill="none"
          strokeDasharray={pathLen}
          strokeDashoffset={pathLen - lineProg * pathLen}
          opacity={lineProg > 0 ? 1 : 0}
          markerEnd="url(#arrow-blue)"
        />
      </svg>

      {/* Scrum Master (Left) */}
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 550,
          opacity: sp(IN_SM),
          transform: `scale(${sp(IN_SM)})`,
        }}
      >
        <Card
          style={{ width: 600, height: 450, borderColor: COLORS.accentBlue }}
        >
          <SvgIcon path={ICON_SHIELD} color={COLORS.accentBlue} size={150} />
          <Text weight={700} style={{ marginTop: 40, textAlign: "center" }}>
            Scrum Master
          </Text>
        </Card>
      </div>

      {/* Coach Icon perfectly centered under the SM card */}
      <div
        style={{
          position: "absolute",
          left: 400, // Anchored to SM Card X
          width: 600, // Fills SM Card width for perfect centering
          top: 1050,
          opacity: sp(IN_COACH),
          transform: `translateY(${interpolate(sp(IN_COACH), [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
          }}
        >
          <Card
            style={{
              width: 120,
              height: 120,
              padding: 0,
              borderRadius: 20,
              borderColor: COLORS.accentBlue,
            }}
          >
            <SvgIcon path={ICON_COACH} color={COLORS.accentBlue} size={60} />
          </Card>
          <Text size={FONTS.body} weight={700}>
            Acts like a Coach
          </Text>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1700,
          top: 720,
          opacity: lineProg,
        }}
      >
        <Badge text="Ensures Scrum Process" color={COLORS.accentBlue} />
      </div>

      {/* PO and Dev Team (Right) */}
      <div
        style={{
          position: "absolute",
          left: 2315,
          top: 350,
          opacity: sp(IN_PO),
          transform: `scale(${sp(IN_PO)})`,
        }}
      >
        <Card style={{ width: 680, height: 350 }}>
          <SvgIcon path={ICON_COMPASS} color={COLORS.accentPurple} size={100} />
          <Text weight={700} style={{ marginTop: 20 }}>
            Product Owner
          </Text>
        </Card>
      </div>

      <div
        style={{
          position: "absolute",
          left: 2315,
          top: 850,
          opacity: sp(IN_TEAM),
          transform: `scale(${sp(IN_TEAM)})`,
        }}
      >
        <Card style={{ width: 680, height: 350 }}>
          <SvgIcon path={ICON_GEAR} color={COLORS.accentYellow} size={100} />
          <Text weight={700} style={{ marginTop: 20 }}>
            Development Team
          </Text>
        </Card>
      </div>

      {/* Rocks on Developers */}
      {rocksExit < 1 && (
        <div
          style={{
            position: "absolute",
            left: 2100,
            top: 900,
            opacity: sp(IN_ROCKS),
            transform: `scale(${1 - rocksExit})`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Badge
              text="Distractions"
              color={COLORS.accentRed}
              style={{ marginBottom: 20 }}
            />
            <SvgIcon path={ICON_ROCK} color={COLORS.accentRed} size={120} />
          </div>
        </div>
      )}

      {/* Pulse Effect clearing rocks */}
      {pulseProg > 0 && pulseProg < 0.99 && (
        <div
          style={{
            position: "absolute",
            left: 700,
            top: 775,
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `10px solid ${COLORS.accentBlue}`,
            transform: `translate(-50%, -50%) scale(${pulseProg * 28})`,
            opacity: 1 - pulseProg,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: interpolate(frame, [30, 60], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Text size={FONTS.subHeading} weight={800}>
          The Process Guide
        </Text>
      </div>
    </AbsoluteFill>
  );
};

const Scene4_ExpertGuidance = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Optimized and sequenced timings
  const IN_SME = 40;
  const IN_BRAIN = 140; // Special Knowledge after SME
  const IN_PUZZLE = 240;
  const IN_DEV = 320;
  const IN_LINE = 400; // Shared line start
  const IN_BADGE_LINE = 500; // Guides & supports after line
  const IN_BADGE_ROLE = 600; // Not official role at very end

  const sp = (delay) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, stiffness: 60 },
    });
  const fadeOut = interpolate(frame, [1440, 1500], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineProg = interpolate(frame, [IN_LINE, IN_LINE + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pathLen = 1200;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ArrowMarkers />

      {/* Connect SME -> Problem <- Dev */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* SME to Problem */}
        <path
          d="M 1000 725 L 1700 725"
          stroke={COLORS.accentGreen}
          strokeWidth={8}
          fill="none"
          strokeDasharray={pathLen}
          strokeLinecap="round"
          strokeDashoffset={pathLen - lineProg * pathLen}
          opacity={lineProg > 0 ? 1 : 0}
          markerEnd="url(#arrow-green)"
        />
        {/* Dev to Problem */}
        <path
          d="M 2840 725 L 2140 725"
          stroke={COLORS.accentYellow}
          strokeWidth={8}
          fill="none"
          strokeDasharray={pathLen}
          strokeLinecap="round"
          strokeDashoffset={pathLen - lineProg * pathLen}
          opacity={lineProg > 0 ? 1 : 0}
          markerEnd="url(#arrow-yellow)"
        />
      </svg>

      {/* SME First (Left) */}
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 500,
          opacity: sp(IN_SME),
          transform: `scale(${sp(IN_SME)})`,
        }}
      >
        <Card
          style={{ width: 700, height: 450, borderColor: COLORS.accentGreen }}
        >
          <SvgIcon
            path={ICON_LIGHTBULB}
            color={COLORS.accentGreen}
            size={150}
          />
          <Text weight={700} style={{ marginTop: 40, textAlign: "center" }}>
            Subject Matter Expert
            <br />
            <span style={{ fontSize: 36, color: COLORS.textSecondary }}>
              (SME)
            </span>
          </Text>
        </Card>
      </div>

      {/* Special Knowledge perfectly centered under the SME card */}
      <div
        style={{
          position: "absolute",
          left: 400, // Anchor to SME Card X
          width: 600, // Fill SME Card width
          top: 1000,
          opacity: sp(IN_BRAIN),
          transform: `translateY(${interpolate(sp(IN_BRAIN), [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
          }}
        >
          <Card
            style={{
              width: 120,
              height: 120,
              padding: 0,
              borderRadius: 20,
              borderColor: COLORS.accentGreen,
            }}
          >
            <SvgIcon path={ICON_BRAIN} color={COLORS.accentGreen} size={60} />
          </Card>
          <Text size={FONTS.body} weight={700}>
            Special Knowledge
          </Text>
        </div>
      </div>

      {/* Complex Problem (Center precisely aligned) */}
      <div
        style={{
          position: "absolute",
          left: 1670,
          top: 550,
          width: 500,
          opacity: sp(IN_PUZZLE),
          transform: `scale(${sp(IN_PUZZLE)})`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <SvgIcon path={ICON_PUZZLE} color={COLORS.accentYellow} size={200} />
          <Text weight={700} style={{ marginTop: 20 }}>
            Complex Problem
          </Text>
        </div>
      </div>

      {/* Developer (Right - mirrored symmetrically) */}
      <div
        style={{
          position: "absolute",
          left: 2840,
          top: 500,
          opacity: sp(IN_DEV),
          transform: `scale(${sp(IN_DEV)})`,
        }}
      >
        <Card style={{ width: 700, height: 450 }}>
          <SvgIcon path={ICON_GEAR} color={COLORS.accentYellow} size={150} />
          <Text weight={700} style={{ marginTop: 40, textAlign: "center" }}>
            Developers
          </Text>
        </Card>
      </div>

      {/* Guides & Supports (Appears after lines) */}
      <div
        style={{
          position: "absolute",
          left: 1250,
          top: 600,
          opacity: sp(IN_BADGE_LINE),
          transform: `scale(${sp(IN_BADGE_LINE)})`,
        }}
      >
        <Badge text="Guides & Supports" color={COLORS.accentGreen} />
      </div>

      {/* Not Official Role (Appears at very end, top left overlay) */}
      <div
        style={{
          position: "absolute",
          left: 360,
          top: 460,
          opacity: sp(IN_BADGE_ROLE),
          transform: `scale(${sp(IN_BADGE_ROLE)})`,
          zIndex: 10,
        }}
      >
        <Badge
          text="Not Official Role"
          color={COLORS.accentRed}
          style={{ background: "#300" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: interpolate(frame, [30, 60], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Text size={FONTS.subHeading} weight={800}>
          Specialized Knowledge on Demand
        </Text>
      </div>
    </AbsoluteFill>
  );
};

const Scene5_RolesAtAGlance = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const IN_PO = 40;
  const IN_DEV = 120;
  const IN_SM = 200;
  const IN_LINES = 280;

  const sp = (delay) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, stiffness: 60 },
    });
  const fadeOut = interpolate(frame, [1140, 1200], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const linesProg = interpolate(frame, [IN_LINES, IN_LINES + 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Background Connecting Lines */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <polygon
          points="1920,350 860,1350 2980,1350"
          stroke={COLORS.border}
          strokeWidth={10}
          fill="none"
          strokeDasharray="6000"
          strokeDashoffset={6000 - linesProg * 6000}
          opacity={linesProg > 0 ? 1 : 0}
        />
      </svg>

      {/* Product Owner (Top Center) */}
      <div
        style={{
          position: "absolute",
          left: 1622,
          top: 88,
          opacity: sp(IN_PO),
          transform: `scale(${sp(IN_PO)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card
          style={{ width: 580, height: 400, borderColor: COLORS.accentPurple }}
        >
          <SvgIcon path={ICON_COMPASS} color={COLORS.accentPurple} size={150} />
          <Text weight={700} style={{ marginTop: 20, textAlign: "center" }}>
            Product Owner
          </Text>
        </Card>
        <div style={{ marginTop: 30 }}>
          <Badge
            text="Decides features & priorities"
            color={COLORS.accentPurple}
          />
        </div>
      </div>

      {/* Developers (Bottom Left) */}
      <div
        style={{
          position: "absolute",
          left: 620,
          top: 1150,
          opacity: sp(IN_DEV),
          transform: `scale(${sp(IN_DEV)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card
          style={{ width: 580, height: 400, borderColor: COLORS.accentYellow }}
        >
          <SvgIcon path={ICON_GEAR} color={COLORS.accentYellow} size={150} />
          <Text weight={700} style={{ marginTop: 20, textAlign: "center" }}>
            Developers
          </Text>
        </Card>
        <div style={{ marginTop: 30 }}>
          <Badge text="Builds app & daily work" color={COLORS.accentYellow} />
        </div>
      </div>

      {/* Scrum Master (Bottom Right) */}
      <div
        style={{
          position: "absolute",
          left: 2740,
          top: 1150,
          opacity: sp(IN_SM),
          transform: `scale(${sp(IN_SM)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card
          style={{ width: 580, height: 400, borderColor: COLORS.accentBlue }}
        >
          <SvgIcon path={ICON_SHIELD} color={COLORS.accentBlue} size={150} />
          <Text weight={700} style={{ marginTop: 20, textAlign: "center" }}>
            Scrum Master
          </Text>
        </Card>
        <div style={{ marginTop: 30 }}>
          <Badge text="Ensures Scrum process" color={COLORS.accentBlue} />
        </div>
      </div>

      {/* Center Text perfectly in the middle */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 950,
          width: "100%",
          textAlign: "center",
          opacity: sp(IN_LINES),
          transform: `scale(${interpolate(sp(IN_LINES), [0, 1], [0.8, 1])})`,
        }}
      >
        <Text
          size={160}
          weight={800}
          style={{ textShadow: `0 10px 40px ${COLORS.bg}` }}
        >
          The Scrum Team
        </Text>
      </div>
    </AbsoluteFill>
  );
};

const Scene6_LookingAhead = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const IN_TEXT = 40;
  const IN_FEAT = 160;
  const IN_TERM = 280;

  const sp = (delay) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, stiffness: 60 },
    });
  const fadeOut = interpolate(frame, [840, 900], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
          opacity: sp(IN_TEXT),
          transform: `translateY(${interpolate(sp(IN_TEXT), [0, 1], [40, 0])}px)`,
        }}
      >
        <Text size={160} weight={800}>
          Up Next
        </Text>

        <div style={{ display: "flex", gap: 60, marginTop: 40 }}>
          <div
            style={{ opacity: sp(IN_FEAT), transform: `scale(${sp(IN_FEAT)})` }}
          >
            <Card
              style={{
                width: 700,
                height: 350,
                borderColor: COLORS.accentBlue,
              }}
            >
              <Badge
                text="Features & Parts"
                color={COLORS.accentBlue}
                style={{ marginBottom: 30 }}
              />
              <Text
                size={FONTS.body}
                color={COLORS.textSecondary}
                style={{ textAlign: "center" }}
              >
                Dividing features step-by-step
              </Text>
            </Card>
          </div>

          <div
            style={{ opacity: sp(IN_TERM), transform: `scale(${sp(IN_TERM)})` }}
          >
            <Card
              style={{
                width: 700,
                height: 350,
                borderColor: COLORS.accentYellow,
              }}
            >
              <Badge
                text="Scrum Terminology"
                color={COLORS.accentYellow}
                style={{ marginBottom: 30 }}
              />
              <Text
                size={FONTS.body}
                color={COLORS.textSecondary}
                style={{ textAlign: "center" }}
              >
                Learning key Scrum terms
              </Text>
            </Card>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. TIMELINE CONSTANTS ───────────────────────────────────────────────────

const FPS = 60;
const GAP = 5;

const S1_START = 0;
const S1_DUR = 850; // 30s

const S2_START = S1_START + S1_DUR + GAP;
const S2_DUR = 880; // 25s

const S3_START = S2_START + S2_DUR + GAP;
const S3_DUR = 650; // 25s

const S4_START = S3_START + S3_DUR + GAP;
const S4_DUR = 700; // 25s

const S5_START = S4_START + S4_DUR + GAP;
const S5_DUR = 400; // 20s

const S6_START = S5_START + S5_DUR + GAP;
const S6_DUR = 500; // 15s

const TOTAL_FRAMES = S6_START + S6_DUR + GAP;

// ── 6. ROOT COMPOSITION ─────────────────────────────────────────────────────

export const CourseAnimation = () => (
  <AbsoluteFill style={{ background: COLORS.bg, overflow: "hidden" }}>
    <GlobalStyles />

    <Sequence from={S1_START} durationInFrames={S1_DUR}>
      <Scene1_DirectionSetters />
    </Sequence>

    <Sequence from={S2_START} durationInFrames={S2_DUR}>
      <Scene2_TheBuilders />
    </Sequence>

    <Sequence from={S3_START} durationInFrames={S3_DUR}>
      <Scene3_ProcessCoach />
    </Sequence>

    <Sequence from={S4_START} durationInFrames={S4_DUR}>
      <Scene4_ExpertGuidance />
    </Sequence>

    <Sequence from={S5_START} durationInFrames={S5_DUR}>
      <Scene5_RolesAtAGlance />
    </Sequence>

    <Sequence from={S6_START} durationInFrames={S6_DUR}>
      <Scene6_LookingAhead />
    </Sequence>
  </AbsoluteFill>
);

// ── 7. REGISTRATION ─────────────────────────────────────────────────────────

export const RemotionRoot = () => (
  <>
    <Composition
      id="CourseAnimation"
      component={CourseAnimation}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={3840}
      height={2160}
      defaultProps={{}}
    />
  </>
);

registerRoot(RemotionRoot);
