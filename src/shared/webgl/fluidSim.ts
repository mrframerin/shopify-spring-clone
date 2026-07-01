import * as THREE from "three";
import {
  FLUID_BASE_VERT,
  FLUID_SPLAT_FRAG,
  FLUID_CURL_FRAG,
  FLUID_VORTICITY_FRAG,
  FLUID_DIVERGENCE_FRAG,
  FLUID_CLEAR_FRAG,
  FLUID_PRESSURE_FRAG,
  FLUID_GRADIENT_SUBTRACT_FRAG,
  FLUID_ADVECTION_FRAG,
} from "./shaders";

interface DoubleTarget {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap(): void;
}

function makeTarget(size: number, filter: THREE.MagnificationTextureFilter): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: filter,
    magFilter: filter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

function makeDouble(size: number, filter: THREE.MagnificationTextureFilter): DoubleTarget {
  const a = makeTarget(size, filter);
  const b = makeTarget(size, filter);
  return {
    read: a,
    write: b,
    swap() {
      const t = this.read;
      this.read = this.write;
      this.write = t;
    },
  };
}

/**
 * GPU stable-fluids velocity solver. The hero point cloud samples this field to drift;
 * cursor motion injects velocity via `splat`. Runs the classic advect → curl →
 * vorticity → divergence → pressure(Jacobi) → gradient-subtract loop on ping-pong
 * float render targets. Dye/visual passes are omitted — only the velocity field is
 * needed to displace the points.
 */
export class FluidSimulation {
  private renderer: THREE.WebGLRenderer;
  private texelSize: THREE.Vector2;

  private velocity: DoubleTarget;
  private pressure: DoubleTarget;
  private divergence: THREE.WebGLRenderTarget;
  private curl: THREE.WebGLRenderTarget;

  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;

  private materials: {
    splat: THREE.RawShaderMaterial;
    curl: THREE.RawShaderMaterial;
    vorticity: THREE.RawShaderMaterial;
    divergence: THREE.RawShaderMaterial;
    clear: THREE.RawShaderMaterial;
    pressure: THREE.RawShaderMaterial;
    gradientSubtract: THREE.RawShaderMaterial;
    advection: THREE.RawShaderMaterial;
  };

  // Tuning (the reference scene's production values).
  curlStrength = 6.556962025316462;
  velocityDissipation = 0.96;
  pressureDissipation = 0.8;
  pressureIterations = 10;

  constructor(renderer: THREE.WebGLRenderer, simSize = 128) {
    this.renderer = renderer;
    this.texelSize = new THREE.Vector2(1 / simSize, 1 / simSize);

    this.velocity = makeDouble(simSize, THREE.LinearFilter);
    this.pressure = makeDouble(simSize, THREE.NearestFilter);
    this.divergence = makeTarget(simSize, THREE.NearestFilter);
    this.curl = makeTarget(simSize, THREE.NearestFilter);

    // Fullscreen clip-space quad (the vertex shader uses `position` directly).
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2),
    );
    geometry.setIndex([0, 1, 2, 0, 2, 3]);

    const mk = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.RawShaderMaterial({
        vertexShader: FLUID_BASE_VERT,
        fragmentShader,
        uniforms: { texelSize: { value: this.texelSize }, ...uniforms },
        depthTest: false,
        depthWrite: false,
      });

    this.materials = {
      splat: mk(FLUID_SPLAT_FRAG, {
        uTarget: { value: null },
        aspectRatio: { value: 1 },
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
        radius: { value: 0.0002 },
      }),
      curl: mk(FLUID_CURL_FRAG, { uVelocity: { value: null } }),
      vorticity: mk(FLUID_VORTICITY_FRAG, {
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: this.curlStrength },
        dt: { value: 0 },
      }),
      divergence: mk(FLUID_DIVERGENCE_FRAG, { uVelocity: { value: null } }),
      clear: mk(FLUID_CLEAR_FRAG, { uTexture: { value: null }, value: { value: this.pressureDissipation } }),
      pressure: mk(FLUID_PRESSURE_FRAG, { uPressure: { value: null }, uDivergence: { value: null } }),
      gradientSubtract: mk(FLUID_GRADIENT_SUBTRACT_FRAG, {
        uPressure: { value: null },
        uVelocity: { value: null },
      }),
      advection: mk(FLUID_ADVECTION_FRAG, {
        uVelocity: { value: null },
        uSource: { value: null },
        dt: { value: 0 },
        dissipation: { value: this.velocityDissipation },
      }),
    };

    this.quad = new THREE.Mesh(geometry, this.materials.splat);
    // The quad's positions are vec2, so Three.js can't compute a valid bounding
    // sphere (z is undefined → NaN); the vertex shader positions it directly, so
    // just skip culling for it.
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  private blit(material: THREE.RawShaderMaterial, target: THREE.WebGLRenderTarget | null) {
    this.quad.material = material;
    const prev = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(prev);
  }

  /** Inject velocity at a normalized point (0..1). `delta` is the cursor motion.
   *  `radius` is the pass's internal squared-radius; the reference uses
   *  (splatRadius 0.5 * 50 / 200)² = 0.015625. */
  splat(point: THREE.Vector2, delta: THREE.Vector2, aspectRatio: number, radius = 0.015625) {
    const m = this.materials.splat;
    m.uniforms.uTarget.value = this.velocity.read.texture;
    m.uniforms.aspectRatio.value = aspectRatio;
    m.uniforms.point.value = point;
    m.uniforms.radius.value = radius;
    (m.uniforms.color.value as THREE.Vector3).set(delta.x, delta.y, 0);
    this.blit(m, this.velocity.write);
    this.velocity.swap();
  }

  step(dt: number) {
    const m = this.materials;

    // Curl of the velocity field.
    m.curl.uniforms.uVelocity.value = this.velocity.read.texture;
    this.blit(m.curl, this.curl);

    // Vorticity confinement — reinject small-scale swirl.
    m.vorticity.uniforms.uVelocity.value = this.velocity.read.texture;
    m.vorticity.uniforms.uCurl.value = this.curl.texture;
    m.vorticity.uniforms.curl.value = this.curlStrength;
    m.vorticity.uniforms.dt.value = dt;
    this.blit(m.vorticity, this.velocity.write);
    this.velocity.swap();

    // Divergence.
    m.divergence.uniforms.uVelocity.value = this.velocity.read.texture;
    this.blit(m.divergence, this.divergence);

    // Decay pressure, then solve ∇²p = divergence via Jacobi iterations.
    m.clear.uniforms.uTexture.value = this.pressure.read.texture;
    m.clear.uniforms.value.value = this.pressureDissipation;
    this.blit(m.clear, this.pressure.write);
    this.pressure.swap();

    m.pressure.uniforms.uDivergence.value = this.divergence.texture;
    for (let i = 0; i < this.pressureIterations; i++) {
      m.pressure.uniforms.uPressure.value = this.pressure.read.texture;
      this.blit(m.pressure, this.pressure.write);
      this.pressure.swap();
    }

    // Subtract the pressure gradient to make the field divergence-free.
    m.gradientSubtract.uniforms.uPressure.value = this.pressure.read.texture;
    m.gradientSubtract.uniforms.uVelocity.value = this.velocity.read.texture;
    this.blit(m.gradientSubtract, this.velocity.write);
    this.velocity.swap();

    // Self-advect the velocity, dissipating over time.
    m.advection.uniforms.uVelocity.value = this.velocity.read.texture;
    m.advection.uniforms.uSource.value = this.velocity.read.texture;
    m.advection.uniforms.dt.value = dt;
    m.advection.uniforms.dissipation.value = this.velocityDissipation;
    this.blit(m.advection, this.velocity.write);
    this.velocity.swap();
  }

  get velocityTexture(): THREE.Texture {
    return this.velocity.read.texture;
  }

  dispose() {
    this.velocity.read.dispose();
    this.velocity.write.dispose();
    this.pressure.read.dispose();
    this.pressure.write.dispose();
    this.divergence.dispose();
    this.curl.dispose();
    this.quad.geometry.dispose();
    Object.values(this.materials).forEach((m) => m.dispose());
  }
}
