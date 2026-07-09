// =====================================
// XPLORIUM ENGINE V1
// Pseudo 3D Space Flight Prototype
// =====================================


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// -----------------------------
// Screen
// -----------------------------

function resize(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize", resize);



// -----------------------------
// Input
// -----------------------------

let keys = {};

window.addEventListener("keydown", e=>{
    keys[e.key.toLowerCase()] = true;
});


window.addEventListener("keyup", e=>{
    keys[e.key.toLowerCase()] = false;
});



// -----------------------------
// Ship
// -----------------------------

let ship = {

    x:0,

    speed:5,

    maxSpeed:40,

    acceleration:0.15,

    steering:8,

    roll:0

};



// -----------------------------
// Camera
// -----------------------------

let camera = {

    z:0

};



// -----------------------------
// Stars
// -----------------------------

let stars=[];


function createStars(){

    stars=[];

    for(let i=0;i<600;i++){

        stars.push({

            x:(Math.random()-0.5)*2000,

            y:(Math.random()-0.5)*2000,

            z:Math.random()*3000+100

        });

    }

}


createStars();



// -----------------------------
// Projection
// 3D -> 2D
// -----------------------------

function project(obj){


    let scale = 500 / obj.z;


    return {

        x:
        canvas.width/2 +
        obj.x * scale,


        y:
        canvas.height/2 +
        obj.y * scale,


        size:
        Math.max(1,scale*3)

    };

}



// -----------------------------
// Update
// -----------------------------

function update(){



// THROTTLE

if(keys["w"] || keys["arrowup"]){

    ship.speed += ship.acceleration;

}


// BRAKE

if(keys["s"] || keys["arrowdown"]){

    ship.speed -= ship.acceleration;

}



ship.speed = Math.max(
    1,
    Math.min(
        ship.speed,
        ship.maxSpeed
    )
);




// STEERING

if(keys["a"] || keys["arrowleft"]){

    ship.x -= ship.steering;

    ship.roll -=0.03;

}



if(keys["d"] || keys["arrowright"]){

    ship.x += ship.steering;

    ship.roll +=0.03;

}


// return ship straight

ship.roll*=0.92;




// Move through space

stars.forEach(star=>{


    star.z -= ship.speed;



    // recycle star

    if(star.z < 10){

        star.z = 3000;

        star.x=(Math.random()-0.5)*2000;

        star.y=(Math.random()-0.5)*2000;

    }


});


}




// -----------------------------
// Draw
// -----------------------------

function draw(){


    // background

    ctx.fillStyle="#02030a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    // Stars


    stars.forEach(star=>{


        let p = project(star);



        ctx.beginPath();


        ctx.fillStyle="white";


        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI*2
        );


        ctx.fill();


    });




    // Ship


    ctx.save();


    ctx.translate(

        canvas.width/2,

        canvas.height-150

    );


    ctx.rotate(ship.roll);



    // glow

    ctx.shadowColor="#00ffff";

    ctx.shadowBlur=25;



    ctx.fillStyle="#00ffff";


    ctx.beginPath();


    ctx.moveTo(0,-45);

    ctx.lineTo(30,35);

    ctx.lineTo(0,20);

    ctx.lineTo(-30,35);


    ctx.closePath();


    ctx.fill();



    // engine


    ctx.shadowBlur=0;

    ctx.fillStyle="orange";


    ctx.beginPath();


    ctx.moveTo(-10,35);

    ctx.lineTo(0,80);

    ctx.lineTo(10,35);


    ctx.fill();



    ctx.restore();




    // HUD


    ctx.fillStyle="white";

    ctx.font="22px Arial";


    ctx.fillText(

        "SPEED : "+ship.speed.toFixed(1),

        30,

        40

    );


}




// -----------------------------
// Game Loop
// -----------------------------


function loop(){

    update();

    draw();

    requestAnimationFrame(loop);

}


loop();
