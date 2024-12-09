// Navigation
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    // Initialize the correct Three.js simulation
    if (screenId === 'simulation1') initSimulation1();
    if (screenId === 'simulation2') initSimulation2();
    if (screenId === 'simulation3') initSimulation3();
    if (screenId === 'simulation4') initSimulation4();
    if (screenId === 'simulation5') initSimulation5();
}

// Simulation 1: Recognize Letters & Numbers
function initSimulation1() {
    const container = document.getElementById('three-container-1');
    container.innerHTML = ""; // Clear previous contents

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    const items = ["A", "B", "C", "D", "E"];
    const materials = [
        new THREE.MeshPhongMaterial({ color: 0xff5733 }),
        new THREE.MeshPhongMaterial({ color: 0x33b5e5 }),
        new THREE.MeshPhongMaterial({ color: 0x8e44ad }),
        new THREE.MeshPhongMaterial({ color: 0xFFC107 }),
        new THREE.MeshPhongMaterial({ color: 0x00c853 }),
    ];

    const targetPositions = items.map((_, i) => i * 2 - 5);
    const objects = [];

    const tryAgainAudio = new Audio("try-again.mp3");
    const congratsAudio = new Audio("congratulations.mp3");

    items.forEach((text, i) => {
        const geometry = new THREE.TextGeometry(text, {
            font: new THREE.FontLoader().parse({ /* Add Font JSON */ }),
            size: 1,
            height: 0.2,
        });

        const mesh = new THREE.Mesh(geometry, materials[i % materials.length]);
        mesh.position.set(Math.random() * 10 - 5, Math.random() * 5 - 2.5, 0);
        mesh.userData = { target: targetPositions[i] };
        scene.add(mesh);
        objects.push(mesh);

        mesh.userData.draggable = true;
    });

    camera.position.z = 10;

    let dragging = null;

    function onMouseDown(event) {
        const mouse = new THREE.Vector2(
            (event.clientX / container.offsetWidth) * 2 - 1,
            -(event.clientY / container.offsetHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            dragging = intersects[0].object;
        }
    }

    function onMouseMove(event) {
        if (!dragging) return;
        const mouse = new THREE.Vector2(
            (event.clientX / container.offsetWidth) * 2 - 1,
            -(event.clientY / container.offsetHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        dragging.position.set(
            raycaster.ray.origin.x,
            raycaster.ray.origin.y,
            0
        );
    }

    function onMouseUp() {
        if (!dragging) return;

        const target = dragging.userData.target;
        if (Math.abs(dragging.position.x - target) < 0.5) {
            dragging.position.x = target;
            dragging.material.color.set(0x00ff00);
            congratsAudio.play();
        } else {
            dragging.material.color.set(0xff0000);
            tryAgainAudio.play();
        }
        dragging = null;
    }

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}
