import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, ChevronDown, Music } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Track = { title: string; composer: string; url: string }

const TRACKS: Track[] = [
  {
    title: 'Ave Maria',
    composer: 'Schubert',
    url: 'https://archive.org/download/ave-maria-instrumental-schubert/Ave%20Maria%20(Instrumental)%20%5BSchubert%5D.mp3',
  },
  {
    title: 'The Swan',
    composer: 'Saint-Saëns',
    url: 'https://archive.org/download/Saint-saensCarnivalOfTheAnimalsTheSwanmaisky/13TheSwan.mp3',
  },
  {
    title: 'Hungarian Dance No. 5',
    composer: 'Brahms',
    url: 'https://archive.org/download/classical-music-mix-by-various-artists/04%20-%20Brahms%20-%20Hungarian%20Dance%20No.%205.mp3',
  },
  {
    title: 'The Entertainer',
    composer: 'Scott Joplin',
    url: 'https://archive.org/download/TheEntertainerJoplin/The%20Entertainer.mp3',
  },
  {
    title: "Jesu, Joy of Man's Desiring",
    composer: 'J.S. Bach',
    url: "https://archive.org/download/02BachJesuJoyOfMansDesiring/02%20Bach_%20Jesu%2C%20Joy%20Of%20Man%27s%20Desiring.mp3",
  },
  {
    title: 'Clarinet Concerto (Adagio)',
    composer: 'Mozart',
    url: 'https://archive.org/download/WolfgangAmadeusMozartClarinetConcertoInAMajorK.622II.Adagio/Wolfgang%20Amadeus%20Mozart%20-%20Clarinet%20concerto%20in%20A%20major%2C%20K.%20622%20II.%20Adagio.mp3',
  },
  {
    title: 'Für Elise',
    composer: 'Beethoven',
    url: 'https://archive.org/download/classical-music-mix-by-various-artists/18%20-%20Beethoven%20-%20Fur%20Elise%20(Original).mp3',
  },
  {
    title: 'Siegfried Idyll',
    composer: 'Wagner',
    url: 'https://archive.org/download/WAGNERSiegfriedIdyll-Weingartner-NEWTRANSFER/Wagner-SiegfriedIdyll.mp3',
  },
]

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function EqBars() {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: '14px' }}>
      {([0, 1, 2] as const).map(i => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: 'linear-gradient(to top, #8B5CF6, #06B6D4)' }}
          animate={{ height: ['3px', '14px', '5px', '11px', '3px'] }}
          transition={{ duration: 1.4, delay: i * 0.22, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

type Status = 'loading' | 'needs-click' | 'playing'

export default function BackgroundMusicPlayer() {
  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const playlistRef = useRef<Track[]>(fisherYates(TRACKS))
  const indexRef    = useRef(0)

  const [track,       setTrack]       = useState<Track>(playlistRef.current[0])
  const [status,      setStatus]      = useState<Status>('loading')
  const [isMuted,     setIsMuted]     = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.volume = 0.28
    audioRef.current = audio

    const advance = () => {
      let next = indexRef.current + 1
      if (next >= playlistRef.current.length) {
        playlistRef.current = fisherYates(TRACKS)
        next = 0
      }
      indexRef.current = next
      const t = playlistRef.current[next]
      audio.src = t.url
      setTrack(t)
      audio.play().catch(() => {})
    }

    audio.addEventListener('ended', advance)
    audio.addEventListener('error', advance)

    audio.src = playlistRef.current[0].url
    audio.play()
      .then(() => setStatus('playing'))
      .catch(() => setStatus('needs-click'))

    return () => {
      audio.removeEventListener('ended', advance)
      audio.removeEventListener('error', advance)
      audio.pause()
      audio.src = ''
    }
  }, [])

  const handleClickToPlay = () => {
    audioRef.current?.play()
      .then(() => setStatus('playing'))
      .catch(() => {})
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !isMuted
    setIsMuted(v => !v)
  }

  if (status === 'loading') return null

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <AnimatePresence mode="wait">

        {status === 'needs-click' && (
          <motion.button
            key="needs-click"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onClick={handleClickToPlay}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/50 border border-purple-500/20 backdrop-blur-xl hover:border-purple-500/50 hover:text-white/75 transition-all duration-200 cursor-pointer"
            style={{ background: 'rgba(139,92,246,0.08)' }}
          >
            <Music size={11} className="text-purple-400/70" />
            Play background music
          </motion.button>
        )}

        {status === 'playing' && isMinimized && (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMinimized(false)}
            title={`${track.title} — ${track.composer}`}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-white/[0.08] backdrop-blur-xl hover:border-purple-500/30 transition-colors duration-200 cursor-pointer"
            style={{ background: 'rgba(14,12,28,0.8)' }}
          >
            {isMuted
              ? <VolumeX size={14} className="text-white/35" />
              : <EqBars />
            }
          </motion.button>
        )}

        {status === 'playing' && !isMinimized && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 pl-4 pr-2 py-[11px] rounded-2xl border border-white/[0.08] backdrop-blur-xl"
            style={{ background: 'rgba(14,12,28,0.82)', minWidth: '215px', maxWidth: '265px' }}
          >
            {/* Equalizer / mute indicator */}
            <div className="flex-shrink-0 w-[18px] flex justify-center items-center">
              {isMuted
                ? <VolumeX size={13} className="text-white/25" />
                : <EqBars />
              }
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 mb-[3px]">
                Now Playing
              </p>
              <p className="text-[13px] font-medium text-white/85 truncate leading-tight">
                {track.title}
              </p>
              <p className="text-[11px] leading-tight mt-[1px]"
                 style={{ color: 'rgba(139,92,246,0.65)' }}>
                {track.composer}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center flex-shrink-0 ml-1">
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/[0.07] transition-colors duration-150 cursor-pointer"
              >
                {isMuted
                  ? <VolumeX size={12} className="text-white/35" />
                  : <Volume2 size={12} className="text-white/55" />
                }
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize"
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/[0.07] transition-colors duration-150 cursor-pointer"
              >
                <ChevronDown size={12} className="text-white/35" />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
