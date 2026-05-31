// ================= SCENE =================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0f1a, 20, 120);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHTS
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

scene.add(new THREE.AmbientLight(0x444444));

// ================= GROUND (CV WORLD BASE) =================
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1b2a1f });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ================= CASTLE (YOU - MAIN PROFILE HUB) =================
const castle = new THREE.Group();

const base = new THREE.Mesh(
  new THREE.BoxGeometry(6, 3, 6),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
base.position.y = 1.5;
castle.add(base);

const tower = new THREE.Mesh(
  new THREE.CylinderGeometry(1.2, 1.5, 6, 8),
  new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
tower.position.set(2, 4, 2);
castle.add(tower);

castle.position.set(0, 0, 0);
scene.add(castle);

// ================= FOREST (EXPERIENCE ZONE) =================
for (let i = 0; i < 20; i++) {
  const tree = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 2, 6),
    new THREE.MeshStandardMaterial({ color: 0x145a32 })
  );

  tree.position.set(
    (Math.random() - 0.5) * 60,
    1,
    (Math.random() - 0.5) * 60
  );

  scene.add(tree);
}

// ================= SHRINE (ACHIEVEMENTS) =================
const shrine = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x7c4dff, emissive: 0x3a1a80 })
);
shrine.position.set(10, 1, -8);
scene.add(shrine);

// ================= CONTROLS =================
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// MOUSE LOOK (simple)
let mouseDown = false;
let rotY = 0;

document.addEventListener("mousedown", () => mouseDown = true);
document.addEventListener("mouseup", () => mouseDown = false);

document.addEventListener("mousemove", (e) => {
  if (mouseDown) rotY -= e.movementX * 0.002;
});

// ================= PLAYER STATE =================
const player = {
  x: 0,
  z: 10,
  speed: 0.2
};

// ================= UPDATE LOOP =================
function update() {

  // movement
  if (keys["w"]) player.z -= player.speed;
  if (keys["s"]) player.z += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // camera follow (3rd person medieval feel)
  camera.position.x = player.x - Math.sin(rotY) * 10;
  camera.position.z = player.z - Math.cos(rotY) * 10;
  camera.position.y = 5;

  camera.lookAt(player.x, 1, player.z);
}

// ================= RENDER LOOP =================
function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
