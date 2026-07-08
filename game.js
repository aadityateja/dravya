// =====================================
// XPLORIUM
// Pseudo 3D Space Flight Engine
// =====================================


const canvas=document.getElementById("game");

const ctx=canvas.getContext("2d");



function resize(){

canvas.width=window.innerWidth;

canvas.height=window.innerHeight;

}

resize();

window.addEventListener("resize",resize);




// =====================================
// INPUT
// =====================================


let keys={};


window.addEventListener("keydown",e=>{

keys[e.key]=true;

});


window.addEventListener("keyup",e=>{

keys[e.key]=false;

});




// =====================================
// PLAYER
// =====================================


let ship = {

    x: 0,
    y: 0,

    speed: 2,              // Start with a little forward motion
    maxSpeed: 20,
    acceleration: 0.15,

    roll: 0,
    floatTime: 0,

    floatX: 0,
    floatY: 0

};



// =====================================
// STAR FIELD
// =====================================


let stars=[];


function createStars(){

stars=[];


for(let i=0;i<500;i++){

stars.push({

x:(Math.random()-0.5)*2000,

y:(Math.random()-0.5)*2000,

z:Math.random()*2000+50

});


}

}


createStars();





// =====================================
// 3D PROJECTION
// =====================================


function project(object){



let scale=500/object.z;



return{

x:
canvas.width/2
+
object.x*scale,


y:
canvas.height/2
+
object.y*scale,


size:
scale*3

};


}

let camera = {

    x:0,
    y:0

};



// =====================================
// UPDATE
// =====================================


function update(){



// accelerate forward

if(keys["ArrowUp"] || keys["w"]){

ship.speed+=ship.acceleration;

}
// Floating animation

ship.floatTime += 0.05;

ship.floatY = Math.sin(ship.floatTime) * 4;

ship.floatX = Math.cos(ship.floatTime * 0.7) * 2;

// brake

if(keys["ArrowDown"] || keys["s"]){

ship.speed-=ship.acceleration;

}



ship.speed=Math.max(

0,

Math.min(ship.maxSpeed,ship.speed)

);



if(keys["ArrowLeft"] || keys["a"]){

    ship.x -= 8;

    ship.roll -= 0.03;

}

if(keys["ArrowRight"] || keys["d"]){

    ship.x += 8;

    ship.roll += 0.03;

}

camera.x += (ship.x * 0.05 - camera.x) * 0.05;


// move universe toward us


stars.forEach(star=>{


star.z-=ship.speed;



// passed camera

if(star.z<1){

star.z=2000;

star.x=(Math.random()-0.5)*2000;

star.y=(Math.random()-0.5)*2000;

}


});



}





// =====================================
// DRAW
// =====================================


function draw(){



ctx.fillStyle="black";

ctx.fillRect(

0,

0,

canvas.width,

canvas.height

);




// draw stars


stars.forEach(star=>{


let p=project(star);



ctx.beginPath();


ctx.fillStyle="white";


let length = ship.speed * 2;

ctx.strokeStyle="white";

ctx.lineWidth=p.size;

ctx.beginPath();

ctx.moveTo(

p.x,

p.y

);

ctx.lineTo(

p.x,

p.y + length

);

ctx.stroke();


});




ctx.save();

ctx.translate(

canvas.width/2 + ship.floatX - camera.x,

canvas.height-170 + ship.floatY

);

ctx.rotate(ship.roll);

ctx.shadowColor="#00ffff";
ctx.shadowBlur=25;


// ENGINE FLAME

let flame = 25 + ship.speed * 2 + Math.random()*6;

ctx.fillStyle="orange";

ctx.beginPath();

ctx.moveTo(-10,28);
ctx.lineTo(0,flame);
ctx.lineTo(10,28);

ctx.closePath();

ctx.fill();


// SHIP BODY

ctx.fillStyle="#00ffff";

ctx.beginPath();

ctx.moveTo(0,-40);

ctx.lineTo(25,35);

ctx.lineTo(0,18);

ctx.lineTo(-25,35);

ctx.closePath();

ctx.fill();


// Cockpit

ctx.fillStyle="white";

ctx.beginPath();

ctx.arc(0,-8,6,0,Math.PI*2);

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






// =====================================
// LOOP
// =====================================


function loop(){
let camera = {

    x:0,
    y:0

};

update();

draw();


requestAnimationFrame(loop);


}


loop();
