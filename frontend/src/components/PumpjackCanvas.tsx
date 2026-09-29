/**
 * PumpjackCanvas — compact canvas for the Pump Control page (light theme).
 *
 * Light-theme changes:
 *  • <color> primitive sets the scene background to #faf8f5 (matches UI).
 *  • StudioFloor uses a warm light-stone surface instead of dark metal.
 *  • Grid lines are dark stone so they're visible on the white canvas.
 *  • Atmosphere point lights toned down (they were meant to glow on dark bg).
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds, useBounds, Grid } from '@react-three/drei';
import { useEffect } from 'react';

import PumpjackModel, { PIVOT_Y } from './PumpjackModel';
import PumpjackLights from './PumpjackLights';

const ROD_LEN_SHORT  = 5.5;
const PUMPJACK_MID_Y = 3.0;

// ---------------------------------------------------------------------------
// Studio floor — warm light-stone surface for the light background
// ---------------------------------------------------------------------------
function StudioFloor() {
  return (
    <>
      {/* Main floor plate — light warm stone */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[18, 0.04, 18]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.90} metalness={0.05} />
      </mesh>
      {/* Subtle grid lines — dark stone visible on light surface */}
      {[-4, -2, 0, 2, 4].flatMap((x) =>
        [-4, -2, 0, 2, 4].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.001, z]}>
            <boxGeometry args={[0.02, 0.001, 0.02]} />
            <meshStandardMaterial color="#c4bdb2" />
          </mesh>
        ))
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Atmosphere — very subtle warm accent lights near floor
// ---------------------------------------------------------------------------
function AtmosphereLights() {
  return (
    <>
      <pointLight position={[ 4, 0.3,  4]} intensity={0.06} color="#c8a060" distance={8} decay={2} />
      <pointLight position={[-4, 0.3, -3]} intensity={0.05} color="#8090a8" distance={8} decay={2} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Inner scene
// ---------------------------------------------------------------------------
function SceneContent({ spm }: { spm: number }) {
  const api = useBounds();
  useEffect(() => { api.refresh().fit(); }, []);

  return (
    <>
      <StudioFloor />
      <AtmosphereLights />
      <PumpjackModel spm={spm} rodLength={ROD_LEN_SHORT} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------
export default function PumpjackCanvas({ currentSpm }: { currentSpm: number }) {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 10], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Light scene background — matches the UI off-white */}
      <color attach="background" args={['#faf8f5']} />

      <PumpjackLights />

      {/* Dark grid — visible on the light canvas */}
      <Grid
        args={[20, 20]}
        cellSize={1}       cellThickness={0.4} cellColor="#c8c0b4"
        sectionSize={5}    sectionThickness={0.8} sectionColor="#a09080"
        fadeDistance={28}  fadeStrength={1}
        followCamera={false} infiniteGrid
      />

      <Bounds fit clip observe margin={1.20}>
        <SceneContent spm={currentSpm} />
      </Bounds>

      <OrbitControls
        makeDefault
        target={[0, PUMPJACK_MID_Y, 0]}
        enableZoom
        enablePan={false}
        enableRotate
        minDistance={3}
        maxDistance={25}
        autoRotate={false}
      />
    </Canvas>
  );
}
