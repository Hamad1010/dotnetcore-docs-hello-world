# Template · 30 titles and 3 thumbnail prompts (every episode from EP006)

The owner's brief of 17 Nov 2026, for EP006 and every video after it, so the whole publish kit comes "in one go". It goes
in the episode's `publish.md`, after the script is approved and before the recording (the description, tags and chapters
come after the recording). Run the titles through `/yt-package` (`title.py`) and report the characters of each; where
the YouTube agent's rules differ from this brief, the brief wins (`CLAUDE.md` rule 12). Example: `03-episodes/EP006/publish.md`.

## Part 1 · 30 story-driven titles, in Arabic

- **4 to 5 groups**, named in Arabic and English, for example: من الصفر · The underdog story; الوجع اليومي · The pain point;
  بدون رأس مال · Actionable, zero capital; فخاخ تقفل الباب · Business traps; الرقم اللي يفاجئك · The surprising number.
- **Tone:** deeply human, emotional, grounded in everyday Saudi life (الواسطة، السيرة الذاتية، الاجتماع، المدير، ريال…).
- **The formula:** a struggle or an everyday situation + a simple action + an unexpected big result.
- **Never** fluffy, generic or "AI" marketing words: «الدليل الشامل»، «اكتشف أسرار»، «استراتيجيات مذهلة» and their cousins.
- **The owner's golden examples** (the voice to match):
  - «طردوه في المقابلة فكتب تغريدة بسيطة.. وبعد سنين صار اللي ما توقعه أحد!»
  - «فني تكييف يسأله الكل "ليه يقطر ماي؟" فصوّر دقيقة وحدة وصار اللي ما توقعه!»
  - «"أم سارة" تطبخ في البيت وتبيع وتعبت من كثرة رسائل الزباين.. فسوّت حركة عجيبة!»
  - «بدأ بغرفة صغيرة وخياط واحد.. ويوم استقال صار عنده مصنع!»
- **Our own rules still hold** (`CLAUDE.md` 1, 6): every title is true to the video and to `sources.md`; a labelled
  illustration (مثال توضيحي) never appears in a title as if it were a real person; numbers as the sources give them; no
  income promises. Under each list, one line checks every number against its source.
- **Length:** desktop search cuts near 60 characters, so prefer 45–60; the golden examples run to ~75, which is fine when
  the story needs it. Put the character count after each title.
- **Then:** the three pairings to test first (a title and a thumbnail that share no word).

## Part 2 · 3 image-generation prompts for thumbnails

The owner pastes them into an image generator (rule 13: thumbnails come back only in this form).
- **Art style (mandatory):** "A blend of soft watercolor painting and anime illustration style, warm and cozy lighting."
- **Composition (mandatory):** a first-person point of view (POV), or a close torso / over-the-shoulder shot.
- **No faces and no heads, ever:** the head and face are completely cropped out of the frame. Focus on the hands, the
  action, the place, the torso and shoulders (hands typing on a phone, cutting fabric, holding a letter). Saudi
  characters are shown by a sleeve: "traditional white thobe sleeve" or "modest black abaya sleeve".
- **Text:** one bold Arabic overlay of 2 to 4 words that matches the visual story (and is not a word of its paired title).
- **No logos or brand marks** in the picture (rule 7): "a red sports car with no logos or badges".
- **The prompt's form, exactly:**
  "Aspect ratio 16:9. [Camera angle and composition]. [Action and subject details, NO FACES]. [Background details].
  Blend of soft watercolor painting and anime illustration style, warm and cozy lighting. With bold Arabic text:
  '[Arabic text]'. Render only the text listed. Do not add any other placeholder fields."
