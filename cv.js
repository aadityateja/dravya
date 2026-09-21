/* =====================================================
   ADDY — TRAJECTORY CV
   cv.js
===================================================== */

gsap.registerPlugin(ScrollTrigger);


/* =====================================================
   ELEMENTS
===================================================== */

const svg = document.getElementById("trajectorySvg");
const lifePath = document.getElementById("lifePath");
const ghostPath = document.getElementById("ghostPath");
const observer = document.getElementById("observer");

const eventInfo = document.getElementById("eventInfo");
const eventYear = document.querySelector(".event-year");
const eventTitle = document.querySelector(".event-title");
const eventDescription = document.querySelector(".event-description");

const progressText = document.getElementById("progressText");


/* =====================================================
   TIMELINE
===================================================== */

const events = [

    {
        year: "1999",
        title: "MYSORE",
        description: "Born in Mysore.",
        t: 0.00
    },

    {
        year: "2015",
        title: "10TH GRADE",
        description: "87.52% · Distinction · No tuition.",
        t: 0.075
    },

    {
        year: "2017",
        title: "PRE-UNIVERSITY",
        description: "Physics · Chemistry · Mathematics · Electronics — 63%.",
        t: 0.14
    },

    {
        year: "2017",
        title: "B.Sc. PHYSICS",
        description: "Physics · Mathematics · Electronics · Yuvaraja College, Mysore.",
        t: 0.19
    },

    {
        year: "2017",
        title: "FIRST SETBACK",
        description: "1st semester Physics — failed.",
        t: 0.23
    },

    {
        year: "2018",
        title: "PART-TIME WORK",
        description: "Joined a part-time job.",
        t: 0.27
    },

    {
        year: "2019",
        title: "ANOTHER SETBACK",
        description: "Quit the job. 3rd semester Physics and 1st semester re-exam Physics — failed.",
        t: 0.32
    },

    {
        year: "2019",
        title: "SWASTAIN",
        description: "Music band formed. Jam sessions · Battle of Bands · College performances.",
        t: 0.37
    },

    {
        year: "2020",
        title: "FINAL PERFORMANCE",
        description: "SWASTAIN — final performance.",
        t: 0.42
    },

    {
        year: "2020",
        title: "LOCKDOWN",
        description: "March 2020. The world stopped.",
        t: 0.45
    },

    {
        year: "2020",
        title: "EDITOR",
        description: "Joined a Kannada local news channel as an editor.",
        t: 0.48
    },

    {
        year: "2020",
        title: "SOURCE HUB",
        description: "Joined a night-shift job.",
        t: 0.53
    },

    {
        year: "2021",
        title: "ANOTHER TURN",
        description: "Quit. Joined another call-center role later that year.",
        t: 0.57
    },

    {
        year: "2021",
        title: "DIYА SYSTEMS",
        description: "Joined Diya Systems.",
        t: 0.61
    },

    {
        year: "2022",
        title: "MOVE ON",
        description: "Left Diya Systems.",
        t: 0.65
    },

    {
        year: "2023",
        title: "BANGALORE",
        description: "Moved to Bangalore.",
        t: 0.69
    },

    {
        year: "2023",
        title: "CONCENTRIX",
        description: "Joined Concentrix.",
        t: 0.72
    },

    {
        year: "2024",
        title: "HAMPI",
        description: "Quit Concentrix. Took a solo trip to Hampi.",
        t: 0.76
    },

    {
        year: "2024",
        title: "M.Sc. PHYSICS",
        description: "Joined Ramaiah University of Applied Sciences.",
        t: 0.80
    },

    {
        year: "SEMESTER I",
        title: "6.7",
        description: "The return to physics begins.",
        t: 0.825
    },

    {
        year: "SEMESTER II",
        title: "6.8",
        description: "Continuing the trajectory.",
        t: 0.845
    },

    {
        year: "SEMESTER III",
        title: "8.1",
        description: "The trajectory begins to accelerate.",
        t: 0.875
    },

    {
        year: "SEMESTER IV",
        title: "8.4",
        description: "The line enters experimental high-energy physics.",
        t: 0.90
    },

    {
        year: "2026",
        title: "M.Sc. THESIS",
        description: "Experimental High-Energy Physics · Neutron-induced hadronic shower development in a Zero Degree Calorimeter.",
        t: 0.94
    },

    {
        year: "JUNE 2026",
        title: "NAXXATRA",
        description: "Research & Teaching Fellow.",
        t: 1.00
    }

];


/* =====================================================
   LORENZ-STYLE TRAJECTORY
===================================================== */

function generateTrajectory() {

    let x = 0.1;
    let y = 0;
    let z = 0;

    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;

    const dt = 0.005;

    const points = [];

    const total = 8500;

    for (let i = 0; i < total; i++) {

        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        if (i > 500) {
            points.push({
                x,
                y,
                z
            });
        }

    }


    /*
        We don't want the classic Lorenz butterfly
        to be immediately obvious.

        We rotate and compress the coordinates
        into a cinematic 2D trajectory.
    */

    const projected = points.map(p => {

        const px =
            p.x * 26 +
            p.z * 1.8;

        const py =
            p.y * 19 -
            p.z * 0.6;

        return {
            x: px,
            y: py
        };

    });


    /*
        Normalize.
    */

    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    projected.forEach(p => {

        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);

        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);

    });


    const width = 1200;
    const height = 700;

    const margin = 70;

    const normalized = projected.map(p => {

        const nx =
            margin +
            ((p.x - minX) / (maxX - minX)) *
            (width - margin * 2);

        const ny =
            margin +
            ((p.y - minY) / (maxY - minY)) *
            (height - margin * 2);

        return {
            x: nx + 100,
            y: ny + 100
        };

    });


    return normalized;

}


const points = generateTrajectory();


/* =====================================================
   BUILD SVG PATH
===================================================== */

function buildPath(points) {

    let d = "";

    points.forEach((p, i) => {

        if (i === 0) {

            d += `M ${p.x} ${p.y}`;

        } else {

            d += ` L ${p.x} ${p.y}`;

        }

    });

    return d;

}


const pathData = buildPath(points);

lifePath.setAttribute("d", pathData);
ghostPath.setAttribute("d", pathData);


/* =====================================================
   PATH LENGTH
===================================================== */

const pathLength = lifePath.getTotalLength();

lifePath.style.strokeDasharray = pathLength;
lifePath.style.strokeDashoffset = pathLength;

ghostPath.style.strokeDasharray = pathLength;


/* =====================================================
   PATH HELPERS
===================================================== */

function pointAt(t) {

    const distance =
        Math.max(
            0,
            Math.min(
                pathLength,
                t * pathLength
            )
        );

    return lifePath.getPointAtLength(distance);

}


/* =====================================================
   EVENT DISPLAY
===================================================== */

let currentEvent = -1;


function showEvent(index) {

    if (index === currentEvent) {
        return;
    }

    currentEvent = index;

    if (index < 0) {
        return;
    }

    const event = events[index];

    gsap.killTweensOf(eventInfo);

    gsap.to(eventInfo, {
        opacity: 0,
        y: 10,
        duration: 0.15,
        ease: "power2.out",
        onComplete: () => {

            eventYear.textContent = event.year;
            eventTitle.textContent = event.title;
            eventDescription.textContent = event.description;

            gsap.fromTo(
                eventInfo,
                {
                    opacity: 0,
                    y: 10
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out"
                }
            );

        }
    });

}


/* =====================================================
   DETERMINE CURRENT EVENT
===================================================== */

function getEventForProgress(progress) {

    let active = 0;

    events.forEach((event, index) => {

        if (progress >= event.t) {
            active = index;
        }

    });

    return active;

}


/* =====================================================
   INITIAL EVENT
===================================================== */

showEvent(0);


/* =====================================================
   MAIN SCROLL ANIMATION
===================================================== */

const trajectoryState = {
    progress: 0,
    zoom: 1
};


const journeyTimeline = gsap.timeline({

    scrollTrigger: {

        trigger: ".journey",

        start: "top top",

        end: "bottom bottom",

        scrub: 1.5,

        pin: false,

        onUpdate: self => {

            const progress = self.progress;

            /*
                First ~86%:
                Follow the trajectory.

                Final ~14%:
                Begin pulling camera away.
            */

            const followProgress =
                Math.min(
                    1,
                    progress / 0.86
                );


            trajectoryState.progress = followProgress;


            /*
                Draw the line.
            */

            const drawLength =
                pathLength *
                followProgress;

            lifePath.style.strokeDashoffset =
                pathLength - drawLength;


            /*
                Find observer position.
            */

            const point =
                pointAt(followProgress);

            observer.setAttribute(
                "cx",
                point.x
            );

            observer.setAttribute(
                "cy",
                point.y
            );


            /*
                Current event.
            */

            const eventIndex =
                getEventForProgress(
                    followProgress
                );

            showEvent(eventIndex);


            /*
                Display year / progress.
            */

            const event =
                events[eventIndex];

            progressText.textContent =
                event.year;


            /*
                CAMERA BEHAVIOUR
            */

            if (progress < 0.86) {

                /*
                    Following mode.
                */

                const zoom =
                    2.0 -
                    followProgress * 0.55;

                gsap.set(svg, {
                    scale: zoom
                });

                gsap.set(observer, {
                    opacity: 1
                });

                gsap.set(eventInfo, {
                    opacity: 1
                });

            } else {

                /*
                    FINAL ZOOM OUT.

                    This is the important transition.
                */

                const revealProgress =
                    (progress - 0.86) /
                    0.14;


                const zoom =
                    1.45 -
                    revealProgress * 0.75;


                gsap.set(svg, {
                    scale: zoom
                });


                /*
                    The observer becomes less
                    important as the whole system
                    comes into view.
                */

                gsap.set(observer, {
                    opacity:
                        1 - revealProgress
                });


                gsap.set(eventInfo, {
                    opacity:
                        1 - revealProgress
                });

            }

        }

    }

});


/* =====================================================
   FINAL REVEAL
===================================================== */

gsap.to(".reveal-content", {

    opacity: 1,

    y: 0,

    duration: 1.2,

    scrollTrigger: {

        trigger: ".reveal",

        start: "top 65%",

        end: "top 30%",

        scrub: true

    }

});


/* =====================================================
   INTRO FADE
===================================================== */

gsap.to(".intro-content", {

    opacity: 0,

    scale: 0.85,

    scrollTrigger: {

        trigger: ".intro",

        start: "top top",

        end: "bottom top",

        scrub: true

    }

});


/* =====================================================
   RESPONSIVE SVG
===================================================== */

function refreshTrajectory() {

    ScrollTrigger.refresh();

}


window.addEventListener(
    "resize",
    refreshTrajectory
);


/* =====================================================
   SMALL PARALLAX EFFECT
===================================================== */

gsap.to(".stars", {

    yPercent: -15,

    ease: "none",

    scrollTrigger: {

        trigger: "#cv",

        start: "top top",

        end: "bottom bottom",

        scrub: true

    }

});
