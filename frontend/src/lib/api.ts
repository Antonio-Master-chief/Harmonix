import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function blobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioCtx = new AudioContext()
  let audioBuffer: AudioBuffer
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  } finally {
    audioCtx.close()
  }

  const numChannels = audioBuffer.numberOfChannels
  const length = audioBuffer.length
  const sampleRate = audioBuffer.sampleRate

  const mono = new Float32Array(length)
  for (let ch = 0; ch < numChannels; ch++) {
    const ch_data = audioBuffer.getChannelData(ch)
    for (let i = 0; i < length; i++) mono[i] += ch_data[i] / numChannels
  }

  const pcm = new Int16Array(length)
  for (let i = 0; i < length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]))
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }

  const dataLen = pcm.byteLength
  const buf = new ArrayBuffer(44 + dataLen)
  const v = new DataView(buf)
  const w = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)) }

  w(0, 'RIFF'); v.setUint32(4, 36 + dataLen, true)
  w(8, 'WAVE'); w(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  w(36, 'data'); v.setUint32(40, dataLen, true)
  new Int16Array(buf, 44).set(pcm)

  return new Blob([buf], { type: 'audio/wav' })
}

export const api = axios.create({ baseURL: BASE, timeout: 60_000 })

export interface MatchResult {
  song_id:       string
  title:         string
  artist:        string
  album?:        string
  genre?:        string
  confidence:    number
  dtw_distance:  number
  votes:         number
  fine_votes:    number
  skip_votes:    number
  contour_score: number
  chroma_score:  number
}

export interface IdentifyResponse {
  match:              MatchResult | null
  message?:           string
  key_detected:       { key: string; root: string; mode: string; confidence: number }
  notes_detected:     number
  intervals_detected: number
  debug?:             { candidates_voted: number; candidates_ranked: number }
}

export interface Song {
  id:         string
  title:      string
  artist:     string
  album?:     string
  genre?:     string
  duration?:  number
  note_count?: number
  created_at: string
}

export async function identifyAudio(blob: Blob): Promise<IdentifyResponse> {
  const wav = await blobToWav(blob)
  const form = new FormData()
  form.append('audio', wav, 'recording.wav')
  const { data } = await api.post<IdentifyResponse>('/identify', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function identifyFile(file: File): Promise<IdentifyResponse> {
  const form = new FormData()
  form.append('audio', file)
  const { data } = await api.post<IdentifyResponse>('/identify', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function fetchLibrary(limit = 100, offset = 0): Promise<Song[]> {
  const { data } = await api.get('/library', { params: { limit, offset } })
  return data.songs
}
