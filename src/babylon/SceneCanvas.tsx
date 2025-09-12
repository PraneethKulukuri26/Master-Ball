import { useEffect, useRef, useState } from 'react';
import {
  Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3,
  MeshBuilder, Color3, StandardMaterial, PhysicsImpostor
} from 'babylonjs';
import 'babylonjs-loaders';
import 'babylonjs-materials';
import * as CANNON from 'cannon-es';
// @ts-ignore
(window as any).CANNON = CANNON;

export const SceneCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3); 
  const [gameOver, setGameOver] = useState(false);
  const invincibleRef = useRef(false);
  const aiCountRef = useRef(3);

  useEffect(() => {
    if (gameOver) return; // Stop game when over 🆕
    const canvas = canvasRef.current!;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);

    // Camera
    const camera = new ArcRotateCamera('camera', Math.PI / 2.5, Math.PI / 3, 18, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput');

    let cameraTarget = Vector3.Zero();

    // Lighting
    const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);

    // Physics
    scene.enablePhysics(new Vector3(0, -9.81, 0));

    // Ground
    const ground = MeshBuilder.CreateGround('ground', { width: 40, height: 40 }, scene);
    ground.position.y = -2;
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);

    // Walls
    const walls = [
      MeshBuilder.CreateBox('north', { width: 40, height: 3, depth: 0.5 }, scene),
      MeshBuilder.CreateBox('south', { width: 40, height: 3, depth: 0.5 }, scene),
      MeshBuilder.CreateBox('east', { width: 0.5, height: 3, depth: 40 }, scene),
      MeshBuilder.CreateBox('west', { width: 0.5, height: 3, depth: 40 }, scene),
    ];
    walls[0].position.set(0, -0.5, -20);
    walls[1].position.set(0, -0.5, 20);
    walls[2].position.set(20, -0.5, 0);
    walls[3].position.set(-20, -0.5, 0);
    walls.forEach(w => w.physicsImpostor = new PhysicsImpostor(w, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene));

    // Player Ball
    const sphere = MeshBuilder.CreateSphere('playerBall', { diameter: 1 }, scene);
    sphere.position.y = 4;
    sphere.material = new StandardMaterial('ballMat', scene);
    (sphere.material as StandardMaterial).diffuseColor = Color3.FromHexString('#ff8844');
    sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);

    // AI Balls
    let aiBalls: PhysicsImpostor[] = [];
    function spawnAIBall(idx: number) {
      const ai = MeshBuilder.CreateSphere(`aiBall_${idx}`, { diameter: 0.8 }, scene);
      ai.position.set((Math.random() - 0.5) * 10, 3, (Math.random() - 0.5) * 10);
      ai.material = new StandardMaterial(`aiMat_${idx}`, scene);
      (ai.material as StandardMaterial).diffuseColor = new Color3(0.2, 0.6, 1);
      ai.physicsImpostor = new PhysicsImpostor(ai, PhysicsImpostor.SphereImpostor, { mass: 0.8 }, scene);
      aiBalls.push(ai.physicsImpostor);
    }
    for (let i = 0; i < aiCountRef.current; i++) {
      spawnAIBall(i);
    }

    // Coin
    let coin: any = null;
    const coinMat = new StandardMaterial('coinMat', scene);
    coinMat.diffuseColor = new Color3(1, 0.84, 0);
    function spawnCoin() {
      if (coin) coin.dispose();
      coin = MeshBuilder.CreateCylinder('coin', { diameter: 0.6, height: 0.15 }, scene);
      coin.position.set((Math.random() - 0.5) * 36, -1.85, (Math.random() - 0.5) * 36);
      coin.rotation.x = Math.PI / 2;
      coin.material = coinMat;
    }
    spawnCoin();

    // Input
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => keys[e.key.toLowerCase()] = true;
    const onKeyUp = (e: KeyboardEvent) => keys[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Movement
    const moveForce = 6, maxSpeed = 10;
    scene.onBeforeRenderObservable.add(() => {
      if (!sphere.physicsImpostor) return;
      const dt = scene.getEngine().getDeltaTime() / 1000;
      const impostor = sphere.physicsImpostor;
      const vel = impostor.getLinearVelocity() ?? Vector3.Zero();
      let dir = Vector3.Zero();
      if (keys['w'] || keys['arrowup']) dir = dir.add(new Vector3(0, 0, 1));
      if (keys['s'] || keys['arrowdown']) dir = dir.add(new Vector3(0, 0, -1));
      if (keys['a'] || keys['arrowleft']) dir = dir.add(new Vector3(-1, 0, 0));
      if (keys['d'] || keys['arrowright']) dir = dir.add(new Vector3(1, 0, 0));
      if (!dir.equals(Vector3.Zero())) {
        dir = dir.normalize();
        const forward = camera.getForwardRay().direction;
        const camRight = Vector3.Cross(forward, Vector3.Up()).normalize();
        const camForward = Vector3.Cross(camRight, Vector3.Up()).normalize();
        const worldDir = camRight.scale(dir.x).add(camForward.scale(dir.z));
        impostor.applyImpulse(worldDir.scale(moveForce * dt), sphere.getAbsolutePosition());
      }
      const horizontalSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
      if (horizontalSpeed > maxSpeed) {
        const scale = maxSpeed / horizontalSpeed;
        vel.x *= scale; vel.z *= scale;
        impostor.setLinearVelocity(vel);
      }
    });

    // AI random movement
    let aiTime = 0;
    scene.onBeforeRenderObservable.add(() => {
      aiTime += scene.getEngine().getDeltaTime();
      if (aiTime > 1000) {
        aiTime = 0;
        aiBalls.forEach(im => {
          const impulse = new Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2);
          im.applyImpulse(impulse, im.object.getAbsolutePosition());
        });
      }
    });

    // Coin pickup and AI spawn on score
    const lastAICount = { value: aiCountRef.current };
    scene.onBeforeRenderObservable.add(() => {
      if (!coin) return;
      if (Vector3.DistanceSquared(sphere.position, coin.position) < 0.9) {
        setScore(s => {
          const newScore = s + 1;
          // Check if we need to add a new AI ball
          if (Math.floor(newScore / 3) > Math.floor(s / 3)) {
            aiCountRef.current++;
            spawnAIBall(aiBalls.length);
          }
          return newScore;
        });
        spawnCoin();
      } else coin.addRotation(0, 0.05, 0);
    });

    // 🆕 AI collision with player (with invincibility)
    scene.onBeforeRenderObservable.add(() => {
      if (invincibleRef.current) return;
      aiBalls.forEach(ai => {
        if (Vector3.DistanceSquared(sphere.position, ai.object.position) < 1.2) {
          setLives(l => {
            if (l > 1) {
              invincibleRef.current = true;
              setTimeout(() => { invincibleRef.current = false; }, 1000); // 1s invincibility
              return l - 1;
            }
            setGameOver(true); // lose all lives
            return 0;
          });
        }
      });
    });

    // Camera follow
    scene.onBeforeRenderObservable.add(() => {
      cameraTarget = Vector3.Lerp(cameraTarget, sphere.position, 0.15);
      camera.setTarget(cameraTarget);
    });

    // Resize
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    engine.runRenderLoop(() => scene.render());



    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      scene.dispose();
      engine.dispose();
    };
  }, [gameOver]); // 🆕 rerun when restarting

  // Restart handler 🆕
  const restartGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    invincibleRef.current = false;
    aiCountRef.current = 3;
  };

  return (
    <div style={{ position:'relative', flex:1, background:'#000' }}>
      <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
      
      {!gameOver && (
        <>
          <div style={{ position:'absolute', top:8, left:8, background:'rgba(0,0,0,0.5)', padding:'4px 8px', borderRadius:4, color:'#fff' }}>
            Score: {score} | Lives: {lives}
          </div>
          <div style={{ position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.4)', padding:'4px 8px', borderRadius:4, color:'#fff' }}>
            WASD / Arrows to roll<br/>Mouse wheel to zoom
          </div>
        </>
      )}

      {gameOver && (
        <div style={{
          position:'absolute', top:0, left:0, right:0, bottom:0,
          background:'rgba(0,0,0,0.8)', color:'#fff',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          fontFamily:'system-ui'
        }}>
          <h1>Game Over</h1>
          <p>Final Score: {score}</p>
          <button onClick={restartGame} style={{ marginTop:20, padding:'10px 20px', fontSize:16, borderRadius:6 }}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default SceneCanvas;
