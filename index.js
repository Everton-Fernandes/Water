import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let blocks = [];
let intervalId;
const intervalTime = 1000;
let waterCube;
let grassCube;

init();
startDrawing();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 15);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;

  window.addEventListener("resize", onWindowResize);
}

function startDrawing() {
  intervalId = setInterval(drawWater, intervalTime);
}

function xyToIndex(x, y, width) {
  return x + y * width;
}

function WaterFunction(matrix, actives, width) {
  var newActives = [];
  for (var i = 0; i < actives.length; i++) {
    var rl = 0, rr = 0, rt = 0, rb = 0;

    if(matrix[xyToIndex(actives[i].x - 1, actives[i].y, width)] == GRASS) {
      rl = 7 - (actives[i].level - 1);
    }

    if(matrix[xyToIndex(actives[i].x + 1, actives[i].y, width)] == GRASS) {
      rr = 7 - (actives[i].level - 1);
    }

    if(matrix[xyToIndex(actives[i].x, actives[i].y + 1, width)] == GRASS) {
      rt = 7 - (actives[i].level - 1);
    }

    if(matrix[xyToIndex(actives[i].x, actives[i].y - 1, width)] == GRASS) {
      rb = 7 - (actives[i].level - 1);
    }

    var left = {
      x: actives[i].x - 1,
      y: actives[i].y,
      left: actives[i].left - 1 - rl,
      right: actives[i].right - 1 - rr,
      top: actives[i].top - 1 - rt,
      bottom: actives[i].bottom - 1 - rb,
      level: actives[i].level - 1
    };

    var right = {
      x: actives[i].x + 1,
      y: actives[i].y,
      left: actives[i].left - 1 - rl,
      right: actives[i].right - 1 - rr,
      top: actives[i].top - 1 - rt,
      bottom: actives[i].bottom - 1 - rb,
      level: actives[i].level - 1
    };

    var top = {
      x: actives[i].x,
      y: actives[i].y + 1,
      left: actives[i].left - 1 - rl,
      right: actives[i].right - 1 - rr,
      top: actives[i].top - 1 - rt,
      bottom: actives[i].bottom - 1 - rb,
      level: actives[i].level - 1
    };

    var bottom = {
      x: actives[i].x,
      y: actives[i].y - 1,
      left: actives[i].left - 1 - rl,
      right: actives[i].right - 1 - rr,
      top: actives[i].top - 1 - rt,
      bottom: actives[i].bottom - 1 - rb,
      level: actives[i].level - 1
    };

    if (actives[i].left > 0) {
      if (matrix[xyToIndex(left.x, left.y, width)] == 0) {
        matrix[xyToIndex(left.x, left.y, width)] = 1;
        newActives.push(left);
      }
    }

    if (actives[i].right > 0) {
      if (matrix[xyToIndex(right.x, right.y, width)] == 0) {
        matrix[xyToIndex(right.x, right.y, width)] = 1;
        newActives.push(right);
      }
    }

    if (actives[i].top > 0) {
      if (matrix[xyToIndex(top.x, top.y, width)] == 0) {
        matrix[xyToIndex(top.x, top.y, width)] = 1;
        newActives.push(top);
      }
    }

    if (actives[i].bottom > 0) {
      if (matrix[xyToIndex(bottom.x, bottom.y, width)] == 0) {
        matrix[xyToIndex(bottom.x, bottom.y, width)] = 1;
        newActives.push(bottom);
      }
    }
  }

  return newActives;
}

var width = 15;
var actives = [{ x: 7, y: 7, left: 7, right: 7, top: 7, bottom: 7, level: 7 }];
var matrix = new Array(width * width);

for (var i = 0; i < width * width; i++) {
  matrix[i] = 0;
}

const WATER = 1;
const GRASS = 2;

matrix[xyToIndex(7, 7, width)] = WATER;

// matrix[xyToIndex(5, 8, width)] = GRASS;
matrix[xyToIndex(6, 8, width)] = GRASS;
matrix[xyToIndex(7, 8, width)] = GRASS;
matrix[xyToIndex(8, 8, width)] = GRASS;
// matrix[xyToIndex(9, 8, width)] = GRASS;

function drawWater() {
  actives = WaterFunction(matrix, actives, width);

  for (var i = 0; i < blocks.length; i++) {
    scene.remove(blocks[i]);
  }

  blocks = [];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < width; y++) {
      const index = xyToIndex(x, y, width);
      const type = matrix[index];
      if (type == WATER) {
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({
          color: 0x3399ff,
          wireframe: true,
        });
        waterCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        waterCube.position.set(x, 0, y);
        scene.add(waterCube);
        blocks.push(waterCube);
      } else if(type == GRASS) {
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({
          color: 0x99ff33,
          wireframe: false,
        });
        waterCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        waterCube.position.set(x, 0, y);
        scene.add(waterCube);
        blocks.push(waterCube);
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
