import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Edit2, Check, X, LogOut, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageWrapper from '../components/layout/PageWrapper'

interface HistoryItem {
  id:          string
  confidence:  number
  matched:     boolean
  note_count:  number
  searched_at: string
  songs?:      { title: string; artist: string } | null
}

function ConfBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? '#34D399' : pct >= 40 ? '#F59E0B' : '#F472B6'
  return (
    <div className="h-0.5 rounded-full bg-border flex-1">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

export default function Profile() {
  const { user, profile, signOut, loading } = useAuth()
  const navigate = useNavigate()

  const [history,     setHistory]     = useState<HistoryItem[]>([])
  const [histLoading, setHistLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameVal,     setNameVal]     = useState('')

  useEffect(() => {
    if (!loading && !user) navigate('/auth')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    supabase
      .from('search_history')
      .select('id, confidence, matched, note_count, searched_at, songs(title, artist)')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setHistory((data as unknown as HistoryItem[]) ?? [])
        setHistLoading(false)
      })
  }, [user])

  useEffect(() => {
    if (profile) setNameVal(profile.display_name)
  }, [profile])

  const saveName = async () => {
    if (!user || !nameVal.trim()) return
    await supabase.from('profiles').update({ display_name: nameVal }).eq('id', user.id)
    setEditingName(false)
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const stats = {
    searches: history.length,
    matches:  history.filter(h => h.matched).length,
    accuracy: history.length
      ? Math.round((history.filter(h => h.matched).length / history.length) * 100)
      : 0,
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-violet animate-spin" />
      </div>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="section-label">user profile</p>
          <h1 className="font-display font-extrabold text-4xl text-white">
            Command <span className="gradient-text">Center</span>
          </h1>
        </motion.div>

        {/* ── PROFILE CARD ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neon-card p-6"
          style={{ boxShadow: '0 0 40px rgba(139,92,246,0.08)' }}
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                boxShadow: '0 0 24px rgba(139,92,246,0.5)',
              }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              {/* Display name */}
              <div className="flex items-center gap-2 mb-1">
                {editingName ? (
                  <>
                    <input
                      value={nameVal}
                      onChange={e => setNameVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                      className="font-display font-bold text-lg text-white bg-transparent border-b border-violet focus:outline-none w-full max-w-xs"
                      autoFocus
                    />
                    <button onClick={saveName} className="text-neon-green hover:opacity-80">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingName(false)} className="text-neon-pink hover:opacity-80">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-lg text-white truncate">{profile.display_name}</h2>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-muted hover:text-white transition-colors shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-violet">@{profile.username}</span>
                <span className="font-mono text-xs text-muted">{user.email}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-2 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </motion.div>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: stats.searches, label: 'Searches',  sub: 'total scans' },
            { value: stats.matches,  label: 'Matches',   sub: 'songs found' },
            { value: `${stats.accuracy}%`, label: 'Accuracy', sub: 'match rate' },
          ].map(({ value, label, sub }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="stat-card"
            >
              <div className="stat-value gradient-text">{value}</div>
              <div className="font-display font-semibold text-xs text-white">{label}</div>
              <div className="font-mono text-[10px] text-muted">{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── HISTORY ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <p className="section-label">Search history</p>

          {histLoading ? (
            <div className="panel rounded-xl py-12 flex justify-center">
              <Loader2 className="w-5 h-5 text-violet animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="panel rounded-xl py-12 text-center space-y-2">
              <p className="font-display font-semibold text-white text-sm">No searches yet</p>
              <p className="font-mono text-xs text-muted">Start identifying music to see your history here.</p>
            </div>
          ) : (
            <div className="panel rounded-xl overflow-hidden divide-y" style={{ borderColor: 'rgba(45,43,78,0.6)' }}>
              {history.map((item, i) => {
                const pct = Math.round(item.confidence * 100)
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.03 }}
                    className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Match icon */}
                    <div className="shrink-0">
                      {item.matched
                        ? <CheckCircle2 className="w-4 h-4 text-neon-green" />
                        : <XCircle className="w-4 h-4 text-neon-pink" />
                      }
                    </div>

                    {/* Song info */}
                    <div className="flex-1 min-w-0">
                      {item.matched && item.songs ? (
                        <>
                          <div className="font-display font-semibold text-sm text-white truncate">{item.songs.title}</div>
                          <div className="font-mono text-[11px] text-muted">{item.songs.artist}</div>
                        </>
                      ) : (
                        <div className="font-display text-sm text-muted italic">No match found</div>
                      )}
                    </div>

                    {/* Confidence + bar */}
                    <div className="flex items-center gap-3 shrink-0">
                      <ConfBar pct={pct} />
                      <span className="font-mono text-xs text-muted w-9 text-right">{pct}%</span>
                    </div>

                    {/* Date */}
                    <div className="font-mono text-[10px] text-muted shrink-0">
                      {new Date(item.searched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>
    </PageWrapper>
  )
}
