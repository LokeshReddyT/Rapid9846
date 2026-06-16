import { Composition } from "remotion";
import MainScene from "./App"; // Your main component

export const RemotionRoot = () => {
  return (
    <Composition
      id="My4KVideo"
      component={MainScene}
      durationInFrames={7770} // 240 seconds * 60 fps = 14,400
      fps={60}
      width={1920}
      height={1080}
    />
  );
};
