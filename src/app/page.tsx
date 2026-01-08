'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import localFont from 'next/font/local';

import audioManifest from '../data/audio-manifest.json';
import ravenManifestRaw from '../data/raven-manifest.json';

const ravenManifest = ravenManifestRaw as Record<string, string[]>;

interface AudioTrack {
  name: string;
  path: string;
}

interface AudioData {
  genesis: AudioTrack[];
  broll: AudioTrack[];
  sideA: AudioTrack[];
  sideB: AudioTrack[];
}

// Ensure strict layer ordering based on the directory numbering (1_background -> 9_add)
const LAYER_ORDER = Object.keys(ravenManifest)
  .filter(key => !key.includes('mask') && !key.includes('add'))
  .sort();

export default function Home() {
  const [showAudio, setShowAudio] = useState(false);
  const [ravenLayers, setRavenLayers] = useState<Record<string, string>>({});

  // --- Analytics Helper ---
  const sendAnalyticsEvent = (eventName: string, data?: any) => {
    // Placeholder for real analytics (e.g., GA4, Mixpanel, Vercel Analytics)
    console.log(`[Analytics] Event: ${eventName}`, data);
  };

  const [startTime, setStartTime] = useState<number | null>(null);

  // Audio State & Dual-Deck Refs
  const [data] = useState<AudioData>(audioManifest);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Dual-Deck System for Crossfading
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');
  const [isCrossfading, setIsCrossfading] = useState(false);
  const deckARef = useRef<HTMLAudioElement | null>(null);
  const deckBRef = useRef<HTMLAudioElement | null>(null);

  // --- Raven Logic ---
  const generateRaven = () => {
    const newLayers: Record<string, string> = {};
    LAYER_ORDER.forEach((key) => {
      const options = ravenManifest[key];
      if (options && options.length > 0) {
        // Force valid selection for background (assuming '1_background' is the key)
        if (key === '1_background') {
          const validOptions = options.filter(opt => opt && opt.trim() !== '.png');
          if (validOptions.length > 0) {
            newLayers[key] = validOptions[Math.floor(Math.random() * validOptions.length)];
          }
        } else {
          const random = options[Math.floor(Math.random() * options.length)];
          // Filter out placeholder files if they exist
          if (random && random.trim() !== '.png') {
            newLayers[key] = random;
          }
        }
      }
    });
    setRavenLayers(newLayers);
  };

  useEffect(() => {
    generateRaven();
  }, []);

  // --- Sequencer Logic ---
  const getNextTrack = (track: AudioTrack | null): AudioTrack | null => {
    if (!track) return null;

    // Check Side A
    const idxA = data.sideA.findIndex(t => t.path === track.path);
    if (idxA !== -1) {
      if (idxA < data.sideA.length - 1) return data.sideA[idxA + 1];
      if (data.sideB.length > 0) return data.sideB[0]; // Seamless transition A -> B
    }

    // Check Side B
    const idxB = data.sideB.findIndex(t => t.path === track.path);
    if (idxB !== -1) {
      if (idxB < data.sideB.length - 1) return data.sideB[idxB + 1];
    }

    return null;
  };

  // --- Audio Logic & Crossfading ---
  const CROSSFADE_DURATION = 4; // 4 second overlap for seamless mix

  useEffect(() => {
    let fadeFrame: number;

    const runCrossfade = () => {
      const activeAudio = activeDeck === 'A' ? deckARef.current : deckBRef.current;
      const nextAudio = activeDeck === 'A' ? deckBRef.current : deckARef.current;
      const nextTrackCandidate = getNextTrack(currentTrack);

      if (!activeAudio || !nextAudio || !isPlaying) return;

      const timeLeft = activeAudio.duration - activeAudio.currentTime;

      // START CROSSFADE
      // Trigger when near end of track AND we have a next track to play
      if (timeLeft <= CROSSFADE_DURATION && timeLeft > 0 && !isCrossfading && nextTrackCandidate) {
        console.log("Starting Crossfade to:", nextTrackCandidate.name);
        setIsCrossfading(true);
        nextAudio.src = nextTrackCandidate.path;
        nextAudio.volume = 0;
        nextAudio.play().catch(e => console.error("Next deck play failed", e));
      }

      // MANAGE CROSSFADE VOLUMES
      if (isCrossfading) {
        // Simple linear fade
        const rawProgress = (CROSSFADE_DURATION - timeLeft) / CROSSFADE_DURATION;
        const progress = Math.max(0, Math.min(1, rawProgress));

        activeAudio.volume = 1 - progress;
        nextAudio.volume = progress;

        // COMPLETE TRANSITION
        if (progress >= 0.99 || activeAudio.ended) {
          setIsCrossfading(false);
          setActiveDeck(activeDeck === 'A' ? 'B' : 'A');
          setCurrentTrack(nextTrackCandidate);

          activeAudio.pause();
          activeAudio.currentTime = 0;
          activeAudio.volume = 1; // Reset for next use
          nextAudio.volume = 1;
        }
      }

      fadeFrame = requestAnimationFrame(runCrossfade);
    };

    if (isPlaying) {
      fadeFrame = requestAnimationFrame(runCrossfade);
    }

    return () => cancelAnimationFrame(fadeFrame);
  }, [isPlaying, activeDeck, isCrossfading, currentTrack]);

  // Main Play/Pause Toggle
  const togglePlay = () => {
    const deck = activeDeck === 'A' ? deckARef.current : deckBRef.current;
    if (!deck) return;

    if (isPlaying) {
      deck.pause();
      setIsPlaying(false);
      // Analytics: End Session
      const duration = (Date.now() - (startTime || Date.now())) / 1000;
      sendAnalyticsEvent('pause', { duration });
      setStartTime(null);
    } else {
      deck.play().catch(e => console.error(e));
      setIsPlaying(true);
      setStartTime(Date.now());
      sendAnalyticsEvent('play', { track: currentTrack?.name });
    }
  };

  const playTrack = (track: AudioTrack) => {
    if (currentTrack?.path === track.path) {
      togglePlay();
      return;
    }

    // Reset Sequence for manual click
    setIsCrossfading(false);
    if (deckARef.current) { deckARef.current.pause(); deckARef.current.volume = 1; }
    if (deckBRef.current) { deckBRef.current.pause(); deckBRef.current.volume = 1; }

    // Always restart on Deck A for simplicity on manual select
    const targetDeck = 'A';
    setActiveDeck(targetDeck);
    setCurrentTrack(track);
    setIsPlaying(true);
    setStartTime(Date.now());
    sendAnalyticsEvent('play_manual', { track: track.name });

    if (deckARef.current) {
      deckARef.current.src = track.path;
      deckARef.current.currentTime = 0;
      deckARef.current.play();
    }
  };

  const handleDeckEnd = () => {
    // Fallback: If track ends naturally without triggering crossfade (e.g. short track), move to next hard
    if (!isCrossfading) {
      const next = getNextTrack(currentTrack);
      if (next) {
        playTrack(next);
      } else {
        setIsPlaying(false);
        setStartTime(null);
        sendAnalyticsEvent('album_complete');
      }
    }
  };

  const currentTrackName = currentTrack ? currentTrack.name : "STANDBY MODE";

  return (
    <main className="h-screen bg-black text-white font-['Helvetica'] selection:bg-[#00ff00] selection:text-black overflow-hidden flex flex-col overscroll-none fixed inset-0">
      {/* Dual Audio Engine */}
      <audio ref={deckARef} onEnded={handleDeckEnd} className="hidden" />
      <audio ref={deckBRef} onEnded={handleDeckEnd} className="hidden" />

      {/* Massive Brand Banner - Cut off at top */}
      <div className="flex-none pt-0 -mt-6 md:-mt-12 px-4 border-b border-gray-800 z-10 relative bg-black">
        <h1 className="text-[13vw] md:text-[22vw] leading-[0.7] font-black tracking-tighter text-white uppercase text-center block w-full select-none overflow-hidden h-auto md:h-[14vw] py-2 md:py-0">
          IL RAVEN
        </h1>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">

        {/* LEFT: Persistent Raven Generator */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-800 relative bg-[#050505] overflow-hidden group cursor-pointer"
          onClick={() => { generateRaven(); sendAnalyticsEvent('raven_regenerate'); }}
        >
          {/* Rotated Label - Centered Vertically on Left Edge */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 origin-left ml-6 z-20 pointer-events-none">
            <span className="text-[10px] font-bold text-white tracking-widest uppercase whitespace-nowrap">
              Visual Frequency /// Tap to Regenerate
            </span>
          </div>

          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="relative w-full h-full aspect-square">
              {LAYER_ORDER.map((layerKey, index) => {
                const fileName = ravenLayers[layerKey];
                if (!fileName) return null;
                return (
                  <Image
                    key={layerKey}
                    src={`/raven-assets/${layerKey}/${fileName}`}
                    alt={layerKey}
                    fill
                    className="object-contain"
                    priority
                    style={{ zIndex: index }}
                  />
                );
              })}
            </div>
          </div>

          <div className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity pointer-events-none" />
        </div>


        {/* RIGHT: Dynamic Content */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black flex flex-col">

          <AnimatePresence mode="wait">
            {!showAudio ? (
              /* STATE 1: Intro / Slogan */
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Text Section - 50% Height */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-start bg-black border-b border-gray-800">
                  <div className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.85] tracking-tighter text-gray-600 space-y-2 select-none origin-left">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-gray-500">THESE ARE</span>
                      <span className="bg-white text-black px-2">NOT</span>
                    </div>
                    <span className="bg-white text-black px-2 inline-block">
                      TOKENS.
                    </span>
                    <div className="pt-2 flex flex-wrap items-baseline gap-3 text-gray-500">
                      <span>THIS IS</span>
                      <span className="bg-white text-black px-2">MUSIC.</span>
                    </div>
                  </div>
                </div>

                {/* Action Button - 50% Height */}
                <button
                  onClick={() => { setShowAudio(true); sendAnalyticsEvent('access_audio_click'); }}
                  className="flex-1 bg-black text-white hover:bg-[#00ff00] hover:text-black transition-colors p-8 md:p-12 flex flex-col justify-center gap-4 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between w-full mt-auto mb-auto">
                    <div className="flex items-center gap-8 md:gap-12">
                      <span className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-none text-left">ACCESS<br />AUDIO</span>
                      {/* FontAwesome Solid Arrow Right (Standard Icon) */}
                      <svg viewBox="0 0 448 512" className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 shrink-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </motion.div>
            ) : (
              /* STATE 2: Audio Player */
              <motion.div
                key="audio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 bg-[#0a0a0a] text-white overflow-y-auto"
              >
                <div className="p-8 md:p-12 min-h-full flex flex-col">
                  {/* Controls Header */}
                  <div className="flex justify-between items-start mb-12 border-b border-gray-800 pb-6">
                    <div>
                      <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-[0.85] md:leading-none break-words">THIS IS <br className="md:hidden" />MUSIC</h2>
                    </div>
                    <button onClick={() => setShowAudio(false)} className="p-2 hover:bg-white hover:text-black rounded-full transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Now Playing Widget */}
                  <div className="mb-12 bg-[#111] p-6 border border-gray-800 flex items-center gap-6 sticky top-0 z-10 shadow-2xl">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 bg-[#00ff00] text-black flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
                    >
                      {isPlaying ? <Pause fill="black" size={32} /> : <Play fill="black" size={32} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#00ff00] mb-1 uppercase tracking-widest">Running Process</div>
                      <div className="text-xl md:text-2xl font-black truncate tracking-tight text-white">
                        {currentTrackName}
                      </div>
                    </div>
                  </div>

                  {/* Track Sections */}
                  <div className="space-y-16 pb-12">

                    {/* Digital Files */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div>
                        <h3 className="text-xs font-bold text-gray-500 mb-6 uppercase border-b border-gray-800 pb-2">001 /// Genesis_Logs</h3>
                        <ul className="space-y-3">
                          {data.genesis.map((t) => (
                            <li key={t.path}>
                              <button
                                onClick={() => playTrack(t)}
                                className={`text-sm font-bold uppercase hover:text-[#00ff00] text-left w-full truncate ${currentTrack?.path === t.path ? 'text-[#00ff00]' : 'text-gray-300'}`}
                              >
                                {t.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-500 mb-6 uppercase border-b border-gray-800 pb-2">002 /// Evidence_B-Roll</h3>
                        <ul className="space-y-3">
                          {data.broll.map((t) => (
                            <li key={t.path}>
                              <button
                                onClick={() => playTrack(t)}
                                className={`text-sm font-bold uppercase hover:text-[#00ff00] text-left w-full truncate ${currentTrack?.path === t.path ? 'text-[#00ff00]' : 'text-gray-300'}`}
                              >
                                {t.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* The Album */}
                    <div>
                      <h3 className="text-4xl md:text-6xl font-black uppercase mb-8 text-white tracking-tighter">The<br />Album</h3>

                      <div className="grid grid-cols-1 gap-12">
                        {/* Side A */}
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <span className="bg-white text-black text-xs font-black px-3 py-1 uppercase tracking-wider">Side A</span>
                            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">// The Ascension</span>
                          </div>
                          <div className="divide-y divide-gray-800 border-t border-gray-800">
                            {data.sideA.map((t, i) => (
                              <button
                                key={t.path}
                                onClick={() => playTrack(t)}
                                className={`w-full text-left py-4 flex items-center gap-6 group hover:bg-[#111] transition-colors px-2 ${currentTrack?.path === t.path ? 'bg-[#111]' : ''}`}
                              >
                                <span className={`font-mono text-xs ${currentTrack?.path === t.path ? 'text-[#00ff00]' : 'text-gray-600'}`}>0{i + 1}</span>
                                <span className={`text-lg md:text-xl font-bold uppercase ${currentTrack?.path === t.path ? 'text-[#00ff00]' : 'text-white group-hover:text-white'}`}>
                                  {t.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Side B */}
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <span className="bg-white text-black text-xs font-black px-3 py-1 uppercase tracking-wider">Side B</span>
                            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">// The Descent</span>
                          </div>
                          <div className="divide-y divide-gray-800 border-t border-gray-800">
                            {data.sideB.map((t, i) => (
                              <button
                                key={t.path}
                                onClick={() => playTrack(t)}
                                className={`w-full text-left py-4 flex items-center gap-6 group hover:bg-[#111] transition-colors px-2 ${currentTrack?.path === t.path ? 'bg-[#111]' : ''}`}
                              >
                                <span className={`font-mono text-xs ${currentTrack?.path === t.path ? 'text-[#00ff00]' : 'text-gray-600'}`}>0{i + 1}</span>
                                <span className={`text-lg md:text-xl font-bold uppercase ${currentTrack?.path === t.path ? 'text-[#00ff00]' : 'text-white group-hover:text-white'}`}>
                                  {t.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
