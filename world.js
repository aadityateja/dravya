// ================= SCENE =================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0f1a, 10, 120);

// CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ================= LIGHT =================
const sun = new THREE.DirectionalLight(0xffcc88, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

const ambient = new THREE.AmbientLight(0x333344);
scene.add(ambient);

// ================= GROUND =================
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x1b2a1f })
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// ================= CASTLE =================
const castle = new THREE.Mesh(
  new THREE.BoxGeometry(8, 6, 8),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
castle.position.set(0, 3, -40);
scene.add(castle);

// glow state
let castleAwake = false;

// ================= LAKE (START ZONE) =================
const lake = new THREE.Mesh(
  new THREE.CircleGeometry(8, 32),
  new THREE.MeshStandardMaterial({ color: 0x1b4d8f })
);
lake.rotation.x = -Math.PI/2;
lake.position.set(0, 0.01, 5);
scene.add(lake);

// ================= CANDLE =================
const candle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 1),
  new THREE.MeshStandardMaterial({ color: 0xfff2cc })
);
candle.position.set(2, 0.5, 5);
scene.add(candle);

// ================= SMOKE PARTICLES =================
const smokeParticles = [];
let smokeActive = false;

function spawnSmoke() {
  for (let i = 0; i < 200; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: 0xcccccc })
    );
    p.position.set(2, 1, 5);
    p.velocity = new THREE.Vector3(
      (Math.random()-0.5)*0.02,
      Math.random()*0.05,
      (Math.random()-0.5)*0.02
    );
    scene.add(p);
    smokeParticles.push(p);
  }
}

// ================= PLAYER =================
const player = { x:0, z:10, speed:0.15 };
const keys = {};

document.addEventListener("keydown", e=>{
  keys[e.key.toLowerCase()] = true;

  // LIGHT CANDLE
  if (e.code === "Space" && !smokeActive) {
    smokeActive = true;
    spawnSmoke();
  }
});

document.addEventListener("keyup", e=>keys[e.key.toLowerCase()] = false);

// mouse look
let rotY = 0;
let dragging = false;

document.addEventListener("mousedown", ()=>dragging=true);
document.addEventListener("mouseup", ()=>dragging=false);
document.addEventListener("mousemove", e=>{
  if(dragging) rotY -= e.movementX*0.002;
});

// ================= SUNSET TIMER =================
let time = 0;

// ================= UPDATE =================
function update() {

  // movement
  if(keys["w"]) player.z -= player.speed;
  if(keys["s"]) player.z += player.speed;
  if(keys["a"]) player.x -= player.speed;
  if(keys["d"]) player.x += player.speed;

  camera.position.x = player.x - Math.sin(rotY)*10;
  camera.position.z = player.z - Math.cos(rotY)*10;
  camera.position.y = 5;
  camera.lookAt(player.x, 1, player.z);

  // ================= SUNSET SHIFT =================
  time += 0.001;
  sun.intensity = 1 - time;
  scene.fog.color.setHSL(0.6, 0.5, 0.1 + time*0.3);

  // ================= SMOKE UPDATE =================
  if(smokeActive) {
    smokeParticles.forEach(p=>{
      p.position.add(p.velocity);
      p.scale.multiplyScalar(1.01);
      p.material.opacity = 1 - time;
    });

    // trigger castle when smoke "reaches distance"
    if(time > 0.3 && !castleAwake) {
      castleAwake = true;
      sun.color.set(0xff3300);
    }
  }

  // ================= CASTLE AWAKENING =================
  if(castleAwake) {
    castle.material.emissive = new THREE.Color(0x330000);
    castle.rotation.y += 0.002;
  }
}

// ================= RENDER LOOP =================
function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}
animate();

// ================= RESIZE =================
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
