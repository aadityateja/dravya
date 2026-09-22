/* =========================================================
   DRAVYA — CV TRAJECTORY ENGINE

   One mathematical trajectory.
   The camera follows it.
   The larger structure stays hidden.
   The final zoom-out reveals the chaos field.
   ========================================================= */

gsap.registerPlugin(ScrollTrigger);


/* =========================================================
   DATA
   ========================================================= */

const events = [

    {
        year: "1999",
        title: "Born in Mysore",
        description: "The trajectory begins."
    },

    {
        year: "2015",
        title: "10th Grade",
        description: "87.52%. No tuition. A first indication that the path would be self-directed."
    },

    {
        year: "2017",
        title: "Physics · Mathematics · Electronics",
        description: "Pre-university education. 63%."
    },

    {
        year: "2017",
        title: "B.Sc Physics",
        description: "Physics, Mathematics and Electronics at Yuvaraja College, Mysore."
    },

    {
        year: "2017",
        title: "First Failure",
        description: "The first semester of physics did not go as planned."
    },

    {
        year: "2018",
        title: "A Different Direction",
        description: "A part-time job entered the trajectory."
    },

    {
        year: "2019",
        title: "Another Turn",
        description: "The job ended. Physics remained."
    },

    {
        year: "2020",
        title: "B.Sc Completed",
        description: "The undergraduate trajectory reaches its first major turning point."
    },

    {
        year: "2020",
        title: "The World Changes",
        description: "A period of uncertainty and reorientation."
    },

    {
        year: "2021",
        title: "Searching",
        description: "Looking for a way back toward science."
    },

    {
        year: "2022",
        title: "Physics Again",
        description: "The trajectory begins bending toward research."
    },

    {
        year: "2023",
        title: "M.Sc Physics",
        description: "A return to formal physics education."
    },

    {
        year: "2023",
        title: "Quantum Mechanics",
        description: "The microscopic world becomes a new language."
    },

    {
        year: "2024",
        title: "Nuclear & Particle Physics",
        description: "The trajectory moves toward the structure of matter."
    },

    {
        year: "2024",
        title: "Machine Learning",
        description: "Physics begins meeting computation."
    },

    {
        year: "2025",
        title: "Zero Degree Calorimeter",
        description: "Research into neutron-induced hadronic shower development."
    },

    {
        year: "2025",
        title: "The Detector",
        description: "Geometry, energy deposition, shower topology and reconstruction."
    },

    {
        year: "2025",
        title: "Machine Learning Reconstruction",
        description: "Learning the relationship between detector observables and energy."
    },

    {
        year: "2026",
        title: "M.Sc Physics",
        description: "The postgraduate trajectory reaches another boundary."
    },

    {
        year: "2026",
        title: "Naxxatra",
        description: "Science communication, teaching and community enter the field."
    },

    {
        year: "2026",
        title: "Science + Storytelling",
        description: "Research begins interacting with art, education and narrative."
    },

    {
        year: "2026",
        title: "DRAVYA",
        description: "Art, physics and entertainment become one field."
    },

    {
        year: "2026",
        title: "Music",
        description: "The field begins to make sound."
    },

    {
        year: "2026",
        title: "Fiction",
        description: "Ideas begin taking other forms."
    },

    {
        year: "2026",
        title: "Researcher",
        description: "The trajectory continues beyond the CV."
    },

    {
        year: "2026",
        title: "Observer",
        description: "Still observing the field."
    },

    {
        year: "2026",
        title: "Disturbance",
        description: "Every observation changes the trajectory."
    },

    {
        year: "NOW",
        title: "The Trajectory Continues",
        description: "This is not the endpoint."
    }

];


/* =========================================================
   DOM
   ========================================================= */

const svg = document.querySelector("#trajectory-svg");
const world = document.querySelector("#world");
const lifePath = document.querySelector("#life-path");
const observer = document.querySelector("#observer");
const nodesGroup = document.querySelector("#nodes");

const eventCard = document.querySelector("#event-card");
const eventDate = document.querySelector("#event-date");
const eventTitle = document.querySelector("#event-title");
const eventDescription = document.querySelector("#event-description");

const yearReadout = document.querySelector("#year-readout");
const traceCounter = document.querySelector("#trace-counter");

const revealCopy = document.querySelector(".reveal-copy");


/* =========================================================
   SVG WORLD
   ========================================================= */

const WIDTH = 2000;
const HEIGHT = 1200;


/* =========================================================
   LORENZ SYSTEM
   ========================================================= */

const sigma = 10;
const rho = 28;
const beta = 8 / 3;

const dt = 0.006;

let x = 0.1;
let y = 0;
let z = 0;

const rawPoints = [];

const TOTAL_POINTS = 8500;

for (let i = 0; i < TOTAL_POINTS; i++) {

    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    rawPoints.push({
        x,
        y,
        z
    });
}


/* =========================================================
   NORMALISE THE LORENZ SYSTEM
   ========================================================= */

let minX = Infinity;
let maxX = -Infinity;

let minY = Infinity;
let maxY = -Infinity;

let minZ = Infinity;
let maxZ = -Infinity;

rawPoints.forEach(p => {

    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);

    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);

    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);

});


/*
    We intentionally don't use the entire Lorenz
    structure during the journey.

    The journey path occupies a long hidden world.

    Only a small portion is visible around the
    camera at any moment.
*/

const WORLD_SCALE = 18;

const points = rawPoints.map(p => {

    const nx = (p.x - minX) / (maxX - minX);
    const ny = (p.y - minY) / (maxY - minY);
    const nz = (p.z - minZ) / (maxZ - minZ);

    return {

        x: (nx - 0.5) * WIDTH * 0.9,

        y:
            ((ny - 0.5) * HEIGHT * 0.8)
            -
            (nz - 0.5) * 170

    };

});


/* =========================================================
   BUILD COMPLETE PATH
   ========================================================= */

let pathString = "";

points.forEach((p, i) => {

    if (i === 0) {

        pathString += `M ${p.x} ${p.y}`;

    } else {

        pathString += ` L ${p.x} ${p.y}`;

    }

});

lifePath.setAttribute("d", pathString);


/* =========================================================
   PATH LENGTH
   ========================================================= */

const pathLength = lifePath.getTotalLength();

lifePath.style.strokeDasharray = pathLength;
lifePath.style.strokeDashoffset = pathLength;


/* =========================================================
   EVENT POSITIONS
   ========================================================= */

/*
    Events are distributed along ONE trajectory.

    They do not create separate timeline sections.
*/

const eventPositions = events.map((event, i) => {

    const progress =
        0.035 +
        (i / (events.length - 1)) * 0.90;

    return progress;

});


/* =========================================================
   CREATE EVENT NODES
   ========================================================= */

const nodeElements = [];

events.forEach((event, i) => {

    const point = lifePath.getPointAtLength(
        pathLength * eventPositions[i]
    );

    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );

    group.classList.add("trajectory-node");

    const pulse =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    pulse.setAttribute("cx", point.x);
    pulse.setAttribute("cy", point.y);
    pulse.setAttribute("r", 13);

    pulse.classList.add("node-pulse");

    const circle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", 4);

    group.appendChild(pulse);
    group.appendChild(circle);

    nodesGroup.appendChild(group);

    nodeElements.push({
        group,
        point
    });

});


/* =========================================================
   CAMERA
   ========================================================= */

/*
    Camera coordinates.

    We don't move the SVG element itself.

    Instead we move the world underneath
    the viewport.

    This creates the feeling that the observer
    is travelling through the trajectory.
*/

function moveCameraToPoint(point, zoom = 5.4) {

    const viewportWidth =
        window.innerWidth;

    const viewportHeight =
        window.innerHeight;

    const scale = zoom;

    const targetX =
        viewportWidth / 2 -
        point.x * scale;

    const targetY =
        viewportHeight / 2 -
        point.y * scale;

    gsap.set(world, {
        x: targetX,
        y: targetY,
        scale
    });

}


/* =========================================================
   INITIAL CAMERA
   ========================================================= */

const startPoint =
    lifePath.getPointAtLength(
        pathLength * eventPositions[0]
    );

moveCameraToPoint(startPoint, 6);


/* =========================================================
   EVENT CARD
   ========================================================= */

function showEvent(index) {

    const event = events[index];

    if (!event) return;

    eventDate.textContent =
        event.year;

    eventTitle.textContent =
        event.title;

    eventDescription.textContent =
        event.description;

    yearReadout.textContent =
        event.year;

    traceCounter.textContent =
        `TRACE ${String(index + 1).padStart(2, "0")} / ${String(events.length).padStart(2, "0")}`;

}


/* =========================================================
   EVENT CARD ANIMATION
   ========================================================= */

function revealEvent(index) {

    showEvent(index);

    gsap.killTweensOf(eventCard);

    gsap.fromTo(
        eventCard,

        {
            opacity: 0,
            y: 25
        },

        {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power2.out"
        }
    );

}


function hideEvent() {

    gsap.to(
        eventCard,
        {
            opacity: 0,
            y: -15,
            duration: 1.1,
            ease: "power2.inOut"
        }
    );

}


/* =========================================================
   JOURNEY SCROLL
   ========================================================= */

let currentEvent = -1;

ScrollTrigger.create({

    trigger: ".journey",

    start: "top top",

    end: "bottom bottom",

    scrub: 2.8,

    onUpdate: self => {

        const progress =
            self.progress;

        /*
            Keep the actual visible journey
            confined to the first ~92% of the
            Lorenz trajectory.

            The rest remains reserved for
            the eventual pullback.
        */

        const journeyProgress =
            0.035 +
            progress * 0.90;

        const pathPosition =
            journeyProgress * pathLength;

        const point =
            lifePath.getPointAtLength(
                pathPosition
            );

        /*
            Camera slowly follows the point.
        */

        const viewportWidth =
            window.innerWidth;

        const viewportHeight =
            window.innerHeight;

        /*
            The zoom gradually decreases
            very slightly as the journey progresses.

            This keeps the user close to the
            line without revealing the entire shape.
        */

        const zoom =
            6.4 -
            progress * 0.8;

        const targetX =
            viewportWidth / 2 -
            point.x * zoom;

        const targetY =
            viewportHeight / 2 -
            point.y * zoom;

        gsap.set(world, {
            x: targetX,
            y: targetY,
            scale: zoom
        });


        /*
            Observer remains at viewport center.
        */

        gsap.set(observer, {
            cx: point.x,
            cy: point.y
        });


        /*
            Draw the path progressively.
        */

        const visibleLength =
            Math.max(
                0,
                pathPosition -
                pathLength * 0.018
            );

        lifePath.style.strokeDashoffset =
            pathLength -
            visibleLength;


        /*
            Determine event.
        */

        let closestEvent = 0;

        let closestDistance = Infinity;

        eventPositions.forEach(
            (eventProgress, index) => {

                const distance =
                    Math.abs(
                        progress -
                        ((eventProgress - 0.035) / 0.90)
                    );

                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;

                    closestEvent =
                        index;

                }

            }
        );


        /*
            Only change event when sufficiently
            close to its actual position.
        */

        const eventProgress =
            (eventPositions[closestEvent] - 0.035) / 0.90;

        const eventDistance =
            Math.abs(
                progress -
                eventProgress
            );

        if (
            eventDistance < 0.018 &&
            closestEvent !== currentEvent
        ) {

            currentEvent =
                closestEvent;

            revealEvent(currentEvent);

        }

        /*
            Fade event away after passing it.
        */

        if (
            currentEvent >= 0 &&
            eventDistance > 0.035
        ) {

            hideEvent();

        }

    }

});


/* =========================================================
   NODE PULSING
   ========================================================= */

nodeElements.forEach((node, index) => {

    gsap.to(
        node.group.querySelector(".node-pulse"),
        {
            attr: {
                r: 19
            },

            opacity: 0.05,

            duration: 2.5,

            repeat: -1,

            yoyo: true,

            ease: "sine.inOut",

            delay: index * 0.08
        }
    );

});


/* =========================================================
   REVEAL SECTION
   ========================================================= */

/*
    The journey ends with the observer still
    sitting somewhere inside the attractor.

    Now we slowly pull the camera backwards.

    This is the moment when the larger structure
    becomes visible.
*/

ScrollTrigger.create({

    trigger: ".reveal",

    start: "top top",

    end: "bottom bottom",

    scrub: 3,

    onUpdate: self => {

        const p =
            self.progress;

        /*
            Massive slow zoom-out.

            At p = 0:
            user is still inside the trajectory.

            At p = 1:
            the entire Lorenz attractor is visible.
        */

        const startZoom = 5.6;

        const endZoom = 0.58;

        const eased =
            gsap.parseEase("power2.inOut")(p);

        const zoom =
            startZoom +
            (endZoom - startZoom) *
            eased;


        /*
            Center of complete attractor.
        */

        const centerX =
            (minX + maxX) /
            (2 * (maxX - minX));

        const centerY =
            (minY + maxY) /
            (2 * (maxY - minY));


        const targetPoint = {
            x: 0,
            y: 0
        };


        /*
            Move toward center of complete
            mathematical structure.
        */

        const viewportWidth =
            window.innerWidth;

        const viewportHeight =
            window.innerHeight;

        const targetX =
            viewportWidth / 2 -
            targetPoint.x * zoom;

        const targetY =
            viewportHeight / 2 -
            targetPoint.y * zoom;


        gsap.set(world, {
            x: targetX,
            y: targetY,
            scale: zoom
        });


        /*
            Fade the explanatory copy in
            only after the structure becomes
            visible.
        */

        const copyOpacity =
            gsap.utils.mapRange(
                0.35,
                0.78,
                0,
                1,
                p
            );

        gsap.set(
            revealCopy,
            {
                opacity:
                    gsap.utils.clamp(
                        0,
                        1,
                        copyOpacity
                    )
            }
        );

    }

});


/* =========================================================
   INITIAL EVENT
   ========================================================= */

showEvent(0);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        ScrollTrigger.refresh();

    }
);


/* =========================================================
   INTRO TRANSITION
   ========================================================= */

gsap.from(
    ".intro-inner",
    {
        opacity: 0,
        y: 35,
        duration: 2,
        ease: "power3.out"
    }
);

gsap.from(
    ".scroll-indicator",
    {
        opacity: 0,
        duration: 2,
        delay: 1,
        ease: "power2.out"
    }
);
