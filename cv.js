/* ============================================================
   ADDY — CHAOTIC TRAJECTORY ENGINE

   The entire CV lives on one chaotic trajectory.

   The user starts zoomed into the system.

   They follow the trajectory.

   NAXXATRA is near the end.

   After NAXXATRA the camera zooms out.

   The complete Lorenz attractor is finally revealed.
============================================================ */


(() => {

    "use strict";


    /* ========================================================
       ELEMENTS
    ========================================================= */

    const canvas =
        document.getElementById("chaos-canvas");

    const ctx =
        canvas.getContext("2d");

    const scrollSpace =
        document.getElementById("scroll-space");

    const progressBar =
        document.getElementById("progress-bar");

    const hudYear =
        document.getElementById("hud-year");

    const eventCard =
        document.getElementById("event-card");

    const eventIndex =
        document.getElementById("event-index");

    const eventDate =
        document.getElementById("event-date");

    const eventTitle =
        document.getElementById("event-title");

    const eventDescription =
        document.getElementById("event-description");

    const trajectoryPosition =
        document.getElementById(
            "trajectory-position"
        );

    const reveal =
        document.getElementById("reveal");

    const revealContent =
        document.querySelector(
            ".reveal-content"
        );


    /* ========================================================
       CANVAS
    ========================================================= */

    let width = 0;
    let height = 0;
    let dpr = 1;


    function resizeCanvas() {

        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        width =
            window.innerWidth;

        height =
            window.innerHeight;

        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;

        canvas.style.width =
            width + "px";

        canvas.style.height =
            height + "px";

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    window.addEventListener(
        "resize",
        resizeCanvas
    );

    resizeCanvas();


    /* ========================================================
       LORENZ ATTRACTOR
    ========================================================= */

    /*
       Lorenz equations:

       dx/dt = sigma(y-x)
       dy/dt = x(rho-z)-y
       dz/dt = xy-beta*z

       Standard chaotic parameters.
    */

    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;

    const dt = 0.005;

    const totalPoints = 18000;

    const trajectory = [];

    let x = 0.1;
    let y = 0;
    let z = 0;


    for (
        let i = 0;
        i < totalPoints;
        i++
    ) {

        const dx =
            sigma * (y - x);

        const dy =
            x * (rho - z) - y;

        const dz =
            x * y - beta * z;


        x += dx * dt;
        y += dy * dt;
        z += dz * dt;


        trajectory.push({
            x,
            y,
            z
        });

    }


    /* ========================================================
       NORMALISE TRAJECTORY
    ========================================================= */

    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;


    trajectory.forEach(point => {

        minX =
            Math.min(
                minX,
                point.x
            );

        maxX =
            Math.max(
                maxX,
                point.x
            );

        minY =
            Math.min(
                minY,
                point.y
            );

        maxY =
            Math.max(
                maxY,
                point.y
            );

    });


    const normalized =
        trajectory.map(point => {

            return {

                x:
                    (point.x - minX) /
                    (maxX - minX),

                y:
                    (point.y - minY) /
                    (maxY - minY)

            };

        });


    /* ========================================================
       EVENT DATA
    ========================================================= */

    const events = [

        {
            progress: 0.02,
            date: "1999",
            title: "MYSORE",
            description:
                "The trajectory begins."
        },

        {
            progress: 0.075,
            date: "2015",
            title: "10TH GRADE",
            description:
                "87.52% · Distinction · No tuition."
        },

        {
            progress: 0.13,
            date: "2017",
            title: "PCME",
            description:
                "Physics · Chemistry · Mathematics · Electronics."
        },

        {
            progress: 0.19,
            date: "AUG 2017",
            title: "B.Sc. PHYSICS",
            description:
                "Physics · Mathematics · Electronics · Yuvaraja College."
        },

        {
            progress: 0.25,
            date: "2017 — 2019",
            title: "SYSTEM INSTABILITY",
            description:
                "Physics failures. The trajectory did not terminate."
        },

        {
            progress: 0.32,
            date: "MAR 2019",
            title: "SWASTAIN",
            description:
                "Music band. Jam sessions · Battle of Bands · College events."
        },

        {
            progress: 0.38,
            date: "FEB 2020",
            title: "FINAL PERFORMANCE",
            description:
                "The final SWASTAIN performance."
        },

        {
            progress: 0.42,
            date: "21 MAR 2020",
            title: "LOCKDOWN",
            description:
                "The world stopped."
        },

        {
            progress: 0.50,
            date: "2020 — 2024",
            title: "WORK",
            description:
                "News · Source Hub · Call centre · Diya Systems · Concentrix."
        },

        {
            progress: 0.58,
            date: "APR 2023",
            title: "BANGALORE",
            description:
                "A new environment."
        },

        {
            progress: 0.62,
            date: "JUL 2024",
            title: "HAMPI",
            description:
                "A solo trip. A change in direction."
        },

        {
            progress: 0.68,
            date: "AUG 2024",
            title: "M.Sc. PHYSICS",
            description:
                "Ramaiah University of Applied Sciences."
        },

        {
            progress: 0.75,
            date: "2025 — 2026",
            title: "RESEARCH",
            description:
                "Experimental high energy physics · detector data · machine learning."
        },

        {
            progress: 0.84,
            date: "JUN 2026",
            title: "NAXXATRA",
            description:
                "Research & Teaching Fellow."
        }

    ];


    /* ========================================================
       STATE
    ========================================================= */

    let scrollProgress = 0;

    let smoothProgress = 0;

    let currentEvent = -1;

    let mouseX = 0.5;
    let mouseY = 0.5;


    /* ========================================================
       GET SCROLL PROGRESS
    ========================================================= */

    function updateScrollProgress() {

        const maxScroll =
            scrollSpace.offsetHeight -
            window.innerHeight;

        scrollProgress =
            maxScroll > 0
                ? window.scrollY / maxScroll
                : 0;

        scrollProgress =
            Math.max(
                0,
                Math.min(
                    1,
                    scrollProgress
                )
            );

    }


    window.addEventListener(
        "scroll",
        updateScrollProgress,
        { passive: true }
    );


    /* ========================================================
       EVENT
    ========================================================= */

    function getCurrentEvent(progress) {

        let selected = events[0];

        for (
            let i = 0;
            i < events.length;
            i++
        ) {

            if (
                progress >=
                events[i].progress
            ) {

                selected =
                    events[i];

            }

        }

        return selected;

    }


    function updateEvent(progress) {

        const selected =
            getCurrentEvent(progress);

        const index =
            events.indexOf(selected);


        if (index === currentEvent) {
            return;
        }


        currentEvent = index;


        eventCard.classList.add("fade");


        setTimeout(() => {

            eventIndex.textContent =
                String(index + 1)
                    .padStart(2, "0");

            eventDate.textContent =
                selected.date;

            eventTitle.textContent =
                selected.title;

            eventDescription.textContent =
                selected.description;

            hudYear.textContent =
                selected.date;

            eventCard.classList.remove(
                "fade"
            );

        }, 250);

    }


    /* ========================================================
       TRAJECTORY POINT
    ========================================================= */

    function getPoint(progress) {

        const index =
            Math.floor(
                progress *
                (normalized.length - 1)
            );

        return normalized[
            Math.max(
                0,
                Math.min(
                    normalized.length - 1,
                    index
                )
            )
        ];

    }


    /* ========================================================
       DRAW TRAJECTORY
    ========================================================= */

    function drawTrajectory(
        progress,
        zoom
    ) {

        ctx.save();

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * At the beginning we're extremely
         * zoomed into the attractor.
         *
         * Therefore only a small local section
         * is visible.
         */

        const current =
            getPoint(progress);


        const centerX =
            width / 2;

        const centerY =
            height / 2;


        /*
         * Full attractor dimensions.
         */

        const baseSize =
            Math.min(
                width,
                height
            ) * 0.75;


        const localZoom =
            zoom;


        /*
         * Camera movement.
         */

        const cameraOffsetX =
            (current.x - 0.5) *
            baseSize *
            localZoom;

        const cameraOffsetY =
            (current.y - 0.5) *
            baseSize *
            localZoom;


        /*
         * We draw a limited section while
         * travelling.
         *
         * Once reveal begins, the full system
         * appears.
         */

        let start;
        let end;


        if (progress < 0.88) {

            const currentIndex =
                Math.floor(
                    progress *
                    (normalized.length - 1)
                );

            const visiblePoints =
                900;

            start =
                Math.max(
                    0,
                    currentIndex -
                    visiblePoints
                );

            end =
                Math.min(
                    normalized.length - 1,
                    currentIndex +
                    200
                );

        } else {

            /*
             * Reveal the entire attractor.
             */

            start = 0;

            end =
                normalized.length - 1;

        }


        ctx.beginPath();


        for (
            let i = start;
            i <= end;
            i++
        ) {

            const point =
                normalized[i];


            const px =
                centerX +
                (
                    point.x -
                    current.x
                ) *
                baseSize *
                localZoom;


            const py =
                centerY +
                (
                    point.y -
                    current.y
                ) *
                baseSize *
                localZoom;


            if (i === start) {

                ctx.moveTo(
                    px,
                    py
                );

            } else {

                ctx.lineTo(
                    px,
                    py
                );

            }

        }


        /*
         * Glow layer.
         */

        ctx.strokeStyle =
            "rgba(184,255,61,.08)";

        ctx.lineWidth = 9;

        ctx.shadowBlur = 30;

        ctx.shadowColor =
            "rgba(184,255,61,.35)";

        ctx.stroke();


        /*
         * Main trajectory.
         */

        ctx.strokeStyle =
            "rgba(184,255,61,.85)";

        ctx.lineWidth = 2;

        ctx.shadowBlur = 0;

        ctx.stroke();


        /*
         * Current position.
         */

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            7,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.shadowBlur = 25;

        ctx.shadowColor =
            "#b8ff3d";

        ctx.fill();


        ctx.restore();

    }


    /* ========================================================
       ZOOM LOGIC
    ========================================================= */

    function getZoom(progress) {

        /*
         * Travel phase:
         *
         * Extremely zoomed in.
         */

        if (progress < 0.84) {

            return 5.5;

        }


        /*
         * NAXXATRA → REVEAL
         *
         * This is the important part.
         *
         * The user keeps scrolling after Naxxatra
         * and the camera physically pulls away.
         */

        const revealProgress =
            (progress - 0.84) /
            0.16;


        const eased =
            revealProgress *
            revealProgress *
            (3 - 2 * revealProgress);


        return (
            5.5 -
            eased * 4.5
        );

    }


    /* ========================================================
       REVEAL OPACITY
    ========================================================= */

    function updateReveal(progress) {

        if (progress < 0.84) {

            reveal.style.opacity = "0";

            return;

        }


        const revealProgress =
            (progress - 0.84) /
            0.16;


        const opacity =
            Math.min(
                1,
                revealProgress * 1.5
            );


        reveal.style.opacity =
            opacity;


        const scale =
            0.75 +
            revealProgress * 0.25;


        revealContent.style.transform =
            `scale(${scale})`;

    }


    /* ========================================================
       FINAL RENDER
    ========================================================= */

    function render() {

        /*
         * Smooth camera movement.
         */

        smoothProgress +=
            (
                scrollProgress -
                smoothProgress
            ) * 0.08;


        const progress =
            smoothProgress;


        const zoom =
            getZoom(progress);


        drawTrajectory(
            progress,
            zoom
        );


        updateEvent(
            progress
        );


        updateReveal(
            progress
        );


        progressBar.style.width =
            `${progress * 100}%`;


        trajectoryPosition.textContent =
            `${Math.round(progress * 100)
                .toString()
                .padStart(2, "0")}%`;


        requestAnimationFrame(
            render
        );

    }


    /* ========================================================
       MOUSE PARALLAX
    ========================================================= */

    window.addEventListener(
        "mousemove",
        event => {

            mouseX =
                event.clientX /
                window.innerWidth;

            mouseY =
                event.clientY /
                window.innerHeight;

        }
    );


    /* ========================================================
       LOADER
    ========================================================= */

    window.addEventListener(
        "load",
        () => {

            setTimeout(() => {

                document
                    .getElementById("loader")
                    .classList
                    .add("loaded");

            }, 1400);

        }
    );


    /* ========================================================
       INITIALISE
    ========================================================= */

    updateScrollProgress();

    render();


    console.log(
        "%cADDY — CHAOTIC TRAJECTORY",
        `
        font-size:24px;
        font-weight:bold;
        color:#b8ff3d;
        `
    );

    console.log(
        "The entire trajectory is generated from a Lorenz chaotic system."
    );


})();
