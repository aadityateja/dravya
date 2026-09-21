/* ============================================================
   ADDY CV ENGINE
   Scroll = movement through a 2D field
============================================================ */

(() => {

    "use strict";


    /* =========================================================
       ELEMENTS
    ========================================================== */

    const scrollTrack = document.getElementById("cv-scroll");
    const world = document.getElementById("cv-world");
    const timeline = document.getElementById("timeline");

    const progressFill =
        document.querySelector(".cv-progress-fill");

    const currentYear =
        document.getElementById("current-year");

    const coordX =
        document.getElementById("coord-x");

    const coordY =
        document.getElementById("coord-y");

    const loader =
        document.getElementById("cv-loader");


    /* =========================================================
       STATE
    ========================================================== */

    let scrollProgress = 0;

    let targetX = 350;
    let targetY = 500;

    let currentX = 350;
    let currentY = 500;

    let ticking = false;


    /* =========================================================
       TIMELINE NODES
    ========================================================== */

    const nodes =
        [...document.querySelectorAll(".cv-node")];

    const nodeData =
        nodes.map(node => ({
            element: node,
            x: Number(node.dataset.x),
            y: Number(node.dataset.y),
            year: node.dataset.year
        }));


    /* =========================================================
       PATH WAYPOINTS
    ========================================================== */

    const waypoints = [

        { x: 350,  y: 500 },

        { x: 1800, y: 500 },

        { x: 3500, y: 500 },

        { x: 5000, y: 1500 },

        { x: 5000, y: 2200 },

        { x: 3500, y: 3400 },

        { x: 1700, y: 3400 },

        { x: 500,  y: 3400 },

        { x: 500,  y: 4700 },

        { x: 1800, y: 5200 },

        { x: 3300, y: 5200 },

        { x: 5000, y: 5200 },

        { x: 5000, y: 6700 },

        { x: 3500, y: 7600 },

        { x: 1700, y: 7600 }

    ];


    /* =========================================================
       INTERPOLATION
    ========================================================== */

    function easeInOut(t) {

        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;

    }


    function interpolate(a, b, t) {

        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
        };

    }


    function getCameraPosition(progress) {

        const maxIndex =
            waypoints.length - 1;

        const scaled =
            progress * maxIndex;

        const index =
            Math.min(
                Math.floor(scaled),
                maxIndex - 1
            );

        const local =
            scaled - index;

        const eased =
            easeInOut(local);

        return interpolate(
            waypoints[index],
            waypoints[index + 1],
            eased
        );

    }


    /* =========================================================
       SCROLL
    ========================================================== */

    function updateScroll() {

        const maxScroll =
            scrollTrack.offsetHeight -
            window.innerHeight;

        scrollProgress =
            Math.max(
                0,
                Math.min(
                    1,
                    window.scrollY / maxScroll
                )
            );

        const position =
            getCameraPosition(scrollProgress);

        targetX = position.x;
        targetY = position.y;

        progressFill.style.width =
            `${scrollProgress * 100}%`;

        ticking = false;

    }


    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                requestAnimationFrame(updateScroll);

                ticking = true;

            }

        },
        { passive: true }
    );


    /* =========================================================
       CAMERA
    ========================================================== */

    function render() {

        /*
         * Camera is the centre of the screen.
         *
         * The entire timeline moves opposite
         * to the camera position.
         */

        currentX +=
            (targetX - currentX) * 0.08;

        currentY +=
            (targetY - currentY) * 0.08;


        const centerX =
            window.innerWidth / 2;

        const centerY =
            window.innerHeight / 2;


        const translateX =
            centerX - currentX;

        const translateY =
            centerY - currentY;


        /*
         * Slight depth/parallax.
         */

        const parallax =
            Math.sin(scrollProgress * Math.PI * 8)
            * 15;


        world.style.transform =
            `translate3d(
                ${translateX}px,
                ${translateY + parallax}px,
                0
            )`;


        coordX.textContent =
            Math.round(currentX)
                .toString()
                .padStart(3, "0");

        coordY.textContent =
            Math.round(currentY)
                .toString()
                .padStart(3, "0");


        updateActiveNode();


        requestAnimationFrame(render);

    }


    /* =========================================================
       ACTIVE NODE
    ========================================================== */

    function updateActiveNode() {

        let closest = null;
        let closestDistance = Infinity;

        nodeData.forEach(data => {

            const dx =
                data.x - currentX;

            const dy =
                data.y - currentY;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (distance < closestDistance) {

                closestDistance = distance;
                closest = data;

            }

        });


        nodes.forEach(node => {

            node.classList.remove("active");

        });


        if (closest) {

            closest.element.classList.add("active");

            currentYear.textContent =
                closest.year;

        }

    }


    /* =========================================================
       SEMESTER MODAL
    ========================================================== */

    const modal =
        document.getElementById("semester-modal");

    const modalSemester =
        document.getElementById("modal-semester");

    const modalScore =
        document.getElementById("modal-score");

    const modalDescription =
        document.getElementById("modal-description");

    const modalClose =
        document.getElementById("modal-close");


    const semesterData = {

        1: {
            label: "SEM 01",
            score: "6.70"
        },

        2: {
            label: "SEM 02",
            score: "6.80"
        },

        3: {
            label: "SEM 03",
            score: "8.10"
        },

        4: {
            label: "SEM 04",
            score: "8.40"
        }

    };


    document
        .querySelectorAll(".semester-grid button")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const semester =
                        button.dataset.sem;

                    const data =
                        semesterData[semester];

                    modalSemester.textContent =
                        data.label;

                    modalScore.textContent =
                        data.score;

                    modalDescription.textContent =
                        "M.Sc. Physics · Academic Record";

                    modal.classList.add("open");

                }
            );

        });


    modalClose.addEventListener(
        "click",
        () => {

            modal.classList.remove("open");

        }
    );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                modal.classList.remove("open");

            }

        }
    );


    /* =========================================================
       KEYBOARD
    ========================================================== */

    window.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("open")
            ) {

                modal.classList.remove("open");

            }

        }
    );


    /* =========================================================
       MOUSE PARALLAX
    ========================================================== */

    let mouseX = 0;
    let mouseY = 0;

    let mouseTargetX = 0;
    let mouseTargetY = 0;


    window.addEventListener(
        "mousemove",
        event => {

            mouseTargetX =
                (event.clientX /
                    window.innerWidth - 0.5)
                * 20;

            mouseTargetY =
                (event.clientY /
                    window.innerHeight - 0.5)
                * 20;

        }
    );


    function mouseRender() {

        mouseX +=
            (mouseTargetX - mouseX) * 0.05;

        mouseY +=
            (mouseTargetY - mouseY) * 0.05;


        timeline.style.marginLeft =
            `${mouseX}px`;

        timeline.style.marginTop =
            `${mouseY}px`;


        requestAnimationFrame(mouseRender);

    }


    /* =========================================================
       TOUCH / MOBILE
    ========================================================== */

    let touchStartY = 0;

    window.addEventListener(
        "touchstart",
        event => {

            touchStartY =
                event.touches[0].clientY;

        },
        { passive: true }
    );


    window.addEventListener(
        "touchmove",
        event => {

            const currentTouchY =
                event.touches[0].clientY;

            const delta =
                touchStartY - currentTouchY;

            if (Math.abs(delta) > 10) {

                window.scrollBy(
                    0,
                    delta * 0.35
                );

                touchStartY =
                    currentTouchY;

            }

        },
        { passive: true }
    );


    /* =========================================================
       LOADER
    ========================================================== */

    window.addEventListener(
        "load",
        () => {

            setTimeout(
                () => {

                    loader.classList.add("loaded");

                },
                1200
            );

        }
    );


    /* =========================================================
       INITIALISE
    ========================================================== */

    updateScroll();

    render();

    mouseRender();


    /* =========================================================
       CONSOLE
    ========================================================== */

    console.log(
        "%cADDY — FIELD LOG",
        "font-size:20px;font-weight:bold;"
    );

    console.log(
        "Scroll through the trajectory."
    );

})();
