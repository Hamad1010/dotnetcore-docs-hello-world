# 10 · Voice guide: your voice, your clone, or Polly

*Prices and plan limits change. Check the provider's pricing page before paying. Last checked October 2026.*

## 1. The short answer

| Use | Voice |
|---|---|
| Monetized long videos | **Your own voice**, recorded, or a **clone of your own voice** |
| Tests, drafts, a backup | Amazon Polly (Zayd/Hala) or any free test voice |

Why: YouTube's "inauthentic content" review looks at the whole channel. A real human voice (yours, or your
own clone) makes the channel clearly *yours*. A stock voice that thousands of channels use pushes the other way.

## 2. ElevenLabs vs Amazon Polly (Gulf Arabic): the differences that matter

| | ElevenLabs (a clone of **your** voice) | Amazon Polly Gulf Arabic (Zayd ♂ / Hala ♀) |
|---|---|---|
| What it sounds like | You: your timbre, your Saudi accent, your rhythm | A stock Gulf newsreader voice (UAE-style Gulf accent) |
| Naturalness | High. Breathing, emotion, questions sound real. `eleven_v3` also takes emotion tags | Clear but flat. Long narration starts to sound robotic |
| Saudi dialect | Follows *your* accent; a few dialect words may still come out formal, which you fix by respelling | Reads dialect words, but the stress and melody stay closer to formal Arabic |
| Uniqueness | Nobody else has your voice: it becomes the channel's identity | Anyone can use the same voice |
| Setup | One-time recording: 1–2 min (Instant clone) or 30 min+ (Professional clone), plus a consent check | AWS account + access keys. No recording |
| Cost | Starter ≈ $5/month ≈ 30 min of speech ≈ 4 episodes. Creator ≈ $22/month ≈ 100 min ≈ 15 episodes | Neural voices ≈ $16 per 1M characters ≈ **$0.10 per episode** (free tier in the first 12 months) |
| Commercial use | Included in paid plans (not the free plan) | Included |
| YouTube AI label | Tick it (recommended, see §4) | Tick it |
| In this cloud session | Blocked until `api.elevenlabs.io` is allowed (see §7) | Works (needs AWS keys) |

**Bottom line:** Polly is cheap and instant but sounds like a machine reading. ElevenLabs with your own clone
sounds like you, which is what builds trust and protects monetization. Use Polly only to test.

## 3. Can I give Claude a recording so it "catches" my voice?

Not directly. Claude writes and edits; it can't learn a voice by itself. There are two ways to get your voice
into every video:

1. **You record each episode** (or each Short). Claude cuts it per scene, cleans silences, evens out the volume
   and syncs captions and animations to your real timing.
2. **You create a clone once in ElevenLabs** from a 1–2 minute recording (the script in §8). ElevenLabs asks
   you to confirm it's your voice. Then Claude generates every episode in your cloned voice: you only listen
   and approve.

Free open-source cloning exists, but it needs a strong GPU and its Saudi Arabic is weaker. Not worth your
time now.

## 4. YouTube: will it be monetized? Do I tick the AI box?

| Narration | Tick "altered or synthetic content"? | Monetized? |
|---|---|---|
| Your own recorded voice | **No** | Yes |
| A clone of **your own** voice, reading the script you approved | **Yes, recommended.** Some guides say your own clone doesn't need it, but YouTube's examples include "synthetically generating a person's voice to narrate a video". One click removes the doubt | Yes. The label doesn't switch off ads |
| Polly / a library voice | **Yes, recommended** | Yes, if the channel passes the "inauthentic content" review |
| Anyone else's voice | Never | — |

For every upload: YouTube Studio → Details → **Altered content** → Yes/No, following the table. That's the only
extra step. What gets punished is *not* ticking it when it was required. Details: `06-monetization-policy-legal.md` §3.

## 5. Option 1 · Record your own voice (free, best)

**You never have to match any timing.** The video follows your voice: every part of it gets longer or shorter
to fit how you speak.

**Easiest way:** open the **Recording Booth** on your phone (<https://claude.ai/artifact/6ygwHYvcEr24DeRoZysEgt>,
private to you). It shows one part at a time in big letters, with a 3-second quiet countdown between parts. Record
everything in one go with your phone's voice app (breaks are fine: start a new recording from where you stopped)
and send the file(s) in the chat. Claude updates the Booth with each new episode's text.

The manual way, one file per part, still works:

**Gear:** your phone. **Room:** a small room with soft things (a closet full of clothes is perfect); no AC
noise. **Phone:** airplane mode, Voice Memos (iPhone) or Recorder (Android), 15–20 cm from your mouth, slightly
to the side so your breath doesn't hit it.

**For a studio-clear voice (from EP002, framework v5 §3.17).** EP001's recording, measured: the room was fairly dry,
but the voice had too much low boom and too little clarity, and the room could be heard in the pauses. The cleaning
now corrects that; these habits make it sound even better:
- **Put the phone on a stand** (a pile of books works) at mouth height, 15–20 cm away, pointing at your mouth from the
  side. Not closer: closer adds boom. Not in your hand: hands add rustle.
- **Same place, same distance, the whole episode,** so the voice sounds the same from the first word to the last.
- **Soft room:** a closet, or a bedroom with curtains, a carpet and a bed. Never a bathroom, kitchen or empty room.
  Turn off the AC, fans and anything that hums for those 20 minutes.
- **Best quality:** iPhone: Settings → Apps → Voice Memos → Audio Quality → **Lossless**. Android: the recorder's
  highest quality.
- **Start with 5 seconds of silence** (don't move or talk): the room's own sound, so the cleaning knows what to remove.
- **Speak a little closer and softer rather than loud and far,** as if to one person across a small table.
- For a noisy or echoing room there is a stronger option: ElevenLabs' Voice Isolator before the cleaning
  (`clean_recording.py … --isolate`, about 1,000 credits per minute of audio).
- **Breathe as you like.** From EP003 the cleaning silences every breath and lip click between words (each word keeps
  its own sound, its first س or ح and its last ت or ف included, and a sound classifier checks nothing it silences is speech). A wrong word can often be fixed with the same
  word said elsewhere in your recording, so a slip doesn't always mean recording again.

**How to read:**
- Open the episode's `script.md`. Each scene heading (like `0:25 · s1`) is one scene = **one file**.
- Read like you're telling a friend a story: smile a little, slow down before numbers, pause after questions.
- Made a mistake? Pause 2 seconds and repeat the sentence. Claude cuts the silence; just tell it which line.
- Name files after the scene id: `hook.m4a`, `title.m4a`, `lesson.m4a`, `s1.m4a` … `outro.m4a`.

**Then:** upload the files in the chat (or put them in `03-episodes/EP00N/audio/` on your computer) and Claude
runs `npm run voice -- EP00N --provider=recorded`. It trims silences, sets loudness to the YouTube standard
(−16 LUFS) and writes the timing file the video follows.

Time: about 20–30 minutes per long episode, 2 minutes per Short.

## 6. Option 2 · Clone your voice in ElevenLabs

1. Create an account at elevenlabs.io and pick **Starter** (Instant clone) or **Creator** (Professional clone,
   closer to you; needs 30 min+ of audio).
2. Record the sample script in §8 the same way as §5 (one file, 1–2 minutes, natural tone).
3. In ElevenLabs: **Voices → Add a new voice → Instant Voice Clone** → upload the file → name it (e.g.
   "Channel voice") → confirm it's your voice → save. Copy its **Voice ID**.
4. **Make a secret key** (it works like a password that lets Claude use your voice; never paste it in the chat):
   elevenlabs.io → bottom-left **Developers** (or your name/picture → **API Keys**) → **API Keys** tab →
   **+ Create Key** → name it `Claude` → leave **Restrict key** off → **Create** → **Copy**. ElevenLabs shows it
   only once.
5. **Put the key in a safe box Claude can't open** (a *network secret*; the key never enters the session, the
   network adds it to each ElevenLabs request). On a computer, open claude.ai/code:
   1. Click the small **cloud icon** with your environment's name (usually **Default**) next to the message box.
   2. Click **Cloud**, move the mouse over **Default**, click the **gear** icon on the right.
   3. In **Edit environment**, go to **Network secrets** → **Add secret**:
      - **Name:** `ElevenLabs` · **Credential type:** leave **Bearer** · **Allowed websites:** `api.elevenlabs.io`
      - **Custom headers:** change **Name** `Authorization` → `xi-api-key`, delete `Bearer` from **Prefix**,
        paste the key as **Value**
   4. Click **Connect**. "ElevenLabs" appears in the list. Nothing else to change.
6. **Send Claude your Voice ID in the chat** (it's not a secret, just the name of your voice). Claude saves it in
   `03-episodes/channel.json` and runs `npm run voice -- EP00N --provider=elevenlabs`. Models:
   `eleven_multilingual_v2` (steady) or `eleven_v3` (more expressive); the trial Short tests both.

On your own computer instead: put `ELEVENLABS_API_KEY=` in `channel/04-studio/.env` (never commit it).

## 7. Option 3 · Amazon Polly

Create an AWS account → an access key that only allows Polly → Claude runs
`npm run voice -- EP00N --provider=polly` (voice `Zayd`, or `POLLY_VOICE=Hala` for the female voice). In a
cloud session, store the AWS keys as a network secret or environment variables (same window as §6.5).

No "Network secrets" section (Team/Enterprise plans)? Use the same window: **Network access** → **Custom** →
add `api.elevenlabs.io` (tick *Also include default list of common package managers*), and put
`ELEVENLABS_API_KEY=your-key` in **Environment variables**. Steps:
<https://code.claude.com/docs/en/cloud-environments>

## 8. Script for your clone sample (read it in 1.5–2 minutes)

> السلام عليكم، حياكم الله. هذا صوتي الطبيعي، وأنا أتكلم بهدوء ووضوح.
> خلني أسألك سؤال بسيط: ليش في ناس ترتاح لهم من أول دقيقة… وناس ثانيين تحس إنك تبي تمشي بسرعة؟
> الجواب مو في الشكل، ولا في الفلوس، ولا في الشهادات. الجواب في طريقة التعامل.
> في هالقناة، كل حلقة فيها درس واحد بس، ونشرحه بقصص حقيقية من كل مكان في العالم: من اليابان، ومن كينيا،
> ومن البرازيل، ومن عندنا هنا في السعودية. وكل قصة فيها أرقام: سنة ألفين وتسعطعش، عشرين مليون،
> عشرة بالمية، ميتين وخمسين شخص.
> أحيانًا القصة تضحّك… وأحيانًا تخليك تسكت شوي وتفكر. وهذا اللي نبيه بالضبط.
> تخيّل معي: واحد واقف في طابور طويل، والكل معصّب، وهو الوحيد اللي مبتسم. وش تتوقع صار؟
> الموظف رحّب فيه، وخدمه بسرعة، وقال له: الله يسعدك، غيّرت يومي.
> شفت؟ كلمة وحدة طيبة… فرّقت.
> طيب، وش المطلوب منك؟ ولا شي صعب. بس اسمع للآخر، وجرّب التمرين اللي في نهاية كل حلقة. خمس دقايق بس.
> وإذا عجبك الدرس، شاركه مع شخص تحبه. يمكن هو محتاج يسمعه اليوم أكثر منك.
> يلا… نبدأ؟

## 9. The trial Short (before any long video)

We test the voice on one Short first: **«خسر السباق وكسب العالم»** (EP001, scene `s4`: Spain 2012, about
40 seconds). Choose one:

- **Your voice:** record the `s4` paragraph from `03-episodes/EP001/script.md` as `s4.m4a` and upload it.
  2 minutes of your time, free.
- **Polly:** Claude renders it right away with Zayd (cost ≈ $0.01) once AWS keys are available.
- **ElevenLabs:** after §6 and §7, Claude renders it in your cloned voice.

Claude then renders `out/short-2-s4.mp4`. You watch it on your phone and decide the voice for the long videos.
