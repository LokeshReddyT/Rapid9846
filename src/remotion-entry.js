import { registerRoot, Composition } from "remotion";
import CourseAnimation from "./App.jsx"; // Make sure this matches your file name!

const RemotionVideo = () => {
  return (
    <Composition
      id="My4KVideo"
      component={CourseAnimation}
      durationInFrames={4400} // Adjust if you change sequence timings
      fps={60}
      width={3840}
      height={2160}
    />
  );
};

// This is the line Remotion is waiting for!
registerRoot(RemotionVideo);
