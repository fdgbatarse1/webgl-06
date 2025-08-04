import "./reset.css";

import {
  Group,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  ShaderMaterial,
  Color,
  DataTexture,
  RepeatWrapping,
  Raycaster,
  Vector2,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

interface GalleryMesh extends Mesh {
  userData: {
    targetProgress: number;
    currentProgress: number;
  };
}

const CONFIG = {
  radius: 3.8,
  itemSize: 3.1,
  damping: 0.08,
  tiltDeg: 0,
  edgeSize: 0.08,
  edgeColor: "#d4c5b4",
  dissolveLerpIn: 0.1,
  dissolveLerpOut: 0.2,
  noiseScale: 4.0,
};

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = SRGBColorSpace;
renderer.domElement.style.cursor = "grab";

const scene = new Scene();
const camera = new PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 3);

const group = new Group();
scene.add(group);

let targetTheta = 0;
let theta = 0;
let isDown = false;
let lastX = 0;
let hoveredMesh: GalleryMesh | null = null;

const loader = new TextureLoader();
const raycaster = new Raycaster();
const mouse = new Vector2(-1, -1);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const gui = new GUI();
const guiFolder = gui.addFolder("Gallery Settings");

function updateMeshPositions(): void {
  const totalMeshes = group.children.length;
  group.children.forEach((child, i) => {
    if (child instanceof Mesh) {
      const angle = (i / totalMeshes) * Math.PI * 2;
      child.position.set(
        Math.cos(angle) * CONFIG.radius,
        0,
        Math.sin(angle) * CONFIG.radius
      );
    }
  });
}

function updateMeshTilt(): void {
  const tilt = degToRad(CONFIG.tiltDeg);
  group.children.forEach((child, i) => {
    if (child instanceof Mesh) {
      child.rotation.z = (i % 2 ? 1 : -1) * tilt;
    }
  });
}

function updateEdgeColor(): void {
  const color = new Color(CONFIG.edgeColor);
  group.children.forEach(child => {
    if (child instanceof Mesh) {
      const material = child.material as ShaderMaterial;
      material.uniforms.uEdgeColor.value = color;
    }
  });
}

guiFolder
  .add(CONFIG, "radius", 2, 8, 0.1)
  .name("Radius")
  .onChange(updateMeshPositions);
guiFolder.add(CONFIG, "damping", 0.01, 0.2, 0.01).name("Damping");
guiFolder
  .add(CONFIG, "tiltDeg", -30, 30, 1)
  .name("Tilt (degrees)")
  .onChange(updateMeshTilt);
guiFolder.add(CONFIG, "edgeSize", 0, 0.3, 0.01).name("Edge Size");
guiFolder
  .addColor(CONFIG, "edgeColor")
  .name("Edge Color")
  .onChange(updateEdgeColor);
guiFolder
  .add(CONFIG, "dissolveLerpIn", 0.01, 0.5, 0.01)
  .name("Dissolve In Speed");
guiFolder
  .add(CONFIG, "dissolveLerpOut", 0.01, 0.5, 0.01)
  .name("Dissolve Out Speed");
guiFolder.add(CONFIG, "noiseScale", 1, 10, 0.1).name("Noise Scale");
guiFolder.open();

function createNoiseTexture(): DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const value = Math.random() * 255;
    const idx = i * 4;
    data[idx] = value;
    data[idx + 1] = value;
    data[idx + 2] = value;
    data[idx + 3] = 255;
  }

  const texture = new DataTexture(data, size, size);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;

  return texture;
}

const noiseTexture = createNoiseTexture();

async function createRing(images: string[]): Promise<void> {
  const fixedHeight = CONFIG.itemSize * 0.66;

  const meshPromises = images.map(
    (src, i) =>
      new Promise<void>(resolve => {
        loader.load(src, texture => {
          texture.colorSpace = SRGBColorSpace;

          const aspectRatio = texture.image.width / texture.image.height;
          const width = fixedHeight * aspectRatio;

          const geometry = new PlaneGeometry(width, fixedHeight);
          const material = new ShaderMaterial({
            uniforms: {
              uTexture: { value: texture },
              uNoiseMap: { value: noiseTexture },
              uProgress: { value: 0.0 },
              uEdge: { value: CONFIG.edgeSize },
              uEdgeColor: { value: new Color(CONFIG.edgeColor) },
              uNoiseScale: { value: CONFIG.noiseScale },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
          });

          const mesh = new Mesh(geometry, material);
          mesh.userData = {
            targetProgress: 0,
            currentProgress: 0,
          };

          const angle = (i / images.length) * Math.PI * 2;
          mesh.position.set(
            Math.cos(angle) * CONFIG.radius,
            0,
            Math.sin(angle) * CONFIG.radius
          );
          mesh.lookAt(0, 0, 0);

          const tilt = degToRad(CONFIG.tiltDeg);
          mesh.rotation.z = (i % 2 ? 1 : -1) * tilt;

          group.add(mesh);
          resolve();
        });
      })
  );

  await Promise.all(meshPromises);
}

function onResize(): void {
  const { innerWidth: w, innerHeight: h } = window;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function onWheel(e: WheelEvent): void {
  targetTheta -= e.deltaY * 0.0008;
}

function onPointerDown(e: PointerEvent): void {
  isDown = true;
  lastX = e.clientX;
  renderer.domElement.style.cursor = "grabbing";
}

function onPointerMove(e: PointerEvent): void {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (!isDown) return;

  const dx = e.clientX - lastX;
  lastX = e.clientX;
  targetTheta += dx * 0.003;
}

function onPointerUp(): void {
  isDown = false;
  renderer.domElement.style.cursor = hoveredMesh ? "pointer" : "grab";
}

function onMouseLeave(): void {
  if (hoveredMesh) {
    hoveredMesh.userData.targetProgress = 0;
    hoveredMesh = null;
  }
  mouse.set(-1, -1);
}

function animate(): void {
  stats.begin();

  theta += (targetTheta - theta) * CONFIG.damping;

  const twoPi = Math.PI * 2;
  if (Math.abs(theta) > 100 * twoPi) {
    theta = theta % twoPi;
    targetTheta = targetTheta % twoPi;
  }
  group.rotation.y = theta;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(group.children);
  const newHoveredMesh =
    intersects.length > 0 ? (intersects[0].object as GalleryMesh) : null;

  if (newHoveredMesh !== hoveredMesh) {
    if (hoveredMesh) {
      hoveredMesh.userData.targetProgress = 0;
    }
    if (newHoveredMesh) {
      newHoveredMesh.userData.targetProgress = 1;
    }
    hoveredMesh = newHoveredMesh;
    renderer.domElement.style.cursor = newHoveredMesh ? "pointer" : "grab";
  }

  group.children.forEach(child => {
    if (child instanceof Mesh) {
      const mesh = child as GalleryMesh;
      const material = mesh.material as ShaderMaterial;

      const { currentProgress, targetProgress } = mesh.userData;
      const lerpFactor =
        targetProgress === 0 ? CONFIG.dissolveLerpOut : CONFIG.dissolveLerpIn;
      let newProgress =
        currentProgress + (targetProgress - currentProgress) * lerpFactor;

      if (Math.abs(newProgress - targetProgress) < 0.01) {
        newProgress = targetProgress;
      }

      mesh.userData.currentProgress = newProgress;
      material.uniforms.uProgress.value = newProgress;
      material.uniforms.uEdge.value = CONFIG.edgeSize;
      material.uniforms.uNoiseScale.value = CONFIG.noiseScale;
    }
  });

  renderer.render(scene, camera);

  stats.end();

  requestAnimationFrame(animate);
}

async function init(): Promise<void> {
  const imageFilenames = [
    "photo-1515592559813-3f7dff97e185.jpg",
    "photo-1548010514-c6575cefcdcc.jpg",
    "photo-1565138146061-e29b079736c0.jpg",
    "photo-1575489272413-cb506258027e.jpg",
    "photo-1598805116430-4a0736a3114a.jpg",
    "photo-1622120573848-718f49c359d5.jpg",
    "photo-1633157953349-75c66213ca2f.jpg",
    "photo-1633764088641-833af773e177.jpg",
    "photo-1635055658722-494d99b8aebd.jpg",
    "photo-1635967200497-6a83775bf395.jpg",
    "photo-1636006988787-83d60e19f7e4.jpg",
    "photo-1636015348041-cea51783d2ec.jpg",
    "photo-1636136607958-e2e0adfaa34c.jpg",
    "photo-1636742146345-cab95273c11a.jpg",
  ];

  const images = imageFilenames.map(filename => `/images/unsplash/${filename}`);

  window.addEventListener("resize", onResize);
  window.addEventListener("wheel", onWheel, { passive: true });
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("mouseleave", onMouseLeave);

  await createRing(images);
  animate();
}

init();
