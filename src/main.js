import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

document.querySelector("#app").innerHTML = `
  <canvas id="c"></canvas>

<div id="hud">

  <div style="
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  ">
    FM26 3D Kit Viewer
  </div>

  <style>
    #hud a {
      color: #7bb6ff;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    #hud a:hover { color: #a7ceff; }
    #hud a:visited { color: #b08cff; }
    #hud a:focus-visible {
      outline: 2px solid rgba(123, 182, 255, 0.6);
      outline-offset: 2px;
      border-radius: 4px;
    }
  </style>

  <div style="
    margin-top: 0px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    text-align: center;
    font-size: 14px;
    opacity: 0.75;
  ">
    Made by <a href="https://sortitoutsi.net/user/profile/1317745">That1GuyTim</a>
    for <a href="https://sortitoutsi.net">sortitoutsi.net</a>
  </div>

  <div class="row">
    <label>Sex</label>
    <select id="sex">
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
  </div>

  <div class="row">
    <label>Top</label>
    <select id="topLen">
      <option value="Short">Short sleeve</option>
      <option value="Long">Long sleeve</option>
      <option value="None">None</option>
    </select>
  </div>

  <div class="row">
    <label>Tucked</label>
    <select id="tucked">
      <option value="No" selected>No</option>
      <option value="Yes">Yes</option>
    </select>
  </div>

  <hr />

  <div class="row">
    <label>Follow cam</label>
    <input id="followLights" type="checkbox" checked />
  </div>

  <div class="row">
    <label>Brightness</label>
    <input id="brightness" type="range" min="0" max="3" step="0.05" value="1.5" />
  </div>

  <div class="row">
    <label>Ambient</label>
    <input id="ambient" type="range" min="0" max="2" step="0.05" value="1.0" />
  </div>

  <div class="row">
    <label>Back light</label>
    <input id="backlight" type="range" min="0" max="3" step="0.05" value="1.5" />
  </div>

  <div class="row">
    <label>Exposure</label>
    <input id="exposure" type="range" min="0.2" max="2.5" step="0.05" value="1.35" />
  </div>

  <div class="row">
    <label>Env int.</label>
    <input id="envInt" type="range" min="0" max="2" step="0.05" value="1.0" />
  </div>

  <div class="row" style="display:flex; gap:10px;">
    <button id="reload" style="flex:1;">Reload Parts</button>
    <button id="reset" style="flex:1;">Reset position</button>
  </div>

  <div style="margin-top:8px;">
    <input id="kit" type="file" accept=".png,.jpg,.jpeg"
      style="width:100%; padding:12px; font-size:14px; box-sizing:border-box;" />

    <div class="hint" style="margin-top:6px; font-size:14px;">
      Drag & drop a kit texture PNG anywhere on the page
    </div>
  </div>

  <div style="
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.15);
    font-size: 12px;
    opacity: 0.8;
  ">
    <span>Left Click to Rotate</span>
    <span>Right Click to Pan</span>
  </div>

  <div style="
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.15);
    font-size: 12px;
    opacity: 0.8;
  ">FM26 Assets © Sports Interactive / Sega
  </div>
</div>
`;

const el = (id) => document.querySelector(`#${id}`);

function setLightingDefaults50() {
  el("brightness").value = "1.5";
  el("ambient").value = "1.0";
  el("backlight").value = "1.5";
  el("exposure").value = "1.35";
  el("envInt").value = "1.0";
}

const BASE = `${import.meta.env.BASE_URL}models/parts/`;
const HDR_URL = `${import.meta.env.BASE_URL}env/studio.hdr`;

// -------------------- File selection rules (fixed options) --------------------
// Uses your NEW renamed GLB files, e.g.:
// MaleBoots.glb, FemaleBoots.glb
// MaleShortSleeve.glb, FemaleShortSleeveTucked.glb, etc.

function pickBoots(sex) {
  return `${sex}Boots.glb`;
}
function pickFace(sex) {
  return `${sex}Face.glb`;
}
function pickHands(sex) {
  return `${sex}Hands.glb`;
}
function pickKnees(sex) {
  return `${sex}Knees.glb`;
}
function pickSocks(sex) {
  return `${sex}Socks.glb`;
}

// Shorts always included, but variant follows "Tucked"
function pickShorts(sex, tucked) {
  return tucked === "Yes" ? `${sex}ShortsTucked.glb` : `${sex}Shorts.glb`;
}

// UnderArmour ON unless Long sleeves selected
function shouldUnderArmourBeOn(topLen) {
  return topLen !== "Long";
}
function pickUnderArmour(sex) {
  return `${sex}UnderArmour.glb`;
}

// Top selection uses NEW filenames:
// MaleShortSleeve.glb / MaleShortSleeveTucked.glb
// MaleLongSleeve.glb  / MaleLongSleeveTucked.glb
// Same pattern for Female...
function pickTop(sex, topLen, tucked) {
  if (topLen === "None") return null;

  const isTucked = tucked === "Yes";

  if (topLen === "Short") {
    return isTucked ? `${sex}ShortSleeveTucked.glb` : `${sex}ShortSleeve.glb`;
  }

  // Long sleeve
  return isTucked ? `${sex}LongSleeveTucked.glb` : `${sex}LongSleeve.glb`;
}

// With renamed files, kit-clothing parts are these categories:
function isKitClothingFile(filename) {
  return (
    filename.includes("ShortSleeve") ||
    filename.includes("LongSleeve") ||
    filename.includes("Shorts") ||
    filename.includes("Socks")
  );
}

function isUnderArmourFile(filename) {
  return filename.includes("UnderArmour");
}

function buildPartListFromUI() {
  const sex = el("sex").value;
  const topLen = el("topLen").value;
  const tucked = el("tucked").value;

  const files = [];

  // Always ON (hidden)
  files.push(pickBoots(sex));
  files.push(pickFace(sex));
  files.push(pickHands(sex));
  files.push(pickKnees(sex));

  // Top (can be none)
  const topFile = pickTop(sex, topLen, tucked);
  if (topFile) files.push(topFile);

  // Shorts always present; variant follows tucked
  files.push(pickShorts(sex, tucked));

  // Socks always ON
  files.push(pickSocks(sex));

  // UnderArmour conditional (auto rule)
  if (shouldUnderArmourBeOn(topLen)) {
    files.push(pickUnderArmour(sex));
  }

  return files.map((f) => ({ file: f, url: BASE + f }));
}

// -------------------- Three.js setup --------------------
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = parseFloat(el("exposure").value);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, 2, 0.1, 300);
camera.position.set(0, 1.6, 3.2);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1.4, 0);
controls.update();

// Light target (keep at orbit target)
const lightTarget = new THREE.Object3D();
scene.add(lightTarget);

// Ambient + key/fill/back
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.target = lightTarget;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
fillLight.target = lightTarget;
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1.1);
backLight.target = lightTarget;
scene.add(backLight);

// Static light positions (when Follow cam is OFF)
const staticKeyPos = new THREE.Vector3(2.5, 4.0, 3.0);
const staticFillPos = new THREE.Vector3(-2.5, 2.0, 2.0);
const staticBackPos = new THREE.Vector3(0.0, 3.0, -4.0);

// Camera-relative offsets (when Follow cam is ON)
const keyOffsetCam = new THREE.Vector3(1.4, 1.2, 0.0);
const fillOffsetCam = new THREE.Vector3(-1.4, 0.7, 0.0);

// Loader (+ Draco)
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(draco);

// HDR environment
let envMap = null;
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

async function loadHDREnvironment() {
  try {
    const hdr = await new Promise((resolve, reject) => {
      new RGBELoader().load(HDR_URL, resolve, undefined, reject);
    });

    const rt = pmrem.fromEquirectangular(hdr);
    envMap = rt.texture;

    hdr.dispose();
    scene.environment = envMap;
    // keep background transparent; enable HDR background if desired:
    // scene.background = envMap;

    rt.dispose?.();
  } catch (e) {
    console.warn("HDR load failed (continuing without HDR):", e);
  }
}

// Track loaded meshes/materials
let group = null;
let kitMaterials = [];
let uaMaterials = [];
let currentKitTexture = null;

function disposeObject3D(obj) {
  obj.traverse((o) => {
    if (o.isMesh) {
      o.geometry?.dispose?.();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) m.dispose?.();
      }
    }
  });
}

function collectMaterialsFromScene(root) {
  const mats = [];
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const arr = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of arr) mats.push(m);
  });
  return mats;
}

function applyEnvIntensity(root, intensity) {
  root?.traverse?.((o) => {
    if (!o.isMesh || !o.material) return;
    const arr = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of arr) {
      if ("envMapIntensity" in m) {
        m.envMapIntensity = intensity;
        m.needsUpdate = true;
      }
    }
  });
}

function computeBounds(root) {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) {
    return {
      center: new THREE.Vector3(0, 1.4, 0),
      size: new THREE.Vector3(1, 2, 1),
      maxDim: 2.0,
    };
  }
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  return { center, size, maxDim };
}

function fitToFrontView() {
  if (!group) return;

  const { center, maxDim } = computeBounds(group);

  // "Front" view = camera in +Z direction looking at target
  const dist = maxDim * 1.7;

  controls.target.copy(center);
  controls.update();

  camera.position.set(center.x, center.y + maxDim * 0.25, center.z + dist);
  camera.near = Math.max(0.01, dist / 100);
  camera.far = dist * 12;
  camera.updateProjectionMatrix();

  // Persist this as the reset state too
  controls.saveState();
}

function resetPosition() {
  controls.reset();
  fitToFrontView();
}

function updateLightingFromUI() {
  const bright = parseFloat(el("brightness").value);
  const amb = parseFloat(el("ambient").value);
  const back = parseFloat(el("backlight").value);
  const exp = parseFloat(el("exposure").value);
  const envInt = parseFloat(el("envInt").value);

  keyLight.intensity = 1.15 * bright;
  fillLight.intensity = 0.55 * bright;
  ambientLight.intensity = amb;
  backLight.intensity = back;

  renderer.toneMappingExposure = exp;

  if (group) applyEnvIntensity(group, envInt);
}

function updateLightRig() {
  lightTarget.position.copy(controls.target);

  const follow = el("followLights").checked;

  if (!follow) {
    keyLight.position.copy(staticKeyPos);
    fillLight.position.copy(staticFillPos);
    backLight.position.copy(staticBackPos);
    return;
  }

  const q = camera.quaternion;

  const keyPos = keyOffsetCam.clone().applyQuaternion(q).add(camera.position);
  const fillPos = fillOffsetCam.clone().applyQuaternion(q).add(camera.position);

  keyLight.position.copy(keyPos);
  fillLight.position.copy(fillPos);

  // Back/rim light placed behind model relative to camera
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  const backPos = controls.target
    .clone()
    .add(dir.multiplyScalar(3.0))
    .add(new THREE.Vector3(0, 1.5, 0));

  backLight.position.copy(backPos);
}

async function loadParts() {
  const parts = buildPartListFromUI();

  if (group) {
    scene.remove(group);
    disposeObject3D(group);
  }
  group = new THREE.Group();
  group.name = "FM26_PARTS";
  scene.add(group);

  kitMaterials = [];
  uaMaterials = [];

  for (const p of parts) {
    try {
      const gltf = await new Promise((resolve, reject) => loader.load(p.url, resolve, undefined, reject));
      group.add(gltf.scene);

      const mats = collectMaterialsFromScene(gltf.scene);
      if (isKitClothingFile(p.file)) kitMaterials.push(...mats);
      if (isUnderArmourFile(p.file)) uaMaterials.push(...mats);
    } catch (e) {
      console.error("FAILED to load:", p.file, "from", p.url, e);
      alert(`Failed to load:\n${p.file}\n\nCheck DevTools Console (F12)`);
      return;
    }
  }

  // Apply env intensity to newly loaded meshes
  updateLightingFromUI();

  // Reapply kit texture after reload (ALWAYS includes UA if loaded)
  if (currentKitTexture) {
    for (const m of kitMaterials) {
      m.map = currentKitTexture;
      m.needsUpdate = true;
    }
    for (const m of uaMaterials) {
      m.map = currentKitTexture;
      m.needsUpdate = true;
    }
  }

  fitToFrontView();
}

function applyKitTextureFromFile(file) {
  const url = URL.createObjectURL(file);
  const tex = new THREE.TextureLoader().load(url, () => URL.revokeObjectURL(url));
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  currentKitTexture = tex;

  for (const m of kitMaterials) {
    m.map = tex;
    m.needsUpdate = true;
  }
  for (const m of uaMaterials) {
    m.map = tex;
    m.needsUpdate = true;
  }
}

function resizeToDisplaySize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const need = canvas.width !== w || canvas.height !== h;
  if (need) renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function render() {
  resizeToDisplaySize();
  updateLightRig(); // rotate lights with camera
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// -------------------- Drag & Drop kit texture --------------------
function isImageFile(file) {
  if (!file) return false;
  const t = (file.type || "").toLowerCase();
  if (t.startsWith("image/")) return true;
  const name = (file.name || "").toLowerCase();
  return name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg");
}

function handleDropFiles(files) {
  if (!files || !files.length) return;
  const f = files[0];
  if (!isImageFile(f)) return;
  applyKitTextureFromFile(f);
}

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});
window.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length) handleDropFiles(files);
});

// -------------------- UI events --------------------
el("reload").addEventListener("click", loadParts);
el("reset").addEventListener("click", resetPosition);

el("kit").addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) applyKitTextureFromFile(f);
});

// Change inputs that affect parts
for (const id of ["sex", "topLen", "tucked"]) {
  el(id).addEventListener("change", () => loadParts());
}

// Lighting controls
el("followLights").addEventListener("change", () => {
  updateLightRig();
});
for (const id of ["brightness", "ambient", "backlight", "exposure", "envInt"]) {
  el(id).addEventListener("input", () => updateLightingFromUI());
}

// -------------------- Startup --------------------
setLightingDefaults50();
updateLightingFromUI();
await loadHDREnvironment();
await loadParts();
render();
