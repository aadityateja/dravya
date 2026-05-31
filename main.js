import { initWorld } from "./world.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// INIT WORLD
const tick = initWorld(scene, camera, renderer);

// LOOP
function animate() {
  requestAnimationFrame(animate);
  tick();
  renderer.render(scene, camera);
}
animate();
