/// <reference path="_reference.ts"/>
// MAIN GAME FILE
// THREEJS Aliases
var Scene = Physijs.Scene;
var Renderer = THREE.WebGLRenderer;
var PerspectiveCamera = THREE.PerspectiveCamera;
var BoxGeometry = THREE.BoxGeometry;
var CubeGeometry = THREE.CubeGeometry;
var PlaneGeometry = THREE.PlaneGeometry;
var Geometry = THREE.Geometry;
var Line = THREE.Line;
var AxisHelper = THREE.AxisHelper;
var LambertMaterial = THREE.MeshLambertMaterial;
var MeshBasicMaterial = THREE.MeshBasicMaterial;
var Material = THREE.Material;
var LineBasicMaterial = THREE.LineBasicMaterial;
var PhongMaterial = THREE.MeshPhongMaterial;
var Mesh = THREE.Mesh;
var Object3D = THREE.Object3D;
var SpotLight = THREE.SpotLight;
var PointLight = THREE.PointLight;
var AmbientLight = THREE.AmbientLight;
var Color = THREE.Color;
var Vector3 = THREE.Vector3;
var Face3 = THREE.Face3;
var CScreen = config.Screen;
var Clock = THREE.Clock;
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
    // walls for the maze
    var wallOne;
    var wallTwo;
    var wallThree;
    var wallFour;
    var wallFive;
    var wallSix;
    var wallSeven;
    var wallEight;
    var wallNine;
    var wallTen;
    var wallEleven;
    var wallTwelve;
    var wallThirteen;
    var wallFourteen;
    var wallFifteen;
    var wallSixteen;
    var wallSeventeen;
    var wallEighteen;
    var wallNineteen;
    var wallTwenty;
    var wallTwentyOne;
    var mouseControls;
    var keyboardControls;
    var isGrounded;
    var velocity = new Vector3(0, 0, 0);
    var prevTime = 0;
    var directionLineMaterial;
    var directionLineGeometry;
    var directionLine;
    var crystalGeometry;
    var crystalMaterial;
    var crystals;
    var crystalCount = 5;
    // CreateJS Related Variables
    var assets;
    var canvas;
    var stage;
    var scoreLabel;
    var livesLabel;
    var scoreValue;
    var livesValue;
    /*   function preload(): void {
           assets = new createjs.LoadQueue();
           assets.installPlugin(createjs.Sound);
           assets.on("complete", init, this);
           assets.loadManifest(manifest);
       }
       */
    function setupCanvas() {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }
    function setupScoreboard() {
        // initialize  score and lives values
        scoreValue = 10;
        livesValue = 5;
        // Add Lives Label
        livesLabel = new createjs.Text("LIVES: " + livesValue, "40px Consolas", "#ffffff");
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(livesLabel);
        console.log("Added Lives Label to stage");
        // Add Score Label
        scoreLabel = new createjs.Text("SCORE: " + timeUpdate(), "40px Consolas", "#ffffff");
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(scoreLabel);
        console.log("Added Score Label to stage");
    }
    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        // Set Up CreateJS Canvas and Stage
        setupCanvas();
        // Set Up Scoreboard
        setupScoreboard();
        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        // Instantiate Game Controls
        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();
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
        spotLight.intensity = 3;
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
        // added ambient light       
        var AmbiLight = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(AmbiLight);
        // Burnt Ground
        groundGeometry = new BoxGeometry(61, 1, 52);
        groundMaterial = Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/ground.jpg') }), 0.4, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundMaterial, 0);
        ground.position.set(0, 0, 0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added Burnt Ground to scene");
        wallOne = new Physijs.BoxMesh(new BoxGeometry(51, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallOne.position.set(0.48, 5, 25.51);
        wallOne.receiveShadow = true;
        wallOne.castShadow = true;
        wallOne.name = "wallOne";
        scene.add(wallOne);
        console.log("Added wallOne to Scene");
        wallTwo = new Physijs.BoxMesh(new BoxGeometry(1, 10, 51), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallTwo.position.set(26.56, 5, 0.5);
        wallTwo.receiveShadow = true;
        wallTwo.castShadow = true;
        wallTwo.name = "wallTwo";
        scene.add(wallTwo);
        console.log("Added wallTwo to Scene");
        wallThree = new Physijs.BoxMesh(new BoxGeometry(51, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallThree.position.set(0.3, 5, -24.48);
        wallThree.receiveShadow = true;
        wallThree.castShadow = true;
        wallThree.name = "wallThree";
        scene.add(wallThree);
        console.log("Added wallThree to Scene");
        wallFive = new Physijs.BoxMesh(new BoxGeometry(10, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallFive.position.set(20.8, 5, -10.8);
        wallFive.receiveShadow = true;
        wallFive.castShadow = true;
        wallFive.name = "wallFive";
        scene.add(wallFive);
        console.log("Added wallFive to Scene");
        wallSix = new Physijs.BoxMesh(new BoxGeometry(18, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallSix.position.set(16.56, 5, -3.52);
        wallSix.receiveShadow = true;
        wallSix.castShadow = true;
        wallSix.name = "wallSix";
        scene.add(wallSix);
        console.log("Added wallSix to Scene");
        wallSeven = new Physijs.BoxMesh(new BoxGeometry(1, 10, 15), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallSeven.position.set(8.13, 5, -10.61);
        wallSeven.receiveShadow = true;
        wallSeven.castShadow = true;
        wallSeven.name = "wallSeven";
        scene.add(wallSeven);
        console.log("Added wallSeven to Scene");
        wallEight = new Physijs.BoxMesh(new BoxGeometry(10, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallEight.position.set(12.83, 5, -17.7);
        wallEight.receiveShadow = true;
        wallEight.castShadow = true;
        wallEight.name = "wallEight";
        scene.add(wallEight);
        console.log("Added wallEight to Scene");
        wallNine = new Physijs.BoxMesh(new BoxGeometry(1, 10, 20), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallNine.position.set(9.47, 5, 15.82);
        wallNine.receiveShadow = true;
        wallNine.castShadow = true;
        wallNine.name = "wallNine";
        scene.add(wallNine);
        console.log("Added wallNine to Scene");
        wallTen = new Physijs.BoxMesh(new BoxGeometry(10, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallTen.position.set(4.86, 5, 6.4);
        wallTen.receiveShadow = true;
        wallTen.castShadow = true;
        wallTen.name = "wallTen";
        scene.add(wallTen);
        console.log("Added wallTen to Scene");
        wallEleven = new Physijs.BoxMesh(new BoxGeometry(1, 10, 10), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallEleven.position.set(0.35, 5, 1.89);
        wallEleven.receiveShadow = true;
        wallEleven.castShadow = true;
        wallEleven.name = "wallEleven";
        scene.add(wallEleven);
        console.log("Added wallEleven to Scene");
        wallTwelve = new Physijs.BoxMesh(new BoxGeometry(1, 10, 16), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallTwelve.position.set(0.35, 5, -16.52);
        wallTwelve.receiveShadow = true;
        wallTwelve.castShadow = true;
        wallTwelve.name = "wallTwelve";
        scene.add(wallTwelve);
        console.log("Added wallTwelve to Scene");
        wallThirteen = new Physijs.BoxMesh(new BoxGeometry(10, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallThirteen.position.set(-4.04, 5, 16.5);
        wallThirteen.receiveShadow = true;
        wallThirteen.castShadow = true;
        wallThirteen.name = "wallThirteen";
        scene.add(wallThirteen);
        console.log("Added wallThirteen to Scene");
        wallFourteen = new Physijs.BoxMesh(new BoxGeometry(1, 10, 20), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallFourteen.position.set(-8.83, 5, 6.91);
        wallFourteen.receiveShadow = true;
        wallFourteen.castShadow = true;
        wallFourteen.name = "wallFourteen";
        scene.add(wallFourteen);
        console.log("Added wallFourteen to Scene");
        wallFifteen = new Physijs.BoxMesh(new BoxGeometry(10, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallFifteen.position.set(-4.42, 5, -2.63);
        wallFifteen.receiveShadow = true;
        wallFifteen.castShadow = true;
        wallFifteen.name = "wallFifteen";
        scene.add(wallFifteen);
        console.log("Added wallFifteen to Scene");
        wallSixteen = new Physijs.BoxMesh(new BoxGeometry(1, 10, 8), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallSixteen.position.set(-7.07, 5, -20.41);
        wallSixteen.receiveShadow = true;
        wallSixteen.castShadow = true;
        wallSixteen.name = "wallSixteen";
        scene.add(wallSixteen);
        console.log("Added wallSixteen to Scene");
        wallSeventeen = new Physijs.BoxMesh(new BoxGeometry(12, 10, 1), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallSeventeen.position.set(-11.45, 5, -10.21);
        wallSeventeen.receiveShadow = true;
        wallSeventeen.castShadow = true;
        wallSeventeen.name = "wallSeventeen";
        scene.add(wallSeventeen);
        console.log("Added wallSeventeen to Scene");
        wallEighteen = new Physijs.BoxMesh(new BoxGeometry(1, 10, 45), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallEighteen.position.set(-17.52, 5, 3.24);
        wallEighteen.receiveShadow = true;
        wallEighteen.castShadow = true;
        wallEighteen.name = "wallEighteen";
        scene.add(wallEighteen);
        console.log("Added wallEighteen to Scene");
        wallNineteen = new Physijs.BoxMesh(new BoxGeometry(1, 10, 30), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallNineteen.position.set(-24.65, 5, -9.78);
        wallNineteen.receiveShadow = true;
        wallNineteen.castShadow = true;
        wallNineteen.name = "wallNineteen";
        scene.add(wallNineteen);
        console.log("Added wallNineteen to Scene");
        wallTwenty = new Physijs.BoxMesh(new BoxGeometry(1, 10, 15), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallTwenty.position.set(-24.51, 5, 18.18);
        wallTwenty.receiveShadow = true;
        wallTwenty.castShadow = true;
        wallTwenty.name = "wallTwenty";
        scene.add(wallTwenty);
        console.log("Added wallTwenty to Scene");
        wallTwentyOne = new Physijs.BoxMesh(new BoxGeometry(1, 10, 20), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/forest.jpg') }), 0, 0), 0);
        wallTwentyOne.position.set(18.01, 5, 6.67);
        wallTwentyOne.receiveShadow = true;
        wallTwentyOne.castShadow = true;
        wallTwentyOne.name = " wallTwentyOne";
        scene.add(wallTwentyOne);
        console.log("Added  wallTwentyOne to Scene");
        // Player Object
        playerGeometry = new BoxGeometry(2, 2, 2);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);
        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(22, 30, -0.33);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");
        // add crystal mesh exported from blender
        addCrystalMesh();
        // collision check
        player.addEventListener('collision', function (eventObject) {
            if (eventObject.name === "Ground") {
                console.log("player hit the ground");
                isGrounded = true;
            }
            if (eventObject.name === "wallSix") {
                console.log("player hit the wall 6");
            }
            if (eventObject.name === "Crystal") {
                scoreValue += 5;
                scene.remove(eventObject);
                setCrystalPosition(eventObject);
                scoreLabel.text = "SCORE:" + scoreValue;
            }
        });
        // Add DirectionLine
        directionLineMaterial = new LineBasicMaterial({ color: 0xffff00 });
        directionLineGeometry = new Geometry();
        directionLineGeometry.vertices.push(new Vector3(0, 0, 0)); // line origin
        directionLineGeometry.vertices.push(new Vector3(0, 0, -50)); // end of the line
        directionLine = new Line(directionLineGeometry, directionLineMaterial);
        player.add(directionLine);
        console.log("Added DirectionLine to the Player");
        // create parent-child relationship with camera and player
        player.add(camera);
        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");
        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();
        window.addEventListener('resize', onWindowResize, false);
    }
    function setCenter(geometry) {
        geometry.computeBoundingBox();
        var bb = geometry.boundingBox;
        var offset = new THREE.Vector3();
        offset.addVectors(bb.min, bb.max);
        offset.multiplyScalar(-0.5);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z));
        geometry.computeBoundingBox();
        return offset;
    }
    // add crystal to the scene
    function addCrystalMesh() {
        crystals = new Array(); // insttantiate a convex mesh array
        var coinLoader = new THREE.JSONLoader().load("../../Assets/imported/crystal.json", function (geometry) {
            var phongMaterial = new PhongMaterial({ color: 0x50c878 });
            phongMaterial.emissive = new THREE.Color(0x50c878);
            var coinMaterial = Physijs.createMaterial((phongMaterial), 0.4, 0.6);
            for (var count = 0; count < crystalCount; count++) {
                crystals[count] = new Physijs.ConvexMesh(geometry, coinMaterial);
                crystals[count].receiveShadow = true;
                crystals[count].castShadow = true;
                crystals[count].name = "Crystal";
                scene.add(crystals[count]);
                setCrystalPosition(crystals[count]);
            }
        });
        console.log("Added CRYSTAL Mesh to Scene");
    }
    //set crystal position
    function setCrystalPosition(crystal) {
        var randomPointX = Math.floor(Math.random() * 20) - 10;
        var randomPointZ = Math.floor(Math.random() * 20) - 10;
        crystal.position.set(randomPointX, 10, randomPointZ);
        scene.add(crystal);
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
    function timeUpdate() {
        return scoreValue -= 0.001;
    }
    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvas.style.width = "100%";
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.update();
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
        checkControls();
        timeUpdate();
        // make each crystal to rotate and be stable 
        crystals.forEach(function (crystal) {
            crystal.setAngularFactor(new Vector3(0, 0, 0));
            crystal.setAngularVelocity(new Vector3(0, 1, 0));
        });
        //  setupScoreboard();
        console.log(scoreValue);
        stage.update();
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }
    // Check Controls Function
    function checkControls() {
        if (keyboardControls.enabled) {
            velocity = new Vector3();
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
            if (isGrounded) {
                var direction = new Vector3(0, 0, 0);
                if (keyboardControls.moveForward) {
                    velocity.z -= 400.0 * delta;
                }
                if (keyboardControls.moveLeft) {
                    velocity.x -= 400.0 * delta;
                }
                if (keyboardControls.moveBackward) {
                    velocity.z += 400.0 * delta;
                }
                if (keyboardControls.moveRight) {
                    velocity.x += 400.0 * delta;
                }
                if (keyboardControls.jump) {
                    velocity.y += 4000.0 * delta;
                    if (player.position.y > 4) {
                        isGrounded = false;
                    }
                }
                player.setDamping(0.7, 0.1);
                // Changing player's rotation
                player.setAngularVelocity(new Vector3(0, mouseControls.yaw, 0));
                direction.addVectors(direction, velocity);
                direction.applyQuaternion(player.quaternion);
                if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                    player.applyCentralForce(direction);
                }
                cameraLook();
            } // isGrounded ends
            //reset Pitch and Yaw
            mouseControls.pitch = 0;
            mouseControls.yaw = 0;
            prevTime = time;
        } // Controls Enabled ends
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }
    //Camera Look function 
    function cameraLook() {
        var zenith = THREE.Math.degToRad(90);
        var nadir = THREE.Math.degToRad(-90);
        var cameraPitch = camera.rotation.x + mouseControls.pitch;
        // Constrain the Camera Pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
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
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 300);
        // comment two rows below to see first perspective view ++++++++++++++++++++++++++++++++++++
        // I kept view from top to see general picture
        camera.position.set(70, 100, 80);
        camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }
    window.onload = init;
    return {
        scene: scene
    };
})();

//# sourceMappingURL=game.js.map
