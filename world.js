// ================= WORLD.JS =================
// DRAVYA WORLD MODULE (CLEAN VERSION)

export function initWorld(scene, camera, renderer) {

  // ================= LIGHT =================
  scene.add(new THREE.AmbientLight(0x666666));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

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

  // ================= CASTLE =================
  const castle = new THREE.Mesh(
    new THREE.BoxGeometry(8, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  castle.position.set(20, 3, -20);
  scene.add(castle);

  // ================= RIVER =================
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 80),
    new THREE.MeshStandardMaterial({ color: 0x1e5eff })
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(-10, 0.01, 0);
  scene.add(river);

  // ================= FOREST =================
  const trees = [];

  for (let i = 0; i < 30; i++) {
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
    trees.push(tree);
  }

  // ================= CRYSTAL =================
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(1),
    new THREE.MeshStandardMaterial({
      color: 0x3aa0ff,
      emissive: 0x1a4fff
    })
  );

  crystal.position.set(-20, 1, -10);
  scene.add(crystal);

  // ================= STARS =================
  const starGeo = new THREE.BufferGeometry();
  const starCount = 300;
  const starPositions = [];

  for (let i = 0; i < starCount; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 400,
      Math.random() * 200 + 50,
      (Math.random() - 0.5) * 400
    );
  }

  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
  );

  scene.add(stars);

  // ================= CLOUDS =================
  const clouds = [];

  for (let i = 0; i < 15; i++) {
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(2 + Math.random() * 2, 6, 6),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
      })
    );

    cloud.position.set(
      (Math.random() - 0.5) * 200,
      25 + Math.random() * 10,
      (Math.random() - 0.5) * 200
    );

    scene.add(cloud);
    clouds.push(cloud);
  }

  // ================= CONTROLS =================
  const keys = {};

  document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
  document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

  // ================= UI =================
  const ui = document.createElement("div");
  ui.style.position = "absolute";
  ui.style.top = "10px";
  ui.style.left = "10px";
  ui.style.color = "white";
  ui.style.fontFamily = "monospace";
  ui.style.background = "rgba(0,0,0,0.4)";
  ui.style.padding = "10px";
  ui.style.borderRadius = "8px";
  document.body.appendChild(ui);

  function showUI(text) {
    ui.innerHTML = text;
  }

  // ================= UPDATE LOOP HOOK =================
  function update() {

    // PLAYER MOVEMENT
    if (keys["w"]) player.position.z -= 0.2;
    if (keys["s"]) player.position.z += 0.2;
    if (keys["a"]) player.position.x -= 0.2;
    if (keys["d"]) player.position.x += 0.2;

    // CAMERA FOLLOW
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 10;
    camera.position.y = 8;
    camera.lookAt(player.position);

    // INTERACTIONS
    const dCastle = player.position.distanceTo(castle.position);
    const dCrystal = player.position.distanceTo(crystal.position);

    if (dCastle < 3) {
      showUI("🏰 Castle: Research Hub / AI / Physics / Projects");
    } 
    else if (dCrystal < 2) {
      showUI("💎 DRAVYA MODE: spacetime abstraction active");
    } 
    else {
      showUI("WASD to move | Explore the world 🌍");
    }

    // CLOUD ANIMATION
    clouds.forEach(c => {
      c.position.x += 0.02;
      if (c.position.x > 100) c.position.x = -100;
    });

    // STAR ANIMATION
    stars.rotation.y += 0.0003;
  }

  // ================= RETURN LOOP FUNCTION =================
  return function tick() {
    update();
  };
}
