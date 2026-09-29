/**
 * PumpjackLights — canonical lighting rig for a LIGHT / white background.
 *
 * Key differences from the dark-mode rig:
 *  • Ambient intensity reduced (0.45 → 0.30) — a white background already
 *    provides plenty of fill; too much ambient washes out the model.
 *  • Key light intensity slightly increased (1.6 → 1.8) and kept warm-white
 *    so it casts clear, readable shadows on the pale canvas.
 *  • Fill light shifted to a neutral cool-white instead of blue — blue fill
 *    reads beautifully against dark backgrounds but looks cold on light ones.
 *  • Rim light intensity reduced slightly so it doesn't bleach the silhouette.
 *  • Ground bounce kept warm to lift the concrete pad colours naturally.
 */

export default function PumpjackLights() {
  return (
    <>
      {/* Ambient — kept low so shadows remain crisp on white canvas */}
      <ambientLight intensity={0.30} color="#f0ece8" />

      {/* Key light — warm white, upper front-right, main shadow caster */}
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.8}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-4}
      />

      {/* Fill light — neutral cool-white, upper rear-left */}
      <directionalLight
        position={[-10, 8, -6]}
        intensity={0.50}
        color="#e8eef4"
      />

      {/* Rim / back light — separates model silhouette from background */}
      <directionalLight
        position={[0, 4, -12]}
        intensity={0.30}
        color="#dce8f0"
      />

      {/* Ground bounce — warm, simulates light reflected off concrete pad */}
      <pointLight
        position={[0, -0.5, 2]}
        intensity={0.35}
        color="#c8b89a"
        distance={14}
        decay={2}
      />
    </>
  );
}
