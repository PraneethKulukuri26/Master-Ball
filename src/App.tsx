import { SceneCanvas } from './babylon/SceneCanvas';

export default function App() {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <header style={{ padding:'8px 12px', background:'#161b22', borderBottom:'1px solid #30363d' }}>
        <strong>Master Ball</strong>
      </header>
      <SceneCanvas />
    </div>
  );
}
