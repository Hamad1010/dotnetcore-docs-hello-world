// The size the scenes lay out for: the video's own, except in a Short made of wide scenes (BoxedShort), which draws
// them in a 16:9 band across the vertical frame, where they must lay out wide although the video is tall.
import React from 'react';
import {useVideoConfig} from 'remotion';

export const FrameSize = React.createContext<{width: number; height: number} | null>(null);

export const useFrameSize = () => {
  const forced = React.useContext(FrameSize);
  const {width, height} = useVideoConfig();
  return forced ?? {width, height};
};
