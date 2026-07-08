"use client";

import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { fetchRepoTree, RepoFileNode } from '@/utils/github';
import { OrbitControls, Text, Html, Sparkles } from '@react-three/drei';

interface FileTreeProps {
  owner: string;
  repo: string;
  token?: string;
  onExit: () => void;
}

export default function FileTree({ owner, repo, token, onExit }: FileTreeProps) {
  const [nodes, setNodes] = useState<RepoFileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const data = await fetchRepoTree(owner, repo, token);
      if (active) {
        // Cap at 400 nodes for performance
        setNodes(data.slice(0, 400));
        setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [owner, repo, token]);

  const { points, lineSegments } = useMemo(() => {
    if (!nodes.length) return { points: [], lineSegments: [] };
    
    const pathMap = new Map<string, any>();
    
    nodes.forEach(node => {
      const parts = node.path.split('/');
      const name = parts.pop()!;
      const parentPath = parts.join('/');
      
      pathMap.set(node.path, {
        ...node,
        name,
        parentPath,
        depth: parts.length,
        children: []
      });
    });

    // Build tree
    const rootNodes: any[] = [];
    nodes.forEach(node => {
      const p = pathMap.get(node.path);
      if (p.parentPath && pathMap.has(p.parentPath)) {
        pathMap.get(p.parentPath).children.push(p);
      } else {
        rootNodes.push(p);
      }
    });

    const calculatedPoints: any[] = [];
    const segments: THREE.Vector3[] = [];

    // Recursive layout function
    const assignPositions = (node: any, px: number, py: number, pz: number, angleStart: number, angleEnd: number) => {
      node.x = px;
      node.y = py;
      node.z = pz;
      
      calculatedPoints.push({
        path: node.path,
        name: node.name,
        type: node.type,
        size: node.size,
        x: px, y: py, z: pz,
        color: node.type === 'tree' ? '#00ffd5' : '#8b5cf6',
      });

      if (node.parentPath) {
        const parent = pathMap.get(node.parentPath);
        if (parent) {
          segments.push(new THREE.Vector3(parent.x, parent.y, parent.z));
          segments.push(new THREE.Vector3(px, py, pz));
        }
      }

      const childCount = node.children.length;
      if (childCount === 0) return;

      const angleStep = (angleEnd - angleStart) / childCount;
      const radius = Math.max(2, 8 - node.depth * 1.5);
      
      node.children.forEach((child: any, i: number) => {
        const childAngle = angleStart + angleStep * i + (angleStep / 2);
        // Distribute spherically downwards
        const cx = px + Math.cos(childAngle) * radius;
        const cy = py - (Math.random() * 2 + 2); // grow down
        const cz = pz + Math.sin(childAngle) * radius;
        
        assignPositions(child, cx, cy, cz, angleStart + angleStep * i, angleStart + angleStep * (i + 1));
      });
    };

    // Layout roots
    rootNodes.forEach((root, i) => {
      const angle = (i / rootNodes.length) * Math.PI * 2;
      const r = rootNodes.length > 1 ? 5 : 0;
      assignPositions(root, Math.cos(angle) * r, 10, Math.sin(angle) * r, 0, Math.PI * 2);
    });

    return { points: calculatedPoints, lineSegments: segments };
  }, [nodes]);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(lineSegments);
  }, [lineSegments]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 20, 0]} intensity={2} color="#00ffd5" />
      <pointLight position={[0, -20, 0]} intensity={1.5} color="#8b5cf6" />
      <OrbitControls autoRotate autoRotateSpeed={0.5} maxDistance={100} />

      {loading ? (
        <Text position={[0, 0, 0]} color="#00ffd5" fontSize={1.5}>
          INITIALIZING NEURAL TREE...
        </Text>
      ) : nodes.length === 0 ? (
        <Text position={[0, 0, 0]} color="#ff0055" fontSize={1.2}>
          FAILED TO CONNECT TO DATA-CORE.
        </Text>
      ) : (
        <group ref={groupRef}>
          <Sparkles count={500} scale={50} size={2} color="#00ffd5" speed={0.4} opacity={0.2} />
          
          {lineSegments.length > 0 && (
            <lineSegments geometry={lineGeometry}>
              <lineBasicMaterial color="#3b82f6" transparent opacity={0.3} />
            </lineSegments>
          )}

          {points.map((item, i) => (
            <group key={i} position={[item.x, item.y, item.z]}>
              <mesh
                onPointerOver={(e) => { e.stopPropagation(); setHoveredFile(item.path); }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredFile(null); }}
              >
                {item.type === 'tree' ? (
                  <icosahedronGeometry args={[0.5, 0]} />
                ) : (
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                )}
                <meshStandardMaterial 
                  color={item.color} 
                  emissive={item.color}
                  emissiveIntensity={hoveredFile === item.path ? 2 : 0.6}
                  wireframe={item.type === 'tree'}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              {hoveredFile === item.path && (
                <Html center position={[0, 0.8, 0]} zIndexRange={[100, 0]}>
                  <div className="px-3 py-1.5 bg-black/90 text-[#00ffd5] text-xs rounded border border-[#00ffd5]/50 whitespace-nowrap shadow-[0_0_15px_rgba(0,255,213,0.4)] backdrop-blur-md uppercase tracking-wider font-bold">
                    {item.name}
                    {item.size ? <span className="ml-2 text-purple-400 font-normal">{(item.size / 1024).toFixed(1)}kb</span> : null}
                  </div>
                </Html>
              )}
            </group>
          ))}
        </group>
      )}
    </>
  );
}
