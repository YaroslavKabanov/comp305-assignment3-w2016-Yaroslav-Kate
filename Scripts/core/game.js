/// <reference path="_reference.ts"/>
// MAIN GAME FILE
// THREEJS Aliases
var Scene = Physijs.Scene;
var Renderer = THREE.WebGLRenderer;
var PerspectiveCamera = THREE.PerspectiveCamera;
var BoxGeometry = THREE.BoxGeometry;
var CubeGeometry = THREE.CubeGeometry;
var PlaneGeometry = THREE.PlaneGeometry;
var SphereGeometry = THREE.SphereGeometry;
var Geometry = THREE.Geometry;
var AxisHelper = THREE.AxisHelper;
var LambertMaterial = THREE.MeshLambertMaterial;
var MeshBasicMaterial = THREE.MeshBasicMaterial;
var Material = THREE.Material;
var Mesh = THREE.Mesh;
var Object3D = THREE.Object3D;
var SpotLight = THREE.SpotLight;
var PointLight = THREE.PointLight;
var AmbientLight = THREE.AmbientLight;
var Control = objects.Control;
var GUI = dat.GUI;
var Color = THREE.Color;
var Vector3 = THREE.Vector3;
var Face3 = THREE.Face3;
var Point = objects.Point;
var CScreen = config.Screen;
var Clock = THREE.Clock;
//Custom Game Objects
var gameObject = objects.gameObject;
// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";
// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (function () {
    // declare game objects
    var havePointerLock;
    var element;
    var scene = new Scene(); // Instantiate Scene Object
    var renderer;
    var camera;
    var control;
    var gui;
    var stats;
    var blocker;
    var instructions;
    var spotLight;
    var groundGeometry;
    var groundMaterial;
    var ground;
    var clock;
    var playerGeometry;
    var playerMaterial;
    var player;
    var sphereGeometry;
    var sphereMaterial;
    var sphere;
    var wallOne;
    var wallTwo;
    var wallThree;
    var wallFour;
    var wallFive;
    var wallSix;
    var keyboardControls;
    var isGrounded;
    var velocity = new Vector3(0, 0, 0);
    var prevTime = 0;
    var wallSeven;
    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        keyboardControls = new objects.KeyboardControls();
        if (havePointerLock) {
            element = document.body;
            instructions.addEventListener('click', function () {
                // Ask the user for pointer lock
                console.log("Requesting PointerLock");
                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;
                element.requestPointerLock();
            });
            document.addEventListener('pointerlockchange', pointerLockChange);
            document.addEventListener('mozpointerlockchange', pointerLockChange);
            document.addEventListener('webkitpointerlockchange', pointerLockChange);
            document.addEventListener('pointerlockerror', pointerLockError);
            document.addEventListener('mozpointerlockerror', pointerLockError);
            document.addEventListener('webkitpointerlockerror', pointerLockError);
        }
        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0, 750);
        scene.setGravity(new THREE.Vector3(0, -10, 0));
        scene.addEventListener('update', function () {
            scene.simulate(undefined, 2);
        });
        // setup a THREE.JS Clock object
        clock = new Clock();
        setupRenderer(); // setup the default renderer
        setupCamera(); // setup the camera
        // Spot Light
        spotLight = new SpotLight(0xffffff);
        spotLight.position.set(20, 40, -15);
        spotLight.castShadow = true;
        spotLight.intensity = 2;
        spotLight.lookAt(new Vector3(0, 0, 0));
        spotLight.shadowCameraNear = 2;
        spotLight.shadowCameraFar = 200;
        spotLight.shadowCameraLeft = -5;
        spotLight.shadowCameraRight = 5;
        spotLight.shadowCameraTop = 5;
        spotLight.shadowCameraBottom = -5;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        spotLight.shadowDarkness = 0.5;
        spotLight.name = "Spot Light";
        scene.add(spotLight);
        console.log("Added spotLight to scene");
        // Burnt Ground
        groundGeometry = new BoxGeometry(51, 1, 51);
        groundMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xe75d14 }), 0.4, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundMaterial, 0);
        ground.position.set(0, 0, 0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added Burnt Ground to scene");
        wallOne = new Physijs.BoxMesh(new BoxGeometry(51, 10, 1), Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0), 0);
        wallOne.position.set(0.48, 5, 25.51);
        wallOne.receiveShadow = true;
        wallOne.castShadow = true;
        wallOne.name = "wallOne";
        // ground.add(wallOne);
        console.log("Added wallOne to Scene");
        wallTwo = new Physijs.BoxMesh(new BoxGeometry(1, 10, 30), Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0), 0);
        wallTwo.position.set(25.56, 5, 10.99);
        wallTwo.receiveShadow = true;
        wallTwo.castShadow = true;
        wallTwo.name = "wallTwo";
        scene.add(wallTwo);
        console.log("Added wallTwo to Scene");
        wallThree = new Physijs.BoxMesh(new BoxGeometry(51, 10, 1), Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0), 0);
        wallThree.position.set(-0.06, 5, -24.48);
        wallThree.receiveShadow = true;
        wallThree.castShadow = true;
        wallThree.name = "wallThree";
        scene.add(wallThree);
        console.log("Added wallThree to Scene");
        wallFour = new Physijs.BoxMesh(new BoxGeometry(1, 10, 10), Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0), 0);
        wallFour.position.set(25.32, 5, -17.5);
        wallFour.receiveShadow = true;
        wallFour.castShadow = true;
        wallFour.name = "wallFour";
        scene.add(wallFour);
        console.log("Added wallFour to Scene");
        wallFive = new Physijs.BoxMesh(new BoxGeometry(10, 10, 1), Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0), 0);
        wallFive.position.set(20.46, 5, -10.52);
        wallFive.receiveShadow = true;
        wallFive.castShadow = true;
        wallFive.name = "wallFive";
        scene.add(wallFive);
        console.log("Added wallFive to Scene");
        wallSix = new Physijs.BoxMesh(new BoxGeometry(18, 10, 1), Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0), 0);
        wallSix.position.set(16.56, 5, -3.52);
        wallSix.receiveShadow = true;
        wallSix.castShadow = true;
        wallSix.name = "wallSix";
        scene.add(wallSix);
        console.log("Added wallSix to Scene");
        wallSeven = new Physijs.BoxMesh(new BoxGeometry(1, 10, 15), Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0, 0), 0);
        wallSeven.position.set(8.13, 5, -10.61);
        wallSeven.receiveShadow = true;
        wallSeven.castShadow = true;
        wallSeven.name = "wallSeven";
        scene.add(wallSeven);
        console.log("Added wallSeven to Scene");
        // Player Object
        playerGeometry = new BoxGeometry(2, 2, 2);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);
        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(0, 30, 10);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");
        player.addEventListener('collision', function (event) {
            if (event.name === "Ground") {
                console.log("player hit the ground");
                isGrounded = true;
            }
            if (event.name === "wallSix") {
                console.log("player hit the sphere");
            }
        });
        // add controls
        gui = new GUI();
        control = new Control();
        addControl(control);
        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");
        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();
        window.addEventListener('resize', onWindowResize, false);
    }
    //PointerLockChange Event Handler
    function pointerLockChange(event) {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            blocker.style.display = 'none';
        }
        else {
            // disable our mouse and keyboard controls
            keyboardControls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
            console.log("PointerLock disabled");
        }
    }
    //PointerLockError Event Handler
    function pointerLockError(event) {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }
    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function addControl(controlObject) {
        /* ENTER CODE for the GUI CONTROL HERE */
    }
    // Add Frame Rate Stats to the Scene
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }
    // Setup main game loop
    function gameLoop() {
        stats.update();
        if (keyboardControls.enabled) {
            velocity = new Vector3();
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
            if (isGrounded) {
                if (keyboardControls.moveForward) {
                    console.log("Moving Forward");
                    velocity.z -= 400.0 * delta;
                }
                if (keyboardControls.moveLeft) {
                    console.log("Moving left");
                    velocity.x -= 400.0 * delta;
                }
                if (keyboardControls.moveBackward) {
                    console.log("Moving Backward");
                    velocity.z += 400.0 * delta;
                }
                if (keyboardControls.moveRight) {
                    console.log("Moving Right");
                    velocity.x += 400.0 * delta;
                }
                if (keyboardControls.jump) {
                    console.log("Jumping");
                    velocity.y += 2000.0 * delta;
                    if (player.position.y > 4) {
                        isGrounded = false;
                    }
                }
            }
        }
        player.applyCentralForce(velocity);
        prevTime = time;
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }
    //Camera Look function 
    function cameraLook() {
        var zenith = THREE.Math.degToRad(90);
        var nadir = THREE.Math.degToRad(-90);
        //        var cameraPitch:number = camera.rotation.x + mouseControls.pitch;
        //    camera.rotation.x = cameraPitch;
    }
    // Setup default renderer
    function setupRenderer() {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }
    // Setup main camera for the scene
    function setupCamera() {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 1000);
        camera.position.set(50, 25, 80);
        camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }
    window.onload = init;
    return {
        scene: scene
    };
})();

//# sourceMappingURL=game.js.map
