import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// --- Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(135/255, 206/255, 235/255);

// --- Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.01, 1000);

// --- Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// --- Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(500, 500, 500);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// --- Axes helper
scene.add(new THREE.AxesHelper(5));

// --- Loader
const loader = new GLTFLoader();
let droneObject, droneMixer;

// --- Clock
const clock = new THREE.Clock();

// --- Drone parameters
const maxSpeed = 0.2;
const turnSpeed = 0.03;

// --- Mobile input
let joystickX = 0;
let joystickY = 0;
let heightInput = 0;

// --- NippleJS joystick
const joystick = nipplejs.create({
    zone: document.getElementById('joystick'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'green',
    size: 150
});
joystick.on('move', (evt, data) => {
    joystickX = data.vector.x; // -1 → 1
    joystickY = data.vector.y; // -1 → 1
});
joystick.on('end', () => { joystickX = 0; joystickY = 0; });

// --- Slider
const heightSlider = document.getElementById('heightSlider');
heightSlider.addEventListener('input', e => { heightInput = parseFloat(e.target.value); });

// --- Load drone
loader.load('assets/models/drone/scene.gltf', gltfDrone => {
    droneObject = gltfDrone.scene;
    droneObject.scale.set(5, 5, 5);

    // Center drone
    const box = new THREE.Box3().setFromObject(droneObject);
    const center = box.getCenter(new THREE.Vector3());
    droneObject.position.sub(center);
    droneObject.position.y += 0.1;

    scene.add(droneObject);

    // Hover animatie
    if (gltfDrone.animations && gltfDrone.animations.length > 0) {
        droneMixer = new THREE.AnimationMixer(droneObject);
        const hoverClip = gltfDrone.animations.find(c => c.name.toLowerCase() === 'hover');
        if (hoverClip) droneMixer.clipAction(hoverClip).play();
    }

    // Camera init
    camera.position.set(droneObject.position.x, droneObject.position.y + 5, droneObject.position.z + 10);
    camera.lookAt(droneObject.position);
});

// --- Update drone
function updateDrone() {
    if (!droneObject) return;
    droneObject.rotation.order = "YXZ";

    // Pitch (voor/achter)
    const maxPitch = 0.3;
    const targetPitch = -joystickY * maxPitch;
    droneObject.rotation.x += (targetPitch - droneObject.rotation.x) * 0.1;

    // Roll (links/rechts)
    const maxRoll = 0.3;
    const targetRoll = -joystickX * maxRoll;
    droneObject.rotation.z += (targetRoll - droneObject.rotation.z) * 0.1;

    // Yaw draaien
    droneObject.rotation.y += -joystickX * turnSpeed;

    // Hoogte
    droneObject.position.y += heightInput * maxSpeed;

    // Vooruit/achteruit
    const forward = new THREE.Vector3(
        -Math.sin(droneObject.rotation.y) * Math.cos(droneObject.rotation.x),
        0,
        -Math.cos(droneObject.rotation.y) * Math.cos(droneObject.rotation.x)
    );
    const forwardSpeed = -joystickY * maxSpeed;
    droneObject.position.add(forward.multiplyScalar(forwardSpeed));

    // Camera volgen
    const offset = new THREE.Vector3(0, 5, 10);
    const rotatedOffset = offset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), droneObject.rotation.y);
    camera.position.copy(droneObject.position.clone().add(rotatedOffset));
    camera.lookAt(droneObject.position);
}

// --- Animate
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (droneMixer) droneMixer.update(delta);
    updateDrone();
    renderer.render(scene, camera);
}
animate();

// --- Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});