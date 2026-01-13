import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

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
    FM26 3D Kit & Ball Viewer
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
    #viewerRow button {
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      cursor: pointer;
    }
    #viewerRow button:hover { background: rgba(255,255,255,0.10); }
    #viewerRow button.active {
      background: rgba(123,182,255,0.22);
      border-color: rgba(123,182,255,0.55);
    }

    #animBarWrap{
      position: fixed;
      left: 0; right: 0; bottom: 0;
      display: flex;
      justify-content: center;
      pointer-events: none;
      z-index: 20;
      padding: 10px;
    }
    #animBar {
      pointer-events: auto;
      width: min(820px, calc(100vw - 20px));
      background: rgba(0,0,0,0.55);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      padding: 10px;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    #animBar .label {
      font-size: 12px;
      opacity: 0.85;
      min-width: 74px;
    }
    #animBar button {
      flex: 1;
      padding: 10px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }
    #animBar button:hover { background: rgba(255,255,255,0.10); }
    #animBar button.active {
      background: rgba(123,182,255,0.22);
      border-color: rgba(123,182,255,0.55);
    }
    #animBar button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      background: rgba(255,255,255,0.04);
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

  <div style="
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  ">
    <div class="row" id="viewerRow">
      <label>Viewer</label>
      <div style="display:flex; gap:10px; flex:1;">
        <button id="viewerKit" type="button" style="flex:1;">Kit</button>
        <button id="viewerBall" type="button" style="flex:1;">Ball</button>
      </div>
    </div>
  </div>

  <div id="kitControls">
    <div class="row">
      <label>Sex</label>
      <select id="sex">
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>

    <div class="row">
      <label>Sleeves</label>
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
  </div>

  <hr />

  <div class="row">
    <label>Follow cam</label>
    <input id="followLights" type="checkbox" checked />
  </div>

  <div class="row">
    <label>Light yaw</label>
    <input id="lightYaw" type="range" min="-180" max="180" step="1" value="25" />
  </div>

  <div class="row">
    <label>Light tilt</label>
    <input id="lightPitch" type="range" min="-25" max="65" step="1" value="20" />
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
    <button id="reset" style="flex:1;">Reset Position</button>
  </div>

  <div style="margin-top:8px;">
    <input id="kit" type="file" accept=".png,.jpg,.jpeg"
      style="width:100%; padding:12px; font-size:14px; box-sizing:border-box;" />

    <div id="hintText" class="hint" style="margin-top:6px; font-size:14px;">
      Drag & drop a kit texture anywhere on the page
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

<div id="animBarWrap">
  <div id="animBar">
    <div class="label">Animation</div>
    <button id="animNone" type="button">None</button>
    <button id="animSpin" type="button">Spin</button>
    <button id="animHover" type="button">Hover</button>
    <button id="animSwing" type="button">Swing</button>
    <button id="animJumpTurn" type="button">Jump & Turn</button>
  </div>
</div>
`;

const el = (id) => document.querySelector(`#${id}`);
const rad = (deg) => (deg * Math.PI) / 180;

function setLightingDefaults50() {
  el("brightness").value = "1.5";
  el("ambient").value = "1.0";
  el("backlight").value = "1.5";
  el("exposure").value = "1.35";
  el("envInt").value = "1.0";
  el("lightYaw").value = "25";
  el("lightPitch").value = "20";
}

const BASE = `${import.meta.env.BASE_URL}models/parts/`;
const BALL_FILE = `Ball.glb`;

let viewerMode = "Kit"; // "Kit" | "Ball"

function getViewerMode() {
  return viewerMode;
}

function allowedAnimSetForMode(mode) {
  if (mode === "Kit") return new Set(["None", "Hover"]);
  return new Set(["None", "Spin", "Hover", "Swing", "JumpTurn"]);
}

function enforceAnimForMode() {
  const allowed = allowedAnimSetForMode(getViewerMode());
  if (!allowed.has(animMode)) {
    setAnimMode("None");
  }
  syncAnimUI();
}

function syncViewerUI() {
  const mode = getViewerMode();

  const kitControls = el("kitControls");
  if (kitControls) kitControls.style.display = mode === "Kit" ? "" : "none";

  const hint = el("hintText");
  if (hint) {
    hint.textContent =
      mode === "Kit"
        ? "Drag & drop a kit texture anywhere on the page"
        : "Drag & drop a ball texture anywhere on the page";
  }

  const bKit = el("viewerKit");
  const bBall = el("viewerBall");
  if (bKit && bBall) {
    bKit.classList.toggle("active", mode === "Kit");
    bBall.classList.toggle("active", mode === "Ball");
  }

  enforceAnimForMode();
}

function syncAnimUI() {
  const mode = getViewerMode();
  const allowed = allowedAnimSetForMode(mode);

  const btns = [
    ["animNone", "None"],
    ["animSpin", "Spin"],
    ["animHover", "Hover"],
    ["animSwing", "Swing"],
    ["animJumpTurn", "JumpTurn"],
  ];

  for (const [id, m] of btns) {
    const b = el(id);
    if (!b) continue;
    b.disabled = !allowed.has(m);
    b.classList.toggle("active", m === animMode);
  }
}

// -------------------- File selection rules --------------------
function pickBoots(sex) { return `${sex}Boots.glb`; }
function pickFace(sex) { return `${sex}Face.glb`; }
function pickHands(sex) { return `${sex}Hands.glb`; }
function pickKnees(sex) { return `${sex}Knees.glb`; }
function pickSocks(sex) { return `${sex}Socks.glb`; }

function pickShorts(sex, tucked) {
  return tucked === "Yes" ? `${sex}ShortsTucked.glb` : `${sex}Shorts.glb`;
}

function shouldUnderArmourBeOn(topLen) {
  return topLen !== "Long";
}
function pickUnderArmour(sex) {
  return `${sex}UnderArmour.glb`;
}

function pickTop(sex, topLen, tucked) {
  if (topLen === "None") return null;
  const isTucked = tucked === "Yes";

  if (topLen === "Short") {
    return isTucked ? `${sex}ShortSleeveTucked.glb` : `${sex}ShortSleeve.glb`;
  }
  return isTucked ? `${sex}LongSleeveTucked.glb` : `${sex}LongSleeve.glb`;
}

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

function isBallFile(filename) {
  return filename.toLowerCase() === "ball.glb";
}

function buildPartListFromUI() {
  const mode = getViewerMode();

  if (mode === "Ball") {
    return [{ file: BALL_FILE, url: BASE + BALL_FILE }];
  }

  const sex = el("sex").value;
  const topLen = el("topLen").value;
  const tucked = el("tucked").value;

  const files = [];
  files.push(pickBoots(sex));
  files.push(pickFace(sex));
  files.push(pickHands(sex));
  files.push(pickKnees(sex));

  const topFile = pickTop(sex, topLen, tucked);
  if (topFile) files.push(topFile);

  files.push(pickShorts(sex, tucked));
  files.push(pickSocks(sex));

  if (shouldUnderArmourBeOn(topLen)) files.push(pickUnderArmour(sex));

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
scene.background = null;
scene.environment = null;

const camera = new THREE.PerspectiveCamera(35, 2, 0.001, 5000);
camera.position.set(0, 1.6, 3.2);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1.4, 0);
controls.update();

const lightTarget = new THREE.Object3D();
scene.add(lightTarget);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x202020, 0.35);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.target = lightTarget;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
fillLight.target = lightTarget;
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1.1);
backLight.target = lightTarget;
scene.add(backLight);

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(draco);

let group = null;
let content = null;

let kitMaterials = [];
let uaMaterials = [];
let ballMaterials = [];

let currentTexture = null;

let mixer = null;
let clipActions = [];
let activeClip = null;

let modelRadius = 1.0;

let animMode = "None";
let animT0 = performance.now();

const basePos = new THREE.Vector3();
const baseQuat = new THREE.Quaternion();
const baseScale = new THREE.Vector3();

const tmpAxisY = new THREE.Vector3(0, 1, 0);
const tmpAxisX = new THREE.Vector3(1, 0, 0);
const tmpAxisZ = new THREE.Vector3(0, 0, 1);
const tmpQ1 = new THREE.Quaternion();
const tmpQ2 = new THREE.Quaternion();
const tmpV1 = new THREE.Vector3();
const tmpSphere = new THREE.Sphere();
const tmpBox = new THREE.Box3();

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

function pickGltfRoot(gltf) {
  const a = gltf.scene;
  if (a && a.children && a.children.length) return a;
  const b = gltf.scenes && gltf.scenes[0];
  if (b && b.children && b.children.length) return b;
  return a || b || null;
}

function fitToFrontView() {
  if (!group) return;

  group.updateMatrixWorld(true);
  tmpBox.setFromObject(group);
  if (tmpBox.isEmpty()) return;

  tmpBox.getBoundingSphere(tmpSphere);

  const center = tmpSphere.center.clone();
  const radius = Math.max(1e-6, tmpSphere.radius);
  modelRadius = radius;

  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (radius / Math.sin(fov / 2)) * 1.15;

  controls.target.copy(center);
  controls.update();

  camera.position.set(center.x, center.y + radius * 0.12, center.z + dist);

  camera.near = Math.max(0.0001, dist / 100);
  camera.far = Math.max(100, dist + radius * 200);
  camera.updateProjectionMatrix();

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
  backLight.intensity = back;

  ambientLight.intensity = amb;
  hemiLight.intensity = Math.max(0, amb * 0.6);

  renderer.toneMappingExposure = exp;

  if (group) applyEnvIntensity(group, envInt);
}

function updateLightRig() {
  const target = controls.target;
  lightTarget.position.copy(target);

  const follow = el("followLights").checked;
  const yaw = rad(parseFloat(el("lightYaw").value));
  const pitch = rad(parseFloat(el("lightPitch").value));

  const up = tmpAxisY;
  const baseDir = tmpV1;

  if (follow) {
    baseDir.copy(camera.position).sub(target).normalize();
  } else {
    baseDir.set(0, 0, 1);
  }

  baseDir.applyAxisAngle(up, yaw);

  const right = new THREE.Vector3().crossVectors(up, baseDir).normalize();
  baseDir.applyAxisAngle(right, pitch).normalize();

  const r = Math.max(1.0, modelRadius * 4.0);

  keyLight.position.copy(target).add(baseDir.clone().multiplyScalar(r));

  const fillDir = baseDir
    .clone()
    .applyAxisAngle(up, rad(-55))
    .applyAxisAngle(right, rad(-10))
    .normalize();
  fillLight.position.copy(target).add(fillDir.multiplyScalar(r * 0.9));

  const backDir = baseDir
    .clone()
    .applyAxisAngle(up, Math.PI)
    .applyAxisAngle(right, rad(10))
    .normalize();
  backLight.position.copy(target).add(backDir.multiplyScalar(r * 1.05));
}

function applyTextureToActive(tex) {
  const mode = getViewerMode();

  if (mode === "Ball") {
    for (const m of ballMaterials) {
      m.map = tex;
      m.needsUpdate = true;
    }
    return;
  }

  for (const m of kitMaterials) {
    m.map = tex;
    m.needsUpdate = true;
  }
  for (const m of uaMaterials) {
    m.map = tex;
    m.needsUpdate = true;
  }
}

function clearUserTextureFromCurrentView() {
  if (currentTexture) {
    currentTexture.dispose?.();
    currentTexture = null;
  }

  const input = el("kit");
  if (input) input.value = "";

  const mats = [...kitMaterials, ...uaMaterials, ...ballMaterials];
  for (const m of mats) {
    m.map = null;
    m.needsUpdate = true;
  }
}

function stopAllClips() {
  if (!mixer) return;
  for (const a of clipActions) a.stop();
  activeClip = null;
}

function findClipForMode(mode) {
  if (!mixer || !clipActions.length) return null;

  const want = mode.toLowerCase();
  const names = clipActions.map((a) => a.getClip().name || "");

  const pick =
    (want === "spin" && (names.find((n) => /spin|walk|run/i.test(n)) || null)) ||
    (want === "hover" && (names.find((n) => /hover|idle/i.test(n)) || null)) ||
    (want === "swing" && (names.find((n) => /swing/i.test(n)) || null)) ||
    (want === "jumpturn" && (names.find((n) => /jump|turn/i.test(n)) || null)) ||
    null;

  if (!pick) return null;
  return clipActions.find((a) => a.getClip().name === pick) || null;
}

function setAnimMode(mode) {
  const allowed = allowedAnimSetForMode(getViewerMode());
  if (!allowed.has(mode)) return;

  animMode = mode;
  animT0 = performance.now();

  const clipAction = findClipForMode(mode === "JumpTurn" ? "jumpturn" : mode);
  if (clipAction) {
    stopAllClips();
    activeClip = clipAction;
    clipAction.reset();
    clipAction.setLoop(THREE.LoopRepeat, Infinity);
    clipAction.play();
    syncAnimUI();
    return;
  }

  stopAllClips();
  syncAnimUI();
}

function applyProceduralAnimation(nowMs) {
  if (!content) return;
  if (activeClip) return;

  content.position.copy(basePos);
  content.quaternion.copy(baseQuat);
  content.scale.copy(baseScale);

  const t = (nowMs - animT0) / 1000;
  const amp = Math.max(0.005, modelRadius * 0.08);
  const rotAmp = Math.max(0.08, 0.45);

  if (animMode === "None") return;

  if (animMode === "Hover") {
    content.position.y += Math.sin(t * 2.0) * (amp * 0.6);
    tmpQ1.setFromAxisAngle(tmpAxisY, t * 0.25);
    content.quaternion.multiply(tmpQ1);
    return;
  }

  if (animMode === "Swing") {
    tmpQ1.setFromAxisAngle(tmpAxisZ, Math.sin(t * 2.2) * (rotAmp * 0.35));
    tmpQ2.setFromAxisAngle(tmpAxisY, Math.sin(t * 1.1) * (rotAmp * 0.18));
    content.quaternion.multiply(tmpQ2).multiply(tmpQ1);
    return;
  }

  if (animMode === "Spin") {
    const mode = getViewerMode();
    if (mode === "Ball") {
      tmpQ1.setFromAxisAngle(tmpAxisY, t * 1.2);
      tmpQ2.setFromAxisAngle(tmpAxisX, Math.sin(t * 0.7) * 0.10);
      content.quaternion.multiply(tmpQ1).multiply(tmpQ2);
    }
    return;
  }

  if (animMode === "JumpTurn") {
    const cycle = 1.35;
    const u = (t % cycle) / cycle;
    const y = Math.sin(Math.PI * u) * (amp * 1.15);
    content.position.y += y;

    const turn = u * Math.PI * 2.0;
    tmpQ1.setFromAxisAngle(tmpAxisY, turn);
    content.quaternion.multiply(tmpQ1);
    return;
  }
}

function tuneBallMeshes(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;

    const g = o.geometry;
    if (g) {
      g.computeVertexNormals?.();
      g.normalizeNormals?.();
      if (g.attributes?.normal) g.attributes.normal.needsUpdate = true;
    }

    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m) continue;

      if ("vertexColors" in m) m.vertexColors = false;
      if ("aoMapIntensity" in m) m.aoMapIntensity = 0.0;
      if ("metalness" in m) m.metalness = 0.0;
      if ("roughness" in m) m.roughness = 0.9;
      if ("color" in m) m.color.set(0xffffff);

      m.needsUpdate = true;
    }
  });
}

async function loadParts() {
  const parts = buildPartListFromUI();

  if (mixer) {
    stopAllClips();
    mixer.uncacheRoot?.(group);
  }
  mixer = null;
  clipActions = [];
  activeClip = null;

  if (group) {
    scene.remove(group);
    disposeObject3D(group);
  }

  group = new THREE.Group();
  group.name = "FM26_ASSETS";
  scene.add(group);

  content = new THREE.Group();
  content.name = "FM26_CONTENT";
  group.add(content);

  kitMaterials = [];
  uaMaterials = [];
  ballMaterials = [];

  const gatheredClips = [];

  for (const p of parts) {
    try {
      const gltf = await new Promise((resolve, reject) =>
        loader.load(p.url, resolve, undefined, reject)
      );

      const root = pickGltfRoot(gltf);
      if (!root) {
        alert(`Loaded ${p.file} but it contained no scene.`);
        return;
      }

      if (isBallFile(p.file)) tuneBallMeshes(root);

      content.add(root);

      const mats = collectMaterialsFromScene(root);
      if (isBallFile(p.file)) ballMaterials.push(...mats);
      if (isKitClothingFile(p.file)) kitMaterials.push(...mats);
      if (isUnderArmourFile(p.file)) uaMaterials.push(...mats);

      if (gltf.animations && gltf.animations.length) {
        for (const c of gltf.animations) gatheredClips.push(c);
      }
    } catch (e) {
      console.error("FAILED to load:", p.file, "from", p.url, e);
      alert(`Failed to load:\n${p.file}\n\nCheck DevTools Console (F12)`);
      return;
    }
  }

  updateLightingFromUI();

  if (gatheredClips.length) {
    mixer = new THREE.AnimationMixer(content);
    clipActions = gatheredClips.map((clip) => mixer.clipAction(clip));
  }

  if (currentTexture) applyTextureToActive(currentTexture);

  fitToFrontView();

  content.position.set(0, 0, 0);
  content.quaternion.identity();
  content.scale.set(1, 1, 1);

  basePos.copy(content.position);
  baseQuat.copy(content.quaternion);
  baseScale.copy(content.scale);

  enforceAnimForMode();
}

function applyTextureFromFile(file) {
  const url = URL.createObjectURL(file);
  const tex = new THREE.TextureLoader().load(url, () => URL.revokeObjectURL(url));
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  currentTexture = tex;
  applyTextureToActive(tex);
}

function resizeToDisplaySize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const need = canvas.width !== w || canvas.height !== h;
  if (need) renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

let lastFrame = performance.now();
function render(now) {
  resizeToDisplaySize();
  updateLightRig();

  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  if (mixer && activeClip) mixer.update(dt);
  applyProceduralAnimation(now);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

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
  applyTextureFromFile(f);
}

window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length) handleDropFiles(files);
});

// -------------------- UI events --------------------
el("reload").addEventListener("click", async () => {
  clearUserTextureFromCurrentView();
  await loadParts();
});

el("reset").addEventListener("click", resetPosition);

el("kit").addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) applyTextureFromFile(f);
});

el("viewerKit").addEventListener("click", async () => {
  if (viewerMode === "Kit") return;
  viewerMode = "Kit";
  syncViewerUI();
  await loadParts();
});

el("viewerBall").addEventListener("click", async () => {
  if (viewerMode === "Ball") return;
  viewerMode = "Ball";
  syncViewerUI();
  await loadParts();
});

for (const id of ["sex", "topLen", "tucked"]) {
  el(id).addEventListener("change", () => loadParts());
}

for (const id of [
  "followLights",
  "lightYaw",
  "lightPitch",
  "brightness",
  "ambient",
  "backlight",
  "exposure",
  "envInt",
]) {
  el(id).addEventListener("input", () => {
    updateLightingFromUI();
    updateLightRig();
  });
}

el("animNone").addEventListener("click", () => setAnimMode("None"));
el("animSpin").addEventListener("click", () => setAnimMode("Spin"));
el("animHover").addEventListener("click", () => setAnimMode("Hover"));
el("animSwing").addEventListener("click", () => setAnimMode("Swing"));
el("animJumpTurn").addEventListener("click", () => setAnimMode("JumpTurn"));

// -------------------- Startup --------------------
setLightingDefaults50();
updateLightingFromUI();
syncViewerUI();
setAnimMode("None");
await loadParts();
requestAnimationFrame(render);
