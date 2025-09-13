
import { useState } from 'react';
import { SceneCanvas } from './babylon/SceneCanvas';

export default function App() {
  const [showRules, setShowRules] = useState(false);

  const rules = [
    '1. Use the arrow keys or WASD to move the ball.',
    '2. Move the mouse to look around.',
    '3. Collect coins to earn points.',
    '4. Avoid AI balls; colliding with them costs a life.',
    '5. You start with 3 lives; gain an extra life every 10 points.',
    '6. The game ends when you lose all your lives.',
    '7. For every 3 points scored, a new AI ball is added to increase the challenge.',
    '8. Have fun and try to beat your high score!'
  ];

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <header style={{ padding:'8px 12px', background:'#161b22', borderBottom:'1px solid #30363d', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <strong>Master Ball</strong>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setShowRules(true)}
            style={{ marginRight: '16px', padding: '6px 14px', background: '#238636', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
          >
            Show Game Rules
          </button>
          <a
            href="https://github.com/PraneethKulukuri26/Master-Ball.git"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#58a6ff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            aria-label="GitHub Repository"
          >
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>
      </header>
      {showRules && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(22,27,34,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#22272e', color: '#c9d1d9', padding: '32px 28px 20px 28px', borderRadius: '10px', minWidth: '320px', maxWidth: '90vw', boxShadow: '0 4px 32px #0008', position: 'relative' }}>
            <h2 style={{ marginTop: 0, marginBottom: '18px', fontWeight: 700 }}>Game Rules</h2>
            <ul style={{ paddingLeft: '20px', marginBottom: '18px' }}>
              {rules.map((rule, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{rule}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowRules(false)}
              style={{ padding: '6px 18px', background: '#238636', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <SceneCanvas />
    </div>
  );
}
