import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileAudio, Loader2, AlertCircle } from 'lucide-react'
import { identifyFile, IdentifyResponse } from '../../lib/api'

interface Props {
  onResult: (data: IdentifyResponse) => void
}

type State = 'idle' | 'dragging' | 'uploading' | 'error'

export default function UploadZone({ onResult }: Props) {
  const [state,   setState]   = useState<State>('idle')
  const [error,   setError]   = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const process = async (file: File) => {
    setFileName(file.name)
    setState('uploading')
    setError(null)
    try {
      const data = await identifyFile(file)
      onResult(data)
      setState('idle')
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Upload failed')
      setState('error')
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setState('idle')
    const file = e.dataTransfer.files?.[0]
    if (file) process(file)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) process(file)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setState('dragging') }}
      onDragLeave={() => setState('idle')}
      onDrop={onDrop}
      onClick={() => state === 'idle' || state === 'error' ? inputRef.current?.click() : undefined}
      className={`relative flex flex-col items-center justify-center gap-4 p-8
                  rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
                  ${state === 'dragging'
                    ? 'border-purple-primary bg-purple-glow'
                    : state === 'error'
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-zinc-800 bg-white/[0.02] hover:border-purple-primary/50 hover:bg-white/[0.04]'
                  }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.flac,.webm,.m4a"
        className="hidden"
        onChange={onChange}
      />

      <AnimatePresence mode="wait">
        {state === 'uploading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="w-10 h-10 text-purple-primary animate-spin" />
            <p className="text-sm text-zinc-400 font-display">Analyzing <span className="text-white">{fileName}</span>...</p>
          </motion.div>
        ) : state === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-400 font-display text-center">{error}</p>
            <p className="text-xs text-zinc-500">Click to try again</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-glow flex items-center justify-center">
              {state === 'dragging'
                ? <FileAudio className="w-7 h-7 text-purple-light" />
                : <Upload    className="w-7 h-7 text-purple-primary" />
              }
            </div>
            <div className="text-center">
              <p className="text-sm font-display font-medium text-white">
                {state === 'dragging' ? 'Drop it!' : 'Drop audio file here'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">MP3, WAV, OGG, FLAC, WebM</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
