import * as THREE from 'three';

export interface BiomeConfig {
  id: string;
  name: string;
  skyColor: string;
  fogColor: string;
  ambientLight: number;
  sunColor: string;
  groundMat: THREE.MeshStandardMaterialParameters;
  towerMat: THREE.MeshStandardMaterialParameters;
  domeMat: THREE.MeshPhysicalMaterialParameters;
  baseMat: THREE.MeshStandardMaterialParameters;
}

export const BIOMES: Record<string, BiomeConfig> = {
  mars: {
    id: 'mars',
    name: 'Mars Colony',
    skyColor: '#e59a7a',
    fogColor: '#e59a7a',
    ambientLight: 0.6,
    sunColor: '#ffb380',
    groundMat: { color: "#bd5e3b", roughness: 0.9, flatShading: true },
    towerMat: { color: "#334155", metalness: 0.5, roughness: 0.4, flatShading: true },
    domeMat: { color: "#cbd5e1", transmission: 0.8, opacity: 0.9, transparent: true, roughness: 0.1 },
    baseMat: { color: "#1e293b", roughness: 0.8 }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    skyColor: '#0a0a1a',
    fogColor: '#0f0f2a',
    ambientLight: 0.3,
    sunColor: '#00ffff',
    groundMat: { color: "#111122", roughness: 0.5, metalness: 0.8, flatShading: true },
    towerMat: { color: "#000000", metalness: 1.0, roughness: 0.1, flatShading: true },
    domeMat: { color: "#ff00ff", transmission: 0.9, opacity: 0.8, transparent: true, roughness: 0.0 },
    baseMat: { color: "#222233", roughness: 0.6 }
  },
  lunar: {
    id: 'lunar',
    name: 'Lunar Base',
    skyColor: '#000000',
    fogColor: '#111111',
    ambientLight: 0.2,
    sunColor: '#ffffff',
    groundMat: { color: "#888888", roughness: 1.0, flatShading: true },
    towerMat: { color: "#ffffff", metalness: 0.2, roughness: 0.8, flatShading: true },
    domeMat: { color: "#aaddff", transmission: 0.5, opacity: 0.9, transparent: true, roughness: 0.3 },
    baseMat: { color: "#444444", roughness: 0.9 }
  }
};
