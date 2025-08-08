import React, { useState } from 'react'
import Chat from './components/Chat'

export default function App() {
  const [username, setUsername] = useState('User' + Math.floor(Math.random()*900 + 100))
  const [joined, setJoined] = useState(false)

  return (
    <div className="app-root">
      {!joined ? (
        <div className="join-panel">
          <h1>React WebSocket Chat</h1>
          <label>
            Display name
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <button onClick={() => setJoined(true)}>Join Chat</button>
        </div>
      ) : (
        <Chat username={username} />
      )}
    </div>
  )
}
