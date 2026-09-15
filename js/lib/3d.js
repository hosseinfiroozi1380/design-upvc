// /js/lib/3d.js
import * as THREE from
  "https://esm.sh/three@0.160.0";
import { OrbitControls } from
  "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { SVGLoader } from
  "https://esm.sh/three@0.160.0/examples/jsm/loaders/SVGLoader.js";
let preview3DAnimation = null;
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let mainGroup = null;
let container = null;
let animationId = null;
let currentSVGString = "";
let currentModelId = null;
let movingLight = null;
let time = 0;
let floorGrid = null;
let pvcWhiteMat = null;
let glassPremium = null;
let darkMetalMat = null;
let handleMat = null;
let hingeMat = null;
let materialsInitialized = false;
let currentPVCColor = 0xf8fafc;
let currentGlassColor = 0x0564bc;
// متریال‌ها
function initMaterials() {
  if (materialsInitialized) return;
  pvcWhiteMat = new THREE.MeshStandardMaterial({
    color: currentPVCColor,
    roughness: 0.28,
    metalness: 0.12,
  });
  glassPremium = new THREE.MeshPhysicalMaterial({
    color: currentGlassColor,
    roughness: 0.12,
    metalness: 0.05,
    transmission: 0.15,
    transparent: true,
    opacity: 0.58,
    side: THREE.DoubleSide,
  });
  darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2c3e50,
    roughness: 0.3,
    metalness: 0.7,
  });
  handleMat = new THREE.MeshStandardMaterial({
    color: 0xeef4ff,
    roughness: 0.2,
    metalness: 0.45,
  });
  hingeMat = new THREE.MeshStandardMaterial({
    color: 0xd0dce8,
    roughness: 0.3,
    metalness: 0.5,
  });
  materialsInitialized = true;
}
function refreshMaterials() {
  if (pvcWhiteMat) {
    pvcWhiteMat.color.setHex(currentPVCColor);
    pvcWhiteMat.needsUpdate = true;
  }
  if (glassPremium) {
    glassPremium.color.setHex(currentGlassColor);
    glassPremium.needsUpdate = true;
  }
}
// رنگ SVG
function cssColorToHex(cssColor) {
  if (!cssColor) {
    return 0xf8fafc;
  }
  cssColor = String(cssColor).trim().toLowerCase();
  const namedColors = {
    white: 0xffffff,
    black: 0x000000,
    red: 0xff0000,
    green: 0x00ff00,
    blue: 0x0000ff,
    yellow: 0xffff00,
    cyan: 0x00ffff,
    magenta: 0xff00ff,
    gray: 0x808080,
    grey: 0x808080,
    silver: 0xc0c0c0,
    gold: 0xffd700,
    orange: 0xffa500,
    purple: 0x800080,
  };
  if (namedColors[cssColor] !== undefined) {
    return namedColors[cssColor];
  }
  if (cssColor.startsWith("#")) {
    const hex = cssColor.substring(1);
    if (hex.length === 3) {
      return parseInt(
        hex[0] + hex[0] +
        hex[1] + hex[1] +
        hex[2] + hex[2],
        16
      );
    }
    if (hex.length === 6) {
      return parseInt(hex, 16);
    }
  }
  const rgbMatch = cssColor.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return (r << 16) | (g << 8) | b;
  }
  return 0xf8fafc;
}
// نورپردازی
function setupLights() {
  const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0xdce6f2,
    1.8
  );
  scene.add(ambientLight);
  const mainLight = new THREE.DirectionalLight(
    0xffffff,
    2.2
  );
  mainLight.position.set(
    1000,
    1500,
    1200
  );
  mainLight.castShadow = false;
  scene.add(mainLight);
  const fillLight = new THREE.DirectionalLight(
    0xffffff,
    1.0
  );
  fillLight.position.set(
    -1000,
    700,
    600
  );
  scene.add(fillLight);
  const backLight = new THREE.DirectionalLight(
    0xffffff,
    0.8
  );
  backLight.position.set(
    0,
    700,
    -1200
  );
  scene.add(backLight);
  movingLight = new THREE.PointLight(
    0xffffff,
    0.45
  );
  movingLight.position.set(
    500,
    500,
    800
  );
  scene.add(movingLight);
}
// راه‌اندازی Three.js
export function init3D(containerId = "3d") {
  container = document.getElementById(containerId);
  if (!container) {
    console.warn(
      `عنصر #${containerId} برای نمایش سه‌بعدی پیدا نشد`
    );
    return false;
  }
  // اگر قبلاً ساخته شده
  if (renderer && scene && camera) {
    resize3D();
    return true;
  }
  initMaterials();
  const width = Math.max(container.clientWidth, 300);
  const height = Math.max(container.clientHeight, 300);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);
  camera = new THREE.PerspectiveCamera(
    35,
    width / height,
    0.1,
    100000
  );
  camera.position.set(
    1200,
    700,
    1800
  );
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(
    width,
    height
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = "";
  container.appendChild(
    renderer.domElement
  );
  // کنترل ماوس
  controls = new OrbitControls(
    camera,
    renderer.domElement
  );
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.8;
  controls.panSpeed = 0.8;
  controls.enableRotate = true;
  controls.screenSpacePanning = true;
  controls.minDistance = 50;
  controls.maxDistance = 100000;
  controls.target.set(0, 0, 0);
  setupLights();
  // کف خیلی ساده برای عمق دید
  floorGrid = new THREE.GridHelper(
    5000,
    50,
    0xb8bec6,
    0xd1d5db
  );
  floorGrid.position.y = -1;
  floorGrid.material.transparent = true;
  floorGrid.material.opacity = 0.25;
  scene.add(floorGrid);
  window.addEventListener(
    "resize",
    resize3D
  );
  startAnimation();
  return true;
}
// Resize
export function resize3D() {
  if (!container || !camera || !renderer) {
    return;
  }
  const width = Math.max(
    container.clientWidth,
    1
  );
  const height = Math.max(
    container.clientHeight,
    1
  );
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(
    width,
    height,
    false
  );
}
// انیمیشن
function startAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  function animate() {
    animationId = requestAnimationFrame(
      animate
    );
    // time += 0.01;
    // if (movingLight) {
    //   movingLight.position.x =
    //     500 + Math.sin(time * 0.7) * 250;
    //   movingLight.position.z =
    //     700 + Math.cos(time * 0.6) * 250;
    // }
    if (controls) {
      controls.update();
    }
    if (
      renderer &&
      scene &&
      camera
    ) {
      renderer.render(
        scene,
        camera
      );
    }
  }
  animate();
}
// حذف مدل قبلی
function clearPreviousModel() {
  if (!mainGroup || !scene) {
    return;
  }
  scene.remove(mainGroup);
  mainGroup.traverse((child) => {
    if (!child.isMesh) {
      return;
    }
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (
      child.material &&
      child.material !== pvcWhiteMat &&
      child.material !== glassPremium &&
      child.material !== darkMetalMat &&
      child.material !== handleMat &&
      child.material !== hingeMat
    ) {
      if (Array.isArray(child.material)) {
        child.material.forEach(
          material => material.dispose()
        );
      } else {
        child.material.dispose();
      }
    }
  });
  mainGroup = null;
}
// تشخیص نوع قطعه
function getPathType(id) {
  const value = String(id || "").toLowerCase();
  if (value.includes("flat")) {
    return "glass";
  }
  if (
    value === "mainframe" ||
    value === "windowframe" ||
    value === "doorframe" ||
    value.includes("mullian") ||
    value.includes("coupling")
  ) {
    return "frame";
  }
  if (
    value === "handle" ||
    value === "handlehand" ||
    value === "handlecircle"
  ) {
    return "handle";
  }
  if (value.includes("hinge")) {
    return "hinge";
  }
  if (value === "panelitem") {
    return "panel";
  }
  return "other";
}
// پیدا کردن گروه بازشو در ساختار SVG
function getOpeningInfo(path) {
  let node =
    path.userData?.node || null;
  while (node) {
    const id =
      String(node.id || "").toLowerCase();
    if (
      id === "window_simple_right" ||
      id === "window_simple_left" ||
      id === "window_simple_top" ||
      id === "window_simple_bottom" ||
      id === "window_dual_right" ||
      id === "window_dual_left" ||
      id === "window_radial_right" ||
      id === "window_radial_left" ||
      id === "window_radial_top" ||
      id === "window_radial_bottom" ||
      id === "window_simple_right_nohandle" ||
      id === "window_simple_left_nohandle"
    ) {
      return {
        type: id,
        node: node
      };
    }
    node = node.parentNode;
  }
  return null;
}
// ساخت محور واقعی لولا بدون جابه‌جا کردن لنگه
function setupOpeningPivot(
  mainGroup,
  sashGroup
) {
  if (
    !mainGroup ||
    !sashGroup
  ) {
    return null;
  }
  const type =
    String(
      sashGroup.userData?.openingType || ""
    ).toLowerCase();
  if (!type) {
    return null;
  }
  // محدوده لنگه
  const box =
    new THREE.Box3().setFromObject(
      sashGroup
    );
  if (box.isEmpty()) {
    return null;
  }
  const center =
    box.getCenter(
      new THREE.Vector3()
    );
  const min =
    box.min.clone();
  const max =
    box.max.clone();
  // محور لولا در مختصات جهانی
  const pivotWorld =
    new THREE.Vector3();
  // راست بازشو:
  // لولا سمت چپ لنگه
  if (
    type.includes("right")
  ) {
    pivotWorld.set(
      min.x,
      center.y,
      center.z
    );
  }
  // چپ بازشو:
  // لولا سمت راست لنگه
  else if (
    type.includes("left")
  ) {
    pivotWorld.set(
      max.x,
      center.y,
      center.z
    );
  }
  // بالا بازشو:
  // لولا پایین لنگه
  else if (
    type.includes("top")
  ) {
    pivotWorld.set(
      center.x,
      min.y,
      center.z
    );
  }
  // پایین بازشو:
  // لولا بالای لنگه
  else if (
    type.includes("bottom")
  ) {
    pivotWorld.set(
      center.x,
      max.y,
      center.z
    );
  }
  else {
    return null;
  }
  // تبدیل محور جهانی به مختصات local فریم اصلی
  const pivotLocal =
    mainGroup.worldToLocal(
      pivotWorld.clone()
    );
  // ساخت گروه محور
  const pivotGroup =
    new THREE.Group();
  pivotGroup.name =
    "previewPivot";
  pivotGroup.userData.openingType =
    type;
  // لنگه اول از parent قبلی جدا می‌شود
  // ولی world transform آن کاملاً حفظ می‌شود.
  const worldPosition =
    new THREE.Vector3();
  const worldQuaternion =
    new THREE.Quaternion();
  const worldScale =
    new THREE.Vector3();
  sashGroup.updateWorldMatrix(
    true,
    false
  );
  sashGroup.getWorldPosition(
    worldPosition
  );
  sashGroup.getWorldQuaternion(
    worldQuaternion
  );
  sashGroup.getWorldScale(
    worldScale
  );
  // pivot در mainGroup
  pivotGroup.position.copy(
    pivotLocal
  );
  mainGroup.add(
    pivotGroup
  );
  // لنگه را داخل pivot قرار بده
  pivotGroup.add(
    sashGroup
  );
  // تبدیل world transform لنگه
  // به local transform نسبت به pivot
  const localPosition =
    pivotGroup.worldToLocal(
      worldPosition.clone()
    );
  sashGroup.position.copy(
    localPosition
  );
  const inverseParentQuaternion =
    pivotGroup
      .getWorldQuaternion(
        new THREE.Quaternion()
      )
      .invert();
  sashGroup.quaternion.copy(
    inverseParentQuaternion
      .multiply(
        worldQuaternion
      )
  );
  const parentWorldScale =
    pivotGroup.getWorldScale(
      new THREE.Vector3()
    );
  sashGroup.scale.set(
    worldScale.x /
    (parentWorldScale.x || 1),
    worldScale.y /
    (parentWorldScale.y || 1),
    worldScale.z /
    (parentWorldScale.z || 1)
  );
  // اطلاعات Preview
  pivotGroup.userData.axis =
    (
      type.includes("top") ||
      type.includes("bottom")
    )
      ? "x"
      : "y";
  pivotGroup.userData.direction =
    type.includes("right")
      ? "right"
      : type.includes("left")
        ? "left"
        : type.includes("top")
          ? "top"
          : type.includes("bottom")
            ? "bottom"
            : null;
  pivotGroup.userData.closedRotation =
    0;
  pivotGroup.userData.previewReady =
    true;
  return pivotGroup;
}
// ساخت مدل سه‌بعدی
async function build3DFromSVG(
  svgString,
  modelId = null
) {
  if (!svgString || !scene) {
    return false;
  }
  try {
    const loader = new SVGLoader();
    const svgData = loader.parse(
      svgString
    );
    const group = new THREE.Group();
    const openingGroups = new Map();
    initMaterials();
    refreshMaterials();
    for (const path of svgData.paths) {

      const origId =
        path.userData?.id ||
        path.userData?.node?.id ||
        "";

      console.log("3D SVG PATH:", origId);

      const type =
        getPathType(origId);

      const openingInfo =
        getOpeningInfo(path);

      if (type === "other") {
        continue;
      }
      let svgColor = null;
      if (path.color) {
        svgColor = path.color.getHex();
      }
      if (
        path.userData?.style?.fill
      ) {
        const fill =
          path.userData.style.fill;
        if (
          fill !== "none" &&
          !fill.includes("url(")
        ) {
          svgColor =
            cssColorToHex(fill);
        }
      }
      let material =
        pvcWhiteMat;
      let depth = 60;
      let zOffset = 0;
      // شیشه
      if (type === "glass") {
        material = new THREE.MeshStandardMaterial({
          color: 0x2196f3,
          roughness: 0.18,
          metalness: 0.02,
          transparent: true,
          opacity: 0.72,
          side: THREE.DoubleSide
        });
        depth = 10;
        zOffset = 10;
      }
      // فریم
      else if (type === "frame") {
        if (svgColor) {
          material =
            new THREE.MeshStandardMaterial({
              color: svgColor,
              roughness: 0.28,
              metalness: 0.12,
            });
        }
        depth = 60;
        zOffset = 0;
      }
      // دستگیره
      else if (type === "handle") {
        material = handleMat;
        depth = 45;
        zOffset = 35;
      }
      // لولا
      else if (type === "hinge") {
        material = hingeMat;
        depth = 24;
        zOffset = 30;
      }
      // پنل
      else if (type === "panel") {
        if (svgColor) {
          material =
            new THREE.MeshStandardMaterial({
              color: svgColor,
              roughness: 0.28,
              metalness: 0.12,
            });
        }
        depth = 28;
        zOffset = 10;
      }
      const shapes =
        SVGLoader.createShapes(path);
      for (const shape of shapes) {
        const extrudeSettings = {
          steps: 1,
          depth: depth,
          bevelEnabled: false,
        };
        const geometry =
          new THREE.ExtrudeGeometry(
            shape,
            extrudeSettings
          );
        geometry.computeVertexNormals();
        geometry.translate(
          0,
          0,
          -depth / 2
        );
        const mesh =
        new THREE.Mesh(
            geometry,
            material
        );
    
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    
    mesh.position.z =
        zOffset;
    
    mesh.userData.svgId =
        origId;
    
// ========================================================
// مرز فریم‌ها
// ========================================================
if (type === "frame") {

  const pathId =
    String(origId).toLowerCase();

const isMainFrame =
    pathId === "mainframe";

const isWindowFrame =
    pathId === "windowframe";

  const edgeGeometry =
      new THREE.EdgesGeometry(
          geometry,
          15
      );

  const positions =
      edgeGeometry.attributes.position.array;

  const filteredPositions = [];

  // ====================================================
  // فریم اصلی:
  // فقط مرزهای داخلی
  // مرز بیرونی حذف می‌شود
  // ====================================================
  if (isWindowFrame) {

      const geometryBox =
          new THREE.Box3().setFromBufferAttribute(
              geometry.attributes.position,
              0
          );

      const minX = geometryBox.min.x;
      const maxX = geometryBox.max.x;
      const minY = geometryBox.min.y;
      const maxY = geometryBox.max.y;

      const margin = 1;

      for (
          let i = 0;
          i < positions.length;
          i += 6
      ) {

          const x1 = positions[i];
          const y1 = positions[i + 1];

          const x2 = positions[i + 3];
          const y2 = positions[i + 4];

          const isOuterEdge =
              (
                  Math.abs(x1 - minX) < margin &&
                  Math.abs(x2 - minX) < margin
              ) ||
              (
                  Math.abs(x1 - maxX) < margin &&
                  Math.abs(x2 - maxX) < margin
              ) ||
              (
                  Math.abs(y1 - minY) < margin &&
                  Math.abs(y2 - minY) < margin
              ) ||
              (
                  Math.abs(y1 - maxY) < margin &&
                  Math.abs(y2 - maxY) < margin
              );

          if (!isOuterEdge) {

              filteredPositions.push(
                  x1,
                  y1,
                  positions[i + 2],

                  x2,
                  y2,
                  positions[i + 5]
              );
          }
      }

  } else {

      // =================================================
      // مولین + فریم پنجره
      // مرز آن‌ها نمایش داده می‌شود
      // =================================================

      for (
          let i = 0;
          i < positions.length;
          i += 6
      ) {

          filteredPositions.push(
              positions[i],
              positions[i + 1],
              positions[i + 2],

              positions[i + 3],
              positions[i + 4],
              positions[i + 5]
          );
      }
  }

  // ====================================================
  // ساخت خط مرزی
  // ====================================================

  if (filteredPositions.length > 0) {

      const filteredGeometry =
          new THREE.BufferGeometry();

      filteredGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(
              filteredPositions,
              3
          )
      );

      const edgeMaterial =
      new THREE.LineBasicMaterial({
        color: 0x9ca3af,
        transparent: true,
        opacity: 0.45
    });
      const edgeLines =
          new THREE.LineSegments(
              filteredGeometry,
              edgeMaterial
          );

      edgeLines.renderOrder = 10;

      mesh.add(edgeLines);
  }
}
        // قرار دادن قطعات بازشو در گروه مخصوص خودشان
        if (openingInfo) {
          let sashGroup =
            openingGroups.get(
              openingInfo.node
            );
          if (!sashGroup) {
            sashGroup =
              new THREE.Group();
            sashGroup.name =
              openingInfo.type;
            sashGroup.userData.openingType =
              openingInfo.type;
            openingGroups.set(
              openingInfo.node,
              sashGroup
            );
            group.add(
              sashGroup
            );
          }
          sashGroup.add(
            mesh
          );
        } else {
          // فریم اصلی و قطعات ثابت
          group.add(
            mesh
          );
        }
      }
    }
    // SVG و Paper.js محور Y متفاوت دارند
    group.scale.set(
      1,
      -1,
      1
    );
    group.updateMatrixWorld(true);
    // ساخت محور لولای بازشوها
    // بدون تغییر موقعیت خود لنگه
    for (
      const sashGroup
      of openingGroups.values()
    ) {
      setupOpeningPivot(
        group,
        sashGroup
      );
    }
    group.updateMatrixWorld(true);
    // Center
    let box =
      new THREE.Box3().setFromObject(
        group
      );
    if (box.isEmpty()) {
      console.warn(
        "مدل سه‌بعدی خالی است"
      );
      return false;
    }
    const center =
      box.getCenter(
        new THREE.Vector3()
      );
    group.position.x -= center.x;
    group.position.y -= center.y;
    group.position.z -= center.z;
    group.updateMatrixWorld(true);
    scene.add(group);
    mainGroup = group;
    // قرار دادن کف دقیقاً زیر پنجره
    if (floorGrid) {
      const modelBox =
        new THREE.Box3().setFromObject(group);
      floorGrid.position.y =
        modelBox.min.y - 2;
    }
    // Fit camera
    box =
      new THREE.Box3().setFromObject(
        mainGroup
      );
    const size =
      box.getSize(
        new THREE.Vector3()
      );
    const modelCenter =
      box.getCenter(
        new THREE.Vector3()
      );
    const maxDim =
      Math.max(
        size.x,
        size.y,
        size.z
      );
    const fov =
      camera.fov *
      Math.PI /
      180;
    let distance =
      Math.abs(
        maxDim /
        (2 * Math.tan(fov / 2))
      );
    distance *= 1.35;
    camera.position.set(
      distance * 0.75,
      distance * 0.45,
      distance
    );
    controls.target.copy(
      modelCenter
    );
    controls.minDistance =
      Math.max(
        maxDim * 0.15,
        10
      );
    controls.maxDistance =
      Math.max(
        maxDim * 8,
        1000
      );
    camera.lookAt(
      modelCenter
    );
    controls.update();
    currentModelId = modelId;
    return true;
  } catch (error) {
    console.error(
      "خطا در ساخت مدل سه بعدی:",
      error
    );
    return false;
  }
}
// پیش‌نمایش باز و بسته شدن تمام لنگه‌ها
function preview3DWindow() {
  if (!mainGroup) {
    return;
  }
  if (preview3DAnimation) {
    cancelAnimationFrame(
      preview3DAnimation
    );
    preview3DAnimation = null;
  }
  // پیدا کردن تمام محورهای لولا
  const pivotGroups = [];
  mainGroup.traverse(
    (child) => {
      if (
        !child.isGroup
      ) {
        return;
      }
      if (
        child.name === "previewPivot" &&
        child.userData?.previewReady
      ) {
        pivotGroups.push(
          child
        );
      }
    }
  );
  if (!pivotGroups.length) {
    console.warn(
      "هیچ لنگه بازشویی برای پیش‌نمایش پیدا نشد"
    );
    return;
  }
  console.log(
    "تعداد لنگه‌های قابل حرکت:",
    pivotGroups.length
  );
  // ------------------------------------------------------
  // اطلاعات هر لنگه
  // ------------------------------------------------------
  const animations =
    pivotGroups.map(
      (pivotGroup) => {
        const axis =
          pivotGroup.userData.axis;
        const direction =
          pivotGroup.userData.direction;
        let targetRotation = 0;
        // -----------------------------------------------
        // راست بازشو
        // -----------------------------------------------
        if (
          direction === "right"
        ) {
          targetRotation =
            -THREE.MathUtils.degToRad(
              70
            );
        }
        // -----------------------------------------------
        // چپ بازشو
        // -----------------------------------------------
        else if (
          direction === "left"
        ) {
          targetRotation =
            THREE.MathUtils.degToRad(
              70
            );
        }
        // -----------------------------------------------
        // بالا بازشو
        // -----------------------------------------------
        else if (direction === "top") {
          targetRotation = -THREE.MathUtils.degToRad(70);
        }
        // -----------------------------------------------
        // پایین بازشو
        // -----------------------------------------------
        else if (direction === "bottom") {
          targetRotation = THREE.MathUtils.degToRad(70);
        }
        return {
          pivotGroup,
          axis,
          startRotation:
            pivotGroup.rotation[axis],
          targetRotation
        };
      }
    );
  const duration = 900;
  const pause = 600;
  const startTime =
    performance.now();
  // ------------------------------------------------------
  // Ease
  // ------------------------------------------------------
  function easeInOut(t) {
    return t < 0.5
      ? 2 * t * t
      : 1 -
      Math.pow(
        -2 * t + 2,
        2
      ) / 2;
  }
  // ======================================================
  // باز شدن همه لنگه‌ها
  // ======================================================
  function animateOpen(now) {
    const progress =
      Math.min(
        (
          now -
          startTime
        ) /
        duration,
        1
      );
    const eased =
      easeInOut(
        progress
      );
    animations.forEach(
      (item) => {
        const {
          pivotGroup,
          axis,
          startRotation,
          targetRotation
        } = item;
        pivotGroup.rotation[axis] =
          startRotation +
          (
            targetRotation -
            startRotation
          ) *
          eased;
      }
    );
    if (
      progress < 1
    ) {
      preview3DAnimation =
        requestAnimationFrame(
          animateOpen
        );
      return;
    }
    // ====================================================
    // مکث وقتی همه باز هستند
    // ====================================================
    setTimeout(
      () => {
        const closeStart =
          performance.now();
        // ================================================
        // بسته شدن همه لنگه‌ها
        // ================================================
        function animateClose(now2) {
          const closeProgress =
            Math.min(
              (
                now2 -
                closeStart
              ) /
              duration,
              1
            );
          const closeEased =
            easeInOut(
              closeProgress
            );
          animations.forEach(
            (item) => {
              const {
                pivotGroup,
                axis,
                startRotation,
                targetRotation
              } = item;
              pivotGroup.rotation[axis] =
                targetRotation +
                (
                  startRotation -
                  targetRotation
                ) *
                closeEased;
            }
          );
          if (
            closeProgress < 1
          ) {
            preview3DAnimation =
              requestAnimationFrame(
                animateClose
              );
          } else {
            // --------------------------------------------
            // اطمینان از برگشت کامل همه لنگه‌ها
            // --------------------------------------------
            animations.forEach(
              (item) => {
                item.pivotGroup.rotation[
                  item.axis
                ] =
                  item.startRotation;
              }
            );
            preview3DAnimation =
              null;
          }
        }
        preview3DAnimation =
          requestAnimationFrame(
            animateClose
          );
      },
      pause
    );
  }
  preview3DAnimation =
    requestAnimationFrame(
      animateOpen
    );
}
// دریافت SVG و ساخت مدل
export async function update3DModel(
  svgString,
  id = null
) {
  if (!svgString) {
    return false;
  }
  // اگر همان مدل است، دوباره نساز
  if (
    svgString === currentSVGString &&
    id === currentModelId
  ) {
    resize3D();
    return true;
  }
  currentSVGString = svgString;
  clearPreviousModel();
  const success =
    await build3DFromSVG(
      svgString,
      id
    );
  if (success) {
    window.dispatchEvent(
      new CustomEvent(
        "onModelUpdated",
        {
          detail: {
            success: true,
            id: id,
            timestamp: Date.now(),
          },
        }
      )
    );
  }
  return success;
}
// پاک کردن مدل
export function clear3DModel() {
  clearPreviousModel();
  currentSVGString = "";
  currentModelId = null;
  if (controls) {
    controls.target.set(
      0,
      0,
      0
    );
  }
}
// API عمومی
window.update3DModel =
  update3DModel;
window.init3D =
  init3D;
window.resize3D =
  resize3D;
window.clear3DModel =
  clear3DModel;
document.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "#preview3DButton"
      );
    if (!button) {
      return;
    }
    preview3DWindow();
  }
);