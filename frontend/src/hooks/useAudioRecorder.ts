import { useRef, useState, useCallback } from 'react'
import { identifyAudio, IdentifyResponse } from '../lib/api'

export type RecordState = 'idle' | 'requesting' | 'recording' | 'processing' | 'result' | 'error'

const SILENCE_RMS_THRESHOLD = 0.015   // below this = silence (tunable)
const SILENCE_AUTO_STOP_MS  = 5000    // 5 s of silence → auto-stop
const CAN_STOP_AFTER_MS     = 3000    // unlock stop button after 3 s

interface UseAudioRecorderReturn {
  state:    RecordState
  result:   IdentifyResponse | null
  error:    string | null
  analyser: AnalyserNode | null
  duration: number
  canStop:  boolean
  start:    () => Promise<void>
  stop:     () => Promise<void>
  reset:    () => void
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state,    setState]    = useState<RecordState>('idle')
  const [result,   setResult]   = useState<IdentifyResponse | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [duration, setDuration] = useState(0)
  const [canStop,  setCanStop]  = useState(false)

  const recorderRef     = useRef<MediaRecorder | null>(null)
  const chunksRef       = useRef<Blob[]>([])
  const streamRef       = useRef<MediaStream | null>(null)
  const audioCtxRef     = useRef<AudioContext | null>(null)
  const silAnalyserRef  = useRef<AnalyserNode | null>(null)
  const timerRef        = useRef<number | null>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const canStopTimerRef = useRef<number | null>(null)
  const silenceStartRef = useRef<number | null>(null)
  const canStopRef      = useRef(false)
  const stoppingRef     = useRef(false)

  const stop = useCallback(async () => {
    if (!recorderRef.current || recorderRef.current.state !== 'recording') return
    if (stoppingRef.current) return
    stoppingRef.current = true

    if (timerRef.current)       { clearInterval(timerRef.current);       timerRef.current = null }
    if (silenceTimerRef.current) { clearInterval(silenceTimerRef.current); silenceTimerRef.current = null }
    if (canStopTimerRef.current) { clearTimeout(canStopTimerRef.current);  canStopTimerRef.current = null }
    silenceStartRef.current = null
    canStopRef.current      = false
    setCanStop(false)
    setState('processing')

    await new Promise<void>(resolve => {
      recorderRef.current!.onstop = () => resolve()
      recorderRef.current!.stop()
    })

    streamRef.current?.getTracks().forEach(t => t.stop())
    setAnalyser(null)
    silAnalyserRef.current = null
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
    } finally {
      stoppingRef.current = false
    }
  }, [])

  const start = useCallback(async () => {
    try {
      setState('requesting')
      setError(null)
      setResult(null)
      setCanStop(false)
      canStopRef.current = false

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)

      // Smoothed analyser for the waveform visualiser
      const visAnalyser = ctx.createAnalyser()
      visAnalyser.fftSize = 128
      visAnalyser.smoothingTimeConstant = 0.8
      source.connect(visAnalyser)
      setAnalyser(visAnalyser)

      // Unsmoothed analyser for silence detection — more accurate RMS
      const silAnalyser = ctx.createAnalyser()
      silAnalyser.fftSize = 512
      silAnalyser.smoothingTimeConstant = 0
      source.connect(silAnalyser)
      silAnalyserRef.current = silAnalyser

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder
      chunksRef.current   = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.start(250)
      setState('recording')

      setDuration(0)
      timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000)

      // Unlock stop button after CAN_STOP_AFTER_MS
      canStopTimerRef.current = window.setTimeout(() => {
        canStopRef.current      = true
        setCanStop(true)
        silenceStartRef.current = null  // start counting silence from unlock point
      }, CAN_STOP_AFTER_MS)

      // Silence detection — checked every 200 ms
      silenceStartRef.current = null
      silenceTimerRef.current = window.setInterval(() => {
        const node = silAnalyserRef.current
        if (!node) return

        const buf = new Float32Array(node.fftSize)
        node.getFloatTimeDomainData(buf)
        const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length)

        if (rms < SILENCE_RMS_THRESHOLD) {
          if (silenceStartRef.current === null) silenceStartRef.current = Date.now()
          else if (
            canStopRef.current &&
            Date.now() - silenceStartRef.current >= SILENCE_AUTO_STOP_MS
          ) {
            stop()
          }
        } else {
          silenceStartRef.current = null
        }
      }, 200)

    } catch (e: any) {
      setError(e.message ?? 'Microphone access denied')
      setState('error')
    }
  }, [stop])

  const reset = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    if (timerRef.current)       { clearInterval(timerRef.current);       timerRef.current = null }
    if (silenceTimerRef.current) { clearInterval(silenceTimerRef.current); silenceTimerRef.current = null }
    if (canStopTimerRef.current) { clearTimeout(canStopTimerRef.current);  canStopTimerRef.current = null }
    silenceStartRef.current = null
    silAnalyserRef.current  = null
    canStopRef.current      = false
    stoppingRef.current     = false
    setCanStop(false)
    setAnalyser(null)
    setState('idle')
    setResult(null)
    setError(null)
    setDuration(0)
  }, [])

  return { state, result, error, analyser, duration, canStop, start, stop, reset }
}
