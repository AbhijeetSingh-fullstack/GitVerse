import './style.css'
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Tailwind UI Overlay
const overlay = document.createElement('div');
overlay.className = "absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center justify-center";
overlay.innerHTML = `
  <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 text-center pointer-events-auto">
    <h1 class="text-4xl font-extrabold text-white mb-4 tracking-tight">Three.js + Tailwind</h1>
    <p class="text-lg text-white/80 font-medium">Your setup is ready.</p>
    <button class="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold rounded-lg shadow-lg">
      Get Started
    </button>
  </div>
`;
document.body.appendChild(overlay);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
