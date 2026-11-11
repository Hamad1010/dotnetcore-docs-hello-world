// Remotion settings for the channel studio.
// Episodes (scripts, audio, renders) live in ../03-episodes and are served as "public" files.
import {Config} from '@remotion/cli/config';

Config.setPublicDir('../03-episodes');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCrf(20);
Config.setOverwriteOutput(true);

// Use a browser that is already installed (e.g. in cloud sessions) instead of downloading one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
