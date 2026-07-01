// GLSL for the hero point-cloud background — the exact vertex/fragment technique the
// original scene uses (distance-based sizing, screen-space fluid displacement, warm
// caustic shimmer, round anti-aliased points). Written for THREE.ShaderMaterial, which
// injects `position`, `color`, `modelMatrix`, `viewMatrix`, `projectionMatrix` and the
// precision qualifier — so those are not declared here. The fluid-simulation passes
// further below are a separate GPU solver whose velocity field this vertex samples.

/** Point cloud — vertex. Positions each baked point, applies the idle wobble + a
 *  screen-space fluid nudge, and sizes it by view-space distance. */
export const POINT_VERT = /* glsl */ `
uniform float uTime;
uniform float uPointSize;
uniform float uPointSizeScale;
uniform float uDistanceSizeInfluence;
uniform float uDistanceSizeNear;
uniform float uDistanceSizeFar;
uniform float uDistanceSizeMax;
uniform float uMaxPointSize;
uniform float uDPR;
uniform float uRenderScale;
uniform float uOpacity;
uniform float uTransparentPoints;
uniform float uExposure;
uniform float uRandomize;
uniform float uDensityFillPointSizeScale;
uniform float uTransitionProgress;
uniform float uTransitionRestProgress;
uniform float uTransitionPow;
uniform float uTransitionYOffset;
uniform float uSimplePoints;
uniform float uAnchorHighlightOpacity;
uniform float uCamFadeEnabled;
uniform float uCamFadeNear;
uniform float uCamFadeFar;
uniform sampler2D uFluidVelocity;
uniform float uFluidInfluence;

attribute vec4 aRandom;
attribute float aSize;
attribute float aAnchorHighlight;

varying vec3 vCloudColor;
varying vec3 vWorldPosition;
varying float vAnchorGlow;
varying float vProjectedPointSize;
varying float vCameraFade;
varying float vSparkleSeed;
varying float vSplatSize;

void main() {
  float anchorHighlight = clamp(aAnchorHighlight * uAnchorHighlightOpacity, 0.0, 1.0);
  vSplatSize = aSize;
  vSparkleSeed = fract(aRandom.x * 17.13 + aRandom.y * 3.71 + aRandom.z * 11.47);

  vec3 pos = position;
  float anchorMotionMask = 1.0 - step(0.0001, aAnchorHighlight);
  pos += (aRandom.xyz * 2.0 - 1.0) * uRandomize * anchorMotionMask;
  pos.y += sin(uTime * 0.18 + aRandom.x * 12.0) * 0.006 * anchorMotionMask;

  float restProgress = clamp(uTransitionRestProgress, 0.0001, 1.0);
  float transitionSettle = smoothstep(0.0, restProgress, clamp(uTransitionProgress, 0.0, 1.0));
  float transitionMask = pow(aRandom.y, max(uTransitionPow, 0.0001)) * mix(0.35, 1.0, aRandom.z);
  float transitionFloat = transitionMask * (1.0 - transitionSettle);
  pos.y += uTransitionYOffset * transitionFloat * anchorMotionMask;

  float simpleMask = step(0.5, uSimplePoints);
  vAnchorGlow = 0.0;
  vec3 baseColor = color * exp2(uExposure);
  vCloudColor = mix(baseColor, vec3(1.0), clamp(vAnchorGlow, 0.0, 1.0));

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mv = viewMatrix * worldPosition;
  vWorldPosition = worldPosition.xyz;

#if POINTCLOUD_USE_FLUID
  if (simpleMask < 0.5 && uFluidInfluence > 0.0) {
    vec4 clipPos = projectionMatrix * mv;
    vec2 screenUV = clamp(clipPos.xy / max(clipPos.w, 0.0001) * 0.5 + 0.5, 0.0, 1.0);
    vec2 fluidVel = texture2D(uFluidVelocity, screenUV).xy;
    float depthAtten = 1.0 / (1.0 + max(-mv.z, 0.0) * 0.3);
    mv.xy += fluidVel * uFluidInfluence * 0.02 * depthAtten * anchorMotionMask;
  }
#endif

  float dist = length(mv.xyz);
  vCameraFade = uCamFadeEnabled > 0.5
    ? 1.0 - smoothstep(uCamFadeNear, max(uCamFadeFar, uCamFadeNear + 0.0001), dist)
    : 1.0;

  float baseSize = mix(0.6, 1.6, pow(aRandom.z, 4.0));
  float splatSize = mix(0.65, 1.35, vSplatSize);
  baseSize *= mix(1.0, splatSize, 0.3);
  float distSizeT = smoothstep(uDistanceSizeNear, uDistanceSizeFar, dist);
  float distSize = mix(1.0, uDistanceSizeMax, distSizeT);
  baseSize *= mix(1.0, distSize, uDistanceSizeInfluence);

  float opaqueSizeScale = mix(max(uOpacity, 0.0), 1.0, step(0.5, uTransparentPoints));
  float ps =
    uPointSize *
    max(uPointSizeScale, 0.001) *
    baseSize *
    opaqueSizeScale *
    max(uDensityFillPointSizeScale, 0.001) *
    uDPR *
    (120.0 / max(dist, 0.1));
  vProjectedPointSize = ps / uRenderScale;
  gl_PointSize = clamp(ps, 0.0, uMaxPointSize * uRenderScale);
  gl_Position = projectionMatrix * mv;
}
`;

/** Point cloud — fragment. Round points, warm caustic shimmer, then convert the
 *  point's colour to linear so the bloom + neutral-tonemap composer can operate. */
export const POINT_FRAG = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform float uLoadFade;
uniform float uDensityFillOpacityScale;
uniform float uTransparentPoints;
uniform float uCausticsEnabled;
uniform float uCausticsStrength;
uniform float uCausticsScale;
uniform float uCausticsPower;
uniform float uCausticsSparkle;
uniform vec3 uCausticsAxisScale;
uniform vec3 uCausticsSpeed;
uniform vec3 uCausticsColor;

varying vec3 vCloudColor;
varying vec3 vWorldPosition;
varying float vAnchorGlow;
varying float vProjectedPointSize;
varying float vCameraFade;
varying float vSparkleSeed;

const float MIN_PROJECTED_POINT_SIZE = 0.55;

#if POINTCLOUD_USE_CAUSTICS
float dotNoise(vec3 p) {
  const float PHI = 1.618033988;
  const mat3 GOLD = mat3(
    -0.571464913, 0.814921382, 0.096597072,
    -0.278044873, -0.303026659, 0.911518454,
    0.772087367, 0.494042493, 0.399753815);
  return dot(cos(GOLD * p), sin(PHI * p * GOLD));
}
float causticsPattern(vec3 worldPos) {
  float scale = max(uCausticsScale, 0.0001);
  vec3 p = worldPos * scale * max(uCausticsAxisScale, vec3(0.0001));
  vec3 drift = uTime * uCausticsSpeed;
  float n1 = dotNoise(p + drift);
  float n2 = dotNoise(p * 1.73 + vec3(-drift.y, drift.z, -drift.x));
  float n3 = dotNoise(p * 3.11 + vec3(drift.z, -drift.x, drift.y));
  float ridges = max(0.0, 1.0 - min(min(abs(n1), abs(n2)), abs(n3)) * 1.7);
  float crossings = max(0.0, 1.0 - abs(n1 + n2 * 0.55 - n3 * 0.35) * 1.15);
  return pow(clamp(ridges * 0.82 + crossings * 0.28, 0.0, 1.0), max(0.001, uCausticsPower));
}
vec3 applyCaustics(vec3 color, float r2) {
  if (uCausticsEnabled > 0.5) {
    float pointMask = 0.55 + 0.45 * smoothstep(0.25, 0.0, r2);
    float caustics = causticsPattern(vWorldPosition) * uCausticsStrength;
    color += uCausticsColor * caustics * pointMask;
    if (uCausticsSparkle > 0.0001) {
      float sparse = smoothstep(0.985, 1.0, vSparkleSeed);
      float twinkle = 0.5 + 0.5 * sin(uTime * mix(4.0, 11.0, vSparkleSeed) + vSparkleSeed * 37.699112);
      float pulse = smoothstep(0.72, 1.0, twinkle);
      pulse *= pulse * pulse;
      float center = smoothstep(0.18, 0.0, r2);
      float sparkle = uCausticsSparkle * sparse * pulse * center;
      color += mix(uCausticsColor, vec3(1.0), 0.82) * sparkle;
    }
  }
  return color;
}
#endif

void main() {
  float minPointSize = mix(0.01, MIN_PROJECTED_POINT_SIZE, step(0.5, uTransparentPoints));
  if (vProjectedPointSize < minPointSize) discard;
  vec2 uv = gl_PointCoord - 0.5;
  float r2 = dot(uv, uv);
  if (r2 > 0.25) discard;

  vec3 color = vCloudColor;
#if POINTCLOUD_USE_CAUSTICS
  color = applyCaustics(color, r2);
#endif
  float alpha = mix(1.0, uOpacity, step(0.5, uTransparentPoints)) * uDensityFillOpacityScale * vCameraFade * uLoadFade;
  // Output display-referred sRGB (with caustics) — the composite works in gamma space
  // and tone-maps at the end, matching the original engine's composite exactly.
  gl_FragColor = vec4(clamp(color, vec3(0.0), vec3(1.0)), alpha);
}
`;

// ---------------------------------------------------------------------------
// Fluid simulation (velocity field only — the point cloud samples the velocity to
// drift). A GPU stable-fluids solver: splat → curl → vorticity → divergence →
// pressure (Jacobi) → gradient-subtract → advect. Ported from the classic
// WebGL-Fluid-Simulation technique (Pavel Dobryakov, MIT).
// ---------------------------------------------------------------------------

export const FLUID_BASE_VERT = /* glsl */ `
precision highp float;
attribute vec2 position;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main() {
  vUv = position * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FLUID_SPLAT_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / max(radius, 1e-6)) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`;

export const FLUID_CURL_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`;

export const FLUID_VORTICITY_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}
`;

export const FLUID_DIVERGENCE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

export const FLUID_CLEAR_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main() {
  gl_FragColor = value * texture2D(uTexture, vUv);
}
`;

export const FLUID_PRESSURE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

export const FLUID_GRADIENT_SUBTRACT_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

export const FLUID_ADVECTION_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = dissipation * texture2D(uSource, coord);
  gl_FragColor.a = 1.0;
}
`;

// ---------------------------------------------------------------------------
// Final composite — the exact tail of the original engine's section composite,
// ported verbatim: overlay is already applied upstream (bloom), then a lower-biased
// vignette in gamma space, then tone mapping done as sRGB → linear → NeutralToneMapping
// → sRGB → LDR clamp. Runs as the last EffectComposer pass (renders to screen).
// ---------------------------------------------------------------------------

export const COMPOSITE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const COMPOSITE_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uVignetteAmount;
uniform float uVignetteRadius;
uniform float uVignetteSoftness;
uniform float uVignetteAspect;
varying vec2 vUv;

vec3 sRGBToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}
vec3 linearToSRGB(vec3 c) {
  c = max(c, vec3(0.0));
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
vec3 neutralToneMapping(vec3 color) {
  const float startCompression = 0.8 - 0.04;
  const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < startCompression) return color;
  float d = 1.0 - startCompression;
  float newPeak = 1.0 - d * d / (peak + d - startCompression);
  color *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
  return mix(color, vec3(newPeak), g);
}

void main() {
  vec3 color = texture2D(tDiffuse, vUv).rgb; // sRGB, bloom already overlaid upstream
  // Vignette (gamma space, lower-biased) — matches the engine's composite tail.
  vec2 centered = vUv - 0.5;
  centered.x *= uVignetteAspect;
  float softness = max(uVignetteSoftness, 0.0001);
  float edge = smoothstep(uVignetteRadius - softness, uVignetteRadius, length(centered));
  float shade = mix(1.0, 1.0 - clamp(uVignetteAmount, 0.0, 1.0), edge);
  shade = mix(1.0, shade, smoothstep(0.5, 1.0, vUv.y));
  color *= shade;
  // Tone map in linear space, then LDR clamp.
  vec3 lin = sRGBToLinear(color);
  lin = neutralToneMapping(lin);
  color = clamp(linearToSRGB(lin), 0.0, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Hero backdrop — the "heroforest" video light-volume. The soft misty forest behind the
// point cloud is a BOX RAYMARCH that samples the heroforest KTX2 (a sampler2DArray of 14
// depth slices) as coloured density, front-to-back, then an HSL shift desaturates/tints
// it to the forest tone. Rendered on the back faces of a box (ShaderMaterial injects
// position/matrices/cameraPosition), composited behind the cloud. GLSL3 (WebGL2).
// ---------------------------------------------------------------------------

export const VOLUME_VERT = /* glsl */ `
out vec3 vLocalPos;
out vec3 vCameraLocal;
out float vViewDist;
void main() {
  vLocalPos = position;
  vCameraLocal = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vViewDist = length(wp.xyz - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const VOLUME_FRAG = /* glsl */ `
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uVolume;
uniform float uOpacity;
uniform float uBrightness;
uniform float uThreshold;
uniform float uSoftness;
uniform float uEdgeFade;
uniform float uLoopCount;
uniform float uGridTimeOffset;
uniform float uGridOpacity;
uniform float uNearFade;
uniform float uRaymarchSteps;
uniform float uLayerCount;
uniform float uScrubOffset;
uniform vec3 uCenterFade;
uniform vec3 uHsl;
uniform float uTime;
uniform vec3 uNoiseScale;
uniform vec3 uNoiseMovement;
uniform float uNoiseStrength;
uniform float uLoadFade;
in vec3 vLocalPos;
in vec3 vCameraLocal;
in float vViewDist;
out vec4 outColor;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
vec3 applyHsl(vec3 col, vec3 hsl) {
  vec3 hsv = rgb2hsv(col);
  hsv.x = fract(hsv.x + hsl.x);
  hsv.y = clamp(hsv.y * (1.0 + hsl.y), 0.0, 1.0);
  hsv.z = clamp(hsv.z * (1.0 + hsl.z), 0.0, 2.0);
  return hsv2rgb(hsv);
}
float hashLattice(vec3 cell) {
  return fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}
float cnoise(vec3 v) {
  vec3 cell = floor(v);
  vec3 frac = fract(v);
  vec3 weight = frac * frac * (3.0 - 2.0 * frac);
  float c000 = hashLattice(cell + vec3(0.0, 0.0, 0.0));
  float c100 = hashLattice(cell + vec3(1.0, 0.0, 0.0));
  float c010 = hashLattice(cell + vec3(0.0, 1.0, 0.0));
  float c110 = hashLattice(cell + vec3(1.0, 1.0, 0.0));
  float c001 = hashLattice(cell + vec3(0.0, 0.0, 1.0));
  float c101 = hashLattice(cell + vec3(1.0, 0.0, 1.0));
  float c011 = hashLattice(cell + vec3(0.0, 1.0, 1.0));
  float c111 = hashLattice(cell + vec3(1.0, 1.0, 1.0));
  float x00 = mix(c000, c100, weight.x);
  float x10 = mix(c010, c110, weight.x);
  float x01 = mix(c001, c101, weight.x);
  float x11 = mix(c011, c111, weight.x);
  float y0 = mix(x00, x10, weight.y);
  float y1 = mix(x01, x11, weight.y);
  return mix(y0, y1, weight.z) * 2.0 - 1.0;
}
vec3 animatedUvOffset(vec3 p) {
  if (abs(uNoiseStrength) <= 0.000001) return vec3(0.0);
  vec3 noisePos = p * uNoiseScale + uTime * uNoiseMovement;
  return vec3(
    cnoise(noisePos),
    cnoise(noisePos + vec3(19.19, 7.31, 3.77)),
    cnoise(noisePos + vec3(5.13, 23.17, 11.71))
  ) * uNoiseStrength;
}
vec4 sampleVolume(sampler2DArray tex, vec3 uvw) {
  float layerCount = max(1.0, uLayerCount);
  float layerPos = clamp(uvw.z, 0.0, 0.999999) * max(0.0, layerCount - 1.0);
  float layer0 = floor(layerPos);
  float layer1 = min(layer0 + 1.0, layerCount - 1.0);
  float mixLayer = fract(layerPos);
  return mix(
    texture(tex, vec3(uvw.xy, layer0)),
    texture(tex, vec3(uvw.xy, layer1)),
    mixLayer
  );
}
vec2 hitBox(vec3 orig, vec3 dir) {
  vec3 boxMin = vec3(-0.5);
  vec3 boxMax = vec3(0.5);
  vec3 invDir = 1.0 / dir;
  vec3 tMinTmp = (boxMin - orig) * invDir;
  vec3 tMaxTmp = (boxMax - orig) * invDir;
  vec3 tMin = min(tMinTmp, tMaxTmp);
  vec3 tMax = max(tMinTmp, tMaxTmp);
  float t0 = max(max(tMin.x, tMin.y), tMin.z);
  float t1 = min(min(tMax.x, tMax.y), tMax.z);
  return vec2(t0, t1);
}

void main() {
  vec3 rayDir = normalize(vLocalPos - vCameraLocal);
  vec2 bounds = hitBox(vCameraLocal, rayDir);
  if (bounds.x > bounds.y) discard;
  bounds.x = max(bounds.x, 0.0);
  float steps = clamp(uRaymarchSteps, 8.0, 128.0);
  float dt = (bounds.y - bounds.x) / steps;
  float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  vec3 noiseSamplePos = vCameraLocal + rayDir * mix(bounds.x, bounds.y, 0.5);
  vec3 uvOffset = animatedUvOffset(noiseSamplePos + 0.5);
  vec3 accum = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= steps) break;
    float t = bounds.x + (float(i) + jitter) * dt;
    vec3 p = vCameraLocal + rayDir * t;
    float rayDepth01 = clamp((t - bounds.x) / max(bounds.y - bounds.x, 0.0001), 0.0, 1.0);
    vec3 rawUvw = p + 0.5 + uvOffset;
    float sideDistance = min(min(rawUvw.x, 1.0 - rawUvw.x), min(rawUvw.y, 1.0 - rawUvw.y));
    float edgeFade = max(uEdgeFade, 0.0);
    float sideMask = edgeFade > 0.0001 ? smoothstep(0.0, edgeFade, sideDistance) : 1.0;
    float sideFeatherDepth = 1.0 - smoothstep(0.25, 0.85, rayDepth01);
    float sideFeather = mix(1.0, sideMask, sideFeatherDepth);
    vec3 uvw = clamp(rawUvw, vec3(0.001), vec3(0.999));
    float z = fract(uvw.z * max(0.0, uLoopCount) + uScrubOffset + uGridTimeOffset);
    vec4 tex = sampleVolume(uVolume, vec3(uvw.x, 1.0 - uvw.y, z));
    float centerFade = smoothstep(uCenterFade.x, uCenterFade.y, abs(uvw.z - 0.5));
    centerFade = mix(1.0, centerFade, clamp(uCenterFade.z, 0.0, 1.0));
    float luma = max(max(tex.r, tex.g), tex.b);
    float density = smoothstep(uThreshold, uThreshold + max(0.0001, uSoftness), luma) * tex.a * centerFade * uOpacity * sideFeather * uGridOpacity;
    float a = density / steps;
    accum += applyHsl(tex.rgb, uHsl) * uBrightness * a * (1.0 - alpha);
    alpha += a * (1.0 - alpha);
    if (alpha > 0.96) break;
  }
  float nearFade = smoothstep(0.0, max(0.0001, uNearFade), vViewDist);
  outColor = vec4(accum * nearFade, alpha * nearFade) * uLoadFade;
}
`;
