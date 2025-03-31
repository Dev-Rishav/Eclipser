// components/ContestEditor.js
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

export default function ContestEditor({ contestId }) {
  const [code, setCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    const client = new W3CWebSocket(
      `wss://yourdomain.com/ws/${contestId}`
    );
    
    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'leaderboard') {
        setLeaderboard(data.data);
      }
    };
    
    return () => client.close();
  }, [contestId]);

  return (
    <div className="contest-container">
      <div className="editor-section">
        <Editor
          height="70vh"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{ minimap: { enabled: false }}}
        />
        <button onClick={handleSubmit}>Submit Code</button>
      </div>
      
      <div className="leaderboard">
        <h3>Live Leaderboard</h3>
        {leaderboard.map(([userId, score], index) => (
          <div key={userId} className="leaderboard-entry">
            <span>#{index + 1}</span>
            <span>{userId}</span>
            <span>{score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}