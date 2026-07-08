"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

export default function MarsBase() {
  const planetRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001; // Slow rotation
    }
  });

  return (
    <>
      <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Mars Planet */}
      <mesh ref={planetRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#c1440e" 
          roughness={0.8}
          metalness={0.1}
        />
        
        {/* Simple mock buildings on the surface */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        <mesh position={[0.5, 1.9, 0.3]} rotation={[0.2, 0, -0.2]}>
          <boxGeometry args={[0.3, 0.6, 0.3]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        <mesh position={[-0.4, 1.95, -0.2]} rotation={[-0.1, 0, 0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
      </mesh>
    </>
  );
}
