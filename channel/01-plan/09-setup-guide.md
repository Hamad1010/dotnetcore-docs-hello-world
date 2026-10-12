# 09 · Setup guide (once, ~45 minutes)

You have two ways to run the system. **Option A needs nothing installed.**

## Option A · Cloud only (Claude Code on the web) · easiest

1. Open [claude.ai/code](https://claude.ai/code), choose this repository (or your new private repo, see §6) and say "run `/new-episode`".
2. Claude writes, renders and pushes. Download the MP4 from the session's files (or ask Claude to send it).
3. Limits: free online voices are blocked in cloud sessions. Use **ElevenLabs/Google keys** stored in the environment's secrets (Claude can explain where), or record your voice and upload the files.

## Option B · Your own computer (faster renders, any voice)

### 1. Install the basics
| Tool | Mac | Windows |
|---|---|---|
| Node.js 22 LTS | [nodejs.org](https://nodejs.org) installer | same |
| Git | `xcode-select --install` | [git-scm.com](https://git-scm.com) |
| Claude Code | `npm install -g @anthropic-ai/claude-code` then `claude` | same (in PowerShell) |
| (optional) VS Code | [code.visualstudio.com](https://code.visualstudio.com) | same |

### 2. Get the project
```bash
git clone <your private repo url> channel-project
cd channel-project/channel/04-studio
npm install
npm run music        # makes our own background music + whoosh (once)
```

### 3. (Optional) Remotion's official skills for Claude Code
In `channel/04-studio`: `npx skills add remotion-dev/skills`. These are Remotion's best-practice notes, which
help Claude when you ask for new animations.

### 4. Voice keys
```bash
cp .env.example .env     # then open .env and fill ONE provider
```
- **ElevenLabs:** Profile → API key. Pick a voice in the Voice Library (search "Saudi" / "Khaleeji") or clone
  your own, copy its **Voice ID**. Free plan = 10k characters/month (≈1 test episode, non-commercial use).
  Starter (~$5–6/mo) adds commercial rights.
- **Your own recordings:** no key needed. Save `s1.m4a`, `s2.m4a`… in `03-episodes/EP00N/audio/`.

### 5. Make a video
```bash
npm run voice -- EP001 --provider=elevenlabs   # or recorded / google / polly / edge
npm run preview -- EP001                       # still frames → 03-episodes/EP001/out/preview/
npm run render -- EP001                        # → 03-episodes/EP001/out/EP001.mp4 (+ thumbnail, srt, chapters)
npm run studio                                 # optional: live preview in the browser
```
Render time on a normal laptop: ~10–20 min for a 6-min video.

### 6. Move to a private repository (important)
This project was created inside a **public fork** (`dotnetcore-docs-hello-world`). GitHub doesn't allow making a
public fork private, so:
1. GitHub → **New repository** → name it (e.g. `sawalif-channel`) → **Private** → Create.
2. In a terminal inside the old project folder:
   ```bash
   git remote add private https://github.com/<you>/sawalif-channel.git
   git push private claude/gifted-cori-62rsoj:main
   ```
3. Use the private repo from now on (Claude Code web: attach the new repo). Optionally delete the public fork.

Or simply ask Claude: "create a private repo and move the channel there". It can do that for you with your approval.

### 7. YouTube channel
- Create a **Brand Account** channel, enable 2-step verification, add a backup manager.
- Settings → Upload defaults: Education · Arabic · "not made for kids" · description template.
- Studio → Settings → Channel → Advanced: country = Saudi Arabia.
