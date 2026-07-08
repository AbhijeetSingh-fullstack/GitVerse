"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

// ==========================================
// REALISTIC ALIEN / SCI-FI MATERIALS
// ==========================================
const matGround = new THREE.MeshStandardMaterial({ color: "#7B3314", roughness: 1.0, flatShading: true });
const matPad = new THREE.MeshStandardMaterial({ color: "#333333", roughness: 0.9 });
const matBuilding = new THREE.MeshStandardMaterial({ color: "#e0e0e0", metalness: 0.3, roughness: 0.2 });
const matDarkMetal = new THREE.MeshStandardMaterial({ color: "#1a1a1a", metalness: 0.8, roughness: 0.4 });
const matGlass = new THREE.MeshPhysicalMaterial({ color: "#000000", transmission: 0.9, opacity: 1, transparent: true, roughness: 0.1 });
const matNeonBlue = new THREE.MeshBasicMaterial({ color: "#00e5ff" });
const matNeonOrange = new THREE.MeshBasicMaterial({ color: "#ff5500" });

// Reusable Geometries
const geoPad = new THREE.CylinderGeometry(1.5, 1.8, 1, 16);
const geoCyl = new THREE.CylinderGeometry(0.8, 0.8, 1, 16);
const geoDome = new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const geoRing = new THREE.TorusGeometry(1, 0.05, 8, 32);

function noise2D(x: number, y: number) {
  // Bumpy Martian dunes
  return Math.sin(x * 0.2) * Math.cos(y * 0.2) * 1.5 + Math.sin(x * 0.05 + y * 0.1) * 3.0;
}

export default function MarsColony({ commits = 0, repos = 0, stars = 0 }: { commits: number, repos: number, stars: number }) {
  
  const buildingCount = Math.max(5, repos); 
  const colonyRadius = Math.max(8, Math.sqrt(repos) * 3.5); 
  const heightMultiplier = 1 + Math.log10(Math.max(1, commits)) * 1.5;
  const labCount = Math.min(stars, Math.floor(buildingCount * 0.4));

  // Generate Bumpy Terrain
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 100, 100);
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
    const points: { id: number, x: number, z: number, y: number, type: 'building' | 'laboratory', baseHeight: number }[] = [];
    
    const types = Array(buildingCount).fill('building');
    for (let i = 0; i < labCount; i++) types[i] = 'laboratory';
    
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }

    for (let i = 0; i < buildingCount; i++) {
      const angle = i * 2.39996;
      const radius = Math.sqrt(i) * 2.0 + 3; // Space them out well
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Calculate exact terrain height at this coordinate
      const y = noise2D(x, z);
      const baseHeight = 1 + Math.random() * 2;
      
      points.push({ id: i, x, y, z, type: types[i] as any, baseHeight });
    }
    return points;
  }, [buildingCount, labCount]);

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  // 12-Minute Day/Night Cycle (720 seconds total)
  useFrame(({ clock, scene }) => {
    const time = clock.elapsedTime;
    const cycleDuration = 720; 
    
    // Start at sunrise (angle 0)
    const angle = (time / cycleDuration) * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    
    if (sunRef.current) {
      sunRef.current.position.x = Math.cos(angle) * 100;
      sunRef.current.position.y = sunHeight * 100;
      sunRef.current.position.z = Math.sin(angle) * 40; 
    }
    
    if (hemiRef.current) {
      // Day = 0.8 intensity, Night = 0.1 intensity
      const targetIntensity = 0.1 + Math.max(0, sunHeight) * 0.7;
      hemiRef.current.intensity = targetIntensity;
    }
    
    // Lerp Atmosphere Colors
    const dayColor = new THREE.Color("#8a3311"); 
    const nightColor = new THREE.Color("#0a0200");
    const blend = Math.max(0, Math.min(1, sunHeight + 0.2)); 
    
    const currentColor = nightColor.clone().lerp(dayColor, blend);
    scene.background = currentColor;
    if (scene.fog) {
      scene.fog.color = currentColor;
    }
  });

  return (
    <>
      {/* Deep Space / Atmospheric Fog (Initial values, overridden by useFrame) */}
      <color attach="background" args={['#1a0802']} />
      <fog attach="fog" args={['#3a1306', 20, 120]} />
      
      <OrbitControls 
        enableZoom={true} 
        maxDistance={100} 
        minDistance={5} 
        maxPolarAngle={Math.PI / 2.1} 
        minPolarAngle={Math.PI / 8}
        autoRotate={true}
        autoRotateSpeed={0.2}
      />
      
      <ambientLight intensity={0.2} />
      <hemisphereLight ref={hemiRef} skyColor="#444455" groundColor="#3a1306" intensity={0.8} />
      
      <directionalLight 
        ref={sunRef}
        position={[40, 50, -30]} 
        intensity={3.5} 
        color="#ffccaa" 
        castShadow 
        shadow-mapSize={[4096, 4096]} 
        shadow-bias={-0.0002} 
      />
      
      {/* Starry Night Sky peeking through the dust */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      {/* Blowing Martian Dust */}
      <Sparkles count={1500} scale={100} size={2} speed={0.4} opacity={0.3} color="#ff8844" />

      <group>
        {/* Bumpy Low-Poly Martian Terrain */}
        <mesh geometry={terrainGeo} material={matGround} receiveShadow />

        {/* ================================== */}
        {/* THE COLONY ASSETS */}
        {/* ================================== */}
        
        {layout.map((p) => {
          
          if (p.type === 'laboratory') {
            // Laboratory: A sleek bio-dome on a concrete pad
            return (
              <group key={`lab-${p.id}`} position={[p.x, p.y, p.z]}>
                {/* Foundation Pad (sinks into the uneven terrain to create a flat surface) */}
                <mesh geometry={geoPad} material={matPad} position={[0, -0.4, 0]} receiveShadow />
                
                {/* Glass Dome */}
                <mesh geometry={geoDome} material={matGlass} position={[0, 0.1, 0]} castShadow />
                
                {/* Glowing Core Inside */}
                <mesh position={[0, 0.6, 0]}>
                  <octahedronGeometry args={[0.5, 0]} />
                  <meshBasicMaterial color="#00e5ff" />
                </mesh>
                
                {/* Base Ring */}
                <mesh material={matDarkMetal} position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[1.25, 1.25, 0.2, 16]} />
                </mesh>
              </group>
            );
          }
          
          if (p.type === 'building') {
            const h = p.baseHeight * heightMultiplier;
            // Building: A sleek, modular cylindrical tower with neon glowing rings
            return (
              <group key={`b-${p.id}`} position={[p.x, p.y, p.z]}>
                {/* Foundation Pad */}
                <mesh geometry={geoPad} material={matPad} position={[0, -0.4, 0]} receiveShadow />
                
                {/* Tower Core */}
                <mesh geometry={geoCyl} material={matBuilding} position={[0, h/2, 0]} scale={[1, h, 1]} castShadow receiveShadow />
                
                {/* Dark Metal Base Segment */}
                <mesh material={matDarkMetal} position={[0, 0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.85, 0.85, 1, 16]} />
                </mesh>
                
                {/* Glowing Neon Ring at the top */}
                <mesh geometry={geoRing} material={matNeonOrange} position={[0, h, 0]} rotation={[Math.PI/2, 0, 0]} />
                
                {/* Floating Cap */}
                <mesh material={matDarkMetal} position={[0, h + 0.3, 0]} castShadow>
                  <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
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
