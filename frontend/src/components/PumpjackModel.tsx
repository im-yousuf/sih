/**
 * PumpjackModel — single source of truth for the animated pumpjack.
 *
 * Colour palette updated for the LIGHT theme canvas.
 * ──────────────────────────────────────────────────
 * All colours are shifted toward darker, higher-contrast industrials so
 * every part reads clearly against a white/off-white background:
 *
 *   STEEL_DARK    #1a2530   very dark blue-steel  (base, posts, counterweight)
 *   STEEL_MID     #263545   dark slate-blue       (motor housing, web details)
 *   CONCRETE      #6b7280   medium grey           (pad — readable on white)
 *   YELLOW_SAFETY #c47a0a   deep amber-gold       (beam, pivot — safety yellow
 *                                                   darkened for white bg)
 *   STEEL_CHROME  #8a9ba8   pewter/steel          (polished rod)
 *   CRANK_GREEN   #1a7a40   deep forest green     (crank disk)
 *   CRANK_ORANGE  #b85c1a   deep burnt-orange     (crank arm)
 *   HORSEHEAD_BLU #1a5a8c   deep navy-blue        (horsehead casting)
 *   PITMAN_SILVER #5a6b7a   dark gunmetal         (pitman arm)
 *   PIN_RED       #c0392b   deep crimson          (crank pin)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Linkage geometry ──────────────────────────────────────────────────────
export const PIVOT_Y    =  5.5;
export const PIVOT_X    =  0.0;
export const CRANK_X    = -1.2;
export const CRANK_Y    =  1.2;
export const CRANK_R    =  0.9;
export const PITMAN_L   =  3.5;
export const BEAM_BACK  =  1.8;
export const BEAM_FRONT =  2.2;
const ROD_LEN_DEFAULT   = 10.0;

// ─── Dark-industrial colour tokens ─────────────────────────────────────────
const C = {
  steelDark:    '#1a2530',   // very dark blue-steel
  steelMid:     '#263545',   // dark slate-blue
  concrete:     '#6b7280',   // medium grey pad
  yellow:       '#c47a0a',   // deep amber-gold safety paint
  chrome:       '#8a9ba8',   // pewter polished-rod
  crankGreen:   '#1a7a40',   // deep forest green
  crankOrange:  '#b85c1a',   // deep burnt-orange
  horsehead:    '#1a5a8c',   // deep navy-blue
  pitman:       '#5a6b7a',   // dark gunmetal
  pinRed:       '#c0392b',   // deep crimson
} as const;

export interface PumpjackModelProps {
  spm:        number;
  rodLength?: number;
}

export default function PumpjackModel({
  spm,
  rodLength = ROD_LEN_DEFAULT,
}: PumpjackModelProps) {
  const crankRef  = useRef<THREE.Group>(null!);
  const pitmanRef = useRef<THREE.Mesh>(null!);
  const beamRef   = useRef<THREE.Group>(null!);
  const horseRef  = useRef<THREE.Group>(null!);
  const rodRef    = useRef<THREE.Mesh>(null!);

  const omega = (2 * Math.PI * Math.max(spm, 0.5)) / 60;

  useFrame(({ clock }) => {
    const t     = clock.getElapsedTime();
    const theta = omega * t;

    if (crankRef.current) crankRef.current.rotation.z = -theta;

    const cpX = CRANK_X + CRANK_R * Math.cos(theta + Math.PI / 2);
    const cpY = CRANK_Y + CRANK_R * Math.sin(theta + Math.PI / 2);

    let alpha = beamRef.current ? beamRef.current.rotation.z : 0;
    for (let k = 0; k < 4; k++) {
      const bx  = PIVOT_X - BEAM_BACK * Math.cos(alpha);
      const by  = PIVOT_Y - BEAM_BACK * Math.sin(alpha);
      const dx  = bx - cpX;
      const dy  = by - cpY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const err = len - PITMAN_L;
      const dbx =  BEAM_BACK * Math.sin(alpha);
      const dby = -BEAM_BACK * Math.cos(alpha);
      const dL  = (dx * dbx + dy * dby) / (len + 1e-9);
      alpha    -= (err / (dL + 1e-9)) * 0.5;
    }
    alpha = Math.max(-0.5, Math.min(0.5, alpha));

    if (beamRef.current) beamRef.current.rotation.z = alpha;

    const tipY = PIVOT_Y + BEAM_FRONT * Math.sin(alpha);
    if (horseRef.current) horseRef.current.position.y = tipY - 0.3;
    if (rodRef.current)   rodRef.current.position.y   = tipY - rodLength / 2;

    if (pitmanRef.current) {
      const bx  = PIVOT_X - BEAM_BACK * Math.cos(alpha);
      const by  = PIVOT_Y - BEAM_BACK * Math.sin(alpha);
      pitmanRef.current.position.set((cpX + bx) / 2, (cpY + by) / 2, 0);
      pitmanRef.current.rotation.z =
        Math.atan2(by - cpY, bx - cpX) + Math.PI / 2;
      pitmanRef.current.scale.y =
        Math.sqrt((bx - cpX) ** 2 + (by - cpY) ** 2) / PITMAN_L;
    }
  });

  return (
    <group>
      {/* ── Concrete base pad ─────────────────────────────────────────────── */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[3.6, 0.3, 2.8]} />
        <meshStandardMaterial color={C.concrete} roughness={0.90} metalness={0.05} />
      </mesh>

      {/* ── Steel skid frame ──────────────────────────────────────────────── */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3.2, 0.7, 2.4]} />
        <meshStandardMaterial color={C.steelDark} roughness={0.65} metalness={0.55} />
      </mesh>

      {/* ── Sampson post (A-frame legs) ───────────────────────────────────── */}
      {[0.5, -0.5].map((z) => (
        <mesh key={z} position={[CRANK_X - 0.1, (CRANK_Y + 0.4) / 2 + 0.4, z]}>
          <boxGeometry args={[0.22, CRANK_Y + 0.4, 0.22]} />
          <meshStandardMaterial color={C.steelDark} roughness={0.50} metalness={0.60} />
        </mesh>
      ))}
      {/* Cross-brace */}
      <mesh position={[CRANK_X - 0.1, CRANK_Y + 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.1, 8]} />
        <meshStandardMaterial color={C.steelMid} metalness={0.65} />
      </mesh>

      {/* ── Pivot / centre post ───────────────────────────────────────────── */}
      <mesh position={[PIVOT_X, PIVOT_Y / 2 + 0.4, 0]}>
        <boxGeometry args={[0.22, PIVOT_Y, 0.22]} />
        <meshStandardMaterial color={C.steelDark} roughness={0.50} metalness={0.60} />
      </mesh>
      {[-0.4, 0.4].map((z) => (
        <mesh key={z} position={[PIVOT_X, 2.5, z]} rotation={[0, 0, 0.3 * Math.sign(z)]}>
          <boxGeometry args={[0.12, 2.5, 0.12]} />
          <meshStandardMaterial color={C.steelMid} metalness={0.55} />
        </mesh>
      ))}

      {/* ── Crank assembly ────────────────────────────────────────────────── */}
      <group ref={crankRef} position={[CRANK_X, CRANK_Y, 0]}>
        {/* Crank disk */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[CRANK_R + 0.14, CRANK_R + 0.14, 0.22, 36]} />
          <meshStandardMaterial color={C.crankGreen} roughness={0.25} metalness={0.75} />
        </mesh>
        {/* Crank arm */}
        <mesh position={[0, CRANK_R / 2, 0]}>
          <boxGeometry args={[0.14, CRANK_R, 0.16]} />
          <meshStandardMaterial color={C.crankOrange} metalness={0.80} roughness={0.20} />
        </mesh>
        {/* Crank pin */}
        <mesh position={[0, CRANK_R, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.28, 16]} />
          <meshStandardMaterial
            color={C.pinRed} emissive={C.pinRed} emissiveIntensity={0.25}
            metalness={0.85} roughness={0.15}
          />
        </mesh>
        {/* Balance counterweight */}
        <mesh position={[0, -CRANK_R * 0.65, 0.08]}>
          <boxGeometry args={[0.55, CRANK_R * 0.85, 0.28]} />
          <meshStandardMaterial color={C.steelDark} metalness={0.60} roughness={0.45} />
        </mesh>
        {/* Axle stub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.55, 16]} />
          <meshStandardMaterial color={C.chrome} metalness={0.90} roughness={0.10} />
        </mesh>
      </group>

      {/* ── Pitman arm ────────────────────────────────────────────────────── */}
      <mesh ref={pitmanRef} position={[CRANK_X, (CRANK_Y + PIVOT_Y) / 2, 0]}>
        <cylinderGeometry args={[0.065, 0.065, PITMAN_L, 10]} />
        <meshStandardMaterial color={C.pitman} metalness={0.70} roughness={0.30} />
      </mesh>

      {/* ── Walking beam ──────────────────────────────────────────────────── */}
      <group ref={beamRef} position={[PIVOT_X, PIVOT_Y, 0]}>
        {/* Pivot journal */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.5, 20]} />
          <meshStandardMaterial color={C.yellow} metalness={0.80} roughness={0.20} />
        </mesh>
        {/* Beam body */}
        <mesh position={[(BEAM_FRONT - BEAM_BACK) / 2, 0, 0]}>
          <boxGeometry args={[BEAM_FRONT + BEAM_BACK, 0.20, 0.28]} />
          <meshStandardMaterial color={C.yellow} metalness={0.45} roughness={0.40} />
        </mesh>
        {/* Web detail */}
        <mesh position={[(BEAM_FRONT - BEAM_BACK) / 2, 0, 0]}>
          <boxGeometry args={[BEAM_FRONT + BEAM_BACK, 0.10, 0.10]} />
          <meshStandardMaterial color={C.steelMid} metalness={0.55} />
        </mesh>

        {/* ── Horsehead casting ──────────────────────────────────────────── */}
        <group ref={horseRef} position={[BEAM_FRONT, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.75, 1.0, 0.32]} />
            <meshStandardMaterial color={C.horsehead} metalness={0.60} roughness={0.35} />
          </mesh>
          <mesh position={[0.1, -0.52, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.32, 20, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color={C.horsehead} metalness={0.60} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.62, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.36, 12]} />
            <meshStandardMaterial
              color={C.yellow} emissive={C.yellow} emissiveIntensity={0.10}
              metalness={0.85} roughness={0.15}
            />
          </mesh>
        </group>
      </group>

      {/* ── Polished rod (pewter chrome) ──────────────────────────────────── */}
      <mesh ref={rodRef} position={[PIVOT_X + BEAM_FRONT, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, rodLength, 14]} />
        <meshStandardMaterial
          color={C.chrome} metalness={0.92} roughness={0.08}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* ── Stuffing box ──────────────────────────────────────────────────── */}
      <mesh position={[PIVOT_X + BEAM_FRONT, 0.65, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.38, 18]} />
        <meshStandardMaterial color={C.yellow} metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[PIVOT_X + BEAM_FRONT, 0.47, 0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.08, 18]} />
        <meshStandardMaterial color={C.steelMid} metalness={0.70} roughness={0.30} />
      </mesh>

      {/* ── Motor / gearbox ───────────────────────────────────────────────── */}
      <mesh position={[-2.5, 0.95, 0]}>
        <boxGeometry args={[0.95, 0.70, 0.90]} />
        <meshStandardMaterial color={C.steelMid} roughness={0.60} metalness={0.45} />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((x) => (
        <mesh key={x} position={[-2.5 + x, 1.32, 0]}>
          <boxGeometry args={[0.06, 0.08, 0.92]} />
          <meshStandardMaterial color={C.steelDark} metalness={0.55} />
        </mesh>
      ))}
      {/* V-belt pulley */}
      <mesh position={[-1.85, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 24]} />
        <meshStandardMaterial color={C.crankOrange} metalness={0.75} roughness={0.20} />
      </mesh>
    </group>
  );
}
