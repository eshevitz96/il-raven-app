import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const AUDIO_DIR = path.join(process.cwd(), 'public/audio');

export async function GET() {
  try {
    const genesisPath = path.join(AUDIO_DIR, 'genesis');
    const brollPath = path.join(AUDIO_DIR, 'b-roll');
    const sideAPath = path.join(AUDIO_DIR, 'final/side-a');
    const sideBPath = path.join(AUDIO_DIR, 'final/side-b');

    const getFiles = (dir: string) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(file => !file.startsWith('.') && (file.endsWith('.mp3') || file.endsWith('.m4a') || file.endsWith('.wav')))
        .map(file => ({
          name: file,
          path: `/audio/${path.relative(AUDIO_DIR, dir)}/${encodeURIComponent(file)}`
        }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    };

    return NextResponse.json({
      genesis: getFiles(genesisPath),
      broll: getFiles(brollPath),
      sideA: getFiles(sideAPath),
      sideB: getFiles(sideBPath),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read audio files' }, { status: 500 });
  }
}
