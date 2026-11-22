# Stop Stuttering Practice App — Design

Date: 2026-11-22
Source: Lee Lovett, *Stop Stuttering Short Course* (2nd ed.) — "The Neuroscience Method".

## Goal

A personal practice web app (PWA) for the three methods in the book:
Self Affirmation (Auto Suggestion), Crutches (+ Speech Plans), and Self-Hypnosis.

## Decisions

| Topic | Decision |
|---|---|
| Devices | Phone + desktop. Responsive PWA, installable to home screen |
| Language | Entire UI and all content in English |
| Voice | Browser Web Speech API (no cloud TTS) + user's own recordings |
| Data | Local only (IndexedDB). No account, no backend. Manual export/import |
| Hosting | GitHub Pages via GitHub Actions on push to `main` |
| Stack | Vite + React + TypeScript, Tailwind CSS, vite-plugin-pwa, HashRouter, `idb` |
| Tests | Vitest for core logic; audio/recording verified manually on device |
| Content | Positive statements only. No negative-thought cards anywhere |

## Navigation

Bottom tab bar on phone, sidebar on desktop: **Today · Cards · Crutches · Hypnosis · More**.

## 1. Today (home)

- Session checklist: Morning MTT, Bedtime MTT, optional Midday (book: at least 2/day).
- Streak counter and 7-day dots.
- Shortcuts: My Recordings, Sleep Playback.
- Random affirmation of the day.

## 2. Daily Affirmation Training

**Today's 10**
- Defaults to the book's 10 speech affirmations; user's name filled into #2.
- #1 ("Every day, in every way, my speech grows better and better.") and
  #10 ("Today, I'll make a happy day.") are locked (book rule). Middle 8 replaceable from Cards.
- Monthly review reminder.

**Session flow (~20 min)**
1. Optional ~1 min breathing animation.
2. Caprio quote, full screen, user reads aloud ("Listen" plays TTS demo).
3. 10 cards, one at a time: tap anywhere = one repetition; progress ring to 20
   (configurable); vibrate and advance at 20. Prompt: "Visualize yourself speaking easily."
   TTS "Listen" is a demo only; it does not count.
4. Mark session complete.

**Recordings**
- Guided recording: shows each of today's 10, user reads, taps Next → one continuous file.
- Two versions: Monotone and Animated; latest of each kept; re-record anytime.
- Daytime Play: Animated, loop.
- Sleep Playback: Monotone, loop, very low default volume, timer (30 min / 1 h / all night).
  Uses an audio element so it continues with the screen locked.

## 3. Cards (flashcard library)

- ~200 built-in English affirmations in 8 categories:
  Speech & Fluency · Calm & Relaxation · Speaking Without Thinking Words ·
  Crutches & Speech Plan · Strangers, Authorities & Groups · Kindness to Myself ·
  Self-Worth · Life & Happiness. Plus "My Cards" (user-created).
- Rules: present tense, affirmative, short. `{name}` placeholder filled from Settings.
- Browse: by category; favorite, "+ Today", TTS play; sort by times read.
- Deck: pick category / All / Favorites; shuffled full-screen cards; swipe or tap Next;
  reps per card (default 3, tap to count); summary at end.
- Custom cards: add/edit/delete, with a hint about the rules.
- Per-card lifetime repetition count.

## 4. Crutches

**Learn**: one card per C-1…C-13 (name, how, book example, when to use), grouped
C1–8 (single feared words) → C9–12 (conversation) → C13 (end game).
"Crutch of the Week" focus, shown on Today.

**Drill A — single words (C1–C8)**: user's "My Words" list (+ built-in examples).
Random word + crutch with a concrete hint (C-1 greyed first letter, C-3 "L-E-E-Lee",
C-4 "Well‿Lee", C-7 "Whisper it", C-8 "HIGH-low / LOUD-soft"). Tap Done. Per-crutch counts.

**Drill B — conversation (C9–C12 + Speech Plan)**: ~30 sentences marked with `‿` (link),
`|` (1 s stop), `||` (2 s stop). Stop metronome with countdown dots. User's Speech Plan
keywords shown on top.

**Drill C — C-13 free talk**: random everyday topic, 1-minute timer, speak without planning words.

## 5. Self-Hypnosis

Not from the book (the book gives principles only). Labelled as such in the app.

- Modes: Bedtime (fades out, no wake-up) and Daytime (count 1–5 to wake). 10 or 20 min.
- Script (English, TTS, slow rate, generous pauses): settling breaths → progressive
  relaxation head to toe → deepening countdown 10→1 (staircase) → Caprio quote +
  today's 10 affirmations, each followed by a pause to repeat silently → visualization
  of speaking calmly to a group → ending.
- 20-minute version adds more body parts, a peaceful-place section, and says each affirmation twice.
- Pauses are stretched automatically so the session lasts about the chosen length.
- Runs as a full-screen overlay started directly by the Start tap (iOS requires speech/audio to start from a tap).
- Screen Wake Lock + near-black screen with dim pause button (TTS stops on lock).
- Optional generated white/brown noise, adjustable volume.
- Adjustable speaking speed; voice comes from Settings.
- Completing a session marks Bedtime (bedtime mode) or Morning/Midday (daytime mode) on Today.
- Safety notice: do not use while driving or when attention is needed.
- iOS/Safari only expose basic voices to websites (downloaded Premium/Enhanced voices are not available).

## 6. More

- My Speech Plan Card: user's GSP and ESP (e.g. "Joy – Smile – Stop" / "Slow – Link – Stop");
  one tap for full-screen display.
- Settings: name, TTS voice and rate, reps per affirmation (default 20), theme.
- Export / Import all data (JSON; recordings included as base64).

## Code structure

```
src/
  content/   built-in data: affirmations, crutches, drill sentences, hypnosis script
  lib/       speech, recorder, storage, wakeLock, noise
  features/  today, cards, crutches, hypnosis, more
```

## Build order

1. Scaffold, navigation, Settings, dark mode, GitHub Pages deploy
2. 200 cards + Cards library
3. Daily Affirmation training + Today's 10
4. Recordings, daytime play, sleep playback
5. Crutches learn cards + three drills
6. Self-Hypnosis
7. Speech Plan Card, export/import

Each step is tried in the browser and confirmed before the next.
