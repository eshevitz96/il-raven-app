'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

import audioManifest from '../data/audio-manifest.json';

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

export default function Home() {
  const [phase, setPhase] = useState<'signal' | 'archive' | 'sanctuary'>('signal');
  const [data, setData] = useState<AudioData>(audioManifest);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Flatten Side A and Side B for continuous playback
  const albumPlaylist = useMemo(() => {
    return [...data.sideA, ...data.sideB];
  }, [data]);


  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const playTrack = (track: AudioTrack) => {
    if (currentTrack?.path === track.path) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTrackEnd = () => {
    if (!currentTrack || !data) {
      setIsPlaying(false);
      return;
    }

    // Check if current track is in the album playlist
    const currentIndex = albumPlaylist.findIndex(t => t.path === currentTrack.path);

    if (currentIndex !== -1 && currentIndex < albumPlaylist.length - 1) {
      // Play next song in album
      setCurrentTrack(albumPlaylist[currentIndex + 1]);
      setIsPlaying(true);
    } else {
      // End of playlist or track not in playlist (e.g. genesis/broll)
      setIsPlaying(false);
    }
  };

  const handleMainPlayPause = () => {
    if (!currentTrack) {
      // If no track selected, start Side A first track
      if (data && data.sideA.length > 0) {
        setCurrentTrack(data.sideA[0]);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-bold tracking-tight overflow-hidden selection:bg-black selection:text-white">
      <audio
        ref={audioRef}
        src={currentTrack?.path}
        onEnded={handleTrackEnd}
        className="hidden"
        preload="auto"
      />

      {/* Hidden preloader for gapless transitions */}
      <audio
        ref={(el) => {
          if (el && currentTrack && albumPlaylist.length > 0) {
            const currentIndex = albumPlaylist.findIndex(t => t.path === currentTrack.path);
            if (currentIndex !== -1 && currentIndex < albumPlaylist.length - 1) {
              el.src = albumPlaylist[currentIndex + 1].path;
              el.load(); // Force buffer
            }
          }
        }}
        preload="auto"
        className="hidden"
        muted
      />

      {/* Fixed Layout Elements - "The Album Cover Frame" */}
      <div className="fixed top-8 left-8 md:top-12 md:left-12 z-50 mix-blend-difference text-white pointer-events-none font-['Helvetica']">
        <h1 className="text-sm md:text-base font-black tracking-widest">COMMON INTELLECTUAL</h1>
      </div>
      <div className="fixed top-8 right-8 md:top-12 md:right-12 z-50 text-right mix-blend-difference text-white pointer-events-none font-['Helvetica']">
        <h2 className="text-sm md:text-base font-black tracking-widest">CREATORS</h2>
      </div>
      <div className="fixed bottom-8 left-8 md:bottom-12 md:left-12 z-50 mix-blend-difference text-white pointer-events-none font-['Helvetica']">
        <h3 className="text-sm md:text-base font-black tracking-widest">PRESENTS</h3>
      </div>
      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50 text-right mix-blend-difference text-white pointer-events-none font-['Helvetica']">
        <h3 className="text-sm md:text-base font-black tracking-widest">ILL RAVEN AUDIO</h3>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'signal' && (
          <motion.div
            key="signal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen w-full flex flex-col items-center justify-center relative cursor-cell"
            onClick={() => setPhase('archive')}
          >
            {/* The Signal Layer: Stark White & The Bird */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative w-64 h-96 md:w-[500px] md:h-[700px] grayscale contrast-125 select-none"
            >
              <Image
                src="/images/cover_theme.jpg"
                alt="The Raven"
                fill
                className="object-contain mix-blend-multiply"
                priority
              />
            </motion.div>

            <p className="absolute bottom-24 text-xs font-mono animate-pulse text-dim">[ CLICK TO INITIATE ]</p>
          </motion.div>
        )}

        {phase === 'archive' && (
          <motion.div
            key="archive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-32 pb-32 px-8 md:px-32 max-w-7xl mx-auto bg-white"
          >
            {/* The Archive Layer: Clinical Dossier */}
            <div className="border-b-2 border-black mb-12 pb-4 flex justify-between items-end">
              <span className="text-4xl md:text-6xl font-black uppercase">Archive.01</span>
              <button
                onClick={() => setPhase('sanctuary')}
                className="text-sm border-2 border-black px-6 py-2 hover:bg-black hover:text-white transition-all uppercase font-bold"
              >
                Proceed to Audio &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
              <div>
                <h4 className="text-xs font-mono mb-6 text-dim uppercase border-b border-gray-200 pb-2">{'/// GENESIS_LOGS'}</h4>
                <ul className="space-y-4">
                  {data?.genesis.map((track) => (
                    <li key={track.path}>
                      <button
                        onClick={() => playTrack(track)}
                        className="group flex items-center gap-4 w-full text-left hover:pl-2 transition-all"
                      >
                        <span className="w-4 h-4 rounded-full border border-black flex items-center justify-center flex-shrink-0">
                          {currentTrack?.path === track.path && isPlaying && <div className="w-2 h-2 bg-black rounded-full animate-ping" />}
                        </span>
                        <span className="text-lg font-bold uppercase truncate">{track.name.split('.')[0]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-mono mb-6 text-dim uppercase border-b border-gray-200 pb-2">{'/// EVIDENCE_B_ROLL'}</h4>
                <ul className="space-y-4">
                  {data?.broll.map((track) => (
                    <li key={track.path}>
                      <button
                        onClick={() => playTrack(track)}
                        className="group flex items-center gap-4 w-full text-left hover:pl-2 transition-all"
                      >
                        <span className="w-4 h-4 rounded-full border border-black flex items-center justify-center flex-shrink-0">
                          {currentTrack?.path === track.path && isPlaying && <div className="w-2 h-2 bg-black rounded-full animate-ping" />}
                        </span>
                        <span className="text-lg font-bold uppercase truncate">{track.name.split('.')[0]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'sanctuary' && (
          <motion.div
            key="sanctuary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col md:flex-row"
          >
            {/* The Sanctuary Layer: Vinyl / Tape Aesthetic */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-white relative px-12 pb-12 pt-32 md:p-12">
              <motion.div
                className="relative w-full aspect-square max-w-lg border-4 border-black flex items-center justify-center overflow-hidden bg-white z-10"
              >
                <Image
                  src="/images/cover_theme.jpg"
                  alt="Cover"
                  fill
                  className="object-contain opacity-20 mix-blend-multiply pointer-events-none"
                />

                <div className="relative z-10 text-center w-full h-full flex flex-col items-center justify-center p-6">
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 md:w-56 md:h-56 rounded-full border-[8px] md:border-[12px] border-black mx-auto mb-6 flex items-center justify-center bg-white"
                  >
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-black rounded-full" />
                  </motion.div>

                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 line-clamp-3 leading-tight">
                    {currentTrack ? currentTrack.name.replace(/\.[^/.]+$/, "") : "STANDBY"}
                  </h2>
                  <div className="flex justify-center gap-4 mt-2">
                    <button onClick={handleMainPlayPause} className="hover:scale-110 transition-transform">
                      {isPlaying ? <Pause strokeWidth={2.5} size={48} /> : <Play strokeWidth={2.5} size={48} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-8 md:p-12 border-t-2 md:border-t-0 md:border-l-2 border-black min-h-0 bg-white">
              <div className="flex items-center gap-4 mb-12 sticky top-0 bg-white z-20 pb-4 border-b border-black md:border-b-0 md:pb-0">
                <button
                  onClick={() => setPhase('archive')}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all"
                  aria-label="Return to Archive"
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Audio Album I <span className="text-dim text-sm block md:inline">{'// Sanctuary'}</span></h3>
              </div>

              <div className="mb-16">
                <h3 className="text-4xl font-black mb-6 uppercase tracking-tight">Side A <span className="text-base font-normal normal-case block md:inline text-dim ml-2">{'// The Ascension'}</span></h3>
                <div className="flex flex-col gap-0 border-b-2 border-black">
                  {data?.sideA.map((track, i) => (
                    <button
                      key={track.path}
                      onClick={() => playTrack(track)}
                      className={`w-full text-left py-4 px-2 border-t-2 border-black flex justify-between items-center hover:bg-black hover:text-white transition-colors group ${currentTrack?.path === track.path ? 'bg-black text-white' : ''}`}
                    >
                      <span className="font-bold uppercase text-lg">{track.name.replace(/\.[^/.]+$/, "")}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">PLAY</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-4xl font-black mb-6 uppercase tracking-tight">Side B <span className="text-base font-normal normal-case block md:inline text-dim ml-2">{'// The Descent'}</span></h3>
                <div className="flex flex-col gap-0 border-b-2 border-black">
                  {data?.sideB.map((track, i) => (
                    <button
                      key={track.path}
                      onClick={() => playTrack(track)}
                      className={`w-full text-left py-4 px-2 border-t-2 border-black flex justify-between items-center hover:bg-black hover:text-white transition-colors group ${currentTrack?.path === track.path ? 'bg-black text-white' : ''}`}
                    >
                      <span className="font-bold uppercase text-lg">{track.name.replace(/\.[^/.]+$/, "")}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">PLAY</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

