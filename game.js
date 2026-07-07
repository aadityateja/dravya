// =============================
// XPLORIUM
// Basic Space Flight Prototype
// =============================


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// Screen size

function resize(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize",resize);



// =============================
// Keyboard Controls
// =============================

let keys = {};

window.addEventListener("keydown", function(e){

    keys[e.key] = true;

});


window.addEventListener("keyup", function(e){

    keys[e.key] = false;

});



// =============================
// Spaceship
// =============================

let ship = {

    x: canvas.width/2,
    y: canvas.height-150,

    speed:6

};



// =============================
// Stars
// =============================

let stars=[];


for(let i=0;i<200;i++){

    stars.push({

        x:Math.random()*canvas.width,

        y:Math.random()*canvas.height,

        speed:Math.random()*4+1

    });

}



// =============================
// Update
// =============================

function update(){


    // Ship movement

    if(keys["ArrowLeft"]){

        ship.x -= ship.speed;

    }


    if(keys["ArrowRight"]){

        ship.x += ship.speed;

    }


    if(keys["ArrowUp"]){

        ship.y -= ship.speed;

    }


    if(keys["ArrowDown"]){

        ship.y += ship.speed;

    }



    // Keep ship inside screen

    ship.x=Math.max(
        20,
        Math.min(canvas.width-20,ship.x)
    );


    ship.y=Math.max(
        20,
        Math.min(canvas.height-20,ship.y)
    );



    // Star movement

    stars.forEach(function(star){


        star.y += star.speed;



        if(star.y > canvas.height){

            star.y=0;

            star.x=Math.random()*canvas.width;

        }


    });



}



// =============================
// Draw
// =============================

function draw(){


    // Background

    ctx.fillStyle="black";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    // Stars

    ctx.fillStyle="white";


    stars.forEach(function(star){

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            2,
            0,
            Math.PI*2
        );

        ctx.fill();

    });



    // Ship

    ctx.save();


    ctx.translate(
        ship.x,
        ship.y
    );



    // glow

    ctx.shadowColor="#00ffff";

    ctx.shadowBlur=20;



    ctx.fillStyle="#00ffff";


    ctx.beginPath();


    ctx.moveTo(0,-40);

    ctx.lineTo(25,30);

    ctx.lineTo(0,15);

    ctx.lineTo(-25,30);


    ctx.closePath();


    ctx.fill();



    ctx.restore();



}



// =============================
// Game Loop
// =============================


function gameLoop(){


    update();

    draw();


    requestAnimationFrame(gameLoop);


}


gameLoop();
