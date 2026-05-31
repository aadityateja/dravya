const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0f1a, 10, 120);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT
scene.add(new THREE.AmbientLight(0x555555));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(10,20,10);
scene.add(dir);

// GROUND
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200),
  new THREE.MeshStandardMaterial({ color: 0x1c2d1c })
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// ================= PLAYER (PIXEL EXPLORER) =================
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1,2,1),
  new THREE.MeshStandardMaterial({ color: 0xffcc66 })
);
player.position.y = 1;
scene.add(player);

// ================= WORLD OBJECTS =================

// 🏰 CASTLE (Research Hub)
const castle = new THREE.Mesh(
  new THREE.BoxGeometry(8,6,8),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
castle.position.set(20,3,-20);
scene.add(castle);

// 🌊 RIVER (Journey Path)
const river = new THREE.Mesh(
  new THREE.PlaneGeometry(5,80),
  new THREE.MeshStandardMaterial({ color: 0x1e5eff })
);
river.rotation.x = -Math.PI/2;
river.position.set(-10,0,0);
scene.add(river);

// 🌲 FOREST ZONE
for(let i=0;i<30;i++){
  const tree = new THREE.Mesh(
    new THREE.ConeGeometry(0.8,2,6),
    new THREE.MeshStandardMaterial({ color: 0x145a32 })
  );
  tree.position.set(
    (Math.random()-0.5)*60,
    1,
    (Math.random()-0.5)*60
  );
  scene.add(tree);
}

// 💎 BLUE CRYSTAL (DRAVYA TRIGGER)
const crystal = new THREE.Mesh(
  new THREE.OctahedronGeometry(1),
  new THREE.MeshStandardMaterial({
    color: 0x3aa0ff,
    emissive: 0x1a4fff
  })
);
crystal.position.set(-20,1,-10);
scene.add(crystal);

// CAMERA OFFSET
camera.position.set(0,8,10);

// ================= CONTROLS =================
const keys = {};

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ================= MOVEMENT =================
function update(){
  if(keys["w"]) player.position.z -= 0.2;
  if(keys["s"]) player.position.z += 0.2;
  if(keys["a"]) player.position.x -= 0.2;
  if(keys["d"]) player.position.x += 0.2;

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 10;
  camera.lookAt(player.position);

  // ================= INTERACTIONS =================
  const dCastle = player.position.distanceTo(castle.position);
  const dCrystal = player.position.distanceTo(crystal.position);

  if(dCastle < 3){
    showUI("🏰 Castle: Research, Projects, AI, Physics");
  }

  if(dCrystal < 2){
    showUI("💎 DRAVYA MODE: spacetime, imagination, abstraction");
  }
}

// ================= UI =================
const ui = document.createElement("div");
ui.style.position="absolute";
ui.style.top="10px";
ui.style.left="10px";
ui.style.color="#fff";
ui.style.fontFamily="monospace";
document.body.appendChild(ui);

function showUI(text){
  ui.innerHTML = text;
}

// ================= LOOP =================
function loop(){
  requestAnimationFrame(loop);
  update();
  renderer.render(scene,camera);
}
loop();

window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
