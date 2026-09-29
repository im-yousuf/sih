/**
 * Wellbore3D — animated wellbore cross-section (light theme).
 *
 * Light-theme changes:
 *  • <color> sets scene bg to #faf8f5.
 *  • Grid uses dark stone lines visible on the white canvas.
 *  • Casing / Tubing shifted to dark navy-steel for strong contrast.
 *  • SuckerRod uses deep steel-blue emissive instead of cyan.
 *  • DepthMarker keeps high-contrast cyan (emissive always pops on any bg).
 *  • Depth label text uses dark stone (#44403c).
 *  • Legend / depth-readout overlays use white bg + dark text.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Bounds, useBounds } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useDigitalTwinStore } from '../store/digitalTwinStore';

export interface Wellbore3DProps { selectedDepth: number }

const WELL_DEPTH_M  = 1500;
const SLIDER_MAX_M  = 2000;
const SCENE_DEPTH   = 15;
const M2S           = SCENE_DEPTH / SLIDER_MAX_M;
const depthY        = (m: number) => -m * M2S;
const WELL_MID_Y    = depthY(WELL_DEPTH_M / 2);

const TUBING_R      = 0.40;
const CASING_R      = 0.80;
const OIL_N         = 60;
const STEAM_N       = 40;
const MARKER_LERP   = 0.12;

// Marker stays vivid cyan — emissive reads on any background
const MARKER_COLOR  = '#00c8e8';

// ── Depth marker ──────────────────────────────────────────────────────────────
function DepthMarker({ selectedDepth }: { selectedDepth: number }) {
  const innerRef  = useRef<THREE.Mesh>(null!);
  const outerRef  = useRef<THREE.Mesh>(null!);
  const innerMat  = useRef<THREE.MeshStandardMaterial>(null!);
  const outerMat  = useRef<THREE.MeshStandardMaterial>(null!);
  const sphereRef = useRef<THREE.Mesh>(null!);
  const targetY   = useRef(depthY(selectedDepth));

  useEffect(() => { targetY.current = depthY(selectedDepth); }, [selectedDepth]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    [innerRef, outerRef, sphereRef].forEach((r) => {
      if (r.current)
        r.current.position.y = THREE.MathUtils.lerp(
          r.current.position.y, targetY.current, MARKER_LERP,
        );
    });
    if (innerMat.current)
      innerMat.current.emissiveIntensity = 2.0 + 1.0 * Math.abs(Math.sin(t * 4.0));
    if (outerMat.current) {
      outerMat.current.emissiveIntensity = 0.8 + 0.8 * Math.abs(Math.sin(t * 1.5));
      outerMat.current.opacity           = 0.55 + 0.25 * Math.abs(Math.sin(t * 1.5));
    }
  });

  const initY = depthY(selectedDepth);
  return (
    <>
      <mesh ref={innerRef} position={[0, initY, 0]}>
        <torusGeometry args={[TUBING_R + 0.18, 0.055, 20, 100]} />
        <meshStandardMaterial ref={innerMat} color={MARKER_COLOR} emissive={MARKER_COLOR} emissiveIntensity={2.0} />
      </mesh>
      <mesh ref={outerRef} position={[0, initY, 0]}>
        <torusGeometry args={[CASING_R + 0.30, 0.04, 12, 100]} />
        <meshStandardMaterial ref={outerMat} color={MARKER_COLOR} emissive={MARKER_COLOR} emissiveIntensity={0.8} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh ref={sphereRef} position={[CASING_R + 0.6, initY, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={MARKER_COLOR} emissive={MARKER_COLOR} emissiveIntensity={2.0} />
      </mesh>
    </>
  );
}

// ── Casing — dark navy steel ──────────────────────────────────────────────────
function Casing({ depthM }: { depthM: number }) {
  const h = depthM * M2S;
  return (
    <mesh position={[0, depthY(depthM / 2), 0]}>
      <cylinderGeometry args={[CASING_R, CASING_R, h, 32]} />
      <meshStandardMaterial color="#1e3a5c" transparent opacity={0.55} wireframe />
    </mesh>
  );
}

// ── Tubing — deep steel-blue ──────────────────────────────────────────────────
function Tubing({ depthM }: { depthM: number }) {
  const h = depthM * M2S;
  return (
    <mesh position={[0, depthY(depthM / 2), 0]}>
      <cylinderGeometry args={[TUBING_R, TUBING_R, h, 32]} />
      <meshStandardMaterial color="#2a4a7a" transparent opacity={0.70} />
    </mesh>
  );
}

// ── Sucker rod — deep bronze-steel with subtle emissive ───────────────────────
function SuckerRod({ depthM, spm }: { depthM: number; spm: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const omega    = (2 * Math.PI * Math.max(spm, 0.5)) / 60;
  const stroke   = 0.25;
  useFrame(({ clock }) => {
    if (groupRef.current)
      groupRef.current.position.y = stroke * Math.sin(omega * clock.getElapsedTime());
  });

  const segs   = 20;
  const segH_M = depthM / segs;
  const segH_S = segH_M * M2S;

  return (
    <group ref={groupRef}>
      {Array.from({ length: segs }).map((_, i) => (
        <mesh key={i} position={[0, depthY(i * segH_M + segH_M / 2), 0]}>
          <cylinderGeometry args={[0.15, 0.15, segH_S, 12]} />
          <meshStandardMaterial
            color="#3a5a7a"
            emissive="#2a4a6a"
            emissiveIntensity={0.15}
            transparent
            opacity={0.92}
            metalness={0.70}
            roughness={0.30}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Pump — deep green, pulsing ────────────────────────────────────────────────
function Pump({ depthM, spm }: { depthM: number; spm: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const omega  = (2 * Math.PI * Math.max(spm, 0.5)) / 60;
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity =
        0.30 + 0.30 * Math.abs(Math.sin(omega * clock.getElapsedTime()));
  });
  return (
    <mesh position={[0, depthY(depthM), 0]}>
      <boxGeometry args={[0.6, 0.8, 0.6]} />
      <meshStandardMaterial ref={matRef} color="#1a7a40" emissive="#16a34a" emissiveIntensity={0.30} />
    </mesh>
  );
}

// ── Perforation zone — deep amber ─────────────────────────────────────────────
function PerforationZone({ depthM }: { depthM: number }) {
  return (
    <mesh position={[0, depthY(depthM), 0]}>
      <cylinderGeometry args={[1.2, 1.2, 0.5, 32]} />
      <meshStandardMaterial color="#d97706" transparent opacity={0.50} emissive="#d97706" emissiveIntensity={0.25} />
    </mesh>
  );
}

// ── Oil particles — amber ─────────────────────────────────────────────────────
function OilParticles({ flowRate }: { flowRate: number }) {
  const positions = useMemo(() => {
    const a = new Float32Array(OIL_N * 3);
    for (let i = 0; i < OIL_N; i++) {
      a[i*3]   = (Math.random()-0.5)*TUBING_R*1.2;
      a[i*3+1] = depthY(Math.random()*WELL_DEPTH_M);
      a[i*3+2] = (Math.random()-0.5)*TUBING_R*1.2;
    }
    return a;
  }, []);

  const geomRef = useRef<THREE.BufferGeometry>(null!);
  const speed   = 0.8 + flowRate * 0.04;

  useFrame((_, dt) => {
    if (!geomRef.current) return;
    const p = geomRef.current.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < OIL_N; i++) {
      p.array[i*3+1] += speed * dt;
      if (p.array[i*3+1] > 0.2) {
        p.array[i*3]   = (Math.random()-0.5)*TUBING_R*1.2;
        p.array[i*3+1] = depthY(WELL_DEPTH_M*0.95);
        p.array[i*3+2] = (Math.random()-0.5)*TUBING_R*1.2;
      }
    }
    p.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d97706" size={0.13} transparent opacity={0.90} sizeAttenuation />
    </points>
  );
}

// ── Steam particles ───────────────────────────────────────────────────────────
function SteamParticles({ active }: { active: boolean }) {
  const positions = useMemo(() => {
    const a = new Float32Array(STEAM_N * 3);
    for (let i = 0; i < STEAM_N; i++) {
      a[i*3]   = (Math.random()-0.5)*0.18;
      a[i*3+1] = depthY(Math.random()*WELL_DEPTH_M*0.8);
      a[i*3+2] = (Math.random()-0.5)*0.18;
    }
    return a;
  }, []);

  const geomRef = useRef<THREE.BufferGeometry>(null!);
  const matRef  = useRef<THREE.PointsMaterial>(null!);

  useFrame((_, dt) => {
    if (!geomRef.current) return;
    const p = geomRef.current.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < STEAM_N; i++) {
      p.array[i*3+1] -= 1.2 * dt;
      if (p.array[i*3+1] < depthY(WELL_DEPTH_M*0.9)) {
        p.array[i*3]   = (Math.random()-0.5)*0.18;
        p.array[i*3+1] = 0.05;
        p.array[i*3+2] = (Math.random()-0.5)*0.18;
      }
    }
    p.needsUpdate = true;
    if (matRef.current)
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, active ? 0.75 : 0, 0.05);
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} color="#0284c7" size={0.10} transparent opacity={active ? 0.75 : 0} sizeAttenuation />
    </points>
  );
}

// ── Depth markers — dark text ─────────────────────────────────────────────────
function DepthMarkers() {
  return (
    <group>
      {[0, 500, 1000, 1500, 2000].map((d) => (
        <group key={d} position={[2, depthY(d), 0]}>
          <Text fontSize={0.28} color="#44403c" anchorX="left" anchorY="middle">
            {d}m
          </Text>
          <mesh position={[-0.4, 0, 0]}>
            <boxGeometry args={[0.8, 0.04, 0.04]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── SceneContent ──────────────────────────────────────────────────────────────
function SceneContent({ selectedDepth }: Wellbore3DProps) {
  const api       = useBounds();
  const telemetry = useDigitalTwinStore((s) => s.telemetry);
  const spm       = telemetry?.spm       ?? 5.0;
  const flowRate  = telemetry?.flow_rate ?? 15.0;
  const steamRate = (telemetry as any)?.steam_injection_rate ?? 0;

  useEffect(() => { api.refresh().fit(); }, []);

  return (
    <>
      <Casing          depthM={1400} />
      <Tubing          depthM={1450} />
      <SuckerRod       depthM={1300} spm={spm} />
      <Pump            depthM={1300} spm={spm} />
      <PerforationZone depthM={1350} />
      <OilParticles    flowRate={flowRate} />
      <SteamParticles  active={steamRate > 1} />
      <DepthMarkers />
      <DepthMarker selectedDepth={selectedDepth} />
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function Wellbore3D({ selectedDepth }: Wellbore3DProps) {
  const telemetry   = useDigitalTwinStore((s) => s.telemetry);
  const steamActive = ((telemetry as any)?.steam_injection_rate ?? 0) > 1;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [6, WELL_MID_Y, 10], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        {/* Light scene background */}
        <color attach="background" args={['#faf8f5']} />

        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 12, 8]} intensity={1.4} color="#fff8f0" />
        <pointLight position={[10, 10, 10]}   intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#0284c7" />
        <pointLight position={[3, WELL_MID_Y, 5]} intensity={0.35} color={MARKER_COLOR} />

        {/* Dark grid — visible on light canvas */}
        <Grid
          args={[10, 10]}
          cellSize={1}      cellThickness={0.4} cellColor="#c8c0b4"
          sectionSize={5}   sectionThickness={0.8} sectionColor="#a09080"
          fadeDistance={30} fadeStrength={1}
          followCamera={false} infiniteGrid
        />

        <Bounds fit clip observe margin={1.2}>
          <SceneContent selectedDepth={selectedDepth} />
        </Bounds>

        <OrbitControls
          makeDefault
          target={[0, WELL_MID_Y, 0]}
          enableZoom enablePan enableRotate
          minDistance={3}
          maxDistance={40}
        />
      </Canvas>

      {/* Legend — white panel */}
      <div className="absolute top-4 left-4 bg-white border border-stone-200 shadow-md rounded-xl p-3">
        <p className="text-xs text-muted font-bold mb-2 uppercase tracking-wide">Legend</p>
        <div className="space-y-1.5">
          {[
            ['#1e3a5c', 'Casing'],
            ['#2a4a7a', 'Tubing'],
            ['#3a5a7a', 'Sucker Rod'],
            ['#1a7a40', 'Pump'],
            ['#d97706', 'Perforation Zone'],
            ['#d97706', '● Oil flow ↑'],
            [MARKER_COLOR, '◎ Depth Marker'],
            ...(steamActive ? [['#0284c7', '● Steam ↓']] : []),
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Depth readout — white panel */}
      <div className="absolute bottom-4 left-4 bg-white border border-stone-200 shadow-md rounded-xl p-3">
        <p className="text-xs text-muted font-bold uppercase tracking-wide">Selected Depth</p>
        <p className="text-sm font-bold font-mono mt-1" style={{ color: MARKER_COLOR }}>
          {selectedDepth}m
        </p>
      </div>
    </div>
  );
}
