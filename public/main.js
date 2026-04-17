import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// 🌐 WebSocket
const ws = new WebSocket('ws://192.168.2.33:8080');

// 🎮 Players systeem
let players = {};
const MAX_PLAYERS = 4;

// 🌍 Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(135 / 255, 206 / 255, 235 / 255);

// 🎥 Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// 💡 Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(500, 500, 500);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.AxesHelper(5));

// 📦 Loader
const loader = new GLTFLoader();

// 🚁 Drone settings
const maxSpeed = 0.5;
const turnSpeed = 0.03;

// ⏱ Clock
const clock = new THREE.Clock();

// 🗺️ Map laden
loader.load('assets/models/map/scene.gltf', (gltf) => {
    const map = gltf.scene;
    map.scale.set(0.1, 0.1, 0.1);
    scene.add(map);

    // Maak 4 players
});

// 👤 Player maken
function createPlayer(id) {
    loader.load('assets/models/drone/scene.gltf', (gltfDrone) => {
        const drone = gltfDrone.scene;
        drone.scale.set(5, 5, 5);

        // beetje spreiden
        drone.position.set(id * 2, 1, 0);

        scene.add(drone);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01,
            1000
        );

        players[id] = {
            drone,
            camera,
            input: { throttle: 0, pitch: 0, roll: 0, yaw: 0 }
        };

        console.log("✅ Player created:", id);

        function removePlayer(id) {
            const player = players[id];
            if (!player) return;

            scene.remove(player.drone);

            delete players[id];

            console.log("🗑️ Player removed:", id);
        }
    });
}

// 📡 Ontvang data van server
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // 🎮 nieuwe speler
    if (data.type === "playerJoined") {
        console.log("🎮 Player joined:", data.playerId);
        createPlayer(data.playerId);
        return;
    }

    // ❌ speler weg
    if (data.type === "playerLeft") {
        console.log("❌ Player left:", data.playerId);
        removePlayer(data.playerId);
        return;
    }

    // 📡 input
    const id = data.playerId;
    if (!players[id]) return;

    players[id].input = {
        throttle: data.throttle ?? 0,
        pitch: data.pitch ?? 0,
        roll: -(data.roll ?? 0),
        yaw: -(data.roll ?? 0)
    };
};

// 🚁 Drone update
function updateDrone(player) {
    const { drone, camera, input } = player;
    if (!drone) return;

    const { throttle, pitch, roll, yaw } = input;

    drone.rotation.order = "YXZ";

    // Pitch
    const targetPitch = pitch * 0.3;
    drone.rotation.x += (targetPitch - drone.rotation.x) * 0.1;

    // Roll
    const targetRoll = roll * 0.3;
    drone.rotation.z += (targetRoll - drone.rotation.z) * 0.1;

    // Yaw
    drone.rotation.y += yaw * turnSpeed;

    // Hoogte
    drone.position.y += throttle * maxSpeed;

    // Vooruit
    const speed = -pitch * maxSpeed;

    const forward = new THREE.Vector3(
        -Math.sin(drone.rotation.y),
        0,
        -Math.cos(drone.rotation.y)
    );

    drone.position.add(forward.multiplyScalar(speed));

    // Camera volgt
    const offset = new THREE.Vector3(0, 5, 10);
    const rotatedOffset = offset.clone();
    rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), drone.rotation.y);

    camera.position.copy(drone.position.clone().add(rotatedOffset));
    camera.lookAt(drone.position);
}

// 🖥️ Split screen render
function renderSplitScreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const ids = Object.keys(players);
    const count = ids.length;

    renderer.setScissorTest(true);

    ids.forEach((id, index) => {
        const player = players[id];
        if (!player) return;

        let x = 0, y = 0, w = width, h = height;

        if (count === 1) {
            // fullscreen
        }

        else if (count === 2) {
            w = width / 2;
            x = index * w;
        }

        else {
            // 3 of 4 spelers
            w = width / 2;
            h = height / 2;
            x = (index % 2) * w;
            y = index < 2 ? h : 0;
        }

        renderer.setViewport(x, y, w, h);
        renderer.setScissor(x, y, w, h);

        player.camera.aspect = w / h;
        player.camera.updateProjectionMatrix();

        renderer.render(scene, player.camera);
    });
}

// 🔄 Loop
function animate() {
    requestAnimationFrame(animate);

    Object.values(players).forEach(player => {
        updateDrone(player);
    });

    renderSplitScreen();
}

// 📐 Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 🔌 WebSocket connect
ws.onopen = () => {
    console.log("🟢 Connected");

    ws.send(JSON.stringify({
        type: "main"
    }));
};

ws.onerror = (err) => {
    console.log("❌ WS error:", err);
};

ws.onclose = () => {
    console.log("🔴 Disconnected");
};

animate();