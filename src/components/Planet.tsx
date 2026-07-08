"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Grid } from "@react-three/drei";
import * as THREE from "three";

// ==========================================
// PREMIUM CINEMATIC MATERIALS
// ==========================================
const matSand = new THREE.MeshStandardMaterial({ color: "#5a1a08", roughness: 1.0, flatShading: true });
const matMetal = new THREE.MeshStandardMaterial({ color: "#aaaaaa", metalness: 0.9, roughness: 0.3 });
const matDarkMetal = new THREE.MeshStandardMaterial({ color: "#111111", metalness: 0.9, roughness: 0.2 });
const matGlass = new THREE.MeshPhysicalMaterial({ color: "#ff4400", transmission: 0.9, opacity: 1, transparent: true, roughness: 0.05, emissive: "#ff1100", emissiveIntensity: 0.4 });
const matWireframe = new THREE.MeshBasicMaterial({ color: "#222222", wireframe: true, transparent: true, opacity: 0.5 });
const matSolar = new THREE.MeshPhysicalMaterial({ color: "#0033ff", metalness: 1, roughness: 0.1, clearcoat: 1 });
const matNeonCyan = new THREE.MeshBasicMaterial({ color: "#00ffff" });
const matNeonOrange = new THREE.MeshBasicMaterial({ color: "#ff6600" });
const matPrestige = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffaa00", emissiveIntensity: 2 });

// Geometries (Instanced/Reused for performance)
const geoDome = new THREE.IcosahedronGeometry(1, 1);
const geoStrut = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
const geoPanel = new THREE.BoxGeometry(1.2, 0.8, 0.05);

function noise2D(x: number, y: number) {
  return Math.sin(x * 0.4) * Math.cos(y * 0.4) * 0.6 + Math.sin(x * 0.1 + y * 0.2) * 1.5;
}

export default function MarsColony({ commits = 0, repos = 0, stars = 0 }: { commits: number, repos: number, stars: number }) {
  
  // Colony Metrics
  const buildingCount = Math.max(10, repos * 5); 
  const colonyRadius = Math.max(5, Math.sqrt(repos) * 2.5); 
  const techLevel = commits < 50 ? 1 : commits < 300 ? 2 : commits < 1000 ? 3 : 4;
  const monumentHeight = Math.min(12, 2 + (stars * 0.1));

  // Generate Mars Terrain
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(120, 120, 60, 60);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, noise2D(x, z));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Generate Building Layout
  const layout = useMemo(() => {
    const points: { id: number, x: number, z: number, y: number, type: 'solar' | 'dome' | 'tower' | 'megatower' }[] = [];
    
    for (let i = 0; i < buildingCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 1.5) * colonyRadius; 
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = noise2D(x, z);

      let type: 'solar' | 'dome' | 'tower' | 'megatower' = 'solar';
      
      if (techLevel >= 2) type = Math.random() > 0.4 ? 'dome' : 'solar';
      if (techLevel >= 3 && radius < colonyRadius * 0.7) type = Math.random() > 0.4 ? 'tower' : 'dome';
      if (techLevel >= 4 && radius < colonyRadius * 0.5) type = Math.random() > 0.3 ? 'megatower' : 'tower';

      if (radius > 2.0) {
        points.push({ id: i, x, y, z, type });
      }
    }
    return points;
  }, [buildingCount, colonyRadius, techLevel]);

  // Generate Power Lines (Connecting nearby buildings)
  const powerLines = useMemo(() => {
    const lines: { start: THREE.Vector3, end: THREE.Vector3, length: number }[] = [];
    layout.forEach((p1, i) => {
      layout.forEach((p2, j) => {
        if (i < j) {
          const dx = p1.x - p2.x;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx*dx + dz*dz);
          // Connect if close enough, but not too many lines
          if (dist < 4 && Math.random() > 0.5) {
            lines.push({
              start: new THREE.Vector3(p1.x, p1.y, p1.z),
              end: new THREE.Vector3(p2.x, p2.y, p2.z),
              length: dist
            });
          }
        }
      });
    });
    return lines;
  }, [layout]);

  return (
    <>
      {/* Dusty Mars Environment */}
      <color attach="background" args={['#1a0602']} />
      <fog attach="fog" args={['#1a0602', 10, 50]} />
      
      {/* Camera Constraints */}
      <OrbitControls 
        enableZoom={true} 
        maxDistance={50} 
        minDistance={5} 
        maxPolarAngle={Math.PI / 2.1} 
        minPolarAngle={Math.PI / 6}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
      
      {/* Cinematic Soft Lighting */}
      {/* Hemisphere light softens pitch-black shadows by bouncing warm light from the ground */}
      <hemisphereLight skyColor="#222222" groundColor="#4a1506" intensity={1.5} />
      <directionalLight position={[20, 15, -10]} intensity={3.5} color="#ffb380" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
      
      {/* Atmospheric Martian Dust */}
      <Sparkles count={1000} scale={60} size={2} speed={0.4} opacity={0.3} color="#ff6600" />

      <group>
        {/* The Martian Surface with Analytical Grid */}
        <mesh geometry={terrainGeo} material={matSand} receiveShadow />
        <Grid position={[0, 0.01, 0]} args={[120, 120]} cellColor="#ff4400" sectionColor="#ff4400" fadeDistance={30} fadeStrength={1.5} cellThickness={0.5} opacity={0.2} transparent />

        {/* ================================== */}
        {/* GLOWING POWER LINES */}
        {/* ================================== */}
        {powerLines.map((line, i) => (
          <PowerLine key={`line-${i}`} start={line.start} end={line.end} length={line.length} />
        ))}

        {/* ================================== */}
        {/* THE COLONY ASSETS */}
        {/* ================================== */}
        
        {/* Central Prestige Monument */}
        <group position={[0, noise2D(0,0), 0]}>
          <mesh position={[0, 0.4, 0]} material={matDarkMetal} castShadow>
            <cylinderGeometry args={[2.5, 3.5, 0.8, 8]} />
          </mesh>
          <mesh position={[0, monumentHeight/2, 0]} material={matMetal} castShadow>
            <cylinderGeometry args={[1, 1.5, monumentHeight, 6]} />
          </mesh>
          {/* Glowing core representing stars */}
          <mesh position={[0, monumentHeight + 1.5, 0]} material={matPrestige}>
            <octahedronGeometry args={[1.2, 0]} />
          </mesh>
          {/* Hologram rings if stars > 100 */}
          {stars > 100 && <HologramRing height={monumentHeight + 1.5} />}
        </group>

        {/* Buildings */}
        {layout.map((p) => {
          if (p.type === 'solar') {
            return (
              <group key={`b-${p.id}`} position={[p.x, p.y, p.z]}>
                <mesh position={[0, 0.25, 0]} geometry={geoStrut} material={matMetal} castShadow />
                <mesh position={[0, 0.5, 0]} rotation={[Math.PI/6, Math.random(), 0]} geometry={geoPanel} material={matSolar} castShadow />
              </group>
            );
          }
          if (p.type === 'dome') {
            const scale = 0.8 + Math.random() * 0.4;
            return (
              <group key={`b-${p.id}`} position={[p.x, p.y + scale/2, p.z]} scale={scale}>
                {/* Geodesic Dome */}
                <mesh geometry={geoDome} material={matGlass} castShadow />
                {/* Wireframe overlay */}
                <mesh geometry={geoDome} material={matWireframe} scale={1.02} />
                {/* Base cylinder */}
                <mesh position={[0, -0.4, 0]} material={matDarkMetal} castShadow>
                  <cylinderGeometry args={[0.9, 0.9, 0.2, 16]} />
                </mesh>
              </group>
            );
          }
          if (p.type === 'tower') {
            const h = 2 + Math.random() * 2;
            return (
              <group key={`b-${p.id}`} position={[p.x, p.y + h/2, p.z]}>
                <mesh material={matDarkMetal} castShadow>
                  <boxGeometry args={[1.2, h, 1.2]} />
                </mesh>
                <mesh material={matGlass}>
                  <boxGeometry args={[1.25, h * 0.9, 1.25]} />
                </mesh>
              </group>
            );
          }
          if (p.type === 'megatower') {
            const h = 4 + Math.random() * 3;
            return (
              <group key={`b-${p.id}`} position={[p.x, p.y + h/2, p.z]}>
                <mesh material={matMetal} castShadow>
                  <cylinderGeometry args={[1.0, 1.8, h, 8]} />
                </mesh>
                {/* Glowing vertical neon strips */}
                <mesh material={matNeonCyan}>
                  <boxGeometry args={[2.0, h * 0.8, 0.2]} />
                </mesh>
                <mesh material={matNeonCyan} rotation={[0, Math.PI/2, 0]}>
                  <boxGeometry args={[2.0, h * 0.8, 0.2]} />
                </mesh>
              </group>
            );
          }
          return null;
        })}
      </group>
    </>
  );
}

// ==========================================
// ANIMATED COMPONENTS
// ==========================================

function HologramRing({ height }: { height: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 2) * 0.1;
      ringRef.current.rotation.z += 0.02;
    }
  });
  return (
    <mesh ref={ringRef} position={[0, height, 0]} rotation={[Math.PI/2, 0, 0]}>
      <torusGeometry args={[2.5, 0.05, 16, 64]} />
      <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
    </mesh>
  );
}

function PowerLine({ start, end, length }: { start: THREE.Vector3, end: THREE.Vector3, length: number }) {
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  // Lay lines flat on the ground
  midPoint.y = noise2D(midPoint.x, midPoint.z) + 0.05; 
  
  // Angle to orient the line
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const angle = Math.atan2(dx, dz);

  return (
    <mesh position={midPoint} rotation={[Math.PI/2, angle, 0]}>
      <cylinderGeometry args={[0.02, 0.02, length, 4]} />
      <meshBasicMaterial color="#ff6600" transparent opacity={0.3} />
    </mesh>
  );
}
