"use client";

import { useMemo, useState, useEffect } from "react";
import { OrbitControls, Sky, Html } from "@react-three/drei";
import * as THREE from "three";
import { fetchRepoTree, RepoFileNode } from '@/utils/github';

function noise2D(x: number, y: number) {
  return Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2.0 + Math.sin(x * 0.03 + y * 0.03) * 4.0;
}

export default function PlanetSurface({ repoData, token, owner }: { repoData: any, token?: string, owner?: string }) {
  const commits = Number(repoData?.commits) || 0;
  const isHabitable = commits >= 20;

  const [nodes, setNodes] = useState<RepoFileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredFile, setHoveredFile] = useState<any>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const data = await fetchRepoTree(owner || repoData?.owner?.login, repoData.name, token);
      if (active) {
        setNodes(data.slice(0, 400)); // increased cap for detailed towns
        setLoading(false);
      }
    };
    if (repoData.name) {
      load();
    }
    return () => { active = false; };
  }, [repoData, token, owner]);

  // Generate Colony Layout
  const { houses, colonies, roads, poles } = useMemo(() => {
    if (!nodes.length) return { houses: [], colonies: [], roads: [], poles: [] };
    
    const hList: any[] = [];
    const cList: any[] = [];
    const rList: any[] = [];
    const pList: any[] = [];
    
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

    const rootNodes: any[] = [];
    nodes.forEach(node => {
      const parent = pathMap.get(node.path);
      if (parent.parentPath && pathMap.has(parent.parentPath)) {
        pathMap.get(parent.parentPath).children.push(parent);
      } else {
        rootNodes.push(parent);
      }
    });

    const assignPositions = (node: any, px: number, pz: number, angleStart: number, angleEnd: number, depth: number) => {
      const py = isHabitable ? 0 : noise2D(px, pz);
      
      const files = node.children.filter((c: any) => c.type === 'blob');
      const subfolders = node.children.filter((c: any) => c.type === 'tree');
      
      // Calculate colony size based on number of files (houses)
      const colonyRadius = Math.max(5, Math.sqrt(files.length) * 2.5);
      
      // 1. Create the Colony Foundation (Folder)
      cList.push({
        x: px, y: py, z: pz, 
        radius: colonyRadius + 2,
        name: node.name,
        path: node.path,
        isRoot: depth === 1
      });

      // 2. Distribute Files (Houses) inside the colony
      files.forEach((file: any, index: number) => {
        // Spiral placement inside the colony
        const angle = index * 2.4; // golden angle approx
        const rad = Math.sqrt(index) * 2.0;
        const hx = px + Math.cos(angle) * rad;
        const hz = pz + Math.sin(angle) * rad;
        
        const width = 1.2 + Math.random() * 0.8;
        const depthObj = 1.2 + Math.random() * 0.8;
        const height = 1 + (file.size ? Math.min(10, file.size / 2000) : 1) + Math.random() * 2;
        
        hList.push({
          x: hx, y: py, z: hz, w: width, h: height, d: depthObj,
          name: file.name,
          type: file.type,
          size: file.size,
          path: file.path,
        });
      });

      // 3. Connect to parent with road and poles
      if (node.parentPath) {
        const parentNode = cList.find(c => c.path === node.parentPath);
        if (parentNode) {
          const start = new THREE.Vector3(parentNode.x, parentNode.y + 0.1, parentNode.z);
          const end = new THREE.Vector3(px, py + 0.1, pz);
          
          rList.push({ start, end });
          
          // Place electricity poles along the road
          const dist = start.distanceTo(end);
          const numPoles = Math.floor(dist / 12);
          for (let i = 1; i <= numPoles; i++) {
            const t = i / (numPoles + 1);
            const polePos = new THREE.Vector3().lerpVectors(start, end, t);
            
            // Offset pole slightly to the side of the road
            const dir = new THREE.Vector3().subVectors(end, start).normalize();
            const right = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(1.5);
            polePos.add(right);
            
            pList.push({ x: polePos.x, y: polePos.y, z: polePos.z, angle: Math.atan2(dir.z, dir.x) });
          }
        }
      }

      // 4. Distribute Sub-Folders (Colonies)
      if (subfolders.length === 0) return;

      const angleStep = (angleEnd - angleStart) / subfolders.length;
      // Distance between colonies. Deep colonies are closer, root colonies are far.
      const distToSubColony = Math.max(colonyRadius + 15, 60 - depth * 10);
      
      subfolders.forEach((child: any, i: number) => {
        const childAngle = angleStart + angleStep * i + (angleStep / 2);
        const cx = px + Math.cos(childAngle) * distToSubColony;
        const cz = pz + Math.sin(childAngle) * distToSubColony;
        assignPositions(child, cx, cz, angleStart + angleStep * i, angleStart + angleStep * (i + 1), depth + 1);
      });
    };

    // Layout roots
    rootNodes.forEach((root, i) => {
      const angle = (i / rootNodes.length) * Math.PI * 2;
      const radius = rootNodes.length > 1 ? 30 : 0;
      assignPositions(root, Math.cos(angle) * radius, Math.sin(angle) * radius, 0, Math.PI * 2, 1);
    });

    return { houses: hList, colonies: cList, roads: rList, poles: pList };
  }, [nodes, isHabitable]);

  // Materials
  const matGrass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#557a2b", roughness: 1.0 }), []);
  const matBarren = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8c7051", roughness: 1.0 }), []);
  const matPavement = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6b7280", roughness: 0.9 }), []);
  const matRoad = useMemo(() => new THREE.MeshStandardMaterial({ color: "#374151", roughness: 0.8 }), []);
  
  // House Materials
  const matHouseBody = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e5e7eb", roughness: 0.6 }), []);
  const matHouseRoof = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8b5a2b", roughness: 0.8 }), []); // Brown sloped roof
  const matPole = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4b3621", roughness: 0.9 }), []); // Wooden pole
  const matWire = useMemo(() => new THREE.LineBasicMaterial({ color: "#111111" }), []);

  // Terrain
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(800, 800, 100, 100);
    geo.rotateX(-Math.PI / 2);
    if (!isHabitable) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, noise2D(x, z));
      }
      geo.computeVertexNormals();
    }
    return geo;
  }, [isHabitable]);

  return (
    <>
      <Sky distance={450000} sunPosition={[100, 40, 20]} inclination={0.2} azimuth={0.25} />
      <fog attach="fog" args={["#a0c4db", 20, 300]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 50]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />

      <OrbitControls 
        enableZoom={true} 
        maxDistance={350} 
        minDistance={5} 
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={true}
        autoRotateSpeed={0.2}
      />

      <group>
        {/* Terrain Base */}
        <mesh geometry={terrainGeo} material={isHabitable ? matGrass : matBarren} receiveShadow position={[0, -0.1, 0]} />

        {loading ? (
          <Html center position={[0, 10, 0]}>
            <div className="bg-white/90 px-6 py-3 rounded-lg shadow-xl uppercase tracking-widest text-sm font-bold text-gray-800">
              <span className="animate-pulse">Surveying Land & Building Colonies...</span>
            </div>
          </Html>
        ) : (
          <>
            {/* Colonies (Folders as paved foundations) */}
            {colonies.map((col, i) => (
              <group key={`col-${i}`} position={[col.x, col.y + 0.05, col.z]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <circleGeometry args={[col.radius, 32]} />
                  <primitive object={matPavement} attach="material" />
                </mesh>
                <Html center position={[0, 0.5, 0]} className="pointer-events-none">
                  <div className="text-[14px] font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap opacity-80">
                    /{col.name}
                  </div>
                </Html>
              </group>
            ))}

            {/* Roads connecting colonies */}
            {roads.map((r, i) => {
              const dist = r.start.distanceTo(r.end);
              const center = new THREE.Vector3().addVectors(r.start, r.end).multiplyScalar(0.5);
              const angle = Math.atan2(r.end.z - r.start.z, r.end.x - r.start.x);
              return (
                <mesh key={`road-${i}`} position={center} rotation={[0, -angle, 0]} receiveShadow>
                  <boxGeometry args={[dist, 0.02, 2]} />
                  <primitive object={matRoad} attach="material" />
                </mesh>
              );
            })}

            {/* Electricity Poles & Wires */}
            {poles.map((p, i) => (
              <group key={`pole-${i}`} position={[p.x, p.y, p.z]} rotation={[0, -p.angle, 0]}>
                {/* Main vertical pole */}
                <mesh position={[0, 2, 0]} castShadow>
                  <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
                  <primitive object={matPole} attach="material" />
                </mesh>
                {/* Horizontal crossbar */}
                <mesh position={[0, 3.8, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
                  <primitive object={matPole} attach="material" />
                </mesh>
              </group>
            ))}

            {/* Houses (Files inside colonies) */}
            {houses.map((h, i) => (
              <group 
                key={`house-${i}`} 
                position={[h.x, h.y, h.z]}
                onPointerOver={(e) => { e.stopPropagation(); setHoveredFile(h); }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredFile(null); }}
              >
                {/* House Base */}
                <mesh position={[0, h.h / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[h.w, h.h, h.d]} />
                  <primitive object={matHouseBody} attach="material" />
                </mesh>
                
                {/* Sloped Roof */}
                <mesh position={[0, h.h + 0.4, 0]} rotation={[0, Math.PI/4, 0]} castShadow>
                  <coneGeometry args={[h.w * 0.8, 0.8, 4]} />
                  <primitive object={matHouseRoof} attach="material" />
                </mesh>

                {/* Hover UI Label */}
                {hoveredFile?.path === h.path && (
                  <Html center position={[0, h.h + 2, 0]} zIndexRange={[100, 0]}>
                    <div className="px-3 py-2 bg-white/95 text-gray-900 text-xs rounded border border-gray-200 shadow-xl flex flex-col gap-1 w-max min-w-[120px]">
                      <div className="font-bold text-blue-600 text-sm truncate">{h.name}</div>
                      <div className="flex justify-between items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        <span>{h.type}</span>
                        {h.size && <span>{(h.size / 1024).toFixed(1)} KB</span>}
                      </div>
                    </div>
                  </Html>
                )}
              </group>
            ))}
          </>
        )}
      </group>
    </>
  );
}
