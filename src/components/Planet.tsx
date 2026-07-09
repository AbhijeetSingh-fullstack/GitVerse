"use client";

import { useMemo, useRef, useState } from "react";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Pre-define materials for the star
const matStar = new THREE.MeshBasicMaterial({ color: "#ffdd44" });
const matStarGlow = new THREE.MeshBasicMaterial({ color: "#ff8800", transparent: true, opacity: 0.3 });

// Ring colors for UI aesthetics
const ringColors = [
  { color: "text-cyan-400", border: "border-cyan-500/50" },
  { color: "text-purple-400", border: "border-purple-500/50" },
  { color: "text-orange-400", border: "border-orange-500/50" },
  { color: "text-green-400", border: "border-green-500/50" },
  { color: "text-pink-400", border: "border-pink-500/50" },
];

export default function SolarSystem({ commits = 0, repos = 0, stars = 0, topRepos = [], timeOverride, biomeId = 'mars', onEnterRepo, onSelectRepo }: { commits: number, repos: number, stars: number, topRepos?: any[], timeOverride?: number, biomeId?: string, onEnterRepo?: (name: string) => void, onSelectRepo?: (repoInfo: any) => void }) {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  
  const planetsData = useMemo(() => {
    return topRepos.map((repo, i) => {
      // Calculate orbital parameters
      const radius = 15 + (i * 8); // Spread planets out
      const speed = 0.5 / Math.sqrt(radius); // Kepler's 3rd law approximation
      const initialAngle = Math.random() * Math.PI * 2;
      const size = 1.0 + Math.log10(Math.max(1, repo.size || 1)) * 0.3; // Size based on repo size

      // Habitability Logic based on Commits
      const safeCommits = Number(repo.commits) || 0;
      let type = "barren";
      let color = "#888888"; // default gray
      let roughness = 0.9;
      let metalness = 0.1;
      
      if (safeCommits < 10) {
        type = "barren";
        color = ["#a0522d", "#808080", "#696969"][i % 3]; // Brownish/grayish
        roughness = 1.0;
      } else if (safeCommits < 30) {
        type = "habitable";
        color = ["#2E8B57", "#4682B4", "#3CB371"][i % 3]; // Green/Blue
        roughness = 0.6;
      } else {
        type = "lush";
        color = ["#00FF7F", "#00BFFF", "#32CD32"][i % 3]; // Bright lush
        roughness = 0.4;
      }

      let material: THREE.Material;
      if (type === "barren") {
        material = new THREE.MeshStandardMaterial({ 
          color, 
          roughness: 1.0, 
          metalness: 0.2, 
        });
      } else {
        material = new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.4,
          metalness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          reflectivity: 1.0,
        });
      }

      const hasMoons = safeCommits >= 30;
      const moons = [];
      if (hasMoons) {
        const numMoons = Math.min(3, Math.floor(safeCommits / 30));
        for (let m = 0; m < numMoons; m++) {
          moons.push({
            radius: size + 2 + m * 1.5,
            speed: 2.0 / (m + 1),
            angle: Math.random() * Math.PI * 2,
            size: 0.3 + Math.random() * 0.3,
          });
        }
      }

      const theme = ringColors[i % ringColors.length];
      
      return {
        id: `repo-${repo.name}`,
        repoData: repo,
        radius,
        speed,
        initialAngle,
        size,
        type,
        color,
        material,
        moons,
        label: { name: repo.name, commits: repo.commits, repoData: repo, ...theme },
      };
    });
  }, [topRepos]);

  return (
    <>
      {/* Deep Space Background */}
      <color attach="background" args={["#020205"]} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <OrbitControls 
        enableZoom={true} 
        maxDistance={150} 
        minDistance={20} 
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      {/* PointLight at the center (the star) */}
      <pointLight position={[0, 0, 0]} intensity={2000} distance={200} decay={2} color="#ffffff" />

      <group>
        {/* Central Star (User) */}
        <mesh>
          <sphereGeometry args={[5, 64, 64]} />
          <primitive object={matStar} attach="material" />
        </mesh>
        {/* Star Glow 1 */}
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
        {/* Star Glow 2 */}
        <mesh scale={[1.3, 1.3, 1.3]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
        {/* Star Glow 3 (Outer Corona) */}
        <mesh scale={[2.0, 2.0, 2.0]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ff2200" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Orbiting Planets */}
        {planetsData.map((planet) => (
          <PlanetMesh 
            key={planet.id} 
            planet={planet} 
            selectedRepo={selectedRepo} 
            setSelectedRepo={setSelectedRepo} 
            onSelectRepo={onSelectRepo}
          />
        ))}
      </group>
    </>
  );
}

function PlanetMesh({ planet, selectedRepo, setSelectedRepo, onSelectRepo }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Rotate the planet around the star
      const elapsed = clock.getElapsedTime();
      const currentAngle = planet.initialAngle + elapsed * planet.speed;
      groupRef.current.position.x = Math.cos(currentAngle) * planet.radius;
      groupRef.current.position.z = Math.sin(currentAngle) * planet.radius;
      
      // Rotate planet on its own axis
      groupRef.current.rotation.y += 0.01;
    }
  });

  const isSelected = selectedRepo === planet.id;

  return (
    <group>
      {/* Orbit path line (Rendered at origin to stay static) */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0,0,0]}>
         <ringGeometry args={[planet.radius - 0.08, planet.radius + 0.08, 64]} />
         <meshBasicMaterial color={planet.color} transparent opacity={isSelected ? 0.8 : 0.3} side={THREE.DoubleSide} />
      </mesh>

      <group ref={groupRef}>
        {/* The Planet itself */}
        <mesh 
          castShadow 
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRepo(isSelected ? null : planet.id);
            if (onSelectRepo) {
              onSelectRepo(isSelected ? null : planet.label);
            }
          }}
        >
          <sphereGeometry args={[planet.size, 32, 32]} />
          <primitive object={planet.material} attach="material" />
        </mesh>
        
        {/* Atmosphere Glow for detailed view */}
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Selection Highlight */}
        {isSelected && (
          <mesh>
            <sphereGeometry args={[planet.size + 0.3, 32, 32]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.5} />
          </mesh>
        )}

        {/* Moons */}
        {planet.moons.map((moon: any, i: number) => (
          <MoonMesh key={i} moon={moon} parentSize={planet.size} />
        ))}
        
        {/* Simple Label instead of huge popup */}
        <Html position={[0, planet.size + 1.5, 0]} center className="pointer-events-none">
          <div className={`px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-[8px] font-bold ${planet.label.color} whitespace-nowrap`}>
            {planet.label.name}
          </div>
        </Html>
      </group>
    </group>
  );
}

function MoonMesh({ moon, parentSize }: { moon: any, parentSize: number }) {
  const moonRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: "#aaaaaa", roughness: 1.0 }), []);
  
  useFrame(({ clock }) => {
    if (moonRef.current) {
      const elapsed = clock.getElapsedTime();
      const currentAngle = moon.angle + elapsed * moon.speed;
      moonRef.current.position.x = Math.cos(currentAngle) * moon.radius;
      moonRef.current.position.z = Math.sin(currentAngle) * moon.radius;
    }
  });

  return (
    <mesh ref={moonRef} receiveShadow castShadow>
      <sphereGeometry args={[moon.size, 16, 16]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
