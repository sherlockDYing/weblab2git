const socket = io('ec2-34-229-201-62.compute-1.amazonaws.com:8080');
var scene,camera,renderer;
var fpc;
var clock = new THREE.Clock();
let playerMap = new Map();
init();
render();

function init() {
     scene = new THREE.Scene();

    const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    const VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.3, FAR = 1000;
     camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, 20, 50);
    camera.lookAt(new THREE.Vector3(0, 15, 0));
    scene.add(camera);

     renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);

    // soft white light
    let light = new THREE.AmbientLight(0xaaaaaa);
    scene.add(light);

    const skyBoxGeometry = new THREE.BoxGeometry(500,500,500);
    let textureLoader = new THREE.TextureLoader();

    let skyBoxMaterial = [
        new THREE.MeshBasicMaterial({map: textureLoader.load('./assets/textures/skybox/px.jpg'), side: THREE.BackSide}), // right
        new THREE.MeshBasicMaterial({map: textureLoader.load('./assets/textures/skybox/nx.jpg'), side: THREE.BackSide}), // left
        new THREE.MeshBasicMaterial({map: textureLoader.load('./assets/textures/skybox/py.jpg'), side: THREE.BackSide}), // top
        new THREE.MeshBasicMaterial({map: textureLoader.load('./assets/textures/skybox/ny.jpg'), side: THREE.BackSide}), // bottom
        new THREE.MeshBasicMaterial({map: textureLoader.load('./assets/textures/skybox/pz.jpg'), side: THREE.BackSide}), // back
        new THREE.MeshBasicMaterial({map: textureLoader.load('./assets/textures/skybox/nz.jpg'), side: THREE.BackSide})  // front
    ];

    // 创建天空盒子并添加到场景
    let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    textureLoader.load("./assets/textures/floor/FloorsCheckerboard_S_Diffuse.jpg", function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        const floorMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const floorGeometry = new THREE.PlaneGeometry(500, 500, 5, 5);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = 0;
        floor.rotation.x = Math.PI / 2;
        scene.add(floor);
    });

    window.addEventListener("resize",onWindowResize);

     fpc = new FirstPersonControls(camera);
    fpc.connect();
    scene.add(fpc.yawObject);
}

function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

socket.on('player', data => {
    if (playerMap.has(data.socketid)) {
        let model = playerMap.get(data.socketid);
        model.position.set(data.position.x, data.position.y, data.position.z);
        model.rotation.set(data.rotation._x, data.rotation._y + Math.PI / 2, data.rotation._z);
    } else {
        const loader = new THREE.GLTFLoader();
        loader.load("./assets/models/duck.glb", (mesh) => {
            mesh.scene.scale.set(10, 10, 10);
            scene.add(mesh.scene);
            playerMap.set(data.socketid, mesh.scene);
        });
    }
});

socket.on('offline', data => {
    if (playerMap.has(data.socketid)) {
        scene.remove(playerMap.get(data.socketid));
        playerMap.delete(data.socketid)
    }
});

function render(){
    fpc.update(clock.getDelta());
    socket.emit('player',{position: fpc.yawObject.position,rotation:fpc.yawObject.rotation});
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}





