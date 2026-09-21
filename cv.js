/* ==========================================================
   ADDY — FIELD LOG
   V1 INTERACTION ENGINE
========================================================== */


/* ==========================================================
   LOADER
========================================================== */

const loader = document.getElementById("loader");
const loaderText = document.getElementById("loaderText");
const loaderProgress = document.getElementById("loaderProgress");
const enterButton = document.getElementById("enterButton");

let progress = 0;

const loaderMessages = [
    "INITIALISING FIELD...",
    "LOADING TRAJECTORY...",
    "CALIBRATING TIMELINE...",
    "MAPPING EVENTS...",
    "SYSTEM READY."
];

const loaderInterval = setInterval(() => {

    progress += Math.random() * 12;

    if (progress >= 100) {
        progress = 100;
        clearInterval(loaderInterval);
    }

    loaderProgress.style.width = `${progress}%`;

    const index = Math.min(
        Math.floor(progress / 20),
        loaderMessages.length - 1
    );

    loaderText.textContent = loaderMessages[index];

}, 150);


/* ==========================================================
   ENTER
========================================================== */

enterButton.addEventListener("click", () => {

    loader.classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

});


/* ==========================================================
   NAVIGATION
========================================================== */

const menuButton = document.getElementById("menuButton");
const navigation = document.getElementById("navigation");

menuButton.addEventListener("click", () => {

    navigation.classList.toggle("open");

    menuButton.textContent =
        navigation.classList.contains("open")
            ? "CLOSE"
            : "MENU";

});


const navButtons =
    document.querySelectorAll(
        ".nav-inner button"
    );

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const target =
            document.getElementById(
                button.dataset.target
            );

        navigation.classList.remove("open");

        menuButton.textContent = "MENU";

        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});


/* ==========================================================
   GENERIC SCROLL BUTTONS
========================================================== */

document
    .querySelectorAll("[data-scroll]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const target =
                document.getElementById(
                    button.dataset.scroll
                );

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });


/* ==========================================================
   SEMESTER DATA
========================================================== */

const semesterData = {

    "SEM 01": [
        "Subjects / papers to be added.",
        "Semester CGPA: 6.70"
    ],

    "SEM 02": [
        "Subjects / papers to be added.",
        "Semester CGPA: 6.80"
    ],

    "SEM 03": [
        "Subjects / papers to be added.",
        "Semester CGPA: 8.10"
    ],

    "SEM 04": [
        "Subjects / papers to be added.",
        "Semester CGPA: 8.40",
        "Thesis: Experimental High Energy Physics"
    ]

};


/* ==========================================================
   MODAL
========================================================== */

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

document
    .querySelectorAll(".details-button")
    .forEach((button, index) => {

        button.addEventListener("click", () => {

            const semester =
                `SEM 0${index + 1}`;

            const data =
                semesterData[semester];

            modalTitle.textContent = semester;

            modalBody.innerHTML =
                data
                    .map(item => `<p>${item}</p>`)
                    .join("");

            modal.classList.add("open");

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

        });

    });


function closeModal() {

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


modalClose.addEventListener(
    "click",
    closeModal
);


document
    .querySelector(".modal-backdrop")
    .addEventListener(
        "click",
        closeModal
    );


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modal.classList.contains("open")
        ) {

            closeModal();

        }

    }
);


/* ==========================================================
   PARALLAX / MOUSE FIELD
========================================================== */

const particles =
    document.querySelectorAll(
        ".hero-particle"
    );

document.addEventListener(
    "mousemove",
    event => {

        const x =
            (event.clientX /
                window.innerWidth - .5);

        const y =
            (event.clientY /
                window.innerHeight - .5);

        particles.forEach(
            (particle, index) => {

                const strength =
                    (index + 1) * 15;

                particle.style.transform =
                    `translate(
                        ${x * strength}px,
                        ${y * strength}px
                    )`;

            }
        );

    }
);


/* ==========================================================
   SCROLL REVEALS
========================================================== */

const revealElements =
    document.querySelectorAll(
        ".timeline-card, " +
        ".education-node, " +
        ".event, " +
        ".work-item, " +
        ".semester, " +
        ".research-meta div, " +
        ".state"
    );


const revealObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting
                ) {

                    entry.target.classList.add(
                        "visible"
                    );

                }

            });

        },
        {
            threshold: .12
        }
    );


revealElements.forEach(
    element => {

        revealObserver.observe(element);

    }
);


/* ==========================================================
   ACTIVE SECTION
========================================================== */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );


const sectionObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting
                ) {

                    document.body.dataset.section =
                        entry.target.id;

                }

            });

        },
        {
            threshold: .45
        }
    );


sections.forEach(
    section => {

        sectionObserver.observe(section);

    }
);


/* ==========================================================
   SMOOTH HOVER EFFECT
========================================================== */

document
    .querySelectorAll(
        ".education-node, " +
        ".work-item, " +
        ".semester, " +
        ".state"
    )
    .forEach(element => {

        element.addEventListener(
            "mouseenter",
            () => {

                element.style.transition =
                    "transform .4s ease";

                element.style.transform =
                    "translateX(8px)";

            }
        );

        element.addEventListener(
            "mouseleave",
            () => {

                element.style.transform =
                    "translateX(0)";

            }
        );

    });


/* ==========================================================
   CONSOLE
========================================================== */

console.log(
    "%cADDY / FIELD LOG",
    "font-size:20px;font-weight:bold;"
);

console.log(
    "Trajectory loaded."
);

console.log(
    "Next module: THREE.JS / GLB"
);
