/* ============================================================
   DRAVYA — CHAOS THEORY CV
   Camera follows a single continuous trajectory.

   The trajectory is inspired by the geometry of a Lorenz-style
   chaotic system. It is a visual metaphor, not a claim that
   a human life literally follows the Lorenz equations.
============================================================ */


/* ============================================================
   GSAP
============================================================ */

gsap.registerPlugin(ScrollTrigger);


/* ============================================================
   DOM
============================================================ */

const svg = document.getElementById("trajectory-svg");
const world = document.getElementById("world");
const path = document.getElementById("life-path");
const observer = document.getElementById("observer");
const nodesGroup = document.getElementById("nodes");

const eventCard = document.getElementById("event-card");
const eventDate = document.getElementById("event-date");
const eventTitle = document.getElementById("event-title");
const eventDescription = document.getElementById("event-description");

const traceCounter = document.getElementById("trace-counter");
const yearReadout = document.getElementById("year-readout");


/* ============================================================
   CANVAS
============================================================ */

const VIEW_W = 2000;
const VIEW_H = 1200;


/* ============================================================
   LIFE EVENTS
============================================================ */

const EVENTS = [

    {
        year: "1999",
        title: "Born in Mysore",
        description: "The trajectory begins."
    },

    {
        year: "2015",
        title: "10th Grade",
        description: "Completed 10th grade with 87.52%. No tuitions. Distinction."
    },

    {
        year: "Mar 2017",
        title: "Pre-University",
        description: "Completed PUC with 63% in Physics, Chemistry, Mathematics and Electronics."
    },

    {
        year: "Aug 2017",
        title: "B.Sc. Physics · Mathematics · Electronics",
        description: "Joined Yuvaraja College, Mysore."
    },

    {
        year: "2017",
        title: "First Semester Physics",
        description: "Failed first-semester Physics."
    },

    {
        year: "Aug 2018",
        title: "Part-Time Job",
        description: "Joined a part-time job."
    },

    {
        year: "Feb 2019",
        title: "Another Setback",
        description: "Quit the job. Failed 3rd-semester Physics and the 1st-semester Physics re-exam."
    },

    {
        year: "Mar 2019",
        title: "SWASTAIN",
        description: "Formed a music band. Jam sessions, Battle of Bands competitions and performances at various college events."
    },

    {
        year: "Feb 2020",
        title: "Final SWASTAIN Performance",
        description: "The band's final performance."
    },

    {
        year: "Mar 2020",
        title: "Lockdown",
        description: "The world stopped."
    },

    {
        year: "Apr 2020",
        title: "Editor",
        description: "Joined a Kannada local news channel as an editor."
    },

    {
        year: "Jun 2020",
        title: "Quit",
        description: "Left the editing job."
    },

    {
        year: "Jul 2020",
        title: "Final-Year Exams",
        description: "Completed the final-year examinations."
    },

    {
        year: "Nov 2020",
        title: "Source Hub",
        description: "Joined a night-shift job at Source Hub."
    },

    {
        year: "Feb 2021",
        title: "Quit",
        description: "Left Source Hub."
    },

    {
        year: "Mar 2021",
        title: "At Home",
        description: "A period spent at home."
    },

    {
        year: "Apr 2021",
        title: "Another Call Center Job",
        description: "Joined another call center job."
    },

    {
        year: "Jul 2021",
        title: "Quit",
        description: "Left the job."
    },

    {
        year: "Oct 2021",
        title: "Diya Systems",
        description: "Joined Diya Systems and worked there for 10 months."
    },

    {
        year: "Aug 2022",
        title: "Quit Diya Systems",
        description: "Left Diya Systems."
    },

    {
        year: "Apr 2023",
        title: "Bangalore",
        description: "Moved to Bangalore."
    },

    {
        year: "Jun 2023",
        title: "Concentrix",
        description: "Joined Concentrix and worked there for one year."
    },

    {
        year: "Jun 2024",
        title: "Quit",
        description: "Left Concentrix."
    },

    {
        year: "Jul 2024",
        title: "Hampi",
        description: "A solo trip to Hampi."
    },

    {
        year: "Aug 2024",
        title: "Ramaiah University",
        description: "Joined Ramaiah University for an M.Sc. in Physics."
    },

    {
        year: "Sep 2024",
        title: "M.Sc. Physics Begins",
        description: "College started. The trajectory entered a new region."
    },

    {
        year: "Sem 1",
        title: "CGPA 6.7",
        description: "First semester of the M.Sc. Physics programme."
    },

    {
        year: "Sem 2",
        title: "CGPA 6.8",
        description: "Second semester of the M.Sc. Physics programme."
    },

    {
        year: "Sem 3",
        title: "CGPA 8.1",
        description: "Third semester of the M.Sc. Physics programme."
    },

    {
        year: "Sem 4",
        title: "CGPA 8.4",
        description: "Fourth semester of the M.Sc. Physics programme."
    },

    {
        year: "2026",
        title: "Experimental High-Energy Physics",
        description: "M.Sc. thesis in experimental high-energy physics."
    },

    {
        year: "Jun 2026",
        title: "NAXXATRA",
        description: "Joined Naxxatra as a Research & Teaching Fellow."
    }

];


/* ============================================================
   TRAJECTORY GENERATION
   ------------------------------------------------------------
   Lorenz system:
       dx/dt = σ(y-x)
       dy/dt = x(ρ-z)-y
       dz/dt = xy-βz

   We project x/y into 2D.
============================================================ */

function generateLorenz(points = 12000) {

    let x = 0.1;
    let y = 0;
    let z = 0;

    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;

    const dt = 0.005;

    const raw = [];

    // Remove the initial transient.
    for (let i = 0; i < 1500; i++) {

        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
    }


    for (let i = 0; i < points; i++) {

        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        raw.push({
            x,
            y,
            z
        });
    }

    return raw;
}


/* ============================================================
   NORMALIZE TRAJECTORY
============================================================ */

function normalizeTrajectory(raw) {

    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    raw.forEach(p => {

        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);

        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);

    });


    const padding = 120;

    const targetW = VIEW_W - padding * 2;
    const targetH = VIEW_H - padding * 2;


    const rangeX = maxX - minX;
    const rangeY = maxY - minY;


    const scale = Math.min(
        targetW / rangeX,
        targetH / rangeY
    );


    return raw.map(p => {

        return {

            x:
                (p.x - minX) * scale
                + padding
                + (targetW - rangeX * scale) / 2,

            y:
                (p.y - minY) * scale
                + padding
                + (targetH - rangeY * scale) / 2

        };

    });

}


/* ============================================================
   BUILD SVG PATH
============================================================ */

const rawTrajectory = generateLorenz();
const trajectory = normalizeTrajectory(rawTrajectory);

let pathData = "";

trajectory.forEach((p, i) => {

    if (i === 0) {

        pathData += `M ${p.x} ${p.y}`;

    } else {

        pathData += ` L ${p.x} ${p.y}`;

    }

});

path.setAttribute("d", pathData);


/* ============================================================
   PATH LENGTH
============================================================ */

const PATH_LENGTH = path.getTotalLength();


/* ============================================================
   EVENT POSITIONS
   ------------------------------------------------------------
   Events are distributed across the single trajectory.
============================================================ */

const eventProgress = EVENTS.map((event, index) => {

    if (index === 0) return 0;

    if (index === EVENTS.length - 1) return 1;

    // Slightly nonlinear distribution.
    const linear = index / (EVENTS.length - 1);

    return (
        linear * 0.88 +
        Math.sin(linear * Math.PI) * 0.08
    );

});


/* ============================================================
   CREATE NODES
============================================================ */

EVENTS.forEach((event, index) => {

    const distance =
        PATH_LENGTH *
        eventProgress[index];

    const point =
        path.getPointAtLength(distance);

    const node =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    node.setAttribute("class", "event-node");

    if (
        index === 0 ||
        index === EVENTS.length - 1
    ) {
        node.classList.add("major");
    }

    node.setAttribute("cx", point.x);
    node.setAttribute("cy", point.y);

    node.setAttribute(
        "r",
        index === EVENTS.length - 1
            ? "9"
            : "5"
    );

    nodesGroup.appendChild(node);

});


/* ============================================================
   CAMERA
============================================================ */

const CAMERA_SCALE = 5.2;


/*
    Calculate tangent angle at a point on the trajectory.
*/

function getCameraData(progress) {

    const distance =
        Math.max(
            0,
            Math.min(
                PATH_LENGTH,
                PATH_LENGTH * progress
            )
        );


    const sample = 3;

    const p =
        path.getPointAtLength(distance);

    const p1 =
        path.getPointAtLength(
            Math.max(0, distance - sample)
        );

    const p2 =
        path.getPointAtLength(
            Math.min(PATH_LENGTH, distance + sample)
        );


    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const angle =
        Math.atan2(dy, dx)
        * 180 / Math.PI;


    return {
        point: p,
        angle
    };

}


/* ============================================================
   CAMERA TRANSFORM
============================================================ */

function setCamera(
    progress,
    scale = CAMERA_SCALE,
    rotationMultiplier = 1
) {

    const camera =
        getCameraData(progress);

    const x = camera.point.x;
    const y = camera.point.y;

    const angle =
        camera.angle *
        rotationMultiplier;


    /*
        Current point becomes the center
        of the viewport.

        The world rotates with the trajectory.
    */

    const transform = `
        translate(
            ${VIEW_W / 2}
            ${VIEW_H / 2}
        )
        rotate(
            ${-angle}
        )
        scale(
            ${scale}
        )
        translate(
            ${-x}
            ${-y}
        )
    `;

    world.setAttribute(
        "transform",
        transform
    );


    observer.setAttribute(
        "cx",
        x
    );

    observer.setAttribute(
        "cy",
        y
    );

}


/* ============================================================
   INITIAL CAMERA
============================================================ */

setCamera(
    0,
    CAMERA_SCALE,
    0.55
);


/* ============================================================
   EVENT CARD
============================================================ */

let currentEvent = -1;

function showEvent(index) {

    if (
        index < 0 ||
        index >= EVENTS.length
    ) {
        return;
    }

    if (index === currentEvent) {
        return;
    }

    currentEvent = index;

    const event = EVENTS[index];


    gsap.killTweensOf(eventCard);

    gsap.to(
        eventCard,
        {
            opacity: 0,
            duration: 0.18,
            ease: "power2.out",
            onComplete: () => {

                eventDate.textContent =
                    event.year;

                eventTitle.textContent =
                    event.title;

                eventDescription.textContent =
                    event.description;

                traceCounter.textContent =
                    `TRACE ${String(index + 1).padStart(2, "0")} / ${String(EVENTS.length).padStart(2, "0")}`;

                yearReadout.textContent =
                    event.year;


                gsap.to(
                    eventCard,
                    {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    }
                );

            }
        }
    );

}


/* ============================================================
   START EVENT
============================================================ */

showEvent(0);


/* ============================================================
   SCROLL → STORY PROGRESS
============================================================ */

/*
    Every event gets:

        travel
        ↓
        deceleration
        ↓
        reading hold

    The page keeps scrolling physically, but the camera
    remains on the node during the reading interval.
*/

function getStoryState(rawProgress) {

    const maxFollow = 0.91;

    const p =
        Math.min(
            1,
            rawProgress / maxFollow
        );


    const segments =
        EVENTS.length - 1;

    const scaled =
        p * segments;

    let segment =
        Math.floor(scaled);

    segment =
        Math.max(
            0,
            Math.min(
                segments - 1,
                segment
            )
        );


    let local =
        scaled - segment;


    /*
        0 → 0.72

        Camera travels.

        0.72 → 1

        Camera stays at the next node.
    */

    const travelEnd = 0.72;

    let trajectoryProgress;


    if (local < travelEnd) {

        const travelProgress =
            local / travelEnd;

        /*
            Power easing creates
            acceleration/deceleration.
        */

        const eased =
            gsap.parseEase(
                "power3.inOut"
            )(travelProgress);


        trajectoryProgress =
            gsap.utils.interpolate(
                eventProgress[segment],
                eventProgress[segment + 1],
                eased
            );

    } else {

        trajectoryProgress =
            eventProgress[segment + 1];

    }


    const isHolding =
        local >= travelEnd;


    return {
        trajectoryProgress,
        segment,
        local,
        isHolding
    };

}


/* ============================================================
   JOURNEY SCROLL
============================================================ */

ScrollTrigger.create({

    trigger: ".journey",

    start: "top top",
    end: "bottom bottom",

    scrub: 1.35,

    onUpdate: self => {

        const state =
            getStoryState(
                self.progress
            );


        /*
            Camera follows the line.
        */

        setCamera(
            state.trajectoryProgress,
            CAMERA_SCALE,
            0.55
        );


        /*
            Show the next event only
            when the camera has arrived
            and entered its reading hold.
        */

        if (state.isHolding) {

            showEvent(
                state.segment + 1
            );

            eventCard.style.opacity = "1";

        }


        /*
            During travel, keep information
            subtle rather than instantly
            swapping.
        */

        else {

            eventCard.style.opacity =
                "0.28";

        }


        /*
            At the very end of the follow
            phase, make sure Naxxatra is visible.
        */

        if (self.progress >= 0.905) {

            showEvent(
                EVENTS.length - 1
            );

            eventCard.style.opacity = "1";

        }

    }

});


/* ============================================================
   REVEAL CAMERA
============================================================ */

const revealData = {

    centerX: 0,
    centerY: 0,
    fitScale: 1

};


/* ============================================================
   FULL TRAJECTORY BOUNDS
============================================================ */

function calculateRevealBounds() {

    const box =
        path.getBBox();

    revealData.centerX =
        box.x + box.width / 2;

    revealData.centerY =
        box.y + box.height / 2;


    const padding = 120;

    const scaleX =
        (VIEW_W - padding) /
        box.width;

    const scaleY =
        (VIEW_H - padding) /
        box.height;


    /*
        Slightly smaller than maximum
        fit so the whole shape breathes.
    */

    revealData.fitScale =
        Math.min(
            scaleX,
            scaleY
        ) * 0.72;

}


calculateRevealBounds();


/* ============================================================
   FULL REVEAL TRANSFORM
============================================================ */

function setRevealCamera(progress) {

    /*
        Follow camera starts zoomed in.
        Then pulls away.

        Camera:
            local point
              ↓
            whole trajectory
    */


    const endScale =
        revealData.fitScale;


    const scale =
        gsap.utils.interpolate(
            CAMERA_SCALE,
            endScale,
            progress
        );


    const camera =
        getCameraData(1);


    const currentX =
        gsap.utils.interpolate(
            camera.point.x,
            revealData.centerX,
            progress
        );

    const currentY =
        gsap.utils.interpolate(
            camera.point.y,
            revealData.centerY,
            progress
        );


    /*
        Rotation gradually disappears.
    */

    const rotation =
        gsap.utils.interpolate(
            -camera.angle * 0.55,
            0,
            progress
        );


    const transform = `
        translate(
            ${VIEW_W / 2}
            ${VIEW_H / 2}
        )
        rotate(
            ${rotation}
        )
        scale(
            ${scale}
        )
        translate(
            ${-currentX}
            ${-currentY}
        )
    `;


    world.setAttribute(
        "transform",
        transform
    );


    /*
        Fade the event card while
        revealing the complete system.
    */

    eventCard.style.opacity =
        String(
            Math.max(
                0,
                1 - progress * 2
            )
        );


    /*
        Once zoomed out, remove observer emphasis.
    */

    observer.style.opacity =
        String(
            Math.max(
                0,
                1 - progress * 2.5
            )
        );

}


/* ============================================================
   REVEAL SCROLL
============================================================ */

ScrollTrigger.create({

    trigger: ".reveal",

    start: "top top",
    end: "bottom bottom",

    scrub: 1.5,

    onUpdate: self => {

        setRevealCamera(
            self.progress
        );

    }

});


/* ============================================================
   REVEAL TEXT FADE
============================================================ */

gsap.fromTo(

    ".reveal-copy",

    {
        opacity: 1
    },

    {
        opacity: 0,

        scrollTrigger: {

            trigger: ".reveal",

            start: "top top",

            end: "35% top",

            scrub: true

        }

    }

);


/* ============================================================
   EXPLANATION REVEAL
============================================================ */

gsap.from(
    ".chaos-explanation .explanation-inner",

    {
        opacity: 0,
        y: 80,

        scrollTrigger: {

            trigger: ".chaos-explanation",

            start: "top 75%",

            end: "top 30%",

            scrub: true

        }

    }

);


/* ============================================================
   RESIZE
============================================================ */

window.addEventListener(
    "resize",
    () => {

        calculateRevealBounds();

        ScrollTrigger.refresh();

    }
);


/* ============================================================
   OPTIONAL: REDUCED MOTION
============================================================ */

if (
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches
) {

    gsap.globalTimeline.timeScale(0.5);

}
