import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

scene.fog = new THREE.Fog(0x000000, 100, 800);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 40, 180);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;





// =========================
// LIGHTS
// =========================

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const pointLight = new THREE.PointLight(0xffffff, 3);
pointLight.position.set(100,100,100);

scene.add(pointLight);




// =========================
// STARS
// =========================

const starGeo = new THREE.BufferGeometry();

const starCount = 10000;

const starPositions = [];

for(let i=0;i<starCount;i++){

    starPositions.push(
        (Math.random()-0.5)*3000,
        (Math.random()-0.5)*3000,
        (Math.random()-0.5)*3000
    );

}

starGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions,3)
);

const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
        size:2,
        color:'white'
    })
);

scene.add(stars);




// =========================
// EARTH
// =========================

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(25,64,64),
    new THREE.MeshStandardMaterial({
        color:0x2244ff,
        emissive:0x001144
    })
);

earth.position.y = -80;

scene.add(earth);




// =========================
// DETECTOR
// =========================

const detectorGroup = new THREE.Group();

scene.add(detectorGroup);

function detectorLayer(radius,length,color){

    const mesh = new THREE.Mesh(

        new THREE.CylinderGeometry(
            radius,
            radius,
            length,
            64,
            1,
            true
        ),

        new THREE.MeshBasicMaterial({
            color,
            transparent:true,
            opacity:0.15,
            wireframe:true
        })

    );

    mesh.rotation.z = Math.PI/2;

    detectorGroup.add(mesh);
}

detectorLayer(8,120,0xffffff);
detectorLayer(16,120,0x00ffff);
detectorLayer(24,120,0xff00ff);
detectorLayer(34,120,0xffff00);




// =========================
// ENDCAPS
// =========================

const endcapGeo =
new THREE.CylinderGeometry(35,35,2,64);

const endcapMat =
new THREE.MeshBasicMaterial({
    color:0xff8800,
    wireframe:true
});

const leftEndcap =
new THREE.Mesh(endcapGeo,endcapMat);

leftEndcap.rotation.z=Math.PI/2;
leftEndcap.position.x=-60;

detectorGroup.add(leftEndcap);

const rightEndcap=
new THREE.Mesh(endcapGeo,endcapMat);

rightEndcap.rotation.z=Math.PI/2;
rightEndcap.position.x=60;

detectorGroup.add(rightEndcap);




// =========================
// BEAMS
// =========================

const beamMat1 =
new THREE.MeshBasicMaterial({
    color:0x00ffff
});

const beamMat2 =
new THREE.MeshBasicMaterial({
    color:0xff6600
});

const electronBeam =
new THREE.Mesh(
new THREE.CylinderGeometry(0.7,0.7,500,16),
beamMat1
);

electronBeam.rotation.z=Math.PI/2;
scene.add(electronBeam);

const ionBeam =
new THREE.Mesh(
new THREE.CylinderGeometry(0.7,0.7,500,16),
beamMat2
);

ionBeam.rotation.z=Math.PI/2;
scene.add(ionBeam);




// =========================
// COLLISION CORE
// =========================

const collision =
new THREE.Mesh(

new THREE.SphereGeometry(3,32,32),

new THREE.MeshBasicMaterial({
    color:0xffffff
})

);

scene.add(collision);




// =========================
// PARTICLE BURST
// =========================

const particles = [];

for(let i=0;i<300;i++){

    const p =
    new THREE.Mesh(

        new THREE.SphereGeometry(0.3),

        new THREE.MeshBasicMaterial({
            color:Math.random()>0.5
            ? 0x00ffff
            : 0xff00ff
        })

    );

    p.userData.velocity =
    new THREE.Vector3(
        (Math.random()-0.5)*2,
        (Math.random()-0.5)*2,
        (Math.random()-0.5)*2
    );

    scene.add(p);

    particles.push(p);
}





// =========================
// CAMERA FLY
// =========================

document
.getElementById("flyBtn")
.onclick=()=>{

    camera.position.set(
        0,
        10,
        40
    );

};




// =========================
// ANIMATION
// =========================

const clock = new THREE.Clock();

function animate(){

requestAnimationFrame(animate);

const t = clock.getElapsedTime();

earth.rotation.y += 0.002;

collision.scale.setScalar(
    1 + Math.sin(t*4)*0.3
);

for(const p of particles){

    p.position.add(
        p.userData.velocity.clone()
        .multiplyScalar(0.02)
    );

    if(p.position.length()>120){

        p.position.set(0,0,0);
    }
}

controls.update();

renderer.render(scene,camera);

}

animate();

window.addEventListener(
'resize',
()=>{

camera.aspect=
window.innerWidth/
window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(
window.innerWidth,
window.innerHeight
);

}
);
