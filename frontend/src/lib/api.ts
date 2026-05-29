import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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
  const form = new FormData()
  form.append('audio', blob, 'recording.webm')
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
