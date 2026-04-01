import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.module.min.js";
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
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

let square = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
scene.add(square);


function animate() {
    requestAnimationFrame(animate);

    // kleine rotatie zodat je ziet dat het 3D is
    square.rotation.y += 0.01;
    square.rotation.x += 0.01;
    square.rotation.z += 0.01;
    // square.position.x = MOUSE.position.x;

    renderer.render(scene, camera);
}

animate();