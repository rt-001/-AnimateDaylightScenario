import * as THREE from "three";
import * as SunCalc from "suncalc";

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 10, 50);
camera.lookAt(new THREE.Vector3(2, 10, 5));
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
// I added ambientLight so that we can see our setup when sun is not there
const buildindTexture = new THREE.TextureLoader().load("images/building.jpg");
const skyTexture = new THREE.TextureLoader().load("images/sky.jpg");
const grassTexture = new THREE.TextureLoader().load("images/grass.jpg");
// To cast shadow
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(-1, 1, 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);
// To enable shadow mode
renderer.shadowMap.renderReverseSided = false;
renderer.shadowMap.renderSingleSided = true;
renderer.shadowMap.autoUpdate = true;
renderer.shadowMap.enabled = true;
// Ground
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(25, 25);
const ground = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(100, 100),
  new THREE.MeshPhongMaterial({ map: grassTexture }) // green color
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
// Building
const building = new THREE.Mesh(
  new THREE.BoxBufferGeometry(10, 30, 5),

  new THREE.MeshPhongMaterial({ color: 0x808080, map: buildindTexture })
);
building.x = 0;
building.y = 0;
building.castShadow = true;
building.receiveShadow = false;
scene.add(building);
// Sun
const sun = new THREE.Mesh(
  new THREE.SphereBufferGeometry(2, 32, 32),
  new THREE.MeshPhongMaterial({ emissive: 0xffff00 })
);
sun.position.set(20, 5, 0);
sun.castShadow = true;
scene.add(sun);
const sunPath = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ color: 0xffffff })
);
scene.add(sunPath);
// VerticalPlane
const VerticalPlane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(100, 400),
  new THREE.MeshPhongMaterial({ map: skyTexture })
);
VerticalPlane.position.set(5, 20, -20);
VerticalPlane.rotation.z = -Math.PI / 2;
VerticalPlane.receiveShadow = true;
scene.add(VerticalPlane);
const animate = () => {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  const date = new Date("2023-02-05T00:00:00Z");
  date.setSeconds((elapsedTime * 86400) / 10);

  const latitude = 37.2852405;
  const longitude = -122.0168126;
  // Given in the question itself .
  const position = SunCalc.getPosition(date, latitude, longitude);

  const sunX = (position.azimuth / Math.PI) * 120;
  const sunZ = (-position.altitude / Math.PI) * 120;

  sun.position.set(sunX, -sunZ, 0);
  sun.lookAt(0, 0, 0);

  // I made this just to see how sun's circular path was changing
  const pathPoints = [];
  for (let i = 0; i < 24; i++) {
    const pathDate = new Date("2023-02-05T00:00:00Z");
    pathDate.setHours(i);
    const pathPosition = SunCalc.getPosition(pathDate, latitude, longitude);
    const pathX = (pathPosition.azimuth / Math.PI) * 120;
    const pathY = (-pathPosition.altitude / Math.PI) * 120;
    pathPoints.push(new THREE.Vector3(pathX, -pathY, 0));
    // scene.add(pathPoints);
  }
  // Sun as the source of directionalLight
  directionalLight.position.copy(sun.position);
  renderer.render(scene, camera);
};

animate();
