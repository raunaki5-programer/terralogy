import { useState, useRef, useEffect } from 'react'

const API = 'https://terralogy-api-v2.onrender.com'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [chat, setChat] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat])

  const send = async () => {
    if (!msg.trim()) return
    const userMsg = msg
    setChat(p => [...p, { role: 'user', content: userMsg }])
    setMsg('')
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/ai/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language: 'en' })
      })
      const d = await r.json()
      setChat(p => [...p, { role: 'assistant', content: d.response || 'Thinking...' }])
    } catch { setChat(p => [...p, { role: 'assistant', content: 'Connection error' }]) }
    setLoading(false)
  }

  const suggestions = ['Weather forecast', 'Soil health tips', 'Crop advice', 'Mandi prices', 'Govt schemes', 'Pest control']

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)} title="AI Assistant">
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>🌾 AI Farm Assistant</span>
            <button className="btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-body">
            {chat.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <p className="text-muted" style={{ marginBottom: 12 }}>Ask me anything about farming!</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  {suggestions.map(s => (
                    <button key={s} className="btn btn-sm btn-ghost" onClick={() => { setMsg(s); send() }}>{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              chat.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  <div className="chat-bubble">{m.content}</div>
                </div>
              ))
            )}
            {loading && <div className="chat-msg assistant"><div className="chat-bubble"><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /></div></div>}
            <div ref={bottom} />
          </div>
          <div className="chat-footer">
            <input className="form-input" placeholder="Ask about crops, weather, soil..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="btn btn-primary btn-sm" onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </>
  )
}
