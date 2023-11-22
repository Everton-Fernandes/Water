import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let waterBlocks = [];
let intervalId;
const intervalTime = 1000;
const gridSize = 15;
let row = 0,
  col = 0;

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
    var left = {
      x: actives[i].x - 1,
      y: actives[i].y,
      force: actives[i].force - 1,
    };
    var right = {
      x: actives[i].x + 1,
      y: actives[i].y,
      force: actives[i].force - 1,
    };
    var top = {
      x: actives[i].x,
      y: actives[i].y + 1,
      force: actives[i].force - 1,
    };
    var bottom = {
      x: actives[i].x,
      y: actives[i].y - 1,
      force: actives[i].force - 1,
    };

    if (
      left.x >= 0 &&
      matrix[xyToIndex(left.x, left.y, width)] <
        matrix[xyToIndex(actives[i].x, actives[i].y, width)]
    ) {
      matrix[xyToIndex(left.x, left.y, width)] = Math.min(
        matrix[xyToIndex(actives[i].x, actives[i].y, width)] - 1,
        7
      );
      if (actives[i].force > 0)
        newActives.push(left);
    }

    if (
      right.x < width &&
      matrix[xyToIndex(right.x, right.y, width)] <
        matrix[xyToIndex(actives[i].x, actives[i].y, width)]
    ) {
      matrix[xyToIndex(right.x, right.y, width)] = Math.min(
        matrix[xyToIndex(actives[i].x, actives[i].y, width)] - 1,
        7
      );
      if (actives[i].force > 0)
        newActives.push(right);
    }

    if (
      top.y < width &&
      matrix[xyToIndex(top.x, top.y, width)] <
        matrix[xyToIndex(actives[i].x, actives[i].y, width)]
    ) {
      matrix[xyToIndex(top.x, top.y, width)] = Math.min(
        matrix[xyToIndex(actives[i].x, actives[i].y, width)] - 1,
        7
      );
      if (actives[i].force > 0)
        newActives.push(top);
    }

    if (
      bottom.y >= 0 &&
      matrix[xyToIndex(bottom.x, bottom.y, width)] <
        matrix[xyToIndex(actives[i].x, actives[i].y, width)]
    ) {
      matrix[xyToIndex(bottom.x, bottom.y, width)] = Math.min(
        matrix[xyToIndex(actives[i].x, actives[i].y, width)] - 1,
        7
      );
      if (actives[i].force > 0)
        newActives.push(bottom);
    }
  }

  return newActives;
}

var width = 15;
var actives = [{ x: 8, y: 8, force: 7 }];
var matrix = new Array(width * width);

for (var i = 0; i < width * width; i++) {
  matrix[i] = 0;
}

matrix[xyToIndex(8, 8, width)] = 8; // Valor inicial de força de escoamento (máximo)

function drawWater() {
  actives = WaterFunction(matrix, actives, width);

  for (var i = 0; i < waterBlocks.length; i++) {
    scene.remove(waterBlocks[i]);
  }

  waterBlocks = [];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < width; y++) {
      const index = xyToIndex(x, y, width);
      if (matrix[index] > 0) {
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({
          color: 0x3399ff,
          wireframe: true,
        });
        const waterCube = new THREE.Mesh(cubeGeometry, cubeMaterial);

        waterCube.position.set(x, 0, y);
        scene.add(waterCube);
        waterBlocks.push(waterCube);
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
