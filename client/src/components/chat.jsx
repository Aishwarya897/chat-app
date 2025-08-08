import React, { useEffect, useRef, useState } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
const HISTORY_HTTP = import.meta.env.VITE_HISTORY_URL || 'http://localhost:3000/history'

export default function Chat({ username }) {
  const [ws, setWs] = useState(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    setWs(socket)

    socket.addEventListener('open', () => {
      setConnected(true)
      console.log('WS open')
    })

    socket.addEventListener('message', (ev) => {
      try {
        const parsed = JSON.parse(ev.data)
        if (parsed.type === 'history') {
          setMessages(parsed.data || [])
        } else if (parsed.type === 'message') {
          setMessages((m) => [...m, parsed.data])
        }
      } catch (err) {
        console.error('Invalid WS message', err)
      }
    })

    socket.addEventListener('close', () => {
      setConnected(false)
      console.log('WS closed')
    })

    socket.addEventListener('error', (e) => {
      console.error('WS error', e)
    })

    return () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    if (messages.length === 0) {
      fetch(HISTORY_HTTP)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length) setMessages(data)
        })
        .catch(() => {})
    }
  }, [])

  function sendMessage() {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return
    const payload = { type: 'message', user: username, text: input.trim() }
    ws.send(JSON.stringify(payload))
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="chat-root">
      <div className="chat-header">
        <div>Connected: {connected ? 'Yes' : 'No'}</div>
        <div className="user-badge">{username}</div>
      </div>

      <div className="message-list" ref={listRef}>
        {messages.map((m) => (
          <div key={m.id} className={msg ${m.user === username ? 'mine' : ''}}>
            <div className="meta">
              <strong>{m.user}</strong>
              <span className="time">{new Date(m.ts).toLocaleString()}</span>
            </div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        {messages.length === 0 && <div className="empty">No messages yet — say hi 👋</div>}
      </div>

      <div className="composer">
        <input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}
