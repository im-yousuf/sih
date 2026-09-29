/**
 * ReservoirVisualization — animated reservoir cross-section (light theme).
 *
 * Light-theme changes:
 *  • <color> sets scene bg to #faf8f5.
 *  • Grid uses dark stone lines.
 *  • Rock layers use a deeper, richer blue-grey so they read on white.
 *  • ThermalFront / ThermalWaves / PerforationGlow keep their vivid
 *    emission colours — they are bright enough to stand out on any bg.
 *  • Legend / overlay panels use white bg + dark text.
 *  • Ambient reduced slightly; extra warm directional added for depth.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Bounds, useBounds } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { useDigitalTwinStore } from '../store/digitalTwinStore';

// ── Temperature → colour (vivid — needs to pop on white bg) ─────────────────
function tempColor(temp: number): string {
  if (temp > 80) return '#ff2200';
  if (temp > 60) return '#ff8800';
  if (temp > 50) return '#e6a800';   // deeper gold instead of pure yellow
  if (temp > 45) return '#16a34a';   // forest green (was neon #00ff55)
  return '#0284c7';                  // ocean blue (was neon #00d4ff)
}

const _col = new THREE.Color();

// ── Rock layer — darker opacity for white bg ──────────────────────────────────
function RockLayer({
  position, scale, color = '#2a4a7c',
}: {
  position: [number, number, number];
  scale:    [number, number, number];
  color?:   string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.35}      // was 0.25 — slightly more opaque for light bg
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ── Production zone ───────────────────────────────────────────────────────────
function ProductionZone() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity = 0.35 + 0.20 * Math.sin(clock.getElapsedTime() * 1.5);
  });
  return (
    <mesh position={[0, -5, 0]}>
      <boxGeometry args={[6, 1, 6]} />
      <meshStandardMaterial
        ref={matRef}
        color="#d97706"
        transparent
        opacity={0.65}
        depthWrite={false}
        emissive="#d97706"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

// ── Thermal front ─────────────────────────────────────────────────────────────
function ThermalFront({ radius, temperature }: { radius: number; temperature: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef  = useRef<THREE.MeshStandardMaterial>(null!);
  const tempRef = useRef(temperature);
  useEffect(() => { tempRef.current = temperature; }, [temperature]);

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime();
    const hex = tempColor(tempRef.current);
    if (meshRef.current)
      meshRef.current.scale.setScalar(1.0 + 0.045 * Math.sin(t * 1.2));
    if (matRef.current) {
      _col.set(hex);
      matRef.current.color.copy(_col);
      matRef.current.emissive.copy(_col);
      matRef.current.emissiveIntensity = 1.6 + 0.30 * Math.sin(t * 1.2 + 0.8);
    }
  });

  const sceneRadius = Math.min(9, Math.max(1.5, radius * 0.35));

  return (
    <mesh ref={meshRef} position={[0, -4, 0]}>
      <sphereGeometry args={[sceneRadius, 32, 32]} />
      <meshStandardMaterial
        ref={matRef}
        color={tempColor(temperature)}
        transparent
        opacity={0.70}         // slightly more opaque — needed on light bg
        depthWrite={false}
        emissive={tempColor(temperature)}
        emissiveIntensity={1.6}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ── Thermal waves ─────────────────────────────────────────────────────────────
const WAVE_COUNT = 3;
const WAVE_MIN_R = 0.4;
const WAVE_MAX_R = 8.5;
const WAVE_SPEED = 0.55;
const WAVE_GAP   = (WAVE_MAX_R - WAVE_MIN_R) / WAVE_COUNT;

function ThermalWaves({ temperature }: { temperature: number }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const matRefs  = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null]);
  const waveR    = useRef(
    Array.from({ length: WAVE_COUNT }, (_, i) => WAVE_MIN_R + i * WAVE_GAP),
  );
  const tempRef  = useRef(temperature);
  useEffect(() => { tempRef.current = temperature; }, [temperature]);

  useFrame((_, dt) => {
    const hex = tempColor(tempRef.current);
    _col.set(hex);
    for (let i = 0; i < WAVE_COUNT; i++) {
      waveR.current[i] += WAVE_SPEED * dt;
      if (waveR.current[i] > WAVE_MAX_R) waveR.current[i] = WAVE_MIN_R;
      const progress = (waveR.current[i] - WAVE_MIN_R) / (WAVE_MAX_R - WAVE_MIN_R);
      const opacity  = 0.65 * (1 - progress);   // slightly higher for light bg
      const mesh = meshRefs.current[i];
      const mat  = matRefs.current[i];
      if (mesh) mesh.scale.setScalar(waveR.current[i]);
      if (mat)  {
        mat.color.copy(_col);
        mat.emissive.copy(_col);
        mat.opacity           = opacity;
        mat.emissiveIntensity = opacity * 0.9;
      }
    }
  });

  const initColor = tempColor(temperature);
  return (
    <>
      {Array.from({ length: WAVE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[0, -4, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1, 0.06, 12, 80]} />
          <meshStandardMaterial
            ref={(el) => { matRefs.current[i] = el; }}
            color={initColor}
            transparent
            opacity={0.55}
            depthWrite={false}
            emissive={initColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

// ── Perforation glow ──────────────────────────────────────────────────────────
function PerforationGlow() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity =
        0.6 + 0.6 * Math.abs(Math.sin(clock.getElapsedTime() * 2.0));
  });
  return (
    <mesh position={[0, -5, 0]}>
      <sphereGeometry args={[0.55, 16, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color="#16a34a"
        emissive="#16a34a"
        emissiveIntensity={0.6}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Well trajectory ───────────────────────────────────────────────────────────
function WellTrajectory() {
  const pts = useMemo(
    () => Array.from({ length: 11 }, (_, i) => new THREE.Vector3(0, -i, 0)),
    [],
  );
  // Dark stone line — visible on white bg
  return <Line points={pts} color="#44403c" lineWidth={2.5} />;
}

// ── Scene content ─────────────────────────────────────────────────────────────
function SceneContent({ radius, temperature }: { radius: number; temperature: number }) {
  const api = useBounds();
  useEffect(() => { api.refresh().fit(); }, []);

  return (
    <>
      {/* Rock layers — dark blue-grey, slightly more opaque for white bg */}
      <RockLayer position={[0, -0.25, 0]} scale={[20, 0.5, 20]} color="#2a4a7c" />
      <RockLayer position={[0, -2,    0]} scale={[20, 2,   20]} color="#1e3a6a" />
      <RockLayer position={[0, -4,    0]} scale={[20, 2,   20]} color="#1a3060" />
      <RockLayer position={[0, -7,    0]} scale={[20, 2,   20]} color="#152850" />

      <ProductionZone />
      <ThermalFront  radius={radius}      temperature={temperature} />
      <ThermalWaves  temperature={temperature} />
      <PerforationGlow />
      <WellTrajectory />
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function ReservoirVisualization() {
  const { reservoir } = useDigitalTwinStore();
  const thermalRadius = reservoir?.thermal_radius      ?? 10.0;
  const currentTemp   = reservoir?.current_temperature ?? 55.0;
  const MODEL_CENTRE_Y = -4;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [15, 5, 15], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        {/* Light scene background */}
        <color attach="background" args={['#faf8f5']} />

        {/* Lighting tuned for white background */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[10, 12, 8]}  intensity={1.4} color="#fff8f0" castShadow />
        <pointLight       position={[10, 10, 10]}  intensity={0.6} />
        <pointLight       position={[-10, -10, -10]} intensity={0.4} color="#ff6600" />
        <pointLight       position={[0, -4, 6]}    intensity={0.35} color="#ff8800" />

        {/* Dark grid for white canvas */}
        <Grid
          args={[20, 20]}
          cellSize={1}      cellThickness={0.4} cellColor="#c8c0b4"
          sectionSize={5}   sectionThickness={0.8} sectionColor="#a09080"
          fadeDistance={30} fadeStrength={1}
          followCamera={false} infiniteGrid
        />

        <Bounds fit clip observe margin={1.1}>
          <SceneContent radius={thermalRadius} temperature={currentTemp} />
        </Bounds>

        <OrbitControls
          makeDefault
          target={[0, MODEL_CENTRE_Y, 0]}
          enableZoom enablePan enableRotate
          minDistance={4}
          maxDistance={50}
        />
      </Canvas>

      {/* Legend — white panel */}
      <div className="absolute top-4 left-4 bg-white border border-stone-200 shadow-md rounded-xl p-3">
        <p className="text-xs text-muted font-bold mb-2 uppercase tracking-wide">Legend</p>
        <div className="space-y-1.5">
          {[
            ['#2a4a7c', 'Rock Layers'],
            ['#d97706', 'Production Zone'],
            ['#16a34a', 'Perforation Zone'],
            ['#44403c', 'Well Trajectory'],
            [tempColor(currentTemp), 'Thermal Front'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Thermal state overlay — white panel */}
      <div className="absolute bottom-4 left-4 bg-white border border-stone-200 shadow-md rounded-xl p-3 space-y-1">
        <p className="text-xs text-muted font-bold uppercase tracking-wide">Thermal Front</p>
        <p className="text-xs font-bold font-mono" style={{ color: tempColor(currentTemp) }}>
          T = {currentTemp.toFixed(1)}°C
        </p>
        <p className="text-xs font-mono text-stone-700">r = {thermalRadius.toFixed(1)} m</p>
      </div>
    </div>
  );
}
