import * as THREE from "three";

/* =========================================================================
   DRAVYA — Interactive CV / Chaos Trajectory
   A life traced as one continuous path through a Lorenz attractor.
   The mathematics is a metaphor, not a literal claim about the events below.
   ========================================================================= */

/* ---------------------------------------------------------------------- *
 * 1. DATA — edit this to update the CV. Nothing else needs to change.
 * ---------------------------------------------------------------------- */

const CV_EVENTS = [
  { year: "1999", title: "Born in Mysore", desc: "" },
  { year: "2015", title: "10th grade", desc: "87.52%" },
  { year: "2017", title: "Pre-University", desc: "Physics · Chemistry · Mathematics · Electronics" },
  { year: "2017", title: "B.Sc Physics", desc: "Mathematics · Electronics" },
  { year: "2017", title: "First semester failure", desc: "" },
  { year: "2018", title: "Part-time job", desc: "" },
  { year: "2019", title: "Left the job", desc: "" },
  { year: "2020", title: "B.Sc completed", desc: "" },
  { year: "2023", title: "M.Sc Physics", desc: "" },
  { year: "2024", title: "Quantum mechanics", desc: "Nuclear / particle physics" },
  { year: "2025", title: "Zero Degree Calorimeter research", desc: "" },
  { year: "2025", title: "Machine learning reconstruction", desc: "" },
  { year: "2026", title: "M.Sc Physics completed", desc: "" },
  { year: "2026", title: "Naxxatra Sciences", desc: "" },
  { year: "2026", title: "Science communication", desc: "" },
  { year: "2026", title: "DRAVYA", desc: "" },
  { year: "2026", title: "Music", desc: "" },
  { year: "2026", title: "Fiction", desc: "" },
  { year: "2026", title: "Research", desc: "" },
  { year: "NOW", title: "The trajectory continues", desc: "" },
];

/* ---------------------------------------------------------------------- *
 * 2. ACCESSIBLE TEXT VERSION — always present in the DOM.
 * ---------------------------------------------------------------------- */

function populateAccessibleList() {
  const list = document.getElementById("accessible-cv-list");
  const frag = document.createDocumentFragment();
  CV_EVENTS.forEach((e) => {
    const li = document.createElement("li");
    const y = document.createElement("span");
    y.className = "accessible-cv__year";
    y.textContent = e.year;
    const t = document.createElement("p");
    t.className = "accessible-cv__item-title";
    t.textContent = e.title;
    li.appendChild(y);
    li.appendChild(t);
    if (e.desc) {
      const d = document.createElement("p");
      d.className = "accessible-cv__item-desc";
      d.textContent = e.desc;
      li.appendChild(d);
    }
    frag.appendChild(li);
  });
  list.appendChild(frag);
}
populateAccessibleList();

/* ---------------------------------------------------------------------- *
 * 3. REDUCED MOTION — bail out of the cinematic experience entirely.
 * ---------------------------------------------------------------------- */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  document.body.classList.add("reduced-motion");
  document.getElementById("motion-notice").hidden = false;
} else {
  runExperience();
}

/* ---------------------------------------------------------------------- *
 * 4. MATH HELPERS
 * ---------------------------------------------------------------------- */

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------------------------------------------------------------------- *
 * 5. LORENZ TRAJECTORY GENERATION (deterministic, RK4)
 * ---------------------------------------------------------------------- */

function generateLorenz({
  steps,
  dt,
  sigma = 10,
  rho = 28,
  beta = 8 / 3,
  warmup = 2000,
  seed = { x: 0.12, y: 0, z: 0 },
}) {
  let { x, y, z } = seed;

  const deriv = (x, y, z) => [
    sigma * (y - x),
    x * (rho - z) - y,
    x * y - beta * z,
  ];

  const step = (x, y, z) => {
    const k1 = deriv(x, y, z);
    const k2 = deriv(x + (dt / 2) * k1[0], y + (dt / 2) * k1[1], z + (dt / 2) * k1[2]);
    const k3 = deriv(x + (dt / 2) * k2[0], y + (dt / 2) * k2[1], z + (dt / 2) * k2[2]);
    const k4 = deriv(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2]);
    return [
      x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      y + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      z + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    ];
  };

  for (let i = 0; i < warmup; i++) [x, y, z] = step(x, y, z);

  const positions = new Float32Array(steps * 3);
  for (let i = 0; i < steps; i++) {
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    [x, y, z] = step(x, y, z);
  }

  // Recenter on the attractor's centroid so the object sits near the origin.
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < steps; i++) {
    cx += positions[i * 3];
    cy += positions[i * 3 + 1];
    cz += positions[i * 3 + 2];
  }
  cx /= steps; cy /= steps; cz /= steps;
  for (let i = 0; i < steps; i++) {
    positions[i * 3] -= cx;
    positions[i * 3 + 1] -= cy;
    positions[i * 3 + 2] -= cz;
  }

  return positions;
}

/* ---------------------------------------------------------------------- *
 * 6. GLOW TEXTURE (soft radial sprite, generated once on a canvas)
 * ---------------------------------------------------------------------- */

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(210,230,255,0.7)");
  grad.addColorStop(1, "rgba(210,230,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* ---------------------------------------------------------------------- *
 * 7. MAIN EXPERIENCE
 * ---------------------------------------------------------------------- */

function runExperience() {
  const isMobile = window.innerWidth < 768;

  /* ---- Trajectory ---- */
  const STEPS = isMobile ? 30000 : 45000;
  const DT = 0.0062;
  const positions = generateLorenz({ steps: STEPS, dt: DT, warmup: 2500 });
  const N = STEPS;

  const LIFE_START = Math.floor(N * 0.133);
  const LIFE_END = Math.floor(N * 0.844);
  const LIFE_LEN = LIFE_END - LIFE_START;

  const EVENT_MARGIN = Math.floor(LIFE_LEN * 0.045);
  const EVENT_INDICES = CV_EVENTS.map((_, i) => {
    const t = CV_EVENTS.length === 1 ? 0 : i / (CV_EVENTS.length - 1);
    return Math.round(lerp(LIFE_START + EVENT_MARGIN, LIFE_END - EVENT_MARGIN, t));
  });

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();

  function getPoint(idx, out) {
    const i0 = clamp(Math.floor(idx), 0, N - 1);
    const i1 = clamp(i0 + 1, 0, N - 1);
    const f = idx - i0;
    out.set(
      lerp(positions[i0 * 3], positions[i1 * 3], f),
      lerp(positions[i0 * 3 + 1], positions[i1 * 3 + 1], f),
      lerp(positions[i0 * 3 + 2], positions[i1 * 3 + 2], f)
    );
    return out;
  }

  const TANGENT_DELTA = 120;
  function getTangent(idx, out) {
    getPoint(clamp(idx + TANGENT_DELTA, 0, N - 1), tmpA);
    getPoint(clamp(idx - TANGENT_DELTA, 0, N - 1), tmpB);
    out.subVectors(tmpA, tmpB);
    if (out.lengthSq() < 1e-8) out.set(0, 0, 1);
    out.normalize();
    return out;
  }

  // Bounding sphere of the full attractor, for the reveal composition.
  let bboxMin = new THREE.Vector3(Infinity, Infinity, Infinity);
  let bboxMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (let i = 0; i < N; i++) {
    const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    if (x < bboxMin.x) bboxMin.x = x; if (x > bboxMax.x) bboxMax.x = x;
    if (y < bboxMin.y) bboxMin.y = y; if (y > bboxMax.y) bboxMax.y = y;
    if (z < bboxMin.z) bboxMin.z = z; if (z > bboxMax.z) bboxMax.z = z;
  }
  const attractorCenter = new THREE.Vector3().addVectors(bboxMin, bboxMax).multiplyScalar(0.5);
  const attractorRadius = bboxMax.distanceTo(bboxMin) * 0.5;

  /* ---- Renderer / Scene / Camera ---- */

  const canvas = document.getElementById("scene");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

  const BG = 0x05070d;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);

  const JOURNEY_FOG_DENSITY = isMobile ? 0.052 : 0.046;
  const REVEAL_FOG_DENSITY = 0.0028;
  const fog = new THREE.FogExp2(BG, JOURNEY_FOG_DENSITY);
  scene.fog = fog;

  const camera = new THREE.PerspectiveCamera(
    isMobile ? 62 : 52,
    window.innerWidth / window.innerHeight,
    0.05,
    600
  );

  const glowTexture = makeGlowTexture();

  /* ---- Geometry: shared position attribute across multiple draws ---- */

  const posAttr = new THREE.BufferAttribute(positions, 3);

  // Full attractor — dim, always present, mostly hidden by fog until reveal.
  const geoFull = new THREE.BufferGeometry();
  geoFull.setAttribute("position", posAttr);
  const matFull = new THREE.LineBasicMaterial({
    color: 0x2c4770,
    transparent: true,
    opacity: 0.38,
  });
  const lineFull = new THREE.Line(geoFull, matFull);
  scene.add(lineFull);

  // Traveled life-segment — bright, grows as the user scrolls.
  const geoTraveled = new THREE.BufferGeometry();
  geoTraveled.setAttribute("position", posAttr);
  geoTraveled.setDrawRange(LIFE_START, 0);
  const matTraveled = new THREE.LineBasicMaterial({
    color: 0xcfe4ff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lineTraveled = new THREE.Line(geoTraveled, matTraveled);
  scene.add(lineTraveled);

  // Soft glow halo along the traveled segment (sparse points, additive).
  const GLOW_STRIDE = isMobile ? 46 : 26;
  const glowMaxCount = Math.ceil(LIFE_LEN / GLOW_STRIDE) + 4;
  const glowIndex = new Uint32Array(glowMaxCount);
  const geoGlow = new THREE.BufferGeometry();
  geoGlow.setAttribute("position", posAttr);
  geoGlow.setIndex(new THREE.BufferAttribute(glowIndex, 1));
  geoGlow.setDrawRange(0, 0);
  const matGlow = new THREE.PointsMaterial({
    map: glowTexture,
    color: 0x9fc6ff,
    size: isMobile ? 1.7 : 1.35,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pointsGlow = new THREE.Points(geoGlow, matGlow);
  scene.add(pointsGlow);

  // Event marker sprites.
  const eventSprites = EVENT_INDICES.map((idx) => {
    const mat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    getPoint(idx, tmpA);
    sprite.position.copy(tmpA);
    sprite.scale.setScalar(0.55);
    scene.add(sprite);
    return sprite;
  });

  /* ---- Camera controller ---- */

  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  getPoint(LIFE_START, camPos);
  camera.position.copy(camPos).add(new THREE.Vector3(0, 1.2, -6));
  camera.lookAt(camPos);

  const FOLLOW_DIST = isMobile ? 7.5 : 8.6;
  const FOLLOW_HEIGHT = isMobile ? 1.6 : 2.0;
  const LOOKAHEAD = 6.5;

  const revealDir = new THREE.Vector3(0.82, 0.5, 1.05).normalize();
  const revealDistance = attractorRadius * (isMobile ? 2.5 : 2.05);
  const revealAnchorPos = new THREE.Vector3();
  const revealAnchorLook = new THREE.Vector3();

  // Shared math: where the follow-camera sits/looks for a given index.
  // Used both while travelling and as the continuous starting anchor
  // for the pullback, so the transition into reveal never jumps.
  function journeyCameraTarget(idx, outPos, outLook) {
    const P = getPoint(idx, tmpA).clone();
    const T = getTangent(idx, new THREE.Vector3());
    const up = Math.abs(T.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(T, up).normalize();
    const localUp = new THREE.Vector3().crossVectors(right, T).normalize();

    outPos.copy(P).addScaledVector(T, -FOLLOW_DIST).addScaledVector(localUp, FOLLOW_HEIGHT);
    outLook.copy(P).addScaledVector(T, LOOKAHEAD);
  }

  function updateCameraJourney(idx, smoothing) {
    journeyCameraTarget(idx, camTarget, lookTarget);

    camera.position.lerp(camTarget, smoothing);
    dummy.position.copy(camera.position);
    dummy.lookAt(lookTarget);
    camera.quaternion.slerp(dummy.quaternion, smoothing * 1.3);
  }

  function updateCameraReveal(revealT) {
    const eased = easeInOutCubic(revealT);
    journeyCameraTarget(LIFE_END, revealAnchorPos, revealAnchorLook);

    const endPos = new THREE.Vector3()
      .copy(attractorCenter)
      .addScaledVector(revealDir, revealDistance);

    camTarget.lerpVectors(revealAnchorPos, endPos, eased);
    lookTarget.lerpVectors(revealAnchorLook, attractorCenter, eased);

    const smoothing = isMobile ? 0.045 : 0.035;
    camera.position.lerp(camTarget, smoothing + eased * 0.03);
    dummy.position.copy(camera.position);
    dummy.lookAt(lookTarget);
    camera.quaternion.slerp(dummy.quaternion, smoothing + eased * 0.03);
  }

  /* ---- Scroll-phase mapping ---- */

  const P_INTRO_END = 0.05;
  const P_JOURNEY_END = 0.82;
  const P_LINGER_END = 0.9;

  function journeyIndex(s) {
    // s in [0,1] across all events, with an approach + dwell per event.
    const n = EVENT_INDICES.length;
    const chunk = 1 / n;
    const ci = clamp(Math.floor(s / chunk), 0, n - 1);
    const localT = clamp((s - ci * chunk) / chunk, 0, 1);
    const prevIdx = ci === 0 ? LIFE_START : EVENT_INDICES[ci - 1];
    const thisIdx = EVENT_INDICES[ci];
    const nextIdx = EVENT_INDICES[Math.min(ci + 1, n - 1)];
    const travelPortion = 0.55;

    let idx;
    if (localT < travelPortion) {
      const tt = easeInOutCubic(localT / travelPortion);
      idx = lerp(prevIdx, thisIdx, tt);
    } else {
      const tt = (localT - travelPortion) / (1 - travelPortion);
      idx = thisIdx + tt * (nextIdx - thisIdx) * 0.035;
    }
    return { idx, ci, localT };
  }

  function labelBump(localT) {
    const rise = smoothstep(0.35, 0.65, localT);
    const fall = 1 - smoothstep(0.88, 1.0, localT);
    return rise * fall;
  }

  /* ---- DOM refs ---- */

  const introEl = document.getElementById("intro");
  const finalEl = document.getElementById("final");
  const labelEl = document.getElementById("event-label");
  const labelYear = labelEl.querySelector(".event-label__year");
  const labelTitle = labelEl.querySelector(".event-label__title");
  const labelDesc = labelEl.querySelector(".event-label__desc");
  const progressFill = document.getElementById("progress-fill");

  let currentLabelIndex = -1;

  function updateLabel(ci, opacity, screenX, screenY) {
    if (opacity <= 0.01 || ci < 0) {
      labelEl.style.opacity = "0";
      currentLabelIndex = -1;
      return;
    }
    if (ci !== currentLabelIndex) {
      const ev = CV_EVENTS[ci];
      labelYear.textContent = ev.year;
      labelTitle.textContent = ev.title;
      labelDesc.textContent = ev.desc;
      labelDesc.style.display = ev.desc ? "block" : "none";
      currentLabelIndex = ci;
    }
    labelEl.style.opacity = String(opacity);

    if (isMobile) {
      labelEl.style.left = "50%";
      labelEl.style.top = "auto";
      labelEl.style.bottom = "8%";
      labelEl.style.transform = "translate(-50%, 0)";
      labelEl.style.textAlign = "center";
    } else {
      const margin = 28;
      const side = screenX < window.innerWidth / 2 ? "right" : "left";
      const vSide = screenY < window.innerHeight / 2 ? "below" : "above";
      const offX = side === "right" ? 40 : -40;
      const offY = vSide === "below" ? 40 : -40;
      const x = clamp(screenX + offX, margin, window.innerWidth - margin);
      const y = clamp(screenY + offY, margin, window.innerHeight - margin);
      labelEl.style.left = `${x}px`;
      labelEl.style.top = `${y}px`;
      labelEl.style.bottom = "auto";
      labelEl.style.transform = `translate(${side === "right" ? "0%" : "-100%"}, ${
        vSide === "below" ? "0%" : "-100%"
      })`;
      labelEl.style.textAlign = side === "right" ? "left" : "right";
    }
  }

  /* ---- Resize ---- */

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);
  onResize();

  /* ---- Main loop ---- */

  let smoothProgress = 0;
  const vecProj = new THREE.Vector3();

  function getScrollProgress() {
    const denom = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return clamp(window.scrollY / denom, 0, 1);
  }

  function tick() {
    const raw = getScrollProgress();
    smoothProgress += (raw - smoothProgress) * 0.065;
    const p = smoothProgress;

    progressFill.style.height = `${clamp(p, 0, 1) * 100}%`;

    let ci = -1;
    let bump = 0;
    let idx = LIFE_START;
    let mode = "intro";

    if (p <= P_INTRO_END) {
      mode = "intro";
      const tt = easeInOutCubic(clamp(p / P_INTRO_END, 0, 1));
      idx = LIFE_START + tt * (EVENT_INDICES[0] - LIFE_START) * 0.5;
    } else if (p <= P_JOURNEY_END) {
      mode = "journey";
      const s = (p - P_INTRO_END) / (P_JOURNEY_END - P_INTRO_END);
      const j = journeyIndex(s);
      idx = j.idx;
      ci = j.ci;
      bump = labelBump(j.localT);
    } else if (p <= P_LINGER_END) {
      mode = "linger";
      const t = (p - P_JOURNEY_END) / (P_LINGER_END - P_JOURNEY_END);
      idx = lerp(EVENT_INDICES[EVENT_INDICES.length - 1], LIFE_END, easeInOutCubic(t));
    } else {
      mode = "reveal";
      idx = LIFE_END;
    }

    const travelCount = Math.max(6, Math.min(LIFE_LEN, Math.round(idx - LIFE_START)));
    geoTraveled.setDrawRange(LIFE_START, travelCount);

    // Update sparse glow point indices to cover the traveled range.
    const glowCount = Math.min(glowMaxCount, Math.floor(travelCount / GLOW_STRIDE));
    for (let i = 0; i < glowCount; i++) {
      glowIndex[i] = LIFE_START + i * GLOW_STRIDE;
    }
    geoGlow.index.needsUpdate = glowCount > 0;
    geoGlow.setDrawRange(0, glowCount);

    // Event sprite brightness.
    eventSprites.forEach((sprite, i) => {
      const isActive = i === ci;
      const scale = isActive ? lerp(0.5, 1.5, bump) : 0.42;
      const opacity = isActive ? lerp(0.45, 0.95, bump) : 0.3;
      sprite.scale.setScalar(scale);
      sprite.material.opacity = opacity;
    });

    // Camera + fog.
    if (mode === "reveal") {
      const revealT = clamp((p - P_LINGER_END) / (1 - P_LINGER_END), 0, 1);
      updateCameraReveal(revealT);
      fog.density = lerp(JOURNEY_FOG_DENSITY, REVEAL_FOG_DENSITY, easeInOutCubic(revealT));
      matFull.opacity = lerp(0.38, 0.85, easeInOutCubic(revealT));
    } else {
      updateCameraJourney(idx, prefersReducedMotion ? 1 : 0.055);
      fog.density = JOURNEY_FOG_DENSITY;
      matFull.opacity = 0.38;
    }

    // Label projection + content.
    if (ci >= 0 && bump > 0.02) {
      getPoint(EVENT_INDICES[ci], tmpA);
      vecProj.copy(tmpA).project(camera);
      const sx = (vecProj.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (1 - (vecProj.y * 0.5 + 0.5)) * window.innerHeight;
      updateLabel(ci, bump, sx, sy);
    } else {
      updateLabel(-1, 0, 0, 0);
    }

    // Intro / final overlays.
    introEl.style.opacity = String(1 - smoothstep(0, 0.035, p));
    const finalOpacity = smoothstep(0.94, 1.0, p);
    finalEl.style.opacity = String(finalOpacity);
    finalEl.setAttribute("aria-hidden", finalOpacity < 0.5 ? "true" : "false");

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
