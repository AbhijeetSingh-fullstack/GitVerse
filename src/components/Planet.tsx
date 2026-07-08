"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

export type PlanetTheme = 'desert' | 'ice' | 'volcanic' | 'toxic';

const THEMES = {
  desert: {
    rock: new THREE.Color("#8B3A3A"),
    soil: new THREE.Color("#cd853f"),
    life: new THREE.Color("#2e8b57"),
    atmosphere: "#4ca8ff",
    ocean: new THREE.Color("#0f5e9c")
  },
  ice: {
    rock: new THREE.Color("#90a4ae"),
    soil: new THREE.Color("#cfd8dc"),
    life: new THREE.Color("#80cbc4"),
    atmosphere: "#81d4fa",
    ocean: new THREE.Color("#0277bd")
  },
  volcanic: {
    rock: new THREE.Color("#212121"),
    soil: new THREE.Color("#3e2723"),
    life: new THREE.Color("#ffb300"), 
    atmosphere: "#ff8a65",
    ocean: new THREE.Color("#d84315") 
  },
  toxic: {
    rock: new THREE.Color("#33691e"),
    soil: new THREE.Color("#558b2f"),
    life: new THREE.Color("#9e9d24"),
    atmosphere: "#c0ca33",
    ocean: new THREE.Color("#827717") 
  }
};

export default function Planet({ commits = 0, theme = 'desert' }: { commits: number, theme?: PlanetTheme }) {
  const planetRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.0005;
    }
    if (atmosphereRef.current) {
      const scale = 1.05 + Math.sin(clock.elapsedTime * 1.5) * 0.005;
      atmosphereRef.current.scale.set(scale, scale, scale);
    }
    if (waterRef.current) {
      waterRef.current.rotation.y -= 0.0002;
    }
  });

  const level = commits <= 100 ? 1 : commits <= 500 ? 2 : commits <= 2000 ? 3 : 4;
  const isLevel2 = level >= 2;
  const isLevel3 = level >= 3;
  const isLevel4 = level >= 4;

  const currentTheme = THEMES[theme];

  // Generate bumpy procedural geometry ONCE
  const { geometry, elevations } = useMemo(() => {
    const geo = new THREE.SphereGeometry(2, 128, 128);
    const pos = geo.attributes.position;
    const noise3D = createNoise3D();
    const elevationsArray = [];
    
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      // Generate noise based on position
      const n = noise3D(v.x * 0.6, v.y * 0.6, v.z * 0.6);
      const detailNoise = noise3D(v.x * 2, v.y * 2, v.z * 2) * 0.2;
      const elevation = n + detailNoise;
      
      elevationsArray.push(elevation);
      
      // Deform vertex outward
      v.add(v.clone().normalize().multiplyScalar(elevation * 0.15));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    
    geo.computeVertexNormals();
    return { geometry: geo, elevations: elevationsArray };
  }, []); // Only runs once per mount

  // Update vertex colors dynamically based on level and theme
  useEffect(() => {
    if (!geometry) return;
    const colors = [];
    
    for (let i = 0; i < elevations.length; i++) {
      const elevation = elevations[i];
      let color = currentTheme.rock.clone();

      if (isLevel4) {
        if (elevation > 0.1) color = currentTheme.life.clone();
        else color = currentTheme.soil.clone();
      } else if (isLevel3) {
        if (elevation > 0.1) color = currentTheme.soil.clone();
        else color = currentTheme.rock.clone();
      }

      // Add a tiny bit of noise to color for texture
      color.offsetHSL(0, 0, (elevation * 0.05));
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.color.needsUpdate = true;
  }, [commits, theme, geometry, isLevel3, isLevel4, currentTheme, elevations]);

  return (
    <>
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.2} maxDistance={15} minDistance={3} />
      
      {/* Cinematic Space Lighting */}
      <ambientLight intensity={0.05} />
      <directionalLight position={[10, 5, 5]} intensity={2.5} castShadow />
      <directionalLight position={[-10, -5, -5]} intensity={0.5} color={currentTheme.atmosphere} />
      
      <Stars radius={100} depth={50} count={isLevel2 ? 10000 : 3000} factor={5} saturation={0.5} fade speed={1} />

      <group ref={planetRef}>
        {/* Core Planet (Bumpy Terrain) */}
        <mesh geometry={geometry} ref={meshRef} castShadow receiveShadow>
          <meshStandardMaterial 
            vertexColors 
            roughness={0.9} 
            metalness={0.1}
            flatShading // Gives a cool low-poly/stylized crisp look, but with 128 res it looks highly detailed
          />
        </mesh>

        {/* Level 2: Glowing Atmosphere */}
        {isLevel2 && (
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[2.3, 64, 64]} />
            <meshPhongMaterial 
              color={currentTheme.atmosphere}
              transparent
              opacity={0.15}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Level 3: Oceans */}
        {isLevel3 && (
          <mesh ref={waterRef}>
            {/* The radius is 2.05 to cover the deep valleys (elevation < 0) */}
            <sphereGeometry args={[2.02, 64, 64]} />
            <meshStandardMaterial 
              color={currentTheme.ocean}
              transparent
              opacity={0.85}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        )}
        
        {/* Level 4: Cities / Satellites */}
        {isLevel4 && (
          <group>
             {/* Orbital Ring / Satellites to make it look highly civilized */}
             <mesh rotation={[Math.PI / 3, 0, 0]}>
               <torusGeometry args={[3, 0.01, 16, 100]} />
               <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
             </mesh>
             <mesh rotation={[Math.PI / 3, 0, 0]} position={[3, 0, 0]}>
               <sphereGeometry args={[0.05, 16, 16]} />
               <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
             </mesh>
          </group>
        )}
      </group>
    </>
  );
}
