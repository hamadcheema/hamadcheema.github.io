import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

let camera, scene, renderer, controls;
let heartMesh;
let allVertices = [];

scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 40);

controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = false;
controls.enableDamping = true;
controls.enablePan = false;
controls.maxDistance = camera.far / 2;
controls.target.set(0, 0, 0);
controls.update();

const bottomX = -5;
const curvePath = new THREE.CurvePath();

curvePath.add(
  new THREE.CubicBezierCurve(
    new THREE.Vector2(0, -5),
    new THREE.Vector2(0, -5),
    new THREE.Vector2(-1, -9),
    new THREE.Vector2(bottomX, -9)
  )
);

curvePath.add(
  new THREE.CubicBezierCurve(
    new THREE.Vector2(bottomX, -9),
    new THREE.Vector2(-11, -9),
    new THREE.Vector2(-11, -3),
    new THREE.Vector2(-11, -3)
  )
);

curvePath.add(
  new THREE.CubicBezierCurve(
    new THREE.Vector2(-11, -3),
    new THREE.Vector2(-11, 1),
    new THREE.Vector2(-7, 5.4),
    new THREE.Vector2(0, 9)
  )
);

const curvePoints2D = [];
for (let i = 0; i < 20; i++) {
  const t = i / 19;
  curvePoints2D.push(curvePath.getPointAt(t));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a = 1 / (1 + 0.3275911 * x);
  return sign * (1 - ((((1.061405429 * a - 1.453152027) * a + 1.421413741) * a - 0.284496736) * a + 0.254829592) * a * Math.exp(-x * x));
}

function gaussianDistribution(value, min, max, minVal, maxVal) {
  if (value <= -2 || value >= 2) return 0;
  const normalized = ((value - min) / (max - min)) * 2 - 1;
  const erfValue = erf(3 * normalized);
  const prob = (erfValue + 1) / 2;
  return prob * (maxVal - minVal) + minVal;
}

curvePoints2D.forEach((point) => {
  const start = new THREE.Vector2(0, 0);
  const end = new THREE.Vector2(point.x.toFixed(2), point.y.toFixed(2));
  const vertices = [];
  
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
    const z = gaussianDistribution(t, 0, 2, -2, 5) - 2.5;
    
    vertices.push(new THREE.Vector3(x, y, z));
    vertices.push(new THREE.Vector3(x, y, -z));
  }
  
  vertices.forEach((vertex) => {
    allVertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
  });
});

function mirrorGeometry(geom) {
  const cloned = geom.clone().toNonIndexed();
  const positions = cloned.getAttribute("position").array;
  const mirrored = [];
  
  for (let i = 0; i < positions.length; i += 9) {
    const x1 = positions[i];
    const x2 = positions[i + 3];
    const x3 = positions[i + 6];
    
    if (x1 !== 0 || x2 !== 0 || x3 !== 0) {
      for (let j = 0; j < 9; j++) {
        mirrored.push(positions[i + j]);
      }
    }
  }
  
  const flipped = [];
  for (let i = 0; i < mirrored.length; i++) {
    if (i % 3 === 0) {
      flipped.push(-1 * mirrored[i]);
    } else {
      flipped.push(mirrored[i]);
    }
  }
  
  for (let i = 0; i < flipped.length; i += 9) {
    const v1 = flipped.slice(i, i + 3);
    const v2 = flipped.slice(i + 3, i + 6);
    const v3 = flipped.slice(i + 6, i + 9);
    mirrored.push(...v1, ...v3, ...v2);
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(mirrored, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.computeVertexNormals();
  
  return geometry;
}

let progress = 0;
const animationSpeed = 0.001;

function animate() {
  requestAnimationFrame(animate);
  
  if (progress < 1) {
    progress += animationSpeed;
  }
  
  const currentVertexCount = Math.floor(progress * allVertices.length);
  const currentVertices = allVertices.slice(0, currentVertexCount);
  
  if (heartMesh) {
    scene.remove(heartMesh);
  }
  
  if (currentVertices.length >= 4) {
    let geometry = new ConvexGeometry(currentVertices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true 
    });
    
    geometry = mirrorGeometry(geometry);
    heartMesh = new THREE.Mesh(geometry, material);
    scene.add(heartMesh);
  }
  
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();