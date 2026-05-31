// ================= SCENE =================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b1020, 0.003);

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ================= LIGHT =================
scene.add(new THREE.AmbientLight(0x666666));

const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(10, 20, 10);
scene.add(dir);

// ================= GROUND =================
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x1c2d1c })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ================= PLAYER =================
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0xffcc66 })
);
player.position.y = 1;
scene.add(player);

// ================= CASTLE (CV HUB) =================
const castle = new THREE.Mesh(
  new THREE.BoxGeometry(8, 6, 8),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
castle.position.set(20, 3, -20);
scene.add(castle);

// ================= CRYSTAL (PROJECTS PORTAL) =================
const crystal = new THREE.Mesh(
  new THREE.OctahedronGeometry(1),
  new THREE.MeshStandardMaterial({
    color: 0x3aa0ff,
    emissive: 0x1a4fff
  })
);
crystal.position.set(-20, 1, -10);
scene.add(crystal);

// ================= FOREST =================
for (let i = 0; i < 25; i++) {
  const tree = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 2, 6),
    new THREE.MeshStandardMaterial({ color: 0x145a32 })
  );

  tree.position.set(
    (Math.random() - 0.5) * 60,
    1,
    (Math.random() - 0.5) * 60
  );

  scene.add(tree);
}

// ================= STARS =================
const starGeo = new THREE.BufferGeometry();
const starCount = 250;
const pos = [];

for (let i = 0; i < starCount; i++) {
  pos.push(
    (Math.random() - 0.5) * 400,
    Math.random() * 200 + 50,
    (Math.random() - 0.5) * 400
  );
}

starGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));

const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
);

scene.add(stars);

// ================= CLOUDS =================
const clouds = [];

for (let i = 0; i < 10; i++) {
  const c = new THREE.Mesh(
    new THREE.SphereGeometry(2, 6, 6),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    })
  );

  c.position.set(
    (Math.random() - 0.5) * 150,
    25,
    (Math.random() - 0.5) * 150
  );

  scene.add(c);
  clouds.push(c);
}

// ================= CONTROLS =================
const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ================= UI =================
const ui = document.getElementById("ui");

function show(text) {
  ui.innerHTML = text;
}

// ================= CAMERA =================
camera.position.set(0, 8, 10);

// ================= LOOP =================
function animate() {
  requestAnimationFrame(animate);

  // movement
  if (keys["w"]) player.position.z -= 0.2;
  if (keys["s"]) player.position.z += 0.2;
  if (keys["a"]) player.position.x -= 0.2;
  if (keys["d"]) player.position.x += 0.2;

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 10;
  camera.lookAt(player.position);

  // interactions
  const dCastle = player.position.distanceTo(castle.position);
  const dCrystal = player.position.distanceTo(crystal.position);

  if (dCastle < 3) {
    show("🏰 CV HUB: Projects | Skills | Physics | AI Work");
  }
  else if (dCrystal < 2) {
    show("💎 DRAVYA PORTAL: Entering abstract physics space...");
  }
  else {
    show("WASD to explore DRAVYA world 🌍");
  }

  // animation
  clouds.forEach(c => {
    c.position.x += 0.02;
    if (c.position.x > 100) c.position.x = -100;
  });

  stars.rotation.y += 0.0003;

  renderer.render(scene, camera);
}

animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
