"use client";

import { useMemo, useRef } from "react";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// ==========================================
// AAA CINEMATIC MATERIALS
// ==========================================
const matGround = new THREE.MeshStandardMaterial({ color: "#8B4513", roughness: 1.0, flatShading: true });
const matTower = new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.2, roughness: 0.7, flatShading: true });
const matDome = new THREE.MeshPhysicalMaterial({ color: "#a0c4ff", transmission: 0.6, opacity: 0.8, transparent: true, roughness: 0.1 });
const matBase = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.9 });

const matNeonCyan = new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#00e5ff", emissiveIntensity: 2 });
const matNeonPurple = new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#8800ff", emissiveIntensity: 2 });
const matNeonOrange = new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ff5500", emissiveIntensity: 2 });

const ringColors = [
  { color: "text-cyan-400", border: "border-cyan-500/50", ring: matNeonCyan },
  { color: "text-purple-400", border: "border-purple-500/50", ring: matNeonPurple },
  { color: "text-orange-400", border: "border-orange-500/50", ring: matNeonOrange },
];

function noise2D(x: number, y: number) {
  // Flatter Mars-like terrain to prevent burying buildings
  return Math.sin(x * 0.15) * Math.cos(y * 0.15) * 0.5 + Math.sin(x * 0.05 + y * 0.05) * 1.5;
}

export default function MarsColony({ commits = 0, repos = 0, stars = 0, topRepos = [], timeOverride }: { commits: number, repos: number, stars: number, topRepos?: any[], timeOverride?: number }) {
  
  // Generate Sharp Low-Poly Terrain
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 80, 80);
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

  // Generate AAA Layout mapped strictly to REAL GitHub data
  const layout = useMemo(() => {
    const points: any[] = [];
    
    topRepos.forEach((repo, i) => {
      let x = 0, z = 0;
      if (i > 0) {
        // Spiral the other repositories outwards
        const angle = i * 2.39996;
        const radius = 12 + (i * 2); 
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      }
      
      const y = noise2D(x, z);
      
      // Logarithmic scaling for building height based on exact commits
      const safeCommits = Number(repo.commits) || 1;
      const h = Math.min(30, 5 + Math.log10(Math.max(1, safeCommits)) * 3.5);
      const theme = ringColors[i % ringColors.length];
      
      points.push({ 
        id: `repo-${repo.name}`, x, y, z, 
        type: i === 0 ? 'main_tower' : 'tower', 
        label: { name: repo.name, commits: repo.commits, ...theme }, 
        height: h 
      });
    });

    // Ground Domes (Laboratories) based on stars
    const labCount = Math.min(stars, 12);
    for (let i = 0; i < labCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push({ id: `dome-${i}`, x, y: noise2D(x, z), z, type: 'dome' });
    }

    return points;
  }, [topRepos, stars]);

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  useFrame(({ scene }) => {
    // Lock to permanent bright daytime
    if (sunRef.current) {
      sunRef.current.position.set(20, 100, 40);
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = 1.0;
    }
    
    // Bright Sky Blue Background
    const dayColor = new THREE.Color("#87CEEB"); 
    scene.background = dayColor;
    
    // Constant emissive glow
    matNeonCyan.emissiveIntensity = 2;
    matNeonPurple.emissiveIntensity = 2;
    matNeonOrange.emissiveIntensity = 2;
  });

  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      
      <OrbitControls 
        enableZoom={true} 
        maxDistance={80} 
        minDistance={10} 
        maxPolarAngle={Math.PI / 2.1} 
        minPolarAngle={Math.PI / 6}
        autoRotate={true}
        autoRotateSpeed={0.3}
      />
      
      <ambientLight intensity={0.6} />
      <hemisphereLight ref={hemiRef} skyColor="#222233" groundColor="#0a0201" intensity={0.5} />
      <directionalLight ref={sunRef} position={[50, 40, -30]} intensity={4.0} color="#ffb380" castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0001} />
      <directionalLight position={[-30, 20, 40]} intensity={1.0} color="#6688ff" />

      <group>
        {/* Terrain */}
        <mesh geometry={terrainGeo} material={matGround} receiveShadow />

        {/* ================================== */}
        {/* GREEBLED ARCOLOGY TOWERS */}
        {/* ================================== */}
        
        {layout.map((p) => {
          if (p.type === 'dome') {
            return (
              <group key={p.id} position={[p.x, p.y, p.z]}>
                <mesh material={matBase} position={[0, -0.2, 0]} receiveShadow>
                  <cylinderGeometry args={[2, 2.5, 1, 16]} />
                </mesh>
                {/* Base Sphere */}
                <mesh position={[0, 0.5, 0]} material={matTower} receiveShadow castShadow>
                  <sphereGeometry args={[1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                </mesh>
                {/* Glowing Core */}
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[0.8, 0.8, 0.8]} />
                  <primitive object={matNeonCyan} attach="material" />
                </mesh>
              </group>
            );
          }
          
          if (p.type === 'main_tower' || p.type === 'tower') {
            const safeCommits = Number(p.label?.commits) || 1;
            const h = Math.min(30, 5 + Math.log10(Math.max(1, safeCommits)) * 3.5);
            const segments = Math.floor(h / 3);
            
            return (
              <group key={`b-${p.id}`} position={[p.x, p.y + 0.5, p.z]}>
                
                {/* Base Sphere */}
                <mesh position={[0, 0.5, 0]} material={matTower} receiveShadow castShadow>
                  <sphereGeometry args={[3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                </mesh>

                {/* Tapering Stacked Cylinders */}
                {Array.from({ length: segments }).map((_, segIdx) => {
                  const rBottom = Math.max(0.1, 3.0 - (segIdx * 0.3));
                  const rTop = Math.max(0.1, 3.0 - ((segIdx + 1) * 0.3));
                  const segHeight = 3;
                  const yPos = 1 + (segIdx * segHeight) + (segHeight/2);
                  
                  return (
                    <group key={`seg-${segIdx}`} position={[0, yPos, 0]}>
                      {/* Main Hull */}
                      <mesh material={matTower} castShadow receiveShadow>
                        <cylinderGeometry args={[rTop, rBottom, segHeight, 16]} />
                      </mesh>
                      
                      {/* Random Greeble Windows */}
                      {Array.from({ length: 8 }).map((_, w) => {
                        const angle = (w / 8) * Math.PI * 2 + (segIdx * 0.5); 
                        const r = Math.max(0.1, rBottom - 0.1);
                        return (
                          <mesh key={`win-${w}`} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} rotation={[0, -angle, 0]}>
                            <boxGeometry args={[0.4, Math.random() * 1.5 + 0.5, 0.4]} />
                            <primitive object={Math.random() > 0.5 ? p.label.ring : matTower} attach="material" />
                          </mesh>
                        );
                      })}
                    </group>
                  );
                })}

                {/* Top Cap */}
                <mesh material={matTower} position={[0, 1 + segments * 3 + 0.5, 0]} castShadow>
                  <cylinderGeometry args={[Math.max(0.1, 1.0 - (segments * 0.1)), Math.max(0.1, 3.0 - (segments * 0.3)), 1, 16]} />
                </mesh>
                
                <AnimatedRing yPos={1 + segments * 3 + 2} material={p.label.ring} />

                {/* Glassmorphic HTML Label */}
                <Html 
                  position={[0, 1 + segments * 3 + 5, 0]} 
                  center 
                  className="pointer-events-none"
                  distanceFactor={20}
                >
                  <div className="flex flex-col items-center animate-pulse-slow">
                    <div className={`px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border-t-2 ${p.label.border} shadow-lg shadow-black/50 flex flex-col items-center whitespace-nowrap`}>
                      <span className={`text-[10px] font-bold ${p.label.color} leading-none mb-0.5`}>{p.label.name}</span>
                      <span className="text-[8px] text-gray-300 font-medium">{p.label.commits} commits</span>
                    </div>
                  </div>
                </Html>

              </group>
            );
          }

          return null;
        })}
      </group>
    </>
  );
}

function AnimatedRing({ yPos, material }: { yPos: number, material: THREE.Material }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.position.y = yPos + Math.sin(clock.elapsedTime * 2) * 0.2;
      ringRef.current.rotation.z = clock.elapsedTime * 0.5;
    }
  });
  return (
    <mesh ref={ringRef} position={[0, yPos, 0]} rotation={[Math.PI/2, 0, 0]}>
      <torusGeometry args={[2, 0.1, 16, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
