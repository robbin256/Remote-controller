import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(135 / 255, 206 / 255, 235 / 255);
// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// Lights
const toplight = new THREE.DirectionalLight(0xffffff, 1);
toplight.position.set(500, 500, 500);
scene.add(toplight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Axes helper
scene.add(new THREE.AxesHelper(5));

const loader = new GLTFLoader();
let mapObject, droneObject;

// Drone parameters
let speed = 0;
const maxSpeed = 0.5;
const turnSpeed = 0.03;
let pitch = 0; // rotatie naar boven/beneden
let droneMixer; // globale mixer
let clock = new THREE.Clock();

// Keyboard input
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Mouse input
let mouseY = window.innerHeight / 2;
window.addEventListener('mousemove', (e) => {
    mouseY = e.clientY;
});

// Load map
loader.load('assets/models/map/scene.gltf', (gltf) => {
    mapObject = gltf.scene;
    mapObject.scale.set(0.1, 0.1, 0.1);
    mapObject.position.set(0, 0, 0);
    scene.add(mapObject);

    // Load drone
    loader.load('assets/models/drone/scene.gltf', (gltfDrone) => {
        droneObject = gltfDrone.scene;
        droneObject.scale.set(5, 5, 5);

        // Center drone
        const box = new THREE.Box3().setFromObject(droneObject);
        const center = box.getCenter(new THREE.Vector3());
        droneObject.position.sub(center);
        droneObject.position.y += 0.1;

        scene.add(droneObject);

        // Als het model animaties heeft
        if (gltfDrone.animations && gltfDrone.animations.length > 0) {
            droneMixer = new THREE.AnimationMixer(droneObject);

            const hoverClip = gltfDrone.animations.find(
                clip => clip.name.toLowerCase() === 'hover'
            );

            if (hoverClip) {
                droneMixer.clipAction(hoverClip).play();
            } else {
                console.warn("Hover animatie niet gevonden");
                console.log(gltfDrone.animations); // debug
            }
        }



        // Camera init
        camera.position.set(droneObject.position.x, droneObject.position.y + 102, droneObject.position.z + 50);
        camera.lookAt(droneObject.position);
    });
});

// Update drone beweging
function updateDrone() {
    if (!droneObject) return;
    droneObject.rotation.order = "YXZ";

    // --- Pitch (voor/achter kantelen via W/S)
    let targetPitch = 0;
    if (keys['w']) targetPitch = -0.3; // naar voren
    else if (keys['s']) targetPitch = 0.3; // naar achter
    droneObject.rotation.x += (targetPitch - droneObject.rotation.x) * 0.1;

    // --- Roll (kantelen bij A/D)
    let targetRoll = 0;
    if (keys['a']) targetRoll = 0.3;   // tilt naar links tijdens bocht
    else if (keys['d']) targetRoll = -0.3; // tilt naar rechts tijdens bocht
    droneObject.rotation.z += (targetRoll - droneObject.rotation.z) * 0.1;

    // --- Yaw (draai links/rechts via A/D)
    if (keys['a']) droneObject.rotation.y += turnSpeed;
    if (keys['d']) droneObject.rotation.y -= turnSpeed;

    // --- Hoogte (Y-as) via pijlen ↑ / ↓
    if (keys['arrowup']) droneObject.position.y += maxSpeed;
    if (keys['arrowdown']) droneObject.position.y -= maxSpeed;

    // --- Vooruit / achteruit beweging (relatief aan yaw)
    let speed = 0;
    if (keys['w']) speed = maxSpeed;
    else if (keys['s']) speed = -maxSpeed;

    const forward = new THREE.Vector3(
        -Math.sin(droneObject.rotation.y) * Math.cos(droneObject.rotation.x),
        0, // verticale beweging via pijlen
        -Math.cos(droneObject.rotation.y) * Math.cos(droneObject.rotation.x)
    );
    droneObject.position.add(forward.multiplyScalar(speed));

    // --- Camera volgt drone
    const offset = new THREE.Vector3(0, 5, 10);
    const rotatedOffset = offset.clone();
    rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), droneObject.rotation.y);
    camera.position.copy(droneObject.position.clone().add(rotatedOffset));
    camera.lookAt(droneObject.position);
}

// Render loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (droneMixer) droneMixer.update(delta); // ⚡ update animaties

    updateDrone();
    renderer.render(scene, camera);
}

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();