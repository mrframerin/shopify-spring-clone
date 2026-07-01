import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { POINT_VERT, POINT_FRAG, COMPOSITE_VERT, COMPOSITE_FRAG, VOLUME_VERT, VOLUME_FRAG } from "./shaders";
import { FluidSimulation } from "./fluidSim";

// The hero forest is a pre-baked point cloud: 260k baked-colour points decoded at build
// time from the original `.mdpc` (YCbCr) asset into a compact binary
// ([uint32 count][float32 positions][uint8 colours]). It's drawn as distance-sized round
// points with a warm caustic shimmer, drifts under a cursor-driven fluid field, and is
// lit by an UnrealBloom + neutral-tonemap composer — matching the original scene.
const CLOUD_URL = "/scene/cloud-512.f32";

// Point material tuning (the original's resolved desktop/high-tier values).
const POINT_SIZE = 0.021764240506329124; // 0.0174113924050633 * particleScalar(512)=1.25
const MAX_POINT_SIZE = 80; // 64 * 1.25
const FLUID_INFLUENCE = 0.7911392405063289;

// Bloom (hero "cloud-hill" preset). The engine blooms in sRGB/gamma space (threshold on
// sRGB luminance) then overlays it additively at 0.335 opacity, so the effective
// UnrealBloom strength ≈ intensity * 0.335.
const BLOOM_STRENGTH = 1.3101265822784818 * 0.335;
const BLOOM_RADIUS = 0.4620253164556961;
const BLOOM_THRESHOLD = 0.23417721518987344;

// Camera + cloud transform read live from the original engine at its settled rest pose
// (fov, view matrix, and the cloud's own model matrix). Applied verbatim so our framing
// matches theirs exactly. Column-major, as captured off the engine's GPU.
const CAMERA_FOV = 55;
const ENGINE_MODEL = [
  0.86007, 0, -0.60232, 0,
  0.00001, 1.05, 0.00002, 0,
  0.60232, -0.00002, 0.86007, 0,
  -1.03691, 0.07699, 0.49708, 1,
];

interface CloudData {
  count: number;
  positions: Float32Array;
  colors: Uint8Array;
}

async function loadCloud(url: string): Promise<CloudData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`failed to load ${url}: ${res.status}`);
  const buf = await res.arrayBuffer();
  const count = new DataView(buf).getUint32(0, true);
  const positions = new Float32Array(buf, 4, count * 3);
  const colors = new Uint8Array(buf, 4 + count * 3 * 4, count * 3);
  return { count, positions, colors };
}

export interface HeroSceneHandle {
  dispose(): void;
}

export async function createHeroScene(container: HTMLElement): Promise<HeroSceneHandle> {
  const { count, positions, colors } = await loadCloud(CLOUD_URL);

  // Own canvas per scene instance so a double-mount can't leave two renderers fighting
  // over one canvas/context.
  const canvas = document.createElement("canvas");
  canvas.className = "block h-full w-full";
  container.appendChild(canvas);

  // Per-point randoms (idle wobble + size variation) + constant size/anchor attributes.
  const randoms = new Float32Array(count * 4);
  const sizes = new Float32Array(count);
  const anchors = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    randoms[i * 4] = Math.random();
    randoms[i * 4 + 1] = Math.random();
    randoms[i * 4 + 2] = Math.random();
    randoms[i * 4 + 3] = Math.random();
    sizes[i] = 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3, true)); // Uint8 → 0..1
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 4));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aAnchorHighlight", new THREE.BufferAttribute(anchors, 1));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const uniforms = {
    uTime: { value: 0 },
    uPointSize: { value: POINT_SIZE },
    uPointSizeScale: { value: 1 },
    uDistanceSizeInfluence: { value: 0.25 },
    uDistanceSizeNear: { value: 4 },
    uDistanceSizeFar: { value: 18 },
    uDistanceSizeMax: { value: 1.5 },
    uMaxPointSize: { value: MAX_POINT_SIZE },
    uDPR: { value: dpr },
    uRenderScale: { value: 1 },
    uOpacity: { value: 1 },
    uLoadFade: { value: 0 },
    uTransparentPoints: { value: 1 },
    uExposure: { value: 0 },
    uRandomize: { value: 0 },
    uDensityFillPointSizeScale: { value: 1 },
    uDensityFillOpacityScale: { value: 1 },
    uTransitionProgress: { value: 1 },
    uTransitionRestProgress: { value: 0.5 },
    uTransitionPow: { value: 10 },
    uTransitionYOffset: { value: 0 },
    uSimplePoints: { value: 0 },
    uAnchorHighlightOpacity: { value: 0 },
    uCamFadeEnabled: { value: 0 },
    uCamFadeNear: { value: 0 },
    uCamFadeFar: { value: 1 },
    uFluidVelocity: { value: null as THREE.Texture | null },
    uFluidInfluence: { value: FLUID_INFLUENCE },
    // Caustics (warm additive shimmer).
    // Caustics is OFF for this section: the pointcloud schema marks it optional with no
    // default, and the "cloud-hill" section never provides it → uCausticsEnabled = 0.
    // (The warm 1.4 strength was a generic material default, not this scene's.)
    uCausticsEnabled: { value: 0 },
    uCausticsStrength: { value: 0 },
    uCausticsScale: { value: 0.75 },
    uCausticsPower: { value: 2.1 },
    uCausticsSparkle: { value: 0 },
    uCausticsAxisScale: { value: new THREE.Vector3(1, 1, 2.4) },
    uCausticsSpeed: { value: new THREE.Vector3(0.18, -0.12, 0.08) },
    uCausticsColor: { value: new THREE.Color().setRGB(0.95, 0.78, 0.42, THREE.SRGBColorSpace) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    uniforms,
    vertexColors: true,
    transparent: false,
    depthTest: true,
    depthWrite: true,
    blending: THREE.NoBlending,
    toneMapped: false, // colour is converted to linear in the fragment for the composer
    defines: { POINTCLOUD_USE_CAUSTICS: 1, POINTCLOUD_USE_FLUID: 1 },
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  // The cloud's own model transform (rotateY + scale + offset), captured from the engine.
  points.matrixAutoUpdate = false;
  points.matrix.fromArray(ENGINE_MODEL);
  points.matrixWorld.copy(points.matrix);
  const scene = new THREE.Scene();
  scene.add(points);

  // Heroforest backdrop: the video light-volume — a box raymarch of the heroforest KTX2
  // (a sampler2DArray of 14 depth slices) rendered behind the cloud (renderOrder -5), so
  // the point cloud overlays a soft misty forest instead of empty black. Values are the
  // live hero's authored videoLightVolume config.
  const volUniforms = {
    uVolume: { value: null as THREE.Texture | null },
    uOpacity: { value: 1.74 },
    uBrightness: { value: 2.65 },
    uThreshold: { value: 0.025 },
    uSoftness: { value: 0.001 },
    uEdgeFade: { value: 0 },
    uLoopCount: { value: 12 },
    uGridTimeOffset: { value: 0 },
    uGridOpacity: { value: 1 },
    uNearFade: { value: 0 },
    uRaymarchSteps: { value: 100 },
    uLayerCount: { value: 14 },
    uScrubOffset: { value: 0 },
    uCenterFade: { value: new THREE.Vector3(0.5, 0, 0) },
    uHsl: { value: new THREE.Vector3(0.17, -0.56, -0.21) },
    uTime: { value: 0 },
    uNoiseScale: { value: new THREE.Vector3(0, 0, 0) },
    uNoiseMovement: { value: new THREE.Vector3(0, 0, 0) },
    uNoiseStrength: { value: 0 },
    uLoadFade: { value: 0 },
  };
  const volMaterial = new THREE.ShaderMaterial({
    vertexShader: VOLUME_VERT,
    fragmentShader: VOLUME_FRAG,
    uniforms: volUniforms,
    glslVersion: THREE.GLSL3,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });
  const volMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), volMaterial);
  volMesh.frustumCulled = false;
  volMesh.renderOrder = -5;
  volMesh.position.set(1.53, -0.14, 1.45);
  volMesh.rotation.set(2.705260340591211, 1.9345229429105149, -1.6057029118347834, "XYZ");
  volMesh.scale.set(5.89, 3.341, 35.4);
  volMesh.visible = false; // shown once the KTX2 loads
  scene.add(volMesh);

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
  // Exact rest-pose view matrix captured live from the original engine (column-major).
  // Applied as the camera's world-inverse so our framing matches theirs precisely.
  const ENGINE_VIEW = [
    0.37178, -0.0326, 0.92775, 0,
    0, 0.99938, 0.03512, 0,
    -0.92832, -0.01306, 0.37155, 0,
    0.90169, 0.52813, -0.38711, 1,
  ];
  const viewMatrix = new THREE.Matrix4().fromArray(ENGINE_VIEW);
  const camBase = viewMatrix.clone().invert();
  camera.matrixAutoUpdate = false;
  camera.matrixWorld.copy(camBase);
  camera.matrix.copy(camBase);
  camera.matrixWorldInverse.copy(viewMatrix);
  const driftEuler = new THREE.Euler();
  const driftMat = new THREE.Matrix4();
  const offsetMat = new THREE.Matrix4();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setClearColor(0x0a0a14, 1);
  // Tone mapping + colour-space are done explicitly in the composite pass (sRGB space),
  // so leave the renderer's own passthrough alone.
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = false;

  // Cursor-driven fluid velocity field the point shader samples to drift.
  const fluid = new FluidSimulation(renderer, 128);
  uniforms.uFluidVelocity.value = fluid.velocityTexture;

  // Load the heroforest KTX2 (the light-volume's coloured-density data) and feed the box.
  const ktx2 = new KTX2Loader().setTranscoderPath("/basis/").detectSupport(renderer);
  ktx2.load(
    "/scene/heroforest.ktx2",
    (tex) => {
      const t = tex as THREE.Texture & { image?: { width?: number; height?: number; depth?: number } };
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
      volUniforms.uVolume.value = t;
      volUniforms.uLayerCount.value = t.image?.depth || 14;
      // Scale the box's height by the real texture aspect (the raymarch samples in the
      // box's local unit cube, so its proportions must match the video's).
      const aspect = (t.image?.width || 643) / (t.image?.height || 358);
      volMesh.scale.set(5.89, 6 * (1 / aspect), 35.4);
      volMesh.visible = true;
    },
    undefined,
    () => {
      /* backdrop is optional — the scene still renders without it */
    },
  );

  // Bloom + neutral-tonemap composer (the scene's glow).
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD);
  // Warm amber bloom tint — the source of the sky's pink/gold glow.
  const warmTint = new THREE.Vector3(1, 0.8627450980392157, 0.6);
  bloom.bloomTintColors = [warmTint, warmTint, warmTint, warmTint, warmTint];
  composer.addPass(bloom);

  // Afterimage: persistent temporal trails. As the points drift (fluid + idle wobble),
  // the trails accumulate into the soft, continuous mist the original scene has — the
  // difference between discrete glitter and a painterly fog. (Engine's afterimage.)
  // Damp 0.98 (near the engine's ~0.999): near-persistent trails that accumulate the
  // drifting points into the soft, continuous misty backdrop the original has.
  const afterimage = new AfterimagePass(0.98);
  composer.addPass(afterimage);

  // Final composite: lower-biased vignette + neutral tone map in sRGB space — the exact
  // tail of the engine's section composite.
  const composite = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uVignetteAmount: { value: 0.5 },
      uVignetteRadius: { value: 0.895 },
      uVignetteSoftness: { value: 0.441 },
      uVignetteAspect: { value: 1 },
    },
    vertexShader: COMPOSITE_VERT,
    fragmentShader: COMPOSITE_FRAG,
  });
  composer.addPass(composite);

  let lastW = 0;
  let lastH = 0;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width) || window.innerWidth;
    const h = Math.round(rect.height) || window.innerHeight;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    // The engine runs bloom at 0.5× resolution, which spreads it into a soft haze
    // (the pink sky glow) rather than a tight halo.
    bloom.setSize(Math.max(1, Math.round(w * 0.5)), Math.max(1, Math.round(h * 0.5)));
    composite.uniforms.uVignetteAspect.value = w / h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Cursor tracking: fluid splats + a subtle camera parallax. The background sits behind
  // page content and never receives pointer events itself, so listen on the window.
  const pointer = new THREE.Vector2();
  const prevPointer = new THREE.Vector2();
  const splatDelta = new THREE.Vector2();
  let pointerInit = false;
  let pointerMoved = false;
  let pointerX = 0;
  let pointerY = 0;
  const onPointerMove = (e: PointerEvent) => {
    const x = e.clientX / window.innerWidth;
    const y = 1 - e.clientY / window.innerHeight;
    if (!pointerInit) {
      prevPointer.set(x, y);
      pointerInit = true;
    }
    pointer.set(x, y);
    pointerMoved = true;
    pointerX = e.clientX / window.innerWidth - 0.5;
    pointerY = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  let targetScroll = 0;
  const onScroll = () => {
    targetScroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const clock = new THREE.Clock();
  let elapsed = 0;
  let scroll = 0;
  let camYaw = 0;
  let camPitch = 0;
  let volScrub = 0;
  let raf = 0;
  const tick = () => {
    resize();
    const dt = Math.min(clock.getDelta(), 1 / 30);
    elapsed += dt;
    const aspect = (lastW || 1) / (lastH || 1);

    // Ease in the cloud + backdrop on first frames.
    uniforms.uLoadFade.value = Math.min(uniforms.uLoadFade.value + dt * 1.2, 1);
    volUniforms.uLoadFade.value = uniforms.uLoadFade.value;

    // Backdrop light-volume: advance the reversed scrub (~5.9s loop) through the video
    // slices; uTime only matters if noise is enabled (it isn't).
    volUniforms.uTime.value = elapsed;
    volScrub -= dt / 5.9;
    volUniforms.uScrubOffset.value = ((volScrub % 1) + 1) % 1;

    // Cursor motion injects fluid velocity (no ambient splatting — the field decays to
    // rest, and the only always-on motion is the shader wobble).
    if (pointerMoved) {
      splatDelta.set((pointer.x - prevPointer.x) * 6, (pointer.y - prevPointer.y) * 6);
      fluid.splat(pointer, splatDelta, aspect);
      prevPointer.copy(pointer);
      pointerMoved = false;
    }
    fluid.step(dt);
    uniforms.uFluidVelocity.value = fluid.velocityTexture;
    uniforms.uTime.value = elapsed;

    // Subtle pointer look + scroll dolly layered on the captured rest-pose camera.
    scroll += (targetScroll - scroll) * Math.min(dt * 5, 1);
    const ease = Math.min(dt * 14, 1);
    camYaw += (pointerX * 0.08 - camYaw) * ease;
    camPitch += (-pointerY * 0.08 - camPitch) * ease;
    driftEuler.set(camPitch, camYaw, 0);
    driftMat.makeRotationFromEuler(driftEuler);
    offsetMat.makeTranslation(0, scroll * 0.12, scroll * 0.35);
    camera.matrixWorld.copy(camBase).multiply(offsetMat).multiply(driftMat);
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

    renderer.setRenderTarget(null);
    renderer.clear();
    composer.render();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      volMesh.geometry.dispose();
      volMaterial.dispose();
      volUniforms.uVolume.value?.dispose();
      ktx2.dispose();
      fluid.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
