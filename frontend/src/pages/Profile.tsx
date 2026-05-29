import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Music2, Clock, TrendingUp, LogOut, Edit2, Check, X } from 'lucide-react'
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
        setHistory((data as HistoryItem[]) ?? [])
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
        <div className="w-8 h-8 rounded-full border-2 border-purple-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8"
          style={{ boxShadow: '0 0 60px rgba(108,99,255,0.1)' }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6C63FF,#4F46E5)', boxShadow: '0 0 30px rgba(108,99,255,0.5)' }}
              >
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-bg-black" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {/* Display name + edit */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                {editingName ? (
                  <>
                    <input
                      value={nameVal}
                      onChange={e => setNameVal(e.target.value)}
                      className="glass rounded-lg px-3 py-1 text-white font-display font-semibold text-xl
                                 focus:outline-none border border-purple-primary/50 bg-transparent w-40"
                    />
                    <button onClick={saveName} className="text-emerald-400 hover:text-emerald-300 p-1">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingName(false); setNameVal(profile.display_name) }}
                            className="text-zinc-500 hover:text-white p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="text-xl font-display font-bold text-white">{profile.display_name}</h1>
                    <button onClick={() => setEditingName(true)} className="text-zinc-600 hover:text-purple-light transition-colors p-1">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <p className="text-purple-light font-display text-sm mb-1">@{profile.username}</p>
              <p className="text-zinc-500 text-xs">{user.email}</p>
            </div>

            {/* Sign out */}
            <button
              onClick={async () => { await signOut(); navigate('/') }}
              className="btn-ghost text-sm flex items-center gap-2 self-start"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/50">
            {[
              { icon: Music2,     label: 'Searches',  value: stats.searches },
              { icon: TrendingUp, label: 'Matches',   value: stats.matches  },
              { icon: User,       label: 'Accuracy',  value: `${stats.accuracy}%` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-purple-light" />
                  <span className="text-xs text-zinc-500 font-display">{label}</span>
                </div>
                <p className="text-2xl font-display font-bold gradient-text">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search history */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-light" />
            Recent searches
          </h2>

          {histLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-purple-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Music2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm font-display">No searches yet. Try identifying a song!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-hover rounded-xl px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.matched ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    <div>
                      {item.songs ? (
                        <>
                          <p className="text-sm font-display font-medium text-white">{item.songs.title}</p>
                          <p className="text-xs text-zinc-500">{item.songs.artist}</p>
                        </>
                      ) : (
                        <p className="text-sm font-display text-zinc-400">No match found</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.matched && (
                      <p className="text-xs font-display font-semibold text-purple-light">
                        {Math.round(item.confidence * 100)}%
                      </p>
                    )}
                    <p className="text-xs text-zinc-600">
                      {new Date(item.searched_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  )
}
