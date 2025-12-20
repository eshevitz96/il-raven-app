import fs from 'fs';
import path from 'path';

const AUDIO_DIR = path.join(process.cwd(), 'public/audio');
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/audio-manifest.json');

function getFiles(dir, relativePath) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(file => !file.startsWith('.') && (file.endsWith('.mp3') || file.endsWith('.m4a') || file.endsWith('.wav')))
        .map(file => ({
            name: file,
            path: `/audio/${relativePath}/${file}` // No encodeURIComponent here if we want raw strings, but standardizing is safer. Let's keep it simple and handle encoding in frontend if needed, or better yet, verify if the files need it. The previous fix used encodeURIComponent. Let's apply it here for consistency.
        }))
        .map(item => ({ ...item, path: item.path.split('/').map((p, i) => i > 2 ? encodeURIComponent(p) : p).join('/') })) // encode only the filename part actually.
        .map(file => ({
            name: file.name,
            path: `/audio/${relativePath}/${encodeURIComponent(file.name)}`
        }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
}

const manifest = {
    genesis: getFiles(path.join(AUDIO_DIR, 'genesis'), 'genesis'),
    broll: getFiles(path.join(AUDIO_DIR, 'b-roll'), 'b-roll'),
    sideA: getFiles(path.join(AUDIO_DIR, 'final/side-a'), 'final/side-a'),
    sideB: getFiles(path.join(AUDIO_DIR, 'final/side-b'), 'final/side-b'),
};

// Ensure src/data exists
if (!fs.existsSync(path.join(process.cwd(), 'src/data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'src/data'), { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log('Audio manifest generated at src/data/audio-manifest.json');
