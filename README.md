# IL RAVEN EXPERIENCE

A digital sanctuary for the IL RAVEN audio project.

## Narrative Architecture

The experience is divided into three layers of initiation:

1.  **THE SIGNAL (Genesis)**
    *   *Concept:* The raw transmission. Chaos. Glitch.
    *   *Content:* `public/audio/genesis`
    *   *Action:* User must "tune in" to proceed.

2.  **THE ARCHIVE (B-Roll)**
    *   *Concept:* The evidence. Brutalist file directory.
    *   *Content:* `public/audio/b-roll`
    *   *Action:* Explore the lore and process.

3.  **THE SANCTUARY (Final Album)**
    *   *Concept:* The revelation. Pure, high-definition playback.
    *   *Content:* `public/audio/final/side-a` & `side-b`
    *   *Action:* Deep listening experience.

## Tech Stack
- **Next.js 16** (App Router)
- **Tailwind CSS v4** (Void Theme)
- **Framer Motion** (Cinematic Animations)
- **Lucide React** (Iconography)

## Getting Started

```bash
npm install
npm run dev
```

## Asset Management
Drop new audio files into the respective folders in `public/audio/`. The system automatically ingests them via the API route.
