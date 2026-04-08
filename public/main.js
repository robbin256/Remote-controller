// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js";
// import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
// import { Int8BufferAttribute } from "three";
// import { MOUSE } from "three";
// import { GLTFLoader } from "../node_modules/three/build/three.module.js";
// import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
// import { OBJLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/OBJLoader.js';
// Scene
// import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';


// import * as THREE from 'https://unpkg.com/three@0.180.0/build/three.module.js';
// import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

// import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

// import * as THREE from '../node_modules/three'; // ✅ relatieve pad naar de Three.js module


//week 3
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';




const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
let mousex = window.innerWidth / 2;
let mousey = window.innerHeight / 2;


let object;

let controls;

let objToRender = 'car';

const loader = new GLTFLoader();

loader.load(
    `assets/models/${objToRender}/scene.gltf`,

    function (gltf) {
        object = gltf.scene;

        object.scale.set(10, 10, 10);

        // ✅ HIER moet je Box3 code staan
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());

        object.position.sub(center);

        scene.add(object);
    },

    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },

    function (error) {
        console.error('An error happened', error);
    }
);


// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('container3D').appendChild(renderer.domElement);

camera.position.z = 10;;

const toplight = new THREE.DirectionalLight(0xffffff, 1);
toplight.position.set(500, 500, 500);
toplight.castShadow = true;
scene.add(toplight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === 'dino' ? 5 : 0.5);
scene.add(ambientLight);

controls = new OrbitControls(camera, renderer.domElement);


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});




camera.lookAt(0, 0, 0);


animate();

// document.body.appendChild(renderer.domElement);

// const loader = new GLTFLoader();

// loader.load('assets/models/free_1975_porsche_911_930_turbo.glb', (gltf) => {
//     const model = gltf.scene;

//     model.scale.set(1, 1, 1); // grootte aanpassen indien nodig
//     model.position.set(0, 0, 0);

//     scene.add(model);
// });

// const loader = new OBJLoader();
// loader.load('assets/models/car.glb', (obj) => init(obj));
// Render loop

// let square = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: 0x00ff00 })
// );
// scene.add(square);


// function animate() {
//     requestAnimationFrame(animate);

//     // kleine rotatie zodat je ziet dat het 3D is
//     square.rotation.y += 0.01;
//     square.rotation.x += 0.01;
//     square.rotation.z += 0.01;
//     // square.position.x = MOUSE.position.x;

//     renderer.render(scene, camera);
// }

// animate();