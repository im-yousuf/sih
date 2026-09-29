/**
 * DigitalTwin3D — full-scene Dashboard canvas (light theme).
 *
 * Light-theme changes:
 *  • <color> sets bg to #faf8f5.
 *  • Grid uses dark stone lines (visible on white canvas).
 *  • Wellbore casing / tubing / sucker rod shifted to darker steel so they
 *    contrast sharply against the light background.
 *  • ReservoirLayers use deeper, more saturated colours so the geology reads
 *    clearly even without a dark backdrop.
 *  • Depth labels and tick marks switched to dark stone.
 *  • SPM readout and depth legend overlays use white panel / dark text.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Bounds, useBounds } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

import { useDigitalTwinStore } from '../store/digitalTwinStore';
import PumpjackModel, { PIVOT_X, BEAM_FRONT, PIVOT_Y } from './PumpjackModel';
import PumpjackLights from './PumpjackLights';

const ROD_LEN_FULL   = 10.0;
const PUMPJACK_MID_Y = 3.0;

// ---------------------------------------------------------------------------
// Wellbore — darker steels for white-background contrast
// ---------------------------------------------------------------------------
function Wellbore() {
  return (
    <group>
      {/* Casing — dark navy */}
      <mesh position={[0, -5, 0]}>
        <cylinderGeometry args={[0.50, 0.50, 10, 32]} />
        <meshStandardMaterial color="#1e3a5c" transparent opacity={0.55} />
      </mesh>
      {/* Tubing — deep steel-blue */}
      <mesh position={[0, -5, 0]}>
        <cylinderGeometry args={[0.30, 0.30, 10, 32]} />
        <meshStandardMaterial color="#2a4a7a" transparent opacity={0.70} />
      </mesh>
      {/* Sucker rod — dark chrome */}
      <mesh position={[0, -5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 10, 12]} />
        <meshStandardMaterial
          color="#6a7a8a" transparent opacity={0.80}
          metalness={0.85} roughness={0.15}
        />
      </mesh>
      {/* Downhole pump — deep green */}
      <mesh position={[0, -10, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.8]} />
        <meshStandardMaterial color="#1a6a35" metalness={0.65} roughness={0.35} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Reservoir layers — richer, more saturated for the light background
// ---------------------------------------------------------------------------
function ReservoirLayers() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity =
        0.20 + 0.15 * Math.sin(clock.getElapsedTime() * 1.5);
  });

  return (
    <group>
      {/* Overburden — saturated deep-blue */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[20, 0.5, 20]} />
        <meshStandardMaterial
          color="#2a4a7c" transparent opacity={0.35} depthWrite={false}
        />
      </mesh>
      {/* Reservoir band — rich dark navy */}
      <mesh position={[0, -3, 0]}>
        <boxGeometry args={[20, 2, 20]} />
        <meshStandardMaterial
          color="#1a3060" transparent opacity={0.30} depthWrite={false}
        />
      </mesh>
      {/* Production zone — deep amber, pulsing */}
      <mesh position={[0, -4, 0]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          ref={matRef}
          color="#d97706" transparent opacity={0.45} depthWrite={false}
          emissive="#d97706" emissiveIntensity={0.20}
        />
      </mesh>
      {/* Steam / thermal influence — deep red */}
      <mesh position={[0, -4, 0]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial
          color="#c0392b" transparent opacity={0.18} depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Depth markers — dark stone labels / ticks
// ---------------------------------------------------------------------------
function DepthMarkers() {
  const depths = [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000];
  return (
    <group>
      {depths.map((d) => (
        <group key={d} position={[8, -d / 250, 0]}>
          <Text fontSize={0.28} color="#44403c" anchorX="left" anchorY="middle">
            {d}m
          </Text>
          <mesh position={[-0.45, 0, 0]}>
            <boxGeometry args={[0.9, 0.04, 0.04]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// SceneContent
// ---------------------------------------------------------------------------
function SceneContent({ spm }: { spm: number }) {
  const api = useBounds();
  useEffect(() => { api.refresh().fit(); }, []);

  return (
    <>
      <ReservoirLayers />
      <Wellbore />
      <PumpjackModel spm={spm} rodLength={ROD_LEN_FULL} />
      <DepthMarkers />
    </>
  );
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------
export default function DigitalTwin3D() {
  const spm = useDigitalTwinStore((s) => s.telemetry?.spm ?? 5.0);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [12, 8, 12], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        {/* Light scene background */}
        <color attach="background" args={['#faf8f5']} />

        <PumpjackLights />

        {/* Dark grid — clearly visible on the white canvas */}
        <Grid
          args={[20, 20]}
          cellSize={1}      cellThickness={0.4} cellColor="#c8c0b4"
          sectionSize={5}   sectionThickness={0.8} sectionColor="#a09080"
          fadeDistance={30} fadeStrength={1}
          followCamera={false} infiniteGrid
        />

        <Bounds fit clip observe margin={1.15}>
          <SceneContent spm={spm} />
        </Bounds>

        <OrbitControls
          makeDefault
          target={[0, PUMPJACK_MID_Y, 0]}
          enableZoom enablePan enableRotate
          minDistance={4}
          maxDistance={60}
        />
      </Canvas>

      {/* SPM readout — white card, dark text */}
      <div className="absolute top-4 right-4 bg-white border border-stone-200 shadow-md rounded-xl px-3 py-2">
        <p className="text-xs text-muted font-medium">SPM</p>
        <p className="text-lg font-bold text-stone-900 font-mono">{spm.toFixed(1)}</p>
      </div>

      {/* Depth legend — white card */}
      <div className="absolute bottom-4 left-4 bg-white border border-stone-200 shadow-md rounded-xl p-4">
        <p className="text-xs text-muted font-bold mb-2 uppercase tracking-wide">Depth Scale</p>
        <div className="space-y-1.5">
          {[
            { color: '#2a4a7c', label: 'Surface'          },
            { color: '#d97706', label: 'Production Zone'  },
            { color: '#c0392b', label: 'Steam Influence'  },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
