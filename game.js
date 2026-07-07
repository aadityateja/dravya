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


let ship={

x:0,

y:0,

speed:0,

maxSpeed:20,

acceleration:0.15,

};


let camera={

z:0

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





// =====================================
// UPDATE
// =====================================


function update(){



// accelerate forward

if(keys["ArrowUp"] || keys["w"]){

ship.speed+=ship.acceleration;

}


// brake

if(keys["ArrowDown"] || keys["s"]){

ship.speed-=ship.acceleration;

}



ship.speed=Math.max(

0,

Math.min(ship.maxSpeed,ship.speed)

);




// left right movement


if(keys["ArrowLeft"] || keys["a"]){

ship.x-=8;

}



if(keys["ArrowRight"] || keys["d"]){

ship.x+=8;

}





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

canvas.width/2,

canvas.height-120

);



ctx.shadowColor="#00ffff";

ctx.shadowBlur=30;


ctx.fillStyle="#00ffff";



ctx.beginPath();


ctx.moveTo(0,-40);

ctx.lineTo(30,40);

ctx.lineTo(0,20);

ctx.lineTo(-30,40);


ctx.closePath();


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


update();

draw();


requestAnimationFrame(loop);


}


loop();
