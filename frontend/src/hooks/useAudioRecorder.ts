import { useRef, useState, useCallback } from 'react'
import { identifyAudio, IdentifyResponse } from '../lib/api'

export type RecordState = 'idle' | 'requesting' | 'recording' | 'processing' | 'result' | 'error'

interface UseAudioRecorderReturn {
  state:          RecordState
  result:         IdentifyResponse | null
  error:          string | null
  analyser:       AnalyserNode | null
  duration:       number
  start:          () => Promise<void>
  stop:           () => Promise<void>
  reset:          () => void
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state,    setState]    = useState<RecordState>('idle')
  const [result,   setResult]   = useState<IdentifyResponse | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [duration, setDuration] = useState(0)

  const recorderRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const streamRef    = useRef<MediaStream | null>(null)
  const audioCtxRef  = useRef<AudioContext | null>(null)
  const timerRef     = useRef<number | null>(null)

  const start = useCallback(async () => {
    try {
      setState('requesting')
      setError(null)
      setResult(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Web Audio API for real-time visualizer
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 128
      analyserNode.smoothingTimeConstant = 0.8
      source.connect(analyserNode)
      setAnalyser(analyserNode)

      // MediaRecorder for audio capture
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start(250)  // collect chunks every 250ms
      setState('recording')

      // Duration counter
      setDuration(0)
      timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000)

    } catch (e: any) {
      setError(e.message ?? 'Microphone access denied')
      setState('error')
    }
  }, [])

  const stop = useCallback(async () => {
    if (!recorderRef.current) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setState('processing')

    await new Promise<void>(resolve => {
      recorderRef.current!.onstop = () => resolve()
      recorderRef.current!.stop()
    })

    // Clean up stream + audio context
    streamRef.current?.getTracks().forEach(t => t.stop())
    setAnalyser(null)
    audioCtxRef.current?.close()

    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const data = await identifyAudio(blob)
      setResult(data)
      setState('result')
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e.message ?? 'Identification failed'
      setError(msg)
      setState('error')
    }
  }, [])

  const reset = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    if (timerRef.current) clearInterval(timerRef.current)
    setAnalyser(null)
    setState('idle')
    setResult(null)
    setError(null)
    setDuration(0)
  }, [])

  return { state, result, error, analyser, duration, start, stop, reset }
}
