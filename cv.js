(() => {

  "use strict";


  /* =========================================================
     CV EVENTS
     ========================================================= */

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
      description:
        "Physics · Chemistry · Mathematics · Electronics",
    },

    {
      year: "2017",
      title: "B.Sc Physics",
      description:
        "Mathematics · Electronics",
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
      description:
        "Nuclear / particle physics",
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
      title: "The trajectory continues",
      description: "",
    },

  ];


  /* =========================================================
     SETTINGS
     ========================================================= */

  const SETTINGS = {

    /*
      How long the trajectory takes to travel from one
      event to the next.
    */

    travelDuration: 1.35,


    /*
      How long the event remains on screen.
    */

    stopDuration: 1.65,


    /*
      Prevents one trackpad swipe from generating
      multiple transitions.
    */

    wheelCooldown: 900,


    /*
      Smoothness of trajectory interpolation.
    */

    cameraSmoothness: 0.075,

  };


  /* =========================================================
     DOM
     ========================================================= */

  const canvas =
    document.getElementById("trajectory-canvas");

  const experience =
    document.getElementById("experience");

  const intro =
    document.getElementById("intro");

  const cornerMark =
    document.querySelector(".corner-mark");

  const eventLayer =
    document.getElementById("event-layer");

  const revealCopy =
    document.getElementById("reveal-copy");

  const liveEvent =
    document.getElementById("live-event");

  const controls =
    document.querySelector(".trajectory-controls");

  const prevButton =
    document.getElementById("prev-stop");

  const nextButton =
    document.getElementById("next-stop");


  /* =========================================================
     STATE
     ========================================================= */

  let currentStop = 0;

  let targetStop = 0;

  let isMoving = false;

  let wheelLocked = false;

  let experienceStarted = false;

  let finalReveal = false;

  let eventCards = [];


  /* =========================================================
     THREE.JS
     ========================================================= */

  const THREE = window.THREE;

  if (!THREE) {
    console.error("Three.js failed to load.");
    return;
  }


  const renderer =
    new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });


  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );


  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );


  const scene =
    new THREE.Scene();


  const camera =
    new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0.1,
      100
    );


  camera.position.z = 10;


  /* =========================================================
     TRAJECTORY FIELD
     ========================================================= */

  const trajectoryGroup =
    new THREE.Group();

  scene.add(trajectoryGroup);


  /*
    This is a deterministic chaotic-looking trajectory.

    The important point is that it is generated mathematically,
    not randomly, so the same CV produces the same shape every
    time.
  */

  const trajectoryPoints = [];

  const totalPoints = 1800;


  for (let i = 0; i < totalPoints; i++) {

    const t =
      i / (totalPoints - 1);


    /*
      Multiple oscillatory terms create a trajectory that
      changes scale as we move through it.
    */

    const x =
      Math.sin(
        t * Math.PI * 5.3
      ) *
      (0.18 + t * 0.62)
      +
      Math.sin(
        t * Math.PI * 17.0
      ) *
      0.055;


    const y =
      Math.cos(
        t * Math.PI * 4.1
      ) *
      (0.13 + t * 0.42)
      +
      Math.sin(
        t * Math.PI * 13.0
      ) *
      0.045;


    /*
      A gentle deformation gives the final shape
      its larger chaotic structure.
    */

    const warp =
      Math.sin(t * Math.PI * 2.4);


    trajectoryPoints.push(
      new THREE.Vector3(
        x + warp * 0.08,
        y,
        0
      )
    );
  }


  /* =========================================================
     TRAJECTORY LINE
     ========================================================= */

  const trajectoryGeometry =
    new THREE.BufferGeometry().setFromPoints(
      trajectoryPoints
    );


  const trajectoryMaterial =
    new THREE.LineBasicMaterial({
      color: 0x78d7ff,
      transparent: true,
      opacity: 0.72,
    });


  const trajectoryLine =
    new THREE.Line(
      trajectoryGeometry,
      trajectoryMaterial
    );


  trajectoryGroup.add(
    trajectoryLine
  );


  /* =========================================================
     SECONDARY FIELD LINES
     ========================================================= */

  for (let j = 0; j < 5; j++) {

    const points = [];

    for (let i = 0; i < totalPoints; i++) {

      const t =
        i / (totalPoints - 1);


      const base =
        trajectoryPoints[i];


      points.push(
        new THREE.Vector3(
          base.x +
            Math.sin(
              t * 20 +
              j
            ) *
            0.008,

          base.y +
            Math.cos(
              t * 17 +
              j
            ) *
            0.008,

          0
        )
      );
    }


    const geometry =
      new THREE.BufferGeometry()
        .setFromPoints(points);


    const material =
      new THREE.LineBasicMaterial({
        color: 0x4a9ec4,
        transparent: true,
        opacity: 0.08,
      });


    trajectoryGroup.add(
      new THREE.Line(
        geometry,
        material
      )
    );
  }


  /* =========================================================
     EVENT POINTS
     ========================================================= */

  const eventPoints =
    CV_EVENTS.map(
      (_, index) => {

        const normalized =
          index /
          (CV_EVENTS.length - 1);


        const pointIndex =
          Math.floor(
            normalized *
            (trajectoryPoints.length - 1)
          );


        return trajectoryPoints[
          pointIndex
        ];
      }
    );


  const eventGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        eventPoints
      );


  const eventMaterial =
    new THREE.PointsMaterial({
      color: 0xbfeeff,
      size: 0.025,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: false,
    });


  const eventPointsMesh =
    new THREE.Points(
      eventGeometry,
      eventMaterial
    );


  trajectoryGroup.add(
    eventPointsMesh
  );


  /* =========================================================
     CURRENT EVENT MARKER
     ========================================================= */

  const markerGeometry =
    new THREE.CircleGeometry(
      0.032,
      32
    );


  const markerMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });


  const eventMarker =
    new THREE.Mesh(
      markerGeometry,
      markerMaterial
    );


  trajectoryGroup.add(
    eventMarker
  );


  /* =========================================================
     EVENT CARDS
     ========================================================= */

  function createEventCards() {

    CV_EVENTS.forEach(
      (event, index) => {

        const card =
          document.createElement("article");

        card.className =
          "event-card";


        card.dataset.index =
          String(index);


        const year =
          document.createElement("p");

        year.className =
          "event-year";

        year.textContent =
          event.year;


        const title =
          document.createElement("h2");

        title.className =
          "event-title";

        title.textContent =
          event.title;


        const description =
          document.createElement("p");

        description.className =
          "event-description";

        description.textContent =
          event.description;


        const line =
          document.createElement("div");

        line.className =
          "event-line";


        card.appendChild(year);

        card.appendChild(title);

        if (event.description) {
          card.appendChild(
            description
          );
        }

        card.appendChild(line);


        eventLayer.appendChild(
          card
        );


        eventCards.push(card);
      }
    );

  }


  createEventCards();


  /* =========================================================
     REDUCED CV
     ========================================================= */

  const reducedEvents =
    document.getElementById(
      "reduced-events"
    );


  if (reducedEvents) {

    CV_EVENTS.forEach(
      (event) => {

        const li =
          document.createElement("li");

        li.innerHTML =
          `<strong>${event.year}</strong>
           — ${event.title}
           ${event.description
             ? ` — ${event.description}`
             : ""}`;

        reducedEvents.appendChild(
          li
        );

      }
    );

  }


  /* =========================================================
     CAMERA TARGETS
     ========================================================= */

  const cameraTargets =
    CV_EVENTS.map(
      (_, index) => {

        const t =
          index /
          (CV_EVENTS.length - 1);


        /*
          Early life:
          very close.

          Middle:
          gradually expands.

          Final:
          much further out.

          This creates the "inside the trajectory"
          feeling before the final reveal.
        */

        const zoom =
          0.65 +
          Math.pow(t, 1.7) *
          2.9;


        return {
          x:
            eventPoints[index].x,

          y:
            eventPoints[index].y,

          zoom,
        };

      }
    );


  let cameraX = 0;

  let cameraY = 0;

  let cameraZoom = 0.65;


  /* =========================================================
     EVENT DISPLAY
     ========================================================= */

  function hideAllEvents() {

    eventCards.forEach(
      (card) => {

        card.classList.remove(
          "is-visible"
        );

      }
    );

  }


  function showEvent(index) {

    hideAllEvents();


    const card =
      eventCards[index];


    if (!card) return;


    /*
      Small delay makes the event appear after
      the trajectory reaches the point.
    */

    requestAnimationFrame(
      () => {

        card.classList.add(
          "is-visible"
        );

      }
    );


    const event =
      CV_EVENTS[index];


    if (liveEvent) {

      liveEvent.textContent =
        `${event.year}. ${event.title}. ${
          event.description || ""
        }`;

    }

  }


  /* =========================================================
     NAVIGATION UI
     ========================================================= */

  function updateButtons() {

    if (!prevButton ||
        !nextButton) {
      return;
    }


    prevButton.disabled =
      currentStop <= 0;


    /*
      Don't disable next at the final stop because
      the final stop is where the zoom-out lives.
    */

    nextButton.disabled =
      currentStop >=
      CV_EVENTS.length - 1;
  }


  function showControls() {

    if (!controls) return;

    controls.classList.add(
      "is-visible"
    );

  }


  /* =========================================================
     START EXPERIENCE
     ========================================================= */

  function startExperience() {

    if (experienceStarted) {
      return;
    }


    experienceStarted = true;


    intro.classList.add(
      "is-hidden"
    );


    cornerMark.style.opacity =
      "1";


    showControls();


    /*
      Start at the first event.
    */

    setTimeout(
      () => {

        showEvent(0);

      },
      650
    );

  }


  /* =========================================================
     MAP EVENT TO TRAJECTORY
     ========================================================= */

  function getTrajectoryPoint(index) {

    const normalized =
      index /
      (CV_EVENTS.length - 1);


    const pointIndex =
      Math.floor(
        normalized *
        (trajectoryPoints.length - 1)
      );


    return trajectoryPoints[
      pointIndex
    ];

  }


  /* =========================================================
     MOVE TO STOP
     ========================================================= */

  function moveToStop(
    newStop
  ) {

    if (isMoving) {
      return;
    }


    newStop =
      Math.max(
        0,
        Math.min(
          CV_EVENTS.length - 1,
          newStop
        )
      );


    if (
      newStop === currentStop &&
      experienceStarted
    ) {
      return;
    }


    startExperience();


    isMoving = true;


    const previous =
      currentStop;


    currentStop =
      newStop;


    targetStop =
      newStop;


    updateButtons();


    const target =
      cameraTargets[
        currentStop
      ];


    const targetPoint =
      getTrajectoryPoint(
        currentStop
      );


    /*
      Update marker.
    */

    eventMarker.position.x =
      targetPoint.x;

    eventMarker.position.y =
      targetPoint.y;


    /*
      Fade the currently displayed event away.
    */

    hideAllEvents();


    /*
      Animate the camera.

      This is the controlled movement replacing
      raw scroll velocity.
    */

    const tl =
      gsap.timeline({

        onComplete() {

          isMoving = false;


          /*
            Event arrives AFTER camera movement.
          */

          showEvent(
            currentStop
          );


          /*
            Final state.
          */

          if (
            currentStop ===
            CV_EVENTS.length - 1
          ) {

            triggerFinalReveal();

          }

        }

      });


    tl.to(
      window,
      {
        duration:
          SETTINGS.travelDuration,

        ease:
          "power2.inOut",

        onUpdate() {

          /*
            We use GSAP's progress indirectly through
            the timeline below.
          */

        }

      }
    );


    /*
      Actual camera movement.
    */

    const startX =
      cameraX;

    const startY =
      cameraY;

    const startZoom =
      cameraZoom;


    const state = {
      progress: 0
    };


    tl.to(
      state,
      {
        progress: 1,

        duration:
          SETTINGS.travelDuration,

        ease:
          "power2.inOut",

        onUpdate() {

          cameraX =
            THREE.MathUtils.lerp(
              startX,
              target.x,
              state.progress
            );


          cameraY =
            THREE.MathUtils.lerp(
              startY,
              target.y,
              state.progress
            );


          cameraZoom =
            THREE.MathUtils.lerp(
              startZoom,
              target.zoom,
              state.progress
            );

        }

      },
      0
    );


    /*
      Hold at the event.

      This is the important part:
      the user cannot immediately blast through
      the next event.
    */

    tl.to(
      {},
      {
        duration:
          SETTINGS.stopDuration,
      }
    );

  }


  /* =========================================================
     FINAL REVEAL
     ========================================================= */

  function triggerFinalReveal() {

    if (finalReveal) {
      return;
    }


    finalReveal = true;


    /*
      Fade the event text.
    */

    setTimeout(
      () => {

        hideAllEvents();

      },
      1800
    );


    /*
      Then pull the camera away from the trajectory.

      This creates the final "step back and see the
      whole pattern" moment.
    */

    const finalState = {
      zoom: cameraZoom
    };


    gsap.to(
      finalState,
      {
        zoom: 0.23,

        duration: 4.8,

        delay: 1.5,

        ease: "power3.inOut",

        onUpdate() {

          cameraZoom =
            finalState.zoom;

        },

        onComplete() {

          if (revealCopy) {

            revealCopy.classList.add(
              "is-visible"
            );

          }

        }

      }
    );


    /*
      Make the trajectory more visible.
    */

    gsap.to(
      trajectoryMaterial,
      {
        opacity: 0.95,

        duration: 2.5,

        delay: 1.4,

        ease: "power2.out"
      }
    );

  }


  /* =========================================================
     FORWARD
     ========================================================= */

  function nextStop() {

    if (isMoving) {
      return;
    }


    if (
      currentStop <
      CV_EVENTS.length - 1
    ) {

      moveToStop(
        currentStop + 1
      );

    }

  }


  /* =========================================================
     BACKWARD
     ========================================================= */

  function previousStop() {

    if (isMoving) {
      return;
    }


    /*
      If the user comes backward from the final reveal,
      restore the field copy.
    */

    if (finalReveal) {

      finalReveal = false;


      if (revealCopy) {

        revealCopy.classList.remove(
          "is-visible"
        );

      }


      gsap.killTweensOf(
        cameraTargets
      );

    }


    if (currentStop > 0) {

      moveToStop(
        currentStop - 1
      );

    }

  }


  /* =========================================================
     MOUSE / TRACKPAD
     ========================================================= */

  window.addEventListener(
    "wheel",
    (event) => {

      /*
        Completely take control away from normal page
        scrolling.
      */

      event.preventDefault();


      if (wheelLocked) {
        return;
      }


      if (isMoving) {
        return;
      }


      /*
        Ignore tiny trackpad noise.
      */

      if (
        Math.abs(
          event.deltaY
        ) < 8
      ) {
        return;
      }


      wheelLocked = true;


      if (
        event.deltaY > 0
      ) {

        nextStop();

      } else {

        previousStop();

      }


      /*
        One physical wheel gesture becomes ONE
        trajectory transition.
      */

      window.setTimeout(
        () => {

          wheelLocked = false;

        },
        SETTINGS.wheelCooldown
      );

    },
    {
      passive: false
    }
  );


  /* =========================================================
     KEYBOARD
     ========================================================= */

  window.addEventListener(
    "keydown",
    (event) => {

      const key =
        event.key;


      if (
        key !== "ArrowRight" &&
        key !== "ArrowDown" &&
        key !== "ArrowLeft" &&
        key !== "ArrowUp"
      ) {
        return;
      }


      event.preventDefault();


      if (
        key === "ArrowRight" ||
        key === "ArrowDown"
      ) {

        nextStop();

      }


      if (
        key === "ArrowLeft" ||
        key === "ArrowUp"
      ) {

        previousStop();

      }

    }
  );


  /* =========================================================
     BUTTONS
     ========================================================= */

  if (nextButton) {

    nextButton.addEventListener(
      "click",
      () => {

        nextStop();

      }
    );

  }


  if (prevButton) {

    prevButton.addEventListener(
      "click",
      () => {

        previousStop();

      }
    );

  }


  /* =========================================================
     INITIAL CAMERA
     ========================================================= */

  const firstPoint =
    getTrajectoryPoint(0);


  cameraX =
    firstPoint.x;


  cameraY =
    firstPoint.y;


  cameraZoom =
    0.58;


  eventMarker.position.x =
    firstPoint.x;


  eventMarker.position.y =
    firstPoint.y;


  /* =========================================================
     RENDER LOOP
     ========================================================= */

  function render() {

    requestAnimationFrame(
      render
    );


    /*
      Camera follows the mathematical trajectory.
    */

    camera.position.x =
      cameraX;

    camera.position.y =
      cameraY;


    /*
      Orthographic camera zoom.
    */

    const aspect =
      window.innerWidth /
      window.innerHeight;


    const viewHeight =
      2 /
      cameraZoom;


    const viewWidth =
      viewHeight *
      aspect;


    camera.left =
      -viewWidth / 2;

    camera.right =
      viewWidth / 2;

    camera.top =
      viewHeight / 2;

    camera.bottom =
      -viewHeight / 2;


    camera.updateProjectionMatrix();


    /*
      Very subtle field movement.
    */

    trajectoryGroup.rotation.z =
      Math.sin(
        performance.now() *
        0.00008
      ) *
      0.002;


    renderer.render(
      scene,
      camera
    );

  }


  render();


  /* =========================================================
     RESIZE
     ========================================================= */

  window.addEventListener(
    "resize",
    () => {

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );


      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          2
        )
      );

    }
  );


  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  if (
    reducedMotion.matches
  ) {

    document.body.classList.add(
      "reduced-motion"
    );

  }


  /* =========================================================
     INITIAL UI
     ========================================================= */

  updateButtons();


  /*
    The first wheel/arrow/click starts the experience.
  */

})();
