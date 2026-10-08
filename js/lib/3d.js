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
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.25)
  );
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
  floorGrid.material.opacity = 0.45;
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
      id === "window_simple_right_nohandle" ||
      id === "window_simple_left_nohandle" ||
      id === "window_simple_right" ||
      id === "window_simple_left" ||
      id === "window_simple_top" ||
      id === "window_simple_bottom" ||
      id === "window_dual_right" ||
      id === "window_dual_left" ||
      id === "window_simple" ||
      id === "window_radial_right" ||
      id === "window_radial_left" ||
      id === "window_radial_top" ||
      id === "window_radial_bottom" ||
      id === "window_volkswagen_right" ||
      id === "window_volkswagen_left" ||
      id === "window_french_simple_left" ||
      id === "window_french_simple_right" ||
      id === "window_french_dual_left" ||
      id === "window_french_dual_right" ||
      id === "door_simple_right_nohandle" ||
      id === "door_simple_left_nohandle" ||
      id === "door_simple_right" ||
      id === "door_simple_left" ||
      id === "door_dual_right" ||
      id === "door_dual_left" ||
      id === "door_french_simple_left" ||
      id === "door_french_simple_right" ||
      id === "door_french_dual_left" ||
      id === "door_french_dual_right"
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
  // محور اصلی لولا
  const pivotWorld =
    new THREE.Vector3();
  if (
    type.includes("right")
  ) {
    pivotWorld.set(
      min.x,
      center.y,
      center.z
    );
  }
  else if (
    type.includes("left")
  ) {
    pivotWorld.set(
      max.x,
      center.y,
      center.z
    );
  }
  else if (
    type.includes("top")
  ) {
    pivotWorld.set(
      center.x,
      min.y,
      center.z
    );
  }
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
  // محور اصلی در مختصات فریم
  const pivotLocal =
    mainGroup.worldToLocal(
      pivotWorld.clone()
    );
  // Pivot اصلی
  const pivotGroup =
    new THREE.Group();
  pivotGroup.name =
    "previewPivot";
  pivotGroup.userData.openingType =
    type;
  // ذخیره Transform جهانی لنگه
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
  // قرار دادن محور اصلی
  pivotGroup.position.copy(
    pivotLocal
  );
  mainGroup.add(
    pivotGroup
  );
  // لنگه داخل محور اصلی
  pivotGroup.add(
    sashGroup
  );
  // حفظ دقیق موقعیت قبلی لنگه
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
    inverseParentQuaternion.multiply(
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
  // اطلاعات محور اصلی
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
  // پنجره و در دوحالته
  if (
    type === "window_dual_right" ||
    type === "window_dual_left" ||
    type === "door_dual_right" ||
    type === "door_dual_left"
  ) {
    sashGroup.updateWorldMatrix(
      true,
      false
    );
    const sashBox =
      new THREE.Box3().setFromObject(
        sashGroup
      );
    const sashCenter =
      sashBox.getCenter(
        new THREE.Vector3()
      );
    const sashMin =
      sashBox.min.clone();
    const sashMax =
      sashBox.max.clone();
    // محور بالایی لنگه
    const secondPivotWorld =
      new THREE.Vector3(
        sashCenter.x,
        sashMin.y,
        sashCenter.z
      );
    // تبدیل به مختصات Pivot اصلی
    const secondPivotLocal =
      pivotGroup.worldToLocal(
        secondPivotWorld.clone()
      );
    // Pivot دوم
    const secondPivot =
      new THREE.Group();
    secondPivot.name =
      "previewPivot";
    secondPivot.userData.previewReady =
      true;
    secondPivot.userData.isSecondary =
      true;
    secondPivot.userData.axis =
      "x";
    secondPivot.userData.direction =
      "top";
    secondPivot.userData.closedRotation =
      0;
    // Pivot دوم را داخل Pivot اول قرار بده
    secondPivot.position.copy(
      secondPivotLocal
    );
    pivotGroup.add(
      secondPivot
    );
    // Transform جهانی لنگه را دوباره حفظ کن
    sashGroup.updateWorldMatrix(
      true,
      false
    );
    const sashWorldPosition =
      new THREE.Vector3();
    const sashWorldQuaternion =
      new THREE.Quaternion();
    const sashWorldScale =
      new THREE.Vector3();
    sashGroup.getWorldPosition(
      sashWorldPosition
    );
    sashGroup.getWorldQuaternion(
      sashWorldQuaternion
    );
    sashGroup.getWorldScale(
      sashWorldScale
    );
    // لنگه داخل محور دوم
    secondPivot.add(
      sashGroup
    );
    // حفظ موقعیت جهانی
    const secondLocalPosition =
      secondPivot.worldToLocal(
        sashWorldPosition.clone()
      );
    sashGroup.position.copy(
      secondLocalPosition
    );
    const secondInverseQuaternion =
      secondPivot
        .getWorldQuaternion(
          new THREE.Quaternion()
        )
        .invert();
    sashGroup.quaternion.copy(
      secondInverseQuaternion.multiply(
        sashWorldQuaternion
      )
    );
    const secondParentScale =
      secondPivot.getWorldScale(
        new THREE.Vector3()
      );
    sashGroup.scale.set(
      sashWorldScale.x /
      (secondParentScale.x || 1),
      sashWorldScale.y /
      (secondParentScale.y || 1),
      sashWorldScale.z /
      (secondParentScale.z || 1)
    );
    // نگه داشتن محور دوم
    pivotGroup.userData.secondaryPivot =
      secondPivot;
  }
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
          color: svgColor || currentGlassColor,
          roughness: 0.12,
          metalness: 0.02,
          transparent: true,
          opacity: 0.35,
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
        zOffset = 25;
      }
      // لولا
      else if (type === "hinge") {
        material = hingeMat;
        depth = 24;
        zOffset = 30;
      }
      // پنل
      else if (type === "panel") {
        material = new THREE.MeshStandardMaterial({
          color: svgColor || 0xd1d5db,
          roughness: 0.35,
          metalness: 0.08,
        });
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
        if (
          type === "handle" &&
          String(origId).toLowerCase() === "handlehand"
        ) {
          mesh.position.z += 25;
          mesh.scale.z = 0.50;
        }
        mesh.userData.svgId =
          origId;
        // خط‌های پنل
        if (type === "panel") {
          const panelEdgeGeometry = new THREE.EdgesGeometry(
            geometry,
            1
          );
          const panelEdgeMaterial =
            new THREE.LineBasicMaterial({
              color: 0x9ca3af,
              transparent: true,
              opacity: 0.30,
              depthTest: true,
              depthWrite: false
            });
          const panelEdgeLines =
            new THREE.LineSegments(
              panelEdgeGeometry,
              panelEdgeMaterial
            );
          panelEdgeLines.renderOrder = 20;
          // جلوگیری از تداخل خط با سطح پنل
          panelEdgeLines.position.z = 0.5;
          mesh.add(panelEdgeLines);
        }
        // مرز فریم‌ها
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
              25
            );
          const positions =
            edgeGeometry.attributes.position.array;
          const filteredPositions = [];
          // فریم اصلی:
          // فقط مرزهای داخلی
          // مرز بیرونی حذف می‌شود
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
          // ساخت خط مرزی
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
                opacity: 0.32,
                depthTest: true,
                depthWrite: false
              });
            const edgeLines =
              new THREE.LineSegments(
                filteredGeometry,
                edgeMaterial
              );
            edgeLines.renderOrder = 10;
            // کمی جلوتر از سطح قرار می‌گیرد
            edgeLines.position.z = 0.5;
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
      const pivotGroup = setupOpeningPivot(group, sashGroup);
      if (pivotGroup) {
        pivotGroup.position.z += 25;
      } else if (sashGroup.userData.openingType === "window_simple") {
        sashGroup.position.z += 25;
      }
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
    // تنظیم اندازه مدل بر اساس صفحه نمایش
    const isMobile =
      window.matchMedia(
        "(max-width: 768px)"
      ).matches;
    // در موبایل مدل کوچک‌تر نمایش داده شود
    if (isMobile) {
      distance *= 1.85;
    } else {
      distance *= 1.35;
    }
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
  const pivotGroups = [];
  mainGroup.traverse(
    (child) => {
      if (!child.isGroup) {
        return;
      }
      if (
        child.name === "previewPivot" &&
        child.userData?.previewReady
      ) {
        pivotGroups.push(child);
      }
    }
  );
  if (!pivotGroups.length) {
    console.warn(
      "هیچ لنگه بازشویی برای پیش‌نمایش پیدا نشد"
    );
    return;
  }
  // محورهای اصلی
  const primaryPivots =
    pivotGroups.filter(
      (pivot) =>
        !pivot.userData?.isSecondary
    );
  // محورهای بالایی
  const secondaryPivots =
    pivotGroups.filter(
      (pivot) =>
        pivot.userData?.isSecondary
    );
  // انیمیشن یک محور
  function animatePivot(
    pivotGroup,
    targetRotation,
    duration,
    onComplete
  ) {
    const axis =
      pivotGroup.userData.axis;
    const startRotation =
      pivotGroup.rotation[axis];
    const startTime =
      performance.now();
    function easeInOut(t) {
      return t < 0.5
        ? 2 * t * t
        : 1 -
        Math.pow(
          -2 * t + 2,
          2
        ) / 2;
    }
    function animate(now) {
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
        easeInOut(progress);
      pivotGroup.rotation[axis] =
        startRotation +
        (
          targetRotation -
          startRotation
        ) *
        eased;
      if (
        progress < 1
      ) {
        preview3DAnimation =
          requestAnimationFrame(
            animate
          );
        return;
      }
      pivotGroup.rotation[axis] =
        targetRotation;
      if (onComplete) {
        onComplete();
      }
    }
    preview3DAnimation =
      requestAnimationFrame(
        animate
      );
  }
  // پیدا کردن محور بالایی مربوط به همین لنگه
  function getSecondaryForPrimary(
    primary
  ) {
    let result = null;
    primary.traverse(
      (child) => {
        if (
          result ||
          !child.isGroup
        ) {
          return;
        }
        if (
          child.name === "previewPivot" &&
          child.userData?.previewReady &&
          child.userData?.isSecondary
        ) {
          result = child;
        }
      }
    );
    return result;
  }
  // باز کردن محور اصلی
  // لنگه‌ها یکی‌یکی باز می‌شوند
  function openPrimary(index) {
    if (
      index >=
      primaryPivots.length
    ) {
      // وقتی تمام لنگه‌های اصلی باز شدند
      // برو سراغ قسمت بالایی
      openSecondary(0);
      return;
    }
    const pivotGroup =
      primaryPivots[index];
    const direction =
      pivotGroup.userData.direction;
    let targetRotation = 0;
    if (
      direction === "right"
    ) {
      targetRotation =
        -THREE.MathUtils.degToRad(
          45
        );
    }
    else if (
      direction === "left"
    ) {
      targetRotation =
        THREE.MathUtils.degToRad(
          45
        );
    }
    else if (
      direction === "top"
    ) {
      targetRotation =
        -THREE.MathUtils.degToRad(
          45
        );
    }
    else if (
      direction === "bottom"
    ) {
      targetRotation =
        THREE.MathUtils.degToRad(
          45
        );
    }
    animatePivot(
      pivotGroup,
      targetRotation,
      900,
      () => {
        openPrimary(
          index + 1
        );
      }
    );
  }
  // باز کردن قسمت بالایی هر لنگه
  // سپس بستن همان قسمت
  // بعد رفتن به لنگه بعدی
  function openSecondary(index) {
    if (
      index >=
      primaryPivots.length
    ) {
      // تمام قسمت‌های بالایی
      // باز و بسته شدند
      // حالا لنگه‌های اصلی بسته شوند
      startClosingPrimary(
        primaryPivots.length - 1
      );
      return;
    }
    const primary =
      primaryPivots[index];
    const secondary =
      getSecondaryForPrimary(
        primary
      );
    // اگر این لنگه قسمت بالایی ندارد
    // برو سراغ لنگه بعدی
    if (!secondary) {
      openSecondary(
        index + 1
      );
      return;
    }
    // اول قسمت بالایی همین لنگه باز شود
    animatePivot(
      secondary,
      -THREE.MathUtils.degToRad(
        10
      ),
      700,
      () => {
        // کمی مکث
        setTimeout(
          () => {
            // همان قسمت بالایی بسته شود
            animatePivot(
              secondary,
              0,
              700,
              () => {
                // بعد لنگه بعدی
                openSecondary(
                  index + 1
                );
              }
            );
          },
          500
        );
      }
    );
  }
  // بستن لنگه‌های اصلی از آخر به اول
  function startClosingPrimary(
    index
  ) {
    if (
      index < 0
    ) {
      // اطمینان از بسته بودن همه محورها
      primaryPivots.forEach(
        (pivotGroup) => {
          pivotGroup.rotation[
            pivotGroup.userData.axis
          ] = 0;
        }
      );
      secondaryPivots.forEach(
        (pivotGroup) => {
          pivotGroup.rotation[
            pivotGroup.userData.axis
          ] = 0;
        }
      );
      preview3DAnimation =
        null;
      return;
    }
    const pivotGroup =
      primaryPivots[index];
    animatePivot(
      pivotGroup,
      0,
      900,
      () => {
        startClosingPrimary(
          index - 1
        );
      }
    );
  }
  // شروع انیمیشن
  openPrimary(0);
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
// چرخش سه بعدی
let buttonRotateAnimation = null;
let activeRotateDirection = null;
let rotateStartTime = null;
let rotateStartCameraPosition = null;
let rotateStartTarget = null;
let rotateStartQuaternion = null;
const BUTTON_ROTATE_SPEED =
  THREE.MathUtils.degToRad(90);
const BUTTON_VERTICAL_LIMIT =
  THREE.MathUtils.degToRad(90);
// شروع چرخش
function startButtonRotation(direction) {
  if (!controls || !camera) return;
  if (activeRotateDirection === direction) {
    return;
  }
  stopButtonRotation();
  activeRotateDirection = direction;
  rotateStartTime = performance.now();
  rotateStartCameraPosition =
    camera.position.clone();
  rotateStartTarget =
    controls.target.clone();
  rotateStartQuaternion =
    camera.quaternion.clone();
  animateButtonRotation();
}
// اجرای چرخش
function animateButtonRotation() {
  if (!activeRotateDirection) {
    return;
  }
  const now = performance.now();
  const elapsed =
    (now - rotateStartTime) / 1000;
  let angle =
    BUTTON_ROTATE_SPEED * elapsed;
  // بالا و پایین حداکثر 90 درجه
  const isVertical =
    activeRotateDirection === "up" ||
    activeRotateDirection === "down";
  if (isVertical) {
    angle = Math.min(
      angle,
      BUTTON_VERTICAL_LIMIT
    );
  }
  // فاصله اولیه دوربین از مرکز
  const offset =
    rotateStartCameraPosition
      .clone()
      .sub(rotateStartTarget);
  // محورهای چرخش
  const worldUp =
    new THREE.Vector3(0, 1, 0);
  const cameraRight =
    new THREE.Vector3(1, 0, 0)
      .applyQuaternion(
        rotateStartQuaternion
      )
      .normalize();
  let axis = null;
  let signedAngle = angle;
  // راست
  if (
    activeRotateDirection === "right"
  ) {
    axis = worldUp;
    signedAngle = -angle;
  }
  // چپ
  if (
    activeRotateDirection === "left"
  ) {
    axis = worldUp;
    signedAngle = angle;
  }
  // بالا
  if (
    activeRotateDirection === "up"
  ) {
    axis = cameraRight;
    signedAngle = -angle;
  }
  // پایین
  if (
    activeRotateDirection === "down"
  ) {
    axis = cameraRight;
    signedAngle = angle;
  }
  if (!axis) {
    stopButtonRotation();
    return;
  }
  // اعمال چرخش
  const quaternion =
    new THREE.Quaternion();
  quaternion.setFromAxisAngle(
    axis,
    signedAngle
  );
  const newOffset =
    offset
      .clone()
      .applyQuaternion(
        quaternion
      );
  camera.position
    .copy(rotateStartTarget)
    .add(newOffset);
  controls.target
    .copy(rotateStartTarget);
  camera.lookAt(
    controls.target
  );
  controls.update();
  // رسیدن به 90 درجه
  if (
    isVertical &&
    angle >= BUTTON_VERTICAL_LIMIT
  ) {
    buttonRotateAnimation = null;
    activeRotateDirection = null;
    return;
  }
  // ادامه چرخش
  buttonRotateAnimation =
    requestAnimationFrame(
      animateButtonRotation
    );
}
// توقف چرخش
function stopButtonRotation() {
  activeRotateDirection = null;
  if (buttonRotateAnimation) {
    cancelAnimationFrame(
      buttonRotateAnimation
    );
    buttonRotateAnimation = null;
  }
  rotateStartTime = null;
  rotateStartCameraPosition = null;
  rotateStartTarget = null;
  rotateStartQuaternion = null;
}
// زوم سه بعدی
let zoomAnimation = null;
let activeZoomDirection = null;
const BUTTON_ZOOM_SPEED = 900;
const MIN_ZOOM_DISTANCE = 200;
const MAX_ZOOM_DISTANCE = 5000;
// شروع زوم
function startButtonZoom(direction) {
  if (!controls || !camera) return;
  if (activeZoomDirection === direction) {
    return;
  }
  stopButtonZoom();
  activeZoomDirection = direction;
  animateButtonZoom();
}
// اجرای زوم
function animateButtonZoom() {
  if (!activeZoomDirection) {
    return;
  }
  const direction =
    camera.position
      .clone()
      .sub(controls.target)
      .normalize();
  let distance =
    camera.position.distanceTo(
      controls.target
    );
  // زوم نزدیک
  if (
    activeZoomDirection === "in"
  ) {
    distance -=
      BUTTON_ZOOM_SPEED / 60;
  }
  // زوم دور
  if (
    activeZoomDirection === "out"
  ) {
    distance +=
      BUTTON_ZOOM_SPEED / 60;
  }
  // محدودیت زوم
  distance = THREE.MathUtils.clamp(
    distance,
    MIN_ZOOM_DISTANCE,
    MAX_ZOOM_DISTANCE
  );
  // اعمال زوم در راستای دید فعلی دوربین
  camera.position
    .copy(controls.target)
    .add(
      direction.multiplyScalar(
        distance
      )
    );
  controls.update();
  // ادامه زوم
  zoomAnimation =
    requestAnimationFrame(
      animateButtonZoom
    );
}
// توقف زوم
function stopButtonZoom() {
  activeZoomDirection = null;
  if (zoomAnimation) {
    cancelAnimationFrame(
      zoomAnimation
    );
    zoomAnimation = null;
  }
}
// دکمه‌های چرخش و زوم
// دکمه‌های چرخش و زوم سه بعدی
function is3DControlButton(target) {
  return target.closest(
    "#wd3DRotateRightButton, " +
    "#wd3DRotateLeftButton, " +
    "#wd3DRotateUpButton, " +
    "#wd3DRotateDownButton, " +
    "#wd3DZoomInButton, " +
    "#wd3DZoomOutButton"
  );
}
// شروع لمس یا کلیک دکمه
document.addEventListener(
  "pointerdown",
  (event) => {
    const button =
      is3DControlButton(event.target);
    if (!button) {
      return;
    }
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (
      button.setPointerCapture &&
      event.pointerId !== undefined
    ) {
      try {
        button.setPointerCapture(
          event.pointerId
        );
      } catch (error) {
        // مشکلی نیست
      }
    }
    // چرخش راست
    if (
      button.id ===
      "wd3DRotateRightButton"
    ) {
      startButtonRotation("right");
      return;
    }
    // چرخش چپ
    if (
      button.id ===
      "wd3DRotateLeftButton"
    ) {
      startButtonRotation("left");
      return;
    }
    // چرخش بالا
    if (
      button.id ===
      "wd3DRotateUpButton"
    ) {
      startButtonRotation("up");
      return;
    }
    // چرخش پایین
    if (
      button.id ===
      "wd3DRotateDownButton"
    ) {
      startButtonRotation("down");
      return;
    }
    // زوم نزدیک
    if (
      button.id ===
      "wd3DZoomInButton"
    ) {
      startButtonZoom("in");
      return;
    }
    // زوم دور
    if (
      button.id ===
      "wd3DZoomOutButton"
    ) {
      startButtonZoom("out");
      return;
    }
  },
  {
    passive: false
  }
);
// رها کردن لمس یا کلیک
document.addEventListener(
  "pointerup",
  (event) => {
    const button =
      is3DControlButton(event.target);
    if (!button) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    stopButtonRotation();
    stopButtonZoom();
    if (
      button.releasePointerCapture &&
      event.pointerId !== undefined
    ) {
      try {
        if (
          button.hasPointerCapture &&
          button.hasPointerCapture(
            event.pointerId
          )
        ) {
          button.releasePointerCapture(
            event.pointerId
          );
        }
      } catch (error) {
        // مشکلی نیست
      }
    }
  },
  {
    passive: false
  }
);
// لغو لمس
document.addEventListener(
  "pointercancel",
  (event) => {
    const button =
      is3DControlButton(event.target);
    if (!button) {
      return;
    }
    stopButtonRotation();
    stopButtonZoom();
  },
  {
    passive: true
  }
);
// خروج از پنجره
window.addEventListener(
  "blur",
  () => {
    stopButtonRotation();
    stopButtonZoom();
  }
);
// API عمومی
window.update3DModel =
  update3DModel;
window.init3D =
  init3D;
window.resize3D =
  resize3D;
window.clear3DModel =
  clear3DModel;
// پیش‌نمایش سه بعدی
document.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "#wd3DPreviewButton"
      );
    if (!button) {
      return;
    }
    preview3DWindow();
  }
);