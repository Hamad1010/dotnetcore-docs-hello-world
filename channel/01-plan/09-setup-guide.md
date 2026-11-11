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
This project lives inside a **public fork** (`dotnetcore-docs-hello-world`): anyone can read it. GitHub never
lets a fork become private, so "making it private" means creating a **new private repository** (not a fork)
and moving the project there. The old commits mention the reference course names, so the move uses a **fresh
history** (one starting commit) and the public fork is deleted afterwards. The transcripts were never in git.

**Easiest: Claude does it** (say "create the private repo"; you approve each step):
1. Claude creates a private repo in your account (e.g. `athar-channel`) and pushes a clean copy: channel files
   only, a fresh history, no transcripts, no course names.
2. You open it once to check: github.com → your profile picture → **Your repositories** → the new repo. Only you
   (and anyone you invite) can see it.
3. You delete the old fork: open `dotnetcore-docs-hello-world` → **Settings** → bottom of the page
   (**Danger Zone**) → **Delete this repository** → type its name to confirm.
4. From then on, start Claude Code sessions on the new repo (claude.ai/code → pick it from the repository list).

**By hand, on your computer** (only if you prefer):
```bash
git clone --depth 1 -b claude/gifted-cori-62rsoj https://github.com/<you>/dotnetcore-docs-hello-world.git channel-project
cd channel-project && rm -rf .git && git init -b main && git add -A && git commit -m "Channel project"
git remote add origin https://github.com/<you>/<new-private-repo>.git && git push -u origin main
```
(create the empty private repo first: GitHub → **New repository** → **Private** → Create, without a README).

### Background sound (one word)
Saudi viewers often prefer no music, so videos start with **no background**: voice + soft transition sounds only.
To change it, edit `03-episodes/channel.json` → `"background"`:
- `"none"`: voice only (default)
- `"humming"`: soft human-like humming, no instruments (`03-episodes/_assets/music/humming-sample.mp3` to listen)
- `"calm"`: the soft instrumental pad

Save, then render again. On GitHub you can edit the file in the browser (open it → pencil icon → change the word
→ **Commit changes**); the next render uses it.

### 7. YouTube channel
- Create a **Brand Account** channel, enable 2-step verification, add a backup manager.
- Settings → Upload defaults: Education · Arabic · "not made for kids" · description template.
- Studio → Settings → Channel → Advanced: country = Saudi Arabia.
