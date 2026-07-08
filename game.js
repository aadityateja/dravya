// =====================================
// XPLORIUM v0.1
// Pseudo 3D Space Flight
// =====================================


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


function resize(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize",resize);



// ===============================
// INPUT
// ===============================


let keys={};


window.addEventListener("keydown",e=>{
    keys[e.key]=true;
});


window.addEventListener("keyup",e=>{
    keys[e.key]=false;
});



// ===============================
// PLAYER SHIP
// ===============================


let ship={

    x:0,

    speed:8,

    maxSpeed:40,

    acceleration:0.2,

    width:40,

    alive:true

};



// ===============================
// OBJECTS
// ===============================


let objects=[];



function createObject(){


    objects.push({

        x:(Math.random()-0.5)*800,

        y:(Math.random()-0.5)*500,

        z:1500,

        size:20+Math.random()*40

    });


}



// ===============================
// CREATE INITIAL SPACE
// ===============================


for(let i=0;i<20;i++){

    createObject();

}



// ===============================
// PROJECT 3D TO SCREEN
// ===============================


function project(obj){


    let scale=600/obj.z;


    return{

        x:canvas.width/2 + obj.x*scale,

        y:canvas.height/2 + obj.y*scale,

        size:obj.size*scale

    };


}



// ===============================
// UPDATE
// ===============================


function update(){


if(!ship.alive)
    return;



// CONSTANT FORWARD MOTION

ship.speed += 0.02;


// ACCELERATION

if(keys["ArrowUp"] || keys["w"]){

    ship.speed += ship.acceleration;

}



// LIMIT SPEED

ship.speed=Math.min(
    ship.speed,
    ship.maxSpeed
);



// STEERING

if(keys["ArrowLeft"] || keys["a"]){

    ship.x-=8;

}


if(keys["ArrowRight"] || keys["d"]){

    ship.x+=8;

}



// move space toward player


objects.forEach(obj=>{


    obj.z-=ship.speed;



    // collision zone

    if(obj.z<30){


        let distance=Math.abs(obj.x-ship.x);


        if(distance < obj.size){

            ship.alive=false;

        }

    }



});



// remove passed objects

objects=objects.filter(o=>o.z>5);



// spawn new asteroid

if(objects.length<25){

    createObject();

}



}




// ===============================
// DRAW
// ===============================


function draw(){


ctx.fillStyle="black";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);



// draw asteroids


objects.forEach(obj=>{


let p=project(obj);



ctx.beginPath();

ctx.fillStyle="#888";


ctx.arc(

p.x,

p.y,

p.size,

0,

Math.PI*2

);


ctx.fill();



});



// draw ship


ctx.save();


ctx.translate(

canvas.width/2 + ship.x,

canvas.height-150

);



ctx.shadowColor="#00ffff";

ctx.shadowBlur=30;



ctx.fillStyle="#00ffff";


ctx.beginPath();


ctx.moveTo(0,-50);

ctx.lineTo(30,40);

ctx.lineTo(0,20);

ctx.lineTo(-30,40);


ctx.closePath();

ctx.fill();



// engine

ctx.fillStyle="orange";


ctx.beginPath();

ctx.moveTo(-10,40);

ctx.lineTo(0,80);

ctx.lineTo(10,40);

ctx.fill();



ctx.restore();




// HUD


ctx.fillStyle="white";

ctx.font="24px Arial";


ctx.fillText(

"SPEED : "+Math.floor(ship.speed),

30,

40

);



// GAME OVER


if(!ship.alive){


ctx.fillStyle="red";

ctx.font="60px Arial";


ctx.fillText(

"SHIP CRASHED",

canvas.width/2-200,

canvas.height/2

);


ctx.font="25px Arial";

ctx.fillStyle="white";


ctx.fillText(

"Press R to restart",

canvas.width/2-100,

canvas.height/2+50

);


}



}



// ===============================
// RESTART
// ===============================


window.addEventListener("keydown",e=>{


if(e.key==="r" && !ship.alive){


ship.alive=true;

ship.speed=8;

ship.x=0;

objects=[];


for(let i=0;i<20;i++)
createObject();


}



});




// ===============================
// GAME LOOP
// ===============================


function loop(){


update();

draw();


requestAnimationFrame(loop);


}


loop();
