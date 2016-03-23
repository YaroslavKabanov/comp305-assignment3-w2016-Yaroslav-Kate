/// <reference path="_reference.ts"/>

// MAIN GAME FILE

// THREEJS Aliases
import Scene = Physijs.Scene;
import Renderer = THREE.WebGLRenderer;
import PerspectiveCamera = THREE.PerspectiveCamera;
import BoxGeometry = THREE.BoxGeometry;
import CubeGeometry = THREE.CubeGeometry;
import PlaneGeometry = THREE.PlaneGeometry;
import Geometry = THREE.Geometry;
import Line = THREE.Line;
import AxisHelper = THREE.AxisHelper;
import LambertMaterial = THREE.MeshLambertMaterial;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import Material = THREE.Material;
import LineBasicMaterial = THREE.LineBasicMaterial;
import PhongMaterial = THREE.MeshPhongMaterial;
import Mesh = THREE.Mesh;
import Object3D = THREE.Object3D;
import SpotLight = THREE.SpotLight;
import PointLight = THREE.PointLight;
import AmbientLight = THREE.AmbientLight;
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;

import CScreen = config.Screen;
import Clock = THREE.Clock;

// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";


// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (() => {

    // declare game objects
    var havePointerLock: boolean;
    var element: any;
    var scene: Scene = new Scene(); // Instantiate Scene Object
    var renderer: Renderer;
    var camera: PerspectiveCamera;
    var stats: Stats;
    var blocker: HTMLElement;
    var instructions: HTMLElement;
    var spotLight: SpotLight;
    var groundGeometry: CubeGeometry;
    var groundMaterial: Physijs.Material;
    var ground: Physijs.Mesh;
    var clock: Clock;
    var playerGeometry: CubeGeometry;
    var playerMaterial: Physijs.Material;
    var player: Physijs.Mesh;
    
    // walls for the maze
    var wallOne: Physijs.Mesh;
    var wallTwo: Physijs.Mesh;
    var wallThree: Physijs.Mesh;
    var wallFour: Physijs.Mesh;
    var wallFive: Physijs.Mesh;
    var wallSix: Physijs.Mesh;
    var wallSeven: Physijs.Mesh;
    var wallEight: Physijs.Mesh;
    var wallNine: Physijs.Mesh;
    var wallTen: Physijs.Mesh;
    var wallEleven: Physijs.Mesh;
    var wallTwelve: Physijs.Mesh;
    var wallThirteen: Physijs.Mesh;
    var wallFourteen: Physijs.Mesh;
    var wallFifteen: Physijs.Mesh;
    var wallSixteen: Physijs.Mesh;
    var wallSeventeen: Physijs.Mesh;
    var wallEighteen: Physijs.Mesh;
    var wallNineteen: Physijs.Mesh;
    var wallTwenty: Physijs.Mesh;
    var wallTwentyOne: Physijs.Mesh;
    var mouseControls: objects.MouseControls;

    var keyboardControls: objects.KeyboardControls;
    var isGrounded: boolean;
    var velocity: Vector3 = new Vector3(0, 0, 0);
    var prevTime: number = 0;
    var directionLineMaterial: LineBasicMaterial;
    var directionLineGeometry: Geometry;
    var directionLine: Line;

    var crystalGeometry: Geometry;
    var crystalMaterial: Physijs.Material;

    var crystal: Physijs.ConvexMesh;

    var lavaPuddleOne: Physij.Mesh;
    var lavaPuddleTwo: Physij.Mesh;
    var lavaPuddleThree: Physij.Mesh;
    var lavaPuddleFour: Physij.Mesh;
    var lavaPuddleFive: Physij.Mesh;
    var lavaPuddleSix: Physij.Mesh;
    

    var crystals: Physijs.ConvexMesh[];
    var crystalCount: number = 5;
    
    var deathPlaneGeometry: CubeGeometry;
    var deathPlaneMaterial: Physijs.Material;
    var deathPlane: Physijs.Mesh;
   
    // CreateJS Related Variables
    var assets: createjs.LoadQueue;
    var canvas: HTMLElement;
    var stage: createjs.Stage;
    var scoreLabel: createjs.Text;
    var livesLabel: createjs.Text;
    var scoreValue: number;
    var livesValue: number;

 /*   function preload(): void {
        assets = new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        assets.on("complete", init, this);
        assets.loadManifest(manifest);
    }
    */
    
    function setupCanvas(): void {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }

    function setupScoreboard(): void {
        // initialize  score and lives values
        scoreValue = 10;
        livesValue = 5;

        // Add Lives Label
        livesLabel = new createjs.Text(
            "LIVES: " + livesValue,
            "40px Consolas",
            "#ffffff"
        );
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(livesLabel);
        console.log("Added Lives Label to stage");

        // Add Score Label
        scoreLabel = new createjs.Text(
            "SCORE: " + timeUpdate(),
            "40px Consolas",
            "#ffffff"
        );
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
        addDeathPlane();
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

            instructions.addEventListener('click', () => {
                
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

        scene.addEventListener('update', () => {
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
        
        //adding lava paddles
        lavaPuddleOne = new Physijs.BoxMesh(new BoxGeometry(7, 0.1, 7), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/lava.jpg') }), 0, 0), 0);
        lavaPuddleOne.position.set(20.71, 0.5, 20.88);
        lavaPuddleOne.receiveShadow = true;
        lavaPuddleOne.castShadow = true;
        lavaPuddleOne.name = "DeathPlane";
        scene.add(lavaPuddleOne);
        console.log("Added  lavaPuddleOne to Scene");

        lavaPuddleTwo = new Physijs.BoxMesh(new BoxGeometry(6, 0.1, 5), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/lava.jpg') }), 0, 0), 0);
        lavaPuddleTwo.position.set(13.75, 0.5, -13.95);
        lavaPuddleTwo.receiveShadow = true;
        lavaPuddleTwo.castShadow = true;
        lavaPuddleTwo.name = "DeathPlane";
        scene.add(lavaPuddleTwo);
        console.log("Added  lavaPuddleTwo to Scene");

        lavaPuddleThree = new Physijs.BoxMesh(new BoxGeometry(6, 0.1, 6), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/lava.jpg') }), 0, 0), 0);
        lavaPuddleThree.position.set(9.57, 0.5, 1.71);
        lavaPuddleThree.receiveShadow = true;
        lavaPuddleThree.castShadow = true;
        lavaPuddleThree.name = "DeathPlane";
        scene.add(lavaPuddleThree);
        console.log("Added  lavaPuddleThree to Scene");

        lavaPuddleFour = new Physijs.BoxMesh(new BoxGeometry(8, 0.1, 8), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/lava.jpg') }), 0, 0), 0);
        lavaPuddleFour.position.set(0.64, 0.5, 11.55);
        lavaPuddleFour.receiveShadow = true;
        lavaPuddleFour.castShadow = true;
        lavaPuddleFour.name = "DeathPlane";
        scene.add(lavaPuddleFour);
        console.log("Added  lavaPuddleFour to Scene");

        lavaPuddleFive = new Physijs.BoxMesh(new BoxGeometry(6, 0.1, 6), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/lava.jpg') }), 0, 0), 0);
        lavaPuddleFive.position.set(-11.14, 0.5, -14.26);
        lavaPuddleFive.receiveShadow = true;
        lavaPuddleFive.castShadow = true;
        lavaPuddleFive.name = "DeathPlane";
        scene.add(lavaPuddleFive);
        console.log("Added  lavaPuddleFive to Scene");

        lavaPuddleSix = new Physijs.BoxMesh(new BoxGeometry(6, 0.1, 6), Physijs.createMaterial(new LambertMaterial({ map: THREE.ImageUtils.loadTexture('../Assets/images/lava.jpg') }), 0, 0), 0);
        lavaPuddleSix.position.set(-13.57, 0.5, 10.19);
        lavaPuddleSix.receiveShadow = true;
        lavaPuddleSix.castShadow = true;
        lavaPuddleSix.name = "DeathPlane";
        scene.add(lavaPuddleSix);
        console.log("Added  lavaPuddleSix to Scene");
 
        // Player Object
        playerGeometry = new BoxGeometry(1, 6, 1);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);

        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(22, 15, -0.33);
        player.receiveShadow = true;
        player.castShadow = true;
        player.setAngularFactor(new Vector3(0, 0, 0));
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");

        // add crystal mesh exported from blender

           addCrystalMesh(); 
           
        // collision check
        player.addEventListener('collision', (eventObject) => {
         
            if (eventObject.name === "Ground") {
                console.log("player hit the ground");
                isGrounded = true;
            }
            if (eventObject.name === "Crystal") {
                scoreValue += 5;
                scene.remove(eventObject);
                setCrystalPosition(eventObject);
                scoreLabel.text = "SCORE:" + scoreValue;
            }
            
            if (eventObject.name === "DeathPlane") {
                createjs.Sound.play("death");
                livesValue--;
                livesLabel.text = "LIVES: " + livesValue;
                scene.remove(player);
                player.position.set(22, 30, -0.33);
                scene.add(player);

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

    function setCenter(geometry: Geometry): Vector3 {

        geometry.computeBoundingBox();

        var bb = geometry.boundingBox;

        var offset = new THREE.Vector3();

        offset.addVectors(bb.min, bb.max);
        offset.multiplyScalar(-0.5);

        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z));
        geometry.computeBoundingBox();

        return offset;
    }
    
    function addDeathPlane(): void {
        deathPlaneGeometry = new BoxGeometry(100, 1, 100); 
        deathPlaneMaterial = Physijs.createMaterial(new MeshBasicMaterial({color: 0xff0000}), 0.4, 0.6);
       
        deathPlane = new Physijs.BoxMesh(deathPlaneGeometry, deathPlaneMaterial, 0);
        deathPlane.position.set(0, -10, 0); 
        deathPlane.name = "deathPlane";
        scene.add(deathPlane);
    }
    
    
    // add crystal to the scene
    function addCrystalMesh(): void {
crystals = new Array<Physijs.ConvexMesh>(); // insttantiate a convex mesh array
        
        var coinLoader = new THREE.JSONLoader().load("../../Assets/imported/crystal.json", function(geometry: THREE.Geometry) {
            var phongMaterial = new PhongMaterial({ color: 0x50c878 });
            phongMaterial.emissive = new THREE.Color(0x50c878);
            var coinMaterial = Physijs.createMaterial((phongMaterial), 0.4, 0.6);
            
            for (var count: number = 0; count < crystalCount; count++) {
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
    function setCrystalPosition(crystal:Physijs.ConcaveMesh): void {
        var randomPointX: number = Math.floor(Math.random()* 30) - 10;
        var randomPointZ: number = Math.floor(Math.random()* 30) - 10;

        crystal.position.set(randomPointX, 10, randomPointZ);
        scene.add(crystal);
    }
    
    //PointerLockChange Event Handler
    function pointerLockChange(event): void {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            blocker.style.display = 'none';
        } else {
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
    function pointerLockError(event): void {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }
    function timeUpdate(): number {
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
    function gameLoop(): void {
        stats.update();

        checkControls();
        timeUpdate();

          setupScoreboard();
       // console.log(scoreValue)

        
        // make each crystal to rotate and be stable 
        crystals.forEach(crystal => {
          crystal.setAngularFactor(new Vector3(0, 0, 0));
          crystal.setAngularVelocity(new Vector3(0, 1, 0));  
        });
        stage.update();
       
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
	
        // render the scene
        renderer.render(scene, camera);

    }
    
    // Check Controls Function
    function checkControls(): void {
        if (keyboardControls.enabled) {
            velocity = new Vector3();

            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;

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
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(90);
        var nadir: number = THREE.Math.degToRad(-90);
        var cameraPitch = camera.rotation.x + mouseControls.pitch;
        // Constrain the Camera Pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
    }


    // Setup default renderer
    function setupRenderer(): void {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }

    // Setup main camera for the scene
    function setupCamera(): void {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 250);
        // comment two rows below to see first perspective view ++++++++++++++++++++++++++++++++++++
        // I kept view from top to see general picture
       // camera.position.set(70, 100, 80);
       //camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }

    window.onload = init;

    return {
        scene: scene
    }

})();

