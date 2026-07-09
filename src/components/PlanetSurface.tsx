"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { OrbitControls, Sky, Html, Billboard, Text, useTexture, useFBX } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { fetchRepoTree, RepoFileNode } from '@/utils/github';

// Custom hook for keyboard controls
function useKeyboardControls() {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys) {
        setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys) {
        setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keys]);

  return keys;
}

// Cinematic Falcon-style Rocket with Landing Legs
function SpaceXRocket({ 
  isExiting, 
  onExitComplete, 
  onLanded,
  padPosition
}: { 
  isExiting: boolean, 
  onExitComplete?: () => void, 
  onLanded: () => void,
  padPosition: THREE.Vector3
}) {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Group>(null);
  
  // Landing Leg refs for deployment animation
  const leg1Ref = useRef<THREE.Group>(null);
  const leg2Ref = useRef<THREE.Group>(null);
  const leg3Ref = useRef<THREE.Group>(null);
  const leg4Ref = useRef<THREE.Group>(null);
  
  const [landed, setLanded] = useState(false);
  const timer = useRef(0);
  const launchTimer = useRef(0);
  
  const metalTexture = useTexture("/rocket_texture.png");
  metalTexture.wrapS = THREE.RepeatWrapping;
  metalTexture.wrapT = THREE.RepeatWrapping;
  metalTexture.repeat.set(1, 4);
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(padPosition.x, 800, padPosition.z);
    }
    
    if (smokeRef.current) {
      smokeRef.current.children.forEach(child => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 50;
        child.userData = {
          vx: Math.cos(angle) * speed,
          vz: Math.sin(angle) * speed,
          vy: 5 + Math.random() * 20,
          life: Math.random()
        };
      });
    }
  }, [padPosition]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const height = groupRef.current.position.y;
    
    // Animate Smoke/Dust Particles
    const isNearGround = height < 200 && (!landed || (isExiting && height < 200));
    if (smokeRef.current) {
      smokeRef.current.children.forEach(child => {
        if (isNearGround) {
          child.visible = true;
          child.userData.life += delta * 0.8;
          if (child.userData.life > 1.0) {
             child.userData.life = 0;
             child.position.set((Math.random()-0.5)*4, 0, (Math.random()-0.5)*4);
             child.scale.setScalar(1);
          }
          
          const life = child.userData.life;
          child.position.x += child.userData.vx * delta;
          child.position.z += child.userData.vz * delta;
          child.position.y += child.userData.vy * delta;
          
          child.scale.setScalar(1 + life * 15);
          (child.material as THREE.MeshBasicMaterial).opacity = (1 - life) * 0.6;
        } else {
          child.visible = false;
        }
      });
    }
    
    if (isExiting) {
      // Launch Sequence
      launchTimer.current += delta;
      const time = launchTimer.current;
      groupRef.current.position.y = 27.77 * Math.pow(time, 2);
      
      // Retract legs on launch
      const legAngle = Math.max(0, (Math.PI / 2.5) - (time * 2));
      [leg1Ref, leg2Ref, leg3Ref, leg4Ref].forEach(leg => {
        if (leg.current) leg.current.rotation.x = legAngle;
      });
      
      if (flameRef.current) {
        if (height < 200) {
           flameRef.current.scale.set(2.5, 4.0 + Math.random(), 2.5); 
        } else {
           flameRef.current.scale.set(1.5, 3.0 + Math.random(), 1.5);
        }
        (flameRef.current.material as THREE.MeshBasicMaterial).opacity = 1.0;
        // Keep flame starting from the bottom of the rocket (y=0 is the base, cone height is 6)
        flameRef.current.position.y = -(flameRef.current.scale.y * 6) / 2;
      }
      
      // LAUNCH CINEMATICS (Multiple Cuts)
      let camX, camY, camZ, lookX, lookY, lookZ;
      if (time < 2.0) {
        // Cut 1: Engine Close-up
        camX = padPosition.x + 15;
        camY = 5;
        camZ = padPosition.z + 15;
        lookX = groupRef.current.position.x;
        lookY = height;
        lookZ = groupRef.current.position.z;
      } else if (time < 4.0) {
        // Cut 2: Ground Wide Angle
        camX = padPosition.x + 80;
        camY = 5;
        camZ = padPosition.z + 80;
        lookX = groupRef.current.position.x;
        lookY = height + 10;
        lookZ = groupRef.current.position.z;
      } else {
        // Cut 3: Hull-attached "GoPro" looking DOWN at the exhaust
        camX = groupRef.current.position.x + 4;
        camY = height + 15;
        camZ = groupRef.current.position.z + 4;
        lookX = groupRef.current.position.x;
        lookY = height - 20; // Look down
        lookZ = groupRef.current.position.z;
      }
      
      // Apply launch camera
      if (time < 4.0) {
        const shake = height < 300 ? (Math.random() - 0.5) * 1.5 : 0;
        state.camera.position.set(camX + shake, camY + shake, camZ + shake);
      } else {
        state.camera.position.set(camX, camY, camZ);
      }
      state.camera.lookAt(new THREE.Vector3(lookX, lookY, lookZ));
      
      if (height > 1000 && onExitComplete) onExitComplete();
      
    } else if (!landed) {
      // Falcon-style Vertical Landing Sequence
      timer.current += delta;
      const time = Math.min(timer.current, 6.0);
      
      // Exact physics fall (touches down at exactly t=6.0)
      groupRef.current.position.y = 800 - 266.66 * time + 22.22 * Math.pow(time, 2);

      // Vertical Descent Physics
      groupRef.current.rotation.x = 0; // Always vertical
      
      // Leg Deployment Logic (starts at 4.5s)
      if (time >= 4.5) {
        const deployProgress = (time - 4.5) / 1.5;
        const ease = -(Math.cos(Math.PI * deployProgress) - 1) / 2; 
        const targetLegAngle = Math.PI / 2.5; // ~72 degrees
        [leg1Ref, leg2Ref, leg3Ref, leg4Ref].forEach(leg => {
          if (leg.current) leg.current.rotation.x = targetLegAngle * ease;
        });
        
        if (flameRef.current) {
          flameRef.current.scale.set(2.0, 4.0 + Math.random() * 2.0, 2.0); // Landing burn
          (flameRef.current.material as THREE.MeshBasicMaterial).opacity = 1.0;
          flameRef.current.position.y = -(flameRef.current.scale.y * 6) / 2;
        }
      } else {
        if (flameRef.current) flameRef.current.scale.set(0, 0, 0); 
        [leg1Ref, leg2Ref, leg3Ref, leg4Ref].forEach(leg => {
          if (leg.current) leg.current.rotation.x = 0;
        });
      }

      // LANDING CINEMATICS (Multiple Cuts in 6 seconds)
      let camY = height;
      let camRadius = 80;
      let camAngle = 0;
      let lookAtY = height;

      if (time < 1.5) {
        // Cut 1: Extreme Wide Tracking (Sky)
        camY = height + 20;
        camRadius = 120;
        camAngle = Math.PI * 0.2;
        lookAtY = height;
      } else if (time < 3.0) {
        // Cut 2: Hull-attached "GoPro" (Looking down at the ground)
        camY = height + 10;
        camRadius = 5;
        camAngle = Math.PI * 0.8;
        lookAtY = height - 50; // Look straight down
      } else if (time < 4.5) {
        // Cut 3: Ground Pad Camera (Looking UP at the plummeting rocket)
        camY = 2;
        camRadius = 25;
        camAngle = Math.PI * 1.3;
        lookAtY = height;
      } else {
        // Cut 4: Hero Touchdown Shot (Mid-distance, low angle, showing legs deploy)
        camY = 5;
        camRadius = 55;
        camAngle = Math.PI * 0.7;
        lookAtY = height + 10; 
      }
      
      const cx = padPosition.x + Math.cos(camAngle) * camRadius;
      const cz = padPosition.z + Math.sin(camAngle) * camRadius;
      
      // Hard cuts by strictly setting position instead of lerping
      state.camera.position.set(cx, camY, cz);
      state.camera.lookAt(new THREE.Vector3(groupRef.current.position.x, lookAtY, groupRef.current.position.z));
      
      if (time >= 6.0) {
        groupRef.current.position.y = 0;
        setLanded(true);
        onLanded();
      }
    } else {
      if (flameRef.current) {
        flameRef.current.scale.y = 0;
      }
    }
  });

  // Leg geometry component for reuse
  const Leg = ({ rotationY }: { rotationY: number }) => {
    const legRef = 
      rotationY === 0 ? leg1Ref :
      rotationY === Math.PI / 2 ? leg2Ref :
      rotationY === Math.PI ? leg3Ref : leg4Ref;

    return (
      <group rotation={[0, rotationY, 0]}>
        {/* Hinge point is near the bottom edge of the hull */}
        <group position={[0, 2, 1.2]} ref={legRef}>
          {/* Main carbon-fiber strut */}
          <mesh position={[0, -2, 0]} rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 6, 0.1]} />
            <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Landing Pad foot */}
          <mesh position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
            <meshStandardMaterial color="#333333" roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  };

  return (
    <>
      <group ref={groupRef}>
        
        {/* Main 1st Stage Fuselage */}
        <mesh position={[0, 10, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.2, 20, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
        </mesh>
        
        {/* Black Interstage section */}
        <mesh position={[0, 21, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.2, 2, 32]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
        
        {/* 2nd Stage / Fairing Base */}
        <mesh position={[0, 24, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.2, 4, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        
        {/* Fairing Nose Cone */}
        <mesh position={[0, 28.5, 0]} castShadow>
          <coneGeometry args={[1.2, 5, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        
        {/* Grid Fins (Titanium) */}
        {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((rot, i) => (
          <group key={i} position={[0, 21.5, 0]} rotation={[0, rot, 0]}>
            <mesh position={[0, 0, 1.3]} castShadow>
              <boxGeometry args={[0.8, 1.5, 0.05]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} wireframe={true} />
            </mesh>
          </group>
        ))}

        {/* Engine Bay Base (Octaweb style) */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.3, 1, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>

        {/* 4 Deployable Landing Legs */}
        <Leg rotationY={0} />
        <Leg rotationY={Math.PI / 2} />
        <Leg rotationY={Math.PI} />
        <Leg rotationY={Math.PI * 1.5} />

        {/* Exhaust Flame (Merlin Engine thrust) */}
        <mesh ref={flameRef} position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.2, 6, 16]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Independent Dust/Smoke Particle System at the Pad */}
      <group ref={smokeRef} position={[padPosition.x, 0.5, padPosition.z]}>
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh key={`smoke-${i}`} visible={false}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#cbd5e1" transparent opacity={0.6} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function RocketPad({ position }: { position: THREE.Vector3 }) {
  return (
    <group position={[position.x, 0.05, position.z]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[12, 12, 0.1, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[4, 7, 32]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[11, 11.5, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
    </group>
  );
}

// The Flyable Airplane Component
function Airplane({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const keys = useKeyboardControls();
  const { camera } = useThree();
  
  const pitch = useRef(0);
  const roll = useRef(0);
  const yaw = useRef(0);

  useFrame((state, delta) => {
    if (!active || !groupRef.current) return;

    const speed = 15.0; 
    const turnSpeed = 1.5;

    // Roll (A/D) - A banks left (+Z), D banks right (-Z)
    if (keys.a) roll.current = THREE.MathUtils.lerp(roll.current, Math.PI / 3, 0.05);
    else if (keys.d) roll.current = THREE.MathUtils.lerp(roll.current, -Math.PI / 3, 0.05);
    else roll.current = THREE.MathUtils.lerp(roll.current, 0, 0.05);

    // Pitch (W/S) - W pitches up (-X), S pitches down (+X)
    if (keys.w) pitch.current = THREE.MathUtils.lerp(pitch.current, -Math.PI / 6, 0.05);
    else if (keys.s) pitch.current = THREE.MathUtils.lerp(pitch.current, Math.PI / 6, 0.05);
    else pitch.current = THREE.MathUtils.lerp(pitch.current, 0, 0.05);

    // Apply rotation
    groupRef.current.rotation.z = roll.current;
    groupRef.current.rotation.x = pitch.current;
    
    // Yaw turns left (+Y) when banked left (+Z)
    yaw.current += roll.current * delta * turnSpeed;
    groupRef.current.rotation.y = yaw.current;

    // Move Forward
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(groupRef.current.quaternion);
    direction.normalize();
    
    groupRef.current.position.addScaledVector(direction, speed * delta);
    
    if (groupRef.current.position.y < 2) groupRef.current.position.y = 2;

    const idealOffset = new THREE.Vector3(0, 4, -12);
    idealOffset.applyQuaternion(groupRef.current.quaternion);
    idealOffset.add(groupRef.current.position);

    const idealLookAt = new THREE.Vector3(0, 0, 20);
    idealLookAt.applyQuaternion(groupRef.current.quaternion);
    idealLookAt.add(groupRef.current.position);

    camera.position.lerp(idealOffset, 0.1);
    camera.lookAt(idealLookAt);
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[0, 40, 0]}>
      {/* Main Fuselage (Red) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.6, 3.5, 8, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>

      {/* Underbelly (White) */}
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.55, 3.5, 8, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* Cockpit Window */}
      <mesh position={[0, 0.25, 2.0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} />
      </mesh>

      {/* Passenger Windows (Black Stripes on Sides) */}
      <mesh position={[0, 0.1, 0.2]} castShadow>
        <boxGeometry args={[1.25, 0.2, 2.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} />
      </mesh>

      {/* Main Wings (White) */}
      <mesh position={[0, -0.2, 0.2]} castShadow>
        <boxGeometry args={[7, 0.1, 1.5]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

      {/* Left Engine */}
      <group position={[-1.8, -0.6, 0.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 12]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Right Engine */}
      <group position={[1.8, -0.6, 0.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 12]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Vertical Tail Fin (Red) */}
      <mesh position={[0, 1.0, -2.0]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 1.5, 1.2]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Horizontal Tail Wings (White) */}
      <mesh position={[0, 0.2, -2.2]} castShadow>
        <boxGeometry args={[3, 0.1, 1.0]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
    </group>
  );
}

export default function PlanetSurface({ 
  repoData, 
  token, 
  owner, 
  adventureMode = false,
  triggerExit = false,
  onExitComplete 
}: { 
  repoData: any, 
  token?: string, 
  owner?: string, 
  adventureMode?: boolean,
  triggerExit?: boolean,
  onExitComplete?: () => void
}) {
  const commits = Number(repoData?.commits) || 0;
  const isHabitable = commits >= 20;

  const [nodes, setNodes] = useState<RepoFileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredFile, setHoveredFile] = useState<any>(null);
  const [rocketLanded, setRocketLanded] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const data = await fetchRepoTree(owner || repoData?.owner?.login, repoData.name, token);
      if (active) {
        setNodes(data.slice(0, 400));
        setLoading(false);
      }
    };
    if (repoData.name) {
      load();
    }
    return () => { active = false; };
  }, [repoData, token, owner]);

  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const { houses, colonies, roads, poles, trees, terrainColor } = useMemo(() => {
    if (!nodes.length) return { houses: [], colonies: [], roads: [], poles: [], trees: [], terrainColor: "#65963c" };
    
    const hash = Math.abs(hashCode(repoData?.name || ""));
    const hue = hash % 360;
    const saturation = isHabitable ? 40 + (hash % 30) : 20 + (hash % 20);
    const lightness = isHabitable ? 40 + (hash % 20) : 30 + (hash % 20);
    const terrainColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    const hList: any[] = [];
    const cList: any[] = [];
    const rList: any[] = [];
    const pList: any[] = [];
    const tList: any[] = [];
    
    const pathMap = new Map<string, any>();
    
    const virtualRoot = {
      path: '',
      name: repoData?.name || 'Root',
      type: 'tree',
      depth: 0,
      children: [] as any[]
    };
    
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

    nodes.forEach(node => {
      const parent = pathMap.get(node.path);
      if (parent.parentPath && pathMap.has(parent.parentPath)) {
        pathMap.get(parent.parentPath).children.push(parent);
      } else {
        virtualRoot.children.push(parent);
      }
    });

    const assignPositions = (node: any, px: number, pz: number, angleStart: number, angleEnd: number, depth: number) => {
      const py = 0; 
      
      const files = node.children.filter((c: any) => c.type === 'blob');
      const subfolders = node.children.filter((c: any) => c.type === 'tree');
      
      const cols = Math.max(1, Math.ceil(Math.sqrt(files.length)));
      const spacing = 5.0;
      
      // Ensure the root colony has extra radius so buildings don't clip into the Rocket Pad
      const extraRadius = depth === 1 ? 15 : 4; 
      const colonyRadius = Math.max(extraRadius, (cols * spacing) / 2 + extraRadius);
      
      cList.push({
        x: px, y: py, z: pz, 
        radius: colonyRadius,
        name: node.name,
        path: node.path || '/',
        isRoot: depth === 1
      });

      // Shift buildings in the root outward so they avoid the massive rocket pad at (0,0)
      const rootOffset = depth === 1 ? 12 : 0;

      files.forEach((file: any, index: number) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const localX = (col - cols/2 + 0.5) * spacing;
        const localZ = (row - cols/2 + 0.5) * spacing;
        
        // Push root buildings away from center
        const offsetVec = new THREE.Vector2(localX, localZ);
        if (depth === 1 && offsetVec.length() < 1) {
          offsetVec.set(1, 1);
        }
        if (depth === 1) {
          offsetVec.normalize().multiplyScalar(offsetVec.length() + rootOffset);
        }

        const hx = px + offsetVec.x;
        const hz = pz + offsetVec.y;
        
        const isOffice = file.size && file.size > 2000;
        
        const width = isOffice ? 1.8 : 1.4;
        const depthObj = isOffice ? 1.8 : 1.4;
        const height = isOffice 
          ? 4 + Math.min(20, file.size / 1500) 
          : 1.5 + Math.random(); 
        
        hList.push({
          x: hx, y: py + 0.5, z: hz, w: width, h: height, d: depthObj,
          name: file.name,
          type: file.type,
          size: file.size,
          path: file.path,
          isOffice
        });
      });

      if (node.parentPath !== undefined && depth > 1) { 
        const parentPath = node.parentPath === '' ? '/' : node.parentPath;
        const parentNode = cList.find(c => c.path === parentPath);
        if (parentNode) {
          const start = new THREE.Vector3(parentNode.x, parentNode.y + 0.25, parentNode.z);
          const end = new THREE.Vector3(px, py + 0.25, pz);
          
          rList.push({ start, end });
          
          const dist = start.distanceTo(end);
          const numPoles = Math.floor(dist / 15);
          for (let i = 1; i <= numPoles; i++) {
            const t = i / (numPoles + 1);
            const polePos = new THREE.Vector3().lerpVectors(start, end, t);
            
            const dir = new THREE.Vector3().subVectors(end, start).normalize();
            const right = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(2.0);
            polePos.add(right);
            
            pList.push({ x: polePos.x, y: polePos.y, z: polePos.z, angle: Math.atan2(dir.z, dir.x) });
          }
        }
      }

      if (subfolders.length === 0) return;

      const angleStep = (angleEnd - angleStart) / subfolders.length;
      const distToSubColony = Math.max(colonyRadius + 40, 100 - depth * 10);
      
      subfolders.forEach((child: any, i: number) => {
        const childAngle = angleStart + angleStep * i + (angleStep / 2);
        const cx = px + Math.cos(childAngle) * distToSubColony;
        const cz = pz + Math.sin(childAngle) * distToSubColony;
        assignPositions(child, cx, cz, angleStart + angleStep * i, angleStart + angleStep * (i + 1), depth + 1);
      });
    };

    // Restrict root children to a wedge (from 0.2 PI to 1.8 PI) 
    // This leaves the wedge around 0 radians (+X direction) completely empty!
    assignPositions(virtualRoot, 0, 0, Math.PI * 0.2, Math.PI * 1.8, 1);

    // Add manual road connecting Rocket Pad (+X) to Capital City (0,0)
    rList.push({
      start: new THREE.Vector3(120, 0.25, 0),
      end: new THREE.Vector3(0, 0.25, 0)
    });

    if (isHabitable) {
      for (let i = 0; i < 300; i++) {
        const tx = (Math.random() - 0.5) * 600;
        const tz = (Math.random() - 0.5) * 600;
        if (Math.abs(tx) > 30 && Math.abs(tz) > 30) {
           tList.push({ x: tx, y: 0, z: tz, size: 0.6 + Math.random() * 0.6 });
        }
      }
    }

    return { houses: hList, colonies: cList, roads: rList, poles: pList, trees: tList, terrainColor };
  }, [nodes, isHabitable, repoData]);

  const matTerrain = useMemo(() => new THREE.MeshStandardMaterial({ color: terrainColor, roughness: 1.0 }), [terrainColor]);
  const matPavement = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9ca3af", roughness: 0.8 }), []);
  const matRoad = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4b5563", roughness: 0.9 }), []);
  
  const matTreeLeaves = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2d5a27", roughness: 0.9 }), []);
  const matTreeTrunk = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5c4033", roughness: 1.0 }), []);

  const matHouseBody = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f3f4f6", roughness: 0.7 }), []);
  const matHouseRoof = useMemo(() => new THREE.MeshStandardMaterial({ color: "#374151", roughness: 0.9 }), []);
  
  const matOfficeGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#aaddff",
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.5,
    clearcoat: 1.0
  }), []);

  const matPole = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4b3621", roughness: 0.9 }), []);

  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1200, 1200, 10, 10);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const showCity = !loading && rocketLanded;
  const padPosition = useMemo(() => new THREE.Vector3(120, 0, 0), []);

  return (
    <>
      <Sky distance={450000} sunPosition={[100, 60, 20]} inclination={0.1} azimuth={0.25} />
      <fog attach="fog" args={["#bde0fe", 150, 800]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[150, 200, 100]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} />

      <OrbitControls 
        enableZoom={true} 
        maxDistance={600} 
        minDistance={5} 
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={!adventureMode && showCity && !triggerExit}
        autoRotateSpeed={0.1}
        enabled={!adventureMode && showCity && !triggerExit}
      />

      <Airplane active={adventureMode && showCity} />

      <group>
        <mesh geometry={terrainGeo} material={matTerrain} receiveShadow position={[0, -0.1, 0]} />

        {/* The Sci-Fi Rocket Pad completely separated from the city */}
        <RocketPad position={padPosition} />

        {/* The Landing & Launching Rocket */}
        <SpaceXRocket 
          isExiting={triggerExit} 
          onExitComplete={onExitComplete} 
          onLanded={() => setRocketLanded(true)}
          padPosition={padPosition}
        />

        {showCity && (
          <>
            {colonies.map((col, i) => (
              <group key={`col-${i}`} position={[col.x, col.y, col.z]}>
                <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
                  <cylinderGeometry args={[col.radius, col.radius, 0.5, 48]} />
                  <primitive object={matPavement} attach="material" />
                </mesh>
                
                <Billboard position={[0, 5, 0]}>
                  <Text fontSize={3.5} color="#1f2937" anchorX="center" anchorY="middle" outlineWidth={0.1} outlineColor="#ffffff">
                    /{col.name}
                  </Text>
                </Billboard>
              </group>
            ))}

            {roads.map((r, i) => {
              const dist = r.start.distanceTo(r.end);
              const center = new THREE.Vector3().addVectors(r.start, r.end).multiplyScalar(0.5);
              const angle = Math.atan2(r.end.z - r.start.z, r.end.x - r.start.x);
              return (
                <mesh key={`road-${i}`} position={center} rotation={[0, -angle, 0]} receiveShadow>
                  <boxGeometry args={[dist, 0.05, 4]} />
                  <primitive object={matRoad} attach="material" />
                </mesh>
              );
            })}

            {poles.map((p, i) => (
              <group key={`pole-${i}`} position={[p.x, p.y, p.z]} rotation={[0, -p.angle, 0]}>
                <mesh position={[0, 2, 0]} castShadow>
                  <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
                  <primitive object={matPole} attach="material" />
                </mesh>
                <mesh position={[0, 3.8, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
                  <primitive object={matPole} attach="material" />
                </mesh>
              </group>
            ))}

            {trees.map((t, i) => (
              <group key={`tree-${i}`} position={[t.x, t.y, t.z]} scale={[t.size, t.size, t.size]}>
                <mesh position={[0, 1, 0]} castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
                  <primitive object={matTreeTrunk} attach="material" />
                </mesh>
                <mesh position={[0, 3, 0]} castShadow>
                  <coneGeometry args={[1.5, 4, 8]} />
                  <primitive object={matTreeLeaves} attach="material" />
                </mesh>
              </group>
            ))}

            {houses.map((h, i) => (
              <group 
                key={`house-${i}`} 
                position={[h.x, h.y, h.z]}
                onPointerOver={(e) => { e.stopPropagation(); setHoveredFile(h); }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredFile(null); }}
              >
                {h.isOffice ? (
                  <mesh position={[0, h.h / 2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[h.w, h.h, h.d]} />
                    <primitive object={matOfficeGlass} attach="material" />
                  </mesh>
                ) : (
                  <group>
                    <mesh position={[0, h.h / 2, 0]} castShadow receiveShadow>
                      <boxGeometry args={[h.w, h.h, h.d]} />
                      <primitive object={matHouseBody} attach="material" />
                    </mesh>
                    <mesh position={[0, h.h + 0.4, 0]} rotation={[0, Math.PI/4, 0]} castShadow>
                      <coneGeometry args={[h.w * 0.8, 0.8, 4]} />
                      <primitive object={matHouseRoof} attach="material" />
                    </mesh>
                  </group>
                )}

                {hoveredFile?.path === h.path && !adventureMode && (
                  <Html center position={[0, h.h + 2, 0]} zIndexRange={[100, 0]}>
                    <div className="px-3 py-2 bg-white/95 text-gray-900 text-xs rounded border border-gray-200 shadow-xl flex flex-col gap-1 w-max min-w-[120px] pointer-events-none">
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
