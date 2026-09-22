(() => {
  "use strict";

  const CV_EVENTS = [
    {
      year: "1999",
      title: "Born in Mysore",
      description: "The trajectory begins.",
    },
    {
      year: "2015",
      title: "10th Grade",
      description: "87.52%",
    },
    {
      year: "2017",
      title: "Pre-University",
      description: "Physics · Chemistry · Mathematics · Electronics",
    },
    {
      year: "2017",
      title: "B.Sc Physics",
      description: "Mathematics · Electronics",
    },
    {
      year: "2017",
      title: "First semester failure",
      description: "",
    },
    {
      year: "2018",
      title: "Part-time job",
      description: "",
    },
    {
      year: "2019",
      title: "Left the job",
      description: "",
    },
    {
      year: "2020",
      title: "B.Sc completed",
      description: "",
    },
    {
      year: "2023",
      title: "M.Sc Physics",
      description: "",
    },
    {
      year: "2024",
      title: "Quantum mechanics",
      description: "Nuclear / particle physics",
    },
    {
      year: "2025",
      title: "Zero Degree Calorimeter research",
      description: "",
    },
    {
      year: "2025",
      title: "Machine learning reconstruction",
      description: "",
    },
    {
      year: "2026",
      title: "M.Sc Physics completed",
      description: "",
    },
    {
      year: "2026",
      title: "Naxxatra Sciences",
      description: "",
    },
    {
      year: "2026",
      title: "Science communication",
      description: "",
    },
    {
      year: "2026",
      title: "DRAVYA",
      description: "",
    },
    {
      year: "2026",
      title: "Music",
      description: "",
    },
    {
      year: "2026",
      title: "Fiction",
      description: "",
    },
    {
      year: "2026",
      title: "Research",
      description: "",
    },
    {
      year: "NOW",
      title: "The trajectory continues",
      description: "",
    },
  ];

  const EVENT_T = [
    0.018, 0.074, 0.13, 0.185, 0.238, 0.292, 0.348, 0.41, 0.48, 0.548,
    0.618, 0.685, 0.742, 0.792, 0.837, 0.876, 0.91, 0.936, 0.958, 0.972,
  ];

  const PHASES = {
    introEnd: 0.05,
    journeyEnd: 0.9,
    revealStart: 0.9,
    copyStart: 0.958,
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const smoother = (t) => {
    const x = clamp(t);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };
  const smoothstep = (edge0, edge1, value) => {
    const x = clamp((value - edge0) / (edge1 - edge0));
    return x * x * (3 - 2 * x);
  };

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = reducedMotionQuery.matches;

  const canvas = document.getElementById("trajectory-canvas");
  const eventLayer = document.getElementById("event-layer");
  const intro = document.getElementById("intro");
  const cornerMark = document.querySelector(".corner-mark");
  const revealCopy = document.getElementById("reveal-copy");
  const reducedList = document.getElementById("reduced-events");
  const liveEvent = document.getElementById("live-event");
  const navPrev = document.getElementById("nav-prev");
  const navNext = document.getElementById("nav-next");
  const navCurrent = document.getElementById("nav-current");
  const navTotal = document.getElementById("nav-total");

  function renderReducedList() {
    reducedList.innerHTML = CV_EVENTS.map((event) => {
      const description = event.description ? `<p>${event.description}</p>` : "";
      return `<li><time>${event.year}</time><h2>${event.title}</h2>${description}</li>`;
    }).join("");
  }

  renderReducedList();

  if (prefersReducedMotion) {
    document.body.classList.add("is-reduced");
  }

  if (!window.THREE) {
    document.body.classList.add("is-error");
    if (liveEvent) {
      liveEvent.textContent =
        "The WebGL library could not be loaded. The accessible chronology is visible instead.";
    }
    return;
  }

  const THREE = window.THREE;

  function lorenzDerivative(state, sigma, rho, beta) {
    return {
      x: sigma * (state.y - state.x),
      y: state.x * (rho - state.z) - state.y,
      z: state.x * state.y - beta * state.z,
    };
  }

  function rk4Step(state, dt, sigma, rho, beta) {
    const k1 = lorenzDerivative(state, sigma, rho, beta);
    const k2 = lorenzDerivative(
      {
        x: state.x + (dt * k1.x) / 2,
        y: state.y + (dt * k1.y) / 2,
        z: state.z + (dt * k1.z) / 2,
      },
      sigma,
      rho,
      beta,
    );
    const k3 = lorenzDerivative(
      {
        x: state.x + (dt * k2.x) / 2,
        y: state.y + (dt * k2.y) / 2,
        z: state.z + (dt * k2.z) / 2,
      },
      sigma,
      rho,
      beta,
    );
    const k4 = lorenzDerivative(
      {
        x: state.x + dt * k3.x,
        y: state.y + dt * k3.y,
        z: state.z + dt * k3.z,
      },
      sigma,
      rho,
      beta,
    );

    return {
      x: state.x + (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
      y: state.y + (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
      z: state.z + (dt / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z),
    };
  }

  function generateLorenzTrajectory(options) {
    const {
      sigma = 10,
      rho = 28,
      beta = 8 / 3,
      dt = 0.005,
      steps = 24000,
      discard = 1200,
      scale = 0.17,
    } = options;
    const raw = [];
    let state = { x: 0.11, y: 0.08, z: 24.2 };

    for (let i = 0; i < steps + discard; i += 1) {
      state = rk4Step(state, dt, sigma, rho, beta);
      if (i >= discard) {
        raw.push({ ...state });
      }
    }

    const bounds = raw.reduce(
      (acc, point) => {
        acc.minX = Math.min(acc.minX, point.x);
        acc.maxX = Math.max(acc.maxX, point.x);
        acc.minY = Math.min(acc.minY, point.y);
        acc.maxY = Math.max(acc.maxY, point.y);
        acc.minZ = Math.min(acc.minZ, point.z);
        acc.maxZ = Math.max(acc.maxZ, point.z);
        return acc;
      },
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
        minZ: Infinity,
        maxZ: -Infinity,
      },
    );

    const centerRaw = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      z: (bounds.minZ + bounds.maxZ) / 2,
    };

    const points = raw.map(
      (point) =>
        new THREE.Vector3(
          (point.x - centerRaw.x) * scale,
          (point.z - centerRaw.z) * scale,
          (point.y - centerRaw.y) * scale,
        ),
    );

    const box = new THREE.Box3().setFromPoints(points);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const radius = Math.max(size.x, size.y, size.z) * 0.62;

    const positions = new Float32Array(points.length * 3);
    points.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });

    return {
      points,
      positions,
      count: points.length,
      center,
      size,
      radius,
      sample(t) {
        const index = clamp(t) * (points.length - 1);
        const lower = Math.floor(index);
        const upper = Math.min(points.length - 1, lower + 1);
        const amount = index - lower;
        return points[lower].clone().lerp(points[upper], amount);
      },
      tangent(t) {
        const delta = 1 / points.length;
        return this.sample(clamp(t + delta * 12))
          .sub(this.sample(clamp(t - delta * 12)))
          .normalize();
      },
      indexAt(t) {
        return Math.max(2, Math.floor(clamp(t) * (points.length - 1)));
      },
    };
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createGlowTexture() {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 128;
    textureCanvas.height = 128;
    const context = textureCanvas.getContext("2d");
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(190, 238, 255, 1)");
    gradient.addColorStop(0.32, "rgba(90, 204, 255, 0.38)");
    gradient.addColorStop(1, "rgba(90, 204, 255, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createStarField(radius, count) {
    const random = seededRandom(2049);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(random() * 2 - 1);
      const distance = radius * (0.72 + random() * 0.46);
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * distance;
      positions[i * 3 + 1] = Math.cos(phi) * distance;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * distance;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x7897ad,
      size: 0.012,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    return new THREE.Points(geometry, material);
  }

  class TrajectoryCamera {
    constructor(camera, trajectory) {
      this.camera = camera;
      this.trajectory = trajectory;
      this.lookTarget = trajectory.sample(0.01);
      this.up = new THREE.Vector3(0, 1, 0);
      this.scratchA = new THREE.Vector3();
      this.scratchB = new THREE.Vector3();
      this.scratchC = new THREE.Vector3();
      this.mobile = window.innerWidth < 720;
    }

    onResize() {
      this.mobile = window.innerWidth < 720;
    }

    followTrajectory(t) {
      const point = this.trajectory.sample(t);
      const tangent = this.trajectory.tangent(t);
      const right = this.scratchA.crossVectors(tangent, this.up);
      if (right.lengthSq() < 0.0001) {
        right.set(1, 0, 0);
      } else {
        right.normalize();
      }
      const vertical = this.scratchB.crossVectors(right, tangent).normalize();
      const sidePulse = Math.sin(t * Math.PI * 7.4) * 0.16;
      const backDistance = this.mobile ? 1.38 : 1.02;
      const upDistance = this.mobile ? 0.54 : 0.42;
      const sideDistance = this.mobile ? 0.26 : 0.34;
      const lookAhead = this.mobile ? 0.22 : 0.28;
      const forwardFocus = smoothstep(0.006, 0.055, t);

      const position = point
        .clone()
        .addScaledVector(tangent, -backDistance)
        .addScaledVector(vertical, upDistance)
        .addScaledVector(right, sideDistance + sidePulse);
      const target = point
        .clone()
        .addScaledVector(tangent, lookAhead * forwardFocus)
        .addScaledVector(vertical, 0.04 * forwardFocus);

      return { position, target };
    }

    reveal(t, revealProgress) {
      const follow = this.followTrajectory(t);
      const revealEase = smoother(revealProgress);
      const center = this.trajectory.center;
      const radius = this.trajectory.radius;
      const direction = this.scratchC
        .set(this.mobile ? 0.08 : 0.12, this.mobile ? 0.13 : 0.18, 1)
        .normalize();
      const finalDistance = radius * (this.mobile ? 3.35 : 2.72);
      const finalPosition = center
        .clone()
        .addScaledVector(direction, mix(1.25, finalDistance, revealEase));
      const finalTarget = center.clone().add(new THREE.Vector3(0, radius * 0.05, 0));

      return {
        position: follow.position.clone().lerp(finalPosition, revealEase),
        target: follow.target.clone().lerp(finalTarget, revealEase),
      };
    }

    update(pathT, revealProgress, damping) {
      const state =
        revealProgress > 0
          ? this.reveal(pathT, revealProgress)
          : this.followTrajectory(pathT);
      this.camera.position.lerp(state.position, damping);
      this.lookTarget.lerp(state.target, damping);
      this.camera.lookAt(this.lookTarget);
      this.camera.fov = mix(this.mobile ? 48 : 42, this.mobile ? 46 : 38, smoother(revealProgress));
      this.camera.near = 0.01;
      this.camera.far = mix(4.2, 90, smoother(revealProgress));
      this.camera.updateProjectionMatrix();
    }

    setImmediate(pathT, revealProgress) {
      const state =
        revealProgress > 0
          ? this.reveal(pathT, revealProgress)
          : this.followTrajectory(pathT);
      this.camera.position.copy(state.position);
      this.lookTarget.copy(state.target);
      this.camera.lookAt(this.lookTarget);
      this.camera.fov = mix(this.mobile ? 48 : 42, this.mobile ? 46 : 38, smoother(revealProgress));
      this.camera.near = 0.01;
      this.camera.far = mix(4.2, 90, smoother(revealProgress));
      this.camera.updateProjectionMatrix();
    }
  }

  class CVExperience {
    constructor() {
      this.reduced = prefersReducedMotion;
      this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.Fog(0x02050b, 1.8, 8);

      this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.01, 90);
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x02050b, 0);

      this.clock = new THREE.Clock();
      this.targetProgress = 0;
      this.progress = 0;
      this.pathT = 0;
      this.lastAnnouncedIndex = -1;
      this.eventLabels = [];
      this.eventMarkers = [];
      this.traveler = null;
      this.glowTexture = createGlowTexture();

      this.totalStops = 21;
      this.currentStop = 0;
      this.isRevealed = false;
      this.isNavigating = false;
      this.queuedAction = null;
      this.currentTween = null;

      // Stop 0 (01 / 21) = Intro state (progress 0)
      // Stops 1..20 (02 / 21 .. 21 / 21) = The 20 CV_EVENTS along trajectory
      this.stopProgress = [0];
      const journeyRange = PHASES.journeyEnd - PHASES.introEnd;
      for (let i = 0; i < CV_EVENTS.length; i += 1) {
        this.stopProgress.push(PHASES.introEnd + EVENT_T[i] * journeyRange);
      }

      this.trajectory = generateLorenzTrajectory({
        steps: window.innerWidth < 720 ? 17000 : 26000,
        discard: 1400,
        dt: 0.005,
      });
      this.cameraController = new TrajectoryCamera(this.camera, this.trajectory);

      this.createTrajectory();
      this.createEvents();
      this.createTraveler();
      this.createAtmosphere();
      this.initNavigation();
      this.onResize();
      this.cameraController.setImmediate(this.reduced ? 1 : 0, this.reduced ? 1 : 0);

      window.addEventListener("resize", () => this.onResize());
      reducedMotionQuery.addEventListener("change", () => window.location.reload());
      requestAnimationFrame(() => this.frame());
    }

    createTrajectory() {
      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(this.trajectory.positions, 3),
      );
      this.geometry.setDrawRange(0, 2);

      this.line = new THREE.Line(
        this.geometry,
        new THREE.LineBasicMaterial({
          color: 0xbfeeff,
          transparent: true,
          opacity: 0.82,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: true,
        }),
      );
      this.glowLine = new THREE.Line(
        this.geometry,
        new THREE.LineBasicMaterial({
          color: 0x5ccfff,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: true,
        }),
      );

      this.scene.add(this.glowLine);
      this.scene.add(this.line);
    }

    createEvents() {
      const coreGeometry = new THREE.SphereGeometry(0.018, 18, 18);
      CV_EVENTS.forEach((event, index) => {
        const t = EVENT_T[index];
        event.t = t;
        const position = this.trajectory.sample(t);
        const group = new THREE.Group();
        group.position.copy(position);

        const coreMaterial = new THREE.MeshBasicMaterial({
          color: 0xd9f6ff,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);

        const halo = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.glowTexture,
            color: 0x7edcff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        halo.scale.setScalar(0.2);
        group.add(halo);
        this.scene.add(group);

        const label = document.createElement("article");
        label.className = "event-label";
        label.innerHTML = `
          <p class="event-year">${event.year}</p>
          <h2 class="event-title">${event.title}</h2>
          ${event.description ? `<p class="event-description">${event.description}</p>` : ""}
        `;
        eventLayer.appendChild(label);

        this.eventMarkers.push({ group, core, halo, event, index });
        this.eventLabels.push({ element: label, event, index, side: index % 2 === 0 ? 1 : -1 });
      });
    }

    createTraveler() {
      this.traveler = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 24, 24),
        new THREE.MeshBasicMaterial({
          color: 0xf5fcff,
          transparent: true,
          opacity: 0.96,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.glowTexture,
          color: 0x94e3ff,
          transparent: true,
          opacity: 0.64,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.scale.setScalar(0.18);
      this.traveler.add(halo);
      this.traveler.add(core);
      this.scene.add(this.traveler);
    }

    createAtmosphere() {
      const field = createStarField(this.trajectory.radius * 7.4, window.innerWidth < 720 ? 110 : 180);
      field.position.copy(this.trajectory.center);
      this.scene.add(field);

      const ambient = new THREE.HemisphereLight(0x79d8ff, 0x030712, 1.35);
      this.scene.add(ambient);
    }

    initNavigation() {
      if (this.reduced) {
        this.targetProgress = 1;
        this.progress = 1;
        this.pathT = 1;
        this.geometry.setDrawRange(0, this.trajectory.count);
        return;
      }

      this.updateNavUI();

      if (navPrev) {
        navPrev.addEventListener("click", () => this.handlePrev());
      }
      if (navNext) {
        navNext.addEventListener("click", () => this.handleNext());
      }

      window.addEventListener("keydown", (e) => {
        const tag = document.activeElement ? document.activeElement.tagName : "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          return;
        }

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          this.handleNext();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          this.handlePrev();
        } else if (
          e.key === " " ||
          e.key === "PageUp" ||
          e.key === "PageDown" ||
          e.key === "Home" ||
          e.key === "End"
        ) {
          e.preventDefault();
        }
      });

      window.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
        },
        { passive: false },
      );

      window.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
        },
        { passive: false },
      );
    }

    handleNext() {
      if (this.isNavigating) {
        this.queuedAction = "next";
        return;
      }
      if (this.isRevealed) {
        return;
      }
      if (this.currentStop >= this.totalStops - 1) {
        this.startReveal();
        return;
      }
      this.goToStop(this.currentStop + 1);
    }

    handlePrev() {
      if (this.isNavigating) {
        this.queuedAction = "prev";
        return;
      }
      if (this.isRevealed) {
        this.reverseReveal();
        return;
      }
      if (this.currentStop > 0) {
        this.goToStop(this.currentStop - 1);
      }
    }

    processQueue() {
      if (!this.queuedAction) {
        return;
      }
      const action = this.queuedAction;
      this.queuedAction = null;
      if (action === "next") {
        this.handleNext();
      } else if (action === "prev") {
        this.handlePrev();
      }
    }

    goToStop(index) {
      if (index < 0 || index >= this.totalStops) {
        return;
      }
      this.isNavigating = true;
      this.currentStop = index;
      this.isRevealed = false;
      this.updateNavUI();

      const destProgress = this.stopProgress[index];
      const duration = 1.15;

      if (this.currentTween) {
        this.currentTween.kill();
      }

      if (window.gsap) {
        this.currentTween = window.gsap.to(this, {
          targetProgress: destProgress,
          duration: duration,
          ease: "power2.inOut",
          onComplete: () => {
            this.isNavigating = false;
            this.currentTween = null;
            this.processQueue();
          },
        });
      } else {
        this.targetProgress = destProgress;
        this.isNavigating = false;
        this.processQueue();
      }
    }

    startReveal() {
      this.isNavigating = true;
      this.isRevealed = true;
      this.updateNavUI();

      const destProgress = 1.0;
      const duration = 3.0;

      if (this.currentTween) {
        this.currentTween.kill();
      }

      if (window.gsap) {
        this.currentTween = window.gsap.to(this, {
          targetProgress: destProgress,
          duration: duration,
          ease: "power2.inOut",
          onComplete: () => {
            this.isNavigating = false;
            this.currentTween = null;
            this.processQueue();
          },
        });
      } else {
        this.targetProgress = destProgress;
        this.isNavigating = false;
        this.processQueue();
      }
    }

    reverseReveal() {
      this.isNavigating = true;
      this.isRevealed = false;
      this.currentStop = this.totalStops - 1;
      this.updateNavUI();

      const destProgress = this.stopProgress[this.totalStops - 1];
      const duration = 2.4;

      if (this.currentTween) {
        this.currentTween.kill();
      }

      if (window.gsap) {
        this.currentTween = window.gsap.to(this, {
          targetProgress: destProgress,
          duration: duration,
          ease: "power2.inOut",
          onComplete: () => {
            this.isNavigating = false;
            this.currentTween = null;
            this.processQueue();
          },
        });
      } else {
        this.targetProgress = destProgress;
        this.isNavigating = false;
        this.processQueue();
      }
    }

    updateNavUI() {
      if (navCurrent) {
        navCurrent.textContent = String(this.currentStop + 1).padStart(2, "0");
      }
      if (navPrev) {
        navPrev.disabled = this.currentStop === 0 && !this.isRevealed;
      }
      if (navNext) {
        navNext.disabled = this.isRevealed;
      }
    }

    onResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.cameraController.onResize();
    }

    scrollToPathT(progress) {
      if (progress <= PHASES.introEnd) {
        return 0;
      }
      if (progress >= PHASES.journeyEnd) {
        return 1;
      }
      return clamp((progress - PHASES.introEnd) / (PHASES.journeyEnd - PHASES.introEnd));
    }

    revealProgress(progress) {
      return clamp((progress - PHASES.revealStart) / (1 - PHASES.revealStart));
    }

    nearestEventInfluence(t) {
      let nearest = 1;
      for (const event of CV_EVENTS) {
        nearest = Math.min(nearest, Math.abs(t - event.t));
      }
      return 1 - smoothstep(0.003, 0.035, nearest);
    }

    updateProgress(delta) {
      if (this.reduced) {
        this.progress = 1;
        this.pathT = 1;
        return;
      }

      const progressDamping = 1 - Math.pow(0.72, delta * 60);
      this.progress += (this.targetProgress - this.progress) * progressDamping;

      const targetPathT = this.scrollToPathT(this.progress);
      const eventHold = this.nearestEventInfluence(targetPathT);
      const basePathDamping = mix(0.18, 0.1, eventHold);
      const pathDamping = 1 - Math.pow(1 - basePathDamping, delta * 60);
      this.pathT += (targetPathT - this.pathT) * pathDamping;
    }

    updateGeometry() {
      const introT = smoothstep(0.012, PHASES.introEnd, this.progress);
      const visibleT =
        this.progress < PHASES.introEnd
          ? mix(0.00009, 0.022, introT)
          : Math.max(this.pathT, 0.022);
      const revealRaw = this.revealProgress(this.progress);
      const reveal = smoother(revealRaw);

      if (this.reduced) {
        this.geometry.setDrawRange(0, this.trajectory.count);
      } else if (revealRaw > 0) {
        const localEnd = this.trajectory.count;
        const localStart = Math.max(0, localEnd - (window.innerWidth < 720 ? 620 : 780));
        const start = Math.floor(mix(localStart, 0, reveal));
        const end = this.trajectory.count;
        this.geometry.setDrawRange(start, end - start);
      } else if (this.progress < PHASES.introEnd) {
        const drawCount = this.trajectory.indexAt(visibleT) + 1;
        this.geometry.setDrawRange(0, drawCount);
      } else {
        const current = this.trajectory.indexAt(visibleT);
        const behind = window.innerWidth < 720 ? 240 : 310;
        const ahead = window.innerWidth < 720 ? 95 : 135;
        const start = Math.max(0, current - behind);
        const end = Math.min(this.trajectory.count, current + ahead);
        this.geometry.setDrawRange(start, end - start);
      }

      this.line.material.opacity = mix(0.84, 0.66, reveal);
      this.glowLine.material.opacity = mix(0.18, 0.12, reveal);
      this.scene.fog.near = mix(0.52, 15, reveal);
      this.scene.fog.far = mix(2.75, 60, reveal);
    }

    updateTraveler() {
      const point = this.trajectory.sample(this.pathT);
      this.traveler.position.copy(point);
      const pulse = 1 + Math.sin(performance.now() * 0.0024) * 0.055;
      const reveal = this.revealProgress(this.progress);
      this.traveler.scale.setScalar(mix(1, 0.62, smoother(reveal)) * pulse);
      this.traveler.visible = !this.reduced;
    }

    updateEventMarkers() {
      const revealFade = 1 - smoothstep(0.91, 0.98, this.progress);
      this.eventMarkers.forEach((marker) => {
        const distance = Math.abs(this.pathT - marker.event.t);
        const active = (1 - smoothstep(0.004, 0.032, distance)) * revealFade;
        const passed = this.pathT >= marker.event.t ? 1 : 0;
        const baseOpacity = passed ? 0.1 : 0;
        marker.core.material.opacity = baseOpacity + active * 0.78;
        marker.halo.material.opacity = active * 0.52;
        marker.group.scale.setScalar(1 + active * 1.35);
      });
    }

    projectToScreen(vector) {
      const projected = vector.clone().project(this.camera);
      return {
        visible: projected.z > -1 && projected.z < 1,
        x: (projected.x * 0.5 + 0.5) * window.innerWidth,
        y: (-projected.y * 0.5 + 0.5) * window.innerHeight,
        z: projected.z,
      };
    }

    updateEventLabels() {
      if (this.reduced) {
        return;
      }
      const introFade = smoothstep(0.02, 0.05, this.progress);
      const revealFade = (1 - smoothstep(0.9, 0.955, this.progress)) * introFade;
      let activeIndex = -1;
      let activeValue = 0;

      this.eventLabels.forEach((label) => {
        const event = label.event;
        const distance = Math.abs(this.pathT - event.t);
        const active = (1 - smoothstep(0.004, 0.029, distance)) * revealFade;
        if (active > activeValue) {
          activeValue = active;
          activeIndex = label.index;
        }
      });

      this.eventLabels.forEach((label) => {
        const event = label.event;
        const element = label.element;
        const point = this.trajectory.sample(event.t);
        const tangent = this.trajectory.tangent(event.t);
        const nextPoint = point.clone().addScaledVector(tangent, 0.8);
        const screen = this.projectToScreen(point);
        const nextScreen = this.projectToScreen(nextPoint);
        const distance = Math.abs(this.pathT - event.t);
        const isPrimary = label.index === activeIndex;
        const active = isPrimary ? (1 - smoothstep(0.004, 0.031, distance)) * revealFade : 0;

        if (!screen.visible || active <= 0.015) {
          element.style.opacity = "0";
          return;
        }

        let dx = nextScreen.x - screen.x;
        let dy = nextScreen.y - screen.y;
        const length = Math.hypot(dx, dy) || 1;
        dx /= length;
        dy /= length;

        const offsetBase = window.innerWidth < 720 ? 58 : 86;
        const drift = window.innerWidth < 720 ? 8 : 18;
        const width = element.offsetWidth || 320;
        const height = element.offsetHeight || 120;
        const pad = window.innerWidth < 720 ? 20 : 30;
        const candidates = [label.side, -label.side].map((side) => {
          let normalX = -dy * side;
          let normalY = dx * side;
          if (Math.abs(normalY) < 0.24) {
            normalY += side * 0.38;
          }
          const rawX = screen.x + normalX * offsetBase + dx * drift;
          const rawY = screen.y + normalY * offsetBase + dy * drift;
          const x = clamp(rawX, pad + width / 2, window.innerWidth - pad - width / 2);
          const y = clamp(rawY, 74 + height / 2, window.innerHeight - pad - height / 2);
          return {
            x,
            y,
            side,
            penalty: Math.abs(x - rawX) + Math.abs(y - rawY),
          };
        });
        const best = candidates[0].penalty <= candidates[1].penalty ? candidates[0] : candidates[1];
        const x = best.x;
        const y = best.y;

        element.style.opacity = active.toFixed(3);
        element.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0) scale(${mix(
          0.985,
          1,
          active,
        ).toFixed(4)})`;
        element.dataset.leader = x < screen.x ? "right" : "left";
        element.style.setProperty("--leader-opacity", String(mix(0.12, 0.78, active)));
      });

      if (activeValue > 0.7 && activeIndex !== this.lastAnnouncedIndex) {
        const event = CV_EVENTS[activeIndex];
        liveEvent.textContent = `${event.year}. ${event.title}${
          event.description ? `. ${event.description}` : ""
        }`;
        this.lastAnnouncedIndex = activeIndex;
      }
    }

    updateOverlay() {
      if (this.reduced) {
        return;
      }
      const introExit = smoothstep(0.012, 0.045, this.progress);
      intro.style.opacity = String(1 - introExit);
      intro.style.transform = `translate3d(0, ${(-20 * introExit).toFixed(2)}px, 0)`;

      const cornerOpacity =
        smoothstep(0.045, 0.065, this.progress) *
        (1 - smoothstep(0.965, 0.995, this.progress) * 0.35);
      cornerMark.style.opacity = String(cornerOpacity);

      const copyOpacity = smoothstep(PHASES.copyStart, 0.99, this.progress);
      revealCopy.style.opacity = String(copyOpacity);
      revealCopy.style.transform = `translate3d(0, ${(20 * (1 - copyOpacity)).toFixed(2)}px, 0)`;
    }

    frame() {
      const delta = Math.min(this.clock.getDelta(), 0.05);
      this.updateProgress(delta);
      const reveal = this.revealProgress(this.progress);
      const damping = this.reduced ? 1 : mix(0.09, 0.045, this.nearestEventInfluence(this.pathT));

      this.updateGeometry();
      this.updateTraveler();
      this.updateEventMarkers();
      this.cameraController.update(this.pathT, reveal, this.reduced ? 1 : 1 - Math.pow(1 - damping, delta * 60));
      const debugPoint = this.traveler.position.clone().project(this.camera);
      document.documentElement.dataset.dravyaDebug = [
        this.progress.toFixed(4),
        this.pathT.toFixed(4),
        this.geometry.drawRange.start,
        this.geometry.drawRange.count,
        debugPoint.x.toFixed(3),
        debugPoint.y.toFixed(3),
        debugPoint.z.toFixed(3),
      ].join("|");
      this.updateEventLabels();
      this.updateOverlay();
      this.renderer.render(this.scene, this.camera);

      requestAnimationFrame(() => this.frame());
    }
  }

  try {
    document.body.classList.add("is-loading");
    const experience = new CVExperience();
    window.__dravyaExperience = experience;
    document.body.classList.remove("is-loading");
  } catch (error) {
    console.error(error);
    document.body.classList.add("is-error");
    if (liveEvent) {
      liveEvent.textContent =
        "The WebGL experience could not start. The accessible chronology is visible instead.";
    }
  }
})();
